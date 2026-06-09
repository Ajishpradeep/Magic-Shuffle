# 🎧 Magic Shuffle — Smart AI DJ · Complete Handoff

> The single source of truth for this project. Product vision, architecture, the AI
> design, the hard Spotify constraints (verified), the full API contract for the
> frontend, how to run it, and the Phase-2 roadmap.

---

## 1. What it is

Magic Shuffle is a **personalized song picker** wrapped as a Smart AI DJ for well-being. It fuses **biometric-style signals** (energy, sleep, stress), **live-style weather** (conditions and rain likelihood), **what’s on the calendar next** (meetings, commutes, focus blocks), plus time, place, and activity — then chooses music that *serves* that exact moment, not a generic genre. The DJ speaks in a warm, human voice line.

It doesn't just mirror the data, it cares:
- Morning + sluggish / poor sleep → gently **lift and energize** (don't blast them awake).
- Evening / night + tired or wired → **ease down**, soothe, lower the tempo.
- High stress → never add chaos; choose **warmth and steadiness**.
- High energy + good state + workout → **drive and motivate**.
- Focus / work → **low-distraction**, low-vocal, steady.

This generalizes to any scenario — a rainy hackathon morning, a late-night wind-down, a
pre-presentation stress hour, a gym session — not a fixed set of presets.

### V1 scope (this build)
A web + CLI MVP that, **when triggered, returns a full ordered PLAYLIST** (~10–12
tracks) — not a single pick. The listener moment is assembled from **live signals**:

- **Weather** — live via **Open-Meteo** (free, keyless), location auto-detected from IP.
- **Calendar** — live via **Google Calendar OAuth** (read-only), with graceful fallback
  to a mock line when not configured/connected.
- **Biometrics** — still **simulated** (HealthKit / Google Health / Zepp are deliberately
  OFF). A **research-based generator** (`src/lib/generateBiometrics.js`) produces
  internally-consistent metrics — energy, stress, sleep score, **HRV, resting HR,
  respiratory rate, skin-temp deviation, steps** — all driven by one latent recovery
  factor so profiles are believable.

The playlist is built on **research, not vibes**: Russell's **circumplex model** (valence
× arousal) decides the regulation goal (calm down / energize / wind down / maintain), and
the **music-therapy ISO-principle** shapes an *arc* that starts near the listener's current
arousal and ramps tempo/energy toward the goal. See `src/lib/affect.js`, and the full
**research foundation** — neurochemistry, musical-feature mechanisms, state-transition
theory, circadian/weather modulators, and clinical evidence + safety, all citation-backed
and independently fact-checked — with the unified decision model in
**[`docs/research/README.md`](docs/research/README.md)** (physiology baseline:
[`music-wellness-research.md`](docs/research/music-wellness-research.md); the five sourced
pillars in [`docs/research/sources/`](docs/research/sources/)).
Recommendations
are real Spotify songs when OpenAI + Spotify credentials are configured; without keys it
runs locally with a deterministic arc over the local catalog and generated art.

**Trigger it two ways:** `npm run shuffle` (CLI) or `GET /api/playlist` (web).

---

## 1b. Project progress

| Area | Status | Where |
|---|---|---|
| Physiology briefing (ISO-principle, circumplex, biometric ranges) | ✅ Done | `docs/research/music-wellness-research.md` |
| **Research foundation** (neurochemistry · musical features · transitions/priming · circadian/weather · clinical/safety) | ✅ Done | `docs/research/README.md` + `docs/research/sources/01–05` |
| Citation verification pass (every source fact-checked; corrections applied) | ✅ Done | `docs/research/sources/verification/` |
| **Research-integration plan** (file-wired steps to evolve the engine to the new model) | ✅ Built (P0–P5) | `docs/research-integration-plan.md` |
| **Two-axis affect** (valence × energy × tension, Thayer) | ✅ Done | `src/lib/affect.js → toAffect` |
| **Goal from the NEXT activity** (workout/focus/sleep/wake/social/commute/recovery) — the headline thesis | ✅ Done | `src/lib/activityClassifier.js`, `src/data/activityTargets.js`, `affect.js → selectGoal` |
| **Circadian baseline + weather modulator** (ALIGN/COMPENSATE) | ✅ Done | `src/lib/circadian.js` |
| **Time-dosed arc** (length from time-until-event) | ✅ Done | `src/lib/isoPlaylist.js → doseLength` |
| **Safety guardrails** (no sad-loop, block list, lyric/volume guidance, wellness-only copy) | ✅ Done | `src/lib/safety.js` |
| Research-based mock biometric generator (energy, stress, sleep, **HRV, RHR, resp, skin-temp, steps**) | ✅ Done | `src/lib/generateBiometrics.js` · `npm run gen:biometrics` |
| Affect engine — circumplex + goal selection + ISO target arc | ✅ Done | `src/lib/affect.js` |
| ISO playlist builder (smooth tempo/energy arc ordering) | ✅ Done | `src/lib/isoPlaylist.js` |
| Live weather (Open-Meteo, keyless) + IP geolocation | ✅ Done | `src/integrations/weather.js`, `geolocation.js` |
| Google Calendar OAuth (read-only) + graceful mock fallback | ✅ Done | `src/integrations/googleCalendar.js` |
| Live context assembly (fuse all signals into a moment) | ✅ Done | `src/services/buildContext.js` |
| Full **playlist** output (arc) — CLI + `GET /api/playlist` | ✅ Done | `scripts/shuffle.js`, `src/app.js` |
| AI planner upgraded to emit an arc-ordered playlist | ✅ Done | `src/integrations/openai.js` |
| Back-compat: `/api/recommend` + tests still green | ✅ Done | `npm test` (3/3) |
| Biometrics from **Google Health / Zepp** | ⛔ OFF (by request) | stubs in `src/integrations/biometrics.js` |
| **AI provider: Anthropic (Claude) OR OpenAI** — auto-detected from the key | ✅ Done | `src/integrations/openai.js` (`aiProvider()`); raw `fetch`, no SDK |
| AI-grounded mode verified live | ⚠️ Needs a **valid** key | the `.env` Anthropic key returns 401 (`invalid x-api-key`) → falls back to deterministic. Drop in a valid `sk-ant-api…` key to enable `ai-grounded` |
| Native HealthKit / WeatherKit / real in-app playback polish | 🔜 Phase 2 | see §12 |

**Verified:** weather returns real Open-Meteo data; goal switching is correct across
stressed-AM (calm), flat-afternoon (energize), balanced (maintain), late-night (wind-down);
mock biometrics are internally consistent; all endpoints respond; `npm test` passes.

---

## 2. Demo flow

1. Open the app → see an AI-DJ surface with a (secondary) context panel.
2. Pick a demo context from the switcher (or it uses the hero: rainy Taipei morning).
3. Tap **Play Something** → "Reading the room…" loading state.
4. The AI reasons, predicts a sound profile, and picks real songs.
5. A track card appears: album art, title, artist, year, **match score**, the DJ's
   reason, and the predicted audio-feature bars. A warm **DJ line** plays above it.
6. Tune the next pick with **More Energy / Smooth It Out / Surprise Me / Keep This
   Vibe / Play Something Else**.

**Hero scenario (the one to polish first):**
```json
{ "energyLevel": 100, "sleepQuality": 40, "stressLevel": 40,
  "weather": "Gloomy, 60% chance of rain", "calendar": "Hackathon at 10am",
  "timeOfDay": "Early morning", "location": "Taipei" }
```
Expected read: *rainy morning, poor sleep, good energy, mild pressure → gentle
activation, warm lift, not aggressive.* (Verified: picks Coffee / beabadoobee, Come
Away With Me / Norah Jones, Banana Pancakes / Jack Johnson.)

---

## 3. Architecture — AI-first

The AI is the **decision-maker**, not a fallback. Every request:

```
context snapshot
   │
   ▼
1. AI DJ (OpenAI gpt-4.1) reasons about the whole moment + well-being intent
   └─ outputs: reasoning, mission, PREDICTED target sound profile,
      a warm DJ line, and ~8 REAL songs (each with predicted features + a reason)
   │
   ▼
2. Spotify grounding (Client-Credentials, no user login)
   └─ verify each proposed song → real album art, URI, link, year, duration
      (drops any that don't resolve)
   │
   ▼
3. Assemble → top pick + 2–3 backups, sorted by the AI's match score
   │
   └─ EMERGENCY FALLBACK ONLY (AI key missing / network down / no songs verified):
      deterministic rules engine over a local tagged catalog, so it never hard-fails.
```

### Where the AI sits, and why
- **Interpretation + curation is the AI's job** — judgment and music knowledge are
  exactly what an LLM is good at. It predicts the ideal audio profile *and* names songs
  that fit it.
- **Spotify is only grounding** — it confirms songs exist and supplies real art/links.
- **Scoring in the fallback is deterministic and explainable** — used only when the AI
  can't run, so the app degrades instead of breaking.

---

## 4. The hard Spotify constraint (verified — read this before "improving" it)

This app's Spotify quota is heavily restricted. Probed live against the credentials:

| Endpoint / field | Status | Consequence |
|---|---|---|
| `GET /v1/audio-features` | **403** | No per-track energy/valence/tempo from Spotify |
| `GET /v1/recommendations` | **404** | Can't search by audio-feature targets |
| `GET /v1/recommendations/available-genre-seeds` | **404** | No genre seeds |
| artist `.genres`, track `.popularity` | **stripped** | Not returned for this app |
| `GET /v1/search` `limit` | **capped at 10** | `limit>10` → `400 Invalid limit` |
| `genre:"..."` search filter | **returns 0** | Use plain keyword queries instead |
| `GET /v1/search` (basic) + album art + uri | **works** | This is what we rely on |

**Implication:** the original idea — *"search Spotify by energy/valence range and read
each song's feature scales"* — is **impossible for this app**. Spotify deprecated those
endpoints (Nov 2024) for new/standard-quota apps and won't restore them without a
commercial review.

**How we solve it:** the **AI** predicts the target profile *and* estimates each song's
audio features from world knowledge (it knows what "Weightless" or "Eye of the Tiger"
feel like). Spotify is used purely to ground picks in real, playable songs. Net result
is what was wanted — songs matched to a predicted mood profile via metadata reasoning —
achieved within the real API limits. Per-track features carry `featureSource:
"ai-estimate"` to make this explicit.

---

## 5. Repo layout

```
src/
  server.js              process entry (listen)
  app.js                 Express factory — routes + static `public/`
  middleware/
    cors.js              loopback + env allow-list CORS
  data/
    contexts.js          demo listener-moment profiles (switcher)
    tracks.js            local tagged catalog (deterministic pool)
  integrations/
    openai.js            AI DJ planner — arc-ordered playlist (Chat Completions + JSON)
    spotifyClient.js     client-credentials token + track search/verify
    spotifyUserAuth.js   Spotify user OAuth + Web Playback helpers
    weather.js           live weather (Open-Meteo, keyless)
    geolocation.js       IP-based location (keyless) for weather
    googleCalendar.js    Google Calendar OAuth (read-only) + graceful fallback
    biometrics.js        provider switch (mock | google_health/zepp = OFF stubs)
  services/
    recommend.js         recommendPlaylist: AI → verify → arc (+ deterministic fallback)
    buildContext.js      assembleLiveContext() — fuse live signals into a moment
  lib/
    generateBiometrics.js  research-based mock biometric generator (latent-r model)
    affect.js            circumplex affect + ISO-principle target arc
    isoPlaylist.js       buildArc() — order candidates into a smooth arc
    listenerContext.js   calendarSummary() and moment helpers
    deriveListenerState.js   rule-based state + signalsReferenced
    missions.js          legacy mission defs + deterministic selection
    score.js             weighted scorer + rankTracks (legacy single-pick)
    feedback.js          feedback actions → target nudges
    fallbackVoice.js     template DJ lines (fallback)
    albumArt.js          SVG placeholders for catalog art
scripts/
  shuffle.js             CLI trigger → prints a live playlist (npm run shuffle)
  generate-biometrics.js CLI → prints mock biometric profiles (npm run gen:biometrics)
public/                  SPA (reference UI; hits all APIs)
docs/design/             design + engine notes (legacy prototype spec)
.env                     secrets (gitignored)
```

---

## 6. Setup & run

```bash
cp .env.example .env      # fill in keys (see §7) — weather works with NO keys
npm install
npm start                 # web app → http://127.0.0.1:3000

npm run shuffle           # CLI trigger → prints a live playlist
npm run gen:biometrics    # prints a research-based mock biometric profile
```

- **With** `OPENAI_API_KEY` + Spotify creds → `mode: "ai-grounded"` (full experience).
- **Without** the OpenAI key → `mode: "deterministic"` (arc over local catalog + template
  lines, still fully functional).
- **Weather** needs no key (Open-Meteo). **Google Calendar** is optional — connect at
  `/google/login`; without it the calendar falls back to a mock line.

> Note: the AI DJ works with **either Anthropic (Claude) or OpenAI**, auto-detected from the
> key (`src/integrations/openai.js`). An `sk-ant-…` key uses the Anthropic Messages API
> (default model `claude-opus-4-8`); an `sk-…` key uses OpenAI (`gpt-4.1`). An invalid key
> just trips the deterministic fallback. `GET /api/health` shows the active `aiProvider`.

Check `GET /api/health` to see the active mode and the live-signal status.

---

## 7. Environment variables

```
# AI DJ — set ONE provider (auto-detected). Without any key, the deterministic arc runs.
ANTHROPIC_API_KEY=     # Claude key (sk-ant-api…) — recommended; a Claude key in OPENAI_API_KEY is also detected
ANTHROPIC_MODEL=claude-opus-4-8   # default Claude model
OPENAI_API_KEY=        # OpenAI key (sk-…) — alternative provider
OPENAI_MODEL=gpt-4.1   # default OpenAI model
PORT=3000

# Spotify grounding (Client-Credentials — no user login needed for search/verify):
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback   # in-app playback only

# Weather: Open-Meteo is FREE + KEYLESS. Location auto-detected from IP; optional override:
DEFAULT_LOCATION=                                       # e.g. "Taipei"

# Biometrics: V1 only ships the mock generator; google_health/zepp are OFF stubs.
BIOMETRIC_PROVIDER=mock

# Google Calendar (read-only; optional — falls back to mock when unset):
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://127.0.0.1:3000/google/callback
```

**Google Calendar setup:** in Google Cloud → create an OAuth client (type *Web
application*), enable the **Calendar API**, add the redirect URI above under *Authorized
redirect URIs*, and add your account as a *test user* on the consent screen. Then visit
`/google/login` once to connect.

---

## 8. API contract (for the frontend partner)

Base URL (dev): `http://127.0.0.1:3000`. **CORS is open (`*`)** — the UI can run on its
own dev server and call this directly. The backend is **stateless**; the UI holds
session state (what's been played, current mission) and passes it back each call.

### `GET /api/health`
```json
{ "ok": true, "service": "magic-shuffle", "version": 1,
  "mode": "ai-grounded", "aiEnabled": true, "aiModel": "gpt-4.1",
  "spotifyGrounding": true, "playback": true,
  "signals": { "weather": "open-meteo", "calendar": "mock", "biometrics": "mock" },
  "missions": [...], "feedbackActions": [...],
  "contexts": 5, "fallbackTracks": 28 }
```

### `GET /api/playlist` — the LIVE trigger ⭐
Assembles a live moment (real weather + Google calendar/mock + generated biometrics +
clock time + IP location), then returns a full **arc-ordered playlist**.

| query | default | notes |
|---|---|---|
| `name` | `"You"` | listener name used in the DJ line |
| `length` | *(dosed)* | 4–20 tracks. **Omit** → arc length is dosed to the time until the next event |
| `block` | — | comma-separated permanent block list |
| `action` | `play_something` | any `feedbackActions` value |

Response is the same body as `POST /api/recommend` (below) **plus** a `sources` object
showing where each signal came from, e.g.
`{ "biometrics":"mock", "weather":"open-meteo", "calendar":"mock_unconfigured", "location":"ip" }`.

### `GET /api/contexts`
Demo profiles for the context switcher.
```json
{ "contexts": [ { "id": "rainy_taipei_morning", "label": "Rainy Taipei morning",
  "energyLevel": 100, "sleepQuality": 40, "stressLevel": 40,
  "weather": "Gloomy, 60% chance of rain", "rainChance": 60,
  "calendar": "Hackathon at 10am", "timeOfDay": "Early morning",
  "location": "Taipei", "activity": "waking", "userName": "Jasmine" } ] }
```

### `POST /api/recommend` — the core call
Used for the **Play Something** tap and every feedback button.

**Request**
| field | type | required | notes |
|---|---|---|---|
| `contextId` | string | one of | id from `/api/contexts` |
| `context` | object | one of | Full listener moment: biometrics (`energyLevel`, `sleepQuality`, `stressLevel`), `weather`, `rainChance`, **`calendar`** (next block / event; legacy field **`schedule`** is treated the same), `timeOfDay`, `location`, `activity`, `userName`, … |
| `action` | string | no | a `feedbackActions` value; default `play_something` |
| `exclude` | string[] | no | already-played songs as `"Title — Artist"` strings |
| `block` | string[] | no | **permanent** block list (titles, `"Title — Artist"`, ids, or genre/keyword substrings) — honored on both paths |
| `length` | number | no | explicit track count (4–20). **Omit** to let the arc be dosed to the time until the next event |
| `currentMission` | string | no | for `keep_this_vibe` |

The `context` object may also carry **`nextEvent { summary, startISO, minutesUntil, allDay }`**
and **`nextActivity`** (one of `workout | focus | sleep | wake | social | commute | recovery |
none`). If absent, the engine classifies the `calendar` string itself.

```jsonc
{ "contextId": "rainy_taipei_morning" }
{ "contextId": "rainy_taipei_morning", "action": "more_energy",
  "exclude": ["Coffee — beabadoobee"], "currentMission": "gentle_activation" }
```

**Response** (`mode: "ai-grounded"`)
```jsonc
{
  "context": { /* snapshot used */ },
  "state": {
    "moodAnalysis": "Waking up groggy on a grey morning, needs a gentle lift",
    "reasoning": "It's a gloomy rainy morning and Jasmine is waking with low sleep…",
    "energyNeed": "high", "vocalTolerance": "lyrics_ok", "contextRisk": "normal"
  },
  "goal": "calm_down", "goalLabel": "Calm down",   // regulation goal (circumplex)
  "mission": { "id": "calm_down", "label": "Calm down",
               "reason": "<the DJ's well-being reasoning for this set>" },
  "arc": {                               // ISO-principle: start near them → ramp to target
    "goal": "calm_down",
    "start":  { "energy": 0.55, "valence": 0.5, "tempoBpm": 104, "acousticness": 0.5, "danceability": 0.5, "vocalDensity": 0.4 },
    "target": { "energy": 0.32, "valence": 0.65, "tempoBpm": 70, "acousticness": 0.75, "danceability": 0.4, "vocalDensity": 0.35 } },
  "targetProfile": {                     // = arc.target (0..1 + BPM range), shown as bars
    "energy": 0.32, "valence": 0.65, "tempoBpm": [58,82],
    "acousticness": 0.75, "danceability": 0.4, "vocalDensity": 0.35 },
  "dj": { "line": "Good morning Jasmine — let's ease into this rainy day…",
          "source": "ai" },             // "ai" | "template"
  "playlist": [ /* the full ORDERED arc (~10–12 cards, same shape as below) */ ],
  "recommendation": {                    // = playlist[0] (back-compat)
    "id": "429NtPmr12aypzFH3FkN9l",      // real Spotify track id
    "title": "Coffee", "artist": "beabadoobee",
    "albumArt": "https://i.scdn.co/image/…",              // REAL cover (data-URI in fallback)
    "spotifyUrl": "https://open.spotify.com/track/…",
    "spotifyUri": "spotify:track:429NtPmr12aypzFH3FkN9l", // for Phase-2 playback
    "previewUrl": null, "year": "2020", "durationMs": 184000, "explicit": false,
    "mission": "gentle_activation",
    "predicted": { "energy": 0.35, "valence": 0.5, "tempoBpm": 94,
                   "acousticness": 0.7, "danceability": 0.45, "vocalDensity": 0.45 },
    "vibe": "94 BPM · energy 35% · positivity 50%",
    "matchScore": 98,                    // 0–100, show on the card
    "reason": "Warm, soft acoustic textures evoke a cozy morning…",
    "featureSource": "ai-estimate"       // "catalog" in deterministic mode
  },
  "backups": [ /* playlist[1..3] (back-compat) */ ],
  "signalsReferenced": ["energy","sleep","weather","calendar","timeOfDay"],
  "ai": { "enabled": true, "model": "gpt-4.1", "mode": "ai-grounded",
          "interpret": "ai", "voice": "ai" }
}
```
`mode: "deterministic"` returns the identical shape; only the source differs
(`albumArt` is a generated SVG data-URI, `spotifyUri` null, `featureSource: "catalog"`).

**Additive fields (research-grade engine).** Everything above is unchanged for back-compat;
these are *added* to the response:
```jsonc
{
  "state": { "affect": { "valence": 0.32, "energy": 0.48, "tension": 0.57, "arousal": 0.52 } },
  "nextActivity": "sleep",            // the activity that drove the goal ("none" = current-state)
  "activityLabel": "Wind-down to sleep",
  "strategy": { "kind": "compensate", // "align" | "compensate" (weather/circadian)
                "note": "lifting a grey sky", "phase": "evening peak" },
  "dose": { "tracks": 12, "minutes": 42 },   // arc dosed to time-until-next-event
  "arc": { "direction": "descending" },       // added alongside start/target
  "safety": { "volumeNotice": "Keep it comfortable …", "instrumentalPreferred": true }
}
```
`GET /api/health` also gains a `model` block (`affectAxes`, `goals`, `activities`,
`nextActivityTargeting`, `circadianWeather`, `timeDosedArc`, `safetyGuardrails`) and a `goals`
array (the live vocabulary; `missions` is retained for legacy display only).

**Feedback buttons → `action`**
| button | action | effect |
|---|---|---|
| Play Something | `play_something` | fresh set for the context |
| More Energy | `more_energy` | AI lifts energy/tempo |
| Smooth It Out | `smooth_it_out` | AI calms it down |
| Surprise Me | `surprise_me` | bolder / less obvious picks |
| Keep This Vibe | `keep_this_vibe` | same mission, new songs |
| Play Something Else | `play_something_else` | different songs, same intent |

Always pass the running `exclude` list so songs don't repeat. `public/app.js` shows the
full pattern.

**Errors:** `400 unknown_context`, `500 recommend_failed`. AI/Spotify hiccups do **not**
error — they fall back silently.

### In-app playback (Spotify Web Playback SDK)
Full tracks play **inside the web app** (no jump to the Spotify app), with real cover
art. Requires the user to connect Spotify and have **Premium** (SDK requirement).

| route | purpose |
|---|---|
| `GET /login` | redirect to Spotify authorize (Authorization Code, scope `streaming` + playback) |
| `GET /callback` | exchanges the code, stores tokens server-side, redirects to `/` |
| `GET /api/session` | `{ loggedIn, accessToken, profile:{product,country,display_name} }` — the SDK needs `accessToken` in the browser |
| `POST /api/logout` | clears the in-memory token store |
| `PUT /api/play` | body `{ uri, deviceId }` → starts the track on the SDK device (proxies `PUT /v1/me/player/play`) |

Frontend flow (see `public/app.js`): load `/api/session` → init `Spotify.Player`
(`sdk.scdn.co/spotify-player.js`) → on `ready` capture `device_id` → the card's **Play
in app** button calls `PUT /api/play` with the track's `spotifyUri` + `device_id`.
**Fallback ladder** for non-Premium / failures: full track → 30s `previewUrl` (often
null) → "Open in Spotify" link. `client secret` stays server-side; only the short-lived
access token reaches the browser.

### Google Calendar (read-only OAuth)
Connects a real calendar so `/api/playlist` knows what's next. Graceful fallback: if
unconfigured/disconnected, every read returns null and the context uses a mock line.

| route | purpose |
|---|---|
| `GET /google/login` | redirect to Google consent (scope `calendar.readonly`); 302s to `/?error=google_not_configured` if creds unset |
| `GET /google/callback` | exchanges the code, stores tokens server-side, redirects to `/?google=connected` |
| `GET /api/google/session` | `{ loggedIn, configured, email? }` |
| `POST /api/google/logout` | clears the in-memory Google token store |

### `GET /api/tracks`
The deterministic fallback catalog (`{ "tracks": [...] }`) — debugging only.

---

## 9. The model — affect, goal, arc (research-based, 5-stage)

The engine implements the unified 5-stage decision model from
[`docs/research/README.md`](docs/research/README.md) §2 (P0–P5 of the integration plan):

1. **Affect — three axes (`src/lib/affect.js → toAffect`).** Maps the moment to **valence ×
   energy × tension** (0..1). Arousal is **split** (Thayer): *energy* from energy/sleep/steps;
   *tension* from stress + physiological strain (low HRV, high RHR, high respiratory rate,
   raised skin-temp). `arousal` is kept as a derived blend (`0.6·energy + 0.4·tension`) for
   back-compat. So "wired but tired" and "flat but relaxed" are now distinct, correct states.
2. **Goal from the NEXT activity (`activityClassifier.js` + `data/activityTargets.js` +
   `affect.js → selectGoal`).** The headline thesis: the regulation **target is the optimal
   entry-state for what's next** — `workout | focus | sleep | wake | social | commute |
   recovery`, each with its own target profile and arc direction (`data/activityTargets.js`).
   When no activity is confidently scheduled (confidence < 0.5), it falls back to current-state
   selection — **`calm_down | energize | wind_down | focus | maintain`** — never worse than the
   old behavior.
3. **Circadian + weather modulator (`src/lib/circadian.js`).** Nudges the *target* (not the
   read): the body's circadian baseline (morning rise → late-morning peak → afternoon dip →
   evening peak → night trough) and an **ALIGN/COMPENSATE** weather bias (dark→lift, heat→soothe;
   barometric/humidity ignored). Circadian outranks weather.
4. **ISO arc + dosing (`src/lib/isoPlaylist.js`).** `buildArc()` selects tracks that cover the
   start→target range, then **orders them monotonically** along the arc so tempo/energy ramp
   smoothly. `doseLength()` sets the playlist length from the **time until the next event**
   bounded by the activity's evidence-based session length (short workout/social primers; long
   25–45 min sleep wind-downs).
5. **Safety (`src/lib/safety.js`).** `capMatch` floors the start valence and guarantees the arc
   moves toward higher valence (never loop a low-valence user in sad music); `filterBlocked`
   honors a per-request `block` list; `lyricGuard` prefers instrumental for calm/focus/sleep;
   `volumeNotice` carries WHO safe-listening copy. No medical/treatment/cure claims anywhere.

Profiles are `0.0–1.0` (energy, valence, **tension**, acousticness, danceability, vocalDensity)
plus a `tempoBpm`. Per-activity targets live in `data/activityTargets.js`; current-state targets
in `GOAL_TARGETS` (`affect.js`) — tune there. Both engines obey the same model: the AI prompt in
`src/integrations/openai.js` encodes it and returns an arc-ordered playlist; the deterministic
path applies the same `targetArc`/`buildArc`/dosing/safety over the local catalog.

The legacy single-pick mission/scorer (`missions.js`, `score.js`) is kept for the older
`recommend()` shape and `/api/health` only; the live goal vocabulary is the five goals above.

> **Deferred (P6, optional).** A `POST /api/checkin` validation endpoint (pre/post single-item
> valence/arousal to *measure*, not claim, effect) and a per-user personalization baseline
> interface are specced in [`docs/research-integration-plan.md`](docs/research-integration-plan.md)
> §Phase 6 but intentionally not built in this pass.

---

## 10. Reference UI (for the partner)

`public/` is a **working reference, not a design** — it hits every endpoint and renders
every component the product needs: context switcher, context panel, DJ speech bubble,
the DJ's reasoning, mission badge, predicted-profile bars, track card (art, match score,
reason, feature bars), simulated playbar, feedback controls, and backups. Rebuild the
visuals freely; keep the data flow in `public/app.js` as the contract reference.

Make the first screen the **DJ experience**, not a landing page. Music-native and
premium (dark, album art, motion). Biometrics visible but secondary. Avoid medical
language — the DJ speaks in music terms.

---

## 11. Known tradeoffs

- **Latency:** the AI path is ~6–10s (reasoning + verifying ~8 songs in parallel). The
  "Reading the room…" state covers it. Options if needed: stream the DJ line first, or
  cut to 5 proposed songs. Deterministic mode is near-instant.
- **AI-estimated features:** per-track energy/valence/etc. are the model's estimates, not
  Spotify's (which are unavailable — see §4). Good for well-known songs; weaker for
  obscure ones, which is why the prompt asks for findable tracks.
- **Placeholder catalog:** `src/data/tracks.js` (fallback pool) is seed data — swap for a
  real licensed catalog when ready. The engine is catalog-agnostic.

---

## 12. Phase 2 roadmap

After the demo is compelling:
1. **Real biometrics** — wire `BIOMETRIC_PROVIDER=google_health` / `zepp` (currently OFF
   stubs in `src/integrations/biometrics.js`); native iOS could read **HealthKit** /
   watchOS. The mock generator stays as the offline/dev fallback.
2. **Weather** — ✅ **IMPLEMENTED** via Open-Meteo (keyless, IP-located). Swap to
   **WeatherKit** later if precise/native weather is wanted.
   **Calendar** — ✅ **IMPLEMENTED** via Google Calendar OAuth (read-only) with graceful
   mock fallback (`src/integrations/googleCalendar.js`).
3. **Spotify Connect / Web Playback SDK** for real in-app playback (Premium users) —
   ✅ **IMPLEMENTED** (see the playback endpoints in §8 and `src/integrations/spotifyUserAuth.js`).
   Tracks play inside the page with real cover art; no jump to the Spotify app.
   Key facts:
   - **Authorization Code** flow, client secret server-side (`src/integrations/spotifyUserAuth.js`).
   - Redirect URI must be **`http://127.0.0.1:3000/callback`** exactly (loopback IP, not
     `localhost`); dev-mode apps only allow allowlisted Spotify accounts (add yours
     under the dashboard's *Users and Access*).
   - Full in-browser playback needs **Spotify Premium**; the SDK plays via
     `PUT /v1/me/player/play` on its virtual device. `preview_url` is usually null on
     this quota — the UI falls back to an "Open in Spotify" link.
4. User playlists / saved tracks as the candidate pool; on-device tagging and feedback
   improve picks without depending on the deprecated Spotify feature APIs.

---

## 13. Troubleshooting

- **`mode: "deterministic"` unexpectedly** → no valid AI key (`ANTHROPIC_API_KEY` or
  `OPENAI_API_KEY`), or the AI call failed. A `401 invalid x-api-key` in the logs means the
  Anthropic key is expired/revoked/wrong-workspace — swap in a valid `sk-ant-api…` key. Check
  server logs for `[recommend] AI path failed`. `GET /api/health` shows `aiProvider`/`aiModel`.
- **Calendar shows a mock line** → Google not configured/connected. Set `GOOGLE_*` and
  visit `/google/login`. `GET /api/google/session` shows `{ loggedIn, configured }`.
- **Weather looks wrong / wrong city** → IP geolocation is approximate; set
  `DEFAULT_LOCATION` to pin it.
- **Few/no backups** → some AI-proposed songs didn't verify on Spotify; usually fine,
  occasionally rerun.
- **`400 Invalid limit` / empty Spotify results** → someone reintroduced `limit>10` or a
  `genre:"..."` filter; both are blocked on this quota (see §4).
- **Slow responses** → expected (§11); confirm it's the AI call, not the network.
```
