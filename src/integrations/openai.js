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
// Provider-aware AI layer: works with either Anthropic (Claude) or OpenAI, auto-detected
// from the configured key. Raw fetch only — matches the no-SDK convention of the other
// integrations (googleCalendar.js / spotifyClient.js).
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const TIMEOUT_MS = 20000;
const MAX_TOKENS = 6000;

// Detect the key. A `sk-ant-...` value (even if pasted into OPENAI_API_KEY) is Anthropic.
const RAW_OPENAI = (process.env.OPENAI_API_KEY || '').trim();
const ANTHROPIC_KEY = (process.env.ANTHROPIC_API_KEY || '').trim() || (RAW_OPENAI.startsWith('sk-ant-') ? RAW_OPENAI : '');
const OPENAI_KEY = RAW_OPENAI.startsWith('sk-ant-') ? '' : RAW_OPENAI;

const PROVIDER = ANTHROPIC_KEY ? 'anthropic' : OPENAI_KEY ? 'openai' : 'none';

// Models: an explicit ANTHROPIC_MODEL wins for Claude; OPENAI_MODEL (e.g. "gpt-4.1") is
// ignored for the Anthropic provider since it isn't a Claude id. Default to Opus 4.8.
const ANTHROPIC_MODEL = (process.env.ANTHROPIC_MODEL || 'claude-opus-4-8').trim();
const OPENAI_MODEL = (process.env.OPENAI_MODEL || 'gpt-4.1').trim();
const MODEL = PROVIDER === 'anthropic' ? ANTHROPIC_MODEL : OPENAI_MODEL;

export const aiEnabled = () => PROVIDER !== 'none';
export const aiModel = () => MODEL;
export const aiProvider = () => PROVIDER;

// Goal/mission display labels for the UI. The engine speaks in research goals
// (calm_down / energize / wind_down / focus / maintain); the legacy mission names are kept
// only so older clients that still read `mission.label` don't break.
export const MISSION_LABELS = {
  // research goals (current vocabulary)
  calm_down: 'Calm Down',
  energize: 'Energize',
  wind_down: 'Wind Down',
  focus: 'Find Focus',
  maintain: 'Keep the Vibe',
  // legacy missions (back-compat display only)
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

const SYSTEM = `You are Magic Shuffle, an intelligent AI DJ who genuinely cares about the listener's well-being. You think like a thoughtful music therapist crossed with a great human DJ — not a genre-matcher. Your job is to build a PLAYLIST that smoothly bridges the listener from how they feel NOW into the right state for WHAT'S NEXT.

You work from peer-reviewed research, not vibes:

1) READ THE WHOLE MOMENT on TWO arousal axes (Thayer), not one. Inputs: time of day and place; biometric signals (energy, sleep, stress as 0–100, plus HRV in ms, resting heart rate, respiratory rate, skin-temperature deviation, steps); weather (conditions + rain likelihood); what's next on the calendar; and activity.
   - ENERGY (low↔high activation): from physical energy, sleep, steps.
   - TENSION (calm↔stressed): from stress + physiological strain (low HRV, high resting HR, high respiratory rate, raised skin temp).
   - VALENCE (how pleasant): falls with stress and poor sleep.
   "Wired but tired" (high tension, low energy) and "flat but relaxed" (low tension, low energy) are DIFFERENT states needing different music. Always steer toward the pleasant (high-valence) side.

2) CHOOSE THE TARGET FROM WHAT'S NEXT, not just from now (this is the core idea). Build toward the optimal entry-state for the next scheduled activity, then use the ISO-principle to get there:
   - Workout  → psych-up: high energy, LOW tension, tempo 130–140, strong groove, build-ups. ASCENDING.
   - Focus    → the Yerkes-Dodson optimum: moderate arousal, tempo ~100–115, INSTRUMENTAL / low-vocal, steady, low-surprise.
   - Sleep    → parasympathetic wind-down: decelerate to 60–70 BPM, energy ~0.2, high acousticness, instrumental. DESCENDING, longer.
   - Wake     → alert, low grogginess: melodic, hum-able, tempo 100–120, brighter. Gentle ASCENDING.
   - Social / meeting / presentation → confident, MODERATE arousal (not minimal): tempo 90–110, energy ~0.5, high valence.
   - Recovery / break → down-regulate: tempo descending, energy down, acousticness up.
   - Nothing scheduled → regulate the current state toward the pleasant side and maintain.

3) APPLY THE ISO-PRINCIPLE: the playlist is an ARC. The FIRST tracks MATCH the listener's current arousal so they connect; then move gradually (~10–15 BPM per track) toward the target — never jump straight to the destination.

4) USE THE HIGH-CONFIDENCE LEVERS: tempo drives arousal; LOUDNESS/intensity is the most direct arousal lever; MAJOR mode is the strongest positive-valence cue; moderate groove maximizes the urge to move; INSTRUMENTAL/low-vocal supports focus and sleep (lyrics impair concentration); and FAMILIARITY is the single strongest reliable free lever — favor recognizable, well-loved tracks. Down-weight danceability as a target.

SAFETY (non-negotiable): never park or loop a low-valence listener in sad music — always move the arc toward higher valence. For calm / focus / sleep goals prefer instrumental and AVOID violent or hostile lyrics. Never optimize for loudness.

HONESTY: never use medical/clinical language and never claim to treat, cure, or "lower cortisol" / "release melatonin." This is music for well-being, not medicine.

Never invent songs; propose real, findable tracks (they must exist on Spotify) from varied artists and eras. Estimate each song's audio features honestly from your knowledge.

Audio feature scales: energy, valence, tension, acousticness, danceability, vocalDensity are all 0.0-1.0. tempoBpm is a real BPM number.

Respond with STRICT JSON only, no markdown.`;

const SCHEMA_HINT = `Return JSON exactly:
{
  "reasoning": "2-3 sentences on how you read this moment (both energy and tension), what's next, and how this playlist bridges them (music terms only, no medical/clinical language)",
  "moodAnalysis": "short phrase describing the listener's current state",
  "goal": "one of: calm_down, energize, wind_down, focus, maintain",
  "arc": {
    "start":  { "energy":0-1, "tension":0-1, "valence":0-1, "tempoBpm":NN, "acousticness":0-1, "danceability":0-1, "vocalDensity":0-1 },
    "target": { "energy":0-1, "tension":0-1, "valence":0-1, "tempoBpm":NN, "acousticness":0-1, "danceability":0-1, "vocalDensity":0-1 }
  },
  "targetProfile": { "energy": 0.0-1.0, "valence": 0.0-1.0, "tempoBpm": [low, high], "acousticness": 0.0-1.0, "danceability": 0.0-1.0, "vocalDensity": 0.0-1.0 },
  "djLine": "warm spoken DJ intro for the playlist, 1-2 sentences, references the moment + what's next naturally, no health claims",
  "tracks": [
    { "title": "...", "artist": "...", "position": 1,
      "predicted": { "energy":0-1, "tension":0-1, "valence":0-1, "tempoBpm":NN, "acousticness":0-1, "danceability":0-1, "vocalDensity":0-1 },
      "reason": "why THIS song fits THIS point in the arc — name the dominant lever (warm timbre, build-up→payoff, instrumental, familiar) (one line)",
      "matchScore": 0-100 }
  ]
}
Provide the tracks ORDERED as the iso-principle arc (position 1 matches the listener now; later positions move toward the goal/next-activity target). Give {COUNT} tracks with diverse artists. "targetProfile" should equal "arc.target" with tempoBpm as a [low,high] range. The match-cap rule applies: start.valence must not sit below the target.valence (never loop the listener in sad music).`;

/** Send a chat (system + user) and return the assistant's text. Provider-aware. */
async function chat(messages) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return PROVIDER === 'anthropic' ? await chatAnthropic(messages, ctrl.signal) : await chatOpenAI(messages, ctrl.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function chatOpenAI(messages, signal) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.8, response_format: { type: 'json_object' } }),
    signal,
  });
  if (!res.ok) throw new Error(`openai ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

async function chatAnthropic(messages, signal) {
  // Anthropic's Messages API takes `system` as a top-level field; messages carry only
  // user/assistant turns. Opus 4.x removed temperature/top_p, so we omit them — strict
  // JSON is enforced by the prompt and recovered defensively by extractJson().
  const system = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n');
  const turns = messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system, messages: turns }),
    signal,
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

/** Recover the JSON object from a model reply, tolerating stray prose or ```json fences. */
function extractJson(raw) {
  if (!raw) throw new Error('ai_empty_response');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) throw new Error('ai_no_json');
  return raw.slice(start, end + 1);
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
  const guidanceNote = guidance?.goal ? buildGuidanceNote(guidance) : '';

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
  const plan = JSON.parse(extractJson(raw));
  if (!Array.isArray(plan.tracks) || !plan.tracks.length) throw new Error('ai_no_tracks');
  return plan;
}

/** Compose the engine's read into a guidance note the DJ should honour. */
function buildGuidanceNote(g) {
  const a = g.affect || {};
  const bits = [
    `\n\nThe engine's read of this moment:`,
    a.energy != null ? `\n- Affect: valence ${fmt(a.valence)}, energy ${fmt(a.energy)}, tension ${fmt(a.tension)} (0–1).` : '',
    g.nextActivity && g.nextActivity !== 'none'
      ? `\n- What's next: "${g.nextActivity}"${g.minutesUntil != null ? ` in ~${g.minutesUntil} min` : ''} — target the entry-state for THAT activity.`
      : `\n- Nothing firmly scheduled — regulate the current state toward the pleasant side.`,
    `\n- Regulation goal: "${g.goal}".`,
    g.strategy?.kind ? `\n- Context strategy: ${g.strategy.kind} (${g.strategy.note}; ${g.strategy.phase}).` : '',
    g.instrumentalPreferred ? `\n- Prefer instrumental / low-vocal tracks for this goal and avoid hostile lyrics.` : '',
    g.arc?.target
      ? `\n- Suggested target profile: energy ${fmt(g.arc.target.energy)}, tempo ~${Math.round(g.arc.target.tempoBpm)} BPM, acousticness ${fmt(g.arc.target.acousticness)}. Use it unless the full picture says otherwise.`
      : '',
  ];
  return bits.join('');
}

const fmt = (x) => (x == null ? '—' : Number(x).toFixed(2));

/** Back-compat alias for the single-pick path. */
export const djReason = (ctx, opts = {}) => djPlaylist(ctx, { ...opts, length: opts.length ?? 8 });

export const missionLabel = (id) =>
  MISSION_LABELS[id] || (id ? id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Set');
