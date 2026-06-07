# Magic Shuffle

**Magic Shuffle** is a **personalized song picker**: it looks at **you**—how your body and mind are doing, **what the sky is doing**, and **what your day says is next**—then picks a track (and a few alternates) that fits that exact moment, with a short DJ-style line explaining why it fits.

### What goes into a pick

| Signal | What it represents in code | Production idea |
|--------|------------------------------|-------------------|
| **Biometrics** | `energyLevel`, `sleepQuality`, `stressLevel` (0–100 each) | Wearable / HealthKit–style readiness and stress |
| **Weather** | `weather` (text) + `rainChance` (0–100) | WeatherKit or a weather API for *right now* |
| **Calendar** | `calendar` — next commitment or block summary (`schedule` still accepted as a legacy alias) | System calendar sync |
| **Situation** | `timeOfDay`, `location`, `activity`, `userName` | Clock, place, mode (commute, focus, workout, …) |

The AI path (`src/integrations/openai.js`) receives the **full context object as JSON** and is instructed to reason across all of it. The deterministic path (`src/lib/deriveListenerState.js`, `src/lib/missions.js`, `src/lib/score.js`) uses the same fields so the app **behaves consistently** whether or not API keys are set.

This repo is a **Node + Express** backend plus a **single-page UI** in `public/`. Demo rows live in `src/data/contexts.js`; they mirror the shape above so swapping in real Health, Weather, and Calendar data later is straightforward (`src/lib/listenerContext.js` normalizes the calendar field).

---

## How it runs

1. **AI-grounded (when OpenAI + Spotify app credentials are set)** — The model reasons like a DJ, names **real** tracks; Spotify verifies URIs, art, and links. Optional **user login** + **Web Playback SDK** for full in-browser playback (Premium).
2. **Deterministic fallback (no keys)** — Same context shape drives mission choice + catalog scoring so you always get a coherent pick for demos and dev.

---

## Features

- **Listener-moment model** — Biometrics + weather + calendar + activity; see `src/data/contexts.js` and `src/lib/listenerContext.js`.
- **Derived state** — `src/lib/deriveListenerState.js` turns raw signals into energy need, mood, vocal tolerance, context risk, and `signalsReferenced` (including `calendar` when relevant).
- **Missions** — Explainable sound targets in `src/lib/missions.js` (calendar text influences “work-like” focus detection).
- **Feedback** — “More energy”, “smooth it out”, etc. (`src/lib/feedback.js`).
- **Spotify** — `src/integrations/spotifyClient.js` grounds picks; `src/integrations/spotifyUserAuth.js` handles optional playback.

---

## Requirements

- **Node.js 18+**
- **OpenAI API key** — optional; without it the deterministic engine + template DJ lines run.
- **Spotify Developer app** — optional for search/verify; user OAuth optional for playback.

---

## Quick start

```bash
cp .env.example .env
# Edit .env: OPENAI_API_KEY, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET as needed

npm install
npm start
```

Open **http://127.0.0.1:3000** (or your `PORT`).

- **Dev with auto-restart:** `npm run dev`
- **Tests:** `npm test`

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Enables the AI DJ + JSON plan (tracks, DJ line, mission). |
| `OPENAI_MODEL` | Chat model (default `gpt-4.1`). |
| `PORT` | HTTP port (default `3000`). |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | App-only API access to search/verify tracks; required for AI-grounded mode. |
| `SPOTIFY_REDIRECT_URI` | Must match your Spotify app redirect URI (default `http://127.0.0.1:3000/callback`). |
| `CORS_ORIGINS` | Comma-separated extra allowed origins; loopback frontends are allowed by default. |

Never commit `.env`. It is listed in `.gitignore`.

---

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Service meta, flags for AI / Spotify / playback, mission IDs, context count. |
| `GET` | `/api/contexts` | List of demo listener-moment objects. |
| `GET` | `/api/tracks` | Local fallback catalog (debug / UI). |
| `POST` | `/api/recommend` | Body: `context` or `contextId` (full moment: biometrics, weather, calendar, …), optional `action`, `exclude`, `lastArtist`, `currentMission`. |
| `GET` | `/api/session` | Spotify user session when logged in. |
| `POST` | `/api/logout` | Clear Spotify session. |
| `PUT` | `/api/play` | Body: `uri`, `deviceId` — Web Playback SDK device. |
| `GET` | `/login` | Start Spotify OAuth (if playback is configured). |
| `GET` | `/callback` | OAuth redirect handler. |

Full contract and edge cases: **`HANDOFF.md`**.

---

## Project layout

```
├── public/                 # SPA + Web Playback SDK
├── src/
│   ├── server.js           # Process entry (listen)
│   ├── app.js              # Express app factory — routes + static files
│   ├── middleware/
│   │   └── cors.js         # CORS for loopback + CORS_ORIGINS
│   ├── data/
│   │   ├── contexts.js     # Demo listener moments
│   │   └── tracks.js       # Local catalog (deterministic pool)
│   ├── integrations/
│   │   ├── openai.js       # AI DJ planner
│   │   ├── spotifyClient.js
│   │   └── spotifyUserAuth.js
│   ├── services/
│   │   └── recommend.js    # AI-first → deterministic fallback
│   └── lib/
│       ├── listenerContext.js
│       ├── deriveListenerState.js
│       ├── missions.js
│       ├── score.js
│       ├── feedback.js
│       ├── fallbackVoice.js
│       └── albumArt.js
├── docs/design/            # Design + engine reference notes
└── test/
```

---

## Spotify app checklist

1. Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add redirect URI: `http://127.0.0.1:3000/callback` (or match `SPOTIFY_REDIRECT_URI`).
3. For **playback**, use a **Premium** account and the scopes in `src/integrations/spotifyUserAuth.js`.

---

## Name & repo

The product name in this repository is **Magic Shuffle** everywhere (UI, API `service` field, prompts, and docs).

---

## Documentation

- **`HANDOFF.md`** — Vision, architecture, API JSON shapes, troubleshooting.
- **`docs/design/`** — Visual / engine notes from the first prototype (see `docs/design/README.md`).
