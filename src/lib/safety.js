/**
 * Safety guardrails (research-grade). The clinical evidence (docs/research/sources/05 §5,
 * README §6) is explicit that an affect-regulation engine must be GUARDED, not just clever:
 *
 *  1. The ISO "match" must be time-capped and always move OUT toward higher valence — never
 *     park or loop a low-valence listener in sad music (rumination risk; Garrido & Schubert).
 *  2. Honour permanent skip/block lists; treat strong negatives as de-escalation signals.
 *  3. Avoid violent/hostile lyrics in regulation playlists (lyrics matter more than tone;
 *     Anderson 2003) — especially for calm / focus / sleep goals.
 *  4. Safe-volume guidance (WHO ≤80 dB / 40 h per week); never optimise for loudness.
 *  5. Wellness copy only — no disease/treatment/cure claims.
 *
 * These functions are pure and path-agnostic: both the AI and deterministic engines call them.
 */

const clamp01 = (x) => Math.max(0, Math.min(1, Number(x) || 0));

/** Goals/activities where we steer toward instrumental, low-vocal music. */
const INSTRUMENTAL_GOALS = new Set(['calm_down', 'wind_down', 'focus', 'sleep']);

/** Minimum valence we will ever let the FIRST track sit at (no parking in sad music). */
const START_VALENCE_FLOOR = 0.3;

/**
 * Cap the ISO "match": floor the start valence and guarantee the arc moves toward
 * (or holds) higher valence over its length, so a down listener is met but never looped
 * in low-valence music. Returns a new arc; never mutates the input.
 * @param {{start:object,target:object,goal?:string}} arc
 */
export function capMatch(arc) {
  if (!arc?.start || !arc?.target) return arc;
  const start = { ...arc.start };
  const target = { ...arc.target };

  start.valence = Math.max(clamp01(start.valence), START_VALENCE_FLOOR);
  // The destination must be at least as pleasant as the meeting point.
  if (target.valence < start.valence) target.valence = start.valence;

  return { ...arc, start, target };
}

const normalizeKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Drop candidates matching a per-request block list (track titles, "Title — Artist",
 * ids, or genre/keyword substrings). Mirrors the existing `exclude` semantics but is a
 * permanent user preference rather than a played-history filter.
 * @param {Array} candidates cards carrying { id, title, artist, genres? }
 * @param {string[]} block
 */
export function filterBlocked(candidates = [], block = []) {
  const keys = new Set(
    (Array.isArray(block) ? block : []).filter((x) => typeof x === 'string').map(normalizeKey).filter(Boolean)
  );
  if (!keys.size) return candidates;
  return candidates.filter((c) => {
    if (!c) return false;
    const id = normalizeKey(c.id);
    const titleArtist = normalizeKey(`${c.title} ${c.artist}`);
    if (keys.has(id) || keys.has(titleArtist)) return false;
    // substring match for genre / keyword blocks
    const hay = `${titleArtist} ${(c.genres || []).join(' ')}`;
    for (const k of keys) {
      if (k && hay.includes(k)) return false;
    }
    return true;
  });
}

/**
 * For calming / focus / sleep goals, prefer instrumental, low-vocal tracks and avoid
 * violent/hostile lyrics. Returns a flag the prompt and the deterministic scorer consume.
 * @param {string} goal regulation goal
 * @param {string} [activity] next-activity (focus/sleep reinforce the flag)
 */
export function lyricGuard(goal, activity) {
  const instrumentalPreferred = INSTRUMENTAL_GOALS.has(goal) || INSTRUMENTAL_GOALS.has(activity);
  return {
    instrumentalPreferred,
    avoidHostileLyrics: true, // always — regulation playlists are never a place for hostile lyrics
  };
}

/** Safe-listening copy (WHO). Surfaced in the response so the UI can show it. */
export function volumeNotice() {
  return 'Keep it comfortable — around conversation level. Safe listening is roughly ≤80 dB for up to 40 hours a week.';
}
