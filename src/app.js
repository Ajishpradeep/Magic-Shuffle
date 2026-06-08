/**
 * Express application: static client, JSON API, Spotify OAuth for playback.
 */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CONTEXTS, getContext } from './data/contexts.js';
import { TRACKS } from './data/tracks.js';
import { MISSIONS } from './lib/missions.js';
import { FEEDBACK_ACTIONS } from './lib/feedback.js';
import { recommend, recommendPlaylist } from './services/recommend.js';
import { assembleLiveContext } from './services/buildContext.js';
import { aiEnabled, aiModel } from './integrations/openai.js';
import { spotifyEnabled } from './integrations/spotifyClient.js';
import { weatherEnabled } from './integrations/weather.js';
import { biometricProvider } from './integrations/biometrics.js';
import {
  calendarConfigured,
  buildAuthUrl as buildGoogleAuthUrl,
  exchangeCode as exchangeGoogleCode,
  getSession as getGoogleSession,
  logout as googleLogout,
} from './integrations/googleCalendar.js';
import {
  playbackConfigured,
  buildLoginUrl,
  exchangeCode,
  getSession,
  logout,
  play,
} from './integrations/spotifyUserAuth.js';
import { createCorsMiddleware } from './middleware/cors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(createCorsMiddleware(CORS_ORIGINS));
  app.use(express.static(path.join(projectRoot, 'public')));

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      service: 'magic-shuffle',
      version: 1,
      mode: aiEnabled() && spotifyEnabled() ? 'ai-grounded' : 'deterministic',
      aiEnabled: aiEnabled(),
      aiModel: aiModel(),
      spotifyGrounding: spotifyEnabled(),
      playback: playbackConfigured(),
      signals: {
        weather: weatherEnabled() ? 'open-meteo' : 'off',
        calendar: calendarConfigured() ? 'google-oauth' : 'mock',
        biometrics: biometricProvider(),
      },
      missions: Object.keys(MISSIONS),
      feedbackActions: FEEDBACK_ACTIONS,
      contexts: CONTEXTS.length,
      fallbackTracks: TRACKS.length,
    });
  });

  // Live trigger: assemble real signals (weather + calendar + generated biometrics)
  // and return a full arc-ordered playlist.
  app.get('/api/playlist', async (req, res) => {
    try {
      const { context, sources } = await assembleLiveContext({ userName: req.query.name || 'You' });
      const action = FEEDBACK_ACTIONS.includes(req.query.action) ? req.query.action : 'play_something';
      const length = Math.min(20, Math.max(4, parseInt(req.query.length, 10) || 12));
      const result = await recommendPlaylist(context, { action, length });
      res.json({ ...result, sources });
    } catch (e) {
      console.error('playlist error', e);
      res.status(500).json({ error: 'playlist_failed', detail: String(e.message || e) });
    }
  });

  app.get('/api/contexts', (req, res) => res.json({ contexts: CONTEXTS }));
  app.get('/api/tracks', (req, res) => res.json({ tracks: TRACKS }));

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

  // --- Google Calendar OAuth (read-only; graceful fallback when unconfigured) ---
  app.get('/google/login', (req, res) => {
    if (!calendarConfigured()) return res.redirect('/?error=google_not_configured');
    res.redirect(buildGoogleAuthUrl());
  });

  app.get('/google/callback', async (req, res) => {
    const { code, error, state } = req.query;
    if (error) return res.redirect(`/?error=${encodeURIComponent(error)}`);
    if (!code) return res.redirect('/?error=missing_code');
    try {
      await exchangeGoogleCode(code, state);
      res.redirect('/?google=connected');
    } catch (e) {
      console.error('google callback error', e);
      const reason = e.message === 'invalid_state' ? 'invalid_state' : 'google_token_exchange_failed';
      res.redirect(`/?error=${reason}`);
    }
  });

  app.get('/api/google/session', async (req, res) => {
    res.json(await getGoogleSession());
  });

  app.post('/api/google/logout', (req, res) => {
    googleLogout();
    res.json({ ok: true });
  });

  app.put('/api/play', async (req, res) => {
    const { uri, deviceId } = req.body || {};
    if (!uri || !deviceId) return res.status(400).json({ error: 'missing_uri_or_device' });
    const result = await play(uri, deviceId);
    res.status(result.status === 204 ? 200 : result.status).json(result);
  });

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

  return app;
}
