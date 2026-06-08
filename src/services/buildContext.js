/**
 * Assemble a LIVE listener moment from real signals, ready for the engine.
 *
 *   biometrics (mock generator)  +  weather (Open-Meteo, real)
 * + calendar  (Google, real → mock fallback)  +  time of day (system clock)
 * + location  (IP-detected)
 *
 * Returns the same context shape the recommendation engine already consumes, so
 * deriveListenerState / scoring / the AI planner all work unchanged.
 */
import { getBiometrics, biometricProvider } from '../integrations/biometrics.js';
import { getWeather } from '../integrations/weather.js';
import { resolveLocation } from '../integrations/geolocation.js';
import { getCalendarSummary, calendarConfigured } from '../integrations/googleCalendar.js';

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

/** Best-effort activity inference from time + biometrics (purely for context flavor). */
function inferActivity(timeOfDay, bio) {
  if (/night/i.test(timeOfDay)) return 'wind_down';
  if (/early morning/i.test(timeOfDay)) return 'waking';
  if (bio.steps >= 12000) return 'workout';
  return 'general';
}

/** Pick a plausible mock calendar line when no real calendar is connected. */
function mockCalendarLine(timeOfDay) {
  const t = timeOfDay.toLowerCase();
  if (t.includes('early morning')) return 'Day ahead — first block at 10:00 AM';
  if (t.includes('morning')) return 'Focus block this morning';
  if (t.includes('afternoon')) return 'Meetings this afternoon';
  if (t.includes('evening')) return 'Evening — winding down';
  return 'No plans — open evening';
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
  const [location, bio, calSummary] = await Promise.all([
    resolveLocation(),
    getBiometrics({ timeOfDay, ...biometricOpts }),
    getCalendarSummary(),
  ]);
  const weather = await getWeather(location);

  const calendar = calSummary || mockCalendarLine(timeOfDay);
  const calendarSource = calSummary ? 'google' : calendarConfigured() ? 'mock_not_connected' : 'mock_unconfigured';

  const context = {
    // identity / when / where
    userName,
    timeOfDay,
    location: location.city,
    activity: inferActivity(timeOfDay, bio),
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
    // calendar
    calendar,
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
