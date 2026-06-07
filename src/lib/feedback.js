/**
 * Maps the UI's feedback controls to target/scoring nudges. The backend stays
 * stateless: the UI passes the action plus what's already been played (`exclude`)
 * and the current track/mission, and gets a freshly-ranked result.
 */
export const FEEDBACK_ACTIONS = [
  'play_something',
  'more_energy',
  'smooth_it_out',
  'surprise_me',
  'keep_this_vibe',
  'play_something_else',
];

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/**
 * Returns { targets, noveltyOverride, lockMission, pickStrategy }.
 * - targets: adjusted sound targets
 * - noveltyOverride: forces a novelty appetite (surprise_me)
 * - lockMission: keep the same mission (keep_this_vibe)
 * - pickStrategy: 'top' | 'random_topN' — how recommend.js picks the winner
 */
export function applyFeedback(action, baseTargets) {
  const t = { ...baseTargets };
  let noveltyOverride = null;
  let lockMission = false;
  let pickStrategy = 'top';

  switch (action) {
    case 'more_energy':
      t.energy = clamp(t.energy + 1, 1, 5);
      t.intensity = clamp(t.intensity + 1, 1, 5);
      t.bpm = clamp(t.bpm + 12, 60, 190);
      break;
    case 'smooth_it_out':
      t.energy = clamp(t.energy - 1, 1, 5);
      t.intensity = clamp(t.intensity - 1, 1, 5);
      t.bpm = clamp(t.bpm - 12, 60, 190);
      break;
    case 'surprise_me':
      noveltyOverride = 'explore';
      pickStrategy = 'random_topN';
      break;
    case 'keep_this_vibe':
      lockMission = true;
      break;
    case 'play_something_else':
      pickStrategy = 'random_topN';
      break;
    default:
      break; // play_something
  }
  return { targets: t, noveltyOverride, lockMission, pickStrategy };
}
