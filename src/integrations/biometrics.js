/**
 * Biometrics provider switch.
 *
 * V1 ships ONLY the research-based mock generator. Real wearable feeds
 * (Google Health / Zepp) are intentionally OFF — stubbed so the wiring is
 * obvious for Phase 2, but they throw if selected. Choose with BIOMETRIC_PROVIDER
 * (default "mock").
 */
import { generateBiometrics } from '../lib/generateBiometrics.js';

const PROVIDER = (process.env.BIOMETRIC_PROVIDER || 'mock').trim().toLowerCase();

export const biometricProvider = () => PROVIDER;

/**
 * Get the current biometric snapshot.
 * @param {object} [opts] forwarded to the generator (timeOfDay, age, seed).
 */
export async function getBiometrics(opts = {}) {
  switch (PROVIDER) {
    case 'mock':
      return generateBiometrics(opts);

    // --- Phase 2 (deliberately disabled in V1) ---
    case 'google_health':
      // TODO(phase2): OAuth + Google Fit / Health Connect read of
      // heart rate, HRV, sleep sessions, steps. Keep off for now.
      throw new Error('provider_disabled: google_health is not enabled in V1 (set BIOMETRIC_PROVIDER=mock)');
    case 'zepp':
      // TODO(phase2): Zepp/Amazfit API read of the same signals. Keep off for now.
      throw new Error('provider_disabled: zepp is not enabled in V1 (set BIOMETRIC_PROVIDER=mock)');

    default:
      // Unknown value: fail safe to mock rather than break a trigger.
      return generateBiometrics(opts);
  }
}
