# Phantom-source audit — fallout of the 2026-05-30 corpus-growth import

**Date:** 2026-06-27 · **Author:** claude-opus-4.8 (max), during the event-audit census ·
**Status:** finding + remediation worklist (for Kara's review)

## CORRECTION (2026-06-28) — the 2026-05-30 import is NOT the source of these phantoms

The original framing below blamed the 2026-05-30 corpus-growth import. **That
attribution is wrong** — verified three ways: (1) the remediated phantom events
(iran-soleimani, sidewinder-afghanistan, black-reward, zedcex, …) are **absent from
both candidate queues** (`research/*-backfill-candidates-2026-05-30.json`); (2) **0 of
590** unstamped events carry the importer's mandatory `PROVISIONAL` header, and none of
the phantoms had it (they read as hand-/LLM-authored, with specific bylines + comments);
(3) the importer's candidate queues still hold **real article URLs**, and the (now
hardened) importer dry-runs at **0 generic URLs**. So the 2026-05-30 import is a separate,
cleaner population that did validate as documented.

**Actual origin:** a broader population of hand-/LLM-authored events (2020–2026) that
recorded a source by *publisher + approximate topic* but stored only the publisher's
**landing/catalogue URL as a placeholder** ("exact URL needs verification — publisher
landing URL used", as several source records literally say). The article was then either
never filled in, mis-remembered, or nonexistent. The importer hardening below is therefore
**preventive only**, not a fix for the observed phantoms. The **detector and the
"badrabbit-model" remediation are origin-agnostic and remain correct** — they find and fix
phantoms regardless of how they got there.

## What happened (original 2026-06-27 analysis — see correction above)

The 2026-05-30 corpus-growth experiment (`docs/CORPUS-GROWTH-EXPERIMENT-2026-05-30.md`)
bulk-imported **127 events** via a deterministic, no-LLM importer
(`tools/import-staging.ts`) from two candidate queues. Its "verified" bar was explicitly
narrow: source **URLs curl-resolve to HTTP 200**, YAML+FK validate. It did **NOT** verify
that *a source supports its claim* (editorial QC deferred — that is what the census is).

The gap: a source URL pointing at a publisher's **homepage or catalogue**
(`/research/`, `securelist.com/`, `yahoo.com/`) returns 200, so it passed import — while
being a **phantom citation** to an article that never existed at that path. The event then
carries rich claims (actors, dates, tradecraft) that NO cited source actually backs.

## Confirmed during census batch 15 (commit 5c72ec0)

- **patchwork-badnews-continuation** — sole source `cisco-talos/2017-11_...` is a phantom
  (Talos never reported Patchwork; URL = blog homepage). Real coverage: Trend Micro
  2017-12-11 + Unit 42 2018-03-07. Stamped `partial`, re-source pending.
- **sidewinder-pakistan-air-force-early** — sole source `trend-micro/2018-01_...` is a
  dead stub (`/en_us/research/` catalogue). Re-sourced to Kaspersky 2018-03-07; now a
  near-duplicate of `2018-03/kaspersky-sidewinder-pakistan` → **retire/merge candidate**.
- (related, not phantom-URL but same import:) **ccleaner-supply-chain** single source
  named no actor → APT41 attribution nulled; **degraded, re-source pending**.

## HIGH-CONFIDENCE phantom worklist (unstamped, non-null generic/catalogue URL)

These 7 share the EXACT signature of the two confirmed phantoms. Note the South-Asia
clustering (SideWinder ×2, DoNot, Transparent Tribe) — the same actor family.

| event | phantom source | URL |
|---|---|---|
| 2020-03/iran-soleimani-retaliation | yahoo/2020_iran-soleimani-cyber-retaliation | https://www.yahoo.com/ |
| 2020-04/sidewinder-afghanistan-government | trend-micro/2020-04_sidewinder-afghanistan-government | …/en_us/research/ |
| 2022-10/black-reward-aeoi-leak | socradar/2022-10_black-reward-aeoi | https://socradar.io/ |
| 2023-01/cyfirma-transparent-tribe-government | cyfirma/2023-01-18_transparent-tribe-government-targeting | …/research/ |
| 2023-04/sidewinder-pakistan-china-ongoing | kaspersky/2023-04_sidewinder-pakistan-china-ongoing | https://securelist.com/ |
| 2024-08/donot-android-continuation-2024 | cyfirma/2024-08_donot-android-continuation | …/research/ |
| 2026-01/ofac-zedcex-zedxion | treasury/2026-01-15_zedcex-zedxion | …/news/ |

Plus the 2 carried over from batch 15: **ccleaner-supply-chain**, **patchwork-badnews-continuation**.

## The larger tail (lower confidence — null-URL, NOT auto-phantom)

The detector also flags 67 unstamped events whose every source has a `url: null`, and 58
with some null-URL sources. **Null URL is NOT a phantom signal** — the set includes
legitimate book/offline sources (greenberg/2019_sandworm-book, zetter/2014_countdown-to-
zero-day, sanger/2012_confront-and-conceal, greenwald/2014_no-place-to-hide) and real
articles whose URL was simply never backfilled. These are resolved per-event by the normal
census (the agent fetches/identifies the real source), NOT by this worklist. Full lists
reproducible via the detector in the session transcript.

## Recommendation

1. Run a **targeted phantom-remediation batch** on the 7 + 2 high-confidence events:
   each agent confirms the phantom, finds the real primary, re-sources + re-audits + stamps
   — OR flags retire/merge if the event is a duplicate or unsupportable.
2. Bias the census picker to surface **generic-URL** events early (highest integrity risk).
3. **Importer hardening (future):** `tools/import-staging.ts` should reject homepage/
   catalogue URLs (path depth ≤ 1, or `/research|blog|news/$`) at import, not just check 200.
4. Decision items for Kara: sidewinder-early retire/merge; any phantom events that turn out
   to be unsupportable duplicates (delete vs keep-as-stub).
