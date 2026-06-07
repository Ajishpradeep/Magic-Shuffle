# Magic Shuffle — Component Spec

> Component-by-component mapping from the prototype to what the engineer should build.

## File layout in the prototype

```
index.html         — all global CSS + script tags
data.jsx           — USER, CONTEXTS, MISSIONS, TRACKS  (window.MAGIC_SHUFFLE_DATA)
engine.jsx         — recommend(), deriveState(), selectMission()  (window.MAGIC_SHUFFLE_ENGINE)
art.jsx            — AlbumArt, AmbientField (canvas)
components.jsx     — Icon, VibeTile, LedNumber, TickScale, Sparkline, StatTile,
                     DotsScale, WeatherTile, MissionTile, UpNextTile
app.jsx            — App, ScenarioSwitcher, WhyPanel, TweakBridge
tweaks-panel.jsx   — host control panel (do not modify)
```

When porting to a real framework: keep the **same component names, same prop shapes, same behavior**. Treat this document as the contract.

---

## 1. `<VibeTile>`

The foundational glowing card. Wrap every panel in this.

```jsx
<VibeTile hue={320} intensity={0.95} ax={50} ay={28} radius={28} padding={18} dim={false}>
  {children}
</VibeTile>
```

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `hue` | 0–360 | 320 | Aura hue |
| `intensity` | 0–1 | 0.95 | Aura strength |
| `ax`, `ay` | 0–100 | 50, 28 | Aura focal point (%) |
| `radius` | px | 28 | Border radius |
| `padding` | px | 18 | Inner padding |
| `dim` | bool | false | Adds desaturation + softer aura |
| `className` | string | – | Extra classes (`.dj-card`, `.upnext`, …) |

Renders a `<div class="tile">` with CSS vars `--h`, `--ai`, `--ax`, `--ay` set inline. See `index.html` `.tile` rule for the layered radial + glass recipe.

## 2. `<LedNumber>`

```jsx
<LedNumber value={96} size={64} color="#fff" glow />
```

| Prop | Type | Default |
|---|---|---|
| `value` | string/number | – |
| `size` | px | 96 |
| `color` | css color | `#fff` |
| `glow` | bool | true |

Uses `DotGothic16`. Adds a `text-shadow: 0 0 18px <color>80` when `glow`. Used everywhere a metric ≥ 16px appears.

## 3. `<TickScale>`

```jsx
<TickScale value={0.45} count={48} />
```

Renders 48 vertical ticks (every 5th major) with a yellow ▼ marker positioned by `value`. Used for hero scrubber and any "fine-grained current value" readout.

## 4. `<DotsScale>`

```jsx
<DotsScale value={0.62} hue={158} count={12} />
```

12 dots. The leading `round(value*(count-1))` light up to `hsl(hue 90% 65%)` with a soft glow.

## 5. `<Sparkline>`

```jsx
<Sparkline hue={158} motion={0.55} points={64} height={28} />
```

Animated sinusoidal line on a canvas, with a trailing yellow dot. 1.5px stroke. Stops when offscreen via `IntersectionObserver` (TODO when porting).

## 6. `<StatTile>`

```jsx
<StatTile label="Energy" value={ctx.energyLevel} hue={158} hint="Running high" kind="dots" motion={motion} />
```

| Prop | Notes |
|---|---|
| `label` | Plain text |
| `value` | 0–100 |
| `hue` | Tile hue (uses §2.1 mosaic rule from Design Language doc) |
| `kind` | `"tick"` / `"dots"` / `"spark"` |
| `hint` | Sub-line text |

Layout: `eyebrow → LedNumber → tick|dots|spark → hint`.

## 7. `<WeatherTile>`

```jsx
<WeatherTile ctx={ctx} hue={(accent.hue + 280) % 360} motion={motion} />
```

Same skeleton as StatTile but with a location pill in the header and a sparkline in the footer. The temperature uses LedNumber at 88px.

## 8. `<UpNextTile>`

```jsx
<UpNextTile track={track} onPlay={fn} motion={motion} />
```

Track row variant. Border-rounded squircle with the track's hue painted as a radial gradient from the left. Layout: `AlbumArt(56) → title/artist → LED BPM`.

## 9. `<MissionTile>`

```jsx
<MissionTile mission="focus_flow" meta={MISSIONS.focus_flow} active={true} onPick={fn} hue={accent.hue} />
```

Toggle chip used in the Steer-the-mission grid. `active === current mission` lights the aura to `intensity 0.95`; otherwise 0.

## 10. `<AlbumArt>`

Procedural canvas. Seeded by `track.art = [hueA, hueB, pattern]` where pattern ∈ {0=rings, 1=blobs, 2=bands, 3=spokes}. **Animates only when `active && motion > 0.02`.**

## 11. `<AmbientField>`

The full-viewport background. 4 multi-hue radial blobs that drift via a sine/cosine grid based on `accent.hue` and `direction`:

```js
A: [hue, hue+50, hue+200, hue+280]
B: [hue, hue-18, hue+220, hue+160]
```

Single canvas. No DOM blobs. Pauses cleanly on unmount.

## 12. `<ScenarioSwitcher>`

The top-right glass dropdown. Selects between the demo `CONTEXTS`. In production this is **not** a user-facing control — replace with the real ContextSnapshot source (HealthKit / Calendar / weather).

## 13. `<WhyPanel>`

Toggled by the "Why this?" pill. Shows the six scoring components from `recommend().detail.parts` as small bars + LED percentages, plus any penalties from `detail.penalties`. Engine transparency.

---

## State model (App)

```
{
  ctxId            : string,        // active ContextSnapshot id
  tw               : { direction, accent, motion, voice }, // tweaks
  recent           : string[6],     // recently played track ids (penalty input)
  liked            : { [trackId]: bool },
  missionOverride  : string | null, // when user steers
  playing          : bool,
  progress         : 0..1
}
```

`recommend(ctx, { recent, mission, surprise, tuning })` is called inside a `useMemo` — see `app.jsx` for exact deps.
