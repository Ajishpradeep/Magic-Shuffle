/**
 * Google Calendar (read-only) via OAuth 2.0 Authorization Code + refresh.
 *
 * Mirrors the pattern in spotifyUserAuth.js: client secret stays server-side,
 * tokens live in an in-memory store (single-user local app), raw `fetch` only —
 * no googleapis dependency.
 *
 * GRACEFUL FALLBACK: if creds aren't configured or no user has connected, every
 * read returns null and the caller substitutes a mock calendar line, so the app
 * always produces a playlist.
 *
 * Setup (see HANDOFF.md): create an OAuth client (type "Web application") in
 * Google Cloud, enable the Calendar API, add the redirect URI below, and put the
 * client id/secret in .env.
 */
import crypto from 'node:crypto';

const ID = (process.env.GOOGLE_CLIENT_ID || '').trim();
const SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
const REDIRECT = (process.env.GOOGLE_REDIRECT_URI || 'http://127.0.0.1:3000/google/callback').trim();

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'].join(' ');
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export const calendarConfigured = () => Boolean(ID && SECRET);

const store = { accessToken: null, refreshToken: null, expiresAt: 0, email: null, oauthState: null };

export function buildAuthUrl() {
  store.oauthState = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: ID,
    redirect_uri: REDIRECT,
    scope: SCOPES,
    access_type: 'offline', // ask for a refresh token
    prompt: 'consent',
    include_granted_scopes: 'true',
    state: store.oauthState,
  });
  return `${AUTH_URL}?${params}`;
}

export async function exchangeCode(code, state) {
  if (!store.oauthState || state !== store.oauthState) {
    store.oauthState = null;
    throw new Error('invalid_state');
  }
  store.oauthState = null;

  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT,
      client_id: ID,
      client_secret: SECRET,
    }),
  });
  if (!r.ok) throw new Error(`token_exchange ${r.status}: ${await r.text()}`);
  const d = await r.json();
  store.accessToken = d.access_token;
  if (d.refresh_token) store.refreshToken = d.refresh_token;
  store.expiresAt = Date.now() + (d.expires_in || 3600) * 1000;
  await loadProfile();
}

async function refresh() {
  if (!store.refreshToken) return false;
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: store.refreshToken,
      client_id: ID,
      client_secret: SECRET,
    }),
  });
  if (!r.ok) return false;
  const d = await r.json();
  store.accessToken = d.access_token;
  store.expiresAt = Date.now() + (d.expires_in || 3600) * 1000;
  return true;
}

async function getValidToken() {
  if (!store.accessToken) return null;
  if (Date.now() > store.expiresAt - 60_000) {
    if (!(await refresh())) return null;
  }
  return store.accessToken;
}

async function loadProfile() {
  const token = await getValidToken();
  if (!token) return;
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) store.email = (await r.json()).email || null;
  } catch {
    /* non-fatal */
  }
}

export async function getSession() {
  const token = await getValidToken();
  if (!token) return { loggedIn: false, configured: calendarConfigured() };
  return { loggedIn: true, configured: true, email: store.email };
}

export function logout() {
  store.accessToken = null;
  store.refreshToken = null;
  store.expiresAt = 0;
  store.email = null;
  store.oauthState = null;
}

/**
 * Upcoming events (today, from now). Returns [] when unavailable — never throws.
 * @returns {Promise<Array<{summary:string, start:Date|null, allDay:boolean}>>}
 */
export async function getUpcomingEvents({ max = 5 } = {}) {
  const token = await getValidToken();
  if (!token) return [];
  try {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const params = new URLSearchParams({
      timeMin: now.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: String(max),
    });
    const r = await fetch(`${EVENTS_URL}?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return [];
    const items = (await r.json()).items || [];
    return items.map((e) => ({
      summary: e.summary || 'Untitled event',
      start: e.start?.dateTime ? new Date(e.start.dateTime) : null,
      allDay: Boolean(e.start?.date && !e.start?.dateTime),
    }));
  } catch {
    return [];
  }
}

/**
 * One-line summary of what's next, e.g. "Pitch practice at 10:00 AM".
 * Returns null when no real calendar is available so the caller can mock it.
 */
export async function getCalendarSummary() {
  const events = await getUpcomingEvents({ max: 1 });
  if (!events.length) return null;
  const e = events[0];
  if (e.allDay || !e.start) return e.summary;
  const time = e.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${e.summary} at ${time}`;
}
