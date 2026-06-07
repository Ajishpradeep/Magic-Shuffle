/**
 * Deterministic context -> user state. This is the explainable baseline; the AI
 * interpretation layer (src/ai.js) can enrich the narrative, but never needs to
 * run for the app to work.
 */
export function deriveState(ctx) {
  const energy = ctx.energyLevel ?? 50;
  const sleep = ctx.sleepQuality ?? 50;
  const stress = ctx.stressLevel ?? 50;

  // --- energy need ---
  let energyNeed = 'medium';
  if (ctx.activity === 'workout' || energy >= 80) energyNeed = 'high';
  else if (ctx.activity === 'wind_down' || energy <= 35) energyNeed = 'low';
  if (energy >= 80 && stress >= 60) energyNeed = 'controlled_high';

  // --- mood state ---
  let moodState = 'neutral';
  if (stress >= 65) moodState = 'stressed';
  else if (sleep < 50 && energy < 50) moodState = 'low_motivation';
  else if (ctx.rainChance >= 50 || /night|evening/i.test(ctx.timeOfDay || '')) {
    moodState = 'reflective';
  } else if (energy >= 75 && stress <= 40) moodState = 'confident';

  // --- body state ---
  let bodyState = 'steady';
  if (ctx.activity === 'waking') bodyState = 'warming_up';
  else if (ctx.activity === 'workout') bodyState = 'pushing';
  else if (ctx.activity === 'wind_down') bodyState = 'recovering';
  else if (sleep < 40) bodyState = 'fatiguing';

  // --- novelty appetite --- (reduce novelty under stress / high effort)
  let noveltyAppetite = 'balanced';
  if (stress >= 65 || ctx.activity === 'workout') noveltyAppetite = 'safe';
  else if (stress <= 35 && energy <= 60) noveltyAppetite = 'explore';

  // --- vocal tolerance ---
  let vocalTolerance = 'lyrics_ok';
  if (ctx.activity === 'focus') vocalTolerance = 'instrumental_preferred';
  else if (ctx.activity === 'workout') vocalTolerance = 'anthemic_vocals';
  else if (stress >= 70) vocalTolerance = 'avoid_dense_lyrics';

  // --- context risk --- (night, transit, bad weather favor less chaotic music)
  const contextRisk =
    /night/i.test(ctx.timeOfDay || '') ||
    ctx.activity === 'commute' ||
    ctx.rainChance >= 70
      ? 'elevated'
      : 'normal';

  // Which raw signals meaningfully shaped this read (>=3 needed for acceptance).
  const signalsReferenced = [];
  if (energy >= 70 || energy <= 35) signalsReferenced.push('energy');
  if (sleep < 50) signalsReferenced.push('sleep');
  if (stress >= 60) signalsReferenced.push('stress');
  if (ctx.rainChance >= 50 || /rain|gloom/i.test(ctx.weather || '')) signalsReferenced.push('weather');
  if (ctx.schedule) signalsReferenced.push('schedule');
  if (ctx.timeOfDay) signalsReferenced.push('timeOfDay');

  const summary = buildSummary(ctx, { moodState, energyNeed });

  return {
    energyNeed,
    moodState,
    bodyState,
    noveltyAppetite,
    vocalTolerance,
    contextRisk,
    signalsReferenced: [...new Set(signalsReferenced)],
    summary,
  };
}

function buildSummary(ctx, { moodState, energyNeed }) {
  const bits = [];
  if (/rain|gloom/i.test(ctx.weather || '') || ctx.rainChance >= 50) bits.push('grey skies');
  if (ctx.sleepQuality < 50) bits.push('short on sleep');
  if (ctx.energyLevel >= 70) bits.push('good physical energy');
  if (ctx.stressLevel >= 60) bits.push('some pressure');
  if (ctx.schedule) bits.push(`with ${ctx.schedule.toLowerCase()} ahead`);
  const need =
    energyNeed === 'high' || energyNeed === 'controlled_high'
      ? 'wants momentum'
      : energyNeed === 'low'
        ? 'wants to settle'
        : 'wants a steady lift';
  return `${cap(bits.join(', ') || 'a calm moment')} — ${need}.`;
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
