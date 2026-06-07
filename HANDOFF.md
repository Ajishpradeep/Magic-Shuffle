# 🎧 Sonicstride — Smart AI DJ · Complete Handoff

> The single source of truth for this project. Product vision, architecture, the AI
> design, the hard Spotify constraints (verified), the full API contract for the
> frontend, how to run it, and the Phase-2 roadmap.

---

## 1. What it is

Sonicstride is a **Smart AI DJ for well-being**. It reads a person's current moment —
time of day, body signals (energy / sleep / stress), weather, activity, what's coming
up — and an AI DJ chooses music that *serves* them, then speaks like a warm human DJ.

It doesn't just mirror the data, it cares:
- Morning + sluggish / poor sleep → gently **lift and energize** (don't blast them awake).
- Evening / night + tired or wired → **ease down**, soothe, lower the tempo.
- High stress → never add chaos; choose **warmth and steadiness**.
- High energy + good state + workout → **drive and motivate**.
- Focus / work → **low-distraction**, low-vocal, steady.

This generalizes to any scenario — a rainy hackathon morning, a late-night wind-down, a
pre-presentation stress hour, a gym session — not a fixed set of presets.

### V1 scope (this build)
A web MVP on **mock context data**. No HealthKit or Apple Watch yet. Recommendations
are real Spotify songs when OpenAI + Spotify credentials are configured, and the app
can optionally connect a Spotify Premium user for in-browser playback via the Web
Playback SDK. Without keys it still runs locally with deterministic recommendations
and generated fallback art.

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
  "weather": "Gloomy, 60% chance of rain", "schedule": "Hackathon at 10am",
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
server.js              Express API (the only entry point)
data/
  contexts.js          5 demo context profiles (the switcher)
  tracks.js            local tagged catalog — fallback pool only
src/
  ai.js                ⭐ the AI DJ brain (reasoning + song proposal, gpt-4.1)
  spotify.js           Client-Credentials token + song verification/grounding
  recommend.js         orchestrator: AI → Spotify-verify → assemble (+ fallback)
  deriveState.js       deterministic context → user state (fallback + signals)
  missions.js          mission defs + deterministic selection (fallback)
  score.js             deterministic weighted scorer (fallback)
  feedback.js          feedback-button → target nudges (fallback)
  fallbackVoice.js     template DJ lines (fallback only)
  albumArt.js          offline SVG album-art for the fallback catalog
public/                thin REFERENCE UI (partner rebuilds the visuals)
phase2-spotify/         shelved, tested Spotify OAuth + Web Playback code (Phase 2)
.env                   secrets (gitignored)
```

---

## 6. Setup & run

```bash
cp .env.example .env      # fill in keys (see §7)
npm install
npm start                 # http://127.0.0.1:3000
```

- **With** `OPENAI_API_KEY` + Spotify creds → `mode: "ai-grounded"` (full experience).
- **Without** the OpenAI key → `mode: "deterministic"` (rules engine + template lines,
  still fully functional).

Check `GET /api/health` to see the active mode and model.

---

## 7. Environment variables

```
OPENAI_API_KEY=        # enables AI mode; without it the app uses the rules fallback
OPENAI_MODEL=gpt-4.1   # default; gpt-4o also works. Verified gpt-4.1 ≈700ms, best reasoning
PORT=3000

# Used only for Spotify grounding (Client-Credentials — no user login in V1):
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback   # Phase-2 playback only
```

---

## 8. API contract (for the frontend partner)

Base URL (dev): `http://127.0.0.1:3000`. **CORS is open (`*`)** — the UI can run on its
own dev server and call this directly. The backend is **stateless**; the UI holds
session state (what's been played, current mission) and passes it back each call.

### `GET /api/health`
```json
{ "ok": true, "service": "sonicstride", "version": 1,
  "mode": "ai-grounded", "aiEnabled": true, "aiModel": "gpt-4.1",
  "spotifyGrounding": true, "missions": [...], "feedbackActions": [...],
  "contexts": 5, "fallbackTracks": 28 }
```

### `GET /api/contexts`
Demo profiles for the context switcher.
```json
{ "contexts": [ { "id": "rainy_taipei_morning", "label": "Rainy Taipei morning",
  "energyLevel": 100, "sleepQuality": 40, "stressLevel": 40,
  "weather": "Gloomy, 60% chance of rain", "rainChance": 60,
  "schedule": "Hackathon at 10am", "timeOfDay": "Early morning",
  "location": "Taipei", "activity": "waking", "userName": "Jasmine" } ] }
```

### `POST /api/recommend` — the core call
Used for the **Play Something** tap and every feedback button.

**Request**
| field | type | required | notes |
|---|---|---|---|
| `contextId` | string | one of | id from `/api/contexts` |
| `context` | object | one of | OR a full custom snapshot (same shape) — any scenario |
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
  "mission": { "id": "gentle_activation", "label": "Gentle Activation",
               "reason": "<the DJ's well-being reasoning for this set>" },
  "targetProfile": {                     // AI-PREDICTED ideal sound (0..1 + BPM range)
    "energy": 0.35, "valence": 0.5, "tempoBpm": [85,110],
    "acousticness": 0.4, "danceability": 0.5, "vocalDensity": 0.4 },
  "dj": { "line": "Good morning Jasmine — let's ease into this rainy day…",
          "source": "ai" },             // "ai" | "template"
  "recommendation": {
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
  "backups": [ /* 2–3 more cards, same shape */ ],
  "signalsReferenced": ["energy","sleep","weather","schedule","timeOfDay"],
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

### `GET /api/tracks`
The deterministic fallback catalog (`{ "tracks": [...] }`) — debugging only.

---

## 9. The model — missions, profile, well-being rules

The AI emits a **mission** (vocabulary for the UI) and a **targetProfile** (the
predicted ideal sound). Missions: `warm_start`, `gentle_activation`, `focus_flow`,
`mood_repair`, `lock_the_groove`, `push_through`, `recover_smoothly`, `celebrate`,
`explore_adjacent`.

`targetProfile` features are `0.0–1.0` (energy, valence, acousticness, danceability,
vocalDensity) plus a `tempoBpm` range. Per-track `predicted` uses the same scales with a
single BPM. The well-being mapping (lift mornings, ease nights, calm stress, drive
workouts) lives in the AI system prompt in `src/ai.js` — tune behavior there.

The deterministic fallback (`src/score.js`) uses the documented weighted formula
(`missionFit*0.35 + energyFit*0.20 + moodFit*0.15 + contextFit*0.15 +
userFeedbackFit*0.10 + noveltyFit*0.05 − penalties`) over the local catalog.

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
- **Placeholder catalog:** `data/tracks.js` (fallback pool) is seed data — swap for a
  real licensed catalog when ready. The engine is catalog-agnostic.

---

## 12. Phase 2 roadmap

After the demo is compelling:
1. Native iOS reads **HealthKit** (with permission); watchOS streams live workout state.
2. **WeatherKit** for real weather context.
3. **Spotify Connect / Web Playback SDK** for real in-app playback (Premium users) —
   ✅ **IMPLEMENTED** (see the playback endpoints in §8 and `src/spotifyAuth.js`).
   Tracks play inside the page with real cover art; no jump to the Spotify app.
   Key facts:
   - **Authorization Code** flow, client secret server-side (`src/spotifyAuth.js`).
   - Redirect URI must be **`http://127.0.0.1:3000/callback`** exactly (loopback IP, not
     `localhost`); dev-mode apps only allow allowlisted Spotify accounts (add yours
     under the dashboard's *Users and Access*).
   - Full in-browser playback needs **Spotify Premium**; the SDK plays via
     `PUT /v1/me/player/play` on its virtual device. `preview_url` is usually null on
     this quota — the UI falls back to an "Open in Spotify" link.
   - The earlier standalone prototype still lives in `phase2-spotify/` for reference.
4. User playlists / saved tracks as the candidate pool; on-device tagging and feedback
   improve picks without depending on the deprecated Spotify feature APIs.

---

## 13. Troubleshooting

- **`mode: "deterministic"` unexpectedly** → `OPENAI_API_KEY` missing/invalid, or the AI
  call failed (check server logs for `[recommend] AI path failed`).
- **Few/no backups** → some AI-proposed songs didn't verify on Spotify; usually fine,
  occasionally rerun.
- **`400 Invalid limit` / empty Spotify results** → someone reintroduced `limit>10` or a
  `genre:"..."` filter; both are blocked on this quota (see §4).
- **Slow responses** → expected (§11); confirm it's the AI call, not the network.
```
