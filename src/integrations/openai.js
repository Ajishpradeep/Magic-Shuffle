/**
 * OpenAI chat integration — Magic Shuffle “AI DJ” planner (primary path when configured).
 * In one reasoned call it:
 *   - reads the whole moment (biometrics, weather, calendar, time, activity)
 *   - thinks like a DJ who cares about well-being (lift a sluggish morning, ease a
 *     wired night, never add chaos to stress)
 *   - PREDICTS the ideal sound profile (the audio "scales" Spotify won't give us)
 *   - names real, findable songs that embody it, each with predicted features + a
 *     reason, plus a warm spoken DJ line.
 *
 * Track audio-features are the AI's estimates from world knowledge — Spotify's
 * audio-feature/recommendation endpoints are dead for this app (verified 403/404),
 * so the model itself is the feature engine; Spotify only grounds the picks.
 */
const API_URL = 'https://api.openai.com/v1/chat/completions';
const KEY = (process.env.OPENAI_API_KEY || '').trim();
const MODEL = (process.env.OPENAI_MODEL || 'gpt-4.1').trim();
const TIMEOUT_MS = 20000;

export const aiEnabled = () => KEY.length > 0;
export const aiModel = () => MODEL;

// Missions the DJ can choose from (label is derived for the UI).
export const MISSION_LABELS = {
  warm_start: 'Warm Start',
  gentle_activation: 'Gentle Activation',
  focus_flow: 'Focus Flow',
  mood_repair: 'Mood Repair',
  lock_the_groove: 'Lock the Groove',
  push_through: 'Push Through',
  recover_smoothly: 'Recover Smoothly',
  celebrate: 'Celebrate',
  explore_adjacent: 'Explore Adjacent',
};

const SYSTEM = `You are Magic Shuffle, an intelligent AI DJ who genuinely cares about the listener's well-being. You think like a thoughtful human DJ, not a genre-matcher.

How you think:
- Read the WHOLE moment: time of day and place; **biometric-style signals** (energy, sleep, stress as 0–100); **current weather** (conditions and rain likelihood); **what their calendar says is next** (meetings, commute, focus blocks, workouts); and activity. Then decide what music actually SERVES this person right now.
- Music is a tool for well-being, so adapt with intent — do not just mirror the data:
  * Morning + low energy / poor sleep -> gently lift and energize (don't blast them awake).
  * Evening/night + tired or wired -> ease them down, soothe, lower the tempo.
  * High stress -> never add chaos; choose warmth, steadiness, gentle uplift.
  * High energy + good state + workout -> drive and motivate.
  * Focus/work -> low-distraction, low-vocal, steady.
- First reason about the ideal SOUND as audio qualities, then choose REAL songs that embody it.
- You know real songs and how they feel. Propose actual, well-known-enough-to-find tracks from varied artists and eras. Never invent songs. Avoid extremely obscure tracks (they must exist on Spotify).
- Match each song's qualities to the target. Estimate each song's audio features honestly from your knowledge.

Audio feature scales: energy, valence (positivity), acousticness, danceability, vocalDensity are all 0.0-1.0. tempoBpm is a real BPM number.

Respond with STRICT JSON only, no markdown.`;

const SCHEMA_HINT = `Return JSON exactly:
{
  "reasoning": "2-3 sentences on how you read this moment and your well-being intent (music terms, never medical/clinical language)",
  "moodAnalysis": "short phrase describing the listener's current state",
  "mission": "one of: warm_start, gentle_activation, focus_flow, mood_repair, lock_the_groove, push_through, recover_smoothly, celebrate, explore_adjacent",
  "targetProfile": { "energy": 0.0-1.0, "valence": 0.0-1.0, "tempoBpm": [low, high], "acousticness": 0.0-1.0, "danceability": 0.0-1.0, "vocalDensity": 0.0-1.0 },
  "djLine": "warm spoken DJ intro for the top song, 1-2 sentences, references the moment naturally, no health claims",
  "tracks": [
    { "title": "...", "artist": "...",
      "predicted": { "energy":0-1, "valence":0-1, "tempoBpm":NN, "acousticness":0-1, "danceability":0-1, "vocalDensity":0-1 },
      "reason": "why THIS song fits THIS moment (one line)",
      "matchScore": 0-100 }
  ]
}
Provide 8 tracks, best first, with diverse artists.`;

async function chat(messages) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`openai ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The DJ reasons about the moment and returns the full plan (see schema).
 * Throws on failure so the caller can fall back to the deterministic engine.
 */
export async function djReason(ctx, { action = 'play_something', exclude = [] } = {}) {
  if (!aiEnabled()) throw new Error('ai_disabled');

  const actionNote =
    action && action !== 'play_something'
      ? `\nThe listener just tapped "${action}". Adjust your choice accordingly ` +
        `(more_energy = lift energy/tempo; smooth_it_out = calmer/slower; surprise_me = ` +
        `bolder/less obvious picks; play_something_else = different songs, same intent).`
      : '';
  const excludeNote = exclude.length
    ? `\nDo NOT propose these already-played songs: ${exclude.join('; ')}.`
    : '';

  const user =
    `Listener's current moment:\n${JSON.stringify(ctx, null, 2)}` +
    actionNote +
    excludeNote +
    `\n\n${SCHEMA_HINT}`;

  const raw = await chat([
    { role: 'system', content: SYSTEM },
    { role: 'user', content: user },
  ]);
  const plan = JSON.parse(raw);
  if (!Array.isArray(plan.tracks) || !plan.tracks.length) throw new Error('ai_no_tracks');
  return plan;
}

export const missionLabel = (id) =>
  MISSION_LABELS[id] || (id ? id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Set');
