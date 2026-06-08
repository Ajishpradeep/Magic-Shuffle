#!/usr/bin/env node
/**
 * CLI: print a research-based mock biometric profile.
 *   npm run gen:biometrics                 # one random profile
 *   npm run gen:biometrics -- --count 5    # five profiles
 *   npm run gen:biometrics -- --seed demo  # reproducible
 *   npm run gen:biometrics -- --time "Early morning" --age 34
 *
 * Stands in for a wearable / Google Health / Zepp feed (those are off in V1).
 */
import { generateBiometrics, describeBiometrics } from '../src/lib/generateBiometrics.js';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else {
        out[key] = true;
      }
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const count = Math.max(1, parseInt(args.count, 10) || 1);
const age = parseInt(args.age, 10) || 30;
const timeOfDay = typeof args.time === 'string' ? args.time : '';

for (let i = 0; i < count; i++) {
  const seed = args.seed != null ? `${args.seed}${count > 1 ? `-${i}` : ''}` : undefined;
  const b = generateBiometrics({ timeOfDay, age, seed });
  const d = describeBiometrics(b);

  console.log(`\n— Mock biometric profile ${count > 1 ? `#${i + 1}` : ''}${timeOfDay ? ` (${timeOfDay})` : ''} —`);
  console.log(`  recovery        ${b.recovery}  (${d.recoveryBand})`);
  console.log(`  energy          ${b.energyLevel}/100  (${d.energyBand})`);
  console.log(`  stress          ${b.stressLevel}/100  (${d.stressBand})`);
  console.log(`  sleep score     ${b.sleepQuality}/100  (${d.sleepBand})`);
  console.log(`  HRV (RMSSD)     ${b.hrv} ms`);
  console.log(`  resting HR      ${b.restingHr} bpm`);
  console.log(`  respiratory     ${b.respiratoryRate} br/min`);
  console.log(`  skin temp dev   ${b.skinTempDev >= 0 ? '+' : ''}${b.skinTempDev} °C`);
  console.log(`  steps so far    ${b.steps}`);
}
console.log('');
