# Release checklist — `v1.0-dissertation` tag (ORCID / DOI dataset)

The executable gate for cutting the frozen, citable DOI snapshot. **Strategy** lives in
[`../publish/PUBLICATION-PLAN.md`](../publish/PUBLICATION-PLAN.md) (venue, license, what reviewers
demand); **this** is the "is it actually ready to tag" gate. A published, ORCID-linked, DOI'd dataset
is permanent and citable by anyone who downloads it — the bar is stricter than viva-defensible.

Status legend: ✅ done · ⬜ pending · ⚠ blocked / needs decision. Current as of **2026-06-20**.
Owners: **[K]** = Kara (judgment / human verification) · **[auto]** = tooled, I can run/produce it.

---

## 0 · Machine gate (must be green at the *tagged* commit)
- ✅ `make verify` — schema conformance 2,942/2,942, 0 structural errors, engine validator clean.
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
- ⬜ **[auto]** Compute & state `qc:` stamp coverage. **Currently 0%** (T2 human census pending).
- ⬜ **[K]** Datasheet "Labeling & reliability" states it accurately: **T0/T1 machine-checked 100% · T2 human-verified X%** · inter-rater κ (if run). **No "verified" overclaim anywhere.**
- ⬜ **[K]** Note that promoting the 157 provisional records (commit `6508da5`) added *no* verification — the corpus is now uniformly "machine-checked, census-pending"; the gate reading "0 provisional" must not be read as "verified".
- ⬜ **[K]** Inter-rater reliability study status disclosed (`thesis/interrater/` — planned / run / κ result).
- ⬜ **[K]** Pre-registration status: the redefined `attested` (WHY-ladder) is locked *before* freeze (the pre-reg references the tagging rules).

## 3 · Quality corrections — documented & locked
- ✅ Over-attestation re-grade complete + engine-validated ([`OVER-ATTESTATION-FINDING-2026-06-19.md`](OVER-ATTESTATION-FINDING-2026-06-19.md); attested 350→226; 68.7% reproduces).
- ✅ WHY-ladder confidence rubric is authoritative (`SCHEMA.md` + `research/SCHEMA.md`); `inference_basis` in schema + `DATA_MODEL.md`.
- ✅ Provisional cohort promoted to first-class (157 events).
- ⬜ **[K/auto]** Known coverage gaps documented in datasheet: 21 `doctrine_links: []` TODO events, the thin-actor singleton tail, the R-bucket pending-refetch links, disclosure/collection bias.
- ⬜ **[auto]** Open editorial flags resolved or disclosed: zedcex source URL (unpinned), the ~8 per-link "pending re-fetch" restorations, the 2 DOJ-blocked source bodies.

## 4 · Engine reproducibility (every number in README / datasheet)
- ✅ Doctrine accuracy reproduces at HEAD (68.7% top-1 vs README 68.5% — within rounding; corpus not drifted).
- ⬜ **[auto]** Re-run the full eval suite at the *tagged* commit; confirm every published figure matches, else update README/datasheet to the tag's numbers (freeze-time, one definitive run).
- ✅ MITRE ATT&CK cache dependency documented (`tools/extract-mitre-ttps.ts`; needs the STIX bundle — a `.cache/` build step, gitignored).
- ⬜ **[auto]** README "Quick start" commands verified runnable from a clean clone.

## 5 · Metadata & publication mechanics (FAIR / DOI / ORCID)
- ⬜ **[K]** `CITATION.cff`: bump `version` → `1.0.0`, set `date-released` = freeze date, confirm `repository-code` URL, add the DOI post-Zenodo. (ORCID + CC-BY-4.0 already present. ✅)
- ✅ **[auto]** `LICENSE` file added (CC BY 4.0 legalcode, canonical text from creativecommons.org). [2026-06-20]
- ◐ **[K/auto]** `DATASHEET.md` audited [2026-06-20]: counts confirmed current (818/205/1272/86/88); fixed the `attested` framing (structural-gate vs semantic-census, not "machine-enforced"), added the 2026-06-19 over-attestation correction to the history, and the uniform-verification-status note. **Remaining [K] blanks:** inter-rater κ, verification %, the motivation / ethics / AI-disclosure paragraphs, version.
- ⬜ **[auto]** README counts/accuracy current (event/actor/source totals; accuracy caveats intact).
- ⬜ **[K]** Version assigned (`v1.0.0`) + CHANGELOG / release notes.
- ⬜ **[auto]** `publish/export_release.py` produces the distributable bundle; run it and sanity-check the artifact.
- ⬜ **[K]** Zenodo↔GitHub integration enabled (tag → auto-mint DOI) *or* manual-upload plan; note the concept DOI vs version DOI.

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

### Where it stands (2026-06-20)
**Green:** the machine gate, source-anchoring integrity, the over-attestation correction + engine
validation, provisional promotion. **The two things that actually gate a clean tag:** (1) the
**archiving** (§1 — blocked on archive.org), and (2) the **honest verification-status story**
(§2 — depends on the T2 `qc:` census, which is Kara's). Everything in §5 is mechanical and can be
done in an afternoon once §2 is settled. Recommended order: §2 (decide how verification % is
reported) → §4 freeze-run → §5 metadata → §1 archiving (whenever the throttle lifts) → §7 tag.
