/**
 * Deterministic, explainable track scorer. Implements the V1 weighted formula:
 *
 *   score = missionFit*0.35 + energyFit*0.20 + moodFit*0.15
 *         + contextFit*0.15 + userFeedbackFit*0.10 + noveltyFit*0.05 - penalties
 *
 * Every component is 0..1 and returned in the breakdown so the UI / team can see
 * exactly why a track was chosen.
 */
const WEIGHTS = {
  missionFit: 0.35,
  energyFit: 0.2,
  moodFit: 0.15,
  contextFit: 0.15,
  userFeedbackFit: 0.1,
  noveltyFit: 0.05,
};

const near = (a, b, span) => 1 - Math.min(Math.abs(a - b) / span, 1);

export function scoreTrack(track, opts) {
  const { mission, targets, ctx, derived, action, exclude = [], lastArtist } = opts;

  // --- missionFit ---
  let missionFit;
  if (track.missions.includes(mission)) {
    missionFit = 1;
  } else {
    // partial credit by how close the sound profile sits to the mission target
    missionFit =
      0.5 *
      ((near(track.energy, targets.energy, 4) +
        near(track.valence, targets.valence, 4) +
        near(track.bpm, targets.bpm, 60)) /
        3);
  }

  // --- energyFit ---
  const energyFit = near(track.energy, targets.energy, 4);

  // --- moodFit --- valence closeness, with mood-state guards
  let moodFit = near(track.valence, targets.valence, 4);
  if (derived.moodState === 'stressed' && track.intensity >= 4) moodFit *= 0.5;
  if (derived.moodState === 'low_motivation' && track.valence >= 4) moodFit = Math.min(1, moodFit + 0.15);
  if (derived.moodState === 'reflective' && track.tags.includes('warm')) moodFit = Math.min(1, moodFit + 0.1);

  // --- contextFit --- tag matches against the environment
  const wanted = new Set();
  if (ctx.rainChance >= 50 || /rain|gloom/i.test(ctx.weather || '')) wanted.add('rainy');
  if (derived.contextRisk === 'elevated') wanted.add('night-safe');
  if (ctx.activity === 'focus') wanted.add('focus');
  if (ctx.activity === 'workout') { wanted.add('sprint'); wanted.add('anthemic'); }
  if (ctx.activity === 'commute') wanted.add('urban-run');
  if (ctx.activity === 'wind_down') wanted.add('recovery');
  if (ctx.activity === 'waking') wanted.add('warmup');
  const hits = track.tags.filter((tag) => wanted.has(tag)).length;
  const contextFit = wanted.size ? Math.min(1, hits / Math.min(wanted.size, 2)) : 0.5;

  // --- userFeedbackFit --- affinity + action bias
  let userFeedbackFit = track.userAffinity ?? 0.5;
  if (action === 'more_energy') userFeedbackFit = clamp01(userFeedbackFit + (track.energy - 3) * 0.1);
  if (action === 'smooth_it_out') userFeedbackFit = clamp01(userFeedbackFit + (3 - track.energy) * 0.1);

  // --- noveltyFit --- match track novelty to appetite
  const appetite = opts.noveltyOverride || derived.noveltyAppetite;
  let noveltyFit;
  if (appetite === 'safe') noveltyFit = 1 - track.noveltyScore;
  else if (appetite === 'explore') noveltyFit = track.noveltyScore;
  else noveltyFit = 1 - Math.abs(track.noveltyScore - 0.5) * 2; // balanced

  // --- penalties ---
  let penalty = 0;
  const reasons = [];
  if (hasExclude(exclude, track.id)) { penalty += 0.6; reasons.push('recently played'); }
  if (lastArtist && track.artist === lastArtist) { penalty += 0.15; reasons.push('same artist'); }
  if (ctx.sleepQuality < 45 && track.intensity >= 5) { penalty += 0.25; reasons.push('too intense after low sleep'); }
  if (ctx.energyLevel >= 75 && track.energy <= 1) { penalty += 0.2; reasons.push('too sleepy for the energy'); }
  penalty += track.skipRisk * 0.1;

  const breakdown = {
    missionFit: r(missionFit),
    energyFit: r(energyFit),
    moodFit: r(moodFit),
    contextFit: r(contextFit),
    userFeedbackFit: r(userFeedbackFit),
    noveltyFit: r(noveltyFit),
    penalty: r(penalty),
  };

  const raw =
    missionFit * WEIGHTS.missionFit +
    energyFit * WEIGHTS.energyFit +
    moodFit * WEIGHTS.moodFit +
    contextFit * WEIGHTS.contextFit +
    userFeedbackFit * WEIGHTS.userFeedbackFit +
    noveltyFit * WEIGHTS.noveltyFit -
    penalty;

  return { score: clamp01(raw), matchScore: Math.round(clamp01(raw) * 100), breakdown, penaltyReasons: reasons };
}

export function rankTracks(tracks, opts) {
  return tracks
    .map((t) => ({ track: t, ...scoreTrack(t, opts) }))
    .sort((a, b) => b.score - a.score);
}

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const r = (x) => Math.round(x * 100) / 100;
const hasExclude = (exclude, id) =>
  exclude instanceof Set ? exclude.has(String(id || '').toLowerCase()) : exclude.includes(id);
