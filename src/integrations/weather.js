/**
 * Live weather via Open-Meteo (free, keyless, no signup).
 * https://open-meteo.com/en/docs
 *
 * Returns the shape the recommendation engine already expects — a human-readable
 * `weather` string plus a numeric `rainChance` (0–100) and `tempC` — so it drops
 * straight into the existing context. Never throws: on any failure it returns a
 * benign "clear" reading so a trigger still produces a playlist.
 */
import { resolveLocation } from './geolocation.js';

const TIMEOUT_MS = 7000;

export const weatherEnabled = () => true; // keyless — always available

// WMO weather interpretation codes → short human description.
const WMO = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Violent showers',
  85: 'Snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
};

function describe(code) {
  return WMO[code] || 'Mixed skies';
}

/**
 * @param {object} [loc] optional { lat, lon, city }; resolved from IP if omitted.
 * @returns {Promise<{weather:string, condition:string, rainChance:number, tempC:number, location:string, source:string}>}
 */
export async function getWeather(loc) {
  const where = loc || (await resolveLocation());
  const fallback = {
    weather: 'Clear, mild',
    condition: 'Clear sky',
    rainChance: 0,
    tempC: 20,
    location: where.city || 'your area',
    source: 'fallback',
  };

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${where.lat}&longitude=${where.lon}` +
      `&current=temperature_2m,precipitation,weather_code,relative_humidity_2m` +
      `&hourly=precipitation_probability&forecast_days=1&timezone=auto`;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let data;
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) throw new Error(`open-meteo ${r.status}`);
      data = await r.json();
    } finally {
      clearTimeout(timer);
    }

    const cur = data.current || {};
    const code = cur.weather_code ?? 0;
    const condition = describe(code);
    const tempC = Math.round(cur.temperature_2m ?? fallback.tempC);

    // Rain chance: probability for the current hour from the hourly series.
    const times = data.hourly?.time || [];
    const probs = data.hourly?.precipitation_probability || [];
    const nowIso = (cur.time || '').slice(0, 13); // match to the hour
    let idx = times.findIndex((t) => t.slice(0, 13) === nowIso);
    if (idx < 0) idx = 0;
    const rainChance = Math.round(probs[idx] ?? 0);

    return {
      weather: `${condition}, ${tempC}°C${rainChance >= 20 ? `, ${rainChance}% chance of rain` : ''}`,
      condition,
      rainChance,
      tempC,
      location: where.city || 'your area',
      source: 'open-meteo',
    };
  } catch {
    return fallback;
  }
}
