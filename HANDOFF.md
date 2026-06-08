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
| **Research-integration plan** (file-wired steps to evolve the engine to the new model) | 📋 Planned (not built) | `docs/research-integration-plan.md` |
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
| AI-grounded mode verified live | ⚠️ Needs a real OpenAI key | `.env` currently holds an Anthropic key → deterministic fallback |
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

> Note: `OPENAI_API_KEY` must be a real **OpenAI** key (`sk-...`), not an Anthropic key —
> an invalid key just trips the deterministic fallback.

Check `GET /api/health` to see the active mode and the live-signal status.

---

## 7. Environment variables

```
OPENAI_API_KEY=        # real OpenAI key; without it the app uses the deterministic arc
OPENAI_MODEL=gpt-4.1   # default; gpt-4o also works. Verified gpt-4.1 ≈700ms, best reasoning
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
| `length` | `12` | 4–20 tracks |
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
| `currentMission` | string | no | for `keep_this_vibe` |

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

## 9. The model — affect, goal, arc (research-based)

The engine now reasons in two evidence-based steps (`src/lib/affect.js`):

1. **Affect (Russell's circumplex):** `toAffect(biometrics, timeOfDay)` maps the moment to
   **valence × arousal** (0..1). Arousal rises with energy, stress, and physiological
   strain (low HRV / high resting HR); valence falls with stress and poor sleep.
2. **Goal + arc (ISO-principle):** `regulationGoal()` picks **`calm_down` | `energize` |
   `wind_down` | `maintain`** (always steering toward high valence). `targetArc()` returns a
   `start` profile near the listener's *current* arousal and a `target` profile for the
   goal. `src/lib/isoPlaylist.js → buildArc()` then orders tracks so tempo/energy ramp
   smoothly from start → target (≈10–15 BPM/step) — the playlist *is* the therapy.

Profiles are `0.0–1.0` (energy, valence, acousticness, danceability, vocalDensity) plus a
`tempoBpm`. The research numbers (calming 60–80 BPM / energy 0.2–0.4 / high acousticness;
energizing 100–130 BPM / energy 0.7–0.9) live in `GOAL_TARGETS` in `affect.js` — tune
there. The AI prompt in `src/integrations/openai.js` encodes the same model and returns an
arc-ordered playlist; the deterministic path applies `buildArc` over the local catalog.

The legacy single-pick mission/scorer (`missions.js`, `score.js`) is kept for the older
`recommend()` shape and `/api/health` only.

> **Next evolution (specced, not yet built).** The research foundation extends this model in
> two ways: split arousal into **energy × tension** (Thayer), and choose the regulation
> **target from the *next scheduled activity*** (workout / focus / sleep / wake / social /
> recovery / maintain), not just the current state — using the ISO arc to *bridge* there.
> Time-of-day + weather modulate the target (ALIGN vs COMPENSATE), and the arc is dosed to
> the time until the next event. The unified 5-stage decision model is in
> [`docs/research/README.md`](docs/research/README.md) §2; the **file-wired migration plan**
> (phases, exact functions to touch, additive API deltas, safety guardrails) is in
> [`docs/research-integration-plan.md`](docs/research-integration-plan.md). Implement only
> when triggered — V1 still ships the single-arousal model above.

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

- **`mode: "deterministic"` unexpectedly** → `OPENAI_API_KEY` missing/invalid (must be a
  real **OpenAI** `sk-...` key, not an Anthropic key), or the AI call failed (check server
  logs for `[recommend] AI path failed`).
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
