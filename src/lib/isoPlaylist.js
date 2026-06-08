/**
 * Order a pool of candidate tracks into an ISO-principle ARC.
 *
 * Given a start profile (near the listener's current state) and a target profile
 * (the regulation goal), we interpolate a per-slot target across the playlist and
 * greedily place the best-matching, not-yet-used candidate in each slot. The
 * result climbs/descends smoothly in tempo & energy instead of jumping — the
 * therapeutic point of the iso-principle.
 *
 * Candidate shape: each item must carry a normalized `.profile`:
 *   { energy, valence, acousticness, danceability, vocalDensity } in 0..1, tempoBpm real.
 */
import { arcProfileAt } from './affect.js';

// How much each dimension matters when matching a track to a slot target.
const W = { energy: 0.3, tempo: 0.25, valence: 0.2, acousticness: 0.15, vocalDensity: 0.1 };

function distance(profile, slot) {
  const dTempo = Math.min(Math.abs((profile.tempoBpm || 100) - slot.tempoBpm) / 80, 1);
  return (
    W.energy * Math.abs(profile.energy - slot.energy) +
    W.tempo * dTempo +
    W.valence * Math.abs(profile.valence - slot.valence) +
    W.acousticness * Math.abs((profile.acousticness ?? 0.5) - slot.acousticness) +
    W.vocalDensity * Math.abs((profile.vocalDensity ?? 0.5) - slot.vocalDensity)
  );
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

  const used = new Set();
  const ordered = [];
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
    ordered.push({ ...pool[best], arcFit: Math.round((1 - Math.min(bestD, 1)) * 100), arcSlot: i });
  }
  return ordered;
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
