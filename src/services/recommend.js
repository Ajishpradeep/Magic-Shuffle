/**
 * Recommendation pipeline (AI-first, then deterministic catalog fallback).
 *
 * Produces an ISO-PRINCIPLE PLAYLIST: an arc of tracks that starts near the
 * listener's current arousal (from the affect model) and ramps toward an
 * evidence-based regulation target (calm / energize / wind down / maintain).
 *
 * 1. OpenAI plans an arc-ordered set of real songs + DJ copy from the moment.
 * 2. Spotify client-credentials search grounds proposals in real metadata.
 * 3. buildArc finalizes the order so tempo/energy move smoothly.
 * 4. On failure, local catalog + the same arc keeps the app usable offline.
 */
import { djPlaylist, aiEnabled, aiModel, missionLabel } from '../integrations/openai.js';
import { spotifyEnabled, verifyTracks } from '../integrations/spotifyClient.js';
import { deriveListenerState } from '../lib/deriveListenerState.js';
import { toAffect, targetArc, goalLabel } from '../lib/affect.js';
import { buildArc, catalogProfile } from '../lib/isoPlaylist.js';

import { TRACKS } from '../data/tracks.js';
import { djLineTemplate } from '../lib/fallbackVoice.js';
import { makeAlbumArt } from '../lib/albumArt.js';

const DEFAULT_LENGTH = 12;

/**
 * Build a full, arc-ordered playlist for a listener moment.
 * @returns {Promise<object>} see shape below
 */
export async function recommendPlaylist(ctx, options = {}) {
  const { action = 'play_something', exclude = [], length = DEFAULT_LENGTH } = options;

  const affect = toAffect(ctx, ctx.timeOfDay);
  const arc = applyActionToArc(targetArc(affect, ctx.timeOfDay), action);
  const excluded = normalizeExclude(exclude);

  if (aiEnabled() && spotifyEnabled()) {
    try {
      return await aiPlaylist(ctx, { action, exclude, length, affect, arc });
    } catch (e) {
      console.warn('[recommend] AI path failed, using deterministic fallback:', e.message);
    }
  }
  return deterministicPlaylist(ctx, { affect, arc, length, excluded });
}

/** Back-compat single-pick wrapper: returns playlist + top pick + backups. */
export async function recommend(ctx, options = {}) {
  return recommendPlaylist(ctx, options);
}

// ---------------------------------------------------------------- AI path -----

async function aiPlaylist(ctx, { action, exclude, length, affect, arc }) {
  const plan = await djPlaylist(ctx, { action, exclude, length, guidance: { goal: arc.goal, arc } });

  const verified = await verifyTracks(plan.tracks);
  if (!verified.length) throw new Error('no_verified_tracks');

  const candidates = verified.map((v) => toAiCard(v, plan));
  const planArc = validArc(plan.arc) ? { start: plan.arc.start, target: plan.arc.target } : arc;
  const playlist = buildArc(candidates, planArc, length).map(stripInternal);

  const derived = deriveListenerState(ctx);
  const goal = plan.goal || arc.goal;

  return assemble({
    ctx,
    derived,
    affect,
    arc: { ...planArc, goal },
    goal,
    playlist,
    mission: plan.mission || goal,
    moodAnalysis: plan.moodAnalysis,
    reasoning: plan.reasoning,
    targetProfile: plan.targetProfile || profileFrom(planArc.target),
    dj: { line: plan.djLine, source: 'ai' },
    mode: 'ai-grounded',
  });
}

function toAiCard(v, plan) {
  const s = v.spotify;
  const p = normalizeAiProfile(v.predicted || {});
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
    mission: plan.mission || plan.goal,
    predicted: p,
    profile: p, // consumed by buildArc, stripped from output
    vibe: `${p.tempoBpm} BPM · energy ${pct(p.energy)} · positivity ${pct(p.valence)}`,
    matchScore: clampInt(v.matchScore ?? 70, 0, 100),
    reason: v.reason || '',
    featureSource: 'ai-estimate',
  };
}

// ----------------------------------------------------- Deterministic path -----

function deterministicPlaylist(ctx, { affect, arc, length, excluded }) {
  const pool = TRACKS.filter((t) => !isExcluded(t, excluded)).map((t) => toLocalCard(t, arc.goal));
  const playlist = buildArc(pool, arc, length).map(stripInternal);

  const derived = deriveListenerState(ctx);
  const top = playlist[0];

  return assemble({
    ctx,
    derived,
    affect,
    arc,
    goal: arc.goal,
    playlist,
    mission: arc.goal,
    moodAnalysis: derived.moodState,
    reasoning: derived.summary,
    targetProfile: profileFrom(arc.target),
    dj: { line: top ? djLineTemplate({ ctx, mission: arc.goal, track: top }) : '', source: 'template' },
    mode: 'deterministic',
  });
}

function toLocalCard(t, mission) {
  const p = catalogProfile(t);
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    albumArt: makeAlbumArt(t),
    spotifyUrl: t.spotifyUrl,
    spotifyUri: null,
    previewUrl: null,
    year: '',
    durationMs: 0,
    explicit: t.explicit,
    mission,
    predicted: { ...p, tempoBpm: t.bpm },
    profile: p,
    vibe: `${t.bpm} BPM · ${t.moods.join(' · ')}`,
    matchScore: 0, // replaced by arcFit after ordering
    reason: `${t.bpm} BPM · ${t.moods[0]}`,
    featureSource: 'catalog',
  };
}

// ----------------------------------------------------------- shared shape -----

function assemble({ ctx, derived, affect, arc, goal, playlist, mission, moodAnalysis, reasoning, targetProfile, dj, mode }) {
  return {
    context: ctx,
    state: {
      moodAnalysis,
      reasoning,
      narrative: moodAnalysis,
      affect,
      ...lightState(derived),
    },
    goal,
    goalLabel: goalLabel(goal),
    mission: { id: mission, label: missionLabel(mission), reason: reasoning },
    arc: { goal, start: arc.start, target: arc.target },
    targetProfile,
    dj,
    playlist,
    recommendation: playlist[0] || null, // back-compat
    backups: playlist.slice(1, 4), // back-compat
    signalsReferenced: derived.signalsReferenced,
    ai: {
      enabled: aiEnabled(),
      model: aiModel(),
      mode,
      interpret: mode === 'ai-grounded' ? 'ai' : 'fallback',
      voice: mode === 'ai-grounded' ? 'ai' : 'template',
    },
  };
}

// --------------------------------------------------------------- helpers -------

const lightState = (d) => ({
  energyNeed: d.energyNeed,
  vocalTolerance: d.vocalTolerance,
  contextRisk: d.contextRisk,
});

const stripInternal = ({ profile, arcFit, arcSlot, matchScore, ...card }) => ({
  ...card,
  matchScore: matchScore || arcFit || 70,
});

function profileFrom(t) {
  return {
    energy: t.energy,
    valence: t.valence,
    tempoBpm: [Math.round(t.tempoBpm - 12), Math.round(t.tempoBpm + 12)],
    acousticness: t.acousticness,
    danceability: t.danceability,
    vocalDensity: t.vocalDensity,
  };
}

function normalizeAiProfile(p) {
  return {
    energy: clamp01(p.energy),
    valence: clamp01(p.valence),
    tempoBpm: Math.round(p.tempoBpm || 100),
    acousticness: clamp01(p.acousticness),
    danceability: clamp01(p.danceability),
    vocalDensity: clamp01(p.vocalDensity),
  };
}

/** Nudge the arc's target for the energy feedback buttons (applies to both paths). */
function applyActionToArc(arc, action) {
  if (action !== 'more_energy' && action !== 'smooth_it_out') return arc;
  const dir = action === 'more_energy' ? 1 : -1;
  const t = arc.target;
  return {
    ...arc,
    target: {
      ...t,
      energy: clamp01(t.energy + dir * 0.15),
      valence: clamp01(t.valence + dir * 0.05),
      tempoBpm: Math.round(t.tempoBpm + dir * 14),
      acousticness: clamp01(t.acousticness - dir * 0.1),
    },
  };
}

function validArc(a) {
  const ok = (p) => p && typeof p.energy === 'number' && typeof p.tempoBpm === 'number';
  return a && ok(a.start) && ok(a.target);
}

const clamp01 = (x) => Math.max(0, Math.min(1, Number(x) || 0));
const clampInt = (x, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(x) || 0)));
const pct = (x) => `${Math.round(clamp01(x) * 100)}%`;

function normalizeExclude(exclude = []) {
  return new Set(exclude.filter((x) => typeof x === 'string').map(normalizeKey).filter(Boolean));
}
function isExcluded(track, excluded) {
  return excluded.has(normalizeKey(track.id)) || excluded.has(normalizeKey(`${track.title} ${track.artist}`));
}
function normalizeKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
