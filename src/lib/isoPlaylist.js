/**
 * Order a pool of candidate tracks into an ISO-principle ARC, and dose the arc length.
 *
 * Given a start profile (near the listener's current state) and a target profile (the
 * regulation goal), we interpolate a per-slot target across the playlist and greedily place
 * the best-matching, not-yet-used candidate in each slot. The result climbs/descends smoothly
 * in tempo & energy instead of jumping — the therapeutic point of the ISO-principle.
 *
 * Feature weighting follows source 02 §9: arousal levers (energy, tempo, and tension) carry the
 * most weight; valence/mode moderate; danceability is deliberately down-weighted (poor match to
 * human ratings). Since this app can't read Spotify audio-features (HANDOFF §4), AI cards carry
 * an estimated `tension`; catalog cards don't, so tension is scored only when both sides have it.
 *
 * Candidate shape: each item must carry a normalized `.profile`:
 *   { energy, valence, acousticness, danceability, vocalDensity, [tension] } 0..1, tempoBpm real.
 */
import { arcProfileAt } from './affect.js';

// Per-dimension weights (source 02 §9). Tempo & energy & tension dominate (arousal); valence
// moderate; acousticness/vocalDensity supporting; danceability intentionally excluded.
const W = { energy: 0.28, tempo: 0.24, tension: 0.14, valence: 0.16, acousticness: 0.1, vocalDensity: 0.08 };

function distance(profile, slot) {
  let sum = 0;
  let used = 0;
  const add = (w, diff) => {
    sum += w * diff;
    used += w;
  };

  add(W.energy, Math.abs(profile.energy - slot.energy));
  add(W.tempo, Math.min(Math.abs((profile.tempoBpm || 100) - slot.tempoBpm) / 80, 1));
  add(W.valence, Math.abs(profile.valence - slot.valence));
  add(W.acousticness, Math.abs((profile.acousticness ?? 0.5) - slot.acousticness));
  add(W.vocalDensity, Math.abs((profile.vocalDensity ?? 0.5) - slot.vocalDensity));
  // Tension only when the candidate actually estimates it (AI cards), to avoid penalising the
  // catalog (which has no tension dimension) with a guessed value.
  if (profile.tension != null && slot.tension != null) {
    add(W.tension, Math.abs(profile.tension - slot.tension));
  }

  return used ? sum / used : 1; // normalise by weights actually used
}

/**
 * @param {Array<{profile:object}>} candidates
 * @param {{start:object,target:object}} arc
 * @param {number} length desired playlist length
 * @returns {Array} ordered subset of candidates (closest match per arc slot)
 */
export function buildArc(candidates, arc, length) {
  const pool = candidates.filter((c) => c && c.profile);
  const n = Math.min(length, pool.length);
  if (!n) return [];

  // Pass 1 — SELECT the n tracks that best cover the arc's slot targets (greedy per slot).
  // This gets good coverage of the whole start→target range, including its scarce extremes.
  const used = new Set();
  const selected = [];
  for (let i = 0; i < n; i++) {
    const slot = arcProfileAt(arc, i, n);
    let best = -1;
    let bestD = Infinity;
    for (let j = 0; j < pool.length; j++) {
      if (used.has(j)) continue;
      const d = distance(pool[j].profile, slot);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    used.add(best);
    selected.push({ ...pool[best], arcFit: Math.round((1 - Math.min(bestD, 1)) * 100) });
  }

  // Pass 2 — ORDER the selected tracks monotonically along the arc, so tempo/energy ramp
  // smoothly start→target instead of zig-zagging (the therapeutic point of the ISO-principle).
  // Each track is projected onto the start→target line (0 = current state, 1 = goal).
  selected.sort((a, b) => arcParam(a.profile, arc) - arcParam(b.profile, arc));
  return selected.map((t, i) => ({ ...t, arcSlot: i }));
}

/** Position of a track along the arc: 0 ≈ the start (current) profile, 1 ≈ the target. */
function arcParam(profile, arc) {
  const proj = (a, b, x) => (b === a ? 0.5 : (x - a) / (b - a));
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const e = clamp01(proj(arc.start.energy, arc.target.energy, profile.energy));
  const t = clamp01(proj(arc.start.tempoBpm, arc.target.tempoBpm, profile.tempoBpm || 100));
  return 0.5 * e + 0.5 * t;
}

// Dosage facts (source 03 §8a / 05 §2): ~3.5 min per track; calming ≤30 min; sleep 25–60 (~36).
const MINUTES_PER_TRACK = 3.5;
const DOSE_MIN_TRACKS = 4;
const DOSE_MAX_TRACKS = 20;

/**
 * Dose the playlist length to the time available before the next event, bounded by the
 * activity's evidence-based session length. A workout in 10 min → short punchy primer; bedtime
 * in 40 min → long decelerating arc. Falls back to `fallback` when nothing is timed.
 * @param {number|null} minutesUntil minutes until the next event (null = untimed)
 * @param {number} doseMinutes the activity's nominal session length
 * @param {number} [fallback=12] default track count when no timed event
 * @returns {{ tracks:number, minutes:number }}
 */
export function doseLength(minutesUntil, doseMinutes, fallback = 12) {
  if (minutesUntil == null || !(minutesUntil > 0)) {
    const tracks = Math.max(DOSE_MIN_TRACKS, Math.min(DOSE_MAX_TRACKS, fallback));
    return { tracks, minutes: Math.round(tracks * MINUTES_PER_TRACK) };
  }
  // Use the smaller of "time until the event" and "the activity's ideal session length".
  const minutes = Math.min(minutesUntil, doseMinutes || fallback * MINUTES_PER_TRACK);
  const tracks = Math.max(DOSE_MIN_TRACKS, Math.min(DOSE_MAX_TRACKS, Math.round(minutes / MINUTES_PER_TRACK)));
  return { tracks, minutes: Math.round(tracks * MINUTES_PER_TRACK) };
}

/** Normalize a 1..5 catalog track into the 0..1 profile buildArc expects. */
export function catalogProfile(track) {
  return {
    energy: track.energy / 5,
    valence: track.valence / 5,
    acousticness: track.acousticness / 5,
    danceability: track.danceability / 5,
    vocalDensity: track.vocalDensity / 5,
    tempoBpm: track.bpm,
  };
}
