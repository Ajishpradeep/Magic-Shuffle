/**
 * Research-grade engine tests (P1–P5 of the integration plan + safety).
 * These run without any API keys — they exercise the pure model + deterministic path.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

process.env.OPENAI_API_KEY = '';
process.env.SPOTIFY_CLIENT_ID = '';
process.env.SPOTIFY_CLIENT_SECRET = '';

const { toAffect, selectGoal, targetArc } = await import('../src/lib/affect.js');
const { classifyNextActivity } = await import('../src/lib/activityClassifier.js');
const { doseLength, buildArc } = await import('../src/lib/isoPlaylist.js');
const { capMatch } = await import('../src/lib/safety.js');
const { circadianBaseline, weatherStrategy } = await import('../src/lib/circadian.js');
const { recommend } = await import('../src/services/recommend.js');

// ---------------------------------------------------------------- Phase 1 -----

test('P1: wired-but-tired and flat-but-relaxed are DIFFERENT affect vectors', () => {
  // Wired but tired: high stress + physiological strain, but low physical energy.
  const wiredTired = toAffect(
    { energyLevel: 30, sleepQuality: 30, stressLevel: 90, hrv: 18, restingHr: 82, respiratoryRate: 20 },
    'Afternoon'
  );
  // Flat but relaxed: low energy, but low stress and calm physiology.
  const flatRelaxed = toAffect(
    { energyLevel: 30, sleepQuality: 70, stressLevel: 15, hrv: 60, restingHr: 55, respiratoryRate: 13 },
    'Afternoon'
  );

  assert.ok(wiredTired.tension > flatRelaxed.tension + 0.3, 'wired state should have much higher tension');
  assert.ok(Math.abs(wiredTired.energy - flatRelaxed.energy) < 0.2, 'energy can be similar while tension differs');
  // The single-axis model would have collapsed these; the two-axis model must not.
  assert.notDeepEqual(
    { e: wiredTired.energy, t: wiredTired.tension },
    { e: flatRelaxed.energy, t: flatRelaxed.tension }
  );
});

// ---------------------------------------------------------------- Phase 2 -----

test('P2: a balanced listener is targeted by what is NEXT, not just now', () => {
  const affect = toAffect({ energyLevel: 55, sleepQuality: 70, stressLevel: 30 }, 'Afternoon');

  const beforeWorkout = selectGoal(affect, { nextActivity: 'workout', confidence: 0.85 });
  const beforeSleep = selectGoal(affect, { nextActivity: 'sleep', confidence: 0.85 });
  const nothing = selectGoal(affect, { nextActivity: 'none', confidence: 0 });

  assert.equal(beforeWorkout.goal, 'energize');
  assert.equal(beforeWorkout.source, 'activity');
  assert.equal(beforeSleep.goal, 'wind_down');
  assert.equal(nothing.source, 'current_state'); // falls back to current-state when nothing scheduled
});

test('P2: workout target ascends, sleep target descends (arc direction)', () => {
  const affect = toAffect({ energyLevel: 50, sleepQuality: 60, stressLevel: 40 }, 'Afternoon');
  const workout = targetArc(affect, { nextActivity: 'workout', confidence: 0.85 });
  const sleep = targetArc(affect, { nextActivity: 'sleep', confidence: 0.85 });

  assert.equal(workout.arcDirection, 'ascending');
  assert.ok(workout.target.tempoBpm > workout.start.tempoBpm, 'workout ramps tempo up');
  assert.equal(sleep.arcDirection, 'descending');
  assert.ok(sleep.target.tempoBpm < sleep.start.tempoBpm, 'sleep decelerates');
});

test('P2: classifier maps event titles + low confidence falls back', () => {
  assert.equal(classifyNextActivity({ summary: 'Morning gym session' }).activity, 'workout');
  assert.equal(classifyNextActivity({ summary: 'Deep work: refactor' }).activity, 'focus');
  assert.equal(classifyNextActivity({ summary: 'Standup with team' }).activity, 'social');
  assert.equal(classifyNextActivity({ summary: 'Bedtime' }).activity, 'sleep');
  assert.equal(classifyNextActivity(null).activity, 'none');
  assert.ok(classifyNextActivity(null).confidence < 0.5);
});

// ---------------------------------------------------------------- Phase 3 -----

test('P3: circadian gives evening a lower baseline than late-morning', () => {
  assert.ok(circadianBaseline('Morning').energy > circadianBaseline('Night').energy);
  assert.equal(circadianBaseline('Night').alerting < 0, true); // ramping down toward sleep
});

test('P3: grey weather compensates (lifts), circadian outranks weather at night', () => {
  const grey = weatherStrategy('Gloomy, rain likely', 70, 18);
  assert.equal(grey.strategy, 'compensate');
  assert.ok(grey.valenceBias > 0);

  // A rainy evening still winds down — the goal stays wind_down despite the weather lift.
  const affect = toAffect({ energyLevel: 30, sleepQuality: 60, stressLevel: 45 }, 'Night');
  const arc = targetArc(affect, { timeOfDay: 'Night', nextActivity: 'sleep', confidence: 0.85, weather: 'rain', rainChance: 80 });
  assert.equal(arc.goal, 'wind_down');
  assert.ok(arc.target.tempoBpm <= 75, 'wind-down tempo target stays low regardless of weather');
});

// ---------------------------------------------------------------- Phase 5 -----

test('P5: arc length is dosed to the time until the event', () => {
  const soon = doseLength(10, 8, 12); // workout in 10 min, short primer
  const bedtime = doseLength(40, 36, 12); // sleep in 40 min, long arc
  const untimed = doseLength(null, 42, 12);

  assert.ok(soon.tracks < bedtime.tracks, 'a near-term primer is shorter than a long wind-down');
  assert.equal(untimed.tracks, 12, 'no timed event → default length');
  assert.ok(soon.tracks >= 4 && bedtime.tracks <= 20, 'always within the API bounds');
});

// ---------------------------------------------------------------- Safety ------

test('safety: capMatch never parks a low-valence user in sad music', () => {
  const arc = capMatch({ start: { valence: 0.05, energy: 0.4, tempoBpm: 90 }, target: { valence: 0.6, energy: 0.3, tempoBpm: 70 } });
  assert.ok(arc.start.valence >= 0.3, 'start valence is floored');
  assert.ok(arc.target.valence >= arc.start.valence, 'arc always moves toward higher valence');
});

test('safety: block list removes a track on the deterministic path', async () => {
  const { getContext } = await import('../src/data/contexts.js');
  const ctx = getContext('deep_focus_block');
  const baseline = await recommend(ctx);
  const blockedTitle = baseline.recommendation.title;
  const after = await recommend(ctx, { block: [blockedTitle] });
  assert.ok(
    after.playlist.every((t) => t.title.toLowerCase() !== blockedTitle.toLowerCase()),
    'blocked title is absent from the playlist'
  );
});

// ---------------------------------------------------- back-compat contract -----

test('response keeps the documented contract + adds the new fields', async () => {
  const { getContext } = await import('../src/data/contexts.js');
  const r = await recommend(getContext('pitch_practice_taipei'));

  // back-compat
  assert.ok(r.recommendation && r.recommendation.id);
  assert.ok(Array.isArray(r.backups));
  assert.ok(r.arc.start && r.arc.target);
  assert.ok(r.targetProfile);
  assert.equal(typeof r.goal, 'string');

  // additive new fields
  assert.equal(typeof r.nextActivity, 'string');
  assert.ok(r.strategy && typeof r.strategy.kind === 'string');
  assert.ok(r.dose && typeof r.dose.tracks === 'number');
  assert.ok(r.safety && typeof r.safety.volumeNotice === 'string');
  assert.ok(['valence', 'energy', 'tension'].every((k) => k in r.state.affect));
});
