# Magic Shuffle — Research Integration Plan of Action

> **Purpose.** A concrete, file-wired plan to transition the **current** engine into one that
> implements the [research foundation](research/README.md). Nothing is off-limits — schema,
> prompt, data model, and module layout can all change. **This is the plan, not the code.**
> Each item points at the real function/file it touches and the research section it satisfies.
>
> *Prepared 2026-06-09. Pairs with [`research/README.md`](research/README.md) §2 (decision model)
> and §7 (implications). Read this top-to-bottom; phases are ordered by dependency.*

---

## 0. The gap — current behavior vs. research-required behavior

The engine today is a solid **single-arousal, current-state, mood-lift** pipeline. The research
demands a **two-axis, next-activity-targeted, context-modulated, safety-guarded** pipeline. Mapped
to the 5-stage decision model in [`research/README.md` §2](research/README.md):

| Stage | Today | Research target | Primary file(s) |
|---|---|---|---|
| **1. Affect** | `toAffect()` → `{valence, arousal}` — single arousal axis | `{valence, energy, tension}` — split arousal (Thayer) | `src/lib/affect.js` |
| **2. Goal** | `regulationGoal(affect, time)` → 1 of 4 goals; **calendar never read** | Goal = next-activity's optimal entry-state, modulated by circadian + weather | `src/lib/affect.js`, `src/services/buildContext.js`, **new** `activityClassifier.js`, `circadian.js` |
| **3. Neural target** | implicit | explicit "to feel X → brain does Y → lever Z" reverse map | encoded in prompt + `GOAL_TARGETS` |
| **4. Musical target** | `GOAL_TARGETS` (4 entries), AI prompt | per-activity targets + feature→effect weighting; down-weight danceability | `src/lib/affect.js`, **new** `activityTargets.js`, `src/integrations/openai.js` |
| **5. ISO arc** | `buildArc()` fixed `length` | arc dosed to **time-until-next-event**; honest match-cap | `src/lib/isoPlaylist.js`, `src/services/recommend.js` |
| **Safety** | none | guardrails: cap match, no sad-loop, block list, lyric/volume rules, wellness copy | **new** `safety.js`, `recommend.js`, prompt, UI |

**Key enabler already present:** `getUpcomingEvents()` in `src/integrations/googleCalendar.js`
already returns structured `{summary, start, allDay}` — but `buildContext.js` throws away
everything except a one-line string. The single most leveraged change is **wiring the next event's
type + start time through the pipeline.**

---

## 1. Transition principles (constraints we hold)

1. **Additive, back-compatible API.** The response contract in `HANDOFF.md §8` (`recommendation`,
   `backups`, `arc`, `targetProfile`, `goal`, `dj`, …) stays. New fields (`nextActivity`,
   `strategy`, `dose`, `affect.tension`) are *added*, not swapped. Keeps the frontend partner
   unbroken.
2. **Both engines implement the model.** The AI path (`openai.js`) and the deterministic fallback
   (`recommend.js → deterministicPlaylist`) must produce the same *shape* and obey the same goal
   logic, so the app degrades gracefully (HANDOFF §3).
3. **Evidence-honest by construction.** No claim the research flagged weak ships as copy or logic:
   no cortisol-cure, no melatonin attribution, no binaural/432/Mozart levers, no guaranteed mood
   lift ([research/README.md §6](research/README.md)).
4. **Safety is P0, not P-last.** The rumination / sad-loop / volume guardrails (05 §5) gate launch.
5. **Stateless backend stays stateless.** Block-lists and check-ins ride in the request like the
   existing `exclude` array; the UI owns session state (HANDOFF §8).
6. **Personalization is designed-for, not built now.** Leave seams for a per-user rolling baseline
   (01 §6, 05 §4) without implementing storage in this pass.

---

## 2. Phased plan

Phases are dependency-ordered and individually shippable. P0/P1 are the backbone; P2 is the
headline feature; P3–P6 layer on.

---

### Phase 0 — Safety guardrails + honest copy  · `[P0, low risk]`
*Satisfies [05 §5–5.6](research/sources/05-clinical-frameworks.md), [README §6](research/README.md). Independent of the rest — do first.*

**New:** `src/lib/safety.js`
- `capMatch(arc, goal)` — ensure the ISO "match" start never *parks* a low-valence user in
  low-valence music: clamp `start.valence` floor and guarantee the arc moves *toward* higher
  valence over its length (no sad-loop — Garrido & Schubert).
- `filterBlocked(candidates, block)` — honor a per-request `block: string[]` (genres/tracks),
  analogous to existing `exclude`.
- `lyricGuard(goal)` — for calming/focus goals, return a flag the prompt/scorer uses to prefer
  instrumental and **avoid violent/hostile lyrics** (Anderson 2003).
- `volumeNotice()` — copy string for safe-listening (WHO ≤80 dB / 40 h).

**Touch:**
- `src/services/recommend.js → recommendPlaylist()`: accept `block`, run `filterBlocked` on both
  paths; run `capMatch` on the arc before `buildArc`.
- `src/integrations/openai.js → SYSTEM`: add explicit guardrail lines (never loop sad/low-valence
  for a down listener; avoid violent lyrics for calm/focus; instrumental for focus). The
  "no medical/clinical language" rule already exists — extend it to "no treatment/cure claims."
- `public/` (reference UI): surface `volumeNotice` + a visible "calm me down / stop" control
  (HANDOFF §10 keeps `public/` as the contract reference).
- Audit any existing copy/strings for medical claims; none currently in code, but lock it in.

**Tests:** down-valence context never yields a monotonically sad arc; `block` removes tracks;
focus goal sets instrumental preference.

---

### Phase 1 — Two-axis affect (energy + tension)  · `[P0, foundation]`
*Satisfies [03 §1 (Thayer)](research/sources/03-transitions-priming.md), [README §1–2](research/README.md).*

**Touch:** `src/lib/affect.js`
- `toAffect(bio, timeOfDay)` → return `{ valence, energy, tension, arousal }`.
  - **energy** (low↔high activation): from `energyLevel`, `sleepQuality`, `steps`, and the
    time-of-day curve.
  - **tension** (calm↔stressed): from `stressLevel` + physiological strain (low `hrv`, high
    `restingHr`, high `respiratoryRate`, `skinTempDev`) — the `hrvStrain`/`hrStrain` math already
    here is the seed; extend to resp + temp.
  - Keep `arousal` as a derived blend (`0.6*energy + 0.4*tension`) so existing callers
    (`regulationGoal`, `targetArc`, the AI guidance note) keep working until migrated.
- This is the leaf change everything else builds on; ship it behind the derived-`arousal`
  shim so nothing breaks in one commit.

**Tests:** wired-but-tired (high tension, low energy) and flat-but-relaxed (low tension, low
energy) produce *different* affect vectors — today they can collapse to the same arousal.

---

### Phase 2 — Goal from the NEXT activity  · `[P0, the headline]`
*Satisfies [03 §2–9 + the §8 transition framework](research/sources/03-transitions-priming.md), [README §5](research/README.md). The core thesis.*

**New:** `src/lib/activityClassifier.js`
- `classifyNextActivity(nextEvent, timeOfDay)` → `{ activity, minutesUntil, confidence }` where
  `activity ∈ { workout, focus, sleep, wake, social, commute, recovery, none }`.
  - Keyword/regex over `nextEvent.summary` (gym/run/lift→workout; meeting/standup/1:1/presentation/
    call→social; focus/deep work/write/code/study→focus; bed/sleep→sleep; commute/drive/train→
    commute), with `timeOfDay` priors (early-morning→wake, late-night→sleep). Defensive default
    `none`→ fall back to today's current-state goal.
  - `minutesUntil` from `nextEvent.start` (drives Phase 5 dosing).

**New:** `src/data/activityTargets.js` — the [03 §8 table](research/sources/03-transitions-priming.md) as data:
each activity → `{ target:{energy, tension, valence, tempoBpm, acousticness, danceability,
vocalDensity}, arcDirection: 'ascending'|'descending'|'flat', doseMinutes }`. Single source of
truth, tunable like `GOAL_TARGETS` is today.

**Touch:**
- `src/services/buildContext.js`:
  - In `assembleLiveContext()`, also fetch structured events (the data is already there via
    `getUpcomingEvents`); expose `nextEvent { summary, startISO, minutesUntil, allDay }` and
    `nextActivity` on `context` (keep the existing `calendar` string for back-compat + the DJ line).
  - Replace/augment `inferActivity()` so activity considers the calendar, not just time+steps.
- `src/lib/affect.js`:
  - Rename/extend `regulationGoal(affect, timeOfDay)` →
    `selectGoal(affect, { timeOfDay, nextActivity, minutesUntil })`. If a confident `nextActivity`
    exists and a phase boundary is near, the goal is the **activity primer** (from
    `activityTargets`); else fall back to the current state→goal logic (the existing 4-goal rules
    become the `none`/maintain branch).
  - `GOAL_TARGETS` merges with / defers to `activityTargets`; targets now carry `energy` **and**
    `tension`. `targetArc()` sets `arcDirection` and start from the two-axis affect.
- `src/services/recommend.js`: thread `nextActivity`/`minutesUntil` from `ctx` into
  `targetArc`/`selectGoal`; pass them as AI `guidance`.
- `src/data/contexts.js`: extend each demo context with a realistic `nextEvent`/`nextActivity`
  so the switcher demonstrates workout/focus/sleep/social priming.

**Tests:** balanced state + `nextActivity:'workout'` → ascending psych-up target (not "maintain");
balanced state + `nextActivity:'sleep'` → decelerating wind-down; `none` → current-state behavior
unchanged.

---

### Phase 3 — Circadian baseline + weather modulator  · `[P1]`
*Satisfies [04 §1–5](research/sources/04-circadian-weather.md), [README §2 stage 2](research/README.md).*

**New:** `src/lib/circadian.js`
- `circadianBaseline(timeOfDay|hour)` → baseline `{energy, alerting}` from the hour-by-hour table
  (04 §1.7): morning CAR rise, late-morning peak, ~14–16h dip, evening second peak, night trough.
- `weatherStrategy(weather, rainChance, tempC)` → `{ strategy:'align'|'compensate', valenceBias,
  energyBias }` from the [04 §5 table](research/sources/04-circadian-weather.md): brightness is the
  trusted signal (dark→compensatory lift), heat→soothe/avoid abrasive; **barometric/humidity
  ignored** (low confidence). Weather weighted *below* circadian.

**Touch:**
- `src/lib/affect.js → toAffect()` (or a thin wrapper in `recommend.js`): nudge the target — not
  the *reading* — by the circadian baseline and weather bias (ALIGN vs COMPENSATE). E.g. dark
  sluggish afternoon → bias target energy up; evening → reinforce wind-down regardless of weather.
- `src/services/recommend.js → assemble()`: add `strategy` to the response so the UI/DJ line can
  explain "lifting a grey afternoon" vs "easing into the evening."
- The existing `timeOfDayEnergyDelta()` in `generateBiometrics.js` already encodes the dip/inertia
  for the *mock signals*; keep it, but the circadian *targeting* logic is new and lives in `affect`.

**Tests:** identical biometrics at 15:00 overcast vs 19:00 clear → different targets (compensate-lift
vs align-maintain); rainy evening still winds down (circadian > weather).

---

### Phase 4 — Feature→effect weighting + prompt rewrite  · `[P1]`
*Satisfies [01 §4–5](research/sources/01-neurochemistry.md), [02 (all)](research/sources/02-musical-features.md), [README §3–4](research/README.md).*

**Touch:** `src/integrations/openai.js`
- Rewrite `SYSTEM` to encode, in DJ-friendly language:
  - the **two-axis** model (energy + tension), not single arousal;
  - **goal-from-next-activity** with the transition framework summarized (workout=psych-up,
    sleep=decelerate, focus=toward Y-D optimum, etc.);
  - the **feature→effect levers** (tempo for arousal, loudness/intensity as the most direct arousal
    lever, major-mode for valence, moderate groove for movement, instrumental/low-vocal for focus,
    familiarity as the strongest reliable lever);
  - the **safety guardrails** from Phase 0 (no sad-loop, avoid violent lyrics for calm/focus);
  - **honest caveats** (no cortisol/medical claims — extend the existing rule).
- `SCHEMA_HINT`: arc/target profiles gain `tension` alongside `energy`; keep `targetProfile` shape
  for back-compat. Optionally ask the model to tag each track's dominant lever (e.g. "warm timbre",
  "build-up→payoff") for richer reasons.
- `djPlaylist()` user payload: include `nextActivity`, `minutesUntil`, `strategy`, two-axis affect
  in the `guidance`.
- Retire the legacy `MISSION_LABELS` taxonomy *or* map it onto the new goals (it's only used for
  display + `/api/health`); avoid two parallel vocabularies.

**Touch:** `src/lib/isoPlaylist.js`
- `distance()` weights `W`: re-tune per 02 §9 — weight `energy`/`tempo` (and `loudness` if the AI
  estimates it) highest; keep `danceability` out/low (already absent — good); add `tension` if the
  profile carries it. Loudness note: Spotify audio-features are dead for this app (HANDOFF §4), so
  loudness stays an **AI estimate** like the other features, flagged `featureSource:"ai-estimate"`.

**Tests:** prompt snapshot includes activity + levers + guardrails; deterministic distance ranks a
high-energy track to the energize end of the arc.

---

### Phase 5 — Time-dosed arc  · `[P2]`
*Satisfies [03 §5a + §8a dosage](research/sources/03-transitions-priming.md), [05 §2](research/sources/05-clinical-frameworks.md).*

**Touch:** `src/lib/isoPlaylist.js → buildArc()` and `src/services/recommend.js`
- Derive playlist `length` from `minutesUntil` and the activity's `doseMinutes`
  (`activityTargets`): ~3.5 min/track, clamped to the API's 4–20 (HANDOFF §8). A workout in
  10 min → short punchy primer; bedtime in 40 min → long decelerating arc.
- Keep the explicit `length` query param as an override; dosing is the default when a timed event
  exists.
- Encode the dosage facts as constants (calming ≤30 min; sleep 25–60, mean ~36; affect shifts ~5
  min) so the arc length is evidence-derived, not arbitrary.

**Tests:** near-term timed event shortens the arc; no event → default 12.

---

### Phase 6 — Validation + personalization seams  · `[P3, optional]`
*Satisfies [05 §4 + §6](research/sources/05-clinical-frameworks.md), [01 §6](research/sources/01-neurochemistry.md).*

- **Validation (measure, don't claim):** add `POST /api/checkin` accepting a single-item
  valence/arousal or PANAS-lite pre/post; return a session-local delta. Stateless: the UI passes
  prior reading back, mirroring `exclude`. Wire in `src/app.js`.
- **Personalization seam:** define a `baseline` object (rolling HRV/RHR median, liked-track set,
  observed responses) that `toAffect` and the scorer *can* consume; default to population
  thresholds when absent (the research's explicit instruction — 05 §4). No storage yet, just the
  interface.
- **Musical-anhedonia / preference:** optional BMRQ-style onboarding flag that tempers
  expectations and biases toward familiarity (01 §6).

---

## 3. File-by-file change map (quick reference)

| File | Change | Phase |
|---|---|---|
| `src/lib/affect.js` | two-axis `toAffect`; `selectGoal(activity)`; per-activity targets; circadian/weather bias | 1,2,3 |
| `src/lib/isoPlaylist.js` | retune `distance` weights; tension dim; time-dosed length | 4,5 |
| `src/services/buildContext.js` | expose structured `nextEvent` + `nextActivity`; calendar-aware `inferActivity` | 2 |
| `src/services/recommend.js` | thread activity/dose/strategy; apply safety; extend `applyActionToArc` for tension; `block` param; `assemble` new fields | 0,2,3,5 |
| `src/integrations/openai.js` | rewrite `SYSTEM` + `SCHEMA_HINT`; new guidance payload; reconcile mission vocab | 0,4 |
| `src/lib/deriveListenerState.js` | align `activity`/`vocalTolerance` with classifier output | 2 |
| `src/data/contexts.js` | demo contexts gain `nextEvent`/`nextActivity` per scenario | 2 |
| `src/lib/generateBiometrics.js` | (mostly unchanged) optional chronotype hook for §3 | 3 |
| `src/app.js` | `block` param passthrough; optional `/api/checkin` | 0,6 |
| **new** `src/lib/activityClassifier.js` | next-event → activity + minutesUntil | 2 |
| **new** `src/lib/circadian.js` | circadian baseline + weather strategy | 3 |
| **new** `src/data/activityTargets.js` | transition-framework table as data | 2 |
| **new** `src/lib/safety.js` | capMatch / filterBlocked / lyricGuard / volumeNotice | 0 |
| `docs/research/README.md`, `HANDOFF.md` | document new model, fields, goals | each |

---

## 4. API & data-shape deltas (additive)

- **Request** (`POST /api/recommend`, `GET /api/playlist`): add `block: string[]` (alongside
  `exclude`); honor structured `nextEvent`/`nextActivity` if the caller supplies them.
- **Context object:** add `nextEvent { summary, startISO, minutesUntil, allDay }`, `nextActivity`.
- **Response:** add `affect.tension`, `strategy` (`align`/`compensate`), `dose { minutes, tracks }`,
  and activity-derived `goal` values. Keep `recommendation`/`backups`/`arc`/`targetProfile` exactly
  as documented (HANDOFF §8).
- **`/api/health`:** reflect the new goal vocabulary + that activity/circadian/safety are active.

---

## 5. Sequencing, risk, and validation

**Suggested order:** Phase 0 → 1 → 2 → 3 → 4 → 5 → 6. Phases 0 and 1 can land together (both are
low-risk foundations); Phase 2 is the headline and depends on 1 + the new classifier; 3–5 layer on;
6 is optional polish.

**Risks & mitigations:**
- *Activity misclassification* → always carry `confidence`; low confidence falls back to the
  current-state goal (never worse than today).
- *AI prompt regressions* → snapshot-test the prompt; keep the deterministic path as the safety
  net; verify the four legacy scenarios from HANDOFF still switch goals correctly.
- *Back-compat breakage* → additive-only response contract; run the existing `npm test` (3/3) green
  before/after each phase, then add new tests per phase.
- *Over-claiming* → Phase 0 copy audit + prompt guardrails gate every later phase.

**Definition of done (per phase):** existing tests green, new tests added, `GET /api/health` and
the hero scenario (`HANDOFF §2`) verified live, and the change traced back to its research section.

---

## 6. What stays exactly as-is
- The **AI-first → Spotify-grounding → deterministic-fallback** architecture (HANDOFF §3).
- The **Spotify constraint** workarounds — features remain AI-estimated (HANDOFF §4); this plan
  adds *loudness* to that same estimated set, nothing more.
- The **mock biometric latent-`r` generator** (`generateBiometrics.js`) — already research-grounded;
  only an optional chronotype hook is contemplated.
- The **live-signal assembly** for weather/calendar/location — we read *more* from the calendar,
  but the integrations themselves are unchanged.
