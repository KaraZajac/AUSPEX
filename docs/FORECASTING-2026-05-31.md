# Forecasting — predicting attacks before they happen

**Date:** 2026-05-31 · **Status:** engine + validation complete; `/forecast` UI is the
next scoped build. Tools: `tools/eval-forecast.ts` (validation), `tools/forecast-demo.ts`
(full output). This is a *new* capability, distinct from the retrodictive attribution engine.

## The question

Given a **prospective target** — a sector, a country, an organization — predict **(a) who
is likely to attack it** and **(b) the strategic doctrine they would be advancing**, with a
**relative‑risk** indication and **historical evidence**. No vendor publishes the *why*;
the who×why join is what makes this AUSPEX's, and it is only possible now that the corpus
is doctrine‑complete (84% of operations carry a doctrine link).

## The reframe — forecasting ≠ attribution

The attribution engine is *retrodictive*: given an observed operation's features (TTPs,
malware, vectors, prose), name the actor. Forecasting has none of that — the operation
hasn't happened. The only features available **before** an attack are the target's standing
attributes and the geopolitical context:

- **forecast‑available:** target sector(s), country, named org; attacker↔victim state dyad;
  recency / activity trend.
- **NOT available (post‑hoc, excluded):** initial vector, MITRE TTPs, malware, summary
  prose, named operators, campaign id.

So forecasting reuses `extractFeatures` **restricted to the target‑side families** plus
context — not a new feature pipeline, a constrained one.

## What is honestly predictable

1. **"By whom" — actor ranking.** `P(actor | target‑profile, context)` is learnable: each
   corpus event is a `(target‑profile, actor, date)` tuple; invert the relation.
2. **"Likelihood" — relative, not absolute.** The corpus logs **only attacks** — no negative
   examples, no target population. Absolute `P(attack)` is therefore **not identifiable**.
   The honest deliverable is a **relative‑risk score** (this profile's attack frequency vs
   the corpus distribution) anchored to **comparable historical events**. Calling it a
   calibrated probability would be indefensible; an exposure model for absolute probability
   is deferred future work.

## The model

For a candidate actor, score = recency‑weighted log‑prior + target‑feature log‑likelihood +
state‑dyad term:

```
score(actor | target) =  log P_recency(actor)                       # base activity, 2-yr half-life
                       +  Σ_f∈target  log P_recencyW(f | actor)      # recency-weighted victimology
                       +  β · Σ_c∈target.countries log P(c | actor.state)   # state-level dyad
```

Two ingredients carry the gain over a naive baseline:

- **Recency‑weighted targeting** — recent victimology predicts future victimology. (A v1 with
  *flat* feature counts merely tied the affinity baseline; weighting by event age is what
  separates a forecaster from a static lookup.)
- **State‑level dyad** — a thin or brand‑new actor inherits its **state's** history against
  the target's country (the real dyadic‑tension signal: Ukraine↔RU, Taiwan↔CN, Israel↔IR).
  This is also what gives the cold‑start tail any traction.

**Markers are deliberately excluded.** AUSPEX timeline markers are *state capability/doctrine*
events (cyber‑command stand‑ups, strategy publications), not attacker↔victim tension events —
a target‑side marker would boost the victim's *own* state. The dyad is the correct,
forecast‑valid tension signal; markers belong to the WHY engine.

## Validation — temporal forward‑validation (the only honest test)

Forecasting must be validated **prospectively**, never by leave‑one‑out (LOO leaks the
future). Train ≤ 2023‑12‑31, test on 2024+; for each test event, forecast from its target
profile and check whether the true actor lands in top‑k. Must beat two baselines or it's
noise: **popularity** ("always guess the most active actors") and **affinity** ("guess
whoever hits this profile most").

Train 397 ops · test 190 · **rankable 140** (true actor existed pre‑split) · 132 candidate
actors · random top‑5 ≈ 3.8%.

**Rankable subset (n=140) — each lever adds real signal:**

| ranker | top‑1 | top‑3 | top‑5 | top‑10 |
|---|---|---|---|---|
| Popularity (usual suspects) | 5.7% | 10.0% | 15.0% | 23.6% |
| Affinity (who hits this profile) | 15.0% | 22.1% | 28.6% | 39.3% |
| Model v1 (+ probabilistic prior) | 12.9% | 24.3% | 32.9% | 42.9% |
| **Model v2 (+ recency + dyad)** | **16.4%** | **30.7%** | **39.3%** | 44.3% |

**Result: v2 top‑5 = 39.3%, ~2.6× the usual‑suspects base rate (15.0%) and +10.7pp over
flat affinity.** Top‑1 16.4% vs popularity 5.7% (~2.9×). On ALL test events (cold‑start =
miss) v2 is top‑5 28.9% — the gap is the ~26% of test events on actors that didn't exist
pre‑split (the new‑thin‑actor tail again). Given only a target's sector/country/org + the
dyad, the true attacker is in the **top‑5 ~40% of the time out of 132 candidates** — a
genuinely useful forecaster.

## The who×why layer (the differentiator)

For each predicted actor, the **doctrine rationale** is the actor's dominant doctrine link
among its events relevant to the query target (recency‑weighted), surfaced via the
doctrine‑complete corpus. Full forecasts are theater‑correct:

| target | top actors → doctrine | risk |
|---|---|---|
| Taiwanese government | Evasive Panda, Mustang Panda, **Flax Typhoon** → `cn/taiwan-reunification/taiwan-island-collection` | HIGH (87th) |
| US grid / ICS | CyberAv3ngers, Charming Kitten → `ir/…/civilian-cii-coercion`; Sandworm | CRITICAL (91st) |
| Israeli defense | APT42, Handala, CyberAv3ngers → `ir/resistance-axis/anti-israel-coercion` | CRITICAL (93rd) |
| Ukrainian energy | Sandworm, Gamaredon, APT28 → `ru/russkiy-mir/ukraine-theater` | HIGH (81st) |
| Indian government | Transparent Tribe, SideCopy → `pk/asymmetric-posture-india/military-collection` | HIGH (85th) |
| German bank | Lazarus, TraderTraitor (DPRK revenue); criminal crews → **"no doctrine on record"** | MODERATE (70th) |

Relative risk = corpus‑frequency percentile of the profile's recency‑weighted match count,
banded LOW/MODERATE/HIGH/CRITICAL, plus the matching historical events as evidence. Criminal
actors honestly carry no doctrine; thin profiles honestly show "0 comparable."

## Honest limitations

- **No negatives / no exposure model** → relative risk only, not absolute probability.
- **Reporting bias** — trained on *disclosed* attacks; predicts disclosure patterns, not
  true rates.
- **Cold‑start** — a never‑before‑seen actor or an unattacked sector/country has no basis;
  the system should return "insufficient basis," not a confident guess.
- **Base‑rate dominance** — the popularity baseline is the guardrail proving the model adds
  target‑specific signal beyond naming the usual suspects.

## Future work

1. `/forecast` page — isomorphic, sibling to `/predict` (input a target profile → ranked
   actors + doctrine rationale + risk + historical anchors).
2. Exposure model (target population / negative sampling) for *absolute* probability.
3. Active‑context beyond the dyad if a curated marker→threat mapping is built.

## Reproduce

```sh
pnpm exec tsx tools/eval-forecast.ts     # temporal forward-validation vs baselines
pnpm exec tsx tools/forecast-demo.ts     # full who x why output on example targets
```
