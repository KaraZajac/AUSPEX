# AUSPEX — DSc thesis (working drafts)

Doctoral (DSc, cybersecurity) thesis built on the AUSPEX project. Working title:

> **Beyond Attribution: Doctrine-Aware Tagging, Attribution, and Forecasting of
> State-Sponsored Cyber Operations**

## Files

- **`thesis-draft.md`** — the master draft: title, abstract, thesis statement, the four
  research questions, the contributions, a full chapter-by-chapter draft, discussion,
  limitations, and conclusion. Read this top-to-bottom; split into per-chapter files
  when you move to formatting.

## Source material (already written — the thesis synthesizes these)

The methods + results are largely done; the thesis assembles and frames them.

| thesis chapter | backed by |
|---|---|
| Corpus + doctrine-tagging methodology | `atlas/`, `docs/AUDIT-2026-05-29.md` |
| Attribution under class imbalance / long tail | `docs/MODELING-DIAGNOSTICS-2026-05-30.md`, `docs/CORPUS-GROWTH-EXPERIMENT-2026-05-30.md` |
| Who × why join (doctrine / pillar / joint) | `docs/AUDIT-2026-05-29.md`, engine eval pages |
| Doctrine-aware forecasting | `docs/FORECASTING-2026-05-31.md`, `tools/eval-forecast.ts` |

## Status

- ✅ Abstract, thesis statement, RQs, contributions — drafted.
- ✅ Core chapters (corpus, attribution/long-tail, who×why, forecasting) — drafted from
  real results; every quantitative claim traces to a committed experiment.
- 🟡 Background / related work — structured with the argument; **`[TODO]` formal
  citations** (the literature survey is the main writing still owed).
- 🟡 Discussion / limitations / conclusion — drafted; expand for the committee.
- ⬜ Front matter (acknowledgements, etc.), formatting to program template, any required
  IRB/ethics statement (likely N/A — public-source OSINT only; confirm with program).

All numbers are as of the 2026-05-31 815-event corpus build. Re-pull from the eval
tools before final submission in case the corpus has grown since.
