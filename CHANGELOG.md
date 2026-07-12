# Changelog

All notable changes to the AUSPEX dataset. Versions follow the Zenodo release series; the concept
DOI always resolves to the latest.

## v1.0.0 — 2026-07-12 (first public release)

The first public, citable release of the AUSPEX corpus.

**Milestone: the event-audit census is complete.** Every one of the **785 events** has been
audited 6-point against its raw cited sources — **100% qc coverage** (691 full + 94 partial). This
is the integrity backbone of the release: the dataset is not merely machine-schema-valid, it is
audited claim-by-claim against its primary sources. The audit is machine-performed
(`verified_by: claude-opus-4.8`, recorded per event in the `qc:` block) — a 100%-coverage
record-vs-source audit, disclosed as distinct from independent human inter-rater verification (a
separate reliability study). Verification status is reported honestly per event (no "verified"
overclaim; partials are labeled where a load-bearing source was un-snapshottable and
mirror-corroborated).

### Dataset
- 785 events · 222 actors · 86 doctrines (199 pillars / 7 programs) · 93 services · 179
  policy-actions · 1,772 source records · 113 target entities · 73 timeline markers, across 15
  doctrine-authoring states.
- Formal JSON Schema (`audit/schemas/atlas.schema.json`), independently re-validatable.
- Machine gate `make verify`: 3,437/3,437 records conform, 0 structural errors, engine validator clean.

### What the census changed (vs. pre-audit corpus)
- Removed fabricated and duplicate events; merged duplicates (e.g. an Olympic-Games/Stuxnet duplicate
  folded into the canonical Natanz event); re-homed mis-dated events; stripped over-attestations and
  fabricated tradecraft/figures throughout.
- **Engine accuracy dropped accordingly and honestly** (attribution 64.9→50.8, doctrine 68.5→62.8,
  pillar 61.6→57.6, joint 47.9→38.0 top-1): a de-circularization — the audit removed the over-clean
  labels the engines had partly memorized. Prospective (temporal-holdout) attribution top-5 is 56.2%
  on the rankable set.

### Publication scaffolding
- `LICENSE` = **CC BY 4.0** (data + docs); `DATA-RIGHTS.md` documents the layered provenance and the
  no-redistribution rule for copyrighted source bodies (URL + `content_sha256` only).
- `.zenodo.json` + `CITATION.cff` (ORCID 0009-0001-7400-1394) for Zenodo/ORCID archival.
- `publish/DATASHEET.md` (Datasheets-for-Datasets format) and `analysis/FINDINGS.md` (who×why numeric
  ledger, regenerable via `make findings`).

### Notes
- This is a frozen research snapshot; a continuously maintained version lives at
  https://auspex.blackflagintel.com.
- The pre-registered confirmatory predictions (`thesis/preregistration-2026-06.md`) are **not** locked
  by this release — the `v1.0-dissertation` pre-registration freeze is a separate, later tag.
