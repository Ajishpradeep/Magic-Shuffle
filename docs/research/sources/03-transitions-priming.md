# State-Transition & Pre-Task Priming via Music — Research Grounding

> **Pillar thesis.** Magic Shuffle does not merely move mood "from worse to better." It uses
> music to drive brain chemistry and autonomic state so that the **transition into the next
> scheduled phase** is scientifically smoother — *even when current signals are all good*. The
> regulatory **target** is chosen from the **upcoming activity**, not just from "feel better."
>
> This document grounds that logic in peer-reviewed evidence. Every claim carries a verified URL
> (see [References](#references)). Confidence levels and gaps are flagged inline. The product's
> parameter vocabulary — `tempoBpm`, `energy`, `valence`, `acousticness`, `danceability`,
> `vocalDensity`, all 0–1 except tempo — is used throughout so findings map directly onto the
> `affect.js` / `isoPlaylist.js` arc model.

**Reading the confidence flags:**
`[STRONG]` meta-analytic / multiple RCTs · `[MODERATE]` consistent but smaller / heterogeneous ·
`[EMERGING]` single study or theory-led · `[CONTESTED]` evidence mixed or largely null — design defensively.

---

## 1. The ISO-principle, and extending it to *target-by-next-activity*

**The classic ISO-principle.** Originating in 1948, the iso-principle prescribes starting with music
that *matches* the listener's current affective/arousal state, then gradually shifting the music
toward a *desired* state. Modern controlled experiments support it: Starcke & von Georgi (2024)
showed iso-principle listening *modulates* affective state, and a 2021 controlled sadness-induction
study found the iso sequence (match → shift) successfully moved affect toward the target.
`[MODERATE]` In mood-disorder patients, both the iso-principle and a "compensatory" (jump-to-target)
principle were suitable for affect regulation, with the iso-arc being the gentler default.

This is exactly the arc the app already builds: a `start` profile near current arousal, ramped
~10–15 BPM/track toward a `target`. The evidence endorses the **gradual ramp** over a hard jump.

**Extension — choosing the TARGET from the upcoming activity.** Theory supports goal-directed
regulation rather than generic "feel better":

- **Saarikallio's Music in Mood Regulation (MMR)** frames music regulation as *satisfying personal
  mood-related goals*. Of her seven strategies, **Revival** (getting energy when tired) and
  **Entertainment** (maintaining a positive mood) are explicitly *goal-conditioned* — the right move
  depends on what you need next, not on a fixed "better" direction. `[MODERATE]`
- **Thayer's energy×tension model** (a 45°-rotated circumplex) shows mood has *two* arousal axes —
  **energy** and **tension** — that must be regulated independently. "Calmer" is not one direction:
  before a workout you want *high energy / low tension*; before sleep you want *low energy / low
  tension*. Thayer, Newman & McClain (1994) found music among the most successful self-regulation
  tactics for *all three* goals (changing bad mood, **raising energy**, **reducing tension**).
  `[MODERATE]` This is the theoretical backbone for picking different targets per next-activity.
- A systematic review/meta-analysis of musicking and emotion regulation (k=8 RCTs, N=441) found a
  **moderate effect, d = 0.45 (p < .01)**, and frames music as able to intervene at multiple
  regulation points (situation selection, attentional deployment, cognitive change, response
  modulation) — *"supporting intentional regulatory strategies aligned with specific emotional
  goals."* `[MODERATE]` Effects were *larger in general (non-clinical) populations (d = 1.04)* —
  directly relevant to a consumer wellness product.

**Design takeaway.** Keep the iso *match → ramp* arc. Set the arc's **target** from the *entry
brain-state the next activity needs* (Section 8 table), regulating **energy** and **tension**
separately rather than collapsing to a single valence axis.

---

## 2. Pre-exercise / workout priming (psych-up & ergogenic aid)

**Pre-task music is a genuine ergogenic and psychological primer**, distinct from in-task music.
A 2023 Frontiers **multilevel meta-analysis of controlled studies on *pre-task* music** found:
`[STRONG]`

- **Relative peak power SMD = 0.53** (moderate, p = 0.005); **relative mean power SMD = 0.38**
  (p = 0.003); **completion time SMD = −0.24** (faster, p = 0.04).
- **Feeling Scale SMD = 2.42** (large affective lift, p = 0.03); **fatigue symptoms SMD = −0.20**
  (p = 0.01).
- **Perceived exertion: non-significant (SMD = 0.01)** — pre-task music doesn't blunt *in-task* RPE
  (that's in-task music's job).
- Strongest effects on **short, anaerobic, explosive tasks** (30-s Wingate, jumps, sprints, grip).
- **Self-selected music produced stronger affective responses** than imposed music (p = 0.02).
- Proposed mechanism: **CNS stimulation / increased catecholamine release**, motor-cortex priming.
- **Tempo moderation was *not* statistically supported** in this analysis (most studies used
  >120 bpm), so treat tempo as a sensible default rather than a precision lever. `[CONTESTED]`

**Karageorghis & Priest (2012), *Music in the exercise domain* (Parts I & II):** pre-task music
"optimise[s] arousal, facilitate[s] task-relevant imagery and improve[s] performance in simple
motoric tasks." For *in-task* asynchronous music at moderate intensity (40–90% HRR), the **optimal
tempo band is ~125–140 bpm**; in-task music gives ~**10% RPE reduction** at low–moderate intensity
and synchronous motivational music produced ~**15% endurance increase** vs no-music. Above the
anaerobic threshold, music no longer lowers perceived exertion but still improves emotional tone.
`[STRONG]`

**Design takeaway.** *Warm-up arc:* start near current arousal, ramp **energy 0.6→0.85**, tempo
toward **130–140 bpm**, high `danceability`, lower `acousticness`, motivational/high-`valence`,
vocals OK. Prioritize **self-selected / familiar** tracks. Goal here is **psych-up**, not calm.

---

## 3. Focus / deep-work priming (arousal toward the inverted-U optimum)

The governing model is the **Yerkes-Dodson inverted-U**: performance peaks at *moderate* arousal;
too little → boredom/mind-wandering, too much → anxiety. Music before/around a focus block should
*move arousal toward that optimum*, and the right direction depends on the person and the task:
`[MODERATE]`

- Background music **increased subjective task-focus by reducing mind-wandering** (without changing
  external distraction) in a sustained-attention task; note this study found music did **not**
  significantly improve *objective* performance (RT / RT-variability) vs silence — the gain was in
  subjective focus, not measured performance.
- The effect is **task-complexity dependent** (Kiss & Linnell, 2023): simple/under-arousing tasks
  benefit from added arousal (music helps); complex/already-arousing tasks can be pushed *past* the
  optimum (music hurts). So the priming move differs for a flat-but-easy task vs a hard one.
- A systematic review of music/auditory stimulation on autonomic arousal, cognition and attention is
  **consistent with arousal as a candidate mediating mechanism**, though it concludes the physiological
  evidence is mixed/insufficient and the arousal–mood link rests largely on subjective ratings. `[MODERATE]`

**Practical "ramping into concentration":** use a short pre-task primer to **lift a flat listener
toward moderate arousal** *or* **down-regulate a wired listener** (anticipatory anxiety) toward it,
then taper to low-distraction, **instrumental, low-`vocalDensity`** material for the work itself
(lyrics compete for language processing — see Section 4 sleep evidence, same mechanism).

**Design takeaway.** *Focus-primer arc (≈5–10 min):* converge toward **energy ≈ 0.45–0.6**,
tempo **100–115 bpm**, **low `vocalDensity` (<0.3)**, moderate `acousticness`. If incoming arousal
is high (anxious), *descend* into it; if low (flat), *ascend* into it — the iso-match start handles
both.

---

## 4. Sleep / wind-down transition

**The strongest evidence base in this document.** Multiple meta-analyses show music improves sleep
quality (PSQI): the **Cochrane review *Listening to music for insomnia in adults*** (Jespersen et al.
2022; 13 RCTs, N=1,007) found **moderate-certainty evidence** of better PSQI vs no-intervention; a
network meta-analysis (20 trials, N=1,339) found music arms superior to usual care. Music reduces
**sleep-onset latency**, raises **sleep efficiency**, and increases **total sleep time**. `[STRONG]`

A 2025 Frontiers narrative review specifies the **wind-down musical recipe**: `[MODERATE→STRONG]`

- **Tempo 60–80 bpm** (mimics resting heart rate, promotes parasympathetic calm) — and a
  **decelerating arc** across the session toward the lower end.
- **Instrumental, no lyrics** (lyrics activate language processing), **soft/smooth melodies**,
  **simple structure** (low cognitive engagement), often minor tonalities, classical/New Age.
- **Avoid before bed:** lyrics, accented beats, percussive/syncopated/startling elements — i.e.
  anything *activating*.
- **Dose:** 30–45 min before bed, low volume (~50–60 dB), most effective nightly.
- **Mechanism:** ↓ cortisol, parasympathetic activation, ↓ HR and BP. (Note: direct cardiac
  *entrainment* to recorded music is weakly supported — Mütze et al. 2020 — so frame slow tempo as
  *cueing* relaxation/slowed breathing, not literal beat-locking of the heart.) `[CONTESTED]`

**Design takeaway.** *Wind-down arc:* **energy 0.3→0.2**, **tempo decelerating to 60–70 bpm**,
**`acousticness` high (>0.75)**, **`vocalDensity` very low (<0.2)**, low `danceability`. The app's
existing `wind_down` target (energy 0.22, tempo 62, acousticness 0.82, vocalDensity 0.2) is
well-aligned with this evidence.

---

## 5. Wake / morning activation (counteracting sleep inertia)

**Sleep inertia** — grogginess and degraded performance for ~15–30 min (occasionally hours) after
waking — can be reduced by the *right kind* of waking sound. An ecological study (Smith et al.,
PMC7445849) found **melody, not rhythm, drives the benefit**: a **melodic** 105-bpm wake stimulus
significantly reduced **attentional lapses (p=0.016)**, **false starts (p=0.001)** and improved
PVT performance (**p=0.006**) vs control; a **rhythmic-only stimulus showed no benefit**. Companion
RMIT work links **harsh/beeping alarms to greater grogginess** and "melodic" tunes (easy to hum) to
greater alertness. `[EMERGING/MODERATE]` (Small samples; cortisol-awakening-response link not
directly measured — flagged gap.)

**Design takeaway.** *Morning ramp-up arc:* avoid jarring onsets; **start melodic and gentle, then
ramp** energy/tempo upward over several minutes (sleep→alert), landing around **tempo 100–120 bpm,
energy 0.55→0.75**, brighter `valence`. Favor **melodic, hum-able, familiar** tracks. This is a
*gentle ascending* arc, the mirror image of wind-down.

---

## 6. Social / pre-meeting / pre-presentation priming

Two distinct sub-goals:

**(a) Down-regulating anticipatory anxiety / building confidence.** Psychological-skills and
pre-performance interventions produce **large effects on state performance anxiety**, including
**cognitive anxiety, somatic anxiety and self-confidence** (meta-analysis of performing artists and
athletes). Music fits the established "pre-performance routine / centering" template. Important
nuance from music-performance-anxiety research: **some performers need *functional* arousal** — the
goal is the **IZOF (Individual Zone of Optimal Functioning)** entry point, *not* minimum arousal.
`[MODERATE]`

**(b) Oxytocin / bonding before social contact.** Group singing and music-making can release
oxytocin and promote social flow — *but* a 2026 systematic review shows the effect is **strongly
context-dependent and bidirectional**: group singing raised OXT in older adults but *decreased* it
in young adults; **slow-tempo music raised salivary OXT** whereas fast/vigorous singing initially
suppressed it; and improved social/mood outcomes *often occurred without* OXT increases. `[CONTESTED]`

**Design takeaway.** For solo passive listening before a meeting, lean on the **anxiety-regulation**
mechanism (a), not a promise of oxytocin. *Pre-social arc:* down-regulate toward a **confident,
moderate-arousal** entry state — **energy ≈ 0.5, tempo 90–110 bpm, high `valence`** (uplifting,
confidence-cueing), avoiding both jitteriness and flatness. Don't over-calm an anxious presenter
*below* their optimal zone.

---

## 7. Recovery / post-stress down-regulation — **honest caveat**

Intuition says relaxing music speeds physiological recovery after a stressor. The best meta-analytic
evidence is **more equivocal than the popular narrative**, and we flag this so product copy stays
honest. The PLOS ONE meta-analysis of music listening and stress recovery in healthy adults found:
`[CONTESTED]`

- **Overall effect ≈ null:** g = 0.15, 95% CI [−0.21, 0.52], p = 0.374 (≈ equivalent to silence).
- **HRV is the strongest signal:** 3 of 4 studies showed higher HRV (HF power, sample entropy) with
  music — i.e. better *parasympathetic* recovery. Skin conductance also lower in 3 studies.
- **Heart rate / blood pressure / cortisol:** weak and mixed (e.g. only 1 of 7 HR studies positive).
- **Self-selected (g=0.336) > experimenter-selected (g=0.030); classical strongest (g=0.431, ns);
  heavy metal negative.** Exposure **duration (2–45 min) did not predict** recovery.
- Listening **specifically *for relaxation*** appeared to outperform listening for distraction/
  activation — but this is an observation from a single EMA study noted in the review, not a pooled
  meta-analytic comparison. *Intent and framing may matter; treat as suggestive.*

**Design takeaway.** It's defensible to offer a post-stress **down-regulation arc** (descending
energy/tempo, high `acousticness`, **self-selected & relaxing-framed**, classical-adjacent) on the
basis of **HRV/skin-conductance** evidence, but **do not over-claim cortisol or HR recovery.**
Frame as "ease the system back down," and lean on the much stronger sleep/wind-down evidence
(Section 4) when the recovery slot is in the evening.

---

## 8. The KEY design question — a parameterized **Transition Framework**

Given **(a)** current biometric/affect state, **(b)** the next scheduled item, and **(c)** time
available, the app should build an arc from *now-state* to the *optimal entry-state for the next
activity*. The arc retains the iso **match → ramp** shape; only the **target** and **arc direction**
change per next-activity.

> Parameters use the app's 0–1 scale (tempo in BPM). "Arc shape" = how `start`→`target` is traversed.

| FROM state (now) | NEXT scheduled activity | Target ENTRY brain-state | Target musical parameters | Arc shape & duration | Key citation |
|---|---|---|---|---|---|
| Any (wired *or* flat) | **Workout / exercise** | High energy, **low tension**, psyched-up; sympathetic *readiness* | `tempo→130–140`, `energy 0.85`, `valence high`, `danceability high`, `acousticness low`, vocals OK; **self-selected** | Iso-match start → **ascending** ramp to peak; **~5–10 min** pre-task primer | Pre-task meta (Frontiers 2023); Karageorghis & Priest 2012 |
| Flat / drowsy (low arousal, easy task) | **Focus / deep work (simple)** | *Lift* to moderate arousal (Y-D optimum) | `tempo 100–115`, `energy 0.5–0.6`, `vocalDensity <0.3`, `acousticness mid` | Short **ascending** primer (≈5–10 min) → low-distraction bed | Kiss & Linnell 2023; sustained-attention RCT (PMC8357712) |
| Wired / anxious (high arousal) | **Focus / deep work (complex)** | *Descend* to moderate arousal; cut pre-task anxiety | `tempo 95–110`, `energy 0.45–0.55`, `vocalDensity <0.3`, `acousticness ↑` | Iso-match start → **descending** ramp into the optimum (≈5–10 min) | Yerkes-Dodson / arousal review (ScienceDirect 2024) |
| Any (esp. wired) | **Sleep / bedtime** | Parasympathetic dominance, ↓cortisol, drowsy | `tempo→60–70`, `energy 0.2`, `acousticness >0.75`, `vocalDensity <0.2`, instrumental, simple | **Decelerating descent**; **30–45 min** before bed | Sleep PSQI meta-analyses; Frontiers wind-down review 2025 |
| Drowsy / sleep inertia | **Wake / morning start** | Alert, low grogginess; gentle activation | **melodic, hum-able**, `tempo 100–120`, `energy 0.55→0.75`, brighter `valence` | **Gentle ascending** ramp from soft → energetic (over several min) | Sleep-inertia melody study (PMC7445849); RMIT alarm work |
| Anxious / over-aroused | **Meeting / presentation** | IZOF: confident, *moderate* arousal (not minimal) | `tempo 90–110`, `energy ~0.5`, `valence high` (confidence-cueing) | Iso-match → **mild descend** toward optimal zone (≈5–10 min) | Performance-anxiety meta (PMC10669558); IZOF (PMC9021823) |
| Post-stressor (sympathetic spike) | **Recovery / break** | ↑HRV, ↓skin conductance; ease back to baseline | `tempo descending`, `energy ↓`, `acousticness ↑`, **self-selected, relax-framed**, classical-adjacent | **Descending** down-regulation arc | Stress-recovery meta (PLOS ONE, *HRV-only* support) `[CONTESTED]` |
| Balanced / good signals | **Same activity continues** | *Maintain* current optimal state | hold near current `energy/valence/tempo`; small positive `valence` bias | **Flat/maintain** arc (Entertainment strategy) | Saarikallio MMR; Thayer 1994 |

### 8a. Dosage / timing evidence

- **Sleep / wind-down:** **30–45 min** before bed, nightly, low volume. `[STRONG]`
- **Pre-exercise:** a short pre-task block before short/anaerobic efforts; effect is on
  *readiness/affect/power*, not in-task RPE. `[STRONG]`
- **Emotion-regulation sessions:** **longer total intervention time → larger effects**
  (meta-regression slope = .002, p = .017; sessions 30–90 min). Favors *enough* arc length to
  complete the transition, not a single track. `[MODERATE]`
- **Stress recovery:** duration (2–45 min) **did *not* predict** recovery — so for the recovery
  use-case, arc *content/framing* matters more than length. `[CONTESTED]`
- **Sleep inertia:** benefit shown with a short (~108 s) melodic stimulus at wake. `[EMERGING]`
- **General arc length:** the app's default ~12-track arc gives ample room to ramp ~10–15 BPM/track,
  consistent with the iso gradual-shift principle.

### 8b. Confidence summary & gaps

- **Strongest:** sleep/wind-down (tempo, instrumentation, dose); pre-task exercise priming.
- **Moderate:** iso-principle arc; emotion-regulation goal-targeting; focus/arousal tuning;
  pre-performance anxiety reduction.
- **Weak / contested — design defensively:** generic post-stress *cortisol/HR* recovery (HRV only);
  oxytocin/social priming (bidirectional, context-dependent); literal cardiac entrainment to tempo;
  tempo as a precise pre-exercise lever.
- **Gaps:** few studies test *target-by-next-activity* selection directly (it's theory-assembled from
  Saarikallio + Thayer + Y-D); cortisol-awakening-response × music is under-measured; most
  evidence is acute and lab-based.

---

## 9. Even when ALL signals are good — why still do something

Three evidence-anchored rationales for acting on a "green" state:

1. **Anticipatory priming for the *next* state.** The whole framework (Sections 1–8) is built on
   *target-by-next-activity*: a calm, balanced person before a workout still benefits from
   **psych-up** priming (pre-task power/affect gains, Frontiers 2023), and a fine person before bed
   still benefits from a **wind-down** arc (PSQI meta-analyses). Good *now* ≠ optimal *entry-state
   for next*.
2. **Maintain / optimize rather than correct.** Saarikallio's **Entertainment** strategy
   (maintaining positive mood) and the **maintain** arc are first-class goals, not the absence of a
   goal. Thayer treats energy and tension as continuously regulated, not binary problems to fix.
3. **Smoothing circadian/activity transitions.** The morning sleep-inertia and evening wind-down
   evidence shows the *boundaries between phases* are where performance is most fragile — so a
   transition primer adds value precisely at hand-offs, regardless of the steady-state reading.

**Design takeaway.** Never gate the experience on "is something wrong?" The default when signals are
good is **maintain**, and at any upcoming phase boundary the default becomes the **next-activity
priming arc** from the Section 8 table.

---

## References

*All URLs verified via fetch/search during research (June 2026). Items marked (search-verified) were
confirmed by search result listing rather than full fetch.*

**ISO-principle & mood-regulation theory**
- Starcke & von Georgi (2024), *Music listening according to the iso principle modulates affective state*, Psychology of Music — https://journals.sagepub.com/doi/10.1177/10298649231175029
- *Emotion Modulation through Music after Sadness Induction — The Iso Principle* (2021), IJERPH / PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC8656869/
- Starcke, Gebhardt & von Georgi (2026), *Music listening according to the iso principle in patients with mood disorders* — https://doi.org/10.1177/03057356261427384 (search-verified)
- Heiderscheit & Madson (2015), *Use of the Iso Principle as a Central Method in Mood Management*, Music Therapy Perspectives — https://academic.oup.com/mtp/article-abstract/33/1/45/1134120
- Saarikallio (2008), *Music in Mood Regulation: Initial Scale Development*, Psychology of Music — https://journals.sagepub.com/doi/10.1177/102986490801200206
- Saarikallio & Erkkilä (2007), *The role of music in adolescents' mood regulation* — https://journals.sagepub.com/doi/10.1177/0305735607068889
- Thayer, *The Biopsychology of Mood and Arousal* (OUP) — https://global.oup.com/academic/product/the-biopsychology-of-mood-and-arousal-9780195068276
- Meta-analysis: *The impact of musicking on emotion regulation* (d=0.45), PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC11405141/

**Pre-exercise / workout priming**
- *The effects of pre-task music on exercise performance...* (multilevel meta-analysis), Frontiers in Psychology 2023 — https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1293783/full
- Karageorghis & Priest (2012), *Music in the exercise domain: a review and synthesis (Part II)*, PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC3339577/
- Karageorghis & Priest (2012), *...(Part I)*, PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC3339578/

**Focus / deep-work & arousal (Yerkes-Dodson)**
- Kiss & Linnell (2023), *Making sense of background music listening habits: an arousal and task-complexity account* — https://journals.sagepub.com/doi/10.1177/03057356221089017
- *The effect of preferred background music on task-focus in sustained attention*, PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC8357712/
- *The effects of music and auditory stimulation on autonomic arousal, cognition and attention: a systematic review*, ScienceDirect 2024 — https://www.sciencedirect.com/science/article/pii/S0167876024000321

**Sleep / wind-down**
- Jespersen KV et al. (2022), *Listening to music for insomnia in adults* (Cochrane review; 13 RCTs, N=1,007; PSQI MD −2.79, moderate certainty) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9400393/
- *Can music improve sleep quality in adults with primary insomnia?* (network meta-analysis, 20 trials, N=1,339) — https://www.sciencedirect.com/science/article/abs/pii/S0020748917302432
- *Elements of music that work to improve sleep* (narrative review), Frontiers in Sleep 2025 — https://www.frontiersin.org/journals/sleep/articles/10.3389/frsle.2025.1707162/full
- *Effects of Relaxing Music on Healthy Sleep*, Scientific Reports — https://www.nature.com/articles/s41598-019-45608-y
- *Meta-narrative review: the impact of music therapy on sleep*, PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC11746032/
- Mütze, Kopiez & Wolf (2020), *The effect of a rhythmic pulse on the heart rate: little evidence for entrainment* — https://journals.sagepub.com/doi/abs/10.1177/1029864918817805
- *Effects of music on the cardiovascular system*, PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC8727633/

**Wake / morning activation (sleep inertia)**
- *Auditory Countermeasures for Sleep Inertia: ... Melody and Rhythm*, PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC7445849/
- *Alarm tones, music and their elements: ... to counteract sleep inertia*, PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC6986749/
- RMIT melodic-alarm coverage (ScienceDaily summary) — https://www.sciencedaily.com/releases/2020/02/200203104505.htm

**Social / pre-performance anxiety & oxytocin**
- *Effects of Psychological Interventions on Performance Anxiety in Performing Artists and Athletes: A Systematic Review with Meta-Analysis*, PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC10669558/
- *Individual Zone of Optimal Functioning Model Applied to Music Performance Anxiety*, PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC9021823/
- *Music's context-dependent influence on oxytocin, social bonding, and emotion regulation: a systematic review*, Frontiers 2025 — https://www.frontiersin.org/journals/cognition/articles/10.3389/fcogn.2025.1678665/full
- *The neurochemistry and social flow of singing: bonding and oxytocin*, PMC — https://pmc.ncbi.nlm.nih.gov/articles/PMC4585277/

**Recovery / post-stress down-regulation**
- *Music listening and stress recovery in healthy individuals: a systematic review with meta-analysis*, PLOS ONE — https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0270031
- *Effect of music intervention on heart rate variability: a systematic review and meta-analysis of RCTs*, Frontiers 2026 — https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1750786/full
