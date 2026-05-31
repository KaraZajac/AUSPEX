# AUSPEX — research scaffold & verification index

**What this is:** a personal planning aid for a future DSc dissertation — a structural
skeleton plus an index that maps each empirical claim to the exact command that reproduces
it, so the candidate can **independently re-run and verify every number** before writing.

**What this is NOT:** dissertation prose. The dissertation must be authored, and all data
independently verified, by the candidate. Nothing here is to be lifted as written text;
the framing below is a starting point to adopt, adapt, or reject. Treat every number as
*to-be-verified by you* — re-run the command, read the source, confirm it.

Timeline context: ~months from application, ~1 year from writing/defense. This is
forward-planning scaffolding, not a draft.

---

## Suggested framing (adopt / adapt / reject — your call)

**Possible angle.** Doctrine as a labelable, model-able, predictive layer over operational
cyber data — complementary to attribution — and the *who × why* join for interpretable
attribution + forecasting. Bridges strategic-studies "doctrine" with technical CTI/ML.

**Candidate research questions.**
- RQ1 — Can the doctrine an operation advances be labeled reliably, *independent* of who did it?
- RQ2 — Does doctrine carry signal beyond attribution; can the actor × doctrine pair be jointly predicted?
- RQ3 — How should attribution ML be evaluated/improved under extreme class imbalance + a long tail; does more data help?
- RQ4 — Can the who × why join forecast prospective targeting, and how must it be honestly bounded?

**Candidate contributions.** (1) doctrine-tagged corpus + reproducible curation methodology;
(2) the who × why framing + joint model; (3) honest long-tail attribution methodology incl.
the corpus-growth three-lever result; (4) the first doctrine-aware forecaster.

**Abstract / chapters — write yourself.** Don't reuse generated prose. When you draft each
section, pull the numbers from the verification index below and re-confirm each one.

---

## Chapter skeleton (headings + what each argues + where the evidence lives)

1. **Introduction** — the gap (attribution = who, not why); thesis; RQs; contributions.
2. **Background / related work** — *you write this.* Three literatures to survey + connect:
   CTI/attribution (ATT&CK, diamond model, Rid & Buchanan, vendor TIR practice); strategic
   doctrine in IR (national cyber strategies, persistent engagement, info-confrontation);
   ML for imbalanced/few-shot + calibration + temporal eval (ComplementNB/Rennie 2003).
   *The literature survey is the main writing owed; do it yourself.*
3. **The corpus + doctrine-tagging methodology (RQ1)** — artifact + editorial discipline
   (source-anchoring, ICD-203, doctrine–attribution independence, stable slugs); the
   QC/promotion pipeline; limitations (single curator, machine-authored-under-review).
4. **Attribution under the long tail (RQ3)** — engine; NB-vs-trees defense; the prose-leak
   finding; honest eval conventions; the **corpus-growth three-lever experiment**.
5. **The who × why join (RQ2)** — doctrine/pillar/joint engines; complementarity; the
   coverage-vs-headline coupling.
6. **Doctrine-aware forecasting (RQ4)** — the reframe (no negatives → relative risk);
   model; forward-validation vs baselines; who × why output.
7. **Discussion** — interdisciplinary bridge; practice implications; limitations.
8. **Conclusion + future work.**

---

## Verification index — every claim → how to reproduce it yourself

Run from `site/` unless noted. Re-pull before citing; the corpus may grow.

### Corpus / dataset
| claim | verify with |
|---|---|
| 815 events · 204 actors · 88 services · 1,269 sources · 86 doctrines / 199 pillars / 15 doctrine-states | `pnpm validate` (prints counts; must be clean) |
| Doctrine coverage 84% of ops; actor depth distribution; events-per-state | `pnpm exec tsx tools/corpus-health.ts` |
| Actor-wiring decisions (31 placed / 6 merged / 9 unscoped / 5 criminal) + sources | read `research/actor-wiring-decisions-2026-05-30.json` |
| Claim-QC verdicts (42 supported / 11 weak / 3 unsupported) + per-event notes | read `research/qc2-verdicts-2026-05-30.json` |

### Attribution (RQ3)
| claim | verify with |
|---|---|
| **Deployed headline 65.1% top-1 / 73.8% top-3 / 0.698 MRR** (CNB + stacked, 5-fold CV) | `pnpm exec tsx tools/eval-stacked-cnb.ts` |
| Stratified by depth (87.5% @ k≥10 … 4.3% singleton) | `pnpm exec tsx tools/dump-cnb-perevent.ts /tmp/cnb-final.json && pnpm exec tsx tools/corpus-health.ts` |
| Raw-NB baseline 48.8% + Monte-Carlo stability | `pnpm eval-attribution` |
| ComplementNB 68% vs GBT 31% (McNemar p<0.001); prose-leak ablation (71.7→61.9→52.3) | sklearn scripts per `docs/MODELING-DIAGNOSTICS-2026-05-30.md` (venv `/tmp/auspex-ml`; **/tmp is ephemeral — recreate the scripts/venv to re-run**) |
| Corpus-growth: 74.5→61.7→63.9→65.1; three levers (depth 0→61.9%, enrich +11.4pp, discriminability); composition-not-regression | `docs/CORPUS-GROWTH-EXPERIMENT-2026-05-30.md` (reproduce steps inside; uses import/enrich/depth tools + `dump-cnb-perevent.ts`, with a pre/pruned-corpus pass) |

### Who × why join (RQ2)
| claim | verify with |
|---|---|
| Doctrine 69.2% top-1 / 87.0% top-3 / 0.697 mAP | `pnpm eval-doctrine` |
| Pillar 61.4% / 80.9% / 0.678 | `pnpm eval-pillar` |
| Joint (actor × doctrine) 46.7% / 59.3% / 0.545 MRR | `pnpm exec tsx tools/eval-joint-cnb.ts` |
| All-events column (doctrine 68.1, pillar 60.0, joint 41.7, attr 49.1) | `pnpm exec tsx tools/eval-all-events.ts` |
| Pre-tagging figures (72.9 / 63.8 / 53.9) — the coupling effect | git history before commit `9619731`; re-run the above on that checkout |

### Calibration / temporal
| claim | verify with |
|---|---|
| Temperatures T = 2.0 / 3.0 / 3.0 (refit on 815; robust) | `src/utils/calibration-constants.ts`; refit: `pnpm exec tsx -e 'import {fitAllCalibrations} from "./src/utils/calibration.ts"; console.log(JSON.stringify(fitAllCalibrations()))'` |
| Temporal holdout: raw-NB 36.1% (train ≤2023-12-31, score 2024+) | `pnpm eval-temporal` |

### Forecasting (RQ4)
| claim | verify with |
|---|---|
| **Forward-validation: popularity 15.0 → affinity 28.6 → v1 32.9 → v2 39.3% top-5** (rankable, 2.6× base rate; top-1 16.4 vs 5.7) | `pnpm exec tsx tools/eval-forecast.ts` |
| Full who × why output (theater-correct examples) | `pnpm exec tsx tools/forecast-demo.ts` |
| Methodology + honest bounds (no negatives → relative risk) | `docs/FORECASTING-2026-05-31.md` |

---

## Open verification / rigor tasks (your work to do)

- **Independently re-verify** every number above + spot-read the underlying sources — do
  not take generated figures on trust.
- **Literature review** — survey + write yourself (citation hooks in the skeleton).
- **Add statistical rigor** the committee will expect: confidence intervals + McNemar on
  the corpus-growth and forecasting deltas; an ablation isolating doctrine's marginal
  contribution to attribution.
- **Inter-rater reliability** on doctrine tags (the corpus is currently single-curator,
  machine-authored-under-review) — recruit a second rater, report agreement.
- **Forecasting face-validity** — expert rating of a sample of forecasts to complement top-k.
- **Exposure model** — for *absolute* (not relative) forecasting risk, with negative sampling.
- Confirm program requirements: dissertation template, any IRB/ethics statement (likely
  N/A — public-source OSINT — but confirm), and AI-use disclosure policy.
