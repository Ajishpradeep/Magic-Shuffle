# 05 — Clinical Frameworks, Evidence Quality, Dosage, Individual Differences & Safety

> **Purpose.** This document grounds Magic Shuffle's mood-regulation claims in the
> *clinical* music-therapy and music-medicine literature. It separates **strong evidence
> (Cochrane reviews / meta-analyses with effect sizes)** from **weaker, contested, or
> marketing-grade claims**, specifies **dosage/protocol** parameters, and defines the
> **safety guardrails** a non-medical wellbeing app must respect.
>
> **Scope note / disclaimer.** Magic Shuffle is a **general-wellness product**, not a
> medical device. The frameworks below come from *clinical* music therapy (delivered by
> credentialed therapists) and *music medicine* (listening interventions in care settings).
> An app that plays recorded music is closest to **receptive music medicine** — the weaker,
> most generalizable end of this evidence base. We borrow the *principles* (ISO, entrainment,
> dosage, personalization) but must **not** inherit the clinical *claims*. See the Safety
> section and the FDA general-wellness boundary at the end.
>
> *Prepared 2026-06-08. Companion to `../music-wellness-research.md` (mechanisms, audio
> features, biometrics) and the design docs under `../../design/`.*

---

## 1. Established clinical frameworks

| Framework | What it is | Active or receptive | Evidence base (tier) |
|---|---|---|---|
| **ISO-principle** | Match music to the listener's *current* mood/arousal, then gradually shift the music toward the target state. Coined by psychiatrist **Ira Altshuler (1948)** at Eloise Hospital, MI. | Either | Foundational *method*, not a single RCT outcome. Small controlled/experimental studies support it (see §1.1). |
| **Neurologic Music Therapy (NMT)** — incl. **Rhythmic Auditory Stimulation (RAS)** | Standardized, neuroscience-based techniques (Thaut). RAS uses a fixed auditory pulse to **entrain** motor timing for gait/movement rehab (stroke, Parkinson's). | Active (sensorimotor) | **Strongest** for *motor* outcomes — multiple meta-analyses (§1.2). Not a mood-regulation tool per se. |
| **Bonny Method of Guided Imagery and Music (GIM / BMGIM)** | Therapist-guided imagery while the client listens to programmed classical music in an altered state; depth-psychotherapy. Helen Bonny, 1970s. | Receptive | Promising but **small** evidence base; one systematic review (§1.3). |
| **Receptive vs. active music therapy** | *Receptive* = listening (the app's analogue). *Active* = playing, singing, improvising. | — | Both effective; for *anxiety*, receptive/combined methods outperform purely active ones (§3). |
| **Entrainment-based therapy** | Physiological rhythms (HR, breathing, gait) synchronize to an external periodic stimulus (the musical pulse). Underlies RAS and slow-tempo relaxation. | Either | Strong for *motor* entrainment; moderate for *cardiorespiratory* entrainment (see companion doc §1). |

### 1.1 ISO-principle
**Definition (primary source).** Altshuler (1948): *"Only after one has worked himself
'musically' into the mood or tempo of the mental patient, a shift to a different mood or
tempo can be made … this maneuver is known as the 'iso' principle."* The variant
**"iso-moodic"** matches the stimulus to the patient's existing mood, then changes it in
the desired direction.

**Evidence.** This is a *clinical method*, not a discrete intervention with a pooled effect
size. Support comes from a controlled sadness-induction experiment (Starcke et al., MDPI
2021) showing iso-principle sequencing modulates affect, and a 2024/2026 study in patients
with mood disorders (Starcke, Gebhardt & von Georgi). The **Heiderscheit & Madson (2015)**
case study in *Music Therapy Perspectives* documents its use in mood management.
**Tier: established method + small experimental/clinical evidence (not meta-analytic).**

### 1.2 Neurologic Music Therapy / RAS
RAS is the most *rigorously* validated NMT technique, but **for movement, not mood.**
Meta-analyses report significant improvements in spatiotemporal **gait** parameters and
balance in **Parkinson's disease** and **stroke** — gait *speed* and *stride length* in PD
(the PD meta-analysis found **cadence/step-frequency NOT significant**); cadence *is*
significant in the stroke review (MD 5.16). Effectiveness in PD is described as real but
somewhat **controversial / heterogeneous** across reviews.
**Tier: meta-analytic for motor outcomes; not a mood-regulation claim.** Relevance to
Magic Shuffle is the *entrainment principle*, not the clinical indication.

### 1.3 Bonny Method GIM
**Systematic review (McKinney & Honig, 2017, *Journal of Music Therapy*).** From 270 titles,
9 studies met criteria (8 at moderate/low risk of bias), n≈275, ages 18–78. **Psychological
outcomes** (anxiety, depression, mood disturbance, QoL): **medium-to-large effect sizes.**
**Physiological** (BP, β-endorphin, cortisol, pain): medium-to-large but **none replicated
across studies.** Conclusion: *promising* but needs replication.
**Tier: one systematic review, small N, unreplicated — moderate-but-thin.** Note: GIM
requires a trained therapist; the app cannot deliver it, only borrow the receptive-listening
idea.

---

## 2. Dosage & protocol parameters (concrete numbers)

These are the parameters Magic Shuffle should design around. Numbers are from clinical/
music-medicine literature; cite them as *guidance*, not guarantees.

| Parameter | Evidence-based value | Source / tier |
|---|---|---|
| **Single-session length (relaxation/stress)** | **≤ 30 min most effective**; HRV (HFnu) benefit roughly **doubles** for sessions ≤30 min vs longer (HFnu +14.25 vs +7.05 overall). | HRV meta-analysis (24 RCTs, n=1,295) — see companion doc §1. **Meta-analytic.** |
| **Session length (sleep/insomnia)** | **25–60 min, mean ≈ 36 min**, at/near bedtime. | Cochrane (Jespersen 2022): 10 RCTs, n=708. **Moderate certainty.** |
| **Time-to-effect (affect)** | Affect/arousal can shift within **~5 min** of listening; physiology (HR, HFnu) within a single session. | ISO experimental studies; HRV meta-analysis. **Moderate.** |
| **Intervention duration (sleep)** | Benefits seen across **3–90 days**; longer continued use trends better for sleep. | Cochrane (Jespersen 2022). **Moderate.** |
| **Intervention duration (anxiety, clinical)** | **2–3 weeks** often optimal in cancer-anxiety work; **min ~4 sessions / 4 weeks** suggested for schizophrenia dosage studies. **However**, a 2025 multilevel meta-analysis found session length, frequency, and *total number of sessions did **not** significantly moderate* anxiety effect — i.e., **flexible dosing is acceptable.** | Lancet eClinicalMedicine 2025 (51 trials); schizophrenia dosage review (Chung & Woods-Giscombe 2016). **Meta-analytic.** |
| **Single vs. repeated** | Single sessions produce *acute* affect/physiology shifts; repeated/higher-frequency exposure gives larger, more durable stress reduction in some populations — but the dose–response is **diagnosis-specific**, not universal. | Multiple SRs. **Mixed certainty.** |
| **Self-selected vs. prescribed** | Long assumed self-selected/familiar wins. **Nuance:** a major stress meta-analysis found *selection method did **not** significantly moderate the pooled effect*; researcher-pre-selected music with **specific characteristics (non-lyrical, 60–80 BPM, controlled intensity)** drove the *physiological* effect. Self-selected/familiar still strongly favored for *engagement* and *subjective* relaxation. | de Witte et al. 2020 (two meta-analyses); Groarke 2020. **Meta-analytic.** |
| **Tempo for relaxation** | **60–80 BPM** (near resting HR) for down-regulation; faster tempo for arousal/performance. | Companion doc §1; exercise meta-analysis (tempo: fast > slow for performance). |
| **Safe volume** | **≤ 80 dB for ≤ 40 h/week** (WHO/ITU adult standard); 85 dB ⇒ 8 h limit, halving per +3 dB. | WHO "Make Listening Safe". **Authoritative standard.** |

**Design takeaway:** default session blocks of **~20–30 min**, slow-tempo (~60–80 BPM)
acoustic/instrumental material for calming arcs, **lean on the user's familiar/preferred
catalog for engagement** while keeping the *acoustic recipe* (low energy, high acousticness,
sparse vocals) for physiological down-regulation. Don't over-promise from a single session.

---

## 3. Evidence-quality map

Effect-size convention: **SMD / Hedges' g** (≈0.2 small, 0.5 medium, 0.8 large), negative =
favoring music for symptom scales. "Certainty" uses the source review's own GRADE rating.

| Claim (as a mood-music app might state it) | Strongest evidence tier | Effect size | Caveats | Citation |
|---|---|---|---|---|
| **Reduces anxiety (acute / state)** | Cochrane RCT review + 2025 multilevel meta-analysis | Preop anxiety **SMD −0.60** (STAI absolute **MD −5.72**, 26 trials, n=2,051); overall MT anxiety **g≈0.36**, self-report **g≈0.41** | Heterogeneity; physiological anxiety effect small/NS (g≈0.15); clinical context ≠ casual app use | Bradt 2013 (CD006908); Lancet eClinicalMedicine 2025 |
| **Improves subjective sleep quality** | **Cochrane, moderate certainty** | PSQI **MD −2.79** (95% CI −3.86 to −1.72), 10 RCTs, n=708 (~1 SD) | Only *subjective* quality is moderate-certainty; insomnia severity / objective sleep = low/very-low | Jespersen 2022 (CD010459.pub3) |
| **Reduces pain** | Cochrane (cancer) | **SMD −0.67** (2021 update; −0.91 in 2016), 12 studies, n=632 | **Very-low** certainty; high risk of bias | Bradt 2021 (CD006911.pub4) |
| **Reduces depressive symptoms (clinical)** | **Cochrane, moderate quality** | Clinician-rated **SMD −0.98** (large), MT+TAU vs TAU; depression in cancer **SMD −0.41** | Clinical music *therapy* (therapist-delivered), not solo app listening | Aalbers 2017 (CD004517.pub3); Bradt 2021 |
| **Reduces physiological stress (HRV/cortisol)** | Meta-analyses | HFnu **+7.05** (≤30 min: +14.25); RMSSD **+13.04 ms**; cortisol reliably down | Acute; baseline-dependent; wearable noise | HRV meta-analysis; stress-biomarker SR (companion doc §1) |
| **Lifts mood / positive affect** | Mixed | Cancer "mood" **SMD 0.47 (NS)**; well-being meta-analyses positive but small | **Contested** — mood is the *weakest* clinical endpoint; many nulls | Bradt 2021; well-being meta-analysis 2025 |
| **Improves exercise performance / lowers perceived exertion** | Meta-analytic | Performance **g=0.31**, affect **g=0.48**, RPE **g=0.22**, VO₂ g=0.15, **HR g=0.07 (NS)** | Domain- & tempo-moderated (exercise>sport, fast>slow); not a "health" claim | Terry et al. 2020 (*Psychol Bull*) |

**Verdict.** The **strongest, Cochrane-grade** claims are: **subjective sleep-quality
improvement (moderate certainty)**, **acute anxiety reduction**, and **clinician-rated
depression reduction in therapist-delivered therapy**. **Pain** and **physiological stress**
are supported but at **low/very-low certainty** (high bias). **Generic "mood lift"** is the
**weakest and most contested** endpoint — treat marketing language like "boosts your mood"
as *unproven*. **Exercise/exertion** benefits are solid but are performance, not medical,
claims.

---

## 4. Individual differences & why thresholds must be personalized

Population-average parameters are starting points only. The literature shows large,
systematic between-person variation:

- **Personality / arousal preference (Eysenck).** Extraverts have *lower* baseline cortical
  arousal and seek *more* stimulation → tend to prefer/benefit from upbeat, intense, faster
  music; introverts (higher baseline arousal) prefer softer, subdued material. The
  prediction that extraverts benefit from background music is **supported in part but
  contested** (mixed evidence). Implication: the *same* "energizing" track is over-stimulating
  for one user and just-right for another.
- **Personal preference & familiarity dominate.** Across the literature, *liked/familiar*
  music is the single most reliable lever for engagement and subjective relaxation; familiar
  music modulates the arousal–pleasure relationship. (See companion doc §1 references.) But
  note the §2 nuance: for *physiological* down-regulation the acoustic recipe matters as much
  as who chose the track.
- **Cultural background.** Mode/valence cues (major=happy) are partly Western-learned; reward
  sensitivity and genre meaning vary by culture (e.g., Danish-teen BMRQ validation, n=4,641).
  Don't assume universal valence mappings.
- **Musical training.** Trained musicians process structure/expectation differently, altering
  emotional and attentional responses.
- **Age.** HRV declines (~0.5 ms/yr after 30), arousal baselines and genre preferences shift —
  so the *same* biometric reading means different things at different ages (companion doc §2).
- **Musical anhedonia.** ~**3–5%** of healthy people derive little/no pleasure from music
  (specific anhedonia: low BMRQ, no depression, intact perception). For them a "feel-good
  playlist" simply won't work — and shouldn't be presented as guaranteed to.

> **Why this forces a rolling personal baseline.** Because arousal preference, HRV range,
> familiarity, culture, age, and even *capacity* for music reward vary enormously between
> individuals, **population thresholds are first guesses only.** Magic Shuffle should adapt
> targets to each user's **own rolling baseline** (their typical HRV/RHR, their liked
> catalog, their observed responses), exactly as the design docs already note. A fixed "60 BPM
> = calm for everyone" rule is not defensible.

---

## 5. Safety, contraindications & responsible-design guardrails

**Music is not uniformly benign. Some uses worsen state.** A wellbeing app must engineer
against the following:

### 5.1 Rumination via sad / mood-congruent music
**Garrido & Schubert** (multiple studies, 2013–2015): both ruminators *and* non-ruminators
showed **increased depression after self-selected sad music**; high-rumination individuals
use sad music to *maintain* negative mood (maladaptive regulation). **Guardrail:** an ISO
"match" step must **not park** a low-valence user in sad music — always move *out* of the
matched state toward the target, cap time-in-match, and never auto-loop sad/low-valence
content for a down user.

### 5.2 Trauma triggers
Specific songs/genres can trigger trauma memories or distress (PTSD). **Guardrail:** let
users **skip/block** tracks and genres permanently; never force-play; treat strong negative
skips as signal to back off, not push harder.

### 5.3 Over-stimulation / mismatch
Loud, fast, high-arousal music can *increase* agitation, especially for high-baseline-arousal
or sensory-sensitive users (and in dementia/autism contexts). **Guardrail:** respect the ISO
gradient (don't jump to high energy); detect rising arousal and ease off; provide an obvious
"too much / calm me down" control.

### 5.4 Music & aggression
**Anderson et al. (2003, *JPSP*):** violent lyrics increased aggressive thoughts and hostile
feelings across 5 experiments, independent of musical style or arousal — **lyrics matter more
than tone.** **Guardrail:** for calming/regulation goals, avoid violent/hostile lyrical
content; prefer instrumental or prosocial-lyric material.

### 5.5 Hearing safety / volume
**WHO/ITU safe-listening standard:** ≤ **80 dB for ≤ 40 h/week** (adults; 75 dB children);
at 85 dB the safe limit is 8 h, halving for each +3 dB; consumer headphones reach 100–110 dB
(damage in minutes). **Guardrail:** surface safe-volume guidance, support OS volume-limit
features, encourage breaks; never push loudness for "energy."

### 5.6 No-medical-claims boundary (ethics + regulation)
Per **FDA "General Wellness: Policy for Low Risk Devices"** (final guidance, updated Jan 2026):
software stays a non-regulated *general-wellness* product only if it is **intended solely for
maintaining/encouraging a healthy lifestyle and is unrelated to the diagnosis, cure,
mitigation, prevention, or treatment of a disease.** Claiming the product *treats* anxiety,
depression, insomnia, or pain can pull it into **medical-device** territory.

**The app MUST NOT claim to:** treat/cure/diagnose anxiety, depression, insomnia, pain, or
any condition; replace therapy or medication; or guarantee a clinical outcome. **The app MAY
say:** "designed to help you relax / wind down / focus," "many people find slow music
calming," with evidence framed as *general* and *individual results vary*.

**Build-in guardrails checklist:**
- ISO "match" is time-capped and always followed by movement toward the target (no sad-loop).
- Per-user skip/block lists honored permanently; strong negative response → de-escalate.
- Respect arousal gradient; provide instant "calm me down" / stop control.
- Avoid violent/hostile lyrics in regulation playlists.
- Safe-volume guidance + break reminders; never optimize for loudness.
- Wellness copy only — no disease/treatment claims; clear "not medical advice" disclaimer.
- Personalize to a rolling baseline; never present effects as guaranteed (musical anhedonia,
  rumination risk, individual variation).

---

## 6. Measurement & validation (how to check the app actually works)

If Magic Shuffle wants to *validate* (not *claim*) effect, use the same instruments the
clinical literature uses:

| Domain | Instrument | What it captures | Notes for the app |
|---|---|---|---|
| **State affect** | **PANAS** (Positive & Negative Affect Schedule) | Momentary positive/negative affect | Quick pre/post check-in; pairs with circumplex valence/arousal |
| **State/trait anxiety** | **STAI** (State-Trait Anxiety Inventory, esp. STAI-S) | Current vs. dispositional anxiety | The primary endpoint in the Cochrane preop review (MD −5.72) |
| **Sleep** | **PSQI** (Pittsburgh Sleep Quality Index) | Subjective sleep quality (0–21, higher=worse) | Cochrane sleep endpoint (MD −2.79); also ISI for severity |
| **Physiological stress** | **Salivary cortisol** | HPA-axis stress hormone | Falls in many relaxation studies, but the direction is not guaranteed — *loud/high-arousal* music can *raise* cortisol (§5.5), and the TSST study (doc 01 §1.3) found it highest in the music group; needs proper sampling protocol |
| **Autonomic balance** | **HRV — RMSSD** (also SDNN, pNN50, HF, LF/HF) | Parasympathetic tone / recovery | Already in the biometric stack; use deviation from personal baseline |
| **Perceived exertion** | **Borg RPE** | Subjective effort during exercise | For the energize/workout use-case (RPE g≈0.22) |
| **Music reward (screening)** | **BMRQ** (Barcelona Music Reward Questionnaire) | Individual music-reward sensitivity; flags musical anhedonia (cutoff ~65 / lowest ~5–10%) | Optional onboarding screen to set expectations |

**Validation pattern:** simple pre/post **PANAS or single-item valence-arousal** check-ins
around a session, plus passive **HRV/RHR** deltas vs. the user's rolling baseline, give a
defensible *internal* signal of whether a session moved the user the intended direction —
without making any clinical claim.

---

## References

All URLs verified reachable as of 2026-06-08 unless noted.

**Frameworks**
- Altshuler / ISO principle — Heiderscheit & Madson, *Use of the Iso Principle as a Central Method in Mood Management* (Music Therapy Perspectives, 2015) — https://idun.augsburg.edu/cgi/viewcontent.cgi?article=1046&context=faculty_scholarship  (Oxford abstract: https://academic.oup.com/mtp/article-abstract/33/1/45/1134120)
- Starcke et al., *Emotion Modulation through Music after Sadness Induction — The Iso Principle* (MDPI IJERPH, 2021) — https://www.mdpi.com/1660-4601/18/23/12486
- Starcke, Gebhardt & von Georgi, *Music listening according to the iso principle in patients with mood disorders* (2026) — https://doi.org/10.1177/03057356261427384
- RAS / Parkinson's gait meta-analysis (Frontiers in Neurology, 2022) — https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2022.940419/full
- RAS / stroke motor & balance meta-analysis (PMC, 2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9714437/
- Neurologic Music Therapy in Geriatric Rehabilitation: A Systematic Review (PMC) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9690210/
- McKinney & Honig, *Health Outcomes of a Series of Bonny Method GIM Sessions: A Systematic Review* (Journal of Music Therapy, 2017) — https://pubmed.ncbi.nlm.nih.gov/27941132/

**Evidence-quality map (Cochrane & meta-analyses)**
- Bradt, Dileo & Shim, *Music interventions for preoperative anxiety* (Cochrane, 2013, CD006908) — https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD006908.pub2/abstract  (PMC mirror: https://pmc.ncbi.nlm.nih.gov/articles/PMC9758540/ ; open PDF mirror: https://sofia.medicalistes.fr/spip/IMG/pdf/music_revue_2013.pdf)
- Jespersen et al., *Listening to music for insomnia in adults* (Cochrane, 2022, CD010459.pub3) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9400393/
- Bradt et al., *Music interventions for improving psychological and physical outcomes in people with cancer* (Cochrane, 2021, CD006911.pub4) — https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD006911.pub4/full
- Aalbers et al., *Music therapy for depression* (Cochrane, 2017, CD004517.pub3) — https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD004517.pub3/full
- *Music therapy for the treatment of anxiety: a systematic review with multilevel meta-analyses* (Lancet eClinicalMedicine, 2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12179724/  (journal: https://www.thelancet.com/journals/eclinm/article/PIIS2589-5370(25)00225-1/fulltext)
- Terry et al., *Effects of Music in Exercise and Sport: A Meta-Analytic Review* (Psychological Bulletin, 2020) — https://pubmed.ncbi.nlm.nih.gov/31804098/  (PDF: https://www.apa.org/pubs/journals/features/bul-bul0000216.pdf)

**Dosage / selection / stress**
- de Witte et al., *Effects of music interventions on stress-related outcomes: a systematic review and two meta-analyses* (Health Psychology Review, 2020) — https://www.tandfonline.com/doi/full/10.1080/17437199.2019.1627897
- de Witte et al., *Music therapy for stress reduction: a systematic review and meta-analysis* (2020) — https://www.tandfonline.com/doi/full/10.1080/17437199.2020.1846580
- Groarke et al., *Does Listening to Music Regulate Negative Affect …? Self-Selected vs Researcher-Selected* (Applied Psychology: Health & Well-Being, 2020) — https://iaap-journals.onlinelibrary.wiley.com/doi/10.1111/aphw.12185
- Music listening and stress recovery: SR with meta-analysis (PLOS One, 2022) — https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0270031
- Chung J & Woods-Giscombe C (2016). *Influence of Dosage and Type of Music Therapy in Symptom Management and Rehabilitation for Individuals with Schizophrenia* (Issues Ment Health Nurs 37(8):611–623) — https://pubmed.ncbi.nlm.nih.gov/27192343/

**Individual differences**
- Küssner, *Eysenck's Theory of Personality and the Role of Background Music in Cognitive Task Performance* (Frontiers in Psychology, 2017) — https://pmc.ncbi.nlm.nih.gov/articles/PMC5694457/
- Mas-Herrero et al., *Neural correlates of specific musical anhedonia* (PNAS, 2016) — https://www.pnas.org/doi/10.1073/pnas.1611211113
- Lippolis et al., *Danish BMRQ validation with 4,641 adolescents* (Scand J Psychol, 2025) — https://onlinelibrary.wiley.com/doi/10.1111/sjop.13074
- French validation of the Barcelona Music Reward Questionnaire (PMC) — https://pmc.ncbi.nlm.nih.gov/articles/PMC4806630/

**Safety / contraindications / ethics**
- Garrido & Schubert, *Moody melodies: Do they cheer us up? A study of the effect of sad music on mood* (Psychology of Music, 2015) — https://journals.sagepub.com/doi/abs/10.1177/0305735613501938
- Garrido & Schubert, *Adaptive and maladaptive attraction to negative emotions in music* (Musicae Scientiae, 2013) — https://journals.sagepub.com/doi/abs/10.1177/1029864913478305
- Anderson, Carnagey & Eubanks, *Exposure to Violent Media: The Effects of Songs With Violent Lyrics on Aggressive Thoughts and Feelings* (JPSP, 2003) — https://pubmed.ncbi.nlm.nih.gov/12757141/  (PDF: https://www.apa.org/pubs/journals/releases/psp-845960.pdf)
- WHO, *Make Listening Safe* brochure (safe-listening standard, ≤80 dB / 40 h) — https://cdn.who.int/media/docs/default-source/documents/health-topics/deafness-and-hearing-loss/mls-brochure-english-2021.pdf
- FDA, *General Wellness: Policy for Low Risk Devices* (final guidance, updated Jan 2026) — https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices

**Measurement instruments** (validated; standard references)
- STAI used as the primary endpoint in Bradt 2013 (above); PSQI in Jespersen 2022 (above).
- Salivary cortisol as an objective stress response to music (PMC, 2024, n=36) — note this study found *loud* favorite music (90–95 dB) **raised** cortisol, supporting the hearing-safety framing (§5.5), not a "cortisol falls with music" claim — https://pmc.ncbi.nlm.nih.gov/articles/PMC11673928/
- HRV (RMSSD/SDNN/pNN50) — see companion doc `../music-wellness-research.md` §References (HRV meta-analysis, Kubios normal ranges, wearable validation).
