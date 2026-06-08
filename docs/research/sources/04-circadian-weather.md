# Circadian Rhythm & Weather → Brain-State and Music Adaptation

**Research brief for Magic Shuffle.** How time-of-day (circadian neuroendocrinology + chronotype) and light/weather conditions shape baseline arousal and mood — and therefore what music should do to either *compensate* for or *align* with the listener's likely brain state.

> **Sourcing:** Every claim below links to a peer-reviewed paper, systematic review/meta-analysis, or official institution (PMC/PubMed, Nature, PLOS, The Lancet, EHP/NIEHS). Confidence levels are flagged explicitly. **The honest headline: circadian effects on arousal are robust and well-mechanized; direct weather→mood effects are real but small, heterogeneous, and frequently overstated in popular culture.**

---

## 1. Circadian Neuroendocrinology Across the Day

The central circadian pacemaker — the suprachiasmatic nucleus (SCN) of the hypothalamus — drives daily rhythms in hormones, core body temperature, and alertness. These set a *baseline* arousal/mood tone at any given clock hour, on top of which momentary factors (including weather and music) operate.

### Cortisol — the morning "ignition" and daylong decline
**Confidence: HIGH (well-replicated endogenous rhythm).**

- Cortisol follows a clear circadian pattern: circulating concentrations **peak at the habitual sleep–wake transition and gradually decrease to a nadir during the late evening/early night**, driven endogenously by the SCN. ([O'Byrne et al. 2021, *Curr Opin Endocr Metab Res* / PMC8813037](https://pmc.ncbi.nlm.nih.gov/articles/PMC8813037/))
- Superimposed on this is the **Cortisol Awakening Response (CAR)**: a sharp rise of roughly **38–75%, peaking ~30 minutes after waking** (Wüst et al. 2000; ~77% prevalence per Fries et al. 2009), a phasic response to the sleep–wake transition that is partly independent of the underlying circadian curve. (Note: PMC8813037 itself only says the rise occurs "within the first hour after awakening"; the exact 38–75% / ~30 min figures are from Wüst 2000, summarized at [Cortisol awakening response, Wikipedia](https://en.wikipedia.org/wiki/Cortisol_awakening_response).)
- The **fall in cortisol across late afternoon and early evening** permits the low concentrations of the circadian nadir — i.e., the body is winding down its primary stress/activation hormone as evening approaches. ([O'Byrne et al. 2021 / PMC8813037](https://pmc.ncbi.nlm.nih.gov/articles/PMC8813037/))

*App implication:* mornings carry an endogenous activation surge; late evenings are a hormonally low-arousal "wind-down" window.

### Melatonin — the evening sleep signal
**Confidence: HIGH.**

- Evening melatonin onset (Dim Light Melatonin Onset, **DLMO**) is the most reliable marker of circadian phase and signals the body's transition toward sleep. ([Kennaway, *SLEEP* 2023](https://academic.oup.com/sleep/article/46/5/zsad033/7044190))
- Evening light *suppresses and delays* melatonin: exposure to ordinary room light before bedtime suppressed melatonin and produced a **later melatonin onset in ~99% of individuals, shortening melatonin duration by ~90 minutes**. ([Gooley et al., *J Clin Endocrinol Metab* / PMC3047226](https://pmc.ncbi.nlm.nih.gov/articles/PMC3047226/)) Even short evening light exposure increases subjective alertness. ([Wahnschaffe et al. 2013 / PMC3588003](https://pmc.ncbi.nlm.nih.gov/articles/PMC3588003/))

*App implication:* the evening melatonin ramp is the physiological basis for "wind-down" listening; bright, stimulating input (light *or* arguably arousing music) works against it.

### Adenosine — homeostatic sleep pressure
**Confidence: HIGH (core of the two-process model).**

- Extracellular adenosine **accumulates during waking and dissipates during sleep**, acting at A1 receptors to build homeostatic sleep pressure ("Process S"). The longer one has been awake, the higher the drive toward sleep. ([Reichert et al., *Biology* / PMC4810168](https://pmc.ncbi.nlm.nih.gov/articles/PMC4810168/)) *(Caveat: the more recent Reichert et al. 2022 review — [*J Sleep Res* / PMC9541543](https://pmc.ncbi.nlm.nih.gov/articles/PMC9541543/) — is more cautious, noting adenosine is "unlikely responsible for the diurnal changes … under undisturbed baseline conditions" and is most relevant to acute sleep loss.)*

*App implication:* sleep pressure climbs monotonically through the day, opposing circadian alerting — strongest mismatch shows up in the afternoon dip and again late at night.

### Core body temperature
**Confidence: HIGH.**

- Core temperature rises across the day, **peaks in the late afternoon/early evening, then falls to a nadir around 3–5 AM**. The rhythm tracks (and partly underlies) alertness and physical-performance peaks. ([Windred et al., *Sci Rep* 2024 / PMC11263371](https://pmc.ncbi.nlm.nih.gov/articles/PMC11263371/); athletic-performance review [PMC12015785](https://pmc.ncbi.nlm.nih.gov/articles/PMC12015785/)) *(The ~3–5 AM nadir is general circadian background; Windred et al. specifically concerns temperature-amplitude/metabolite rhythmicity.)*

### Post-lunch / mid-afternoon dip
**Confidence: HIGH that it exists; HIGH that it is largely NOT caused by eating lunch.**

- A measurable drop in alertness/performance occurs **~14:00–16:00** ([Valdez, *Circadian Rhythms in Attention* / PMC6430172](https://pmc.ncbi.nlm.nih.gov/articles/PMC6430172/)). Critically, it is **endogenous and "bi-circadian" (linked to a 12-hour harmonic of the circadian system), largely unrelated to lunch itself** — it persists even when lunch is replaced with hourly liquid supplements ([Monk et al., *J Sleep Res* 1996 / PMID 8877121](https://pubmed.ncbi.nlm.nih.gov/8877121/); Monk's own test interval was 10:00–15:00, so the precise 14:00–16:00 window is Valdez's).
- Bright/blue-enriched light in the early afternoon improves **EEG correlates of alertness and mood**, though one study found this **did not translate into better subjective alertness or task performance** — so light *partly* offsets the dip, not fully. ([Askaripoor et al. / PMC6685797](https://pmc.ncbi.nlm.nih.gov/articles/PMC6685797/))

### Hour-by-hour baseline-state summary
**Confidence: MODERATE-HIGH** for the general shape (these are population averages for an intermediate chronotype on a conventional schedule; individuals vary — see §2).

| Clock window | Dominant physiology | Likely baseline brain-state |
|---|---|---|
| ~05:00–07:00 (pre/at wake) | Cortisol rising toward CAR; core temp near nadir; high sleep inertia | Lowest alertness, grogginess; attention at its trough ([PMC6430172](https://pmc.ncbi.nlm.nih.gov/articles/PMC6430172/)) |
| ~07:00–10:00 | CAR peak then early decline; temp climbing | Activation rising but attention still relatively low early on ([PMC8813037](https://pmc.ncbi.nlm.nih.gov/articles/PMC8813037/), [PMC6430172](https://pmc.ncbi.nlm.nih.gov/articles/PMC6430172/)) |
| ~10:00–14:00 | Cortisol declining gradually; temp rising; sleep pressure modest | Late-morning alertness peak; attention improves toward noon ([PMC6430172](https://pmc.ncbi.nlm.nih.gov/articles/PMC6430172/)) |
| ~14:00–16:00 | Bi-circadian dip; sleep pressure now meaningful | Post-lunch dip: sleepiness/reduced vigilance ([PMID 8877121](https://pubmed.ncbi.nlm.nih.gov/8877121/)) |
| ~16:00–22:00 | Core temp at/near daily peak; pre-sleep "wake-maintenance zone" in evening | Second alertness/performance peak; execution best in late afternoon–early evening ([PMC6430172](https://pmc.ncbi.nlm.nih.gov/articles/PMC6430172/), [Sci Rep 2024](https://www.nature.com/articles/s41598-024-67297-y)) |
| ~22:00–00:00 | Melatonin onset (DLMO); cortisol low; high accumulated adenosine | Wind-down: arousal falling, sleep drive high ([PMC3047226](https://pmc.ncbi.nlm.nih.gov/articles/PMC3047226/)) |
| ~00:00–05:00 | Melatonin high, temp falling to nadir | Lowest alertness of the 24 h cycle ([PMC6430172](https://pmc.ncbi.nlm.nih.gov/articles/PMC6430172/)) |

---

## 2. Chronotype: Peak-Arousal Timing Shifts Between People
**Confidence: HIGH for the existence of the synchrony effect; effect size larger for demanding executive tasks and strong chronotypes.**

- **Morning ("lark") vs evening ("owl") types** have their circadian arousal — and hormonal/temperature peaks — phase-shifted relative to clock time. Evening chronotypes have delayed hormonal rhythms and later peak alertness and physical performance. ([Chronotype athletic review / PMC10558889](https://pmc.ncbi.nlm.nih.gov/articles/PMC10558889/))
- The **synchrony effect**: cognitive performance is best when testing coincides with a person's peak circadian arousal (larks in the morning, owls in the evening), and degrades when "off-peak." The effect is most robust for effortful, inhibitory/executive tasks. ([Chronotype & synchrony systematic review, *Chronobiol Int* 2025](https://www.tandfonline.com/doi/full/10.1080/07420528.2025.2490495); [Neuro-cognitive profile of chronotypes / PMC8455015](https://pmc.ncbi.nlm.nih.gov/articles/PMC8455015/))

*App implication:* the same clock hour means different things for an owl vs a lark. If the app can infer chronotype (from listening times, onboarding, or wearable data), the "baseline-state" curve in §1 should be shifted later for evening types and earlier for morning types. **Without chronotype data, treat the table as intermediate-type defaults.**

---

## 3. Light & Season
**Confidence: HIGH for light's alerting effect and circadian role; MODERATE for the serotonin-turnover mechanism; HIGH for light therapy efficacy in SAD.**

### Bright light is alerting (daytime, non-image-forming pathway)
- Light's non-visual effects are mediated by melanopsin-containing intrinsically photosensitive retinal ganglion cells (ipRGCs), maximally sensitive to short-wavelength (~480 nm, blue) light. Bright/blue-enriched light increases subjective alertness and EEG correlates of attention. ([Chellappa et al., *PLOS ONE* 2011](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0016429))
- **Honest caveat:** a 2022 systematic review of daytime studies found only **7 of 20 studies** showed a clear alerting effect, with no uniform conclusion across heterogeneous lighting manipulations. The effect is real but condition-dependent. ([Alerting effect of light: review of daytime studies, *J Daylighting*](https://www.solarlits.com/jd/9-150); broader 2025 meta-analysis [Taylor & Francis](https://www.tandfonline.com/doi/full/10.1080/15502724.2025.2493669))

### Sunlight, serotonin, and seasonal mood
- A landmark study measured serotonin turnover directly via internal-jugular blood sampling in 101 men: **brain serotonin production was lowest in winter and rose with the duration/luminosity of bright sunlight that day.** ([Lambert et al., *The Lancet* 2002 / PMID 12480364](https://pubmed.ncbi.nlm.nih.gov/12480364/))

### Seasonal Affective Disorder (SAD)
- SAD pathophysiology is **biologically heterogeneous**, with **substantial evidence for two complementary mechanisms**: (1) a **circadian phase-shift** (winter rhythms phase-delayed; morning light therapy more effective than evening), and (2) **altered serotonergic function** tied to reduced light. Melatonin dysregulation appears secondary. ([Lam & Levitan 2000, *J Psychiatry Neurosci* / PMC1408021](https://pmc.ncbi.nlm.nih.gov/articles/PMC1408021/))
- Light therapy is widely used for SAD, but the cited Cochrane review concerns **preventing** SAD and found only one small, high-risk-of-bias study — concluding the evidence is **insufficient** to draw firm conclusions about prevention. (Efficacy for treating *active* SAD is supported by other trials; this particular source does not establish it.) ([Nussbaumer-Streit et al. 2019, light therapy for *preventing* SAD / PMC6422319](https://pmc.ncbi.nlm.nih.gov/articles/PMC6422319/))

*App implication:* low-light/overcast conditions and short winter days plausibly nudge baseline mood/serotonergic tone downward and reduce the natural alerting drive — a rationale for *compensatory* brightening on dark days. Note this is a mood/arousal *nudge*, not a clinical intervention.

---

## 4. Weather & Mood — What the Evidence Actually Shows
**This is the section where popular belief most exceeds the data. Read the confidence flags.**

### Robust / better-supported findings
- **Daily weather → mood effects are statistically detectable but SMALL on average.** The large Denissen et al. multilevel diary study (1,233 participants, daily reports over a month, linked to weather-station data) found main effects of **temperature, wind, and sunlight on negative affect**, and **sunlight on tiredness** (also mediating effects of precipitation and air pressure on tiredness) — but concluded the **"average effect of weather on mood was only small, though significant,"** with large individual differences. ([Denissen et al., *Emotion* 2008 / PMID 18837616](https://pubmed.ncbi.nlm.nih.gov/18837616/))
- **Sunlight duration is the most consistent positive contributor** — it relates to lower tiredness and lower negative affect — consistent with the light/serotonin mechanisms in §3. ([Denissen et al. / PMID 18837616](https://pubmed.ncbi.nlm.nih.gov/18837616/))
- **Heat and aggression/irritability:** higher ambient temperature is associated with increased aggression and violent crime — the "heat hypothesis" (heat → discomfort/negative affect → arousal/disinhibition). The field evidence (the EHP review: +10 °C ≈ +9% violent-crime risk) supports it, **but the magnitude is heterogeneous** and varies by climate zone and method. Tellingly, Lynott et al.'s behavioural meta-analysis found **no reliable** temperature effect on pro-/antisocial behaviour — the lab/null counterpoint to the field findings. ([Temperature, crime & violence systematic review/meta-analysis, *Environ Health Perspect* / PMC11477092](https://pmc.ncbi.nlm.nih.gov/articles/PMC11477092/); [Lynott et al., prosocial/antisocial meta-analysis, *Br J Soc Psychol* 2023 / PMID 36794795](https://pubmed.ncbi.nlm.nih.gov/36794795/))

### Weak / overstated / honestly uncertain
- **"Gloomy/rainy days make everyone sad" is overstated.** The headline effect of rain/clouds on mood is small once sunlight is accounted for, and a substantial part of perceived weather-mood coupling may be **cultural belief** ("we think weather affects mood because everyone says it does"). ([Denissen et al. / PMID 18837616](https://pubmed.ncbi.nlm.nih.gov/18837616/))
- **Barometric pressure → mood:** evidence is **mixed and inconsistent**. Pressure changes are a commonly *reported* migraine/pain trigger, with significant individual variability and some subgroups reacting oppositely; any mood effect appears largely **indirect** (via pain, headache, reduced daylight, disrupted routine) rather than a direct, reliable pressure→mood pathway. **Confidence: LOW for a direct effect.** ([Migraine & barometric pressure systematic review / PMC12617017](https://pmc.ncbi.nlm.nih.gov/articles/PMC12617017/); [fibromyalgia/humidity/pressure study / PMC6510434](https://pmc.ncbi.nlm.nih.gov/articles/PMC6510434/))
- **Humidity:** weak and inconsistent independent effects on mood in the general population.

> **Bottom line for the app:** Weather should be a *gentle modifier*, never a dominant driver. The strongest, most defensible weather signal is **sunlight/cloud cover** (brightness), followed by **temperature extremes** (heat → irritability). Treat barometric pressure and humidity as low-confidence at best.

---

## 5. Synthesis: Time-of-Day × Weather → Music Adjustment

**Design principle.** Two strategies:
- **ALIGN** — support what the body is already doing (e.g., reinforce the evening wind-down).
- **COMPENSATE** — counteract an unwanted state (e.g., lift energy during a dark, sluggish afternoon).

Defaults assume an **intermediate chronotype**; shift the time bands **later for evening types / earlier for morning types** (§2). Weather acts as a **secondary modifier** on the circadian baseline — small but in the direction the evidence supports (brightness up = alerting/positive; heat = irritability; low light = compensatory lift).

| Context (time × weather) | Likely baseline brain-state | Recommended musical nudge | Strategy | Key citations |
|---|---|---|---|---|
| **Morning, bright/sunny** | Cortisol surge + climbing temp + natural light alerting; high readiness | Moderate–high energy, bright/major, forward tempo; ride the activation | ALIGN | [PMC8813037](https://pmc.ncbi.nlm.nih.gov/articles/PMC8813037/), [PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0016429) |
| **Morning, dark/overcast/rain** | Same cortisol/temp drive but missing light's alerting boost; sluggish start, higher tiredness | Slightly *higher* brightness/energy than a sunny morning to substitute for missing light cue; uplifting timbres | COMPENSATE | [PMC6685797](https://pmc.ncbi.nlm.nih.gov/articles/PMC6685797/), [PMID 18837616](https://pubmed.ncbi.nlm.nih.gov/18837616/), [Lancet/PMID 12480364](https://pubmed.ncbi.nlm.nih.gov/12480364/) |
| **Late morning (~10–14), any weather** | Late-morning alertness peak; attention high | Sustain focus — steady, engaging energy; avoid jarring shifts during a productive window | ALIGN | [PMC6430172](https://pmc.ncbi.nlm.nih.gov/articles/PMC6430172/) |
| **Mid-afternoon (~14–16), overcast/dark** | Post-lunch bi-circadian dip + no light support → strong sluggishness | Energizing, rhythmic, brighter tracks; mild tempo lift to counter the dip (musical analog of bright-light intervention) | COMPENSATE | [PMID 8877121](https://pubmed.ncbi.nlm.nih.gov/8877121/), [PMC6685797](https://pmc.ncbi.nlm.nih.gov/articles/PMC6685797/) |
| **Mid-afternoon (~14–16), bright/sunny** | Post-lunch dip partly offset by daylight alerting | Moderate lift — gentle re-energizing; less aggressive than the overcast case | COMPENSATE (mild) | [PMID 8877121](https://pubmed.ncbi.nlm.nih.gov/8877121/), [PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0016429) |
| **Late afternoon/early evening (~16–20), pleasant** | Core-temp/alertness second peak; good mood baseline | Match high engagement — can support upbeat, social, or higher-energy listening | ALIGN | [Sci Rep 2024](https://www.nature.com/articles/s41598-024-67297-y), [PMC6430172](https://pmc.ncbi.nlm.nih.gov/articles/PMC6430172/) |
| **Any time, hot/heatwave** | Heat → discomfort, irritability, edginess (small–moderate effect) | Favor calming, cooler-feeling, lower-intensity tracks; avoid abrasive/high-aggression material; soothe rather than amp | COMPENSATE | [PMC11477092](https://pmc.ncbi.nlm.nih.gov/articles/PMC11477092/), [PMID 36794795](https://pubmed.ncbi.nlm.nih.gov/36794795/) |
| **Evening (~21–23), any weather** | Melatonin onset; cortisol low; sleep pressure high | Wind-down: lower tempo/energy, warmer/softer timbres, fewer abrupt changes; support the melatonin ramp | ALIGN | [PMC3047226](https://pmc.ncbi.nlm.nih.gov/articles/PMC3047226/), [PMC8813037](https://pmc.ncbi.nlm.nih.gov/articles/PMC8813037/) |
| **Late night (~00–04)** | Circadian alertness trough; melatonin high | Calm, low-arousal; avoid stimulating, alerting (bright/fast) material that fights sleep drive | ALIGN | [PMC6430172](https://pmc.ncbi.nlm.nih.gov/articles/PMC6430172/), [PMC3047226](https://pmc.ncbi.nlm.nih.gov/articles/PMC3047226/) |
| **Winter / chronically low daylight** | Reduced serotonergic tone & light-driven alerting; lower mood baseline (SAD-vulnerable users more so) | Persistent gentle brightening/uplift bias across the day; lean toward positive-valence content | COMPENSATE | [PMID 12480364](https://pubmed.ncbi.nlm.nih.gov/12480364/), [PMC1408021](https://pmc.ncbi.nlm.nih.gov/articles/PMC1408021/) |

**Implementation cautions.**
1. **Circadian > weather.** Weight time-of-day signals more heavily; weather is a small modifier (§4). Don't let a rainy day override the evening wind-down.
2. **Brightness (sun/cloud) is the most trustworthy weather input; temperature (heat) second; barometric pressure & humidity are low-confidence — use sparingly or not at all.**
3. **Personalize chronotype** where possible; otherwise use intermediate-type defaults.
4. These are mood/arousal *nudges*, not clinical claims. SAD and clinical mood disorders require professional care, not a playlist.

---

## References

All URLs verified during research (June 2026). Items marked *(abstract/metadata only)* were confirmed via the abstract or indexing page; full text was paywalled.

**Circadian neuroendocrinology**
- O'Byrne NA, Yuen F, Butt WZ, Liu PY (2021). *Sleep and Circadian Regulation of Cortisol: A Short Review.* Curr Opin Endocr Metab Res 18:178–186. PMC8813037. https://pmc.ncbi.nlm.nih.gov/articles/PMC8813037/
- Wüst S et al. (2000) & Fries E et al. (2009) — primary sources for the CAR magnitude (38–75% rise, ~30 min peak) and prevalence (~77%); overview at *Cortisol awakening response*. https://en.wikipedia.org/wiki/Cortisol_awakening_response
- Kennaway DJ (2023). *Dim light melatonin onset across ages, methodologies, sex.* SLEEP 46(5):zsad033. https://academic.oup.com/sleep/article/46/5/zsad033/7044190
- Gooley JJ et al. *Exposure to Room Light before Bedtime Suppresses Melatonin Onset and Shortens Melatonin Duration in Humans.* PMC3047226. https://pmc.ncbi.nlm.nih.gov/articles/PMC3047226/
- Wahnschaffe A et al. (2013). *Out of the Lab and into the Bathroom: Evening Short-Term Exposure to Conventional Light Suppresses Melatonin and Increases Alertness.* PMC3588003. https://pmc.ncbi.nlm.nih.gov/articles/PMC3588003/
- Reichert CF et al. *Sleep-Wake Regulation and Its Impact on Working Memory Performance: The Role of Adenosine.* PMC4810168. https://pmc.ncbi.nlm.nih.gov/articles/PMC4810168/
- Reichert CF et al. *Adenosine, caffeine, and sleep–wake regulation: state of the science.* PMC9541543. https://pmc.ncbi.nlm.nih.gov/articles/PMC9541543/
- Windred DP et al. (2024). *Higher central circadian temperature amplitude is associated with greater metabolite rhythmicity.* Scientific Reports 14:16796. PMC11263371. https://pmc.ncbi.nlm.nih.gov/articles/PMC11263371/
- *Circadian Regulation for Optimizing Sport and Exercise Performance.* PMC12015785. https://pmc.ncbi.nlm.nih.gov/articles/PMC12015785/
- *Narrative review: circadian rhythm on sports performance, hormonal regulation...* PMC10558889. https://pmc.ncbi.nlm.nih.gov/articles/PMC10558889/

**Post-lunch dip & attention**
- Monk TH et al. *Circadian determinants of the postlunch dip in performance.* PMID 8877121. https://pubmed.ncbi.nlm.nih.gov/8877121/
- *Circadian Rhythms in Attention.* PMC6430172. https://pmc.ncbi.nlm.nih.gov/articles/PMC6430172/
- *Effects of light intervention on alertness and mental performance during the post-lunch dip.* PMC6685797. https://pmc.ncbi.nlm.nih.gov/articles/PMC6685797/

**Chronotype**
- *Chronotype and synchrony effects in human cognitive performance: A systematic review.* Chronobiology International, 2025. https://www.tandfonline.com/doi/full/10.1080/07420528.2025.2490495
- *Neuro-Cognitive Profile of Morning and Evening Chronotypes at Different Times of Day.* PMC8455015. https://pmc.ncbi.nlm.nih.gov/articles/PMC8455015/

**Light & season**
- Chellappa SL et al. *Non-Visual Effects of Light on Melatonin, Alertness and Cognitive Performance: Can Blue-Enriched Light Keep Us Alert?* PLOS ONE, 2011. https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0016429
- *Alerting Effect of Light: A Review of Daytime Studies.* Journal of Daylighting. https://www.solarlits.com/jd/9-150
- *Non-Image-Forming Effects of Daytime Electric Light Exposure in Humans: A Systematic Review and Meta-Analyses.* 2025. https://www.tandfonline.com/doi/full/10.1080/15502724.2025.2493669
- Lambert GW et al. *Effect of sunlight and season on serotonin turnover in the brain.* The Lancet, 2002. PMID 12480364. https://pubmed.ncbi.nlm.nih.gov/12480364/
- Lam RW & Levitan RD (2000). *Pathophysiology of seasonal affective disorder: a review.* J Psychiatry Neurosci 25(5):469–480. PMC1408021. https://pmc.ncbi.nlm.nih.gov/articles/PMC1408021/
- Nussbaumer-Streit B et al. (2019). *Light therapy for preventing seasonal affective disorder* (Cochrane review — evidence insufficient for prevention). PMC6422319. https://pmc.ncbi.nlm.nih.gov/articles/PMC6422319/

**Weather & mood**
- Denissen JJA, Butalid L, Penke L, van Aken MAG. *The effects of weather on daily mood: a multilevel approach.* Emotion, 2008. PMID 18837616. https://pubmed.ncbi.nlm.nih.gov/18837616/
- *Temperature, Crime, and Violence: A Systematic Review and Meta-Analysis.* Environ Health Perspect. PMC11477092. https://pmc.ncbi.nlm.nih.gov/articles/PMC11477092/
- Lynott D et al. *The effects of temperature on prosocial and antisocial behaviour: A review and meta-analysis.* Br J Soc Psychol, 2023. PMID 36794795. https://pubmed.ncbi.nlm.nih.gov/36794795/
- *Impact of Barometric Pressure Changes on Migraine: A Systematic Review.* PMC12617017. https://pmc.ncbi.nlm.nih.gov/articles/PMC12617017/
- *Blame it on the weather? Pain in fibromyalgia, relative humidity, temperature and barometric pressure.* PMC6510434. https://pmc.ncbi.nlm.nih.gov/articles/PMC6510434/
