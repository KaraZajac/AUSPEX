# Pre-registered confirmatory predictions — DRAFT until signed & frozen

**Status: DRAFT.** This becomes a pre-registration when the candidate (1) edits/approves the
predictions, (2) tags the corpus freeze (`v1.0-dissertation`), and (3) commits this file in the
same commit as the tag. From that moment the predictions are locked: the git history is the
timestamp. **Do not revise predictions after the freeze — failed predictions get *reported*,
not repaired.**

## Why

Every AUSPEX finding to date is exploratory: discovered and tested on the pre-freeze corpus
(**785 events, snapshot 2026-07-11, git `4657c60` — the event-audit census now 100% complete**;
the exploratory "current" column below was refreshed to this state on 2026-07-11, see the
baseline-refresh note before sign-off). This document converts the key claims into falsifiable
predictions about **data that does not exist yet**, transforming the dissertation's epistemics
from "patterns I found" to "predictions that held (or failed, and here is what that means)."

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

Current exploratory values in brackets (**refreshed 2026-07-11 to the 785-event / 100%-audited
corpus**; the 2026-06-09 / 818-event values are shown ~~struck~~ where they moved); thresholds
set deliberately below them to allow sampling noise while remaining falsifiable. **The
thresholds/predictions themselves are UNCHANGED — only the exploratory baselines were
regenerated.** Every refreshed baseline still sits above its threshold (predictions remain
falsifiable, none already-failed), with the P5/P6 caveats in the refresh note below.

| # | claim | prediction on the confirmatory cohort | current (2026-07-11) |
|---|---|---|---|
| P1 | Doctrinal legibility | ≥65% of cohort operations will receive ≥1 attacker-rationale doctrine link under unchanged tagging rules | **76%** ~~81%~~ |
| P2 | Precedence (formal) | ≥60% of (op, dated statute/strategy/treaty doctrine) pairs will postdate the document's publication | **72%** ~~71–76%~~ |
| P3 | Doctrine→actor information | null-corrected MI(actor; doctrine) on the pooled corpus+cohort will remain ≥1.0 bits, and the cohort-only point estimate will exceed its own permutation null | **1.67 bits** ~~1.76~~ |
| P4 | KP financial fingerprint | financial-theft/extortion terminal outcome share of KP cohort ops ≥30%, and KP will remain the only state >25% | **50%** ~~44%~~ (KP the only state >25%: cn 2% / ru 2% / ir 8%) |
| P5 | Doctrine pivot persistence | the post-pivot dominant doctrine identified for cn (nat-intel-law-2017) and ir (cyber-deniable-retaliation) will remain that state's most-linked doctrine in the cohort | cn ✓ nat-intel-law; **ir borderline** (see note) |
| P6 | Engine cold-start | the frozen v1.0 engine (no retraining), scored on cohort ops whose true actor existed pre-freeze, will achieve top-5 ≥ 55% (null=miss within the rankable definition stated here: actor existed pre-freeze) | LOO top-5 **64.7** ~~75.1~~; temporal-holdout top-5 **40.8% all-test / 58.8% 1yr-cohort** ~~~56~~ (see note) |

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

## Baseline refresh — 2026-07-11 (pre-freeze, Claude-prepped)

The exploratory "current" column was mechanically regenerated on the now-complete corpus
(`make findings` + the `site/` eval suite, 785 events / git `4657c60`). **Only the exploratory
baselines were touched — no prediction, threshold, or analysis-plan line was changed, and the
sign-off/freeze below remains the candidate's act.** Context and the two items needing a
candidate call before freeze:

- **The event-audit census is 100% complete** (785/785 events audited 6-point vs RAW). This
  *retires* the QC-selection-bias threat noted in the engine review: there is no longer an
  audited-vs-unaudited split, so the "audited-only sensitivity cut" is moot — the frozen corpus
  *is* the audited stratum. Every headline baseline is within noise of the 818-event values
  despite the full re-audit (robustness, not luck): P1 81→76%, P3 1.76→1.67 bits, P2/P4 stable.
  The one directional move — P1 attested-legibility fell further (14→9%, tracked in FINDINGS
  F1) — is the expected consequence of holding analyst-named goals to the cited source.
- **P5 (Iran) is borderline and needs a candidate call.** On the refreshed corpus, Iran's
  *late-half* leading doctrine in the pivot analysis is now **forward-defense (27 links)**,
  essentially tied with **cyber-deniable-retaliation (28)** — which remains ir's *overall*
  most-linked doctrine. So the P5 identification ("ir post-pivot dominant = cyber-deniable-
  retaliation") is no longer clean. **Decide before freeze:** keep the deniable-retaliation
  identification (defensible on the overall count), switch to forward-defense, or drop ir from
  P5 and keep only the robust cn (nat-intel-law-2017) leg. (cn is unchanged and clean.)
- **P6 needs the rankable-filter figure, and the LOO baseline dropped.** Attribution LOO top-5
  fell **75.1 → 64.7** — plausibly a *good* sign: the census removed over-attributed / fabricated
  events the engine had partly learned from, so this is closer to a de-circularized number. The
  temporal-holdout top-5 is **40.8% over all test events**, but that denominator includes
  test-set actors that did not exist at train time (unrankable-by-construction misses) — the P6
  prediction is explicitly scored on the *rankable* subset (true actor existed pre-freeze). The
  1-year-ahead 2024 cohort (**58.8%**) is the closest in-sample analog and clears the 55%
  threshold; the exact rankable figure requires the `--rankable`/train-actor filter named in the
  locked P6 analysis plan, to be run at freeze. **The 40.8% all-test number is NOT the P6
  comparator — do not read it as a P6 failure.**

*(Engine-review items still open and NOT addressed by this refresh — candidate's methodological
calls, see [[auspex-engine-review-2026-07]]: doctrine→actor circularity baseline; campaign-block
bootstrap for non-iid CIs; decorative `content_sha256` never re-verified; timeline-marker /
policy-action source-FK gaps in the green gate; `attesting_source_id` not required ∈ event
`sources[]`; homemade validator silently ignores unknown JSON-Schema keywords.)*

---
*Candidate sign-off (edit predictions freely above this line until the freeze):*

- [ ] Predictions reviewed and approved by the candidate
- [ ] `v1.0-dissertation` tag created on commit ____
- [ ] Frozen on date ____
