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

Temporal-weighted training, IDF reweighting, hierarchical service-prior (Empirical Bayes), out-of-distribution detection via Jaccard similarity, and temperature-scaling calibration (T = 2.0 / 3.0 / 3.0 for attribution / doctrine / pillar).

### Current accuracy (leave-one-out)

| Engine | top-1 | top-3 | mAP / MRR |
|---|---|---|---|
| Attribution | 59.4% | 78.5% | 0.700 MRR |
| Doctrine | 72.0% | 89.2% | 0.698 mAP |
| Pillar | 65.3% | 82.4% | 0.688 mAP |

Calibration improves NLL by 27.8% / 39.1% / 43.5% on the three engines. Rank-1 stability under 10% corpus dropout: 91.2%. NotPetya counterfactual carried as a standing adversarial test for false-flag handling.

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
