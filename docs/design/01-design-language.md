# Magic Shuffle — Design Language

> Reference prototype: `index.html`. Every selector and component named here ships in the prototype.

## 1. Intent

**Immersive · techful · calm · modern · vibrant.** The interface is a near-black, glassy mosaic of glowing tiles that read like *instruments* — each one tinted by its own color, animated in slow motion, and stamped with dot-matrix readouts. The DJ's reasoning surfaces as ambient atmosphere, not as charts.

Anti-patterns: flat dashboards, solid colored panels, plain stat cards, generic gradient bars, medical/diagnostic framing of biometrics.

---

## 2. Color

Near-black base, **per-tile vibrant aura**. There is no global "primary" surface color — color belongs to the tile.

| Token | Value | Use |
|---|---|---|
| `--bg0` | `#050507` | App background |
| `--ink` | `hsl(0 0% 98%)` | Primary text |
| `--ink-dim` | `hsla(0 0% 100% / 0.62)` | Secondary text |
| `--ink-faint` | `hsla(0 0% 100% / 0.38)` | Tertiary/meta text |
| `--stroke` | `hsla(0 0% 100% / 0.08)` | Default border |
| `--stroke-strong` | `hsla(0 0% 100% / 0.16)` | Hover/active border |
| `--glass` | `hsla(0 0% 100% / 0.05)` | Glass surface fill |
| `--yellow` | `#F2D24A` | Tick-scale marker only |

**Accent hues** (Tweaks → Accent). Hue is the only thing that changes:

| Id | Hue | |
|---|---|---|
| `magenta` | 320 | `hsl(320 90% 62%)` |
| `iris` | 262 | `hsl(262 85% 68%)` |
| `ember` | 16 | `hsl(16 92% 62%)` |
| `citrus` | 54 | `hsl(54 95% 60%)` |
| `aurora` | 168 | `hsl(168 82% 58%)` |

### 2.1 Multi-hue mosaic rule

The right column is intentionally *not* monochromatic. Each tile keeps its own hue so the panel reads as a chord of colors regardless of accent:

| Tile | Hue |
|---|---|
| Energy | 158 |
| Sleep | 232 |
| Stress | 18 |
| Weather | `(accent + 280) % 360` |
| Up next | `(accent + 200) % 360` |
| Steer mission | `(accent + 30) % 360` |
| Hero/album art | **track's own** dominant hue |

Result: 4–6 hues on screen at all times.

---

## 3. Typography

| Role | Family | Notes |
|---|---|---|
| UI | **Hanken Grotesk** 400/500/600/700 | Body, controls, labels |
| Display | **Bricolage Grotesque** 700/800 | Mission, hero title, eyebrows |
| Numerals (LED) | **DotGothic16** | BPM, °C, energy/sleep/stress, scrub time, match score, % values in "Why" |

Rules:
- Eyebrows: 10.5–11px uppercase, letter-spacing `0.14–0.18em`.
- Any number larger than ~28px **must** use the LED face — it's a brand cue.
- Display sizes tighten `letter-spacing` to `-0.01` to `-0.02em` above 22px.

---

## 4. Geometry

- Tile radii **22–32px** depending on size (squircle feel). Hero tile = 32; stat tiles = 24; pills = 999.
- Spacing scale (px): **4 · 8 · 12 · 14 · 18 · 22 · 28 · 36**. Gaps between mosaic tiles = 14–18.
- Stroke widths: 1px on tiles, 1.5–2px on circles (match meter, DJ avatar).
- Grids use `gap`, never margin-collapsed siblings. Layout must survive direct-DOM edits.

---

## 5. The VibeTile (the foundational glowing card)

Every container on the page is a `.tile`. A tile is a near-black surface with a **single radial aura** drawn behind it and a subtle glass haze over the aura. Three CSS variables tune it:

| Var | Range | Meaning |
|---|---|---|
| `--h` | 0–360 | Aura hue |
| `--ai` | 0–1 | Aura intensity |
| `--ax`, `--ay` | % | Aura focal point |

Recipe (excerpt from `index.html`):
```css
.tile { position: relative; background: hsl(0 0% 4%); border: 1px solid var(--stroke); overflow: hidden; isolation: isolate; }
.tile::before {
  content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(120% 110% at var(--ax,50%) var(--ay,28%),
    hsla(var(--h,320) 95% 60% / var(--ai,0.95)) 0%,
    hsla(var(--h,320) 80% 38% / calc(var(--ai) * 0.45)) 28%,
    hsla(var(--h,320) 70% 16% / calc(var(--ai) * 0.18)) 55%,
    transparent 75%);
}
.tile::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg, hsla(0 0% 0% / 0.05) 0%, hsla(0 0% 0% / 0.35) 100%);
  backdrop-filter: blur(6px);
}
.tile > * { position: relative; z-index: 1; }
```

Authoring contract:
- A tile **always** sets `--h` and `--ai`.
- A tile **never** uses a solid color fill. If color is needed, give it more aura intensity, not a flat background.
- Tiles nest. Inner tiles inherit a darker base and add their own (usually softer) aura.

---

## 6. Numeric displays — the "LED" treatment

Big numbers are rendered via `<LedNumber value={n} size={64} />`:

```jsx
<span className="led" style={{ fontSize: 64, color: "#fff", textShadow: "0 0 18px #fff80" }}>
  <span className="led-text">128</span>
</span>
```

CSS gives the dot-matrix look with `DotGothic16` + a faint glow. The same treatment is used at all sizes from 16px (BPM in "Up next") to 96px (weather temp).

Rules:
- Always paired with a tiny uppercase unit label (e.g., `BPM`, `°C`).
- Always white or near-white. **Never** color the digits with accent hues — let the surrounding aura do the work.

---

## 7. Tick scale (progress, scrub, intensity)

`<TickScale value={0..1} count={48} />` — a row of 48 thin vertical ticks (every 5th taller and brighter) with a yellow ▼ marker.

When to use:
- Track progress (hero scrubber)
- Sleep score (stat tile)
- Any 0..1 value that wants to feel like an *instrument readout*, not a bar.

Never use a flat filled progress bar in the product. Use ticks or the dot scale.

### 7.1 Dot scale

`<DotsScale value={0..1} hue={158} count={12} />` — 12 dots, the leading ones light up at the tile's hue.

Use for Energy / Stress / discrete 1-of-N readouts.

---

## 8. Sparkline

`<Sparkline hue={...} motion={0..1} />` — animated single-line sinusoidal sparkline with a trailing yellow dot. Used in Weather and any "trend in progress" context.

Sparkline lines are **always 1.5px** and **always tinted to the tile's hue**.

---

## 9. Surfaces & controls

| Element | Look |
|---|---|
| Glass control (skip / heart / scenario btn) | `--glass` fill, `--stroke` border, 14–18px blur |
| Solid pill (Play, Surprise me) | accent fill, dark text `#07060a`, soft outer shadow `0 14px 40px accent/40%` |
| Outline pill ("Why this?") | glass fill, white text, `--stroke-strong` border |
| Menu (scenario dropdown) | `.glass-strong`, 24–32px blur, 18px radius |

Hover lifts always: `translateY(-1px)` and a border step from `--stroke` → `--stroke-strong`.

---

## 10. Motion

- Easing: default browser ease (`cubic-bezier(0.25, 0.1, 0.25, 1)`); transition durations 150–250ms for state changes, 250–400ms for tile aura crossfades.
- Background "AmbientField" canvas: 4 multi-hue radial blobs drifting at 0.10–0.55× motion intensity.
- Album art: animates only while playing **and** motion > 0. Stops on pause to save CPU.
- `@media (prefers-reduced-motion: reduce)` disables the DJ pulse, freezes the ambient canvas at frame 0, and stops album-art animation.

---

## 11. Voice / copy

The DJ has three voices (Tweaks → DJ voice). All three speak in second person, never refer to "vitals" or "scores":

| Voice | Cadence |
|---|---|
| `warm` (default) | Two short sentences, gentle observation → action |
| `minimal` | Telegraphic. Comma-separated phrases. |
| `playful` | Conversational, contractions, occasional caps for energy |

Forbidden: clinical terms (stress level, BPM target, anxiety, etc.), exclamation overuse, generic salutations ("Hello, user!").

---

## 12. Density & layout

- Desktop max width **1320px**, page padding 24/28px.
- Mosaic: `1.65fr / 1fr` grid, collapses to single column under 880px.
- Hero tile contains the album art (260px), big LED BPM, tick-scale scrubber, control row, action pills.
- Right column = stat row → weather → up next → mission picker.

Never inflate the page to fill the viewport. Tiles size to their content; whitespace is *part* of the calm.

---

## 13. Tweaks (live in-product)

Surfaced via the Tweaks panel. Engineers can keep these as user prefs or QA-only:

- **Visual direction:** A · Aurora Pulse (cool lead) / B · Ember Bloom (warm lead)
- **Accent:** magenta / iris / ember / citrus / aurora
- **Background motion intensity:** 0..1
- **DJ voice tone:** warm / minimal / playful

These are all CSS-variable + state changes; nothing structural depends on them.

---

## 14. Accessibility

- All text on tiles passes WCAG AA on the darkest aura band (≥4.5:1 against `hsl(0 0% 4%)`). Re-check whenever introducing a new hue at ai > 0.6.
- Focus rings: 2px solid white at 60% opacity, 2px offset, never the accent (accent is decorative, not semantic).
- All controls are real `<button>`s; no clickable divs.
- `prefers-reduced-motion`: see §10.
- The biometric panel must always carry the line "**vibe, not vitals**" or equivalent.
