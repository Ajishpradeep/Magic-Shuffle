# Sonicstride — Engineering Handoff

This folder is everything an engineer needs to implement the Sonicstride AI DJ from the reference prototype in `../index.html`.

## Files

| File | What it covers |
|---|---|
| `01-design-language.md` | The visual system — tokens, type, tiles, motion, copy voice, a11y |
| `02-component-spec.md` | Component-by-component map of the prototype |
| `03-engine-spec.md` | Deterministic recommendation rules, data shapes, weights, voice templates |

## How to read the prototype

`../index.html` loads six scripts in order:

```
data.jsx       → window.SONIC_DATA
engine.jsx     → window.SONIC_ENGINE
tweaks-panel.jsx → the live tweaks controls (do not modify)
art.jsx        → AlbumArt + AmbientField (canvas)
components.jsx → UI primitives (VibeTile, LedNumber, TickScale, …)
app.jsx        → the React app
```

The prototype uses inline `<script type="text/babel">` so JSX runs in the browser. When porting, mirror this file layout in your real framework — the component names and prop shapes here are part of the contract.

## What's mocked vs. real

- **Mocked:** Audio playback (the scrubber animates a fake position); track catalog; context source.
- **Real:** Mission selection, scoring, DJ voice templates, all visual primitives, the entire interaction model.

## V1 scope vs. later

| In V1 (must ship) | Later |
|---|---|
| Catalog from a real provider | Per-user learned tuning |
| Real audio integration | Mid-day "re-read" of context |
| ContextSnapshot from HealthKit + Calendar + Weather | Cross-session memory beyond `recent[]` |
| Persist `liked[]` across sessions | A/B testing variants of DJ voice |

## Open questions for the team

1. Where does the ContextSnapshot live? The prototype keeps it in React state; in production it likely belongs in a small service that the DJ polls.
2. How long is `recent[]`? The prototype keeps the last 6. Confirm with product.
3. Tweaks: ship as user prefs, dev-only QA panel, or both?
4. The "Why this?" panel exposes engine internals. Keep, hide behind a long-press, or remove for V1?

## Hand-back

When you ship the first internal build, please tag the design team for a UI review against `01-design-language.md` — the tile system is the part most likely to drift, and small drifts compound.
