import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { interpolate } from './interpolate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:3000/callback',
  PORT = 3000,
} = process.env;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('\n  Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET.');
  console.error('  Copy .env.example to .env and fill in your credentials.\n');
  process.exit(1);
}

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Single-user, localhost token store kept in memory. Fine for a personal app;
 * for multi-user you'd key this by a session cookie.
 */
const store = {
  accessToken: null,
  refreshToken: null,
  expiresAt: 0,
  profile: null, // { product, country, display_name }
  oauthState: null,
};

// --- OAuth: Authorization Code flow (client secret stays server-side) ---

app.get('/login', (req, res) => {
  store.oauthState = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: store.oauthState,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get('/callback', async (req, res) => {
  const { code, error, state } = req.query;
  if (error) return res.redirect(`/?error=${encodeURIComponent(error)}`);
  if (!code) return res.redirect('/?error=missing_code');
  if (!store.oauthState || state !== store.oauthState) {
    store.oauthState = null;
    return res.redirect('/?error=invalid_state');
  }
  store.oauthState = null;

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const detail = await tokenRes.text();
      console.error('Token exchange failed:', detail);
      return res.redirect('/?error=token_exchange_failed');
    }

    const data = await tokenRes.json();
    store.accessToken = data.access_token;
    store.refreshToken = data.refresh_token;
    store.expiresAt = Date.now() + data.expires_in * 1000;
    await loadProfile();
    res.redirect('/');
  } catch (e) {
    console.error(e);
    res.redirect('/?error=callback_exception');
  }
});

async function refreshAccessToken() {
  if (!store.refreshToken) return false;
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: store.refreshToken,
    }),
  });
  if (!tokenRes.ok) return false;
  const data = await tokenRes.json();
  store.accessToken = data.access_token;
  store.expiresAt = Date.now() + data.expires_in * 1000;
  if (data.refresh_token) store.refreshToken = data.refresh_token;
  return true;
}

/** Returns a valid access token, refreshing if needed, or null if not logged in. */
async function getValidToken() {
  if (!store.accessToken) return null;
  if (Date.now() > store.expiresAt - 60_000) {
    const ok = await refreshAccessToken();
    if (!ok) return null;
  }
  return store.accessToken;
}

async function loadProfile() {
  const token = await getValidToken();
  if (!token) return;
  const r = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (r.ok) {
    const me = await r.json();
    store.profile = {
      product: me.product, // "premium" | "free"
      country: me.country,
      display_name: me.display_name,
    };
  }
}

// --- API for the frontend ---

app.get('/api/session', async (req, res) => {
  const token = await getValidToken();
  if (!token) return res.json({ loggedIn: false });
  if (!store.profile) await loadProfile();
  res.json({
    loggedIn: true,
    accessToken: token, // needed by the Web Playback SDK in the browser
    profile: store.profile,
  });
});

app.post('/api/logout', (req, res) => {
  store.accessToken = null;
  store.refreshToken = null;
  store.expiresAt = 0;
  store.profile = null;
  store.oauthState = null;
  res.json({ ok: true });
});

/**
 * The heart of the app: biometrics -> mood -> Spotify Search -> tracks.
 * Uses the Search API (universally available) rather than the deprecated
 * /recommendations endpoint.
 */
app.post('/api/recommend', async (req, res) => {
  const token = await getValidToken();
  if (!token) return res.status(401).json({ error: 'not_logged_in' });

  const mood = interpolate(req.body || {});
  const market = store.profile?.country || 'US';

  try {
    const tracks = await searchTracks(token, mood, market);
    if (!tracks.length) {
      // Loosen the query: drop the genre filter, keep keywords.
      const loose = await searchTracks(
        token,
        { ...mood, searchQuery: mood.keywords.slice(0, 2).join(' ') },
        market
      );
      return res.json({ mood, tracks: shuffle(loose).slice(0, 12) });
    }
    res.json({ mood, tracks: shuffle(tracks).slice(0, 12) });
  } catch (e) {
    console.error('recommend error', e);
    res.status(502).json({ error: 'spotify_search_failed', detail: String(e) });
  }
});

async function searchTracks(token, mood, market) {
  // Restricted (post-2024) app quotas cap the search `limit` at 10 and reject
  // anything higher with a "400 Invalid limit".
  const params = new URLSearchParams({
    q: mood.searchQuery,
    type: 'track',
    market,
    limit: '10',
  });
  const r = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`search ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const items = data.tracks?.items || [];
  return items.map((t) => ({
    id: t.id,
    uri: t.uri,
    name: t.name,
    artists: t.artists.map((a) => a.name).join(', '),
    album: t.album?.name,
    image: t.album?.images?.[0]?.url || null,
    previewUrl: t.preview_url, // often null in 2026, used opportunistically
    spotifyUrl: t.external_urls?.spotify,
    popularity: t.popularity,
  }));
}

/** Start playback of a track on a given Web Playback SDK device. */
app.put('/api/play', async (req, res) => {
  const token = await getValidToken();
  if (!token) return res.status(401).json({ error: 'not_logged_in' });
  const { uri, deviceId } = req.body || {};
  if (!uri || !deviceId) return res.status(400).json({ error: 'missing_uri_or_device' });

  const r = await fetch(
    `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: [uri] }),
    }
  );
  if (r.status === 204) return res.json({ ok: true });
  const detail = await r.text();
  res.status(r.status).json({ error: 'play_failed', detail });
});

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

app.listen(PORT, () => {
  console.log(`\n  MoodAgent running at http://127.0.0.1:${PORT}`);
  console.log(`  Redirect URI: ${SPOTIFY_REDIRECT_URI}\n`);
});
