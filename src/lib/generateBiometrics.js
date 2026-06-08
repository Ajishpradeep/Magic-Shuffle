/**
 * Research-based mock biometric generator.
 *
 * Real wearables (Oura, WHOOP, Apple Watch) report a cluster of signals that
 * MOVE TOGETHER: poor sleep ↔ low HRV ↔ elevated resting HR ↔ high stress ↔ low
 * energy ↔ elevated respiratory rate ↔ elevated skin temperature. To produce
 * believable mock profiles (not impossible combinations like "high HRV + high
 * resting HR + high stress"), every metric is derived from a single latent
 * "recovery" factor r ∈ [0,1], plus a little independent noise.
 *
 * Numbers/ranges come from the project research briefing (wearable + clinical
 * literature): see HANDOFF.md §"Biometrics" and the research notes. They are
 * population-level references — a production app would personalize to the user's
 * own rolling baseline.
 *
 * This stays the ONLY source of biometrics in V1. Google Health / Zepp are
 * deliberately not wired (see src/integrations/biometrics.js).
 */

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const round = (x, dp = 0) => {
  const f = 10 ** dp;
  return Math.round(x * f) / f;
};

/** Deterministic PRNG (mulberry32) so a `seed` reproduces a profile for demos. */
function makeRng(seed) {
  if (seed == null) return Math.random;
  let a = (typeof seed === 'string' ? hashString(seed) : seed >>> 0) || 1;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Time-of-day energy modifier: wake inertia (early AM) + the ~2–4pm dip. */
function timeOfDayEnergyDelta(timeOfDay = '') {
  const t = String(timeOfDay).toLowerCase();
  if (/early morning|dawn|waking/.test(t)) return -0.12;
  if (/morning/.test(t)) return 0.04; // late-morning alertness peak
  if (/afternoon/.test(t)) return -0.08; // post-lunch dip
  if (/evening/.test(t)) return -0.04;
  if (/night/.test(t)) return -0.15;
  return 0;
}

/**
 * @param {object} [opts]
 * @param {string} [opts.timeOfDay]  e.g. "Early morning" — shifts energy realistically.
 * @param {number} [opts.age=30]     scales HRV/HR baselines (HRV declines with age).
 * @param {number|string} [opts.seed] reproducible profile.
 * @param {number} [opts.recovery]   force the latent recovery factor (0..1) for testing.
 * @returns {object} biometric snapshot (0–100 signals kept for back-compat + raw vitals).
 */
export function generateBiometrics(opts = {}) {
  const { timeOfDay = '', age = 30, seed, recovery } = opts;
  const rng = makeRng(seed);
  const noise = (amt) => (rng() - 0.5) * 2 * amt;

  // Latent recovery/strain factor — the single thing everything hangs off of.
  const r = recovery != null ? clamp(recovery, 0, 1) : clamp(rng() * 0.85 + noise(0.1) + 0.07, 0, 1);

  // Age-scaled baselines (HRV drops ~0.5ms/yr after 30; resting HR fairly stable).
  const hrvBaseline = clamp(45 - Math.max(0, age - 30) * 0.5, 22, 60);
  const rhrBaseline = 60;

  // --- Sleep score (anchor metric), 0..100 ---
  const sleepQuality = clamp(round(30 + 65 * r + noise(6)), 25, 100);
  const sleepNorm = sleepQuality / 100;

  // --- HRV (RMSSD, ms): high when recovered, inverse to strain ---
  const hrv = clamp(round(hrvBaseline * (0.6 + 0.8 * r) + noise(4)), 12, 120);

  // --- Resting HR (bpm): elevated under strain, inverse to HRV ---
  const restingHr = clamp(round(rhrBaseline * (1.25 - 0.3 * r) + noise(2.5)), 42, 95);

  // --- Respiratory rate (br/min): stable, nudges up under strain ---
  const respiratoryRate = clamp(round(13 + (1 - r) * 6 + noise(1), 1), 11, 22);

  // --- Skin temperature deviation (°C from baseline): ~0 recovered, up under strain ---
  const skinTempDev = clamp(round((1 - r) * 0.8 - 0.3 + noise(0.15), 2), -0.6, 1.3);

  // --- Steps so far: low steps co-occur with low energy / under-arousal ---
  const steps = clamp(round((0.3 + 0.7 * r) * 9000 + noise(1500)), 200, 20000);

  // --- Stress (0..100): inverse of recovery ---
  const stressLevel = clamp(round((1 - r) * 100 + noise(8)), 5, 98);

  // --- Energy (0..100): driven by recovery + sleep, then time-of-day adjusted ---
  const energyBase = 0.4 * r + 0.4 * sleepNorm + 0.2; // 0.2..1.0-ish
  const energyLevel = clamp(
    round((energyBase + timeOfDayEnergyDelta(timeOfDay)) * 100 + noise(6)),
    5,
    98
  );

  return {
    // 0–100 signals (kept so existing engine code keeps working unchanged)
    energyLevel,
    sleepQuality,
    stressLevel,
    // raw wearable-style vitals (new, research-grounded)
    hrv,
    restingHr,
    respiratoryRate,
    skinTempDev,
    steps,
    // provenance
    recovery: round(r, 2),
    biometricSource: 'mock-generated',
  };
}

/** Human-readable bands for the CLI / UI (research thresholds). */
export function describeBiometrics(b) {
  const sleepBand =
    b.sleepQuality >= 85 ? 'optimal' : b.sleepQuality >= 70 ? 'good' : b.sleepQuality >= 60 ? 'fair' : 'poor';
  const stressBand = b.stressLevel >= 65 ? 'high' : b.stressLevel >= 40 ? 'moderate' : 'low';
  const energyBand = b.energyLevel >= 70 ? 'high' : b.energyLevel >= 45 ? 'moderate' : 'low';
  const recoveryBand = b.recovery >= 0.66 ? 'well-recovered' : b.recovery >= 0.4 ? 'partially recovered' : 'under-recovered';
  return { sleepBand, stressBand, energyBand, recoveryBand };
}
