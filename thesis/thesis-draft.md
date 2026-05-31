# Beyond Attribution: Doctrine-Aware Tagging, Attribution, and Forecasting of State-Sponsored Cyber Operations

**A thesis submitted for the degree of Doctor of Science in Cybersecurity**

*Working draft — 2026-05-31. Numbers reflect the 815-event AUSPEX corpus. `[TODO]`
marks writing still owed (chiefly the formal literature review).*

---

## Abstract

State-sponsored cyber operations are routinely attributed to threat actors — the *who* —
by commercial and government analysts. The strategic *why*, the national doctrine an
operation advances, is treated qualitatively, if at all, and never as a structured,
predictive signal. This thesis introduces a **doctrine-aware** approach to cyber threat
intelligence (CTI) and validates it on **AUSPEX**, a hand-curated, source-anchored corpus
of **815 state-sponsored cyber events** tagged against **86 strategic doctrines** (199
pillars) spanning **15 nation-states**, alongside an isomorphic prediction engine.

The thesis defends four claims. **(1) Labelability:** the doctrine an operation advances
can be reliably tagged *independent* of who carried it out, under a disciplined editorial
process (source-anchoring, ICD-203 confidence, attribution–doctrine independence).
**(2) Complementarity:** doctrine carries strategic signal distinct from attribution; a
joint actor × doctrine model predicts the pair. **(3) Honest evaluation under extreme
class imbalance:** with half the actor roster represented by ≤2 events, attribution
accuracy is a function of data availability, not engine capability — the deployed
ComplementNB + stacked re-ranker reaches **87.5%** top-1 on actors with ≥10 events but
**65.1%** aggregate; and a controlled corpus-growth experiment shows that *naive* event
count does **not** improve attribution (it can lower the headline by composition) — three
levers do: **depth** per actor, **feature richness**, and **discriminability** from
same-niche neighbours. **(4) Forecasting:** the who × why join enables *prospective*
prediction — given a target profile, which actors are likely to attack and under what
doctrine — forward-validated at **2.6× the usual-suspects base rate** (top-5 ≈ 40% from
target profile alone), with risk reported honestly as relative, not absolute.

The contribution is a bridge between strategic-studies notions of doctrine and the
technical practice of attribution, an open methodology for building defensible
doctrine-tagged CTI datasets, a rigorous account of how attribution ML should be measured
on long-tailed data, and the first interpretable who × why forecasting capability.

---

## Thesis statement

> The strategic doctrine under which a cyber operation is tasked is a **labelable,
> model-able, and predictive** layer of cyber activity — independent of, and complementary
> to, actor attribution — and operationalizing the **who × why join** enables interpretable
> attribution and forecasting that attribution alone cannot.

## Research questions

- **RQ1 (Labelability).** Can the strategic doctrine an operation advances be reliably and
  reproducibly labeled, *independent* of actor attribution, on real-world cyber events?
- **RQ2 (Complementarity).** Does doctrine carry signal beyond attribution, and can the
  actor × doctrine pair be jointly predicted?
- **RQ3 (Evaluation under imbalance).** How should attribution ML be measured and improved
  when the threat-actor distribution is extremely imbalanced and long-tailed — and does
  growing the corpus help?
- **RQ4 (Forecasting).** Can the who × why join forecast prospective targeting — who will
  attack a given target, and under what doctrine — and how must such forecasts be honestly
  bounded?

## Contributions

1. **A doctrine-tagged CTI corpus + a reproducible curation methodology** (RQ1): 815
   source-anchored events linked to the doctrines they advance, with ICD-203 confidence,
   stable identifiers, doctrine–attribution independence, and a documented provisional→QC'd
   promotion pipeline. The methodology — *how to build a defensible doctrine-tagged
   dataset* — is itself a contribution.
2. **The who × why framing and a joint model** (RQ2): formalizing doctrine as a first-class
   predictive attribute, and a joint actor × doctrine engine.
3. **An empirical account of attribution under the long tail** (RQ3): the deployed
   ComplementNB + stacked engine; a defense of the NB family over gradient-boosted trees on
   the imbalanced few-shot regime; identification and removal of a label-leaking prose
   feature; honest evaluation conventions (null = miss, temporal holdout, operations-only);
   and a controlled corpus-growth experiment yielding the **three-lever** result.
4. **The first doctrine-aware forecaster** (RQ4): forward-validated who × why prediction
   from target profile alone, with an explicit, defensible relative-risk treatment of the
   missing-negatives problem.

---

## Chapter 1 — Introduction

Attribution is the organising problem of state-sponsored CTI: vendors publish "APT*" /
"*Typhoon" / "*Bear" clusters and governments issue indictments and advisories. Yet
attribution answers only *who*. For a defender deciding where to invest, or an analyst
explaining an incident to a policymaker, the more consequential question is often *why* —
what national strategic objective the operation serves. That question is the province of
strategic studies and is handled in prose, case by case, never as structured data and
never predictively.

This thesis argues that the *why* is operationalizable. National cyber doctrine — the
published or inferable strategic intent that tasks an operation (e.g., a reunification
imperative, a regime-security mandate, a sanctions-evasion revenue program, a forward-
defense posture) — can be attached to events as structured, confidence-labeled links, and
once attached it behaves like signal: it can be modeled, it complements attribution, and
it supports forecasting. The vehicle is **AUSPEX**, a corpus + engine the author built and
operates, whose thesis is summarized as: *vendor attribution names the who; doctrine names
the why; the join is the product.*

§1 frames the gap, states the thesis and RQs (above), and previews the contributions and
the honest limitations (a single-curator, machine-assisted corpus; modest absolute
accuracy framed as a data-availability map; the no-negatives bound on forecasting).
`[TODO: tighten to ~4 pages; add a worked motivating example — e.g., a Taiwanese chip firm
forecast surfacing PRC/reunification — to make the who×why payoff concrete on page one.]`

## Chapter 2 — Background and related work `[TODO: citations]`

Three literatures meet here and none of them connects to the others:

- **Cyber attribution / CTI.** Vendor clustering and naming; MITRE ATT&CK as a shared TTP
  vocabulary; government attribution (indictments, joint advisories); the diamond model;
  attribution uncertainty and false-flags. *Gap: attribution stops at the actor.*
  `[TODO: cite ATT&CK, the diamond model, Rid & Buchanan on attribution, vendor TIR practice.]`
- **Strategic doctrine in IR / strategic studies.** How states publish and enact cyber
  doctrine; persistent engagement, forward defense, information confrontation, etc.
  *Gap: qualitative, not linked to operational data.*
  `[TODO: cite national cyber strategies, Gerasimov/“non-linear war” debates, persistent-engagement literature.]`
- **ML for attribution / imbalanced & few-shot classification, calibration, temporal
  evaluation.** *Gap: little work treats the threat-actor long tail honestly, and none
  models doctrine.*
  `[TODO: cite ComplementNB (Rennie et al. 2003), calibration/temperature scaling, class-imbalance + long-tail learning, temporal/prospective evaluation in security ML.]`

The synthesis the thesis claims: **AUSPEX is the first work to make doctrine a structured,
predictive layer over operational cyber data and to join it with attribution for
forecasting.**

## Chapter 3 — The AUSPEX corpus and the doctrine-tagging methodology (RQ1)

**The artifact.** 815 events; 204 actors (state + criminal); 88 services; 1,269 sources;
86 doctrines / 199 pillars across 15 doctrine-states. Each event carries: incident
metadata, a source-anchored attribution block, `doctrine_links` (doctrine + pillar +
ICD-203 confidence + analyst reasoning), and structured targets (sector / country / org).

**Editorial discipline (the methodology contribution).** (i) *Source-anchored* — every
claim links to a primary source; URLs are curl-verified; unverifiable → `url: null` + a
note; no fabricated URLs. (ii) *ICD-203 confidence* — `attested` only when the source
names the strategic goal, else `strongly_inferred` / `plausible`; "we don't upgrade."
(iii) *Doctrine–attribution independence* — a `doctrine_link` can be `attested` with
`actor_id: null`: an operation can be doctrinally legible without a named cluster. This
independence is what makes RQ2 a real question rather than a tautology. (iv) *Stable
identifiers* — slugs never rename; corrections add aliases. (v) *No conflict of interest.*

**Reproducibility + QC.** This thesis also documents a worked dataset-growth episode (also
the substrate for Chapter 4): a backlog of candidate events was imported provisionally,
then promoted to the QC'd corpus through verifiable stages — URL re-verification, actor →
real-service wiring, alias de-duplication, source-grounded claim verification (each event's
attribution re-read against its source: *supported / weak / unsupported*), and
doctrine-tagging. Doctrine coverage reached **84% of operations** (the remainder being
criminal/stateless operations that legitimately have no strategic doctrine). The point for
the committee: *defensibility is a process, and the process is auditable* (every stage is a
versioned commit with a recorded decision log).

**Limitations (stated up front).** Single primary curator; doctrine links are currently
machine-authored under human review (`analyst: claude`); the corpus records *disclosed*
operations and therefore inherits reporting bias. §3 argues these are bounded and
documented rather than disqualifying, and proposes inter-rater validation as future work.

## Chapter 4 — Attribution under extreme class imbalance and the long tail (RQ3)

**The regime.** The threat-actor distribution is brutally long-tailed: of 177 attributed
operational actors, **98 (55%) have ≤2 events** and 75 are singletons — yet those thin
actors are only ~17% of *events*. This is a few-shot, high-imbalance, ~68-effective-class
problem, not a balanced classification task.

**Engine.** A **ComplementNB** base (Rennie et al. 2003 — designed for exactly this
imbalance) re-ranked by an L2 logistic **stacker** over discriminative meta-features
(named-operator and target-org overlap, malware-lineage hit, campaign match,
active-window). Validated against scikit-learn to the decimal; deployed isomorphically
(identical code server-side and in the browser `/predict`, verified byte-identical).

**Why not deep / boosted models.** A gradient-boosted-tree benchmark on identical features
and protocol reached **~31%** top-1 vs ComplementNB's **~68%** (McNemar p < 0.001): trees
starve on ~4 samples/class. This *defends the NB-family choice* — the obvious "use a
stronger model" objection, answered empirically.

**A label leak, found and removed.** The TF-IDF prose feature was scrubbed of actor
names/aliases after discovering that a large majority of events carried their own actor's
name as a prose token — an analyst summary naming the actor leaked the label. Removing it
moved the headline <1pp (the engine leans on operators/campaign/malware), so the published
numbers are leak-free *and* near-unchanged — a transferable caution for ML-on-threat-intel.

**Honest evaluation conventions.** *null = miss* (a singleton unrankable under
leave-one-out counts as a miss, not an exclusion); *operations-only* headline (meta /
announcement events are off-task and reported separately); attribution via stratified
5-fold CV; a *temporal holdout* (train ≤ 2023-12-31, score 2024+ cold) as the
generalization test. These conventions refuse to flatter the result.

**The headline is a data-availability map, not a capability ceiling.** Stratified by
training depth:

| true actor has… | attribution top-1 | events |
|---|---|---|
| ≥10 events | **87.5%** | 216 |
| 5–9 | 76.8% | 185 |
| 3–4 | 55.8% | 113 |
| 2 | 23.8% | 42 |
| 1 (singleton) | 4.3% | 69 |

Aggregate top-1 is 65.1%, but the engine is strong wherever evidence exists; the headline
is dragged by the unrankable tail.

**The corpus-growth experiment (the core empirical result).** Does more data help? A
controlled expansion (658 → 815 events) with full pre/post decomposition shows the naive
answer is *no*: the aggregate top-1 *fell* 74.5 → 65.1, but the **original 470 events still
scored 74.5%** under the expanded model (net-zero) — the drop is **composition, not
regression** (new thin/long-tail actors are unrankable under CV and feature-poor when
un-QC'd). Three levers actually move accuracy:

1. **Depth** per actor above the CV-rankability threshold — a targeted round deepening 10
   thin actors moved them from **0% → 61.9%**.
2. **Feature richness** — source-grounded enrichment of feature-poor events: **+11.4pp** on
   the enriched subset.
3. **Discriminability** — even at depth, two actors (Gamaredon, Confucius) stayed
   unrankable because they collide with *higher-volume same-state neighbours* (Sandworm;
   SideWinder) on the same niche; separating them needs distinctive features, not more
   events.

The generalizable claim: **for long-tailed attribution, corpus *count* is the wrong lever;
depth, feature richness, and discriminability are.** `[TODO: add confidence intervals /
McNemar on the pre/post deltas for the formal write-up.]`

## Chapter 5 — The who × why join (RQ2)

Doctrine and pillar are predicted by multi-hot NB engines; the **joint** model predicts the
actor × doctrine pair (ComplementNB actor side, NB doctrine side, co-occurrence prior).
Operations-only headlines on the QC'd corpus: doctrine **69.2%** top-1 (87.0% top-3),
pillar **61.4%**, joint **46.7%**. Crucially, doctrine is predicted over a *much larger
label space* than actors and remains strong, supporting **complementarity**: the strategic
frame is legible from operational features even where the specific actor is not.

A second result here is methodological honesty about *coupling*: doctrine-tagging the
backfilled operations *lowered* doctrine/pillar/joint (from 72.9 / 63.8 / 53.9) because
those harder events then entered the eval label sets — the same composition effect as
Chapter 4, and the price of *complete* coverage over a flattering partial one. Joint moves
most because it must get both a long-tail actor and its doctrine right. §5 argues that
reporting the honest, complete-coverage number is the defensible choice.
`[TODO: an ablation isolating the doctrine signal's marginal contribution to attribution.]`

## Chapter 6 — Doctrine-aware forecasting (RQ4)

**The reframe.** Forecasting is *not* attribution. The operation hasn't happened, so the
model may use only **forecast-available** features — the target's standing attributes
(sector / country / org) and geopolitical context — never post-hoc tradecraft (TTPs,
malware, prose). And because the corpus records *attacks, not the population of targets*,
there are **no negatives**: absolute P(attack) is not identifiable. The honest deliverable
is a **relative-risk** score (corpus-frequency percentile + comparable-event anchors) plus
a ranked-actor forecast — not a calibrated probability.

**Model.** Recency-weighted target-feature likelihood + a **state-level dyad** term (a thin
or new actor inherits its state's history against the target's country — the real
dyadic-tension signal) + a recency prior.

**Validation (prospective, never LOO).** Train ≤ 2023-12-31, score 2024+; rank the true
actor from target profile alone. It must beat **popularity** ("name the usual suspects")
and **affinity** ("name whoever hits this profile most") or it is noise. On the rankable
subset (n = 140, 132 candidate actors): popularity top-5 15.0% → affinity 28.6% → +prior
32.9% → **+recency+dyad 39.3%** — **2.6× the base rate** (top-1 16.4% vs 5.7%). Recency-
weighting the targeting and the dyad are the levers; markers were *excluded by design*
(AUSPEX timeline markers encode state *capability/doctrine*, not attacker↔victim tension,
so they would boost the victim's own state).

**The differentiator: who × why forecasts.** Because the corpus is doctrine-complete, each
predicted actor is paired with the **doctrine it would advance**. The forecasts are
theatre-correct: Taiwanese government → PRC clusters under `taiwan-reunification`; Israeli
defense → Iranian clusters under `resistance-axis`; Ukrainian energy → Sandworm under
`russkiy-mir`; Indian government → Pakistani clusters under `asymmetric-posture-india`;
financial targets → DPRK revenue actors and criminal crews honestly carrying *no doctrine*.
No commercial product publishes the rationale; this is the thesis's most novel practical
output. `[TODO: a small expert-rated face-validity study of N forecasts to complement the
quantitative top-k.]`

## Chapter 7 — Discussion

**An interdisciplinary bridge.** The thesis connects strategic-studies doctrine to
technical attribution via a structured, predictive layer — useful to *both* communities:
defenders gain *why* (prioritization, anticipated targeting), strategic analysts gain a
data substrate for what was previously prose.

**Implications for practice.** Doctrine tags make attribution *interpretable* and
forecasts *actionable*; the long-tail result tells collection teams to deepen and enrich
thin actors rather than chase raw volume; the honest evaluation conventions are a template
for CTI-ML reporting.

**Limitations (foregrounded, not buried).** Single-curator + machine-authored-under-review
doctrine links (mitigation: inter-rater study); disclosure/reporting bias; relative — not
absolute — forecasting risk (mitigation: an exposure model with negative sampling); modest
absolute accuracy on the tail (reframed as an honest data-availability frontier, with the
stratified table as evidence the engine is strong where evidenced).

## Chapter 8 — Conclusion and future work

Doctrine is signal. It can be labeled independent of attribution, it complements the *who*,
it survives honest evaluation on hard long-tailed data, and joined with attribution it
forecasts prospective targeting with its strategic rationale attached. Future work: an
exposure model for absolute-probability forecasting; inter-rater validation of doctrine
tags; automated doctrine-link suggestion with human confirmation; broadening beyond the 15
doctrine-states; and a longitudinal prospective evaluation (lock a forecast today, score it
against next year's disclosures).

---

## Appendix A — Reproducibility

All results trace to committed experiments and tools in the AUSPEX repository:
`pnpm validate`; `tools/eval-stacked-cnb.ts` (deployed attribution), `eval-doctrine` /
`eval-pillar` / `eval-joint-cnb`, `eval-temporal`, `eval-forecast.ts` (forecasting
forward-validation), `import-staging.ts` / `apply-enrichment.ts` / `apply-wiring.ts` /
`doctrine-apply.ts` (the QC pipeline), and the decision-log audit files under `research/`.
Methodology docs: `docs/AUDIT-2026-05-29.md`, `docs/MODELING-DIAGNOSTICS-2026-05-30.md`,
`docs/CORPUS-GROWTH-EXPERIMENT-2026-05-30.md`, `docs/FORECASTING-2026-05-31.md`.
