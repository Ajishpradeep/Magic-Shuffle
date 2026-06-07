/**
 * Local tagged-track catalog (V1 mock data). This is the candidate pool the
 * deterministic engine scores against — no Spotify API needed.
 *
 * Scales: energy/valence/intensity/danceability/acousticness/vocalDensity = 1..5.
 * familiarScore / userAffinity / skipRisk / noveltyScore = 0..1.
 * Titles/artists are placeholder seed data — swap for a real licensed catalog later.
 * spotifyUrl is an outbound *search* link so it works without the API.
 *
 * V1 missions: gentle_activation | focus_flow | mood_repair |
 *              lock_the_groove | push_through | recover_smoothly
 */
const search = (t, a) =>
  `https://open.spotify.com/search/${encodeURIComponent(`${t} ${a}`)}`;

const T = (t) => ({ ...t, spotifyUrl: search(t.title, t.artist) });

export const TRACKS = [
  // ---- gentle_activation (warm, steady lift; not aggressive) ----
  T({ id: 'ga1', title: 'Slow Sunrise', artist: 'Marlowe Hale', bpm: 104, energy: 3, valence: 4, intensity: 2, danceability: 3, acousticness: 3, vocalDensity: 2, genres: ['indie', 'chill-pop'], moods: ['warm', 'optimistic', 'easy'], missions: ['gentle_activation', 'mood_repair'], explicit: false, familiarScore: 0.6, userAffinity: 0.5, skipRisk: 0.2, noveltyScore: 0.3, tags: ['rainy', 'steady-beat', 'low-skip-risk', 'warmup'] }),
  T({ id: 'ga2', title: 'Paper Boats', artist: 'The Lowtide', bpm: 110, energy: 3, valence: 4, intensity: 2, danceability: 3, acousticness: 2, vocalDensity: 3, genres: ['indie-pop'], moods: ['hopeful', 'gentle'], missions: ['gentle_activation'], explicit: false, familiarScore: 0.5, userAffinity: 0.45, skipRisk: 0.25, noveltyScore: 0.4, tags: ['rainy', 'warmup', 'steady-beat'] }),
  T({ id: 'ga3', title: 'Morning Static', artist: 'Coral Avenue', bpm: 116, energy: 3, valence: 4, intensity: 3, danceability: 4, acousticness: 2, vocalDensity: 3, genres: ['groove-pop'], moods: ['bright', 'steady'], missions: ['gentle_activation', 'lock_the_groove'], explicit: false, familiarScore: 0.55, userAffinity: 0.5, skipRisk: 0.2, noveltyScore: 0.35, tags: ['warmup', 'steady-beat', 'low-skip-risk'] }),
  T({ id: 'ga4', title: 'First Light Drive', artist: 'Neon Garden', bpm: 112, energy: 3, valence: 5, intensity: 2, danceability: 4, acousticness: 1, vocalDensity: 2, genres: ['synth-pop'], moods: ['optimistic', 'warm'], missions: ['gentle_activation'], explicit: false, familiarScore: 0.4, userAffinity: 0.4, skipRisk: 0.3, noveltyScore: 0.55, tags: ['warmup', 'rainy'] }),

  // ---- focus_flow (instrumental / low-lyric, stable, low surprise) ----
  T({ id: 'ff1', title: 'Glass Corridors', artist: 'Ambient Theory', bpm: 92, energy: 2, valence: 3, intensity: 1, danceability: 2, acousticness: 3, vocalDensity: 1, genres: ['ambient', 'electronic'], moods: ['calm', 'focused'], missions: ['focus_flow'], explicit: false, familiarScore: 0.3, userAffinity: 0.4, skipRisk: 0.15, noveltyScore: 0.5, tags: ['instrumental', 'low-lyrics', 'focus', 'low-skip-risk'] }),
  T({ id: 'ff2', title: 'Quiet Algorithms', artist: 'Field Notes', bpm: 100, energy: 2, valence: 3, intensity: 1, danceability: 2, acousticness: 2, vocalDensity: 1, genres: ['downtempo'], moods: ['focused', 'neutral'], missions: ['focus_flow'], explicit: false, familiarScore: 0.25, userAffinity: 0.35, skipRisk: 0.15, noveltyScore: 0.6, tags: ['instrumental', 'low-lyrics', 'focus'] }),
  T({ id: 'ff3', title: 'Soft Focus', artist: 'Muse Note', bpm: 96, energy: 2, valence: 3, intensity: 2, danceability: 3, acousticness: 2, vocalDensity: 1, genres: ['lo-fi'], moods: ['mellow', 'focused'], missions: ['focus_flow', 'recover_smoothly'], explicit: false, familiarScore: 0.5, userAffinity: 0.5, skipRisk: 0.1, noveltyScore: 0.3, tags: ['instrumental', 'low-lyrics', 'focus', 'low-skip-risk', 'rainy'] }),
  T({ id: 'ff4', title: 'Tideline Loops', artist: 'Hana Brook', bpm: 88, energy: 2, valence: 3, intensity: 1, danceability: 2, acousticness: 4, vocalDensity: 1, genres: ['ambient'], moods: ['calm'], missions: ['focus_flow'], explicit: false, familiarScore: 0.3, userAffinity: 0.4, skipRisk: 0.12, noveltyScore: 0.5, tags: ['instrumental', 'focus', 'night-safe'] }),

  // ---- mood_repair (gentle uplift, warm production, familiar) ----
  T({ id: 'mr1', title: 'Umbrella Weather', artist: 'June Parade', bpm: 98, energy: 3, valence: 4, intensity: 2, danceability: 3, acousticness: 3, vocalDensity: 3, genres: ['indie-folk'], moods: ['warm', 'reflective', 'uplifting'], missions: ['mood_repair'], explicit: false, familiarScore: 0.6, userAffinity: 0.6, skipRisk: 0.15, noveltyScore: 0.3, tags: ['rainy', 'warm', 'low-skip-risk'] }),
  T({ id: 'mr2', title: 'Hold the Grey', artist: 'Marlowe Hale', bpm: 102, energy: 3, valence: 4, intensity: 2, danceability: 3, acousticness: 3, vocalDensity: 3, genres: ['indie'], moods: ['reflective', 'gentle'], missions: ['mood_repair'], explicit: false, familiarScore: 0.55, userAffinity: 0.55, skipRisk: 0.18, noveltyScore: 0.3, tags: ['rainy', 'warm'] }),
  T({ id: 'mr3', title: 'Better by Noon', artist: 'The Lowtide', bpm: 108, energy: 3, valence: 5, intensity: 2, danceability: 4, acousticness: 2, vocalDensity: 3, genres: ['indie-pop'], moods: ['hopeful', 'uplifting'], missions: ['mood_repair', 'gentle_activation'], explicit: false, familiarScore: 0.5, userAffinity: 0.5, skipRisk: 0.2, noveltyScore: 0.4, tags: ['warm', 'rainy'] }),
  T({ id: 'mr4', title: 'Keep the Lights Low', artist: 'Velvet Hours', bpm: 90, energy: 2, valence: 4, intensity: 2, danceability: 3, acousticness: 4, vocalDensity: 3, genres: ['soul'], moods: ['warm', 'soothing'], missions: ['mood_repair', 'recover_smoothly'], explicit: false, familiarScore: 0.6, userAffinity: 0.6, skipRisk: 0.12, noveltyScore: 0.25, tags: ['warm', 'night-safe', 'rainy'] }),

  // ---- lock_the_groove (stable BPM, consistent beat, low skip risk) ----
  T({ id: 'lg1', title: 'Even Keel', artist: 'Coral Avenue', bpm: 118, energy: 4, valence: 4, intensity: 3, danceability: 4, acousticness: 1, vocalDensity: 3, genres: ['groove-pop'], moods: ['steady', 'confident'], missions: ['lock_the_groove'], explicit: false, familiarScore: 0.6, userAffinity: 0.55, skipRisk: 0.15, noveltyScore: 0.3, tags: ['steady-beat', 'low-skip-risk', 'urban-run'] }),
  T({ id: 'lg2', title: 'Citylight Cadence', artist: 'Neon Garden', bpm: 122, energy: 4, valence: 4, intensity: 3, danceability: 5, acousticness: 1, vocalDensity: 2, genres: ['synth-pop'], moods: ['steady', 'cool'], missions: ['lock_the_groove'], explicit: false, familiarScore: 0.5, userAffinity: 0.5, skipRisk: 0.18, noveltyScore: 0.4, tags: ['steady-beat', 'night-safe', 'urban-run'] }),
  T({ id: 'lg3', title: 'Running Lines', artist: 'Pulse Theory', bpm: 124, energy: 4, valence: 3, intensity: 3, danceability: 4, acousticness: 1, vocalDensity: 2, genres: ['electronic'], moods: ['steady', 'driving'], missions: ['lock_the_groove'], explicit: false, familiarScore: 0.45, userAffinity: 0.45, skipRisk: 0.2, noveltyScore: 0.45, tags: ['steady-beat', 'urban-run', 'night-safe'] }),
  T({ id: 'lg4', title: 'Metronome Heart', artist: 'Coral Avenue', bpm: 120, energy: 4, valence: 4, intensity: 3, danceability: 4, acousticness: 1, vocalDensity: 3, genres: ['groove-pop'], moods: ['steady'], missions: ['lock_the_groove', 'gentle_activation'], explicit: false, familiarScore: 0.55, userAffinity: 0.5, skipRisk: 0.15, noveltyScore: 0.3, tags: ['steady-beat', 'low-skip-risk'] }),

  // ---- push_through (high energy, strong rhythm, familiar/anthemic) ----
  T({ id: 'pt1', title: 'Redline', artist: 'Apex Riot', bpm: 168, energy: 5, valence: 4, intensity: 5, danceability: 4, acousticness: 1, vocalDensity: 4, genres: ['rock', 'electronic'], moods: ['intense', 'driving'], missions: ['push_through'], explicit: false, familiarScore: 0.7, userAffinity: 0.6, skipRisk: 0.15, noveltyScore: 0.2, tags: ['anthemic', 'sprint', 'low-skip-risk'] }),
  T({ id: 'pt2', title: 'No Brakes', artist: 'Voltage Kids', bpm: 174, energy: 5, valence: 4, intensity: 5, danceability: 4, acousticness: 1, vocalDensity: 4, genres: ['edm'], moods: ['hyped', 'driving'], missions: ['push_through'], explicit: false, familiarScore: 0.6, userAffinity: 0.55, skipRisk: 0.2, noveltyScore: 0.3, tags: ['anthemic', 'sprint'] }),
  T({ id: 'pt3', title: 'Ironwill', artist: 'Apex Riot', bpm: 160, energy: 5, valence: 4, intensity: 5, danceability: 4, acousticness: 1, vocalDensity: 4, genres: ['rock'], moods: ['confident', 'intense'], missions: ['push_through'], explicit: false, familiarScore: 0.65, userAffinity: 0.6, skipRisk: 0.15, noveltyScore: 0.2, tags: ['anthemic', 'confidence', 'sprint', 'low-skip-risk'] }),
  T({ id: 'pt4', title: 'Full Send', artist: 'Hyperlane', bpm: 178, energy: 5, valence: 5, intensity: 5, danceability: 5, acousticness: 1, vocalDensity: 3, genres: ['edm'], moods: ['hyped'], missions: ['push_through'], explicit: false, familiarScore: 0.5, userAffinity: 0.5, skipRisk: 0.25, noveltyScore: 0.4, tags: ['anthemic', 'sprint'] }),

  // ---- recover_smoothly (lower energy/BPM, warm, no emotional crash) ----
  T({ id: 'rs1', title: 'Cooldown Lane', artist: 'Velvet Hours', bpm: 84, energy: 2, valence: 4, intensity: 1, danceability: 3, acousticness: 4, vocalDensity: 3, genres: ['soul', 'r&b'], moods: ['warm', 'soothing'], missions: ['recover_smoothly'], explicit: false, familiarScore: 0.6, userAffinity: 0.55, skipRisk: 0.12, noveltyScore: 0.25, tags: ['recovery', 'cooldown', 'warm', 'night-safe'] }),
  T({ id: 'rs2', title: 'Breathe It Out', artist: 'Hana Brook', bpm: 80, energy: 2, valence: 4, intensity: 1, danceability: 2, acousticness: 4, vocalDensity: 2, genres: ['ambient-folk'], moods: ['calm', 'warm'], missions: ['recover_smoothly'], explicit: false, familiarScore: 0.4, userAffinity: 0.45, skipRisk: 0.1, noveltyScore: 0.4, tags: ['recovery', 'cooldown', 'night-safe'] }),
  T({ id: 'rs3', title: 'Slow Exhale', artist: 'June Parade', bpm: 76, energy: 1, valence: 4, intensity: 1, danceability: 2, acousticness: 5, vocalDensity: 2, genres: ['acoustic'], moods: ['soothing', 'reflective'], missions: ['recover_smoothly'], explicit: false, familiarScore: 0.5, userAffinity: 0.5, skipRisk: 0.1, noveltyScore: 0.3, tags: ['recovery', 'cooldown', 'warm'] }),
  T({ id: 'rs4', title: 'Last Train Home', artist: 'Velvet Hours', bpm: 88, energy: 2, valence: 3, intensity: 2, danceability: 3, acousticness: 3, vocalDensity: 3, genres: ['soul'], moods: ['reflective', 'warm'], missions: ['recover_smoothly', 'mood_repair'], explicit: false, familiarScore: 0.55, userAffinity: 0.5, skipRisk: 0.15, noveltyScore: 0.3, tags: ['recovery', 'night-safe', 'rainy'] }),

  // ---- versatile / cross-mission ----
  T({ id: 'vx1', title: 'Open Window', artist: 'Coral Avenue', bpm: 114, energy: 3, valence: 4, intensity: 2, danceability: 4, acousticness: 2, vocalDensity: 3, genres: ['indie-pop'], moods: ['bright', 'easy'], missions: ['gentle_activation', 'mood_repair', 'lock_the_groove'], explicit: false, familiarScore: 0.55, userAffinity: 0.55, skipRisk: 0.15, noveltyScore: 0.35, tags: ['warm', 'steady-beat', 'low-skip-risk'] }),
  T({ id: 'vx2', title: 'Half Time', artist: 'Pulse Theory', bpm: 128, energy: 4, valence: 3, intensity: 4, danceability: 4, acousticness: 1, vocalDensity: 2, genres: ['electronic'], moods: ['driving', 'cool'], missions: ['lock_the_groove', 'push_through'], explicit: false, familiarScore: 0.5, userAffinity: 0.45, skipRisk: 0.2, noveltyScore: 0.45, tags: ['steady-beat', 'urban-run'] }),
  T({ id: 'vx3', title: 'Grey Skies, Good Coffee', artist: 'June Parade', bpm: 100, energy: 3, valence: 4, intensity: 2, danceability: 3, acousticness: 3, vocalDensity: 3, genres: ['indie-folk'], moods: ['warm', 'reflective'], missions: ['mood_repair', 'gentle_activation'], explicit: false, familiarScore: 0.6, userAffinity: 0.6, skipRisk: 0.12, noveltyScore: 0.3, tags: ['rainy', 'warm', 'low-skip-risk'] }),
  T({ id: 'vx4', title: 'Lantern', artist: 'Hana Brook', bpm: 94, energy: 2, valence: 3, intensity: 2, danceability: 2, acousticness: 4, vocalDensity: 2, genres: ['ambient-folk'], moods: ['calm', 'reflective'], missions: ['focus_flow', 'recover_smoothly'], explicit: false, familiarScore: 0.4, userAffinity: 0.45, skipRisk: 0.12, noveltyScore: 0.45, tags: ['focus', 'night-safe', 'recovery'] }),
];

export const getTrack = (id) => TRACKS.find((t) => t.id === id);
