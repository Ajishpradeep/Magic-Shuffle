# Magic Shuffle — Research Foundation

> **What this is.** The scientific base for Magic Shuffle: a music engine that uses
> peer-reviewed neuroscience, physiology, and music-therapy evidence to drive a listener's
> brain chemistry and autonomic state so that the **transition into their next phase** —
> not merely "a better mood" — is as smooth as the evidence allows.
>
> This README is the **synthesis and entry point**. Each claim here is grounded in one of
> the detailed, fully-cited source documents listed below. When the engine is rebuilt to
> accommodate this research (a separate work session), this is the spec to build against.
>
> *Prepared / consolidated 2026-06-08. Confidence levels and honest caveats are carried
> through from the source docs — where the popular claim outruns the data, we say so.*

---

## 0. The documents

| # | Document | Covers |
|---|---|---|
| — | [`music-wellness-research.md`](music-wellness-research.md) | **Body / physiology** — autonomic nervous system, HRV/RHR/temp/respiration thresholds, Russell's circumplex, the ISO-principle, the mock-biometric latent-`r` model. *(Pre-existing baseline.)* |
| 01 | [`sources/01-neurochemistry.md`](sources/01-neurochemistry.md) | **Brain chemistry** — which neurochemicals & circuits produce which feeling; the reverse "to feel X, the brain must do Y" map. |
| 02 | [`sources/02-musical-features.md`](sources/02-musical-features.md) | **Which musical element causes which effect** — tempo, mode, groove, timbre, loudness, lyrics, complexity; debunked claims. |
| 03 | [`sources/03-transitions-priming.md`](sources/03-transitions-priming.md) | **The core thesis** — driving brain state to bridge into the *next scheduled activity* (workout, focus, sleep, wake, social, recovery). |
| 04 | [`sources/04-circadian-weather.md`](sources/04-circadian-weather.md) | **Context modulators** — time-of-day neuroendocrinology, chronotype, light/season, weather→mood (honest about weak effects). |
| 05 | [`sources/05-clinical-frameworks.md`](sources/05-clinical-frameworks.md) | **Clinical grounding** — frameworks, evidence tiers, dosage, individual differences, safety guardrails, regulatory boundary. |

Read this README for the unified model; open a source doc for the depth, numbers, and
citations behind any line.

---

## 1. The thesis, stated precisely

Most "wellness music" apps optimize one axis: *make the user feel better*. The evidence
says that is both **too narrow** and sometimes **wrong**:

1. **Mood is two-dimensional, and "better" is goal-dependent.** Thayer's energy×tension
   model and Russell's circumplex both show affect is **valence × arousal**, and arousal
   itself splits into *energy* and *tension* that regulate independently (03 §1). Before a
   workout the right target is *high energy / low tension*; before sleep it is *low energy /
   low tension*. "Calmer" and "more energized" are not a single slider.

2. **The right target comes from what's next, not from now.** A balanced person before bed
   still benefits from a wind-down arc; a calm person before a workout still benefits from a
   psych-up primer (03 §2, §4, §9). So the engine should choose its **target brain-state from
   the upcoming scheduled activity**, then use the ISO-principle to bridge there from the
   current state. **This is the product's defensible scientific edge.**

3. **Music works by recruiting specific neural machinery.** Pleasure, motivation, and the
   "chills" are a **dopaminergic reward-prediction** process (01 §1.1, §3; causal evidence
   from levodopa/risperidone). Calm is an **autonomic/parasympathetic** shift (01 §1.6;
   physiology doc). Each target feeling has a known neural signature and a known musical lever
   (§3 below).

4. **Honesty is a feature.** Several popular claims don't survive scrutiny — music reliably
   lowering *cortisol* (contradicted by Thoma 2013), binaural beats, the Mozart effect, 432 Hz,
   literal cardiac beat-locking, generic "mood lift" as a clinical outcome. We design around
   what's actually supported and never claim the rest (§6, and 05 §3/§5).

---

## 2. The unified decision model

The engine reasons in five stages. Inputs already exist in the codebase
(`buildContext.js`, `generateBiometrics.js`); stages 2–4 are where the new research lands.

```
 INPUTS                         STAGE                                   OUTPUT
 ─────────────────────────────  ──────────────────────────────────────  ─────────────────
 biometrics (energy, stress,    1. AFFECT STATE                          (valence, arousal)
   sleep, HRV, RHR, resp, temp)    Russell circumplex + Thayer            split into
 time-of-day                       energy/tension  → "where are they      energy & tension
 weather                            now, on both arousal axes?"
                                                    │
 calendar / next activity   ──▶  2. GOAL SELECTION  ▼                     goal +
 time available before it          target chosen from NEXT activity's     target brain-state
                                    optimal entry-state, modulated by      (the felt-state to
                                    circadian phase + weather              engineer)
                                                    │
                                 3. NEURAL TARGET    ▼                     required neuro/
                                    "to feel that, the brain must do Y"    autonomic event
                                    (reverse map, §3)
                                                    │
                                 4. MUSICAL TARGET   ▼                     target audio-feature
                                    feature→effect map (§4): tempo,        profile (energy,
                                    mode, groove, timbre, loudness,        valence, tempo,
                                    vocals, complexity                     acousticness, …)
                                                    │
                                 5. ISO ARC          ▼                     ordered playlist:
                                    start near current arousal, ramp       match → ramp →
                                    ~10–15 BPM/track to target; dose       target, dosed to
                                    the arc length to the time available   the time window
```

### Stage 1 — Affect state (where are they now?)
Map biometrics + time to **valence × arousal**, and crucially split arousal into **energy**
and **tension** (Thayer). Low HRV + high RHR + high stress = high *tension*; low steps +
afternoon dip + low energy = low *energy*. (Physiology doc §1–2; 03 §1.) Circadian phase
sets the *baseline* this sits on top of (04 §1).

### Stage 2 — Goal selection (where should they go, and why?)
**Goal = the entry brain-state the next scheduled activity needs**, not "feel better."
The transition framework (03 §8) is the heart of this stage — reproduced in §5 below.
Time-of-day and weather *modulate* the target (04 §5): ALIGN with what the body is already
doing (reinforce the evening wind-down) or COMPENSATE for what it lacks (lift energy on a
dark, sluggish afternoon).

### Stage 3 — Neural target (what must the brain do?)
Translate the desired feeling into its required neural/autonomic event via the reverse map
(§3). This is the "why" layer — it tells the engine *which lever* matters for this goal
(dopaminergic build-up vs. parasympathetic down-shift vs. optimal mid-arousal).

### Stage 4 — Musical target (what music does that?)
Translate the neural target into an audio-feature profile via the feature→effect map (§4).

### Stage 5 — ISO arc (how to get there smoothly?)
Build an ordered playlist that **starts near the current arousal and ramps** to the target
(~10–15 BPM/track), **dosed to the available time** (§5a). Affect can shift in ~5 min; full
arcs run 20–45 min depending on goal. Never jump straight to the target; never park a
low-valence user in sad music (§6).

---

## 3. Reverse map — "to FEEL X, the brain must do Y, via lever Z"

The spine of Stage 3. Full evidence and citations in **01 §4–5**.

| Target feeling | Required neural / autonomic event | Primary musical lever | Confidence |
|---|---|---|---|
| **Calm / relaxed** | ↑ parasympathetic (vagal) tone; ↓ sympathetic; (inferred ↑GABA) | Slow **60–80 BPM**, soft, high acousticness, instrumental, low loudness, familiar | High (autonomic) |
| **Motivated / energized** | Dopaminergic reward (caudate→NAcc) **+** sympathetic/noradrenergic arousal | Fast **120–140 BPM**, high energy/loudness, strong groove, build-up→payoff, major | High |
| **Happy / uplifted** | Dopamine reward **+** positive-valence appraisal | Major mode, high valence, preferred/familiar, satisfying resolution | High |
| **Euphoric / "chills"** | **Caudate** anticipation → **NAcc** dopamine peak | Strong tension→release / build-up→drop; personally peak-inducing tracks | High |
| **Focused / attentive** | **Optimal mid-arousal** (Yerkes-Dodson); ↓ mind-wandering | Moderate-arousal, **instrumental / low-vocal**, steady, low-surprise | Moderate |
| **Sleepy / wind-down** | ↓ arousal, ↑ parasympathetic (**not** via melatonin) | Decelerating to **60–70 BPM**, soft, instrumental, simple | Moderate→Strong |
| **Socially warm / connected** | **Oxytocin**; ↓ ACTH | **Participatory/synchronous** music (singing, shared listening) | Moderate (active only) |
| **Emotionally moved** | Amygdala + hippocampus (memory) + reward co-engagement | Familiar, autobiographical, expressive; minor heightens poignancy | Moderate |

> Cross-references the circumplex `GOAL_TARGETS` in `src/lib/affect.js`. This table supplies
> the neurochemical *why* behind those audio-feature targets.

---

## 4. Which part of the music does what (feature → effect)

The spine of Stage 4. Full ranges, mechanisms, and citations in **02**.

| Feature | Direction | Effect | Confidence |
|---|---|---|---|
| **Tempo (slow 60–80 BPM)** | ↓ | ↑ vagal tone (RMSSD/HF/baroreflex) → calm | 🟢 |
| **Tempo (fast 120–140 BPM)** | ↑ | motor entrainment, movement urge, exercise sync, subjective arousal | 🟢 |
| **Loudness / intensity** | ↑ | **most direct, causal arousal lever** (~0.34 arousal/unit; r≈0.86) | 🟢 |
| **Mode (major / minor)** | major↑ | strongest Western **valence** cue (major=positive) | 🟢 |
| **Consonance vs. dissonance/roughness** | consonant | consonant→reward (ventral striatum); rough/dissonant→amygdala aversion, tension | 🟢 |
| **Syncopation / groove** | **moderate** | inverted-U: medium syncopation maximizes pleasure + urge-to-move | 🟢 |
| **Beat anticipation (clear pulse)** | — | caudate (anticipation) → NAcc (peak) **dopamine** | 🟢 |
| **Timbre (warm/acoustic vs. rough/bright)** | smooth | warm/acoustic → soothing/"safe"; rough/bright → tension/arousal | 🟡 |
| **Lyrics (during verbal/cognitive work)** | present | **impairs** verbal & reading tasks (d≈−0.2 to −0.33); native language worse | 🟢 |
| **Instrumental (during work)** | lyric-free | ≈ neutral on cognition; supports focus | 🟢 |
| **Complexity / novelty** | **moderate** | Berlyne inverted-U: peak liking at moderate, drops at extremes (~88% of studies) | 🟢 |
| **Familiarity / preference** | familiar | strongest reliable "free" lever for affect & engagement (mere exposure + reward) | 🟢 |

**Spotify-feature trust weighting** (since this app can't read Spotify audio-features — see
HANDOFF §4 — the AI estimates them; weight accordingly): trust **energy / loudness / tempo**
most (arousal), **valence / mode** moderately, and **down-weight `danceability`** (poor match
to human ratings). (02 §9.)

---

## 5. The transition framework (Stage 2, in full)

Given **(a)** current state, **(b)** next scheduled activity, **(c)** time available, build an
arc from now → the optimal entry-state for what's next. The arc keeps the ISO **match → ramp**
shape; only the **target** and **direction** change per activity. Parameters are on the app's
0–1 scale (tempo in BPM). Full evidence in **03 §8**.

| FROM state | NEXT activity | Target entry-state | Target musical parameters | Arc & dose |
|---|---|---|---|---|
| Wired *or* flat | **Workout** | High energy, low tension, psyched-up | tempo→130–140, energy 0.85, valence high, danceability high, acousticness low, vocals OK, **self-selected** | **Ascending**, ~5–10 min |
| Flat / drowsy | **Focus (simple task)** | Lift to mid-arousal (Y-D optimum) | tempo 100–115, energy 0.5–0.6, vocalDensity <0.3 | **Ascending** primer ≈5–10 min → low-distraction bed |
| Wired / anxious | **Focus (complex task)** | Descend to mid-arousal; cut pre-task anxiety | tempo 95–110, energy 0.45–0.55, vocalDensity <0.3, acousticness ↑ | **Descending** ≈5–10 min |
| Any (esp. wired) | **Sleep** | Parasympathetic dominance, drowsy | tempo→60–70, energy 0.2, acousticness >0.75, vocalDensity <0.2, instrumental | **Decelerating**, **30–45 min** before bed |
| Drowsy / sleep inertia | **Wake** | Alert, low grogginess | **melodic, hum-able**, tempo 100–120, energy 0.55→0.75, brighter valence | **Gentle ascending**, several min |
| Anxious | **Meeting / presentation** | IZOF: confident, *moderate* arousal (not minimal) | tempo 90–110, energy ~0.5, valence high | Match → **mild descend** ≈5–10 min |
| Post-stressor | **Recovery / break** | ↑HRV, ↓skin conductance | tempo descending, energy ↓, acousticness ↑, **self-selected, relax-framed** | **Descending** *(HRV-only support — §6)* |
| Balanced / good | **Same activity** | *Maintain* | hold near current energy/valence/tempo, small +valence bias | **Flat / maintain** |

### 5a. Dosage (03 §8a, 05 §2)
- **Calming session:** ≤30 min most effective (HRV benefit ~doubles vs. longer).
- **Sleep / wind-down:** 25–60 min (mean ≈36), low volume, nightly.
- **Pre-exercise:** short primer before short/anaerobic efforts; lifts power & affect, not in-task RPE.
- **Time-to-effect:** affect shifts in ~5 min; physiology within one session.
- **Arc length:** the app's default ~12-track arc gives room for a ~10–15 BPM/track ramp.

---

## 6. Honest caveats — what we will NOT claim

Carried from every source doc. Building on these protects credibility and (05 §5.6) keeps the
product on the right side of the FDA general-wellness boundary.

- **"Music lowers cortisol" is not robust.** Thoma 2013 found cortisol *highest* in the music
  group; the reliable stress effect is **autonomic (HRV/alpha-amylase)**, not HPA. Frame stress
  relief around the parasympathetic story. (01 §1.3, §7.)
- **Music's sleep benefit is real but NOT via melatonin** — it runs through arousal reduction.
  (01 §1.7.)
- **Generic "mood lift" is the weakest clinical endpoint** (many nulls). Don't market it as an
  outcome. The Cochrane-grade claims are *subjective sleep quality*, *acute anxiety reduction*,
  and *therapist-delivered depression* — none of which a recorded-music app should claim to
  *treat*. (05 §3.)
- **Post-stress recovery is largely null in meta-analysis** (g=0.15, ns); only HRV/skin
  conductance hold up. Offer the down-regulation arc, don't promise cortisol/HR recovery. (03 §7.)
- **Binaural beats, 432 Hz, the Mozart effect, literal heart-rate beat-locking** — overstated or
  debunked. At most offer as optional "ambience," never as evidence-backed brain levers. (02, Debunked.)
- **Oxytocin/social bonding is bidirectional and context-dependent** — strongest for *active,
  participatory* music, not solo passive playback. (01 §1.4; 03 §6.)
- **Weather effects on mood are real but small and often cultural.** Brightness (sun/cloud) is
  the most trustworthy weather input; heat→irritability second; **barometric pressure & humidity
  are low-confidence.** Circadian > weather. (04 §4–5.)
- **~5% of people have musical anhedonia** and won't respond to the reward mechanisms at all;
  never present effects as guaranteed. (01 §6; 05 §4.)

### Safety guardrails to build in (05 §5)
1. ISO "match" is **time-capped and always moves out** toward the target — **never park/loop a
   low-valence user in sad music** (rumination risk, Garrido & Schubert).
2. Honor permanent **skip/block** lists; treat strong negative responses as de-escalate signals.
3. Respect the arousal gradient; provide an instant **"calm me down" / stop** control.
4. Avoid **violent/hostile lyrics** in regulation playlists (lyrics matter more than tone).
5. **Safe-volume** guidance (WHO ≤80 dB / 40 h/week); never optimize for loudness.
6. **Wellness copy only** — no disease/treatment claims; personalize to a rolling baseline.

---

## 7. How this changes the project (research-driven implications)

> **Status: IMPLEMENTED (P0–P5).** All seven implications below are now live in the engine —
> two-axis affect, next-activity targeting, circadian/weather modulation, prompt rewrite, time-
> dosing, and safety guardrails. See `HANDOFF.md` §9 and `docs/research-integration-plan.md`.
> Only #7 (validation/personalization) is deferred to the optional P6. The notes below remain
> as the rationale for each change.

The original engine (`affect.js`, `isoPlaylist.js`, the OpenAI prompt) did circumplex + ISO +
a single goal. The research pointed to these upgrades, now built:

1. **Split arousal into energy + tension (Thayer).** Today the goal is essentially one arousal
   axis. Model *energy* and *tension* separately so "calm an anxious-but-tired user" and "energize
   a flat-but-relaxed user" become distinct, correct targets. *(affect.js → affect state.)*
2. **Make the goal a function of the NEXT calendar activity, not just current state.** Add an
   activity-classifier (workout / focus / sleep / wake / social / recovery / maintain) over the
   calendar signal, and select the target from the §5 framework. This is the headline change —
   it operationalizes the core thesis. *(buildContext.js + affect.js → `GOAL_TARGETS` keyed by
   next-activity.)*
3. **Add the circadian baseline + weather modulator** as an ALIGN/COMPENSATE nudge on the target
   (§4 of doc 04), weighting circadian over weather. *(buildContext.js.)*
4. **Encode the neural "why" and feature→effect weights in the AI prompt** so picks are explained
   in mechanistic terms and weight `energy/loudness/tempo` over `danceability`. *(openai.js.)*
5. **Dose the arc to the time-until-next-event** (§5a), not a fixed track count. *(isoPlaylist.js.)*
6. **Wire the safety guardrails** (time-capped match, no sad-loop, block lists, volume guidance,
   wellness-only copy). *(recommend.js + UI.)*
7. **Optionally add validation** — pre/post PANAS or single-item valence/arousal check-ins + HRV
   deltas vs. baseline — to measure (not claim) effect. (05 §6.)

---

## 8. One-line takeaways
1. Optimize **valence × (energy, tension)** — three levers, not one "feel better" slider.
2. Choose the **target from what's next**; use the **ISO arc** to bridge there from now.
3. **Dopamine** drives pleasure/motivation (build-up→payoff, familiarity); **parasympathetic**
   drives calm — each has a known musical lever.
4. **Tempo, loudness, mode, groove, lyrics, familiarity** are the high-confidence controls;
   binaural beats / 432 Hz / Mozart effect are not.
5. **Circadian > weather**; brightness is the only weather signal worth much.
6. **Be honest and safe:** no cortisol/mood-cure claims, never loop sad music, cap the match,
   personalize to the user's baseline.
