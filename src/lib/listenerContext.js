/**
 * Normalizes the "listener moment" fields that feed recommendations.
 *
 * In production these would sync from:
 * - Biometrics: wearables / HealthKit (energy, sleep, stress as 0–100 signals)
 * - Weather: WeatherKit or a weather API (conditions + precipitation likelihood)
 * - Calendar: system calendar (next event / focus block summary)
 *
 * V1 demo contexts use the same shape; `calendar` is preferred, `schedule` is a legacy alias.
 */

/** @param {Record<string, unknown>} ctx */
export function calendarSummary(ctx = {}) {
  const fromCal = ctx.calendar != null ? String(ctx.calendar).trim() : '';
  if (fromCal) return fromCal;
  const fromSched = ctx.schedule != null ? String(ctx.schedule).trim() : '';
  return fromSched;
}
