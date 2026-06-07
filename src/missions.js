/**
 * The six V1 music missions, each with a target sound profile the scorer aims at,
 * plus the deterministic mission-selection rules from the handoff. AI may override
 * the choice, but this always provides an explainable baseline + fallback.
 */
export const MISSIONS = {
  gentle_activation: {
    id: 'gentle_activation',
    label: 'Gentle Activation',
    description: 'Raise energy without rushing — warm, steady, optimistic.',
    targets: { energy: 3, valence: 4, bpm: 110, vocalDensity: 3, intensity: 2 },
  },
  focus_flow: {
    id: 'focus_flow',
    label: 'Focus Flow',
    description: 'Support concentration — low-lyric, stable, low surprise.',
    targets: { energy: 2, valence: 3, bpm: 95, vocalDensity: 1, intensity: 1 },
  },
  mood_repair: {
    id: 'mood_repair',
    label: 'Mood Repair',
    description: 'Gentle uplift for a stressed or tired moment — warm, familiar.',
    targets: { energy: 3, valence: 4, bpm: 100, vocalDensity: 3, intensity: 2 },
  },
  lock_the_groove: {
    id: 'lock_the_groove',
    label: 'Lock the Groove',
    description: 'Hold a steady pace and reduce decision fatigue — consistent beat.',
    targets: { energy: 4, valence: 4, bpm: 120, vocalDensity: 3, intensity: 3 },
  },
  push_through: {
    id: 'push_through',
    label: 'Push Through',
    description: 'Drive through fatigue or a hard segment — high energy, anthemic.',
    targets: { energy: 5, valence: 4, bpm: 168, vocalDensity: 4, intensity: 5 },
  },
  recover_smoothly: {
    id: 'recover_smoothly',
    label: 'Recover Smoothly',
    description: 'Downshift without an emotional crash — lower BPM, warm tone.',
    targets: { energy: 2, valence: 4, bpm: 82, vocalDensity: 2, intensity: 1 },
  },
};

export const MISSION_IDS = Object.keys(MISSIONS);
export const isMission = (id) => Object.prototype.hasOwnProperty.call(MISSIONS, id);

/** Deterministic mission selection — mirrors the handoff's Mission Rules. */
export function selectMission(ctx, derived) {
  const work = /work|study|coding|focus|hackathon/i.test(ctx.schedule || '');

  // Deep focus
  if (ctx.activity === 'focus') return 'focus_flow';

  // Workout push
  if (ctx.activity === 'workout' && ctx.energyLevel >= 75) return 'push_through';

  // Rainy commute
  if (ctx.rainChance >= 50 && ctx.activity === 'commute') return 'mood_repair';

  // Evening wind-down
  if (
    (/evening|night/i.test(ctx.timeOfDay || '') || ctx.activity === 'wind_down')
  ) {
    return 'recover_smoothly';
  }

  // Hero case: rainy morning, poor sleep, good physical energy
  if (ctx.sleepQuality < 50 && ctx.energyLevel >= 70 && ctx.rainChance >= 50) {
    return 'gentle_activation';
  }

  // Falls through to state-based defaults
  if (derived.moodState === 'stressed' || derived.moodState === 'low_motivation') {
    return 'mood_repair';
  }
  if (work) return 'focus_flow';
  if (derived.energyNeed === 'high') return 'lock_the_groove';
  if (derived.energyNeed === 'low') return 'recover_smoothly';
  return 'gentle_activation';
}
