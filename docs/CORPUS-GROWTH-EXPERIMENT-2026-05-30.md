# Corpus-growth experiment — does more data raise attribution accuracy?

**Date:** 2026-05-30 · **Status:** PROVISIONAL theory-test (editorial QC deferred) ·
**Headline unchanged:** the published 74.5% stands as the QC'd-corpus number (see below).

## Question

The learning-curve diagnostic showed attribution is data-starved on a long tail of
singleton actors. The hypothesis under test: **growing the corpus raises attribution
top-1.** We tested it directly by bulk-importing a backlog of verified-sourced but
not-yet-QC'd candidates and re-baselining the deployed engine.

## What was imported

127 candidate events from two agent-collected, URL-verified queues
(`research/corpus-backfill-candidates-2026-05-30.json`, 55 · `…/attribution-…json`, 72)
via `tools/import-staging.ts` (deterministic, no-LLM). The atlas grew:

| | before | after |
|---|---|---|
| Events | 658 | 785 (+127) |
| Actors | 159 | 210 (+51 new) |
| Services | 74 | 86 (+12 placeholder `<state>/unscoped`) |
| Sources | 1112 | 1239 (+127) |
| Nation-states | 15 | 17 (+ps, +sa provisional stubs) |

Validates clean (`pnpm validate`), astro check 0/0. Actor resolution matched **71**
candidates to existing actors (name/alias resolution against canonical_name + aliases —
caught e.g. Gamaredon, already in-corpus, and corrected one mis-keyed
`actor_id_existing` that pointed an APT15 BADBAZAAR/MOONSHINE event at Mustang Panda),
created **51** new actors (6 criminal `criminal/<slug>`, 45 state under placeholder
`<state>/unscoped` services).

### What "verified" means here (and what it does not)

- **Verified:** source URLs curl-resolve (118/122 → 200; the 4 non-200 are
  bot-blocks/redirects on real publishers — Sophos GOLD-* profiles, the
  Secureworks→Sophos Moses-Staff redirect, HIPAA Journal 403 — kept with a note, no
  dead/fabricated links); YAML schema + every foreign key validates; no within-batch or
  vs-atlas slug collisions; incident_type ∈ controlled enum.
- **NOT verified (deferred QC):** that each source *supports its claim* (claims were not
  re-read); doctrine tags (`doctrine_links: []`, suggested fit carried as a comment);
  new-actor service placement (all under a placeholder `<state>/unscoped` — real
  FSB/GRU/MSS/RGB placement is QC); possible un-merged duplicates among new actors
  (Evasive Panda, FishMonger, Agrius, …). `auspex_assessment: concur-with-caveat` on
  every imported attribution; every file carries a `PROVISIONAL` header comment.

## Result — deployed engine (ComplementNB + stacked re-ranker, stratified 5-fold CV)

| corpus | events | CNB+stack top-1 | n scored |
|---|---|---|---|
| PRE | 658 | **74.5%** | 470 |
| POST | 785 | **61.7%** | 595 |

PRE reproduces the published README headline (74.5%) to the decimal — the comparison is
sound. Naive reading: +127 events **lowered** top-1 by 12.8pp.

## Decomposition — the drop is composition, not degradation

Same deployed engine, per-event hits dumped for both corpora
(`tools/dump-cnb-perevent.ts`), joined by event id:

| subset | n | top-1 | reading |
|---|---|---|---|
| **(A) the *same* 470 original events**, scored in each corpus | 470 | **74.5% → 74.5%** | label-space expansion (51 new candidate actors) caused **net-zero** change: 7 hit→miss, 7 miss→hit. **No dilution.** |
| (B) 70 fills — added events on **existing** actors | 70 | **24.3%** | feature-poor, mostly sub-threshold thin-actor events |
| (C) 55 new-only — added events on **new** actors | 55 | **0.0%** | unrankable under CV (the actor's label is absent/rare in the training folds) — every one a miss |

Arithmetic closes exactly: (0.745·470 + 0.243·70 + 0·55) / 595 = (350 + 17 + 0)/595 =
**61.7%**. The entire drop is denominator composition under the standing **null = miss**
convention plus **CV-unrankability** of thin/new classes and the **feature-poverty** of
un-QC'd events. The engine did **not** degrade on what it already knew.

## Interpretation

1. **The naive "more data → more accuracy" hypothesis is refuted in this form.** Raw
   event count is the wrong lever for top-1; adding *breadth* (new thin actors) and
   feature-sparse events mechanically lowers the headline.
2. **The engine is robust to label-space expansion.** Going from 159 → 210 candidate
   actors moved the original events by a net of zero — confidence that the 74.5% is not
   a small-label-space artifact.
3. **What *will* move attribution accuracy** is not count but (a) **depth per actor**
   above the CV-rankability threshold (enough events per actor, spread across folds),
   and (b) **feature richness** — campaign_id, indictment operators, malware families,
   target orgs, doctrine tags. The 70 fills scored 24.3% precisely because they are
   un-QC'd shells (empty doctrine_links, no campaign/operator/malware tags). They are a
   *scaffold for QC*, not finished training data. Re-running this experiment after QC
   enrichment is the real test.
4. **Doctrine/pillar are unchanged by construction:** imported events carry
   `doctrine_links: []`, so they enter neither doctrine training nor the doctrine eval.
   The **joint** engine's actor side drops in step with attribution.

## Provenance / reproduce

```sh
pnpm exec tsx tools/import-staging.ts          # dry-run (resolution report)
pnpm exec tsx tools/import-staging.ts --dump    # + actor-resolution audit
pnpm exec tsx tools/import-staging.ts --write    # write 319 files into atlas/
pnpm validate                                    # clean
pnpm exec tsx tools/eval-stacked-cnb.ts          # deployed engine on current corpus
pnpm exec tsx tools/dump-cnb-perevent.ts /tmp/cnb-post.json   # per-event hits
# (move the 319 untracked files aside, repeat for PRE/658, restore) -> /tmp/cnb-pre.json
```

The 74.5% remains the published headline (QC'd-corpus number, preserved exactly on the
original events). 61.7% is the provisional-import number, pending editorial QC of the
127 events. No published number was overwritten.
