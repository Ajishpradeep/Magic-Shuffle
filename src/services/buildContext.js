/**
 * Assemble a LIVE listener moment from real signals, ready for the engine.
 *
 *   biometrics (mock generator)  +  weather (Open-Meteo, real)
 * + calendar  (Google, real → mock fallback)  +  time of day (system clock)
 * + location  (IP-detected)
 *
 * Returns the same context shape the recommendation engine already consumes, PLUS the
 * structured `nextEvent` + classified `nextActivity` that drive the next-activity targeting
 * (README §5). The legacy `calendar` string is kept for back-compat and the DJ line.
 */
import { getBiometrics, biometricProvider } from '../integrations/biometrics.js';
import { getWeather } from '../integrations/weather.js';
import { resolveLocation } from '../integrations/geolocation.js';
import { getUpcomingEvents, calendarConfigured } from '../integrations/googleCalendar.js';
import { classifyNextActivity } from '../lib/activityClassifier.js';

/** Map the current hour to the engine's timeOfDay vocabulary. */
export function currentTimeOfDay(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return 'Night';
  if (h < 9) return 'Early morning';
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 21) return 'Evening';
  return 'Night';
}

/** One-line "Pitch practice at 10:00 AM" from a structured event. */
function eventLine(e) {
  if (!e) return null;
  if (e.allDay || !e.start) return e.summary;
  const time = e.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${e.summary} at ${time}`;
}

/** Mock next-event when no real calendar is connected — keeps next-activity targeting alive. */
function mockNextEvent(timeOfDay) {
  const t = timeOfDay.toLowerCase();
  if (t.includes('early morning')) return { summary: 'Morning focus block', allDay: false, mock: true };
  if (t.includes('morning')) return { summary: 'Deep work session', allDay: false, mock: true };
  if (t.includes('afternoon')) return { summary: 'Team meeting', allDay: false, mock: true };
  if (t.includes('evening')) return { summary: 'Evening wind-down', allDay: false, mock: true };
  return { summary: 'Bedtime soon', allDay: false, mock: true };
}

/** Structured nextEvent (with minutesUntil) for the engine + UI. */
function toNextEvent(e) {
  if (!e) return null;
  const minutesUntil = e.start instanceof Date ? Math.round((e.start.getTime() - Date.now()) / 60000) : null;
  return {
    summary: e.summary,
    startISO: e.start instanceof Date ? e.start.toISOString() : null,
    minutesUntil,
    allDay: Boolean(e.allDay),
  };
}

/**
 * @param {object} [opts]
 * @param {string} [opts.userName='You']
 * @param {object} [opts.biometricOpts] forwarded to the generator (seed, age…)
 * @returns {Promise<{context:object, sources:object}>}
 */
export async function assembleLiveContext(opts = {}) {
  const { userName = 'You', biometricOpts = {} } = opts;
  const timeOfDay = currentTimeOfDay();

  // Fetch the independent signals in parallel.
  const [location, bio, events] = await Promise.all([
    resolveLocation(),
    getBiometrics({ timeOfDay, ...biometricOpts }),
    getUpcomingEvents({ max: 1 }),
  ]);
  const weather = await getWeather(location);

  const realEvent = events[0] || null;
  const event = realEvent || mockNextEvent(timeOfDay);
  const nextEvent = toNextEvent(event);
  const calendar = eventLine(event);
  const calendarSource = realEvent ? 'google' : calendarConfigured() ? 'mock_not_connected' : 'mock_unconfigured';

  const cls = classifyNextActivity(nextEvent, timeOfDay);

  const context = {
    // identity / when / where
    userName,
    timeOfDay,
    location: location.city,
    activity: cls.activity !== 'none' ? cls.activity : inferActivity(timeOfDay, bio),
    // biometrics (0–100 + raw vitals)
    energyLevel: bio.energyLevel,
    sleepQuality: bio.sleepQuality,
    stressLevel: bio.stressLevel,
    hrv: bio.hrv,
    restingHr: bio.restingHr,
    respiratoryRate: bio.respiratoryRate,
    skinTempDev: bio.skinTempDev,
    steps: bio.steps,
    recovery: bio.recovery,
    // weather
    weather: weather.weather,
    rainChance: weather.rainChance,
    tempC: weather.tempC,
    // calendar — string (back-compat) + structured next-activity (new)
    calendar,
    nextEvent,
    nextActivity: cls.activity,
    activityConfidence: cls.confidence,
  };

  return {
    context,
    sources: {
      biometrics: biometricProvider(),
      weather: weather.source,
      calendar: calendarSource,
      location: location.source,
    },
  };
}

/** Fallback activity from time + biometrics when the calendar says nothing useful. */
function inferActivity(timeOfDay, bio) {
  if (/night/i.test(timeOfDay)) return 'wind_down';
  if (/early morning/i.test(timeOfDay)) return 'waking';
  if (bio.steps >= 12000) return 'workout';
  return 'general';
}
