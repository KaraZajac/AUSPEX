# Inter-rater verification study — doctrine-link reliability

**Purpose.** Every doctrine_link in AUSPEX carries `analyst: claude` (machine-assigned WHY
labels). The audit (docs/MODELING-AUDIT-2026-06-09.md C3) identified this as the most likely
line of oral-examination attack. This study converts that weakness into a **measured
reliability number**: the candidate independently re-derives doctrine links for a stratified
random sample, blind to the stored tags, and reports agreement. Outcome is citable either way —
high agreement validates the tagging pipeline; low agreement quantifies label noise that the
dissertation then carries honestly.

**Integrity boundary.** The tooling (sampler, scorer) is scaffolding; the *judgments* in the
worksheet must be the candidate's own, made without consulting the stored tags. This document
is the pre-registration: fix the protocol BEFORE looking at any sampled item.

## Design

- **Unit:** the (event, doctrine) link. Sample N=100 attacker-rationale links, stratified by
  doctrine state (cn / ru / ir / kp / other) × stored confidence (attested vs inferred), seeded
  RNG (seed=20260609) so the sample is reproducible.
- **Blinding:** `sample_links.py` writes two files —
  - `worksheet.yaml`: per item, the event id, name, summary, outcome_summary, actor(s), target
    sectors, source ids, and the **full doctrine menu** (id + name + one-line summary for every
    doctrine of the plausible states). It does NOT contain the stored doctrine_id, pillar,
    confidence, or reasoning.
  - `answer-key.yaml`: the stored tags. **Do not open until the worksheet is complete.**
- **Task per item (the candidate):** read the event material (and its sources if needed —
  source documents are fair game; the stored event YAML is not). Fill in:
  - `kara_doctrine_ids`: the doctrine(s) you would link, in order of confidence (may be empty —
    "no doctrinal reading" is a valid answer and scores against any stored link).
  - `kara_confidence`: attested | strongly_inferred | plausible for your top choice.
  - `kara_notes`: optional, one line.
- **Rules:** do not open the event's YAML file or any AUSPEX page for the event during the
  exercise; do not consult the answer key; complete items in any order; breaks are fine — the
  worksheet is resumable. Log total time spent (reviewers ask).

## Metrics (computed by `score_agreement.py`)

1. **Primary-link agreement:** fraction of items where the stored primary doctrine ∈ your
   `kara_doctrine_ids`. The headline number.
2. **Cohen's κ** on the primary doctrine, with chance = the corpus marginal frequency of each
   doctrine (guards against agreement-by-popularity).
3. **Set overlap (Jaccard)** between your set and the stored set, mean across items.
4. **Confidence agreement:** exact + adjacent (off-by-one on the 3-level scale) match on items
   where the primary links agree.
5. **Per-stratum breakdown** (state × confidence) — where does the pipeline disagree with you?

## Reporting

`score_agreement.py` writes `results.md` with all metrics + the disagreement list (each item
where you and the stored tag differ, side by side). The disagreement list is the QC payload:
adjudicate each (your call stands or the stored tag stands, with a note), then the adjudicated
error rate is the label-noise estimate the dissertation cites. If agreement is materially below
~0.7 κ, consider a second sample after adjudication to test whether the disagreements are
systematic (fixable tagging policy) or noise.

## Run

```sh
python3 thesis/interrater/sample_links.py     # writes worksheet.yaml + answer-key.yaml
# ... candidate fills worksheet.yaml (days, not hours — pace it) ...
python3 thesis/interrater/score_agreement.py  # writes results.md
```
