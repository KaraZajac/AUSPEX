# AUSPEX

**Doctrine-tagged cyber-event intelligence atlas.** A flagship product of [Black Flag Intelligence](https://blackflagintel.com).

AUSPEX is a hand-curated, source-anchored corpus of state-sponsored cyber events tagged against the strategic doctrines under which they were tasked. The thesis: vendor attribution names the *who*; doctrine names the *why*. Both are necessary; only the join is the product.

## Current state (atlas snapshot)

| | |
|---|---|
| Events | 815 |
| Doctrine states | 15 |
| Doctrines | 86 (across 199 pillars, 7 programs) |
| Actors | 204 (state + criminal) |
| Services | 88 |
| Sources | 1,269 |
| Timeline markers | 73 |

Doctrine states covered: **US, RU, CN, IR, KP, IL, IN, PK, TR, BY, VN, UK, FR, KR, AE.**

## Repo layout

```
AUSPEX/
├── atlas/        # the canonical YAML dataset — read atlas/README.md
├── site/         # Astro 6 static site that renders the atlas + engine
├── docs/         # DATA_MODEL.md, QA reports, URL-verification logs
├── research/     # reference notes per state / actor / doctrine
└── examples/     # (reserved)
```

Each subdirectory has its own README where useful. The atlas is the product; the site renders it.

## Editorial discipline

- **Source-anchored.** Every claim links to a primary source (govt, vendor TIR, court doc, indictment). URLs are curl-verified; unverifiable URLs get `url: null` plus an explanatory note. No fabricated URLs.
- **ICD-203 confidence labels.** `attested` only when the attributing source explicitly named the strategic goal. `strongly_inferred` / `plausible` for weaker linkages with editorial reasoning.
- **Doctrine linkage is independent of actor attribution.** A `doctrine_links:` entry on an event can be `attested` even when `actor_id: null` — the operation can be doctrinally legible without a named cluster.
- **Stable slugs forever.** Once a slug is published it never gets renamed; corrections add aliases.
- **No conflict of interest.** AUSPEX does not work for, contract with, or take funding from any government, intelligence service, or commercial vendor named in the atlas.

## Engine

Multi-hot Naive Bayes with Laplace smoothing (doctrine / pillar / joint); **attribution** is served by **ComplementNB + a stacked logistic re-ranker** (2026-05-30). Feature families:

- Target sectors, target countries, initial vectors, incident types, event year
- MITRE ATT&CK techniques (parent T-codes) + co-occurrence pairs
- Malware families with lineage-group partial credit (Trickbot↔Conti, IcedID↔Latrodectus)
- Named target organizations and infrastructure
- Geopolitical-marker proximity (attacker-side + target-side)
- Cyber-to-cyber dyad reactivity lag
- Editorial campaign clusters + algorithmic latent campaign clusters
- TF-IDF prose terms (extracted from event summary/outcome)
- Indictment-named individual operators

Temporal-weighted training, IDF reweighting, hierarchical service-prior (Empirical Bayes, λ = 0.2), out-of-distribution detection (Jaccard nearest-neighbour + calibrated-entropy), and temperature-scaling calibration (T = 3.0 / 3.0 for doctrine / pillar; the attribution re-ranker emits calibrated probabilities directly).

### Current accuracy (leave-one-out; attribution via 5-fold CV)

Each engine reports two numbers: **operations-only** (the headline — the engine's task is to infer
the strategic frame / actor of actual cyber *operations*) and *all-events* (the same eval also
scoring the ~85 meta/announcement events — doctrine publications, sanctions notices, attribution
advisories — which are a *different* prediction task). Meta events are excluded from eval but kept
in training and in the atlas. Reported under the **null = miss** convention (an event whose sole
true label is a corpus singleton, unrankable under LOO, counts as a miss, not an exclusion);
counter-operations (state takedowns / sanctions / bounties) carry a null actor and are excluded
from the attribution/joint label spaces. See [`docs/AUDIT-2026-05-29.md`](docs/AUDIT-2026-05-29.md).

| Engine | top-1 (ops / all) | top-3 (ops / all) | mAP·MRR (ops / all) | n (ops / all) |
|---|---|---|---|---|
| Attribution (ComplementNB + stacked re-ranker) | **65.1%** | **73.8%** | **0.698** MRR | 625 |
| Doctrine | **69.2%** / 68.1% | **87.0%** / 86.5% | **0.697** / 0.682 mAP | 608 / 683 |
| Pillar | **61.4%** / 60.0% | **80.9%** / 79.8% | **0.678** / 0.666 mAP | 529 / 590 |
| Joint (CNB actor × NB doctrine) | **46.7%** | **59.3%** | **0.545** MRR | 538 |

Doctrine, pillar, and joint fell from their pre‑expansion figures (72.9 / 63.8 / 53.9) once the
backfilled operations were **doctrine‑tagged** — those events then entered these eval label sets, and
they are harder (thin actors, long‑tail doctrines). The drop is composition, not regression — the
same effect documented for attribution. Joint moves most because it must get *both* a long‑tail actor
and its doctrine right. Excluding meta events still *raises* the doctrine headline (+1.1pp): meta
events are off‑task for an operation‑trained engine, not easy wins.

**Attribution accuracy is data‑bound, not capability‑bound.** The 65.1% headline is a weighted
average over a deliberately long‑tailed corpus. Stratified by how much training data each true actor
has, the engine is strong wherever evidence exists and unrankable only on the singleton tail:

| true actor has… | attribution top‑1 | events |
|---|---|---|
| **≥10 events** | **87.5%** | 216 |
| **5–9 events** | **76.8%** | 185 |
| 3–4 events | 55.8% | 113 |
| 2 events | 23.8% | 42 |
| 1 event (singleton) | 4.3% | 69 |

Half the actor *roster* (98 of 177) is thin (≤2 events) — but only ~17% of events. The headline is
therefore an honest map of the data‑availability frontier, not a capability ceiling: deepening thin
actors is the proven lever (a targeted depth round moved 10 of them from 0% to 61.9%).

**Attribution engine — ComplementNB + stacked re-ranker (deployed live).** On the QC'd **815-event**
corpus, attribution top-1 is **65.1%** (top-3 73.8%, MRR 0.698; 5-fold CV, operations-only): a
**ComplementNB** base (Rennie et al. 2003 — built for the severe class imbalance of the long tail of
one-and-few-event actors) at **55.8%**, re-ranked by the L2 logistic stacker (**+9.3pp**), and
**+16.3pp over the raw-NB baseline (48.8%)**. ComplementNB was validated against scikit-learn to the
decimal; the deployed model (CNB base + an all-corpus logreg) runs in
[`/predict`](https://auspex.blackflagintel.com/predict) and is verified byte-identical
browser-vs-server. The **joint** actor side also uses ComplementNB (actorWeight 2.0 — top-1
**53.9%**). Doctrine, pillar, and joint are **unchanged** by the expansion (the added events carry no
doctrine links, so they enter neither those training sets nor their eval label sets). Ablating the
analyst-assigned `campaign_id` is a ~6–7pp sensitivity bound.

**Corpus growth (2026-05-30).** This corpus was deliberately grown from 658→815 events (159→204
actors) to widen coverage. The attribution headline fell from the previous **74.5%** (658-event
corpus) to 65.1% — and the
[corpus-growth experiment](docs/CORPUS-GROWTH-EXPERIMENT-2026-05-30.md) shows the drop is
**composition, not regression**: the original 470 events still score **74.5%** under the expanded
model (net-zero change), while the added long tail of thin/new-actor events is harder under the
**null = miss** + CV-rankability conventions. Lifting the tail back up takes three levers — event
**depth** per actor above the CV threshold (deepening 10 thin actors moved them 0%→61.9%),
source-grounded **feature richness** (+11.4pp on enriched events), and **discriminability** from
same-niche neighbors; raw event *count* moves none. On a cold temporal holdout (train ≤ 2023-12-31,
score 2024+) raw-NB attribution is **36.1%** — lower than on the smaller corpus because the backfill
is heavily 2024–2025, so the holdout is now dominated by recent events on actors with little
pre-2024 history (the hardest tail).

**Prose actor-name de-leak (2026-05-30).** The TF-IDF prose feature is scrubbed of actor
names/aliases. Previously **a large majority of events carried their own actor's name as a prose
token** — an analyst summary naming the actor leaked the attribution label. Scrubbing it lowered the
headline only slightly (attribution −0.8pp, doctrine −0.9pp), because the engine weights prose at
just 0.4 and leans on operators / campaign / malware; the numbers above are therefore both leak-free
*and* nearly unchanged. See [`docs/MODELING-DIAGNOSTICS-2026-05-30.md`](docs/MODELING-DIAGNOSTICS-2026-05-30.md).

Temperature scaling (T = 2.0 / 3.0 / 3.0, refit on the 815-event corpus — temperatures unchanged,
robust to the expansion) reduces softmax overconfidence; per-engine reliability diagrams (with ECE)
on the research pages show calibration quality on the deployed engine. Rank-1 stability under 10%
corpus dropout (seeded resampler, reproducible build-to-build) is recomputed and reported live on
those pages. NotPetya counterfactual carried as a standing adversarial test for false-flag handling.

## Quick start

```sh
cd site
pnpm install
pnpm validate              # validate the atlas (must be clean)
pnpm dev                   # local dev at http://localhost:4321
pnpm build                 # full static build (~60 min — runs LOO eval at build time)
pnpm eval-attribution      # standalone attribution LOO + Monte Carlo stability
pnpm eval-doctrine         # standalone doctrine LOO
pnpm eval-pillar           # standalone pillar LOO
pnpm eval-temporal         # temporal holdout (train ≤ 2023-12-31, test 2024+)
```

The atlas is the source of truth. Run `pnpm validate` after any edit; it must return clean before committing.

## Status

**Private, pre-v1.0.** Path is atlas-first: keep widening doctrine coverage, deepening event corpus, and tightening engine accuracy until the atlas is defensible as a v1.0 product. Public launch via [auspex.blackflagintel.com](https://auspex.blackflagintel.com) lands after v1.0 freeze.

---

© 2026 Black Flag Intelligence. All rights reserved.
