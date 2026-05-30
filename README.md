# AUSPEX

**Doctrine-tagged cyber-event intelligence atlas.** A flagship product of [Black Flag Intelligence](https://blackflagintel.com).

AUSPEX is a hand-curated, source-anchored corpus of state-sponsored cyber events tagged against the strategic doctrines under which they were tasked. The thesis: vendor attribution names the *who*; doctrine names the *why*. Both are necessary; only the join is the product.

## Current state (atlas snapshot)

| | |
|---|---|
| Events | 658 |
| Doctrine states | 15 |
| Doctrines | 86 (across 199 pillars, 7 programs) |
| Actors | 159 (state + criminal) |
| Services | 74 |
| Sources | 1,109 |
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

Bayesian Naive Bayes with multi-hot features and Laplace smoothing. Feature families:

- Target sectors, target countries, initial vectors, incident types, event year
- MITRE ATT&CK techniques (parent T-codes) + co-occurrence pairs
- Malware families with lineage-group partial credit (Trickbot↔Conti, IcedID↔Latrodectus)
- Named target organizations and infrastructure
- Geopolitical-marker proximity (attacker-side + target-side)
- Cyber-to-cyber dyad reactivity lag
- Editorial campaign clusters + algorithmic latent campaign clusters
- TF-IDF prose terms (extracted from event summary/outcome)
- Indictment-named individual operators

Temporal-weighted training, IDF reweighting, hierarchical service-prior (Empirical Bayes, λ = 0.2), out-of-distribution detection (Jaccard nearest-neighbour + calibrated-entropy), and temperature-scaling calibration (T = 2.0 / 3.0 / 3.0 for attribution / doctrine / pillar).

### Current accuracy (leave-one-out)

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
| Attribution | **57.4%** / 56.8% | **74.9%** / 74.6% | **0.669** / 0.665 MRR | 470 / 519 |
| Doctrine | **73.8%** / 71.7% | **89.6%** / 88.8% | **0.717** / 0.696 mAP | 480 / 555 |
| Pillar | **64.5%** / 64.8% | **82.0%** / 81.0% | **0.687** / 0.683 mAP | 428 / 489 |
| Joint (actor × doctrine) | **50.5%** / 48.9% | **67.3%** / 68.9% | **0.604** / 0.599 MRR | 410 / 450 |

Excluding meta events *raises* the headline (doctrine +2.1pp): they are off-task for an
operation-trained engine, not easy wins. The **stacked** re-ranker lifts operations-only attribution
top-1 to **69.6%** (+12.1pp over plain NB). With the editorial `campaign_id` "known-linkage" feature
ablated, operations-only attribution top-1 / top-3 falls to 50.9% / 71.9% (−6.6pp) — a sensitivity
bound, since `campaign_id` is analyst-assigned and can encode the attribution for single-actor
campaigns. (The all-events column is the prior baseline; operations-only additionally applies the
prose-DF LOO-hygiene fix, a <0.2pp effect.)

Temperature scaling (T = 2.0 / 3.0 / 3.0) reduces softmax overconfidence; per-engine reliability
diagrams (with ECE) on the research pages show calibration quality on the deployed engine. Rank-1
stability under 10% corpus dropout: 91.8%, with top-3 set-stability 98.9% (seeded resampler,
reproducible build-to-build). NotPetya counterfactual carried as a standing adversarial test for
false-flag handling.

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
