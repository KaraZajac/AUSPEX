# Datasheet: AUSPEX — a doctrine-tagged corpus of state-sponsored cyber operations

*Structure follows Gebru et al., "Datasheets for Datasets" (CACM 2021). Sections marked
**[KARA]** require the author's own words — they are the motivation/judgment sections reviewers
read most closely. Numbers below are from the 2026-06-09 corpus (818 events); regenerate from
`stats.json` (`publish/export_release.py`) at freeze time.*

## Motivation

**For what purpose was the dataset created?** **[KARA — 1 paragraph.]** Core: existing cyber
event datasets record *who* and *what*; none systematically record *why* — the strategic
doctrine an operation serves. AUSPEX operationalizes doctrine as a label space joined to
attribution ("attribution names the who; doctrine names the why").

**Who created it / funding?** **[KARA]** — single analyst (Black Flag Intelligence);
self-funded; machine-assisted curation with human verification (see Reliability).

## Composition

- **Instances:** 818 events (731 operational, 87 meta/announcement), 205 actors, 88 services,
  17 nation-states, 86 doctrines (199 pillars; kinds: 48 strategy / 23 posture / 7 statute /
  6 treaty / 2 event-anchor), 1,272 sources, 179 policy-actions, 108 target entities,
  96 sectors, 73 timeline markers. Years 2003–2026 (regenerate from stats.json).
- **What does an instance contain?** An event carries dated summary prose, typed incident
  classification, victims (sector × country), `attributions[]` (actor FK + attributing
  organization + confidence + AUSPEX editorial assessment), `doctrine_links[]` (doctrine /
  pillar FK + evidentiary confidence + a `perspective` field separating the attacker's
  rationale from victim/defender doctrine), and per-claim source FKs.
- **Label semantics:** only `attacker-rationale` doctrine links constitute the who×why join.
  `attested` requires a cited source that names the strategic goal *in substance* (the doctrine
  slug itself need not appear — see the WHY-ladder, `docs/SCHEMA.md`). The gate enforces the
  *structural* rule (`attested` ⇒ `attesting_source_id` present); the *semantic* claim — that the
  source actually names the goal — is the human census's job, and the gap between the two is what
  the 2026-06-19 over-attestation correction measured (below).
- **Is anything missing?** Yes, by construction: the corpus contains *disclosed* operations
  only; collection density varies by year and reporting ecosystem (see Limitations).

## Collection process

- **How was data acquired?** From public reporting: government advisories/indictments/
  sanctions (govt-primary: ~27%), vendor research (~27%), journalism, think-tank and academic
  sources (full distribution in stats.json). Every URL is curl-verified at ingestion;
  unverifiable URLs are recorded as `url: null` with an explanatory note; 69%+ of sources
  carry Wayback `archive_url` snapshots (target: ~100% at freeze).
- **Who collected it; over what timeframe?** **[KARA — honest description of the
  machine-assisted pipeline + your verification protocol, citing
  docs/CORPUS-VERIFICATION-PLAN.md.]**
- **Sampling strategy?** Not a probability sample: curated significant state-sponsored
  activity, biased toward English-language disclosure (see Limitations).

## Labeling & reliability  *(reviewers weight this section most)*

- **Who assigned labels?** Doctrine/attribution labels are machine-drafted and then verified —
  by independent **LLM audit** against the primary sources (Claude Opus 4.8, max reasoning effort;
  raw evidence captured + SHA-256-hashed) and/or by the candidate's **human** review. Every link
  carries `analyst`, `confidence`, `reasoning`, and (where applicable) an attesting source; the
  per-record `qc.verified_by` stamp names which tier verified it.
- **Inter-rater reliability:** primary-link agreement ____%, Cohen's κ = ____ on a stratified
  blind sample of N=100 links (protocol: thesis/interrater/PROTOCOL.md). **[run the study;
  insert numbers + adjudicated error rate]**
- **Verification coverage (two tiers, recorded per-record in `qc.verified_by`):** every record is
  machine-validated first (T0/T1: JSON Schema + referential integrity + URL/archival checks, all
  pre-commit-enforced, 100%). On top of that, records receive a per-event verification stamp under
  the published protocol (`docs/CORPUS-VERIFICATION-PLAN.md`): **LLM-audited** — an independent audit
  by Claude Opus 4.8 (max effort) against the cited primary sources, correcting errors and capturing
  the raw source + a content hash for reproducibility — and/or **human-verified** by the candidate.
  At freeze: __% LLM-audited, __% human-verified (regenerate from stats.json). No record is
  represented as "verified" absent a `qc:` stamp, and the stamp always names the auditor (audit model
  + effort, or `kara`) so the tier is unambiguous. The 157 backfill-imported events promoted on
  2026-06-20 carry no special status — they enter the same protocol.
- **Known label corrections:** the corpus carries a public correction history — git history is
  the audit trail. Major passes: the **2026-06-09 re-baseline** (perspective semantics; prose
  leak scrubs; withdrawn over-claims); and the **2026-06-19 over-attestation re-grade**
  (`docs/OVER-ATTESTATION-FINDING-2026-06-19.md`) — a systematic audit that found `attested`
  over-applied, corrected ~120 doctrine links (350→~226) to `strongly_inferred`/`plausible`,
  redefined the confidence rubric to the WHY-ladder, and attached an auditable `inference_basis`
  to each re-graded link. Verified engine-neutral: doctrine top-1 unchanged at 68.7%.
- **Threat-actor reference (MISP-galaxy cross-walk):** actor identity, naming, and nation
  attribution are anchored to **MISP-galaxy** `clusters/threat-actor.json` — the open community
  threat-actor registry (MISP Project; snapshot **v341, 2026-06-24**, UUID
  `7cdff317-a673-4474-84ec-4f1754947823`). Each matched actor links to its MISP cluster via
  `external_refs.misp_galaxy` (cluster UUID) + `misp_galaxy_name`; MISP synonyms are mirrored into
  `aliases` (`assigning_org: "MISP galaxy"`) and MISP's reference URLs into `external_refs.misp_refs`
  (131 of 181 non-criminal actors matched; refs mirrored onto 135 actors / 1,363 URLs). MISP
  attribution is **adopted where present but reviewed — not auto-adopted — where it conflicts** with
  better-sourced AUSPEX work: e.g. *Handala* is kept `ir/mois` (an Iranian MOIS false-flag persona)
  despite MISP's `country=PS` cover identity, and proxy actors are placed by **host nation** (e.g.
  *Lebanese Cedar* → `lb/`, Iran/Quds-Force backing noted). Unmatched actors (~50) are mostly
  legitimately absent from MISP (2025 vendor cryptonyms not yet ingested, ransomware crews tracked in
  MISP's separate galaxies, and AUSPEX-specific Western/operator-cluster placeholders).
- **Actor-record service audit (2026-06-24/25):** separate from the event audits, every actor's *service*
  placement (MSS / GRU / SVR / IRGC / MOIS / RGB / NSA / GCHQ / CIA / …) was verified against its **own
  cited sources** by independent LLM audit (Claude Opus 4.8, max effort; raw evidence captured +
  SHA-256-hashed). After an initial ~21-actor provisional pass, a comprehensive sweep covered all ~114
  **curated** service-placed actors (eight batches). Outcome: **67 demoted to `<nation>/unscoped`** where no
  cited source named the service (vendor "PANDA"/"UNC"/"UAT" clusters, and "Russia/Iran/Turkey-aligned"
  framings, attribute only at the nation level); **47 kept** where a source named the service (e.g.
  APT29 → SVR per the White House; Triton → TsNIIKhM, MuddyWater → MOIS, Salt Typhoon → MSS,
  Lazarus/Andariel/Kimsuky → RGB, all per OFAC/DOJ/CISA; Equation Group → NSA/TAO and Regin → GCHQ via the
  Snowden / Shadow-Brokers documentary record); and **1 re-homed** (APT26 cn/pla → cn/mss, a wrong-service
  correction). The audit *discriminates* rather than blanket-demotes — well-attributed state actors are
  retained, inferred placements are not. **18 profit-criminal** ransomware/botnet crews with no documented
  state nexus were then moved to the stateless `criminal/` namespace (joining Emotet); Conti + LockBit were
  kept as `ru/proxies` on documented safe-harbor / state-nexus. Several structural placeholders for national
  offensive bodies with no specific sourced operation (France's COMCYBER, Korea's COC, the UK's NCF, the US
  Cyber Mission Force) were demoted and flagged as retire-candidates; one mis-modeled record (a policy body)
  was retired; two actors found to be one cluster were merged (Black Shadow → Agrius / Pink Sandstorm).

## Uses

- **Intended:** attribution research, doctrine/strategy analysis, forecasting research,
  evaluation of who×why joint models; teaching.
- **Out of scope / cautions:** the corpus measures *agreement with vendor-attribution
  consensus*, not adjudicated truth; deterrence-effect inference was shown NOT identifiable
  from this design (analysis/FINDINGS.md F4) — users should not attempt it without additional
  data; per-state tempo comparisons must use the collection-bias-normalized views.

## Distribution

- **License:** CC BY 4.0 (decided 2026-06-09 — open gold standard, widest audience; reuse
  requires attribution to Kara Zajac / Black Flag Intelligence).
- **DOI / access:** Zenodo, frozen tag `v1.0-dissertation`; living version at
  auspex.blackflagintel.com.

## Maintenance

- **[KARA]** — versioning policy (stable slugs forever; corrections add aliases; post-freeze
  intake forms the pre-registered confirmatory cohort, thesis/preregistration-2026-06.md).

## Composition rationale, Limitations, Ethics

- **Limitations (state plainly):** disclosure/collection bias (measured: within-year
  normalization shifts some recent-share rankings materially); single-curator labels
  (mitigated, not eliminated, by the blind reliability study); 2/3 of attributed events rest
  on a single source that is also the attribution document (quantified; verification census
  targets this pool); doctrine construct heterogeneity (made explicit via `kind`).
- **Ethics:** all public-source; named individuals appear only where already named in public
  legal/sanctions documents; no private data. **[KARA — confirm + venue-specific statement.]**
- **AI assistance disclosure:** **[Draft — Kara to confirm wording per venue policy.]** Curation
  and source-verification were substantially machine-assisted. Doctrine and attribution labels were
  machine-drafted; the source-audit — checking each record's claims against its cited primary
  sources, correcting errors, modelling attribution as a dated timeline, and capturing raw evidence
  — was performed by **Claude Opus 4.8 (Anthropic), at maximum reasoning effort**, under the
  candidate's design and direction. Each record's verification tier is recorded transparently in
  `qc.verified_by` (the audit model id + `effort`, or `kara` for human verification), and raw source
  snapshots with SHA-256 hashes make every LLM audit independently reproducible. The candidate
  designed the schema, methodology, and tagging rubric, directs the audit, and performs human review;
  no record is represented as human-verified unless a human stamp records it.
