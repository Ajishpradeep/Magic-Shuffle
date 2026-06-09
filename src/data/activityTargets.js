/**
 * The transition framework as data (docs/research/README.md §5, source 03 §8).
 *
 * The product's defensible scientific edge: the regulation TARGET is the optimal entry-state
 * for the listener's NEXT scheduled activity, not merely "feel better." Each entry is the
 * brain-state the music should deliver the listener into, expressed on the app's audio-feature
 * scale (0..1, tempo in BPM) plus the ISO arc's nominal direction and an evidence-based dose.
 *
 * This is the single, tunable source of truth — mirrors how GOAL_TARGETS works in affect.js,
 * and is consumed there by selectGoal()/targetArc(). Targets carry BOTH `energy` and `tension`
 * (Thayer's split arousal) so e.g. workout (high energy, LOW tension) and a wired-but-tired
 * state are represented distinctly.
 *
 * Dose numbers (doseMinutes) come from 03 §8a / 05 §2: calming ≤30 min, sleep 25–60 (mean ~36),
 * pre-exercise short primer. The arc builder doses playlist length to min(doseMinutes, time
 * until the event).
 */

export const ACTIVITY_TARGETS = {
  // Wired OR flat → psyched-up: high energy, low tension. (03 §8: tempo 130–140, energy 0.85.)
  workout: {
    label: 'Pre-workout primer',
    goal: 'energize',
    target: { energy: 0.85, tension: 0.35, valence: 0.8, tempoBpm: 135, acousticness: 0.15, danceability: 0.75, vocalDensity: 0.6 },
    arcDirection: 'ascending',
    doseMinutes: 8,
  },

  // Toward the Yerkes-Dodson optimum: mid arousal, low-distraction, instrumental/low-vocal.
  focus: {
    label: 'Focus primer',
    goal: 'focus',
    target: { energy: 0.52, tension: 0.3, valence: 0.6, tempoBpm: 105, acousticness: 0.5, danceability: 0.4, vocalDensity: 0.2 },
    arcDirection: 'flat',
    doseMinutes: 12,
  },

  // Parasympathetic dominance, drowsy. (03 §8: tempo 60–70, energy 0.2, acousticness >0.75.)
  sleep: {
    label: 'Wind-down to sleep',
    goal: 'wind_down',
    target: { energy: 0.2, tension: 0.15, valence: 0.55, tempoBpm: 64, acousticness: 0.82, danceability: 0.28, vocalDensity: 0.15 },
    arcDirection: 'descending',
    doseMinutes: 36,
  },

  // Alert, low grogginess: melodic, hum-able, brighter. (03 §8: tempo 100–120, energy 0.55→0.75.)
  wake: {
    label: 'Gentle wake-up',
    goal: 'energize',
    target: { energy: 0.68, tension: 0.3, valence: 0.78, tempoBpm: 112, acousticness: 0.4, danceability: 0.55, vocalDensity: 0.5 },
    arcDirection: 'ascending',
    doseMinutes: 10,
  },

  // IZOF: confident, MODERATE arousal (not minimal). (03 §8: tempo 90–110, energy ~0.5, valence high.)
  social: {
    label: 'Pre-meeting poise',
    goal: 'maintain',
    target: { energy: 0.55, tension: 0.4, valence: 0.78, tempoBpm: 100, acousticness: 0.45, danceability: 0.55, vocalDensity: 0.5 },
    arcDirection: 'flat',
    doseMinutes: 8,
  },

  // Steady, engaging-but-safe travel bed; mild positive lift.
  commute: {
    label: 'Commute companion',
    goal: 'maintain',
    target: { energy: 0.55, tension: 0.35, valence: 0.72, tempoBpm: 102, acousticness: 0.4, danceability: 0.55, vocalDensity: 0.5 },
    arcDirection: 'flat',
    doseMinutes: 20,
  },

  // Post-stressor down-regulation: ↑HRV, ↓arousal. (03 §7 — HRV-only support; offered honestly.)
  recovery: {
    label: 'Recovery / break',
    goal: 'calm_down',
    target: { energy: 0.35, tension: 0.25, valence: 0.65, tempoBpm: 78, acousticness: 0.7, danceability: 0.4, vocalDensity: 0.3 },
    arcDirection: 'descending',
    doseMinutes: 20,
  },

  // No confident next activity → hold near current with a small +valence bias.
  none: {
    label: 'Keep the vibe',
    goal: 'maintain',
    target: { energy: 0.55, tension: 0.35, valence: 0.7, tempoBpm: 100, acousticness: 0.45, danceability: 0.55, vocalDensity: 0.5 },
    arcDirection: 'flat',
    doseMinutes: 42, // ~12 tracks at the default cadence — the legacy default when nothing is scheduled
  },
};

export const ACTIVITY_LABELS = Object.fromEntries(
  Object.entries(ACTIVITY_TARGETS).map(([k, v]) => [k, v.label])
);

export const getActivityTarget = (activity) => ACTIVITY_TARGETS[activity] || ACTIVITY_TARGETS.none;
