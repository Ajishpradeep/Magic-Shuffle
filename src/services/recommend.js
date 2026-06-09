/**
 * Recommendation pipeline (AI-first, then deterministic catalog fallback).
 *
 * Produces a research-grade ISO-PRINCIPLE PLAYLIST: an arc of tracks that starts near the
 * listener's current arousal (two-axis affect) and ramps toward the optimal entry-state for
 * their NEXT scheduled activity (workout / focus / sleep / wake / social / commute / recovery),
 * modulated by circadian phase + weather, dosed to the time until that activity, and wrapped in
 * safety guardrails (no sad-loop, block lists, lyric/volume guidance).
 *
 * 1. Classify the next activity + read affect → choose goal + target arc.
 * 2. OpenAI plans an arc-ordered set of real songs + DJ copy from the moment.
 * 3. Spotify client-credentials search grounds proposals in real metadata.
 * 4. buildArc finalizes the order so tempo/energy move smoothly.
 * 5. On failure, local catalog + the same arc keeps the app usable offline.
 */
import { djPlaylist, aiEnabled, aiModel, missionLabel } from '../integrations/openai.js';
import { spotifyEnabled, verifyTracks } from '../integrations/spotifyClient.js';
import { deriveListenerState } from '../lib/deriveListenerState.js';
import { toAffect, targetArc, goalLabel } from '../lib/affect.js';
import { buildArc, catalogProfile, doseLength } from '../lib/isoPlaylist.js';
import { classifyNextActivity } from '../lib/activityClassifier.js';
import { getActivityTarget, ACTIVITY_LABELS } from '../data/activityTargets.js';
import { capMatch, filterBlocked, lyricGuard, volumeNotice } from '../lib/safety.js';

import { TRACKS } from '../data/tracks.js';
import { djLineTemplate } from '../lib/fallbackVoice.js';
import { makeAlbumArt } from '../lib/albumArt.js';

const DEFAULT_LENGTH = 12;

/**
 * Build a full, arc-ordered playlist for a listener moment.
 * @param {object} ctx listener moment
 * @param {object} [options] { action, exclude, block, length }
 * @returns {Promise<object>} see shape below
 */
export async function recommendPlaylist(ctx, options = {}) {
  const { action = 'play_something', exclude = [], block = [], length } = options;

  // 1. Next-activity (headline thesis) — honour caller-supplied, else classify the calendar.
  const cls = classifyContext(ctx);

  // 2. Two-axis affect + target arc (goal from activity, modulated by circadian/weather).
  const affect = toAffect(ctx, ctx.timeOfDay);
  const rawArc = targetArc(affect, {
    timeOfDay: ctx.timeOfDay,
    nextActivity: cls.activity,
    confidence: cls.confidence,
    weather: ctx.weather,
    rainChance: ctx.rainChance,
    tempC: ctx.tempC,
  });
  // 3. Apply feedback nudge, then SAFETY: cap the match so a low-valence user is never looped.
  const arc = capMatch(applyActionToArc(rawArc, action));

  // The EFFECTIVE activity is the one that actually drove the goal: 'none' when the next
  // activity was too low-confidence and we fell back to current-state regulation. Dosing,
  // labels, and the AI guidance all use this so we never claim to prime for what we ignored.
  const effective = { activity: arc.activity, minutesUntil: arc.activity === 'none' ? null : cls.minutesUntil };

  // 4. Dose the arc length to the time until the event (explicit `length` overrides).
  const dose =
    length != null
      ? { tracks: clampInt(length, 4, 20), minutes: Math.round(clampInt(length, 4, 20) * 3.5) }
      : doseLength(effective.minutesUntil, getActivityTarget(effective.activity).doseMinutes, DEFAULT_LENGTH);

  const excluded = normalizeExclude(exclude);
  const guard = lyricGuard(arc.goal, effective.activity);
  const shared = { cls: effective, affect, arc, dose, guard };

  if (aiEnabled() && spotifyEnabled()) {
    try {
      return await aiPlaylist(ctx, { action, exclude, block, ...shared });
    } catch (e) {
      console.warn('[recommend] AI path failed, using deterministic fallback:', e.message);
    }
  }
  return deterministicPlaylist(ctx, { block, excluded, ...shared });
}

/** Back-compat single-pick wrapper: returns playlist + top pick + backups. */
export async function recommend(ctx, options = {}) {
  return recommendPlaylist(ctx, options);
}

/** Resolve the next activity from explicit fields or the calendar string. */
function classifyContext(ctx) {
  if (ctx.nextActivity && ctx.nextActivity !== 'none') {
    return {
      activity: ctx.nextActivity,
      minutesUntil: ctx.nextEvent?.minutesUntil ?? null,
      confidence: ctx.activityConfidence ?? 0.85,
    };
  }
  const nextEvent = ctx.nextEvent || (ctx.calendar ? { summary: ctx.calendar } : null);
  return classifyNextActivity(nextEvent, ctx.timeOfDay);
}

// ---------------------------------------------------------------- AI path -----

async function aiPlaylist(ctx, { action, exclude, block, cls, affect, arc, dose, guard }) {
  const plan = await djPlaylist(ctx, {
    action,
    exclude,
    length: dose.tracks,
    guidance: {
      goal: arc.goal,
      nextActivity: cls.activity,
      minutesUntil: cls.minutesUntil,
      strategy: arc.strategy,
      affect,
      arc,
      instrumentalPreferred: guard.instrumentalPreferred,
    },
  });

  const verified = await verifyTracks(plan.tracks);
  if (!verified.length) throw new Error('no_verified_tracks');

  const candidates = filterBlocked(verified.map((v) => toAiCard(v, plan)), block);
  if (!candidates.length) throw new Error('all_blocked');
  const planArc = validArc(plan.arc) ? capMatch({ start: plan.arc.start, target: plan.arc.target }) : arc;
  const playlist = buildArc(candidates, planArc, dose.tracks).map(stripInternal);

  const derived = deriveListenerState(ctx);
  const goal = plan.goal || arc.goal;

  return assemble({
    ctx,
    derived,
    affect,
    arc: { ...planArc, goal },
    goal,
    cls,
    strategy: arc.strategy,
    dose,
    guard,
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

function deterministicPlaylist(ctx, { block, excluded, cls, affect, arc, dose, guard }) {
  const pool = filterBlocked(
    TRACKS.filter((t) => !isExcluded(t, excluded)).map((t) => toLocalCard(t, arc.goal)),
    block
  );
  const playlist = buildArc(pool, arc, dose.tracks).map(stripInternal);

  const derived = deriveListenerState(ctx);
  const top = playlist[0];

  return assemble({
    ctx,
    derived,
    affect,
    arc,
    goal: arc.goal,
    cls,
    strategy: arc.strategy,
    dose,
    guard,
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
    genres: t.genres,
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

function assemble({ ctx, derived, affect, arc, goal, cls, strategy, dose, guard, playlist, mission, moodAnalysis, reasoning, targetProfile, dj, mode }) {
  return {
    context: ctx,
    state: {
      moodAnalysis,
      reasoning,
      narrative: moodAnalysis,
      affect, // now { valence, energy, tension, arousal }
      ...lightState(derived),
    },
    goal,
    goalLabel: goalLabel(goal),
    nextActivity: cls.activity,
    activityLabel: ACTIVITY_LABELS[cls.activity] || 'Keep the vibe',
    strategy, // { kind: 'align'|'compensate', note, phase }
    dose, // { tracks, minutes }
    mission: { id: mission, label: missionLabel(mission), reason: reasoning },
    arc: { goal, start: arc.start, target: arc.target, direction: arc.arcDirection },
    targetProfile,
    dj,
    playlist,
    recommendation: playlist[0] || null, // back-compat
    backups: playlist.slice(1, 4), // back-compat
    safety: { volumeNotice: volumeNotice(), instrumentalPreferred: guard.instrumentalPreferred },
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

const stripInternal = ({ profile, arcFit, arcSlot, matchScore, genres, ...card }) => ({
  ...card,
  matchScore: matchScore || arcFit || 70,
});

function profileFrom(t) {
  return {
    energy: t.energy,
    valence: t.valence,
    tension: t.tension,
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
    tension: p.tension != null ? clamp01(p.tension) : undefined,
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
      tension: t.tension != null ? clamp01(t.tension - dir * 0.05) : t.tension,
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
