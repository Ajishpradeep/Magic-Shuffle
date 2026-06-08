# Magic Shuffle — Evidence-Based Research Briefing
## Music, Biometrics, and Mood Regulation

> This is the **source of truth** for every number, threshold, and design choice in the
> recommendation engine (`src/lib/affect.js`), the ISO playlist builder
> (`src/lib/isoPlaylist.js`), and the mock biometric generator
> (`src/lib/generateBiometrics.js`). When tuning behavior, change it here in principle
> first, then in the code constants (`GOAL_TARGETS` in `affect.js`, the latent-`r` model
> in `generateBiometrics.js`).

*Prepared 2026-06-08. All thresholds are population-level reference values; a production
build should personalize against each user's own rolling baseline — HRV/RHR/temperature
vary enormously between individuals (two healthy same-age people can differ 30–40 ms in
HRV).*

---

## 1. Music → Stress Reduction: mechanisms and which attributes matter

### Mechanisms (what the body does)
Music modulates the **autonomic nervous system** and the **HPA stress axis**:

- **Parasympathetic ("vagal") activation.** Relaxing music raises high-frequency HRV
  power (HFnu), lowers low-frequency power (LFnu) and the LF/HF ratio — a shift from
  sympathetic ("fight/flight") toward parasympathetic ("rest/digest").
- **Cortisol down, oxytocin/β-endorphin up.** Music reliably lowers salivary cortisol.
- **Rhythmic entrainment.** When the musical pulse is near resting heart rate,
  cardiorespiratory rhythms synchronize to it, pulling HR and breathing down.

**Meta-analytic numbers** (Frontiers/PMC meta-analysis, 24 RCTs, n=1,295):
- HFnu (parasympathetic): **+7.05** overall; **+14.25** for sessions ≤30 min.
- LFnu (sympathetic): **−4.94** overall. LF/HF ratio: **−0.50** in stressed patients.
- RMSSD: **+13.04 ms** in stressed/anxious patients.
- **Self-selected/familiar music consistently beat standardized music**; **short sessions
  (≤30 min) were most effective.**

### Which musical attributes matter

| Attribute | Calming direction | Detail |
|---|---|---|
| **Tempo (BPM)** | Slow, **60–80 BPM** | Mirrors a relaxed resting HR; over 10–15 min, HR can drop **5–10 BPM** via entrainment. ~60 BPM ↔ ~10 breaths/min (maximizes HRV). Energizing: 100–130+ BPM. |
| **Mode / key** | Major → higher valence; minor → tension | Strongest single cue for perceived valence (Western listeners). |
| **Valence (0–1)** | Higher = more positive | Use for the *target* mood, not necessarily the *start* (see iso-principle). |
| **Energy / arousal (0–1)** | **Low (≈0.2–0.4)** to calm; high (0.7–0.9) to energize | Primary lever for arousal regulation. |
| **Acousticness (0–1)** | **High (0.6–1.0)** to calm | Smooth, predictable timbres read as "safe." |
| **Vocal density** | Instrumental / sparse to calm or focus | Lyrics add cognitive load; sudden changes raise arousal. |
| **Familiarity** | Familiar + preferred = strongest relaxation | Self-selected music outperforms experimenter-chosen. **Bias toward the user's known/liked catalog.** |

---

## 2. Mood-reading metrics: what's validated, direction, thresholds

HRV, resting HR, and nocturnal temperature from consumer wearables (Oura, WHOOP, Apple
Watch) are validated against ECG/clinical references for these inferences.

| Metric | Stress / over-arousal | Calm / recovered | Reference ranges |
|---|---|---|---|
| **HRV (RMSSD, ms)** | **Lower** than baseline | Higher | ~20 to >70 ms at rest; age-dependent (20s ≈ 24–62; declines ~0.5 ms/yr after 30). **Use deviation from the user's own baseline.** |
| **Resting HR (bpm)** | **Elevated** | At/below baseline | Normal ~60–100; athletic 40–60. A few bpm above personal baseline + low HRV = strain. |
| **Sleep score (0–100)** | Low after stress | High | Oura bands: **≥85 optimal, 70–84 good, 60–69 fair, <60 poor.** |
| **Sleep stages** | Reduced deep/REM, fragmented | Adequate deep+REM | Deep ≈15–20%; REM ≈20–25%; efficiency ≥85%; latency 15–20 min. |
| **Skin temp deviation (°C)** | **+0.5 to +1.0** (strain/illness) | Near 0.0 | Daily swing ~1 °C; +0.5–1.0 with high RHR + low HRV = strain. |
| **Respiratory rate (br/min)** | Elevated | Steady | Healthy adults **12–20**; >20 attention. Most stable nightly vital. |
| **Steps** | Either spike or sedentary | Moderate regular | Very low steps ↔ low energy / under-arousal. Use relative to norm. |
| **Time-of-day / circadian** | — | — | Energy lowest early AM (wake inertia) and ~2–4 PM dip; peaks late morning & early evening. |

**Key principle:** a single metric is weak; **converging signals** (low HRV + high RHR +
poor sleep + elevated temp/resp) reliably indicate stress/strain.

---

## 3. Metric → music mapping (the ISO-principle)

### The ISO-principle
Used across all music-therapy schools: **first play music that *matches* the user's
current emotional/arousal state, then gradually modulate toward the target.** An agitated,
high-arousal person resists immediately-calm music but will entrain to a sequence that
starts near their current arousal and steps downward. Affect can shift in **as little as
5 minutes**.

**Implementation pattern:** estimate current (valence, arousal) → set a *start* track near
it → over N tracks ramp tempo/energy/valence toward target. For calming, **step tempo down
~10–15 BPM per track** rather than jumping to 60 BPM.

### State → target mapping

| User state | Goal | Start (match) | Target (end of arc) |
|---|---|---|---|
| High stress + poor sleep + morning | Gentle calm-then-lift | ~90–100 BPM, energy ~0.5 | **70→85 BPM, energy 0.3→0.5, valence 0.5→0.65, acousticness 0.6–0.9, low vocals** |
| High stress, daytime | Calm / down-regulate | ~100 BPM, energy ~0.6 | **→60–75 BPM, energy 0.25–0.4, valence 0.5–0.7, acousticness 0.6–1.0, instrumental** |
| Low energy / under-aroused | Energize | ~80 BPM, energy ~0.4 | **→100–130 BPM, energy 0.7–0.9, valence 0.7–0.9, rhythmic, vocals OK** |
| Good / balanced | Maintain | match current | energy 0.4–0.6, valence 0.6–0.75, tempo 85–110 BPM, favor familiar |
| Late evening, winding down | Calm toward sleep | match residual arousal | **→55–70 BPM, energy 0.15–0.35, acousticness 0.7–1.0, instrumental** |

> **Always bias toward the user's familiar/preferred catalog** — familiarity is the single
> most reliable "free" lever.

---

## 4. Realistic signal ranges & correlations (for the mock generator)

Generate one latent **recovery/strain factor** `r ∈ [0,1]`, then derive correlated metrics
with noise. The real-world cluster: **poor sleep ↔ high stress ↔ low HRV ↔ elevated RHR ↔
elevated resp ↔ elevated skin-temp ↔ low energy.**

| Signal | Min | Typical (recovered) | Max (strain) | Notes |
|---|---|---|---|---|
| Energy (0–1) | 0.05 | 0.5–0.7 | 0.95 | ↓ with poor sleep & stress; ↓ early AM & 2–4 PM |
| Stress (0–1) | 0.05 | 0.2–0.4 | 0.95 | inverse to HRV & sleep |
| Sleep score (0–100) | 30 | 75–90 | 100 | anchor metric |
| Resting HR (bpm) | 42 | 55–68 | 95 | inverse to HRV; +5–15 above baseline under strain |
| HRV / RMSSD (ms) | 15 | 40–70 (age-scaled) | 110 | inverse to RHR & stress; −~0.5 ms/yr after 30 |
| Respiratory (br/min) | 11 | 13–16 | 22 | +1–3 under strain |
| Skin temp dev (°C) | −0.6 | −0.2 to +0.2 | +1.3 | +0.5–1.0 co-occurs with high RHR + low HRV |
| Steps/day | 200 | 6,000–10,000 | 20,000 | low + low energy = under-aroused |

**Generator rule of thumb:** `sleep ≈ 30+65·r`, `HRV ≈ baseline·(0.6+0.8r)`,
`RHR ≈ baseline·(1.25−0.3r)`, `stress ≈ 1−r ± noise`, `energy ≈ (0.4r + 0.4·sleepNorm) ±
noise`, `temp_dev ≈ (1−r)·0.8 − 0.3`. **Avoid impossible combos** (high HRV + high RHR +
high stress at once). *This is exactly what `src/lib/generateBiometrics.js` implements.*

---

## 5. Wellness-goal framing: Russell's circumplex model

**Russell's Circumplex Model of Affect (1980):** every affective state is a point in a 2-D
space — **valence** (unpleasant ↔ pleasant) × **arousal** (calm ↔ activated). E.g.
*stressed/anxious* = low valence + high arousal; *sad/lethargic* = low valence + low
arousal; *serene* = high valence + low arousal; *excited* = high valence + high arousal.
This maps directly to audio features: **musical valence ≈ affective valence; energy/tempo ≈
arousal.**

**Three regulation modes, all aiming toward the high-valence band:**
1. **Over-aroused** (stressed: low V, high A) → **down-regulate arousal, lift valence**
   (toward serene). Use iso-principle: start near current arousal, step down.
2. **Under-aroused** (lethargic: low V, low A) → **up-regulate arousal and valence**
   (toward content/excited). Start gentle, ramp up.
3. **Already positive** (high V) → **maintain**; keep mid arousal, lean on familiar tracks.

Unifying objective: **move the user toward the pleasant side of the circumplex, adjusting
arousal up or down to whatever the biometrics indicate the body needs.** The iso-principle
is *how* you traverse it smoothly instead of jarringly.

---

## Summary mapping table (algorithm cheat-sheet)

| Detected state | Circumplex | Goal (code) | Tempo arc (BPM) | Energy | Valence | Acoustic | Vocals |
|---|---|---|---|---|---|---|---|
| Low HRV, high RHR, high stress | Low V / High A | `calm_down` | 100 → 60–75 | 0.6 → 0.25–0.4 | → 0.6–0.7 | 0.6–1.0 | sparse |
| Poor sleep + high stress + AM | Low V / High A | `calm_down` | 95 → 70–85 | 0.5 → 0.3–0.5 | → 0.6–0.65 | 0.6–0.9 | sparse |
| Low steps, afternoon dip, recovered | Low V / Low A | `energize` | 80 → 100–130 | 0.4 → 0.7–0.9 | → 0.7–0.9 | rhythmic | OK |
| Balanced metrics | High V / mid A | `maintain` | 85–110 | 0.4–0.6 | 0.6–0.75 | flexible | preferred |
| Late evening | toward Low A | `wind_down` | 70 → 55–65 | → 0.15–0.35 | 0.5–0.7 | 0.7–1.0 | none |

---

## How this maps to the code

| Research concept | Code |
|---|---|
| Circumplex (valence × arousal) | `toAffect()` in `src/lib/affect.js` |
| Regulation goal selection | `regulationGoal()` in `src/lib/affect.js` |
| Goal target sweet-spots (§3 table) | `GOAL_TARGETS` in `src/lib/affect.js` |
| ISO-principle start→target arc | `targetArc()` / `arcProfileAt()` in `src/lib/affect.js` |
| Smooth arc ordering of tracks | `buildArc()` in `src/lib/isoPlaylist.js` |
| Latent-`r` correlated mock metrics (§4) | `generateBiometrics()` in `src/lib/generateBiometrics.js` |
| AI planner encoding all of the above | system prompt in `src/integrations/openai.js` |

---

## Key takeaways for the build
1. **Calming sweet spot:** 60–80 BPM, energy ≈0.2–0.4, acousticness ≥0.6, instrumental,
   familiar. Expect ~5–10 BPM HR drop over 10–15 min; sessions ≤30 min most effective.
2. **Don't jump straight to calm** — apply the iso-principle (match, then step ~10–15 BPM
   per track). Affect can shift in ~5 min.
3. **Trust converging biometrics, not one signal**; personalize against the user's baseline.
4. **Familiar/preferred music is the strongest free lever.**
5. **Frame everything on the circumplex:** valence ≈ musical valence, arousal ≈
   energy/tempo; aim toward high valence while moving arousal to match the body's need.
6. For the **mock generator**, drive all metrics from one latent recovery factor.

---

## References

**Music → stress / physiology**
- Music intervention on HRV: systematic review & meta-analysis of RCTs — https://pmc.ncbi.nlm.nih.gov/articles/PMC12976007/
- Music and Biomarkers of Stress: A Systematic Review — https://www.researchgate.net/publication/344812914_Music_and_Biomarkers_of_Stress_A_Systematic_Review
- Music listening and stress recovery: systematic review with meta-analysis (PLOS One) — https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0270031
- The relaxing effect of tempo on music-aroused heart rate — https://www.researchgate.net/publication/307545008_The_relaxing_effect_of_tempo_on_music-aroused_heart_rate
- What makes music relaxing? (Hernandez-Ruiz et al., 2020) — https://journals.sagepub.com/doi/10.1177/0305735618798027
- Does Music Affect Heart Rate? (60–80 BPM entrainment) — https://scienceinsights.org/does-music-affect-heart-rate-the-science-explained/

**Familiarity / preference**
- Preference, Familiarity and Psychophysical Properties in Relaxation Music — https://pubmed.ncbi.nlm.nih.gov/26753216/
- Familiarity mediates arousal–pleasure during music listening — https://pmc.ncbi.nlm.nih.gov/articles/PMC3763198/
- Emotional responses to favorite/relaxing music predict hypoalgesia — https://pmc.ncbi.nlm.nih.gov/articles/PMC10630160/

**ISO-principle**
- Music listening according to the iso principle modulates affective state (Starcke & von Georgi, 2024) — https://journals.sagepub.com/doi/10.1177/10298649231175029
- Emotion Modulation through Music after Sadness Induction — The Iso Principle — https://pmc.ncbi.nlm.nih.gov/articles/PMC8656869/
- Use of the Iso Principle in Mood Management (Augsburg/Idun) — https://idun.augsburg.edu/cgi/viewcontent.cgi?article=1046&context=faculty_scholarship

**HRV / wearable metrics**
- Quantitative analysis of HRV parameters and mental stress index — https://pmc.ncbi.nlm.nih.gov/articles/PMC9357912/
- HRV as a biomarker of anxiety disorders (Tomasi 2024) — https://onlinelibrary.wiley.com/doi/10.1111/psyp.14481
- State-of-the-art stress prediction from HRV using AI — https://link.springer.com/article/10.1007/s12559-023-10200-0
- Validation of Apple Watch HRV during relax & mental stress — https://pmc.ncbi.nlm.nih.gov/articles/PMC6111985/
- Validation of nocturnal RHR and HRV in consumer wearables (Oura/WHOOP, 2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12367097/
- HRV normal range by age (Kubios) — https://www.kubios.com/blog/heart-rate-variability-normal-range/
- Inter-/intraindividual daily RHR variability (n=92,457) — https://pmc.ncbi.nlm.nih.gov/articles/PMC7001906/

**Sleep / temperature / respiration**
- Oura Sleep Score & contributors — https://ouraring.com/blog/sleep-score/
- Oura body-temperature / deviation — https://ouraring.com/blog/natural-body-temperature/
- WHOOP normal respiratory rate — https://www.whoop.com/us/en/thelocker/what-is-respiratory-rate-normal/
- Oura HRV & stress — https://ouraring.com/blog/hrv-and-stress/

**Circumplex model**
- Russell, A Circumplex Model of Affect (1980) — https://www.researchgate.net/publication/235361517_A_circumplex_model_of_affect
- Russell's Circumplex Models (PSU open textbook) — https://psu.pb.unizin.org/psych425/chapter/circumplex-models/

**Audio features / computational mapping**
- Spotify Web API audio features (valence, energy, acousticness, tempo) — https://developer.spotify.com/documentation/web-api/reference/get-audio-features
- Exploring the Emotional Landscape of Music: Analysis of Valence (arXiv) — https://arxiv.org/pdf/2310.19052
- Language Models for Music Medicine Generation (iso-principle + valence-arousal) — https://hf.co/papers/2411.09080
- LARA-Gen: Continuous Emotion Control for Music Generation — https://hf.co/papers/2510.05875
