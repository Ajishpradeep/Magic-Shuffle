/**
 * Affect model — Russell's circumplex (valence × arousal) + the music-therapy
 * ISO-principle, used to turn a biometric snapshot into an evidence-based musical
 * target ARC (where to start, where to steer).
 *
 * Mapping basis (project research briefing):
 *  - musical valence ≈ affective valence; musical energy/tempo ≈ arousal.
 *  - Stressed   = low valence / HIGH arousal  → calm_down  (down-regulate arousal)
 *  - Lethargic  = low valence / LOW arousal   → energize   (up-regulate arousal)
 *  - Balanced   = high valence                → maintain
 *  - Late night                               → wind_down  (toward sleep)
 *  Always steer toward the high-valence band.
 *  - ISO-principle: START near the user's CURRENT arousal, then ramp tempo/energy
 *    ~10–15 BPM per track toward the target (don't jump straight to calm).
 *
 * All profile fields are 0..1 except tempoBpm (a real BPM).
 */

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const isNightTime = (t = '') => /night|evening/i.test(t);

/**
 * Estimate the listener's current affect from biometrics + time.
 * Arousal rises with energy, stress and physiological strain (low HRV / high RHR).
 * Valence falls with stress and poor sleep.
 * @returns {{valence:number, arousal:number}}  both 0..1
 */
export function toAffect(bio = {}, timeOfDay = '') {
  const energy = (bio.energyLevel ?? 50) / 100;
  const stress = (bio.stressLevel ?? 50) / 100;
  const sleep = (bio.sleepQuality ?? 50) / 100;

  // Physiological arousal hints (optional fields; degrade gracefully if absent).
  // Low HRV and high resting HR both indicate sympathetic ("fight/flight") arousal.
  const hrvStrain = bio.hrv != null ? clamp01((45 - bio.hrv) / 35) : 0; // 0 calm .. 1 strained
  const hrStrain = bio.restingHr != null ? clamp01((bio.restingHr - 60) / 25) : 0;
  const physioArousal = (hrvStrain + hrStrain) / 2;

  let arousal = clamp01(0.45 * energy + 0.3 * stress + 0.25 * physioArousal);
  if (isNightTime(timeOfDay)) arousal = clamp01(arousal - 0.1);

  const valence = clamp01(0.6 - 0.45 * stress + 0.25 * (sleep - 0.5) + 0.15 * (energy - 0.5));

  return { valence: round2(valence), arousal: round2(arousal) };
}

/**
 * Pick the regulation goal from current affect + time.
 * @returns {'calm_down'|'energize'|'wind_down'|'maintain'}
 */
export function regulationGoal(affect, timeOfDay = '') {
  const { valence, arousal } = affect;
  if (isNightTime(timeOfDay) && arousal < 0.6) return 'wind_down';
  if (arousal >= 0.6 && valence < 0.6) return 'calm_down'; // stressed / wired
  if (valence >= 0.55 && arousal >= 0.3 && arousal <= 0.7) return 'maintain'; // good, balanced
  if (arousal <= 0.45 && valence < 0.6) return 'energize'; // flat / lethargic
  // Default: gently lift toward the pleasant band.
  return arousal > 0.55 ? 'calm_down' : 'energize';
}

// End-state target profiles per goal (research "sweet spots").
const GOAL_TARGETS = {
  calm_down: { energy: 0.32, valence: 0.65, tempoBpm: 70, acousticness: 0.75, danceability: 0.4, vocalDensity: 0.35 },
  wind_down: { energy: 0.22, valence: 0.6, tempoBpm: 62, acousticness: 0.82, danceability: 0.3, vocalDensity: 0.2 },
  energize: { energy: 0.8, valence: 0.82, tempoBpm: 122, acousticness: 0.25, danceability: 0.75, vocalDensity: 0.6 },
  maintain: { energy: 0.55, valence: 0.7, tempoBpm: 100, acousticness: 0.45, danceability: 0.6, vocalDensity: 0.5 },
};

const GOAL_LABELS = {
  calm_down: 'Calm down',
  wind_down: 'Wind down',
  energize: 'Energize',
  maintain: 'Keep the vibe',
};

export const goalLabel = (g) => GOAL_LABELS[g] || 'Set the mood';

/** Map current arousal → a starting tempo so the first track "meets" the listener. */
function arousalToStartTempo(arousal) {
  return Math.round(70 + arousal * 70); // ~70 (calm) .. ~140 (wired) BPM
}

/**
 * Build the ISO-principle arc: a START profile near the listener's current state
 * and a TARGET profile for the goal. The playlist ramps from start → target.
 * @returns {{goal, start, target}}
 */
export function targetArc(affect, timeOfDay = '') {
  const goal = regulationGoal(affect, timeOfDay);
  const target = { ...GOAL_TARGETS[goal] };

  // Start matches the listener now (ISO-principle), nudged toward the target so the
  // first track is recognizable but already leaning the right way.
  const startTempo = arousalToStartTempo(affect.arousal);
  const start = {
    energy: round2(clamp01(affect.arousal * 0.7 + target.energy * 0.3)),
    valence: round2(clamp01(affect.valence * 0.7 + target.valence * 0.3)),
    tempoBpm: Math.round(startTempo * 0.7 + target.tempoBpm * 0.3),
    acousticness: round2(clamp01((1 - affect.arousal) * 0.5 + target.acousticness * 0.5)),
    danceability: round2(target.danceability),
    vocalDensity: round2(target.vocalDensity),
  };

  return { goal, start, target };
}

/** Per-position target by linearly interpolating start → target across `length` slots. */
export function arcProfileAt(arc, index, length) {
  const t = length <= 1 ? 1 : index / (length - 1);
  const lerp = (a, b) => a + (b - a) * t;
  const { start, target } = arc;
  return {
    energy: round2(lerp(start.energy, target.energy)),
    valence: round2(lerp(start.valence, target.valence)),
    tempoBpm: Math.round(lerp(start.tempoBpm, target.tempoBpm)),
    acousticness: round2(lerp(start.acousticness, target.acousticness)),
    danceability: round2(lerp(start.danceability, target.danceability)),
    vocalDensity: round2(lerp(start.vocalDensity, target.vocalDensity)),
  };
}

const round2 = (x) => Math.round(x * 100) / 100;
