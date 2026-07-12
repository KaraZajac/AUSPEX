# AUSPEX

[![DOI](https://zenodo.org/badge/1252892880.svg)](https://doi.org/10.5281/zenodo.21327251)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](LICENSE)

**A doctrine-tagged corpus of state-sponsored cyber operations.** A research dataset from
[Black Flag Intelligence](https://blackflagintel.com).

AUSPEX is a hand-curated, source-anchored corpus of state-sponsored cyber events tagged against the
strategic doctrines under which they were tasked. The thesis: vendor attribution names the *who*;
doctrine names the *why*. Both are necessary; the join is the contribution.

**Live site:** [auspex.blackflagintel.com](https://auspex.blackflagintel.com) — browse every event,
actor, and doctrine, with the attribution/doctrine engine and prospective forecasts.

## The dataset

| | |
|---|---:|
| Events | **785** |
| Doctrine-authoring states | **15** |
| Doctrines (pillars / programs) | **86** (199 / 7) |
| Actors (state + criminal) | **222** |
| Services | **93** |
| Policy-actions (takedowns / sanctions / indictments) | **179** |
| Source records | **1,772** |
| Target entities · timeline markers | 113 · 73 |

Doctrine-authoring states covered: **US, RU, CN, IR, KP, IL, IN, PK, TR, BY, VN, UK, FR, KR, AE.**

**Every event has been audited against its raw sources.** The corpus is **100% qc-stamped**
(691 full + 94 partial of 785): each event checked 6-point against its raw cited sources — facts,
attribution, dates, doctrine links, attribution level, actor id — under a documented protocol
([docs/CORPUS-VERIFICATION-PLAN.md](docs/CORPUS-VERIFICATION-PLAN.md)). This is **machine-performed
verification** (LLM, `verified_by: claude-opus-4.8`, recorded per event in the `qc:` block) — a
100%-coverage audit of every record against its primary sources, which is rare for an event dataset;
it is *not* the same as, and is disclosed separately from, independent human inter-rater
verification (a distinct reliability study). *Full* means every load-bearing claim is carried by a
snapshotted source; *partial* means a load-bearing source was un-snapshottable (bot-walled or
link-rotted) and was mirror-corroborated. Independently, the machine gate (`make verify`) proves
3,437/3,437 records fit the JSON Schema with zero structural errors.

## Repo layout

```
AUSPEX/
├── atlas/        # the canonical YAML dataset — one file per event/actor/doctrine/source/…
├── site/         # Astro static site that renders the atlas + engine + forecasts
├── docs/         # SCHEMA.md (authoritative field schema), methodology, verification, audits
├── audit/        # independent Python verification harness (check_conformance.py, verify_atlas.py)
├── analysis/     # the who×why analyses (FINDINGS.md numeric ledger)
├── thesis/       # the pre-registered confirmatory predictions
├── publish/      # release datasheet + bundle exporter
└── research/     # per-state / per-actor / per-doctrine reference notes + decision logs
```

The atlas is the product; the site renders it. Rights and layered attribution:
[DATA-RIGHTS.md](DATA-RIGHTS.md). Full dataset documentation: [publish/DATASHEET.md](publish/DATASHEET.md).
Every source cited anywhere in the corpus, grouped by publisher with its cited-by count:
[SOURCES.md](SOURCES.md) (generated).

## Editorial discipline

- **Source-anchored.** Every claim links to a primary source (government release, vendor report,
  court doc, indictment). URLs are curl-verified; unverifiable ones get `url: null` + a note. No
  fabricated URLs. Copyrighted source *bodies* are not redistributed — only the URL and a SHA-256
  content hash (`content_sha256`) are published, so anyone can re-fetch and verify.
- **Confidence labels (ICD-203 style).** A doctrine link is `attested` only when a cited source
  names the strategic goal in substance; `strongly_inferred` / `plausible` for weaker linkages,
  each with structured `inference_basis` reasoning.
- **Doctrine linkage is independent of actor attribution.** A `doctrine_links:` entry can be
  `attested` even when `actor_id: null` — an operation can be doctrinally legible without a named
  cluster (e.g. a counter-action where the acting state's doctrine is the point).
- **Perspective-tagged doctrine.** Links carry `attacker-rationale` / `victim-response` /
  `defender-response`, so the who×why analyses use only the attacker's own doctrine.
- **Stable slugs forever.** Once published a slug is never renamed; corrections add aliases.
- **No conflict of interest.** AUSPEX takes no funding from, and does no work for, any government,
  intelligence service, or commercial vendor named in the atlas.

## Engine

A leakage-aware who×why engine: multi-hot Naive Bayes (doctrine / pillar / joint) and a deployed
**ComplementNB base + stacked logistic re-ranker** for attribution, over feature families spanning
target sectors/countries, initial vectors, incident types, MITRE ATT&CK techniques (+ co-occurrence),
malware families with lineage partial-credit, named targets, geopolitical-marker proximity,
dyad-reactivity lag, campaign clusters, de-leaked TF-IDF prose, and indictment-named operators.
Temporal-weighted training, IDF reweighting, hierarchical service priors (Empirical Bayes),
out-of-distribution detection, and temperature-scaled calibration.

**Current accuracy** (corpus of 785 events). Two honesty caveats first: *(1)* ground truth is
analyst-concurred **vendor attribution**, not a verified oracle — every figure is agreement with
that consensus; *(2)* leave-one-out / cross-validation is **retrodiction** (trains on events before
*and* after the held-out one), which is not forward-prediction skill — for that, see the temporal
holdout. `null = miss` throughout; counter-actions carry a null actor and sit outside the
attribution label space.

| engine | top-1 | top-5 | method |
|---|---|---|---|
| **Attribution** (deployed CNB + stacked re-ranker) | **50.8%** | **66.1%** | 5-fold CV, ops-only |
| **Doctrine** | **62.8%** | **88.1%** | leave-one-out |
| **Pillar** | **57.6%** | **83.4%** | leave-one-out |
| **Joint** (actor × doctrine) | **38.0%** | **56.9%** | leave-one-out |
| Naive baseline (MITRE ATT&CK Groups lookup) | — | 3.4% | the floor |

**Prospective skill (temporal holdout, train ≤ 2023-12-31, score 2024+).** For actors with pre-2024
history (the rankable set), the true actor is in the attribution **top-5 56.2%** of the time;
counting cold-start new-actor events as misses, the all-test figure is **top-1 18.4% / top-5 40.8%**.
Doctrine generalizes best temporally (rankable top-5 74.8%). This retrodictive-vs-prospective gap is
stated plainly rather than papered over.

**On the numbers moving.** Every accuracy figure here is *lower* than earlier AUSPEX reports
(attribution 64.9→50.8, doctrine 68.5→62.8, joint 47.9→38.0). That is the **100% audit census
working as intended**: it removed fabricated and over-attributed events the engines had partly
memorized, so these are de-circularized, honest numbers on a harder, cleaner corpus. Full
diagnostics — actor-depth stratification, corpus-growth composition, prose de-leak, calibration —
live in [`docs/`](docs/) and on the site's research pages. The numeric ledger for the who×why
analyses is [`analysis/FINDINGS.md`](analysis/FINDINGS.md).

## Reproducing everything

Requires Python ≥ 3.11 + PyYAML (harness/analyses) and Node/pnpm (site/engine). From the repo root:

```sh
make verify                    # schema conformance + consistency + engine validator (must be clean)
make findings                  # regenerate the who×why numeric ledger (analysis/FINDINGS.md)
cd site && pnpm install
pnpm exec tsx tools/extract-mitre-ttps.ts   # REQUIRED once per clone: builds .cache/mitre-*.json,
                                            # else actor TTP/malware features are silently empty
pnpm validate                  # validate the atlas
pnpm dev                       # local dev at http://localhost:4321
pnpm eval-doctrine             # doctrine LOO ·  eval-pillar · eval-temporal · etc.
pnpm exec tsx tools/eval-stacked-cnb.ts     # deployed attribution headline (CNB + stacked, 5-fold)
pnpm exec tsx tools/gen-sources-bib.ts      # regenerate the source bibliography (SOURCES.md)
```

The atlas is the source of truth; `make verify` must be clean before any commit (a pre-commit hook
enforces it).

## Citation and license

**Cite this dataset** via [CITATION.cff](CITATION.cff) (GitHub renders a "Cite this repository"
button) or the archival DOI once minted. Rights and layered upstream attribution are in
[DATA-RIGHTS.md](DATA-RIGHTS.md); please also cite **MISP galaxy** (actor identities) and
**MITRE ATT&CK** (technique taxonomy) where relevant, and note that each factual claim carries its
own source in the record.

Dataset and documentation: **[CC BY 4.0](LICENSE)** — reuse freely, including commercially, with
attribution.

## Scope

An analytic atlas of publicly reported events. It contains no exploit code and no operational
tradecraft beyond what the cited public sources disclose; named individuals trace to public
indictments, OFAC designations, or court records. Unaffiliated with any government or vendor named
in the atlas.

---

© 2026 Kara Zajac / Black Flag Intelligence — released under CC BY 4.0.
