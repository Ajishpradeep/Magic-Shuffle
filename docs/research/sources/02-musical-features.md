# Musical Features → Brain / Physiological / Affective Effects

> **Purpose.** This document maps **specific musical features** to the **brain, physiological, and
> affective effects** they cause, so the Magic Shuffle engine can reason about *which part of the music
> contributes to which part of the mood/brain effect*. It is a companion to
> `docs/research/music-wellness-research.md` (which covers the whole-track stress/HRV picture) and feeds
> the feature weighting in `src/lib/affect.js`, the ISO playlist builder (`src/lib/isoPlaylist.js`), and
> the Spotify-feature mapping in `src/services/buildContext.js`.
>
> **Sourcing rules.** Every quantitative claim below is tied to a peer-reviewed paper, meta-analysis, or
> systematic review with a working URL in the **References** section. Where the popular claim outruns the
> evidence (binaural beats, 432 Hz, Mozart effect), that is flagged explicitly in the
> *Debunked / overstated* section. *Prepared 2026-06-08.*

**Confidence legend:** 🟢 strong (multiple studies / meta-analysis, replicated) · 🟡 moderate (a few
studies, some heterogeneity) · 🔴 weak / contested (small pilots, null-heavy literature, or overstated in
popular media).

---

## 1. Tempo (BPM) — entrainment, arousal, and movement

**Mechanism.** Two distinct pathways. (a) *Autonomic modulation*: slower tempi increase vagal
(parasympathetic) tone; faster tempi raise subjective arousal. (b) *Motor entrainment*: a clear pulse
recruits the motor/auditory loop and the body tends to synchronize movement (steps, tapping) to the beat.

**Direction & ranges (autonomic):** In a controlled microneurography study (Bretherton et al. 2019,
58 enrolled, tempi swept **60→180 BPM**), the *slowest* tempo (~60 BPM in a decreasing sequence) produced
the greatest vagal modulation — higher **RMSSD**, higher **SD1**, higher **HF power**, and greater
**baroreflex sensitivity** at slow vs fast tempo. Crucially, *direct* sympathetic nerve activity (MSNA)
did **not** differ across tempi — so observed HRV swings reflect **parasympathetic modulation, not
sympathetic arousal**. Effect sizes were small-to-medium, and baseline autonomic state predicted
responsiveness. 🟢 *(Exact BRS / η² / R² values are from the full text and not independently re-verified
here — treat the direction as robust and the precise magnitudes as indicative.)*

This supports the **60–80 BPM "calming" band** used in our engine — it mirrors a relaxed resting HR and
maximizes vagal tone. Note the study's caveat: the predicted sympathetic spike at 180 BPM did *not*
appear, so "fast = sympathetic arousal" is a subjective/affective effect more than a measured
sympathetic-nerve effect.

**Direction & ranges (motor / exercise):** Running cadence spontaneously entrains to music tempo when
the tempo is near natural cadence — recreational runners adapt cadence by up to ~2% to tempo shifts of up
to ~3% **without awareness or instruction** (Van Dyck et al. 2015). Practical exercise band: **~120–140
BPM** (≈120–125 for a jog, ≈140–145 for hard effort), matching typical pop/EDM tempo. Above ~75% of
aerobic capacity the ergogenic/perceived-exertion benefit of music fades (fatigue cues dominate). 🟢

**On strict "heartbeat entrainment":** Be honest — Mütze, Kopiez & Wolf (2018) found **little evidence**
that heart rate locks to (recorded, non-live) musical pulse the way Thaut's rhythmic-entrainment theory predicts.
The tempo→HR relationship is real but is better described as **graded autonomic modulation** than literal
beat-to-beat cardiac synchronization. 🟡

**Engine takeaway:** Use tempo as the primary *arousal* lever. 60–80 BPM → calming/vagal; 120–140 BPM →
movement/exercise. Treat "HR entrainment" as a soft tendency, not a hard lock.

---

## 2. Mode & Harmony — valence, consonance, and the amygdala

**Mechanism.** Mode (major/minor) is the strongest single *valence* cue for Western listeners.
Consonance/dissonance maps onto a pleasant↔unpleasant (approach↔avoid) axis with measurable limbic
signatures.

**Direction & evidence:**
- **Major → higher valence; minor → lower/negative valence.** Confirmed behaviorally and in fMRI
  (Pallesen et al. 2005): major chords/progressions rated higher in valence than minor; major-major final
  chords > major-minor finals. 🟢
- **Consonance = pleasant; dissonance = unpleasant, and the amygdala tracks it.** Koelsch and colleagues
  (and the Pallesen line of work) show permanently **dissonant** music activates **amygdala, hippocampus,
  parahippocampal gyrus, temporal poles** (aversion network), while **consonant/pleasant** music activates
  **ventral striatum (reward), anterior insula, inferior frontal gyrus, Heschl's gyrus**. The amygdala is
  relatively *activated* by unpleasant and *deactivated* by pleasant music. 🟢
- **Harmonic tension/resolution** is a prediction process: unexpected chords (even consonant ones) drive
  prediction-error responses and can read as tension if the context made them unpleasant. 🟡

**Engine takeaway:** Mode → valence target (major to lift mood, minor for melancholic/introspective
targets — but pair with the ISO principle, matching start state first). Avoid sustained dissonance/high
roughness for calm/safety goals; it recruits aversion circuitry.

---

## 3. Rhythm & Groove — the syncopation sweet spot and beat-based dopamine

**Mechanism.** "Groove" = the pleasurable urge to move. It arises from an interplay of **predictability**
(steady pulse the motor system can lock to) and **surprise** (syncopation that violates expectation just
enough). Beat prediction engages basal-ganglia / motor loops and the dopaminergic reward system.

**Direction & ranges (the headline result — Witek et al. 2014):** In a 66-participant study using **50
synthesized funk drum-breaks** with a **syncopation index of 0–81** (modified Longuet-Higgins & Lee
metric), there is an **inverted-U**: **medium syncopation** maximizes both *desire to move* and *pleasure*.
- Too little syncopation (metronomic) → boring, low movement urge.
- Too much → hard to follow, pleasure drops.
- For *movement*, medium significantly exceeded both low and high. For *pleasure*, medium exceeded high.
- Effect strongest in people who enjoy dancing. 🟢

**Beat-based dopamine (Salimpoor et al. 2011):** Anatomically dissociated dopamine release —
**caudate / dorsal striatum during *anticipation*** of a musical peak, **nucleus accumbens during the
*experienced* peak**. (The separate finding that **accumbens activity predicted how much money people
would pay** for the music is from Salimpoor et al. **2013, *Science*** — not the 2011 paper.) This is
the neural basis for why a well-built groove (predict → resolve) feels rewarding. 🟢 (PET/fMRI, small
n — directionally robust, exact magnitudes not generalized.)

**Engine takeaway:** Favor **moderate syncopation + clear pulse** for "want-to-move"/energize/exercise
goals (this is the danceability sweet spot). For calm/focus, prefer steady low-syncopation pulse — the
predictability is the point.

---

## 4. Timbre & Instrumentation — roughness, sharpness, and "safety"

**Mechanism.** Spectral properties (roughness, sharpness/brightness) carry affective weight independent
of pitch and tempo. **Auditory roughness** (rapid amplitude beating, ~15–75 Hz envelope) is the physical
correlate of sensory dissonance and is processed as a potential danger/pain signal.

**Direction & evidence:**
- **Rough / harsh timbre → negative valence + defensive/aversion response.** Roughness triggers neural
  networks involved in aversion and can elicit defensive reactions even without context; it is a major
  component of perceived **musical tension** when instruments blend. 🟢
- **Sharpness (high-frequency energy >~1 kHz) decreases consonance** at the high end, while roughness
  decreases it at the low end — register itself modulates perceived consonance (Eerola & Lahdelma 2022). 🟡
- **Timbre alone changes perceived emotion** of an otherwise identical melody (Hailstone et al. 2009) —
  e.g., the same tune feels different on a violin vs a synth. 🟢
- **Warm/smooth/acoustic timbres → read as "safe"/soothing.** This aligns with the whole-track finding
  that high *acousticness* tracks lower arousal (see §9). 🟡

**Engine takeaway:** For calm/safety/sleep goals, prefer **smooth, low-roughness, low-sharpness, acoustic**
timbres; avoid distorted/bright/harsh spectra. Roughness and brightness are levers for *tension/arousal*,
not just genre flavor.

---

## 5. Dynamics & Loudness — the most direct arousal lever

**Mechanism.** Acoustic intensity drives perceived arousal **causally** (not just correlationally).
Sudden loud onsets engage the acoustic startle reflex (a brainstem-mediated defensive spike in HR/BP).

**Direction & evidence (Olsen, Dean et al. 2011, PLOS ONE):** When the intensity profile of a piece was
**inverted while holding other features constant**, perceived arousal **inverted with it** — establishing
causality. Quantitatively: a one-unit intensity change produced **~0.34 units** of arousal change at the
first lag; model correlation between intensity and perceived-arousal time series ≈ **0.86**; the effect
held across tonal piano, atonal piano, and electroacoustic noise. Intensity is described as *the* major
influence on within-piece arousal across styles. 🟢

**Startle / sudden change:** The acoustic startle reflex scales with stimulus intensity (Carlsen et al.,
PMC8655082, which documents the *motor* response — the HR/BP cardiovascular spike and the classic ~110 dB
elicitor figure are from the broader startle literature, not that paper). A sudden loud onset abruptly
raises HR and BP; even sub-startle sudden dynamic changes raise arousal/orienting. 🟢

**Engine takeaway:** Loudness/intensity is the **fastest within-track arousal control**. For calm goals,
prefer steady, low dynamic range; avoid abrupt loud onsets (startle risk). For energize, rising intensity
profiles work. This maps cleanly to Spotify *loudness* and *energy*.

---

## 6. Pitch / Melody & Frequency — register, contour (and the 432 Hz myth)

**Mechanism.** Pitch height and melodic direction are affective cues; pitch relates **more to valence
than to arousal**.

**Direction & evidence:**
- **Higher register / pitch → more positive valence, lightness, excitement; lower → depth, seriousness,
  sadness.** Rising melodic contour → hope/anticipation/exhilaration; falling contour → introspection/
  relaxation/sorrow. These are robust descriptive associations in the music-emotion-mapping literature
  (the canonical low-level emotion features are *loudness, tempo, pitch level, pitch contour, texture,
  sharpness*). 🟡 (consistent direction; effect magnitudes vary by study/culture).
- **432 Hz vs 440 Hz tuning:** see *Debunked / overstated*. Short version: tiny, inconsistent
  cardiovascular signals in small pilots; **not** a meaningful engine parameter. 🔴
- **Binaural beats / isochronic tones:** see *Debunked / overstated*. EEG-entrainment evidence is
  null-heavy and inconsistent. 🔴

**Engine takeaway:** Use register/contour as **secondary valence cues**. Do **not** build features around
432 Hz or binaural beats as physiological levers — at most offer them as optional user-preference
"ambience," clearly not as evidence-backed brain entrainment.

---

## 7. Lyrics / Vocal Content — cognitive load and the irrelevant-speech effect

**Mechanism.** Lyrics are *language*, so they compete for verbal/phonological working memory (the
"irrelevant speech effect"): task-irrelevant speech disrupts verbal encoding even when you try to ignore
it. Lyrics also carry semantic mood content (can induce mood directly).

**Direction & evidence (de la Mora Velasco & Hirumi / "Should We Turn off the Music?" 2023, n≈113–123,
within-subjects, silence vs instrumental vs lyrical):**
- **Music *with lyrics* credibly impaired** verbal recall (**d ≈ −0.32**), visual recall (**d ≈ −0.33**),
  and reading comprehension (**d ≈ −0.19**). Arithmetic impairment (d ≈ −0.11) was not credible.
- **Instrumental music** had **minimal, non-credible** effects across tasks (verbal d ≈ −0.16, reading
  d ≈ +0.14). 🟢
- Listeners *correctly* judged lyrics as harmful but *mistakenly* believed instrumental music helped. 🟢
- **Lyrics in a familiar/native language are more distracting** than unfamiliar-language lyrics for
  verbal tasks (lyric semantics get processed). 🟡

**Engine takeaway:** For **focus/study/cognitive** goals, prefer **instrumental / lyric-free** (high
*instrumentalness*). Lyrics are acceptable (even helpful for mood induction) for non-verbal-task goals
(exercise, mood-lift, social) where semantic content reinforces the target mood. Bias against
native-language lyrics specifically when the user is doing verbal work.

---

## 8. Predictability / Complexity / Familiarity — the inverted-U and the reward of the known

**Mechanism.** Berlyne's inverted-U: liking rises with complexity/novelty up to an optimum, then falls.
Two opposing systems — a reward system responding to moderate arousal/novelty, and an aversion system
that kicks in past a critical point (boredom on one side, overload on the other).

**Direction & evidence:**
- **Inverted-U is well-supported:** a review of 57 music-preference studies found **~88% (50/57)
  compatible** with a (segmented) inverted-U model (Chmiel & Schubert 2017). 🟢
- **Familiarity / repetition increases liking** via the mere-exposure effect (habituation factor), until
  over-exposure causes tedium — itself an inverted-U over repetitions (well established in the
  preference literature; see Chmiel & Schubert 2017 and the mere-exposure tradition). 🟢
  *Caveat on the neuroimaging evidence:* a neuroimaging meta-analysis (Freitas et al. 2018, 11 studies,
  n=212) found familiar music engaged a **motor / audio-motor synchronization** pattern (SFG, ventral-
  lateral thalamus, SMA) and reported **little evidence that limbic/reward engagement was modulated by
  familiarity** (results non-significant after correction). So familiarity reliably drives *liking and
  engagement* behaviorally, but the claim that it "engages reward circuitry" is **not** supported by
  Freitas — don't over-attribute. 🟡
- This is *why* self-selected/familiar music outperforms experimenter-chosen music for relaxation (see
  the companion stress doc). 🟢

**Engine takeaway:** Bias toward the user's **familiar/liked catalog** for reliable affect, but inject
**moderate novelty** to stay on the up-slope of the inverted-U and avoid tedium. Complexity should be
*moderate*, tuned to the user and goal (lower complexity for calm/focus, more for engagement).

---

## 9. Acoustic-Feature Proxies (Spotify-style) — what they really measure, and validity limits

Spotify's track features are convenient proxies for the underlying musical properties above, but their
validity is **uneven** — use them with the right confidence weight.

**What the validation literature shows:**
- **Energy & valence correlate with human ratings** — **strong** for arousal/energy, **moderate** for
  valence. These are the most trustworthy. 🟢/🟡
- **Danceability does *not* track human "danceability" ratings well** — treat with caution. 🔴
- For predicting affect: **loudness + danceability** predict valence; **acousticness + danceability**
  predict arousal; **valence + energy** are the dominant predictors overall in emotion-classification
  models. (Note: these are model-internal importances, not ground-truth human validity.) 🟡

**Mapping to underlying properties:**

| Spotify feature | Underlying musical property | Best used for |
|---|---|---|
| `tempo` | BPM (§1) | arousal + movement/exercise targeting |
| `loudness` | acoustic intensity (§5) | within/between-track arousal |
| `energy` | intensity + density + timbral activity | arousal (most reliable) |
| `valence` | mode + harmony + brightness (§2,§4,§6) | mood-valence target (moderate validity) |
| `acousticness` | smooth/warm timbre, low roughness (§4) | calm/"safety" |
| `instrumentalness` | absence of lyrics/vocals (§7) | focus / lyric-free goals |
| `danceability` | groove/pulse/syncopation (§3) | movement urge — **low validity, weight lightly** |
| `mode` | major/minor (§2) | valence direction |

**Engine takeaway:** Trust **energy/loudness/tempo** most for *arousal*; trust **valence/mode** for
*valence* with moderate weight; **down-weight danceability** and corroborate it with tempo + energy.

---

## 10. Music for Focus / Flow — what holds up, what doesn't

**What the evidence supports (modestly):**
- **Instrumental, lyric-free, steady, moderate-tempo** music is the safe choice for cognitive work —
  not because it boosts performance directly, but because **lyrics actively hurt** verbal tasks (§7) and
  instrumental music is roughly *neutral*. A 2023 cognition study found lo-fi instrumental did **not
  credibly improve** any of four cognitive tasks, but also did not harm them — whereas lyrical music did
  harm. 🟢
- Any real benefit likely runs through the **arousal–mood route** (feeling calm/positive → better focus),
  not a special "focus frequency." 🟡

**What is overstated / debunked:** the "Mozart effect" — see below.

**Engine takeaway:** For focus goals, optimize for **instrumental + steady + moderate tempo + low
surprise**, and frame the benefit honestly as *removing distraction + supporting mood*, not as a cognitive
booster.

---

## Master table — Musical feature → effect

| Feature | Direction / range | Mechanism | Resulting brain / affect effect | Confidence | Cite |
|---|---|---|---|---|---|
| **Tempo (slow)** | 60–80 BPM | vagal/parasympathetic modulation, baroreflex | ↑HRV (RMSSD, HF, SD1), ↑BRS, calm | 🟢 | Bretherton 2019 |
| **Tempo (fast)** | 120–140 BPM | motor entrainment to pulse; cadence sync (±~2%) | ↑movement urge, exercise sync, ↑subjective arousal | 🟢 | Van Dyck 2015 |
| **Tempo→HR "entrainment"** | — | graded autonomic, *not* literal beat-locking | modest HR/HRV shift, not strict synchrony | 🟡 | Mütze 2018 |
| **Mode (major)** | — | strongest Western valence cue | ↑valence; ↑ventral-striatum reward | 🟢 | Pallesen 2005 |
| **Mode (minor)** | — | valence cue | ↓valence, melancholy/introspection | 🟢 | Pallesen 2005 |
| **Dissonance / roughness** | high | aversion network; sensory dissonance | ↑amygdala/hippocampus, unpleasant, tension, defensive | 🟢 | Koelsch/Pallesen; roughness lit. |
| **Consonance** | high | reward processing | ↑ventral striatum/insula, pleasant, "safe" | 🟢 | Koelsch |
| **Syncopation** | medium (inverted-U; index ~mid of 0–81) | predictability×surprise balance | max desire-to-move + pleasure ("groove") | 🟢 | Witek 2014 |
| **Beat anticipation** | clear pulse | dopaminergic reward | caudate (anticipation) → accumbens (peak) dopamine | 🟢 | Salimpoor 2011 |
| **Timbre (rough/bright/distorted)** | high roughness/sharpness | danger/pain signaling | ↑tension/arousal, ↓valence | 🟢 | Hailstone 2009; Eerola & Lahdelma 2022 |
| **Timbre (warm/acoustic)** | smooth, low roughness | predictable spectrum | ↓arousal, soothing/"safe" | 🟡 | roughness lit.; acousticness |
| **Loudness / intensity** | ↑ | direct causal arousal driver | ↑perceived arousal (~0.34/unit; r≈0.86 over time) | 🟢 | Olsen/Dean 2011 |
| **Sudden loud onset** | ~110 dB classic | acoustic startle reflex (brainstem) | abrupt ↑HR/BP, startle/orienting | 🟢 | startle lit. (HR/BP & 110 dB from broader lit., not PMC8655082) |
| **Pitch / register (high)** | ↑ | valence cue | ↑valence, lightness/excitement | 🟡 | emotion-map lit. |
| **Melodic contour (rising)** | ascending | expectancy/expression | hope/anticipation; falling → introspection/sorrow | 🟡 | emotion-map lit. |
| **Lyrics (verbal task)** | present, native language | irrelevant-speech / verbal WM load | ↓verbal & visual recall, ↓reading comp (d≈−0.2 to −0.33) | 🟢 | "Turn off the Music?" 2023 |
| **Instrumental (verbal task)** | lyric-free | minimal WM interference | ≈neutral on cognition; supports focus | 🟢 | same |
| **Complexity / novelty** | moderate (inverted-U) | reward vs aversion balance (Berlyne) | peak liking at moderate; ↓ at extremes (~88% of studies) | 🟢 | Chmiel & Schubert 2017 |
| **Familiarity / repetition** | familiar, not over-played | mere-exposure effect (behavioral); audio-motor synchronization, *not* robust limbic modulation | ↑liking & engagement (own inverted-U) | 🟢 liking / 🟡 neural | Chmiel & Schubert 2017; Freitas 2018 (motor, not reward) |
| **Spotify energy/loudness** | — | proxy for intensity | reliable arousal proxy | 🟢/🟡 | validation lit. |
| **Spotify valence/mode** | — | proxy for mode+harmony+brightness | moderate-validity valence proxy | 🟡 | validation lit. |
| **Spotify danceability** | — | proxy for groove | weak vs human ratings — down-weight | 🔴 | validation lit. |

---

## Debunked / overstated claims

- **Binaural beats "entrain" the brain. 🔴 Overstated.** Systematic review of 14 EEG studies (Ingendoh et
  al. 2023, PLOS ONE): only **5 supported** the entrainment hypothesis, **8 contradicted** it, **1 mixed**.
  Most lacked control groups; every study embedding beats in pink noise was null. Verdict: *"the research
  question cannot be settled"* and entrainment is *"of doubtful scientific tenability."* There are weak,
  inconsistent signals on anxiety/cognition (frequency- and timing-dependent), but **no reliable EEG
  entrainment**. Do not present as an evidence-backed brain lever.

- **432 Hz tuning is healthier/calmer than 440 Hz. 🔴 Overstated.** Only small pilots exist. A
  double-blind cross-over pilot (Calamassi & Pomponi 2019) reported a ~**−4.79 bpm** HR drop for 432 Hz vs
  440 Hz (p≈0.05); a 2025 cancer-patient cross-over trial found 432 Hz slightly out-edged 443 Hz on HR
  (median −3 vs −1 bpm) and HRV (+3 ms). Differences are **tiny, near-significance, and from small
  samples**; authors themselves call for larger RCTs. Treat as **not actionable** as an engine parameter.

- **The "Mozart effect" makes you smarter. 🔴 Debunked.** Pietschnig, Voracek & Formann (2010)
  meta-analysis (**~39 studies, >3,000 subjects**, *"Mozart effect–Shmozart effect"*) found **small effect
  sizes and little support**; studies by the originating lab showed effects **>3× larger** (publication/
  affiliation bias). The transient bump is an **arousal-and-mood artifact** (Schubert, even a Stephen King
  passage, can produce it if enjoyed), limited to one spatial task, and produces **no change in general IQ
  or reasoning**. Use the honest framing: *enjoyable, mood-lifting, arousing music can transiently aid
  some tasks — the composer is irrelevant.*

- **Heart rate literally locks to the beat. 🟡 Partially overstated.** Tempo modulates autonomic tone
  (real), but strict beat-to-beat cardiac synchronization to recorded music has little support; describe
  it as graded modulation, not entrainment.

---

## References

All URLs verified during preparation (2026-06-08).

**Tempo / entrainment / exercise**
- Bretherton B, Deuchars J, Windsor WL (2019). The Effects of Controlled Tempo Manipulations on Cardiovascular Autonomic Function. *Music & Science.* https://journals.sagepub.com/doi/10.1177/2059204319858281
- Van Dyck E et al. (2015). Spontaneous Entrainment of Running Cadence to Music Tempo. *Sports Medicine – Open.* https://link.springer.com/article/10.1186/s40798-015-0025-9
- Effects of music on the cardiovascular system (review). *Trends in Cardiovascular Medicine / ScienceDirect.* https://www.sciencedirect.com/science/article/pii/S1050173821000700
- Optimizing beat-synchronized running to music. *PLOS ONE.* https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0208702

**Mode / harmony / consonance-dissonance**
- Pallesen KJ et al. (2005). Emotion Processing of Major, Minor, and Dissonant Chords: An fMRI Study. https://www.researchgate.net/publication/7181581_Emotion_Processing_of_Major_Minor_and_Dissonant_Chords
- Music — Neurobiology of Sensation and Reward (Koelsch synthesis). *NCBI Bookshelf.* https://www.ncbi.nlm.nih.gov/books/NBK92781/
- Differential Processing of Consonance and Dissonance within the Human Superior Temporal Gyrus. *Frontiers in Human Neuroscience.* https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2016.00154/full

**Rhythm / groove / dopamine**
- Witek MAG et al. (2014). Syncopation, Body-Movement and Pleasure in Groove Music. *PLOS ONE.* https://pmc.ncbi.nlm.nih.gov/articles/PMC3989225/
- The sweet spot between predictability and surprise: musical groove in brain, body, and social interactions. *Frontiers in Psychology* (2022). https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.906190/full
- Salimpoor VN et al. (2011). Anatomically distinct dopamine release during anticipation and experience of peak emotion to music. *Nature Neuroscience.* https://www.semanticscholar.org/paper/Anatomically-distinct-dopamine-release-during-and-Salimpoor-Benovoy/263fd95ebfef83dea20b4cbf3b64df8990e605b3
- Salimpoor VN et al. (2013). Interactions between the nucleus accumbens and auditory cortices predict music reward value (the willingness-to-pay finding). *Science.* https://www.science.org/doi/10.1126/science.1231059
- From perception to pleasure: Music and its neural substrates. *PNAS.* https://www.pnas.org/doi/10.1073/pnas.1301228110

**Timbre / roughness**
- Hailstone JC et al. (2009). It's not what you play, it's how you play it: Timbre affects perception of emotion in music. *QJEP.* https://pmc.ncbi.nlm.nih.gov/articles/PMC2683716/
- Eerola T & Lahdelma I (2022). Register impacts perceptual consonance through roughness and sharpness. *Psychonomic Bulletin & Review.* https://link.springer.com/article/10.3758/s13423-021-02033-5 (open PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC9166839/)
- Evidence for a universal association of auditory roughness with musical stability. *PLOS / PMC.* https://pmc.ncbi.nlm.nih.gov/articles/PMC10511120/

**Dynamics / loudness / startle**
- Olsen KN, Dean RT et al. (2011). Acoustic Intensity Causes Perceived Changes in Arousal Levels in Music. *PLOS ONE.* https://pmc.ncbi.nlm.nih.gov/articles/PMC3080387/
- Response triggering by an acoustic stimulus increases with intensity and is best predicted by startle reflex activation. *PMC.* https://pmc.ncbi.nlm.nih.gov/articles/PMC8655082/

**Pitch / melody / emotion features**
- Music Characteristics Related to Perceived Valence/Arousal; Music Emotion Maps in Arousal-Valence Space. https://www.researchgate.net/publication/307909024_Music_Emotion_Maps_in_Arousal-Valence_Space

**Lyrics / cognitive load**
- de la Mora Velasco E, Hirumi A (2023). Should We Turn off the Music? Music with Lyrics Interferes with Cognitive Tasks. *Journal of Cognition.* https://pmc.ncbi.nlm.nih.gov/articles/PMC10162369/
- Impact of background music on reading comprehension: influence of lyrics language and study habits. *Frontiers in Psychology* (2024). https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1363562/full
- The effects of background music on neural responses during reading comprehension. *Scientific Reports* (2020). https://www.nature.com/articles/s41598-020-75623-3

**Complexity / familiarity (inverted-U)**
- Chmiel A, Schubert E (2017). Back to the inverted-U for music preference: A review of the literature. *Psychology of Music.* https://journals.sagepub.com/doi/10.1177/0305735617697507
- Freitas C et al. (2018). Neural Correlates of Familiarity in Music Listening: A Systematic Review and Neuroimaging Meta-Analysis. *Frontiers in Neuroscience.* https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2018.00686/full

**Spotify feature validity**
- Validating Spotify's 'Valence', 'Energy', and 'Danceability' Audio Features for Music Psychology Research (preprint). https://sciety.org/articles/activity/10.31234/osf.io/8gfzw_v2
- How Does the Spotify API Compare to the Music Emotion Recognition State-of-the-Art? https://www.researchgate.net/publication/352996336_How_Does_the_Spotify_API_Compare_to_the_Music_Emotion_Recognition_State-of-the-Art

**Focus / flow**
- (lyrics-interference references above, esp. de la Mora Velasco & Hirumi 2023)

**Debunked / overstated**
- Ingendoh RM, Posny ES, Heine A (2023). Binaural beats to entrain the brain? A systematic review. *PLOS ONE.* https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0286023
- Garcia-Argibay M et al. (2019). Efficacy of binaural auditory beats in cognition, anxiety, and pain perception: a meta-analysis. *Psychological Research / PubMed.* https://pubmed.ncbi.nlm.nih.gov/30073406/
- Calamassi D, Pomponi GP (2019). Music Tuned to 440 Hz Versus 432 Hz and the Health Effects: A Double-blind Cross-over Pilot Study. *EXPLORE / PubMed.* https://pubmed.ncbi.nlm.nih.gov/31031095/
- Differential effects of sound interventions tuned to 432 Hz or 443 Hz on cardiovascular parameters in cancer patients: a randomized cross-over trial. *BMC Complementary Medicine and Therapies* (2025). https://link.springer.com/article/10.1186/s12906-025-04758-5 (open PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC11755923/)
- Pietschnig J, Voracek M, Formann AK (2010). Mozart effect–Shmozart effect: A meta-analysis. *Intelligence.* https://www.sciencedirect.com/science/article/abs/pii/S0160289610000267
- Mozart effect (overview & sourcing). *Wikipedia.* https://en.wikipedia.org/wiki/Mozart_effect
- Mütze H, Kopiez R & Wolf A (2018). The effect of a rhythmic pulse on the heart rate: Little evidence for rhythmical 'entrainment' and 'synchronization'. *Musicae Scientiae.* https://www.researchgate.net/publication/329767633_The_effect_of_a_rhythmic_pulse_on_the_heart_rate_Little_evidence_for_rhythmical_'entrainment'_and_'synchronization'
