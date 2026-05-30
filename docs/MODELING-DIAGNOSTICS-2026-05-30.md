# Modeling diagnostics — 2026-05-30

Two questions, both run on the attribution head (operations-only, n=470, null=miss),
both seeded and reproducible. All tooling is open-source (TypeScript + scikit-learn BSD).

- **(1) Are we data-starved?** → Yes, for attribution. No, for doctrine.
- **(3) Does a gradient-boosted tree beat Naive Bayes?** → No — GBT loses badly here.
  But the benchmark surfaced a **separate, high-value lead**: a vanilla ComplementNB
  beats the production engine by ~11 pp on identical features.

Artifacts (regenerable; `.cache/*.json` is gitignored):
`tools/learning-curve.ts`, `tools/export-features.ts`, `tools/gbt_benchmark.py`,
`tools/dump-inventory.ts`.

---

## (1) Learning curve — is the corpus the bottleneck?

**Method.** Bernoulli-subsample the atlas to a fraction *f* of events (seeded LCG),
run the *exact* headline LOO at each fraction (λ=0.2 service prior, prose-DF
self-exclusion, inferred-campaign suppression, doctrine supersession-equivalence
folding), record top-1/top-3 over the labeled non-meta events. 4 seeds per fraction
(*f*=1.0 is deterministic). `tsx tools/learning-curve.ts`.

| corpus *f* | ~N (attr/doc) | attribution top-1 (±sd) / top-3 | doctrine top-1 (±sd) / top-3 |
|---|---|---|---|
| 0.30 | 138 / 141 | 41.5 (±3.7) / 54.8 | 53.4 (±3.1) / 72.6 |
| 0.50 | 235 / 240 | 48.6 (±1.2) / 63.5 | 64.4 (±4.1) / 82.3 |
| 0.70 | 331 / 338 | 51.6 (±0.7) / 69.8 | 70.6 (±0.5) / 86.3 |
| 0.85 | 397 / 405 | 54.8 (±1.4) / 72.4 | 73.0 (±0.7) / 88.1 |
| 1.00 | 470 / 480 | **57.4 / 74.9** | **73.8 / 89.6** |

*Harness validation:* the *f*=1.0 point reproduces the published headline exactly
(57.4 / 74.9 attribution, 73.8 / 89.6 doctrine).

**Tail slope (top-1 pp gained per +100 events, 0.85→1.0):**
- **Attribution: +3.56 pp/100 — still climbing, no plateau → data-starved.**
- **Doctrine: +0.99 pp/100 — effectively plateaued.**

**Read.** Corpus expansion is the right lever **for attribution** (and that is exactly
where the long tail lives — see below). Doctrine has largely saturated on volume; its
remaining gains will come from features / label quality, not more events. Linear
extrapolation is unsafe (the curve must bend eventually), but the marginal return on
attribution is clearly still positive at full corpus.

**Why attribution is starved — the long tail.** Of 131 attributed actors, **51 (39%)
have exactly one event**, so they are structurally unrankable under LOO (remove the one
event → no training signal); **44 events have only singleton actors** and are
near-automatic misses. The highest-leverage collection is therefore *backfilling thin
actors / states*, not adding more events for already data-rich actors.

---

## (3) GBT vs Naive Bayes

**Method.** `tools/export-features.ts` vectorizes the engine's `EventFeatures` into a
fixed multi-hot matrix (658 × 3871; hapaxes dropped; `inferredCampaign` excluded as it
is LOO-leaky; `campaign` columns tagged for ablation). `tools/gbt_benchmark.py` then
compares, on identical features and protocol:
- **GBT** — `HistGradientBoostingClassifier` (LightGBM-style histogram GBT, BSD).
- **NB** — `ComplementNB` (the natural baseline for sparse multi-hot).

Attribution, ops-only, n=470, null=miss. Training label space restricted to actors with
≥2 events (68 classes) — singletons are forced CV misses regardless, so this changes no
score; it just removes ~53 dead output classes that made multiclass GBT intractable
(GBT builds `classes × iterations` trees; 121 classes ran for *hours*). Features pruned
to those active in ≥3 events (applied to both models). 5-fold × 2 repeats, seeded.

| model | top-1 (±sd) | top-3 (±sd) |
|---|---|---|
| **NB (ComplementNB)** | **67.6 (±0.1)** | **78.7 (±0.2)** |
| GBT (HistGBT) | 31.2 (±0.5) | 47.3 (±1.8) |
| GBT − campaign_id | 31.2 (±0.5) | 47.3 (±1.8) |

McNemar (top-1): NB-only-right **180**, GBT-only-right **11**, χ²=147.8, **p<0.001**.

**Verdict on GBT: no.** GBT underperforms NB by **36 pp** — decisively, significantly.
With ~4–7 samples per class over 68 classes, trees cannot form actor-discriminative
splits; permutation importance shows GBT fell back on generic features (`inc:intrusion`,
`sec:government`, `vec:unknown`) rather than the operator/malware/campaign signals that
actually identify actors. **This is positive evidence for the NB-family choice** in
AUSPEX's small-n, high-class-count, sparse-feature regime — a question a committee will
ask, now answered with data.

### Unexpected lead: ComplementNB ≫ the production engine

The NB baseline scored far above the production engine, and it survives every confound
I checked:

| configuration | protocol | top-1 | top-3 |
|---|---|---|---|
| Production engine (NB + decay + service-prior + coverage + lineage) | LOO | 57.4 | 74.9 |
| ComplementNB, same features | 5-fold | 67.6 | 78.7 |
| ComplementNB, **− campaign_id** | 5-fold | 64.8 | — |
| **ComplementNB, matched LOO** | **LOO** | **68.9** | **80.0** |

Under the *matched* LOO protocol ComplementNB beats the engine by **+11.5 pp top-1 /
+5.1 pp top-3**, and it is **not** an artifact of the editorial `campaign_id` feature
(only ~2.8 pp; only 126/470 events even carry one). The engine's elaborate weighting
(temporal decay, Empirical-Bayes service prior λ=0.2, coverage bonuses, IDF) appears to
be *net-harmful* for top-1 relative to ComplementNB's complement-weighting on the same
signal.

**This is potentially free accuracy — independent of corpus growth.** It is the single
most actionable finding here.

**Caveats before adopting (do NOT switch the engine on this alone):**
- The benchmark uses a *pruned multi-hot* representation, not the engine's full weighted
  feature families; ComplementNB's edge must be reconfirmed with the full feature set
  inside the real engine harness.
- Prose-term features can name the actor in an event summary — a label-leak risk that
  inflates *both* the engine and ComplementNB equally (so it does not explain the *gap*,
  but it means both absolute numbers may be optimistic; worth a separate audit).
- Feature pruning was computed over all 470 rows (label-free; sub-percent).

**Recommended follow-up (matched, rigorous):** swap `ComplementNB` in as the scorer
inside the existing LOO harness over the full feature families with the engine's exact
hygiene, and compare head-to-head. If the +11 pp holds, it is a major, low-cost win and
a strong thesis result ("a calibrated off-the-shelf NB beats the bespoke engine —
simplicity as a feature"). If it collapses, document why (the weighting earns its keep).

---

## ComplementNB matched re-test + a prose-feature leak (follow-up)

Steps 1–2 of the ComplementNB lead, run under **LOO** on the **full** exported matrix
(3871 cols — same `EventFeatures` the engine uses, no df≥3 prune; n=470 ops-only;
labels = ≥2-event actors; null=miss). Tools: `complementnb_retest.py`,
`dump-actor-name-tokens.ts`, `prose_leak_check.py`.

| model | features | top-1 | top-3 |
|---|---|---|---|
| ComplementNB | full | **71.7** | 83.6 |
| ComplementNB | name-scrubbed | 61.9 | 77.2 |
| ComplementNB | prose-ablated | 52.3 | 68.1 |
| MultinomialNB | full | 54.3 | 69.6 |
| MultinomialNB | prose-ablated | 38.9 | 54.7 |
| *engine plain-NB (ref, TS LOO)* | — | 57.4 | 74.9 |
| *engine stacked (ref, TS)* | — | 69.6 | — |

**Finding A — ComplementNB beats the bespoke engine, and it's the complement trick.**
71.7 top-1 beats plain-NB (57.4, +14.3) and the stacked re-ranker (69.6, +2.1), with much
higher top-3 (83.6). MultinomialNB on identical features is only 54.3 → the win is
specifically Rennie's complement weighting, which is designed for severe class imbalance
(AUSPEX: 68 classes, long tail). Per-tier accuracy tracks actor frequency: singletons 4%,
2–4 events 59%, 5–9 85%, 10+ 89%.

**Finding B — the prose feature leaks actor identity (the bigger result).** The
summary-derived TF-IDF prose terms frequently contain the actor's own name:
**350/470 (74.5%) of events carry their own actor's name/alias as a prose feature** — a
property of the engine's feature extraction, not the model. Impact (ComplementNB):
full 71.7 → name-scrubbed 61.9 → prose-ablated 52.3, so **actor-name leak = 9.8 of the
19.4 pp** prose lift (~half; the rest is other prose terms — tradecraft/victim/operation,
a mix of legit signal and possible operation-name leak). This inflates **all** attribution
numbers, the production engine included (prose weight 0.4). The honest "attribute a
genuinely unknown event, no actor-naming summary" accuracy is materially lower than
headline: ~62% (names scrubbed) to ~52% (no prose) for ComplementNB; **quantifying the
engine's own prose-leak sensitivity (ablate prose in the TS harness) is a required
follow-up.**

## Bottom line

1. **Fix the prose actor-name leak first — it's a defensibility issue, not an optimization.**
   Scrub actor names/aliases from prose tokens in `extractProseTerms`, keep the legit
   tradecraft terms, then re-baseline every head (flag → measure → document per the audit
   mandate). Headline attribution will drop to honest numbers; better we find this than a
   committee does.
2. **Adopt/confirm ComplementNB on the de-leaked features.** Name-scrubbed ComplementNB
   (61.9) already beats engine-with-leak (57.4), so it very likely wins once both are
   de-leaked; it also roughly matches or beats the entire stacked pipeline with none of the
   machinery. Confirm head-to-head on de-leaked features, then adopt as base learner /
   simplify the stack, re-calibrate, re-check OOD.
3. **Collect data — for attribution.** Backfill thin actors / under-covered states (the
   `corpus-backfill-research` queue targets this). Doctrine won't benefit much from volume.
4. **Don't use GBT.** It loses by 36 pp; the long tail starves it. NB-family is correct.
