/**
 * interpolate.js
 *
 * Maps biometric sliders -> a musical "mood target".
 *
 * Grounded in the circumplex model of affect (Russell, 1980): emotion lives in a
 * 2D plane of VALENCE (pleasant <-> unpleasant) and AROUSAL (activated <-> calm).
 * Tempo tracks arousal; major/bright timbres track valence
 * (Gabrielsson & Lindstrom, 2010).
 *
 * Design intent: this is an affect-*regulation* engine, not an affect-*mirror*.
 * It nudges the listener toward equilibrium. High stress pulls the target into
 * calmer, gentler territory rather than piling on more intensity.
 *
 * Inputs: energy, stress, sleep  (each 0..100)
 */

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const round2 = (x) => Math.round(x * 100) / 100;

export function interpolate({ energy = 50, stress = 50, sleep = 50 } = {}) {
  const e = clamp01(energy / 100);
  const s = clamp01(stress / 100);
  const q = clamp01(sleep / 100);

  // --- circumplex coordinates ---
  // Arousal rises with physical energy & good sleep, is damped by stress
  // (we down-regulate a stressed listener instead of revving them up).
  const arousal = clamp01(0.6 * e + 0.25 * q - 0.3 * s + 0.2);
  // Valence rises with energy & good sleep, dragged down hard by stress.
  const valence = clamp01(0.35 * e + 0.4 * q - 0.45 * s + 0.3);

  // --- tempo band (BPM) tracks arousal ---
  const bpmCenter = Math.round(60 + arousal * 100); // ~60..160
  const bpmRange = [bpmCenter - 15, bpmCenter + 15];

  // --- pick genre seeds + keywords by quadrant of the valence/arousal plane ---
  const hiA = arousal >= 0.5;
  const hiV = valence >= 0.5;

  let seedGenres;
  let keywords;
  let moodLabel;
  let blurb;

  if (hiA && hiV) {
    seedGenres = ['pop', 'dance', 'funk'];
    keywords = ['upbeat', 'energetic', 'feel good'];
    moodLabel = 'Peak Flow';
    blurb = "You're firing on all cylinders — here's fuel for it.";
  } else if (hiA && !hiV) {
    seedGenres = ['electronic', 'rock', 'drum and bass'];
    keywords = ['driving', 'intense', 'focus'];
    moodLabel = 'Pressure Drive';
    blurb = 'Lots of charge under tension — channel it into something driving.';
  } else if (!hiA && hiV) {
    seedGenres = ['acoustic', 'indie', 'soul'];
    keywords = ['mellow', 'warm', 'easy'];
    moodLabel = 'Easy Glow';
    blurb = 'Calm and content — warm, unhurried tunes to match.';
  } else {
    seedGenres = ['ambient', 'piano', 'chill'];
    keywords = ['calm', 'relax', 'soft'];
    moodLabel = 'Decompress';
    blurb = 'Time to unwind — gentle, restorative sound ahead.';
  }

  // --- interaction overrides for notable corners ---
  if (s > 0.7 && e < 0.4) {
    seedGenres = ['ambient', 'chill', 'sleep'];
    keywords = ['calm', 'restorative', 'soothing'];
    moodLabel = 'Decompress';
    blurb = 'High stress, low energy — pure decompression mode.';
  }
  if (q < 0.35 && s > 0.6) {
    seedGenres = ['ambient', 'lo-fi', 'piano'];
    keywords = ['gentle', 'focus', 'instrumental'];
    moodLabel = 'Gentle Focus';
    blurb = 'Running on little sleep and high stress — gentle, lyric-light focus.';
  }
  if (e > 0.7 && q > 0.6 && s < 0.4) {
    seedGenres = ['work-out', 'dance', 'pop'];
    keywords = ['workout', 'energetic', 'pump'];
    moodLabel = 'Peak Flow';
    blurb = 'Rested and energized — go-time playlist.';
  }

  // Build a Spotify Search query string. NOTE: the `genre:"..."` filter returns
  // zero results on restricted (post-2024) app quotas, so we use plain keywords —
  // the genre name plus a couple of mood words — which reliably returns matches.
  const searchQuery = [seedGenres[0].replace(/-/g, ' '), ...keywords.slice(0, 2)]
    .join(' ')
    .trim();

  return {
    inputs: { energy, stress, sleep },
    valence: round2(valence),
    arousal: round2(arousal),
    moodLabel,
    blurb,
    seedGenres,
    keywords,
    bpmRange,
    searchQuery,
    // best-effort audio-feature targets, only usable by extended-quota apps:
    audioFeatureTargets: {
      target_energy: round2(arousal),
      target_valence: round2(valence),
      target_danceability: round2(0.5 * arousal + 0.5 * valence),
      target_tempo: bpmCenter,
      target_acousticness: round2(1 - arousal),
      target_instrumentalness: round2(clamp01(0.5 * s + 0.3 * (1 - q))),
    },
  };
}
