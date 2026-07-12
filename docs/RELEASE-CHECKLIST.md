# Release checklist — `v1.0-dissertation` tag (ORCID / DOI dataset)

The executable gate for cutting the frozen, citable DOI snapshot. **Strategy** lives in
[`../publish/PUBLICATION-PLAN.md`](../publish/PUBLICATION-PLAN.md) (venue, license, what reviewers
demand); **this** is the "is it actually ready to tag" gate. A published, ORCID-linked, DOI'd dataset
is permanent and citable by anyone who downloads it — the bar is stricter than viva-defensible.

Status legend: ✅ done · ◐ partial · ⬜ pending · ⚠ blocked / needs decision. Current as of **2026-07-11**.
Owners: **[K]** = Kara (judgment / human verification) · **[auto]** = tooled, I can run/produce it.

---

## 0 · Machine gate (must be green at the *tagged* commit)
- ✅ `make verify` — schema conformance 3,437/3,437, 0 structural errors, engine validator clean.
- ✅ `python3 audit/check_conformance.py --self-test` passes (validator validated).
- ✅ Schema is standard JSON Schema (`audit/schemas/atlas.schema.json`) — independently re-validatable with ajv / jsonschema, no AUSPEX code required.

## 1 · Source integrity & provenance (T1)
- ✅ Every claim source-anchored; **0 unreferenced sources** (url, or archive_url, or url:null + note). [fixed 2026-06-20]
- ✅ verify_atlas `source-url` harness bug fixed (checked `note` but 945 sources use `notes`); now accurate.
- ✅ Source field naming normalized to `notes`; legacy `note` retired from the source schema.
- ✅ No fabricated URLs (editorial policy; gate-adjacent).
- ⬜ **[auto]** URL-liveness sweep at the tagged commit; repair/disclose dead links. *Partial:* the 06-09 sweep flagged 160, all in the unarchived pool; re-run (~25 min) at freeze.
- ⚠ **[auto, BLOCKED] Archive snapshots: every source URL has `archive_url`.** 244 still unarchived; archive.org is 429-throttling this IP. **This is the most important open T1 item** for a permanent dataset (dead `.gov` links in 2028 = reproducibility failure). Resolve before tag: re-run `archive-sources.ts --save` once the throttle lifts or from a different network. The archiver tooling is throttle-aware and resumable.

## 2 · Verification status — represented honestly (the integrity crux)
- ✅ **[auto]** `qc:` stamp coverage computed & stated: **100%** — 691 full + 94 partial of 785, 0 unstamped. [census complete 2026-07-11]
- ◐ **[K]** Datasheet "Labeling & reliability" states it accurately: **T0/T1 machine-checked 100% · T2 LLM-audited 100%** (Claude Opus 4.8, 6-point vs RAW; 691 full + 94 partial) — **NOT** "human-verified": the LLM census is a distinct tier from human inter-rater verification (`verified_by: kara`), which is the separate reliability study. **No "verified" overclaim** anywhere — partials labeled where a load-bearing source was un-snapshottable. *Remaining:* inter-rater κ (if run).
- ✅ **[K]** The 157 promoted provisional records (commit `6508da5`) are **now census-verified** with the rest — the 100% census subsumed them; the earlier "machine-checked, census-pending" caveat no longer applies. [2026-07-11]
- ⬜ **[K]** Inter-rater reliability study status disclosed (`thesis/interrater/` — planned / run / κ result).
- ⬜ **[K]** Pre-registration status: the redefined `attested` (WHY-ladder) is locked *before* freeze (the pre-reg references the tagging rules).

## 3 · Quality corrections — documented & locked
- ✅ Over-attestation re-grade complete + engine-validated ([`OVER-ATTESTATION-FINDING-2026-06-19.md`](OVER-ATTESTATION-FINDING-2026-06-19.md); attested 350→226; 68.7% reproduces).
- ✅ WHY-ladder confidence rubric is authoritative (`SCHEMA.md` + `research/SCHEMA.md`); `inference_basis` in schema + `DATA_MODEL.md`.
- ✅ Provisional cohort promoted to first-class (157 events).
- ⬜ **[K/auto]** Known coverage gaps documented in datasheet: 21 `doctrine_links: []` TODO events, the thin-actor singleton tail, the R-bucket pending-refetch links, disclosure/collection bias.
- ⬜ **[auto]** Open editorial flags resolved or disclosed: zedcex source URL (unpinned), the ~8 per-link "pending re-fetch" restorations, the 2 DOJ-blocked source bodies.

## 4 · Engine reproducibility (every number in README / datasheet)
- ✅ Engine re-evaluated on the post-census corpus; README/CHANGELOG carry the current figures — attribution top-1 **50.8%** · doctrine **62.8%** · pillar **57.6%** · joint **38.0%** (all *lowered* vs pre-census — 64.9 / 68.5 / 61.6 / 47.9 — by census de-circularization; honest numbers on a cleaner corpus). Corpus drifted **by design** (the 100% census). [2026-07-11]
- ⬜ **[auto]** Re-run the full eval suite at the *tagged* commit; confirm every published figure matches, else update README/datasheet to the tag's numbers (freeze-time, one definitive run).
- ✅ MITRE ATT&CK cache dependency documented (`tools/extract-mitre-ttps.ts`; needs the STIX bundle — a `.cache/` build step, gitignored).
- ⬜ **[auto]** README "Quick start" commands verified runnable from a clean clone.

## 5 · Metadata & publication mechanics (FAIR / DOI / ORCID)
- ◐ **[K]** `CITATION.cff`: ✅ `version` = **1.0.0**, `date-released` = **2026-07-11**, `repository-code` + `url` + ORCID + CC-BY-4.0 all present [2026-07-11]. *Remaining:* uncomment the concept/version `doi:` post-Zenodo.
- ✅ **[auto]** `LICENSE` file added (CC BY 4.0 legalcode, canonical text from creativecommons.org). [2026-06-20]
- ◐ **[K/auto]** `DATASHEET.md` refreshed to the post-census corpus [2026-07-11]: counts current (**785/222/1,772/86/93**), verification coverage stated (**100% — 691 full + 94 partial of 785, 0 unstamped**), over-attestation correction + uniform-status note present. **Remaining [K] blank:** inter-rater κ (and any final prose blanks).
- ✅ **[auto]** README counts + accuracy current — **785/222/1,772**, engine **50.8/62.8/57.6/38.0** top-1, honesty caveats (retrodiction, vendor-truth, null=miss) intact. [2026-07-11]
- ✅ **[K]** Version **v1.0.0** assigned (`CITATION.cff`, `.zenodo.json`) + `CHANGELOG.md` release notes written. [2026-07-11]
- ⬜ **[auto]** `publish/export_release.py` produces the distributable bundle; run it and sanity-check the artifact.
- ✅ **[K]** Zenodo↔GitHub integration enabled; the `v1.0.0` release (2026-07-12) auto-minted concept DOI **10.5281/zenodo.21327251** (resolves to latest version).

## 6 · Ethics / scope / conflict-of-interest (reviewers + responsible publication)
- ✅ No-conflict-of-interest statement (README; AUSPEX takes no govt/vendor funding).
- ⬜ **[K]** Known biases stated in datasheet: collection/disclosure bias (records *disclosed* attacks, not the population), Western-source skew, vendor-attribution-as-ground-truth caveat, label-noise (`analyst: claude` WHY-tags → the inter-rater study).
- ⬜ **[K]** Named-individual review: the corpus names indicted/sanctioned operators — confirm every named individual traces to a public indictment / OFAC designation / court doc (no private-person exposure).
- ⬜ **[K]** Dual-use note: an analytic atlas of public events — no exploit code or operational TTPs beyond public reporting.

## 7 · Final tag steps (in order)
- ⬜ Working tree clean; everything committed.
- ⬜ **[K]** Pre-registration committed in the **same commit** as the tag (predictions lock at the tag; `thesis/preregistration-2026-06.md`).
- ⬜ **[K]** Create tag `v1.0-dissertation` on the chosen commit; tag message references `DATASHEET.md`, the license, and the verification-status statement.
- ⬜ **[K]** Post-tag: confirm Zenodo minted the DOI; update `CITATION.cff` (concept + version DOI) + a README badge; link the DOI on ORCID.

---

### Where it stands (2026-07-11)
**Green:** the machine gate (3,437/3,437), source-anchoring integrity, the over-attestation
correction, provisional promotion — **plus the two former hard blockers, now cleared:** (1) the
**T2 `qc:` census** (§2 — **100%**: 691 full + 94 partial of 785), and (2) the **engine
re-evaluation on the post-census corpus** (§4 — attribution 50.8 / doctrine 62.8 / pillar 57.6 /
joint 38.0 top-1, de-circularized and reported honestly; README, CHANGELOG, and DATASHEET all
carry the current numbers). **Remaining before a clean tag:** (a) **archiving** (§1 — still blocked
on archive.org throttling; the reproducibility risk for a permanent dataset), and (b) **inter-rater
reliability κ** (§2 — the last open verification-story number). Everything else in §5 is mechanical.
Recommended order: §1 archiving (whenever the throttle lifts) → κ study → §5 DOI / export mechanics
→ §7 tag.
