/**
 * Recommendation pipeline. AI-FIRST:
 *   1. The AI DJ reasons about the moment -> target sound profile + real songs.
 *   2. We verify each song on Spotify (real art / uri / link).
 *   3. Assemble the response.
 * Only if the AI or Spotify genuinely fail do we drop to the deterministic
 * local-catalog engine, so the app never hard-fails.
 */
import { djReason, aiEnabled, aiModel, missionLabel } from './ai.js';
import { spotifyEnabled, verifyTracks } from './spotify.js';
import { deriveState } from './deriveState.js';

// deterministic fallback deps
import { TRACKS } from '../data/tracks.js';
import { MISSIONS, selectMission } from './missions.js';
import { applyFeedback } from './feedback.js';
import { rankTracks } from './score.js';
import { makeAlbumArt } from './albumArt.js';
import { djLineTemplate } from './fallbackVoice.js';

export async function recommend(ctx, options = {}) {
  const { action = 'play_something', exclude = [], lastArtist = null, currentMission = null } = options;

  if (aiEnabled() && spotifyEnabled()) {
    try {
      return await aiRecommend(ctx, { action, exclude });
    } catch (e) {
      console.warn('[recommend] AI path failed, using deterministic fallback:', e.message);
    }
  }
  return deterministicRecommend(ctx, { action, exclude, lastArtist, currentMission });
}

// ---------------- AI-first path ----------------
async function aiRecommend(ctx, { action, exclude }) {
  const plan = await djReason(ctx, { action, exclude });

  // Ground the AI's songs in real Spotify metadata (drops any not found).
  const verified = await verifyTracks(plan.tracks);
  if (!verified.length) throw new Error('no_verified_tracks');

  const cards = verified
    .map((v) => toAiCard(v, plan.mission))
    .sort((a, b) => b.matchScore - a.matchScore);

  const derived = deriveState(ctx); // cheap; just for signalsReferenced

  return {
    context: ctx,
    state: {
      moodAnalysis: plan.moodAnalysis,
      reasoning: plan.reasoning,
      narrative: plan.moodAnalysis,
      ...lightState(derived),
    },
    mission: { id: plan.mission, label: missionLabel(plan.mission), reason: plan.reasoning },
    targetProfile: plan.targetProfile,
    dj: { line: plan.djLine, source: 'ai' },
    recommendation: cards[0],
    backups: cards.slice(1, 4),
    signalsReferenced: derived.signalsReferenced,
    ai: { enabled: true, model: aiModel(), mode: 'ai-grounded', interpret: 'ai', voice: 'ai' },
  };
}

function toAiCard(v, mission) {
  const p = v.predicted || {};
  const s = v.spotify;
  return {
    id: s.id,
    title: s.title,
    artist: s.artist,
    albumArt: s.albumArt,
    spotifyUrl: s.spotifyUrl,
    spotifyUri: s.spotifyUri,
    previewUrl: s.previewUrl,
    year: s.year,
    durationMs: s.durationMs,
    explicit: s.explicit,
    mission,
    // AI-predicted audio features (Spotify can't supply these for this app)
    predicted: {
      energy: clamp01(p.energy),
      valence: clamp01(p.valence),
      tempoBpm: Math.round(p.tempoBpm || 0),
      acousticness: clamp01(p.acousticness),
      danceability: clamp01(p.danceability),
      vocalDensity: clamp01(p.vocalDensity),
    },
    vibe: `${Math.round(p.tempoBpm || 0)} BPM · energy ${pct(p.energy)} · positivity ${pct(p.valence)}`,
    matchScore: Math.max(0, Math.min(100, Math.round(v.matchScore ?? 70))),
    reason: v.reason || '',
    featureSource: 'ai-estimate',
  };
}

// ---------------- deterministic fallback ----------------
function deterministicRecommend(ctx, { action, exclude, lastArtist, currentMission }) {
  const derived = deriveState(ctx);
  const baseline = selectMission(ctx, derived);
  const fb = applyFeedback(action, MISSIONS[baseline].targets);
  const mission = fb.lockMission && currentMission && MISSIONS[currentMission] ? currentMission : baseline;
  const targets = fb.lockMission ? MISSIONS[mission].targets : fb.targets;
  const excluded = normalizeExclude(exclude);

  const ranked = rankTracks(TRACKS, {
    mission, targets, ctx, derived, action, exclude: excluded, lastArtist, noveltyOverride: fb.noveltyOverride,
  }).filter((r) => !isExcluded(r.track, excluded));

  const list = ranked.length ? ranked : rankTracks(TRACKS, { mission, targets, ctx, derived, action });
  const idx = fb.pickStrategy === 'random_topN' ? Math.floor(Math.random() * Math.min(4, list.length)) : 0;
  const winner = list[idx];
  const backups = list.filter((_, i) => i !== idx).slice(0, 3);

  return {
    context: ctx,
    state: { moodAnalysis: derived.moodState, reasoning: derived.summary, narrative: derived.summary, ...lightState(derived) },
    mission: { id: mission, label: MISSIONS[mission].label, reason: derived.summary },
    targetProfile: featuresToProfile(MISSIONS[mission].targets),
    dj: { line: djLineTemplate({ ctx, mission, track: winner.track }), source: 'template' },
    recommendation: toLocalCard(winner, mission),
    backups: backups.map((b) => toLocalCard(b, mission)),
    signalsReferenced: derived.signalsReferenced,
    ai: { enabled: aiEnabled(), model: aiModel(), mode: 'deterministic', interpret: 'fallback', voice: 'template' },
  };
}

function toLocalCard(ranked, mission) {
  const t = ranked.track;
  return {
    id: t.id, title: t.title, artist: t.artist, albumArt: makeAlbumArt(t),
    spotifyUrl: t.spotifyUrl, spotifyUri: null, previewUrl: null,
    year: '', durationMs: 0, explicit: t.explicit, mission,
    predicted: {
      energy: t.energy / 5, valence: t.valence / 5, tempoBpm: t.bpm,
      acousticness: t.acousticness / 5, danceability: t.danceability / 5, vocalDensity: t.vocalDensity / 5,
    },
    vibe: `${t.bpm} BPM · ${t.moods.join(' · ')}`,
    matchScore: ranked.matchScore, reason: `${t.bpm} BPM · ${t.moods[0]}`,
    featureSource: 'catalog',
  };
}

const lightState = (d) => ({
  energyNeed: d.energyNeed, vocalTolerance: d.vocalTolerance, contextRisk: d.contextRisk,
});
const featuresToProfile = (t) => ({
  energy: t.energy / 5, valence: t.valence / 5, tempoBpm: [t.bpm - 12, t.bpm + 12],
  acousticness: 1 - t.energy / 5, danceability: t.energy / 5, vocalDensity: t.vocalDensity / 5,
});
const clamp01 = (x) => Math.max(0, Math.min(1, Number(x) || 0));
const pct = (x) => `${Math.round(clamp01(x) * 100)}%`;

function normalizeExclude(exclude = []) {
  return new Set(
    exclude
      .filter((x) => typeof x === 'string')
      .map(normalizeKey)
      .filter(Boolean)
  );
}

function isExcluded(track, excluded) {
  return excluded.has(normalizeKey(track.id)) || excluded.has(trackKey(track));
}

function trackKey(track) {
  return normalizeKey(`${track.title} ${track.artist}`);
}

function normalizeKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
