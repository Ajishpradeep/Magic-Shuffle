# Magic Shuffle — Research Source 01

## The Neurochemistry & Neuroscience of How Music Changes Brain State and Mood

> Companion to `docs/research/music-wellness-research.md` (the physiology / wearable /
> ISO-principle briefing). **That** document covers the *body* (autonomic nervous system,
> HRV, the circumplex). **This** document covers the *brain*: which neurochemical systems
> and circuits music recruits, what felt-state each produces, and — critically for the
> recommendation engine — the **reverse mapping**: "for a human to feel X, what neural /
> chemical event must occur, and what musical lever drives it?"

*Prepared 2026-06-08. Every quantitative claim and mechanism below is tied to a
peer-reviewed primary study, meta-analysis, or major review (Nature/Science/PNAS/Nature
Reviews Neuroscience/PMC). Confidence levels and literature contradictions are flagged
inline. URLs are listed in full under **References**.*

**Reading the confidence tags:** **[High]** = replicated primary evidence + reviews;
**[Moderate]** = solid primary evidence, some inconsistency or small samples;
**[Contested]** = real evidence but active disagreement / failed replications;
**[Indirect]** = inferred from adjacent literature, not directly measured for music.

---

## 1. The major neurochemical systems music modulates

### 1.1 Dopamine — anticipation, reward, "chills", motivation **[High]**

Dopamine is the best-established neurochemical substrate of musical pleasure, and the one
the product leans on most.

- **PET evidence of release.** Salimpoor et al. (2011, *Nature Neuroscience*) used
  `[11C]raclopride` PET (which detects endogenous dopamine binding) plus fMRI on the same
  listeners. Music that reliably produced "chills" caused measurable **endogenous dopamine
  release in the striatum** at moments of peak emotional arousal — the first demonstration
  that an *abstract* stimulus (no survival value, no calories) triggers the same
  dopaminergic reward system as food, sex, and drugs.
- **Anatomical dissociation — the key product insight.** The same study found a *temporal
  and spatial split*: the **caudate (dorsal striatum)** is more active during the
  **anticipation** phase (the build-up before a peak), while the **nucleus accumbens
  (NAcc, ventral striatum)** is more active during the **peak "chills" experience itself**.
  So *anticipation* and *consummation* are neurochemically distinct events — a song that
  only ever resolves, with no build-up, under-recruits the anticipatory dopamine loop.
- **NAcc predicts reward value / purchase decisions.** Salimpoor et al. (2013, *Science*)
  scanned listeners hearing **60 previously unheard** excerpts and had them bid real money
  in an auction. **NAcc activity was the single best predictor of how much a person would
  pay** for novel music, and reward value was driven by *functional connectivity between
  the NAcc and auditory cortices* (plus PFC). Reward isn't in the sound — it's in the
  dialogue between the sound-analysis system and the valuation system.
- **Causal proof (not just correlation).** Ferreri et al. (2019, *PNAS*) ran a
  double-blind within-subject pharmacology study (n=27): **levodopa** (boosts dopamine)
  *increased* both the pleasure of music **and** willingness to pay for it, while
  **risperidone** (dopamine antagonist) *reduced* both. This moves dopamine from
  "correlated with" to **causally necessary for** musical pleasure and motivation.

> **Product takeaway:** "feeling motivated/uplifted" is a dopaminergic event. It is driven
> by *build-up + payoff structure* (caudate→NAcc) and by *liking/novelty within a
> familiar frame*. Tracks that set up and then satisfy expectations are the lever.

### 1.2 Endogenous opioids / β-endorphins — pleasure & analgesia **[Contested]**

- **Naltrexone blockade.** Mallik, Chanda & Levitin (2017, *Scientific Reports*) gave the
  μ-opioid antagonist **naltrexone** to participants listening to their own chills-inducing
  music. They reported reduced subjective pleasure for *pleasurable* (but not neutral)
  music, plus reduced zygomaticus (smile) and corrugator (frown) facial-EMG activity —
  implicating endogenous opioids in the *hedonic "liking"* component (distinct from
  dopaminergic "wanting").
- **Contradiction / caution.** A follow-up naltrexone study ("'Defrosting' music chills",
  2021, *Consciousness & Cognition*) and other pharmacological work **failed to replicate
  the subjective-pleasure effect**, finding opioid modulation mainly on physiological
  arousal markers rather than reported enjoyment. **Treat the opioid→liking link as real
  but not settled.** The dopamine evidence is far stronger.

### 1.3 Cortisol & the HPA axis — stress down-regulation **[Moderate, with a notable contradiction]**

- Music is repeatedly associated with **lowered salivary cortisol** and dampened
  hypothalamic–pituitary–adrenal (HPA) axis output, the canonical mechanism behind
  "music relaxes me." Reviews tie this to parasympathetic engagement and reduced pain /
  stress perception.
- **Important contradiction to respect.** Thoma et al. (2013, *PLOS ONE*), a well-designed
  RCT (n=60 women) using the Trier Social Stress Test, found cortisol response **differed
  by condition (p=0.025) but was *highest* in the relaxing-music group** — the opposite of
  the hypothesis — while music *did* speed recovery of **salivary alpha-amylase** (a
  sympathetic/autonomic marker; baseline reached at +25 min vs +40 min, p=0.026). Lesson:
  music's autonomic (alpha-amylase / vagal) effects are more robust than its HPA/cortisol
  effects, and **context, control of music, and timing matter**. Don't over-promise
  cortisol reduction; the autonomic story (see physiology doc) is stronger.

### 1.4 Oxytocin — bonding, trust, social warmth **[Moderate; strongest for active/social music]**

- Keeler et al. (2015, *Frontiers in Human Neuroscience*): **group singing** raised plasma
  **oxytocin** (notably after *improvised* singing) and lowered **ACTH** (an HPA/stress
  marker), producing "social flow." Oxytocin is the social-bonding/trust signal.
- Fancourt et al. (2016, *ecancermedicalscience*): single sessions of group singing in
  cancer patients/carers modulated cortisol, cytokines, and neuropeptide (incl. oxytocin)
  activity.
- A 2025 systematic review (*Frontiers in Cognition*) concludes music's oxytocin effects
  are **context-dependent** — strongest when music is *social and participatory* (singing,
  synchrony, group movement), weaker for solitary passive listening.

> **Product takeaway:** "feeling socially warm/connected" is an oxytocin-linked state, evoked
> mainly by **shared, synchronous, participatory** music — a hook for any future social/synced-
> listening feature, less so for solo passive playback. Note the 2025 review stresses the
> oxytocin response is **bidirectional and context-dependent** (group singing *raised* it in
> older adults but *lowered* it in young adults; slow music raised it, vigorous singing
> suppressed it) — so don't treat "social music → more oxytocin" as a guarantee.

### 1.5 Serotonin — mood / wellbeing **[Indirect / weak direct evidence]**

- Direct human evidence is thin. Evers & Suhr (2000, *Eur. Arch. Psychiatry Clin.
  Neurosci.*) used **platelet 5-HT** as a peripheral proxy: pleasant music was associated
  with higher platelet 5-HT content (interpreted as *less* release) vs unpleasant music,
  which was correlated with rated unpleasantness. This is a small, indirect peripheral
  measure — **do not overstate it.** Serotonin's role in music-induced mood is plausible
  and consistent with its general mood role, but not strongly demonstrated for music
  specifically.

### 1.6 Norepinephrine / adrenaline & sympathetic arousal — alertness, energy **[High for the autonomic effect; NE inferred]**

- Tempo is the dominant arousal lever. Bernardi et al. (2006, *Heart*) and follow-ups show
  **faster tempi raise ventilation, blood pressure, heart rate, and cerebral blood flow**
  (sympathetic activation); slower tempi shift toward parasympathetic dominance, and
  *silence/pauses* drop arousal below baseline. The sympathetic arm implies
  noradrenergic/adrenergic engagement, though catecholamines are usually inferred from
  autonomic measures rather than assayed directly. **[NE itself: Indirect.]**
- This is the engine behind "energize" goals: fast, high-energy music → sympathetic /
  noradrenergic arousal → alertness and readiness to move.

### 1.7 GABA / anxiolysis & melatonin / sleep **[Indirect → Moderate]**

- **GABAergic anxiolysis [Indirect].** Music's calming/anxiolytic effect is frequently
  framed as GABAergic (the same inhibitory system targeted by benzodiazepines), but this is
  largely *inferred* from anxiolytic outcomes and parasympathetic shifts rather than
  measured GABA in humans. Treat "calm = ↑GABAergic tone" as a mechanistic model, not a
  directly demonstrated music finding.
- **Melatonin / sleep [Moderate, but mechanism is NOT melatonin].** A meta-analysis (13
  RCTs, n=1,007; *Cochrane*-style PSQI analysis) found **moderate-certainty** evidence that
  music improves subjective sleep quality, reduces sleep-onset latency, and increases sleep
  efficiency — with slow (60–80 BPM), soft, instrumental music most effective. **However,
  melatonin findings are mixed** — the main cited study found no change, but one ICU study
  found an *increase* — so the sleep benefit is not reliably attributable to melatonin; it
  appears to run through *arousal reduction / parasympathetic calming* (light, not sound, is
  the primary driver of melatonin). Don't attribute music's sleep benefit to melatonin.

---

## 2. Brain regions & circuits, and their roles

| Region | Role in music → mood | Evidence |
|---|---|---|
| **Nucleus accumbens (NAcc, ventral striatum)** | Core reward / pleasure hub; codes the **peak "chills"** response and **reward prediction errors**; predicts reward value & purchase | Salimpoor 2011/2013; Gold 2019 |
| **Ventral tegmental area (VTA)** | Dopamine *source* projecting to NAcc/striatum (mesolimbic pathway) | Mesolimbic reward model; Zatorre/Salimpoor reviews |
| **Caudate (dorsal striatum)** | **Anticipation** phase of musical reward (build-up before peak) | Salimpoor 2011 |
| **Auditory cortex (superior temporal)** | Sound analysis; its **connectivity to NAcc** (not its activity alone) sets reward value; under-connected in musical anhedonia | Salimpoor 2013; Martínez-Molina 2016 |
| **Amygdala** | Emotional salience; threat/fear vs pleasantness; modulated up/down by music | Koelsch 2014 |
| **Hippocampus** | Memory & familiarity; autobiographical/episodic links that make familiar music rewarding | Koelsch 2014 |
| **Prefrontal / orbitofrontal cortex** | Expectation, valuation, emotion regulation; integrates prediction with reward | Koelsch 2014; Salimpoor 2013 |
| **Insula** | Interoception; links bodily arousal to felt emotion | Koelsch 2014 |
| **Hypothalamus** | Autonomic + **endocrine** output (HPA axis, cortisol, oxytocin pathways) | Koelsch 2014 |
| **Basal ganglia (esp. putamen) + SMA/pre-SMA** | **Beat perception & internal beat generation**; auditory–motor entrainment ("the urge to move") | Grahn & Brett 2007; Grahn 2009; meta-analysis PMC9195154 |
| **Cerebellum** | Tracking complex rhythms; synchronizing to an external beat | Grahn reviews; entrainment review PMC11592450 |

Koelsch (2014, *Nature Reviews Neuroscience*) is the anchor review: music modulates
**amygdala, NAcc, hypothalamus, hippocampus, insula, cingulate, and orbitofrontal cortex**
— i.e. essentially the full core emotion network.

---

## 3. Reward-prediction, expectancy & the predictive-coding model **[High]**

This is the unifying mechanistic theory and the deepest justification for the ISO-principle
and "build-up → payoff" track structure.

- Musical pleasure is driven by **prediction**: the brain constantly forecasts the next
  musical event; **tension, surprise, and resolution** are violations and confirmations of
  those forecasts. **Reward prediction errors (RPEs)** — the gap between expected and
  actual events — drive phasic dopamine in the NAcc.
- **Direct test:** Gold et al. (2019, *PNAS*) had participants learn cue→music
  (consonant/dissonant) associations. **NAcc activity tracked formally modeled musical
  RPEs**, and the degree of match explained individual **learning rates** (RPE signal in
  right NAcc explained ~31% of variance in learning). So abstract musical surprises behave
  exactly like food/money RPEs and *support learning* — predictive processing underlies
  musical reward, not just concrete rewards.
- **Implication for the engine:** maximal pleasure comes from music that is **predictable
  enough to forecast but surprising enough to violate expectations and resolve** — an
  optimal balance of expectancy and surprise. Pure predictability (boring) and pure
  unpredictability (noise) both under-reward. *This is the theoretical backbone for both
  (a) leaning on familiarity and (b) not playing the identical loop forever.*

---

## 4. Reverse mapping — "to FEEL X, the brain must do Y" (and the musical lever)

This is the table the recommendation engine reasons over. Read it as:
**desired feeling → required neural/chemical event → musical/contextual trigger → confidence.**

| To make the user feel… | The brain/body must… | Musical / contextual lever | Confidence |
|---|---|---|---|
| **Calm / relaxed** | ↑ parasympathetic (vagal) tone; ↓ sympathetic; presumed ↑GABAergic inhibition; ↓ HPA/cortisol output | Slow tempo **60–80 BPM**, soft/instrumental, high acousticness, low energy, familiar; pauses/silence further lower arousal | High (autonomic); Indirect (GABA); Moderate (cortisol — see §1.3 contradiction) |
| **Motivated / energized** | Dopaminergic reward (caudate→NAcc) **+** sympathetic/noradrenergic arousal | Fast tempo (100–130+ BPM), high energy, strong beat, build-up→payoff structure, high-valence | High |
| **Happy / uplifted** | Dopamine (reward) **+** positive-valence appraisal; serotonergic mood support (weak) | Major mode, high valence, preferred/familiar tracks with satisfying resolution | High (dopamine/valence); Indirect (serotonin) |
| **Euphoric / "chills"** | **NAcc** dopamine *peak* preceded by **caudate** anticipation; μ-opioid "liking" | Strong tension→release / build-up→drop; personally peak-inducing tracks | High (DA); Contested (opioid) |
| **Socially warm / connected** | **Oxytocin** release; ↓ACTH | **Participatory/synchronous** music — singing, group, synced/shared listening | Moderate (strongest for active/social) |
| **Focused / attentive** | **Optimal mid-arousal** (Yerkes–Dodson inverted-U); balanced dopamine/NE; reduced mind-wandering / default-mode interference | Moderate-arousal, low-distraction (instrumental/familiar) background music; avoid over- or under-arousing extremes | Moderate |
| **Sleepy / wind-down** | ↓ arousal, ↑ parasympathetic (NOT via melatonin) | Slow (60–80 BPM), soft, instrumental, simple structure; decreasing energy arc | Moderate |
| **Emotionally moved (incl. pleasant sadness)** | Amygdala + hippocampus (memory/familiarity) + reward network co-engagement | Familiar, autobiographically-loaded, expressive music; minor mode can heighten poignancy | Moderate |

> **Cross-reference:** these map onto the circumplex (valence × arousal) and `GOAL_TARGETS`
> in `src/lib/affect.js` described in `music-wellness-research.md`. This document supplies
> the *neurochemical why* behind those audio-feature targets.

---

## 5. Neurochemical → felt-state cheat sheet

| Chemical / system | Primary brain region(s) | Musical / contextual trigger | Resulting feeling | Key citation |
|---|---|---|---|---|
| **Dopamine (anticipation)** | Caudate (dorsal striatum), VTA | Build-up / expectation before a peak | Craving, pleasurable anticipation | Salimpoor 2011 |
| **Dopamine (peak)** | Nucleus accumbens (ventral striatum) | Tension-release, the "drop", chills moment | Euphoria, "chills", reward | Salimpoor 2011; Ferreri 2019 (causal) |
| **Dopamine (valuation)** | NAcc ↔ auditory cortex ↔ PFC | Liking a (even novel) track | "I'd play/buy this again" (motivation) | Salimpoor 2013 |
| **β-endorphin / μ-opioid** | Reward circuit (opioid receptors) | Highly pleasurable, chills-inducing music | Hedonic "liking", warmth, analgesia | Mallik 2017 *(contested)* |
| **Oxytocin** | Hypothalamic pathways | Group/synchronous singing & music-making | Bonding, trust, social warmth | Keeler 2015 |
| **Cortisol (↓) / HPA** | Hypothalamus → HPA axis | Relaxing, self-selected music | Reduced stress (effect inconsistent) | Thoma 2013 *(contradiction)* |
| **Serotonin** | Central (proxy: platelets) | Pleasant vs unpleasant music | Mood/wellbeing | Evers & Suhr 2000 *(indirect)* |
| **Norepinephrine / sympathetic** | Autonomic (LC inferred) | Fast tempo, high energy | Alertness, arousal, drive to move | Bernardi 2006 |
| **GABA (inferred)** | Inhibitory cortical/limbic | Slow, soft, predictable music | Calm, anxiolysis | Sleep/anxiolysis reviews *(indirect)* |
| **(Beat/entrainment, not a single chemical)** | Putamen, SMA/pre-SMA, cerebellum | Strong, regular beat | Urge to move; groove; arousal coupling | Grahn & Brett 2007 |

---

## 6. Individual variability — why one playlist won't fit everyone **[High]**

- **Specific musical anhedonia is real and selective.** Martínez-Molina et al. (2016,
  *PNAS*) showed people who get no pleasure from music — but normal reward from money/food —
  have **reduced functional connectivity between auditory cortex and NAcc** and blunted NAcc
  response *to music specifically*. Reward circuitry is intact; the *auditory→reward link*
  is weak. An estimated **~3–5%** of people are musical anhedonics (prevalence per Mas-Herrero
  et al. 2013 / Marco-Pallarés; the 2016 paper itself reports only "a small percentage").
  **Implication: a minority of users will not respond to the reward/chills mechanisms at all.**
- **Trait variation is measurable.** The **Barcelona Music Reward Questionnaire (BMRQ)**
  scores five facets (musical seeking, emotion evocation, mood regulation, social
  reinforcement, sensory-motor). Music reward sensitivity is a continuous trait, not
  all-or-none — a candidate for future personalization.
- **Familiarity / memory is a dominant moderator.** Hippocampal memory and prior exposure
  strongly shape the reward response; familiar/preferred music is the most reliable lever
  (consistent with §3 predictive coding: familiarity gives the brain a model to predict
  *against*). This echoes the physiology doc's finding that self-selected music outperforms
  experimenter-chosen.
- **Genetics / individual neurochemistry** modulate baseline dopaminergic tone and thus how
  strongly reward mechanisms fire (consistent with the Ferreri pharmacology results, where
  shifting dopamine shifted everyone's pleasure). **[Moderate.]**

---

## 7. Confidence summary & contradictions to respect

- **Strongest, build on it freely:** dopamine → musical reward/pleasure/motivation
  (correlational *and* causal); the caudate-anticipation / NAcc-peak split; NAcc↔auditory
  connectivity setting value; predictive-coding/RPE account; tempo→autonomic arousal;
  beat→motor-network entrainment; musical anhedonia.
- **Real but qualified:** oxytocin (mainly for *social/active* music); sleep benefit
  (real, but **not** via melatonin — via arousal reduction); cortisol reduction
  (**contradicted** by Thoma 2013 — autonomic markers are more reliable than HPA/cortisol).
- **Weak / inferred — do not overstate:** serotonin (one small peripheral-proxy study);
  GABA (inferred, not measured for music); β-endorphin/opioid *subjective-pleasure* effect
  (failed replications).
- **Headline contradiction:** the popular "music lowers cortisol" claim is **not robust** —
  Thoma et al. found the opposite direction for cortisol while confirming autonomic
  benefit. Frame stress relief around the **autonomic / parasympathetic** story, not
  cortisol.

---

## References

*All URLs below were fetched or returned by search during preparation on 2026-06-08.*

**Dopamine / reward / striatum**
- Salimpoor et al. (2011) — Anatomically distinct dopamine release during anticipation and experience of peak emotion to music. *Nature Neuroscience.* https://www.nature.com/articles/nn.2726
- Salimpoor et al. (2013) — Interactions between the nucleus accumbens and auditory cortices predict music reward value. *Science.* https://www.science.org/doi/10.1126/science.1231059
- Ferreri et al. (2019) — Dopamine modulates the reward experiences elicited by music (levodopa/risperidone causal study). *PNAS.* https://www.pnas.org/doi/10.1073/pnas.1811878116
- Zatorre & Salimpoor (2013) — From perception to pleasure: Music and its neural substrates. *PNAS.* https://www.pnas.org/doi/10.1073/pnas.1301228110

**Reward prediction error / predictive coding**
- Gold et al. (2019) — Musical reward prediction errors engage the nucleus accumbens and motivate learning. *PNAS.* https://www.pnas.org/doi/10.1073/pnas.1809855116 (PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC6386687/)

**Endogenous opioids / β-endorphin**
- Mallik, Chanda & Levitin (2017) — Anhedonia to music and mu-opioids: Evidence from the administration of naltrexone. *Scientific Reports.* https://www.nature.com/articles/srep41952 (PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC5296903/)
- ('Defrosting' music chills with naltrexone) (2021) — *Consciousness & Cognition* (contradictory follow-up). https://pubmed.ncbi.nlm.nih.gov/33711654/

**Cortisol / HPA axis / autonomic**
- Thoma et al. (2013) — The effect of music on the human stress response. *PLOS ONE.* https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0070156

**Oxytocin / social bonding**
- Keeler et al. (2015) — The neurochemistry and social flow of singing: bonding and oxytocin. *Frontiers in Human Neuroscience.* https://pmc.ncbi.nlm.nih.gov/articles/PMC4585277/
- Fancourt et al. (2016) — Singing modulates mood, stress, cortisol, cytokine and neuropeptide activity in cancer patients and carers. https://pmc.ncbi.nlm.nih.gov/articles/PMC4854222/
- (2025) — Music's context-dependent influence on oxytocin, social bonding, and emotion regulation: a systematic review. *Frontiers in Cognition.* https://www.frontiersin.org/journals/cognition/articles/10.3389/fcogn.2025.1678665/full

**Serotonin**
- Evers & Suhr (2000) — Changes of the neurotransmitter serotonin but not of hormones during short time music perception. *Eur. Arch. Psychiatry Clin. Neurosci.* https://link.springer.com/article/10.1007/s004060070031

**Norepinephrine / tempo / autonomic arousal**
- Bernardi et al. (2006) — Cardiovascular, cerebrovascular, and respiratory changes induced by different types of music in musicians and non-musicians: the importance of silence. *Heart.* https://pmc.ncbi.nlm.nih.gov/articles/PMC1860846/
- (2015) — Sympathetic tone induced by high acoustic tempo requires fast respiration. *PLOS ONE.* https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0135589

**Sleep / melatonin**
- Listening to music for insomnia in adults (meta-analysis, 13 RCTs). *PMC/NIH.* https://pmc.ncbi.nlm.nih.gov/articles/PMC9400393/
- Meta-narrative review: the impact of music therapy on sleep. *Frontiers in Neurology.* https://pmc.ncbi.nlm.nih.gov/articles/PMC11746032/

**Brain emotion network / review**
- Koelsch (2014) — Brain correlates of music-evoked emotions. *Nature Reviews Neuroscience.* https://www.nature.com/articles/nrn3666 (open PDF: https://stefan-koelsch.de/papers/koelsch_2014_brain_music_emotion.pdf)

**Rhythm / beat / motor entrainment**
- Grahn & Brett (2007) — Rhythm and beat perception in motor areas of the brain. https://pubmed.ncbi.nlm.nih.gov/17488212/
- Grahn (2009) — The role of the basal ganglia in beat perception. *Ann. N.Y. Acad. Sci.* https://pubmed.ncbi.nlm.nih.gov/19673753/ *(Note: PMID 19673753 is Grahn's single-author review; the co-authored Grahn & Rowe 2009 "Feeling the Beat" is J. Neurosci. — https://pmc.ncbi.nlm.nih.gov/articles/PMC2702750/)*
- Identifying a brain network for musical rhythm: a neuroimaging meta-analysis. *PMC.* https://pmc.ncbi.nlm.nih.gov/articles/PMC9195154/
- From sound to movement: neural mechanisms of auditory–motor entrainment. *PMC.* https://pmc.ncbi.nlm.nih.gov/articles/PMC11592450/

**Focus / attention / arousal-mood hypothesis (Yerkes–Dodson)**
- The role of mood and arousal in the effect of background music on attentional state and performance. *Scientific Reports.* https://www.nature.com/articles/s41598-024-60218-z (PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC11045806/)
- The effect of preferred background music on task-focus in sustained attention. *PMC.* https://pmc.ncbi.nlm.nih.gov/articles/PMC8357712/

**Individual variability / musical anhedonia**
- Martínez-Molina et al. (2016) — Neural correlates of specific musical anhedonia. *PNAS.* https://www.pnas.org/doi/10.1073/pnas.1611211113 (PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC5135354/)
- Mas-Herrero et al. (2013) — Individual differences in music reward experiences (BMRQ; ~3–5% specific musical anhedonia prevalence). *Music Perception.* https://online.ucpress.edu/mp/article/31/2/118/62269
