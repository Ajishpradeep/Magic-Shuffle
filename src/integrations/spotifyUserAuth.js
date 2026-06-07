/**
 * Spotify user OAuth and Web Playback (Authorization Code + refresh).
 * Complements `spotifyClient.js`, which uses client credentials only for search/verify.
 * Client secret stays server-side; tokens are in-memory (single-user local demo).
 */
import crypto from 'node:crypto';

const ID = process.env.SPOTIFY_CLIENT_ID;
const SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3000/callback';

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

const basic = () => 'Basic ' + Buffer.from(`${ID}:${SECRET}`).toString('base64');

export const playbackConfigured = () => Boolean(ID && SECRET);

const store = { accessToken: null, refreshToken: null, expiresAt: 0, profile: null, oauthState: null };

export function buildLoginUrl() {
  store.oauthState = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: ID,
    scope: SCOPES,
    redirect_uri: REDIRECT,
    state: store.oauthState,
  });
  return `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCode(code, state) {
  if (!store.oauthState || state !== store.oauthState) {
    store.oauthState = null;
    throw new Error('invalid_state');
  }
  store.oauthState = null;

  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: basic() },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT }),
  });
  if (!r.ok) throw new Error(`token_exchange ${r.status}: ${await r.text()}`);
  const d = await r.json();
  store.accessToken = d.access_token;
  store.refreshToken = d.refresh_token;
  store.expiresAt = Date.now() + d.expires_in * 1000;
  await loadProfile();
}

async function refresh() {
  if (!store.refreshToken) return false;
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: basic() },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: store.refreshToken }),
  });
  if (!r.ok) return false;
  const d = await r.json();
  store.accessToken = d.access_token;
  store.expiresAt = Date.now() + d.expires_in * 1000;
  if (d.refresh_token) store.refreshToken = d.refresh_token;
  return true;
}

export async function getValidToken() {
  if (!store.accessToken) return null;
  if (Date.now() > store.expiresAt - 60_000) {
    if (!(await refresh())) return null;
  }
  return store.accessToken;
}

async function loadProfile() {
  const token = await getValidToken();
  if (!token) return;
  const r = await fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${token}` } });
  if (r.ok) {
    const me = await r.json();
    store.profile = { product: me.product, country: me.country, display_name: me.display_name };
  }
}

export async function getSession() {
  const token = await getValidToken();
  if (!token) return { loggedIn: false };
  if (!store.profile) await loadProfile();
  return { loggedIn: true, accessToken: token, profile: store.profile };
}

export function logout() {
  store.accessToken = null;
  store.refreshToken = null;
  store.expiresAt = 0;
  store.profile = null;
  store.oauthState = null;
}

/** Start full-track playback of a URI on a Web Playback SDK device. */
export async function play(uri, deviceId) {
  const token = await getValidToken();
  if (!token) return { status: 401, error: 'not_logged_in' };
  const r = await fetch(
    `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: [uri] }),
    }
  );
  if (r.status === 204) return { status: 204, ok: true };
  return { status: r.status, error: 'play_failed', detail: await r.text() };
}
