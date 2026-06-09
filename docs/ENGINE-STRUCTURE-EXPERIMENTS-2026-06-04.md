# Engine structure experiments — does modelling the nation-state hierarchy help?

**2026-06-04.** Engineering record (methodology, not dissertation prose; the strategic who×why
findings live in `analysis/FINDINGS.md`). All four experiments are **eval-only** — none touches a
deployed path. Question: the atlas hierarchy makes the **nation-state** a latent backbone
(`actor_id` / `primary_service_id` prefixes, `doctrine.nation_state_id`, the attack dyad). Does
making that structure *explicit* beat what the ComplementNB + stacked re-ranker already captures
*implicitly*?

## TL;DR

| # | experiment | tool | result | verdict |
|---|---|---|---|---|
| E1 | logistic re-ranker on the **joint** | `eval-joint-stacked.ts` | +1.1pp top-1, **CI [+0.0,+2.4] spans 0** | inconclusive — don't promote |
| E2 | state-structure **headroom probe** | `eval-state-structure.ts` | +5.6pp *oracle* ceiling; 55% of misses are within-state | modest for attribution |
| E3 | dedicated **state classifier** + soft prior | `eval-state-classifier.ts` | 83.5% standalone; prior **hurts** attribution | good standalone; bad prior |
| E4 | **criminal↔state gate** | `eval-criminal-gate.ts` | state top-1 **83.5→90.4% (+6.9pp)** | **WIN — build it** |

**Headline:** for **attribution**, the engine is near its *structural ceiling* — explicit
state-structure is redundant (the prose features already cluster by state via the Empirical-Bayes
service-prior). The one real defect was the **criminal↔state seam**, and it's a fixable
class-design artifact: a two-stage binary gate recovers it (+6.9pp state accuracy at 98%
criminal precision). Accuracy remains **data-bound, not architecture-bound.**

## What the engine already does (the baseline being tested against)

`attribution.ts` blends each actor profile toward its **service-level** aggregate with adaptive
Empirical-Bayes shrinkage (`λ_eff = λ·k/(k+events)`, `λ=0.2`, `k=5`): rare actors shrink heavily
toward their service/state shape. The joint adds a soft `stateConsist` feature (+0.09 weight in
E1). So a *soft* "only certain states have certain actors" is already in place — these experiments
test whether an *explicit/harder* version adds more.

## E1 — Logistic re-ranker on the joint (`eval-joint-stacked.ts`, commit 5c5c33e)

The deployed joint is a hand-weighted product `2.0·actorLog + doctrineLog + log(1+cooc)` (top-1
46.7%). A stacker re-ranks the same LOO candidate pairs (stratified 5-fold CV, null=miss).
- Anchor reproduces the headline exactly (46.7 / 59.3 / 65.1 / MRR .545).
- **v1 (raw scores):** −12.8pp; learned weights showed `actorLog≈0, doctrineLog≈0, logCooc=0.32` —
  pooled binary logistic latched onto globally-separating co-occurrence because raw NB log-scores
  aren't comparable across events (a learning-to-rank failure mode).
- **v2 (per-event z-normalized + jointScore backbone + precedence):** +1.1pp top-1 / +1.7pp top-3,
  but bootstrap **95% CI [+0.0, +2.4] spans zero** (per-fold 48.0 ± 5.1). Added features
  (precedence, doctrine-score, interaction) all ≈0.
- **Verdict:** product already near-optimal; no new signal to add. Don't promote.

```sh
cd site && pnpm exec tsx tools/eval-joint-stacked.ts
```

## E2 — State-structure headroom probe (`eval-state-structure.ts`, commit d6e3a89)

CNB actor ranker under LOO; bucket errors by state.
- actor top-1 55.8% · **STATE top-1 80.2%** · state-in-top-3 94.7% (state ≪ actor in difficulty).
- Of 276 misses: **55% right-state/wrong-sibling** (a state model can't fix), **45% cross-state**.
- **Oracle ceiling** (constrain to true state): 61.4% = **+5.6pp**, but only **35/124** wrong-state
  misses recovered (true actor usually isn't the top same-state candidate either).
- Confusions interpretable: cn→ru 12, ir→ru 9, cn→vn 7, criminal→kp/cn 6 each.
- **Verdict:** modest attribution headroom; the bulk of error is within-state sibling confusion
  (the stacker's job, not a state model's).

```sh
cd site && pnpm exec tsx tools/eval-state-structure.ts
```

## E3 — Dedicated state classifier + soft prior (`eval-state-classifier.ts`, commit fb07465)

A CNB whose *class* is the attacker state.
- **Part A:** 83.5% top-1 / 88.2% top-3 — beats actor-collapse (80.3%) and the actor-count-biased
  naive prob-sum (58.9%). Per-state recall ~90%+ on real states (cn 95, kp 94, ir 91, ru 87, in/pk/
  tr/il 100) — but **criminal ≈0–5%** (absorbed into ru/cn/kp).
- **Part B (the payoff test):** as a soft prior on attribution
  (`actorLog + β·logP(state)`), it **hurts** — β=0 55.7% → β=1 52.6% → β≥2 ~51%. Oracle 60.3% is
  unreachable: the actor CNB already encodes the state, so the prior is redundant and imports the
  classifier's (esp. criminal) errors.
- **Verdict:** strong *standalone* backbone; redundant-and-harmful as an attribution prior.

```sh
cd site && pnpm exec tsx tools/eval-state-classifier.ts
```

## E4 — Criminal↔state gate (`eval-criminal-gate.ts`, commit 654af3f) — the WIN

A binary CNB (criminal vs state) decides criminal-or-not first; else fall through to the
multiclass state CNB.
- Multiclass-only baseline: criminal recall **0/63**, state top-1 83.5%.
- Binary detector PR curve (rare 10% class): θ=−3 → 83% recall / 70% prec; **θ=0 → 73% / 94%**;
  θ=1 → 71% / 100%.
- **Combined state top-1: 83.5% → 90.4% (+6.9pp)** at θ=0.5 (recall 73%, prec 98%, only 1 correct
  nation-state prediction clobbered).
- **Verdict:** the criminal failure was a class-design artifact (criminal drowned out competing
  against coherent state classes), not genuine inseparability. ComplementNB's imbalance handling +
  a focused boundary recover the criminal-specific signal. **A two-stage gate is worth building.**

```sh
cd site && pnpm exec tsx tools/eval-criminal-gate.ts
```

## Synthesis

1. **Attribution is at its structural ceiling.** Three experiments (E1–E3) to add explicit
   state-structure to attribution landed null/marginal/harmful, because the NB + stacker already
   captures the state implicitly (shared prose + the service-prior). The remaining error is
   within-state sibling confusion (E2: 55%) — what the stacker already targets with discriminative
   features (malware lineage, operator overlap), not something a state prior fixes.
2. **The state itself is highly predictable and a useful standalone** (E3: 83.5%, ~90%+ on real
   states) — a backbone for a "state op vs criminal?" product signal, the joint/doctrine
   state-gates, and OOD detection.
3. **The criminal↔state seam was the one real defect, and it's fixable** (E4): +6.9pp state
   accuracy via a two-stage binary gate.

## Deployable recommendations

- **Deploy** the criminal↔state gate (E4) — clear, well-behaved win for state classification.
  (Re-run with a bootstrap CI on the +6.9pp before promoting, per the eval-first discipline.)
  **CI DELIVERED 2026-06-09** on the corrected corpus (post perspective-fix + leak-scrubs +
  canonical state derivation): θ=0.5 → criminal recall 75% @ 100% precision, state top-1
  82.8→90.3% — lift **+7.5pp, paired bootstrap 95% CI [+5.4, +9.6], excludes 0 →
  promotion-ready** (`eval-criminal-gate.ts` now computes the CI on every run).
- **Keep** the dedicated state classifier as the backbone for any future joint cross-state gate or
  doctrine state-gating; **don't** use it as an attribution prior (E3 Part B).
- **Don't promote** the joint pair-stacker (E1) — inconclusive.
- **For attribution accuracy, invest in corpus depth, not architecture** — the structural ceiling
  is reached; the data is the bound.

## Caveats

- Eval-only, LOO on the CNB base (the deployed headline adds the 5-fold stacker on top). Single
  runs except E1 (which has a bootstrap CI); E4's +6.9pp wants a CI before deploy.
- Cross-state "errors" (E2) include **legitimate** cross-state ops (counter-ops, false-flags,
  Stuxnet) — so the addressable share is an upper bound, and any state gate must stay **soft**, not
  a hard mask.
- The multiclass criminal recall reads 0/63 (strict `top-1 == criminal`) vs ~5% under the looser
  dual-state labelling in E3's per-state table; both mean "near-total failure."
