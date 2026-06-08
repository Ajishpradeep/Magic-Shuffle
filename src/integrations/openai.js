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

const SYSTEM = `You are Magic Shuffle, an intelligent AI DJ who genuinely cares about the listener's well-being. You think like a thoughtful music therapist crossed with a great human DJ — not a genre-matcher. Your job is to build a PLAYLIST that regulates and stabilizes the listener's mood.

You work from research, not vibes:
- Read the WHOLE moment: time of day and place; biometric-style signals (energy, sleep, stress as 0–100, plus HRV in ms, resting heart rate, respiratory rate, skin-temperature deviation, steps); current weather (conditions + rain likelihood); what their calendar says is next; and activity.
- Think on Russell's CIRCUMPLEX MODEL of affect: musical valence ≈ how pleasant, musical energy/tempo ≈ arousal/activation. Low HRV + high resting HR + high stress = high arousal / low valence (wired). Low energy + low steps = low arousal (flat). Always steer toward the pleasant (high-valence) side.
- Apply the music-therapy ISO-PRINCIPLE: the playlist is an ARC. The FIRST tracks should MATCH the listener's current arousal so they connect; then gradually (about 10–15 BPM per track) move toward the goal — never jump straight to the destination.
  * Wired / stressed (high arousal, low valence) -> calm down: ramp tempo and energy DOWN toward 60–80 BPM, energy ~0.25–0.4, acousticness high, sparse vocals, warm and familiar.
  * Flat / low-energy (low arousal) -> energize: ramp UP toward 100–130 BPM, energy 0.7–0.9, valence 0.7–0.9, rhythmic, vocals fine.
  * Late night -> wind down toward sleep: 55–70 BPM, very low energy, instrumental.
  * Good / balanced -> maintain: keep mid arousal and high valence, lean on familiar/preferred music.
- Familiarity is the strongest free lever — favor recognizable, well-loved tracks. Never invent songs; propose real, findable tracks (they must exist on Spotify) from varied artists and eras. Estimate each song's audio features honestly from your knowledge.

Audio feature scales: energy, valence, acousticness, danceability, vocalDensity are all 0.0-1.0. tempoBpm is a real BPM number. Never use medical/clinical language in anything the listener sees.

Respond with STRICT JSON only, no markdown.`;

const SCHEMA_HINT = `Return JSON exactly:
{
  "reasoning": "2-3 sentences on how you read this moment and your well-being intent (music terms only, no medical/clinical language)",
  "moodAnalysis": "short phrase describing the listener's current state",
  "goal": "one of: calm_down, energize, wind_down, maintain",
  "mission": "one of: warm_start, gentle_activation, focus_flow, mood_repair, lock_the_groove, push_through, recover_smoothly, celebrate, explore_adjacent",
  "arc": {
    "start":  { "energy":0-1, "valence":0-1, "tempoBpm":NN, "acousticness":0-1, "danceability":0-1, "vocalDensity":0-1 },
    "target": { "energy":0-1, "valence":0-1, "tempoBpm":NN, "acousticness":0-1, "danceability":0-1, "vocalDensity":0-1 }
  },
  "targetProfile": { "energy": 0.0-1.0, "valence": 0.0-1.0, "tempoBpm": [low, high], "acousticness": 0.0-1.0, "danceability": 0.0-1.0, "vocalDensity": 0.0-1.0 },
  "djLine": "warm spoken DJ intro for the playlist, 1-2 sentences, references the moment naturally, no health claims",
  "tracks": [
    { "title": "...", "artist": "...", "position": 1,
      "predicted": { "energy":0-1, "valence":0-1, "tempoBpm":NN, "acousticness":0-1, "danceability":0-1, "vocalDensity":0-1 },
      "reason": "why THIS song fits THIS point in the arc (one line)",
      "matchScore": 0-100 }
  ]
}
Provide the tracks ORDERED as the iso-principle arc (position 1 matches the listener now; later positions move toward the goal). Give {COUNT} tracks with diverse artists. "targetProfile" should equal "arc.target" with tempoBpm as a [low,high] range.`;

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
 * The DJ reasons about the moment and returns the full playlist plan (see schema).
 * Throws on failure so the caller can fall back to the deterministic engine.
 *
 * @param {object} ctx listener moment
 * @param {object} [opts]
 * @param {string} [opts.action]   feedback action
 * @param {string[]} [opts.exclude] already-played "Title — Artist" strings
 * @param {number} [opts.length=12] playlist length
 * @param {object} [opts.guidance] optional { goal, arc } hint from the affect model
 */
export async function djPlaylist(ctx, { action = 'play_something', exclude = [], length = 12, guidance = null } = {}) {
  if (!aiEnabled()) throw new Error('ai_disabled');

  const actionNote =
    action && action !== 'play_something'
      ? `\nThe listener just tapped "${action}". Adjust the playlist accordingly ` +
        `(more_energy = lift the arc's energy/tempo; smooth_it_out = calmer/slower arc; surprise_me = ` +
        `bolder/less obvious picks; play_something_else = different songs, same intent).`
      : '';
  const excludeNote = exclude.length
    ? `\nDo NOT include these already-played songs: ${exclude.join('; ')}.`
    : '';
  const guidanceNote = guidance?.goal
    ? `\nA biometric read suggests the regulation goal is "${guidance.goal}". Use it unless the full picture says otherwise.`
    : '';

  const user =
    `Listener's current moment:\n${JSON.stringify(ctx, null, 2)}` +
    actionNote +
    excludeNote +
    guidanceNote +
    `\n\n${SCHEMA_HINT.replace('{COUNT}', String(length))}`;

  const raw = await chat([
    { role: 'system', content: SYSTEM },
    { role: 'user', content: user },
  ]);
  const plan = JSON.parse(raw);
  if (!Array.isArray(plan.tracks) || !plan.tracks.length) throw new Error('ai_no_tracks');
  return plan;
}

/** Back-compat alias for the single-pick path. */
export const djReason = (ctx, opts = {}) => djPlaylist(ctx, { ...opts, length: opts.length ?? 8 });

export const missionLabel = (id) =>
  MISSION_LABELS[id] || (id ? id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Set');
