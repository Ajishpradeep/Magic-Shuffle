/**
 * Affect & target model (research-grade).
 *
 * Implements the unified decision model in docs/research/README.md §1–2:
 *
 *   1. AFFECT  — map biometrics + time to valence × (energy, tension). Arousal is SPLIT into
 *      energy (low↔high activation) and tension (calm↔stressed), per Thayer (source 03 §1),
 *      so "energize a flat-but-relaxed user" and "calm an anxious-but-tired user" are distinct,
 *      correct targets. `arousal` is kept as a derived blend for back-compat.
 *   2. GOAL    — the regulation target is chosen from the listener's NEXT scheduled activity
 *      (the product's defensible edge, source 03 / README §5), falling back to current-state
 *      goal selection when nothing is confidently scheduled.
 *   3–4. The target audio-feature profile comes from the activity (data/activityTargets.js) or
 *      the current-state GOAL_TARGETS, then is nudged by circadian phase + weather (ALIGN vs
 *      COMPENSATE, source 04 / lib/circadian.js).
 *   5. ISO ARC — targetArc() returns a START profile near the listener's current arousal and a
 *      TARGET profile for the goal; the playlist ramps start → target (lib/isoPlaylist.js).
 *
 * All profile fields are 0..1 except tempoBpm (a real BPM).
 */
import { getActivityTarget } from '../data/activityTargets.js';
import { circadianBaseline, weatherStrategy } from './circadian.js';

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const round2 = (x) => Math.round(x * 100) / 100;
const isNightTime = (t = '') => /night|evening/i.test(t);

/**
 * Estimate the listener's current affect from biometrics + time on THREE axes.
 * @returns {{valence:number, energy:number, tension:number, arousal:number}} all 0..1
 */
export function toAffect(bio = {}, timeOfDay = '') {
  const energyLevel = (bio.energyLevel ?? 50) / 100;
  const stress = (bio.stressLevel ?? 50) / 100;
  const sleep = (bio.sleepQuality ?? 50) / 100;
  const stepsNorm = bio.steps != null ? clamp01(bio.steps / 12000) : 0.5;

  // --- ENERGY (activation): physical energy, supported by sleep & movement. ---
  const energy = round2(clamp01(0.6 * energyLevel + 0.2 * sleep + 0.2 * stepsNorm));

  // --- TENSION (stress activation): perceived stress + physiological strain. ---
  // Low HRV, high resting HR, high respiratory rate, raised skin temp all read as sympathetic
  // ("fight/flight") strain. Each is optional — we average only the signals we actually have.
  const strains = [];
  if (bio.hrv != null) strains.push(clamp01((45 - bio.hrv) / 35));
  if (bio.restingHr != null) strains.push(clamp01((bio.restingHr - 60) / 25));
  if (bio.respiratoryRate != null) strains.push(clamp01((bio.respiratoryRate - 14) / 6));
  if (bio.skinTempDev != null) strains.push(clamp01(bio.skinTempDev / 0.8));
  const physioStrain = strains.length ? strains.reduce((a, b) => a + b, 0) / strains.length : stress;
  const tension = round2(clamp01(0.55 * stress + 0.45 * physioStrain));

  // --- VALENCE (pleasantness): falls with stress & poor sleep, rises with energy. ---
  const valence = round2(clamp01(0.6 - 0.45 * stress + 0.25 * (sleep - 0.5) + 0.15 * (energyLevel - 0.5)));

  // --- AROUSAL: derived blend so every legacy caller keeps working unchanged. ---
  let arousal = clamp01(0.6 * energy + 0.4 * tension);
  if (isNightTime(timeOfDay)) arousal = clamp01(arousal - 0.05);

  return { valence, energy, tension, arousal: round2(arousal) };
}

// Current-state end-target profiles (used when no confident next-activity drives the goal).
// Each now carries BOTH energy and tension (Thayer). Research "sweet spots" (README §3–5).
const GOAL_TARGETS = {
  calm_down: { energy: 0.32, tension: 0.2, valence: 0.65, tempoBpm: 70, acousticness: 0.75, danceability: 0.4, vocalDensity: 0.35 },
  wind_down: { energy: 0.22, tension: 0.15, valence: 0.6, tempoBpm: 62, acousticness: 0.82, danceability: 0.3, vocalDensity: 0.2 },
  energize: { energy: 0.8, tension: 0.35, valence: 0.82, tempoBpm: 122, acousticness: 0.25, danceability: 0.75, vocalDensity: 0.6 },
  focus: { energy: 0.52, tension: 0.3, valence: 0.6, tempoBpm: 105, acousticness: 0.5, danceability: 0.4, vocalDensity: 0.2 },
  maintain: { energy: 0.55, tension: 0.35, valence: 0.7, tempoBpm: 100, acousticness: 0.45, danceability: 0.6, vocalDensity: 0.5 },
};

const GOAL_LABELS = {
  calm_down: 'Calm down',
  wind_down: 'Wind down',
  energize: 'Energize',
  focus: 'Find focus',
  maintain: 'Keep the vibe',
};

export const goalLabel = (g) => GOAL_LABELS[g] || 'Set the mood';

const ARC_DIRECTION = { energize: 'ascending', focus: 'flat', calm_down: 'descending', wind_down: 'descending', maintain: 'flat' };

/** Confidence at/above which we trust the next-activity to drive the goal. */
const ACTIVITY_CONFIDENCE_MIN = 0.5;

/**
 * Current-state goal selection (the legacy 4-goal rules) — used when no confident activity.
 * @returns {'calm_down'|'energize'|'wind_down'|'maintain'}
 */
function currentStateGoal(affect, timeOfDay = '') {
  const { valence, arousal } = affect;
  if (isNightTime(timeOfDay) && arousal < 0.6) return 'wind_down';
  if (arousal >= 0.6 && valence < 0.6) return 'calm_down'; // wired / stressed
  if (valence >= 0.55 && arousal >= 0.3 && arousal <= 0.7) return 'maintain'; // good, balanced
  if (arousal <= 0.45 && valence < 0.6) return 'energize'; // flat / lethargic
  return arousal > 0.55 ? 'calm_down' : 'energize';
}

/**
 * Select the regulation goal. If a confident next-activity is known, the goal is that
 * activity's primer (the headline thesis); otherwise fall back to current-state selection.
 * @param {object} affect
 * @param {{timeOfDay?:string, nextActivity?:string, confidence?:number}} [opts]
 * @returns {{goal:string, source:'activity'|'current_state', activity:string}}
 */
export function selectGoal(affect, { timeOfDay = '', nextActivity = 'none', confidence = 0 } = {}) {
  if (nextActivity && nextActivity !== 'none' && confidence >= ACTIVITY_CONFIDENCE_MIN) {
    return { goal: getActivityTarget(nextActivity).goal, source: 'activity', activity: nextActivity };
  }
  return { goal: currentStateGoal(affect, timeOfDay), source: 'current_state', activity: 'none' };
}

/** Back-compat shim: the old single-arg goal selector. */
export const regulationGoal = (affect, timeOfDay = '') => selectGoal(affect, { timeOfDay }).goal;

/** Map current arousal → a starting tempo so the first track "meets" the listener. */
function arousalToStartTempo(arousal) {
  return Math.round(70 + arousal * 70); // ~70 (calm) .. ~140 (wired) BPM
}

/** Apply circadian + weather biases to a target profile (nudges the goal, not the reading). */
function modulateTarget(target, { timeOfDay, weather, rainChance, tempC }) {
  const circ = circadianBaseline(timeOfDay);
  const wx = weatherStrategy(weather, rainChance, tempC);

  // Circadian pulls target energy a little toward the body's current baseline (weighted low,
  // and never enough to override a wind_down/energize goal). Weather is weighted below that.
  const energyNudge = 0.12 * (circ.energy - target.energy) + wx.energyBias;
  const valenceNudge = wx.valenceBias;

  return {
    out: {
      ...target,
      energy: round2(clamp01(target.energy + energyNudge)),
      valence: round2(clamp01(target.valence + valenceNudge)),
    },
    strategy: { kind: wx.strategy, note: wx.note, phase: circ.phase },
  };
}

/**
 * Build the ISO-principle arc: a START profile near the listener's current state and a
 * TARGET profile for the goal (chosen from the next activity, modulated by circadian/weather).
 * @param {object} affect from toAffect()
 * @param {object} [opts] { timeOfDay, nextActivity, minutesUntil, confidence, weather, rainChance, tempC }
 * @returns {{goal, activity, source, arcDirection, strategy, start, target}}
 */
export function targetArc(affect, opts = {}) {
  // Back-compat: callers used to pass timeOfDay as a bare string.
  const o = typeof opts === 'string' ? { timeOfDay: opts } : opts;
  const { timeOfDay = '', nextActivity = 'none', confidence = 0 } = o;

  const sel = selectGoal(affect, { timeOfDay, nextActivity, confidence });
  const baseTarget =
    sel.source === 'activity' ? { ...getActivityTarget(sel.activity).target } : { ...GOAL_TARGETS[sel.goal] };
  const arcDirection =
    sel.source === 'activity' ? getActivityTarget(sel.activity).arcDirection : ARC_DIRECTION[sel.goal] || 'flat';

  const { out: target, strategy } = modulateTarget(baseTarget, o);

  // START matches the listener now (ISO match), nudged toward the target so the first track is
  // recognizable but already leaning the right way.
  const startTempo = arousalToStartTempo(affect.arousal);
  const start = {
    energy: round2(clamp01(affect.energy * 0.7 + target.energy * 0.3)),
    tension: round2(clamp01((affect.tension ?? affect.arousal) * 0.7 + (target.tension ?? 0.3) * 0.3)),
    valence: round2(clamp01(affect.valence * 0.7 + target.valence * 0.3)),
    tempoBpm: Math.round(startTempo * 0.7 + target.tempoBpm * 0.3),
    acousticness: round2(clamp01((1 - affect.arousal) * 0.5 + target.acousticness * 0.5)),
    danceability: round2(target.danceability),
    vocalDensity: round2(target.vocalDensity),
  };

  return { goal: sel.goal, activity: sel.activity, source: sel.source, arcDirection, strategy, start, target };
}

/** Per-position target by linearly interpolating start → target across `length` slots. */
export function arcProfileAt(arc, index, length) {
  const t = length <= 1 ? 1 : index / (length - 1);
  const lerp = (a, b) => a + ((b ?? a) - (a ?? 0)) * t;
  const { start, target } = arc;
  return {
    energy: round2(lerp(start.energy, target.energy)),
    tension: round2(lerp(start.tension, target.tension)),
    valence: round2(lerp(start.valence, target.valence)),
    tempoBpm: Math.round(lerp(start.tempoBpm, target.tempoBpm)),
    acousticness: round2(lerp(start.acousticness, target.acousticness)),
    danceability: round2(lerp(start.danceability, target.danceability)),
    vocalDensity: round2(lerp(start.vocalDensity, target.vocalDensity)),
  };
}
