/**
 * Circadian baseline + weather modulator (docs/research/sources/04, README §2 stage 2).
 *
 * These do NOT change the read of the listener — they nudge the TARGET. Two evidence-honest
 * ideas:
 *   - Circadian phase sets the baseline arousal the body is already running (04 §1.7: morning
 *     cortisol-awakening rise, late-morning peak, the ~14–16h post-lunch dip, an evening second
 *     wind peak, the night trough). The engine can ALIGN with it (reinforce the evening
 *     wind-down) or COMPENSATE for it (lift a dark, sluggish afternoon).
 *   - Weather effects are real but SMALL and mostly cultural (04 §4–5). Brightness (sun/cloud)
 *     is the only signal worth much; heat nudges toward soothing/avoiding abrasive music;
 *     barometric pressure and humidity are explicitly ignored (low confidence). Weather is
 *     weighted BELOW circadian.
 */

const clamp01 = (x) => Math.max(0, Math.min(1, Number(x) || 0));

/** Representative hour for the engine's timeOfDay vocabulary, when no real hour is given. */
function timeOfDayToHour(timeOfDay = '') {
  const t = String(timeOfDay).toLowerCase();
  if (/early morning|dawn|waking/.test(t)) return 7;
  if (/morning/.test(t)) return 10;
  if (/afternoon/.test(t)) return 15;
  if (/evening/.test(t)) return 19;
  if (/night/.test(t)) return 23;
  return 12;
}

// Hour → baseline alertness/energy (0..1), smoothed from the 04 §1.7 curve.
const HOURLY_ENERGY = {
  0: 0.15, 1: 0.12, 2: 0.1, 3: 0.1, 4: 0.12, 5: 0.2, 6: 0.35,
  7: 0.5, 8: 0.62, 9: 0.72, 10: 0.8, 11: 0.82, 12: 0.78,
  13: 0.7, 14: 0.58, 15: 0.52, 16: 0.55, 17: 0.62, 18: 0.68,
  19: 0.62, 20: 0.52, 21: 0.42, 22: 0.3, 23: 0.22,
};

/**
 * @param {string|number} when timeOfDay string OR an hour 0–23
 * @returns {{ hour:number, energy:number, alerting:number, phase:string }}
 *   energy = baseline activation; alerting = whether the body is RISING (+) or FALLING (−)
 *   toward sleep, on a −1..1 scale; phase = a short label for copy.
 */
export function circadianBaseline(when) {
  const hour = typeof when === 'number' ? Math.max(0, Math.min(23, Math.round(when))) : timeOfDayToHour(when);
  const energy = HOURLY_ENERGY[hour] ?? 0.5;
  // Slope of the curve → are we ramping up (morning) or down (evening/night)?
  const next = HOURLY_ENERGY[(hour + 1) % 24] ?? energy;
  const prev = HOURLY_ENERGY[(hour + 23) % 24] ?? energy;
  const alerting = Math.max(-1, Math.min(1, (next - prev) * 5));

  let phase = 'midday';
  if (hour < 5) phase = 'night trough';
  else if (hour < 9) phase = 'morning rise';
  else if (hour < 13) phase = 'late-morning peak';
  else if (hour < 17) phase = 'afternoon dip';
  else if (hour < 21) phase = 'evening peak';
  else phase = 'night descent';

  return { hour, energy: clamp01(energy), alerting, phase };
}

const isDark = (weather = '', rainChance = 0) =>
  /cloud|gloom|overcast|grey|gray|rain|storm|fog|drizzle|showers|snow/i.test(weather) || Number(rainChance) >= 50;
const isBright = (weather = '') => /sun|clear|bright|fair/i.test(weather);

/**
 * Weather → an ALIGN/COMPENSATE strategy plus small target biases.
 * Brightness is the trusted lever; heat soothes; pressure/humidity ignored.
 * @returns {{ strategy:'align'|'compensate', valenceBias:number, energyBias:number, note:string }}
 */
export function weatherStrategy(weather = '', rainChance = 0, tempC = null) {
  let valenceBias = 0;
  let energyBias = 0;
  let strategy = 'align';
  let note = 'neutral conditions';

  if (isDark(weather, rainChance)) {
    // Dark / grey → gently COMPENSATE: lift valence and a touch of energy.
    strategy = 'compensate';
    valenceBias = 0.06;
    energyBias = 0.05;
    note = 'lifting a grey sky';
  } else if (isBright(weather)) {
    strategy = 'align';
    valenceBias = 0.03;
    note = 'leaning into the bright day';
  }

  // Heat → soothe / avoid abrasive intensity (small).
  if (tempC != null && tempC >= 30) {
    energyBias -= 0.05;
    note = note === 'neutral conditions' ? 'easing the heat' : `${note}, easing the heat`;
  }

  return { strategy, valenceBias, energyBias, note };
}
