# Magic Shuffle — Engine Spec

> Deterministic recommendation rules. The prototype implements every rule below exactly; engineers can replace the catalog with a real provider but **must** preserve the rule order and weights.

## 1. Data shapes

### ContextSnapshot
```ts
{
  id: string;
  label: string; sub: string;             // for the demo switcher only
  energyLevel: number;                    // 0..100
  sleepQuality: number;                   // 0..100
  stressLevel: number;                    // 0..100
  weather: string; rainChance: number;    // 0..100
  schedule: string;
  timeOfDay: "Early morning"|"Morning"|"Late morning"|"Afternoon"|"Evening"|"Night";
  location: string;
  activity: "waking"|"focus"|"commute"|"workout"|"wind_down";
  tempC: number;
}
```

### MusicMission
6 IDs, each with display metadata and target acoustic profile:
```
gentle_activation · focus_flow · mood_repair · lock_the_groove · push_through · recover_smoothly
```
See `data.jsx → MISSIONS` for `target = { energy, valence, vocalDensity }` per mission.

### Track
```ts
{
  id, title, artist;
  bpm: number;
  energy: 1..5;
  valence: 1..5;       // 5 = bright/warm
  vocalDensity: 1..5;  // 1 = instrumental
  missions: string[];  // which missions this track is eligible for
  moods: string[];     // tag-style mood labels
  tags: string[];      // genre tags
  art: [hueA, hueB, 0..3];
  lenSec: number;
}
```

## 2. `deriveListenerState(ctx)` (spec historically called `deriveState`)

Pure function — no IO. Returns:
```ts
{ lowSleep, highEnergy, rainy, elevatedStress, signals: string[] }
```
Thresholds:
- `lowSleep`: `sleepQuality < 50`
- `highEnergy`: `energyLevel >= 70`
- `rainy`: `rainChance >= 50`
- `elevatedStress`: `stressLevel >= 55`

## 3. `selectMission(ctx, state)` — **priority order, top wins**

1. `lowSleep && energyLevel >= 70 && rainChance >= 50` → **`gentle_activation`** (Jasmine's morning)
2. `activity === "workout" && energyLevel >= 75` → **`push_through`**
3. `activity === "focus" OR (workish schedule && activity ∉ {workout, commute})` → **`focus_flow`**
4. `rainy && activity === "commute"` → **`mood_repair`**
5. `(timeOfDay ∈ {Evening, Night}) && activity === "wind_down"` → **`recover_smoothly`**
6. `energyLevel >= 75` → **`lock_the_groove`**
7. `rainy` → **`mood_repair`**
8. otherwise → **`gentle_activation`**

`workish = /work|study|review|prep|hackathon|standup|meeting/i.test(schedule)`

## 4. `scoreTrack(track, ctx, mission, tuning, recent)` — weighted sum

```
score =
  missionFit       * 0.35 +
  energyFit        * 0.20 +
  moodFit          * 0.15 +
  contextFit       * 0.15 +
  userFeedbackFit  * 0.10 +
  noveltyFit       * 0.05
```

Component definitions:
- `missionFit = track.missions.includes(mission) ? 1 : 0.25`
- `energyFit  = 1 - |track.energy - (target.energy + tuning.energyBias)| / 4`
- `moodFit    = 1 - (|track.valence - target.valence| + |track.vocalDensity - target.vocalDensity|) / 8`
- `contextFit`: base 0.6; +0.25 if rainy and track is warm/soft/reflective; +0.15 if low sleep and `track.energy <= 3`; +0.10 if energy ≥ 80 and `track.energy >= 4`. Clamped 0..1.
- `userFeedbackFit`: 0.5 baseline; if user-liked moods present, `clamp01(0.4 + 0.6 * overlap_ratio)`
- `noveltyFit`: 0.5 + 0.5 * `tuning.novelty`; if recently played, force to 0.1.

### Penalties (subtracted)
- Recently played (in `recent[]`): `-0.4`
- Same artist as last played: `-0.12`
- Sleep < 45 and track energy ≥ 5: `-0.18`
- Energy ≥ 85 and track energy ≤ 1: `-0.18`

## 5. `recommend(ctx, opts)` — returns

```ts
{
  mission, missionMeta, state,
  track,                 // top pick
  detail: { score, parts, penalties },
  backups: Track[3],     // next best 3
  matchScore: 70..99,    // friendly UI score
  line,                  // DJ-voice sentence
  reason,                // 1-line explanation
  ranked                 // full debug list
}
```

`opts`:
- `recent: string[]` — already-played IDs (penalty input)
- `mission: string | null` — force a mission (Steer the mission UI)
- `surprise: bool` — rotate to a strong-but-not-top pick within the mission
- `tuning: { voice, likedMoods, novelty, energyBias }`

### matchScore mapping
`matchScore = clamp(round(70 + clamp01((rawScore - 0.45) / 0.45) * 29), 70, 99)`

## 6. DJ voice templates

Three voice maps in `engine.jsx` keyed by mission. Always interpolates `track.title`, location, time greeting, sleep/rain state, and an optional schedule tail (`" before your hackathon"`).

Voices: `warm | minimal | playful`. See `01-design-language.md §11` for tone rules.

## 7. Calling-out the must-keep behaviors

When you swap the static catalog for a real provider (Spotify, etc.):
1. Keep `selectMission` as written — the entire UX depends on a single mission being committed per render.
2. Keep the **0.35 / 0.20 / 0.15 / 0.15 / 0.10 / 0.05** weights; tune the *components*, not the weights, in V1.
3. Keep the penalty system. Especially "recently played" — the prototype's Surprise/Skip/Not-feeling-it loop relies on it.
4. `matchScore` is a *display* score, not the raw score. Never expose `rawScore` to the user.
