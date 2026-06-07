# Magic Shuffle — design & engine notes

Historical engineering notes from the first static prototype. The shipping app lives under **`public/`** (UI) and **`src/`** (API + recommendation). Use these documents for **visual language**, **component ideas**, and **deterministic scoring** reference — file names in the “prototype” column are legacy.

## Files

| File | What it covers |
|------|----------------|
| `01-design-language.md` | Visual system — tokens, type, tiles, motion, copy voice, a11y |
| `02-component-spec.md` | Component map (conceptual; original used inline JSX) |
| `03-engine-spec.md` | Deterministic rules, data shapes, weights, voice templates |

## Runtime code map

| Design doc concept | Current code |
|--------------------|----------------|
| Context + missions + tracks | `src/data/contexts.js`, `src/lib/missions.js`, `src/data/tracks.js` |
| `deriveState` (spec name) | `src/lib/deriveListenerState.js` — `deriveListenerState(ctx)` |
| Scoring / ranking | `src/lib/score.js` — `rankTracks`, `scoreTrack` |
| AI + Spotify grounding | `src/integrations/openai.js`, `src/integrations/spotifyClient.js` |
| End-to-end recommend | `src/services/recommend.js` |

## What’s mocked vs. real

- **Mocked in V1:** Listener context rows are seed data, not live Health / Weather / Calendar APIs.
- **Real when configured:** OpenAI planning, Spotify metadata for proposed tracks, optional user OAuth for Web Playback.
