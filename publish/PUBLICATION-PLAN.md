# Dataset publication plan — getting AUSPEX into the literature

**Goal.** A peer-reviewed dataset publication + a citable DOI release. For the doctorate this
is the highest-leverage external validation available: a published dataset paper means
independent reviewers accepted the methodology *before* the examiners see it, and it gives the
dissertation a citable artifact chapter.

**Built for a solo author with a day job:** everything mechanical is tooled
(`publish/export_release.py` builds the release bundle; `publish/DATASHEET.md` is pre-filled);
the judgment items are explicitly marked **[KARA]** and sized.

---

## Decision 0 — the commercial tension (decide before anything else) **[KARA]**

AUSPEX is also a Black Flag Intelligence product with a planned commercial launch. Academic
dataset publication norms pull toward open licensing. The standard resolution — used by
commercial threat-intel firms publishing research data — is **dual-track**:

- **Research release:** a *frozen snapshot* (the `v1.0-dissertation` tag) published with a DOI
  under an open-ish license; this is what the paper describes and what reviewers/replicators
  get. It ages naturally — it is a historical snapshot, not the living product.
- **Living product:** the continuously-updated atlas + engine + site stays yours, under
  whatever commercial terms you want. The paper can say "a continuously maintained version is
  available at auspex.blackflagintel.com."

License options for the research snapshot, in order of venue-compatibility:
1. **CC BY 4.0** — required by Scientific Data and friends; maximal reuse incl. commercial.
2. **CC BY-NC 4.0** — blocks commercial reuse by others; *excludes Scientific Data* but
   acceptable to Journal of Cybersecurity (data-availability statement, repository link).
3. **CC BY-NC-ND or custom** — protects most, publishes least; some venues reject.

If protecting the product matters, **CC BY-NC on the frozen snapshot + Journal of
Cybersecurity** is the coherent combination. If maximal academic uptake matters more,
**CC BY + Scientific Data**. Decide here: ______

## Venue strategy (in recommended order)

| step | venue | what | why | effort |
|---|---|---|---|---|
| 1 | **Zenodo** (no review) | DOI for the frozen snapshot, release bundle from `export_release.py` | citable immediately; required by every later step; zero gatekeeping | ~2h once frozen |
| 2a | **Scientific Data** (Nature Portfolio) — *if CC BY* | "Data Descriptor" — describes the dataset, no findings required; technical-validation section = your verification plan + inter-rater κ | high visibility; descriptor format matches what already exists (SCHEMA.md, audit harness, FINDINGS) | the datasheet → descriptor rewrite, ~3-4 weekends |
| 2b | **Journal of Cybersecurity** (Oxford) — *if NC license* | dataset/methods paper | the field-native venue; interdisciplinary reviewers who know EuRepoC/DCID | similar |
| 3 (optional, parallel) | **CyCon** (NATO CCDCOE) or **WEIS** | short paper introducing the corpus + one finding (the who×why information result) | community visibility, feedback before the journal round, conference deadline = useful forcing function | ~2 weekends from existing material |
| later | findings papers | doctrine→attribution information (J. of Cybersecurity); the deterrence non-identifiability methods note (J. of Peace Research / International Interactions style venues) | post-dissertation or alongside | — |

**Datasets to position against in the paper (reviewers will check):** EuRepoC, the Dyadic Cyber
Incident Dataset (Valeriano & Maness), CFR Cyber Operations Tracker, CISSM. Your
differentiators: doctrine labels (nobody has them), per-claim sourcing with archive URLs,
machine-verifiable schema + audit gate, published reliability + verification methodology.
(Verify each comparison claim against their current documentation before submitting.)

## What reviewers will demand (and your answer's source)

| reviewer question | answer comes from |
|---|---|
| coding reliability? | the inter-rater study (κ) — **must be done before submission** |
| data quality / verification? | docs/CORPUS-VERIFICATION-PLAN.md + qc-coverage % — **T2 census should be substantially done** |
| collection bias? | the within-year-normalization analysis + the selection-on-DV caveats (already written) |
| comparison to existing datasets? | the positioning section **[KARA writes, reading-map Claim 3]** |
| reproducibility? | release bundle + schema + audit harness (done) |
| ethics/sensitive data? | all public-source, no PII beyond indicted/sanctioned named individuals (public record); say so explicitly |
| AI assistance? | **[KARA]** check venue policy; AUSPEX's machine-assisted curation with human verification is disclosable as methodology — the inter-rater number is precisely the control |

## The critical path (orders the existing plans; nothing new)

1. **[KARA]** Decision 0 (license/track) — 1 evening.
2. T2 verification census underway + **inter-rater study done** — the long pole (~3-4 months at
   your pace; both already tooled).
3. Freeze `v1.0-dissertation`, sign the pre-registration, run `export_release.py`, upload to
   Zenodo → DOI.
4. **[KARA]** Fill the [KARA] sections of `publish/DATASHEET.md` (motivation, composition
   rationale, limitations you stand behind) — 2-3 evenings.
5. Rewrite datasheet → venue format (I scaffold the skeleton on request), submit.
6. Use reviewer feedback to harden the dissertation's dataset chapter — the reviews are free
   examiner practice.

**Realistic timeline at ~5 hrs/week:** submission in **4-6 months**, decision in 3-6 more —
landing acceptance (or an R&R worth its weight in gold) right around when you start writing.

## Files in this kit

- `export_release.py` — builds `release/auspex-v<TAG>/` (JSONL per entity + schema + stats +
  checksums + datasheet copy) from the raw YAML; deterministic, re-runnable.
- `DATASHEET.md` — Gebru et al. "Datasheets for Datasets" structure, stats auto-fillable,
  [KARA] judgment slots.
- `../CITATION.cff` — citation metadata (fill ORCID); GitHub renders it, Zenodo ingests it.
