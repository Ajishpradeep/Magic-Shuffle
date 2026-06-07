/**
 * Spotify API — client credentials for grounding AI picks (search / metadata only).
 * Does not use audio-features or recommendation endpoints for this app.
 */
const ID = process.env.SPOTIFY_CLIENT_ID;
const SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export const spotifyEnabled = () => Boolean(ID && SECRET);

let token = null;
let tokenExp = 0;
let tokenRequest = null;

async function getToken() {
  if (token && Date.now() < tokenExp - 60_000) return token;
  if (tokenRequest) return tokenRequest;

  tokenRequest = fetchToken();
  try {
    return await tokenRequest;
  } finally {
    tokenRequest = null;
  }
}

async function fetchToken() {
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${ID}:${SECRET}`).toString('base64'),
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });
  if (!r.ok) throw new Error(`spotify token ${r.status}: ${await r.text()}`);
  const d = await r.json();
  token = d.access_token;
  tokenExp = Date.now() + d.expires_in * 1000;
  return token;
}

/** Look up one AI-proposed song and return real metadata, or null if not found. */
export async function verifyTrack({ title, artist }) {
  const tok = await getToken();
  // Try a precise field query first, then a looser one.
  for (const q of [`track:${title} artist:${artist}`, `${title} ${artist}`]) {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=1`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
    if (!r.ok) continue;
    const t = (await r.json()).tracks?.items?.[0];
    if (t) {
      return {
        id: t.id,
        spotifyUri: t.uri,
        spotifyUrl: t.external_urls?.spotify,
        title: t.name,
        artist: t.artists.map((a) => a.name).join(', '),
        album: t.album?.name,
        albumArt: t.album?.images?.[0]?.url || null,
        year: (t.album?.release_date || '').slice(0, 4),
        durationMs: t.duration_ms,
        explicit: t.explicit,
        previewUrl: t.preview_url || null,
      };
    }
  }
  return null;
}

/** Verify many proposed songs in parallel; preserves order, drops not-found. */
export async function verifyTracks(proposals) {
  const results = await Promise.all(
    proposals.map(async (p) => {
      try {
        const found = await verifyTrack(p);
        return found ? { ...p, spotify: found } : null;
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean);
}
