/**
 * Next-activity classifier — the input to the headline thesis (README §5, source 03).
 *
 * Turns the next calendar event into one of the activities the transition framework knows
 * how to prime for, plus how long until it starts (which doses the arc) and a confidence the
 * pipeline uses to decide whether to trust the activity goal or fall back to current-state.
 *
 * Pure keyword/regex + time-of-day priors — defensive by design: anything unrecognised is
 * `none` with low confidence, and the caller then behaves exactly as today.
 */

const ACTIVITIES = ['workout', 'focus', 'sleep', 'wake', 'social', 'commute', 'recovery', 'none'];

// Ordered most-specific → least; first hit wins.
const KEYWORD_RULES = [
  { activity: 'workout', re: /\b(gym|workout|work ?out|run|running|lift|lifting|crossfit|spin|cycle|cycling|hiit|training|cardio|yoga flow|exercise)\b/i },
  { activity: 'sleep', re: /\b(sleep|bed|bedtime|nap|lights out|wind[ -]?down|good ?night)\b/i },
  { activity: 'focus', re: /\b(focus|deep work|heads?-?down|coding|code|write|writing|study|studying|review|design work|essay|thesis|exam prep)\b/i },
  { activity: 'social', re: /\b(meeting|standup|stand-up|1:1|one on one|sync|call|presentation|pitch|interview|demo|review meeting|catch ?up|lunch with|dinner with|party|date|drinks)\b/i },
  { activity: 'commute', re: /\b(commute|drive|driving|train|bus|transit|travel to|head to|flight|airport|on the road)\b/i },
  { activity: 'recovery', re: /\b(break|recovery|recover|rest|relax|decompress|stretch|cool ?down|meditat|breathe)\b/i },
];

/** Compute whole minutes until an event start (Date or ISO string). null when unknown. */
function minutesUntilStart(start) {
  if (!start) return null;
  const t = start instanceof Date ? start.getTime() : Date.parse(start);
  if (Number.isNaN(t)) return null;
  return Math.round((t - Date.now()) / 60000);
}

/**
 * @param {{summary?:string, start?:Date|string, startISO?:string, minutesUntil?:number, allDay?:boolean}|null} nextEvent
 * @param {string} [timeOfDay] engine vocabulary ("Early morning", "Night", …)
 * @returns {{activity:string, minutesUntil:number|null, confidence:number, label:string}}
 */
export function classifyNextActivity(nextEvent, timeOfDay = '') {
  const summary = nextEvent?.summary || '';
  const minutesUntil =
    nextEvent?.minutesUntil != null
      ? nextEvent.minutesUntil
      : minutesUntilStart(nextEvent?.start || nextEvent?.startISO);

  // 1. Keyword match on the event title — the strongest signal.
  for (const { activity, re } of KEYWORD_RULES) {
    if (re.test(summary)) {
      return { activity, minutesUntil, confidence: 0.85, label: summary || activity };
    }
  }

  // 2. Time-of-day priors when the title is unhelpful but a timed event exists.
  const t = String(timeOfDay).toLowerCase();
  if (/early morning|dawn|waking/.test(t)) {
    return { activity: 'wake', minutesUntil, confidence: summary ? 0.5 : 0.4, label: summary || 'morning' };
  }
  if (/night/.test(t)) {
    return { activity: 'sleep', minutesUntil, confidence: 0.45, label: summary || 'late night' };
  }

  // 3. A named-but-unclassified event still means "something is coming" — weak social lean.
  if (summary && !nextEvent?.allDay) {
    return { activity: 'social', minutesUntil, confidence: 0.3, label: summary };
  }

  // 4. Nothing actionable → behave exactly like the current-state engine.
  return { activity: 'none', minutesUntil, confidence: 0, label: 'no plans' };
}

export const isKnownActivity = (a) => ACTIVITIES.includes(a);
