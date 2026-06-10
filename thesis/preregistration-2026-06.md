# Pre-registered confirmatory predictions — DRAFT until signed & frozen

**Status: DRAFT.** This becomes a pre-registration when the candidate (1) edits/approves the
predictions, (2) tags the corpus freeze (`v1.0-dissertation`), and (3) commits this file in the
same commit as the tag. From that moment the predictions are locked: the git history is the
timestamp. **Do not revise predictions after the freeze — failed predictions get *reported*,
not repaired.**

## Why

Every AUSPEX finding to date is exploratory: discovered and tested on the same 818-event corpus
(snapshot 2026-06-09). This document converts the key claims into falsifiable predictions about
**data that does not exist yet**, transforming the dissertation's epistemics from "patterns I
found" to "predictions that held (or failed, and here is what that means)."

## The confirmatory cohort

- **Definition:** all operational events **added to the atlas after the `v1.0-dissertation`
  tag** through 2027-06-30 (or the dissertation data-freeze date, whichever is earlier), tagged
  and QC'd under the same editorial rules (perspective field, attested-requires-source,
  doctrine kinds), with intake **blind to these predictions** in the sense that events are
  selected for atlas-worthiness, never for prediction-compliance.
- **Minimum cohort gates** (a prediction is only evaluated if its gate is met; otherwise it is
  reported as "insufficient confirmatory data," not as pass or fail):
  - corpus-level predictions: ≥75 operational events in the cohort;
  - per-state predictions: ≥10 operational events for that state in the cohort.

## Predictions (P1–P6)

Current exploratory values in brackets; thresholds set deliberately below them to allow
sampling noise while remaining falsifiable.

| # | claim | prediction on the confirmatory cohort | current |
|---|---|---|---|
| P1 | Doctrinal legibility | ≥65% of cohort operations will receive ≥1 attacker-rationale doctrine link under unchanged tagging rules | 81% |
| P2 | Precedence (formal) | ≥60% of (op, dated statute/strategy/treaty doctrine) pairs will postdate the document's publication | 71–76% |
| P3 | Doctrine→actor information | null-corrected MI(actor; doctrine) on the pooled corpus+cohort will remain ≥1.0 bits, and the cohort-only point estimate will exceed its own permutation null | 1.76 bits |
| P4 | KP financial fingerprint | financial-theft/extortion terminal outcome share of KP cohort ops ≥30%, and KP will remain the only state >25% | 44% |
| P5 | Doctrine pivot persistence | the post-pivot dominant doctrine identified for cn (nat-intel-law-2017) and ir (cyber-deniable-retaliation) will remain that state's most-linked doctrine in the cohort | — |
| P6 | Engine cold-start | the frozen v1.0 engine (no retraining), scored on cohort ops whose true actor existed pre-freeze, will achieve top-5 ≥ 55% (null=miss within the rankable definition stated here: actor existed pre-freeze) | LOO top-5 75.1; temporal analog ~56 |

## Analysis plan (locked with the predictions)

- P1–P5: the existing `analysis/` scripts run with a `--cohort-after <tag-date>` filter (to be
  added before freeze; the filter is mechanical, not analytic).
- P6: `eval-cnb-temporal`-style scoring with trainEnd = freeze date, the deployed CNB+stack
  config, no hyperparameter changes post-freeze.
- All permutation nulls K=40, seed 0, as in the exploratory analyses.
- Report ALL six outcomes in the dissertation regardless of result, alongside the exploratory
  values, with failures interpreted (sampling noise vs. drift vs. claim wrong).

## Threats to validity (acknowledged at registration time)

The cohort is not a random sample of cyber operations (collection/disclosure bias continues);
the same analyst tags both corpora (mitigated by the inter-rater study, not eliminated);
geopolitical regime shifts may genuinely change doctrine-op coupling (a P-failure may be a
finding about the world, not the method — this is why failures are interpreted, not hidden).

---
*Candidate sign-off (edit predictions freely above this line until the freeze):*

- [ ] Predictions reviewed and approved by the candidate
- [ ] `v1.0-dissertation` tag created on commit ____
- [ ] Frozen on date ____
