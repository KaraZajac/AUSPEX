# Corpus verification plan — how 818 events get defensibly verified by one person

**The problem.** Full hand-verification of every record (818 events · 1,272 sources · ~1,000
doctrine links) at 10–20 min/event is 200+ hours — possible over a year, but uniform effort is
the *wrong* allocation. Examiners don't expect a census; they expect a **defensible quality
methodology**: census where risk concentrates, measured error rates where it doesn't, and a
written definition of what "verified" means. This plan is that methodology.

## What "verified" means (the per-event protocol)

A record is **human-verified** when the candidate has confirmed, against the cited sources:

1. **Source resolves** — URL live or archived (archive_url); content matches the citation.
2. **Event support** — the source supports the summary's factual claims (what happened, when,
   to whom). Dates in the record match the source (start vs disclosure distinguished).
3. **Attribution support** — the source names the actor at the stated
   `attributing_org_confidence`; `auspex_assessment` is the candidate's own judgment.
4. **Targets/sectors** — match the source (no sector inflation).
5. **Doctrine link** — the reasoning holds; confidence label honest (`attested` only if the
   source names the goal — now gate-enforced); `perspective` correct.
6. **Stamp it**: add `qc: {verified_by: kara, on: YYYY-MM-DD, level: full|sources-only}` to the
   record. The stamp is what makes verification *queryable* — coverage becomes a number
   (`X% of events human-verified`), reportable in the dissertation and checkable by the gate.

## The four tiers

| tier | what | coverage | status |
|---|---|---|---|
| **T0 — machine, continuous** | schema conformance, FK/enum integrity, perspective/attested rules, the pre-commit gate | 100%, every commit | ✅ built, enforced |
| **T1 — machine, periodic** | URL liveness (`verify_atlas.py --check-urls`) + **archive.org snapshot of all 1,272 source URLs** (links *will* rot before a defense) | 100% of sources | tool exists; archiving to build |
| **T2 — human census of the risk pool** | full protocol verification of every HIGH-RISK record | ~360 events (see below) | the main effort |
| **T3 — human stratified sample of the rest** | full protocol on a random sample of the remaining ~460 events; **report the measured per-field error rate with a CI** in the dissertation; any stratum whose error rate exceeds threshold escalates to census | n≈100, stratified by state × year-band × source-tier | after T2 |

**The risk pool (T2 census), in priority order:**

1. **127 events still carrying `PROVISIONAL` import headers** — flagged as un-QC'd *in the
   file*. An examiner who opens one asks why it's in the published corpus. Highest priority;
   finishing these also clears the embarrassing comments.
2. **All `attested` doctrine links** (~200) — the strong evidentiary claims; the inter-rater
   study samples them but the census verifies the attesting source actually says it.
3. **High-confidence single-source events on secondary/tertiary sources** (~310, overlapping
   #1) — the audit's 67%-circularity cohort; verification = find a second source or downgrade.
   (The OPM-breach-cited-to-Wikipedia case is the type specimen.)
4. **The load-bearing exemplars** — every event cited by name in FINDINGS.md, the README, or
   the thesis scaffold (exemplar chains, Stuxnet records, KP-money events). If a number in the
   dissertation traces to a specific event, that event must be census-verified.

**Effort honestly estimated:** the measured census pool is **488 events** (P1: 127 provisional ·
P2: 269 attested-link · P3: 92 single-source/high-conf — run `tools/qc-verify-worklist.ts` for
the live burn-down) ≈ 488 × ~15 min ≈ **120–160 hours** — ~5 focused hours/week for ~6 months,
finishing before writing starts. T3 adds ~25 hours. If that budget proves too heavy, the
defensible trim is P2: census the attested links on *load-bearing* doctrines (those cited in
findings) and sample the rest of P2 at n=60 with a reported error rate — document the choice
here before making it.

## Why sampling the tail is defensible (the viva answer)

"Every record passes machine integrity checks (T0/T1). Every high-risk record — provisional
imports, strong evidentiary claims, single-source attributions, and every event a dissertation
number depends on — was individually verified (T2). The remaining low-risk records were sampled
at n=100 stratified, with a measured error rate of X% [CI], below the pre-set acceptance
threshold of Y%; strata exceeding it were escalated to census." That is standard data-quality
methodology (acceptance sampling), and it is *stronger* than an unverifiable claim of having
eyeballed everything.

## Tooling to build (scaffolding, candidate's verification)

- `tools/qc-worklist.ts` — emits the risk-ranked worklist (provisional → attested → single-
  source-high-conf → load-bearing), one checklist per event, tracking the `qc:` stamp;
  burn-down count in the output.
- `qc` field in the schema + conformance (optional field; gate reports coverage %).
- `tools/archive-sources.ts` — submit all source URLs to the Wayback Machine; write
  `archive_url` back. Run once, then on every new source.
- Coverage line in `verify_atlas.py` output: "human-verified: N/818 events (X%)."

## Relationship to the other verification instruments

- The **inter-rater study** (thesis/interrater/) measures *label reliability* (would an
  independent rater assign the same doctrine?). This plan measures *factual accuracy* (do the
  sources say what the records claim?). Both numbers go in the dissertation; they answer
  different examiner questions.
- The **pre-registered confirmatory test** (thesis/preregistration) measures whether the
  *findings* generalize. Verification makes the inputs trustworthy; pre-registration makes the
  outputs trustworthy.
