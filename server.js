/**
 * Sonicstride — Smart AI DJ backend.
 * Mock context data with optional OpenAI/Spotify grounding and local Spotify
 * Web Playback SDK support. See HANDOFF.md for the API contract.
 */
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CONTEXTS, getContext } from './data/contexts.js';
import { TRACKS } from './data/tracks.js';
import { MISSIONS } from './src/missions.js';
import { FEEDBACK_ACTIONS } from './src/feedback.js';
import { recommend } from './src/recommend.js';
import { aiEnabled, aiModel } from './src/ai.js';
import { spotifyEnabled } from './src/spotify.js';
import {
  playbackConfigured,
  buildLoginUrl,
  exchangeCode,
  getSession,
  logout,
  play,
} from './src/spotifyAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

const app = express();
app.use(express.json());

// Allow same-origin and local partner UI dev servers without exposing tokens to arbitrary sites.
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (isAllowedOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return isAllowedOrigin(origin) ? res.sendStatus(204) : res.sendStatus(403);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// --- meta ---
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'sonicstride',
    version: 1,
    mode: aiEnabled() && spotifyEnabled() ? 'ai-grounded' : 'deterministic',
    aiEnabled: aiEnabled(),
    aiModel: aiModel(),
    spotifyGrounding: spotifyEnabled(),
    playback: playbackConfigured(),
    missions: Object.keys(MISSIONS),
    feedbackActions: FEEDBACK_ACTIONS,
    contexts: CONTEXTS.length,
    fallbackTracks: TRACKS.length,
  });
});

// --- demo context profiles (for the context switcher) ---
app.get('/api/contexts', (req, res) => res.json({ contexts: CONTEXTS }));

// --- local catalog (debug / optional UI) ---
app.get('/api/tracks', (req, res) => res.json({ tracks: TRACKS }));

// --- Spotify user auth + in-app playback (Phase 2) ---
app.get('/login', (req, res) => {
  if (!playbackConfigured()) return res.redirect('/?error=spotify_not_configured');
  res.redirect(buildLoginUrl());
});

app.get('/callback', async (req, res) => {
  const { code, error, state } = req.query;
  if (error) return res.redirect(`/?error=${encodeURIComponent(error)}`);
  if (!code) return res.redirect('/?error=missing_code');
  try {
    await exchangeCode(code, state);
    res.redirect('/');
  } catch (e) {
    console.error('callback error', e);
    const reason = e.message === 'invalid_state' ? 'invalid_state' : 'token_exchange_failed';
    res.redirect(`/?error=${reason}`);
  }
});

app.get('/api/session', async (req, res) => {
  res.json(await getSession());
});

app.post('/api/logout', (req, res) => {
  logout();
  res.json({ ok: true });
});

// Start full-track playback in the browser's Web Playback SDK device.
app.put('/api/play', async (req, res) => {
  const { uri, deviceId } = req.body || {};
  if (!uri || !deviceId) return res.status(400).json({ error: 'missing_uri_or_device' });
  const result = await play(uri, deviceId);
  res.status(result.status === 204 ? 200 : result.status).json(result);
});

// --- the core endpoint ---
app.post('/api/recommend', async (req, res) => {
  try {
    const body = req.body || {};
    const ctx = body.context || getContext(body.contextId);
    if (!ctx) {
      return res.status(400).json({
        error: 'unknown_context',
        detail: 'Provide a valid `contextId` (see GET /api/contexts) or a full `context` object.',
      });
    }
    const action = FEEDBACK_ACTIONS.includes(body.action) ? body.action : 'play_something';
    const result = await recommend(ctx, {
      action,
      exclude: Array.isArray(body.exclude) ? body.exclude : [],
      lastArtist: body.lastArtist || null,
      currentMission: body.currentMission || null,
    });
    res.json(result);
  } catch (e) {
    console.error('recommend error', e);
    res.status(500).json({ error: 'recommend_failed', detail: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`\n  🎧 Sonicstride AI DJ running at http://127.0.0.1:${PORT}`);
  console.log(`  AI: ${aiEnabled() ? 'enabled (OpenAI)' : 'disabled — using deterministic fallbacks'}`);
  console.log(`  ${TRACKS.length} tracks · ${CONTEXTS.length} context profiles\n`);
});

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (CORS_ORIGINS.includes(origin)) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'http:' && ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(hostname);
  } catch {
    return false;
  }
}
