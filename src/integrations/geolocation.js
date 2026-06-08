/**
 * Approximate location from the server's public IP (keyless).
 *
 * Used so the weather lookup needs zero configuration. Order of preference:
 *   1. IP geolocation via ip-api.com (free, no key)
 *   2. DEFAULT_LOCATION env (geocoded by Open-Meteo's geocoder)
 *   3. Hardcoded Taipei fallback (matches the original hero demo)
 *
 * Result is cached for the process lifetime — location doesn't move per request.
 */
const DEFAULT_LOCATION = (process.env.DEFAULT_LOCATION || '').trim();
const TIMEOUT_MS = 6000;

const FALLBACK = { lat: 25.033, lon: 121.5654, city: 'Taipei', source: 'fallback' };

let cached = null;

async function fetchJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fromIp() {
  const d = await fetchJson('http://ip-api.com/json/?fields=status,city,regionName,country,lat,lon');
  if (d.status !== 'success' || typeof d.lat !== 'number') throw new Error('ip_lookup_failed');
  return {
    lat: d.lat,
    lon: d.lon,
    city: [d.city, d.country].filter(Boolean).join(', ') || 'your area',
    source: 'ip',
  };
}

async function geocode(place) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1`;
  const d = await fetchJson(url);
  const hit = d.results?.[0];
  if (!hit) throw new Error('geocode_failed');
  return {
    lat: hit.latitude,
    lon: hit.longitude,
    city: [hit.name, hit.country].filter(Boolean).join(', '),
    source: 'configured',
  };
}

/** Resolve { lat, lon, city, source }, never throws. */
export async function resolveLocation() {
  if (cached) return cached;

  if (DEFAULT_LOCATION) {
    try {
      cached = await geocode(DEFAULT_LOCATION);
      return cached;
    } catch {
      /* fall through to IP */
    }
  }

  try {
    cached = await fromIp();
    return cached;
  } catch {
    cached = FALLBACK;
    return cached;
  }
}
