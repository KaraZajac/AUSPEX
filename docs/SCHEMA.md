# AUSPEX atlas — master data schema

**Authoritative, data-derived field reference for every atlas YAML type.** Generated from
the live corpus by `audit/introspect_schema.py` (presence %, value types, and enums are
read from all records, not hand-maintained) and cross-checked against the enforced rules in
`site/tools/validate.ts`. Project rule: **trust the on-disk YAML** — if this doc and the
data disagree, the data wins; re-run the introspector.

This document is the human-readable form; the **machine-checkable form** is
[`audit/schemas/atlas.schema.json`](../audit/schemas/atlas.schema.json) (standard JSON
Schema), enforced over every record by `audit/check_conformance.py` — currently
**PASS, 2,934/2,934 records conform**. Keep the two in step.

Current as of the 815-event corpus (2026-05-31). Regenerate / verify:

```sh
python3 audit/check_conformance.py        # validate every record against the JSON Schema (PASS/FAIL)
python3 audit/introspect_schema.py        # re-derive field/type/presence/enums per entity
python3 audit/verify_atlas.py             # consistency + referential audit
pnpm --dir site validate                  # the engine's own validator (FKs + feature enums)
```

Entity counts: events 815 · actors 204 · services 88 · nation-states 17 · doctrines 86
(199 pillars) · sources 1,269 · targets 108 · timeline-markers 73 · policy-actions 178 ·
sectors 96 (one aggregate file). `campaigns/` is empty — campaigns are editorial
`campaign_id` strings on events, not their own files.

---

## Global conventions

- **Identifiers / slugs.** Every record has a string `id`. Slugs are **stable forever** —
  never renamed; corrections add aliases. Hierarchy is encoded in the id path (below).
- **Dates** are ISO `YYYY-MM-DD` (YAML date type). A few fields accept a `date_range` dict
  instead. `null` is allowed where noted.
- **Foreign keys** are id strings; the validator errors on dangling references. The FK map
  is at the end.
- **Confidence is never upgraded.** Two scales, named precisely (audit H6): the
  attributing-org confidence `high` / `moderate` / `low` follows **ICD-203's confidence
  dimension** (ODNI Analytic Standards); the doctrine-link scale `attested` /
  `strongly_inferred` / `plausible` is the **AUSPEX evidentiary scale** — *inspired by but
  distinct from ICD-203* (ICD-203 has no "attested" concept). The WHY is an **inference by
  construction** — the source names the *who*, the doctrine link names the *why* AUSPEX adds —
  so the scale grades **how strongly an authoritative source corroborates that inference**, never
  whether the perpetrator confessed or a source named the AUSPEX doctrine slug. `attested` =
  an authoritative attributing source (govt / tier-1 vendor) **explicitly states the strategic
  purpose at the goal level** (the goal the doctrine encodes; the slug need not appear), and
  **requires** `attesting_source_id` — enforced as a gate ERROR. See the full ladder under
  **doctrine_links** below and the calibration rationale in
  [`OVER-ATTESTATION-FINDING-2026-06-19.md`](OVER-ATTESTATION-FINDING-2026-06-19.md). Both scales
  are distinct from `auspex_assessment` (our editorial stance).
- **Sources are mandatory.** A claim without a source does not ship. Unverifiable URLs use
  `url: null` **plus an explanatory `note`** — never a fabricated URL.
- **Actor → state** is derived from the id's first segment (`cn/mss/apt40` → `cn`;
  `criminal/...` → no state).
- **`[REQUIRED]`** below means present in ≥99% of records; **optional (N%)** gives observed
  presence. Types use `a|b` for unions and `list<t>` for arrays.

---

## events  (`atlas/events/<YYYY>/<MM>/<slug>.yaml`, id `YYYY-MM/<slug>`)

The central entity: a cyber operation (or a meta/announcement event).

| field | type | req | notes |
|---|---|---|---|
| `id` | str | REQUIRED | `YYYY-MM/<slug>` |
| `name` | str | REQUIRED | descriptive title |
| `start_date` | date | REQUIRED | op start (or best estimate) |
| `incident_type` | list\<str\> | REQUIRED | ≥1 from the incident-type vocab (below) |
| `false_flag_risk` | str | REQUIRED | `none` \| `suspected` \| `confirmed` |
| `summary` | str | REQUIRED | source-grounded prose |
| `attributions` | list\<dict\> | REQUIRED | the *who* (may be a single null-actor entry) — see below |
| `doctrine_links` | list\<dict\> | REQUIRED | the *why* (may be empty `[]`) — see below |
| `sources` | list\<str\> | REQUIRED | FK → sources |
| `targets` | list\<dict\> | optional (98%) | the victims — see below |
| `qc` | dict | optional | **verification stamp** (`{verified_by, verified_on, level: full\|partial\|sources-only, effort?, notes?}`). `verified_by` names the auditor: a model id (e.g. `claude-opus-4.8`, paired with `effort`) = independent **LLM audit** against primary sources with raw evidence captured + hashed; `kara` = **human** verification by the candidate. Presence = passed the per-event protocol (`docs/CORPUS-VERIFICATION-PLAN.md`); absence = machine-checked only. *(Field is `verified_on`, never `on` — bare `on:` is a YAML 1.1 boolean key.)* Coverage reported by `verify_atlas.py` (`qc-coverage`). |
| `initial_vector` | str | optional (94%) | initial-access vocab (below) |
| `disclosure_date` | date | optional (80%) | public disclosure |
| `end_date` | date\|null | optional (80%) | op end if bounded |
| `outcome_summary` | str | optional (80%) | what happened |
| `campaign_id` | str | optional (19%) | editorial campaign cluster (free string; shared across events) |
| `quantified_impact` | dict | optional (17%) | structured impact (financial, records, downtime…) |
| `operators_named` | list\<str\> | optional (12%) | indicted/named individuals (slugs) |
| `anticipated_timeline_markers` | list\<dict\> | optional | forecast linkage: `{marker_id (FK→timeline-markers), confidence (attested\|strongly_inferred), reasoning}` |
| `notes` | str | optional | editorial note |

**`attributions[]`** (914 across the corpus):

| field | type | req | notes |
|---|---|---|---|
| `actor_id` | str\|null | REQUIRED | FK → actors. **`null` = counter-action / unattributed** (see directionality below) |
| `attributing_org` | str | REQUIRED | who made the attribution (vendor / govt / acting body) |
| `attributing_org_confidence` | str | REQUIRED | `high` \| `moderate` \| `low` — how *sure* the org is |
| `attribution_level` | str\|null | optional | how *specific* the org got, **orthogonal to confidence**: `activity-cluster` → `nation` → `named-actor` → `named-unit`. Several dated entries per event capture **attribution latency** — e.g. Tortoiseshell was an `activity-cluster` (Symantec/Talos, 2019, no nation) until CrowdStrike reached `named-actor` (Iran, 2023) |
| `auspex_assessment` | str | REQUIRED | `concur` \| `concur-with-caveat` \| `partial` \| `contested` |
| `attribution_date` | date | REQUIRED | when the attribution was made |
| `attribution_source_id` | str\|null | REQUIRED | FK → sources |
| `notes` | str | optional (28%) | |
| `service_id` | str\|null | optional (4%) | FK → services; overrides the actor's default service |

**`doctrine_links[]`** (1,021 across the corpus):

| field | type | req | notes |
|---|---|---|---|
| `doctrine_id` | str | REQUIRED | FK → doctrines |
| `pillar_id` | str\|null | REQUIRED | FK → a pillar under that doctrine |
| `program_id` | str\|null | REQUIRED | FK → a program under that pillar |
| `confidence` | str | REQUIRED | `attested` \| `strongly_inferred` \| `plausible` — grades AUSPEX's intent-inference; see the ladder below |
| `reasoning` | str | REQUIRED | why this op serves this doctrine |
| `contested` | bool | REQUIRED | |
| `analyst` | str | REQUIRED | currently `claude` (machine-authored under human review) |
| `attesting_source_id` | str\|null | optional (81%) | FK → sources; **required when `confidence: attested`** — the source whose own words state the strategic purpose. On `strongly_inferred`/`plausible` links it denotes the primary *supporting* source (which need not name the goal — see `inference_basis.ruled_out`) |
| `inference_basis` | dict\|null | optional | structured, auditable grounds for the WHY-inference (see ladder). `attested` → `{source_quote, source_id}`; `strongly_inferred` → `{signals[], ruled_out}`; `plausible` → `{alternatives[]}`. Backfilled over time |
| `counter_explanation` | str\|null | optional (23%) | rationale when the link is contested/counter-intuitive |
| `perspective` | str | optional (~2.5%) | `attacker-rationale` (default when absent) \| `victim-response` \| `defender-response` — **whose doctrine the link names**, relative to the operation it explains. `defender-response` = the discloser/prosecutor's doctrine on an event documenting someone else's operation (UK NCS on a Sandworm advisory; NCS-2023 on an indictment of an attributed actor). `victim-response` = the victim state's doctrine (the event's effect on / mirror of it — Stuxnet → Iran's asymmetric-warfare doctrine). **Only attacker-rationale links feed engine training, eval label sets, the who×why join, and attacker-state derivation**; the others are atlas context. Cross-state links *without* a tag are flagged by `verify_atlas.py doctrine-state-mismatch`. |

**Doctrine-link confidence — the WHY ladder.** The doctrine link is the inference AUSPEX adds
on top of attribution (the source names the *who*; the link names the *why*). The label grades
**how far an authoritative source corroborates that inference** — it is *not* a claim that the
perpetrator confessed intent, nor that any source used the AUSPEX doctrine slug. Calibration
rationale and the re-grade procedure: [`OVER-ATTESTATION-FINDING-2026-06-19.md`](OVER-ATTESTATION-FINDING-2026-06-19.md).

| label | the bar | `inference_basis` |
|---|---|---|
| **`attested`** | an authoritative attributing source (govt / tier-1 vendor) **explicitly states the strategic purpose** of the operation, at the level of the goal the doctrine encodes (the *attributing authority's* assessment — not the actor's admission; the doctrine **slug need not appear**). Requires `attesting_source_id`. *Test: quote one sentence from the source naming the end the op serves.* | `source_quote` + `source_id` |
| **`strongly_inferred`** | no source states the purpose, **but** target + timing + actor-mission + doctrine-fit triangulate to **one strategic reading with no serious competitor** (an implicit ACH); **or** a source names only a *proximate* purpose (revenue, sanctions evasion) the doctrine specializes. *Test: would a second analyst, given the event + doctrine menu, land here?* (= the inter-rater study) | `signals[]` + `ruled_out` (the competing doctrine considered and rejected) |
| **`plausible`** | the op fits the doctrine, but no source states a purpose and **more than one strategic reading survives**. | `alternatives[]` |

Boundary that the 2026-06 re-grade turns on: a source naming the **goal in substance**
("…to fund its WMD and ballistic-missile programs") earns `attested` for the doctrine that
encodes that goal even if it never says "8th Congress defense plan"; a source naming only the
**behaviour or a weaker/adjacent goal** ("circumvent sanctions", "generate revenue for the
regime", or nothing) does **not** — that is `strongly_inferred`/`plausible`.

**`targets[]`** (1,382 across the corpus):

| field | type | req | notes |
|---|---|---|---|
| `target_id` | str | REQUIRED | `sectors/<slug>` (FK→sectors) \| `orgs/<slug>` or `infra/<slug>` (FK→targets registry) |
| `role` | str | REQUIRED | `primary` \| `collateral` \| `staging` \| `transit` |
| `country` | str\|null | optional (44%) | ISO-3166-1 alpha-2, lowercase |
| `outcome` | str | optional (8%) | per-target outcome |

---

## actors  (`atlas/actors/<state>/<slug>.yaml`, id `<state>/<service>/<slug>` · `criminal/<slug>` · `<state>/unscoped/<slug>`)

| field | type | req | notes |
|---|---|---|---|
| `id` | str | REQUIRED | hierarchy: state / service / cluster |
| `primary_service_id` | str\|null | REQUIRED | FK → services (`null` for `criminal/` + unscoped) |
| `additional_service_ids` | list\<str\> | REQUIRED | FK → services |
| `canonical_name` | str | REQUIRED | the AUSPEX-preferred name |
| `aliases` | list\<dict\> | REQUIRED | `{alias, assigning_org, confidence (equivalent\|overlapping\|disputed), note?}` — the "seven-name problem" |
| `status` | str | REQUIRED | `active` \| `dormant` \| `indicted` \| `sanctioned` \| `disbanded` |
| `mission` | list\<str\> | REQUIRED | e.g. `espionage`, `financial`, `surveillance` |
| `ttp_summary` | str | REQUIRED | tradecraft prose |
| `default_doctrine_alignment_ids` | list\<str\> | REQUIRED | FK → doctrines/pillars |
| `sources` | list\<str\> | REQUIRED | FK → sources |
| `active_since` / `active_until` | date / date\|null | optional (77%) | |
| `target_sector_ids` | list\<str\> | optional (77%) | FK → sectors |
| `external_refs` | dict | optional (58%) | e.g. `mitre_attack: G0007`, `misp_galaxy: …` |
| `notes`, `auspex_assessment` | str | optional | editorial |

### Actor placement rule — `<state>/proxies/` vs `criminal/` (and what "state" an actor has)

The actor id's namespace is a **claim**, and the placement rule is:

- **`<state>/proxies/<slug>`** (e.g. `ru/proxies/lockbit`): a financially-motivated crew with
  **source-documented state nexus** — safe-harbor/non-prosecution in that state, documented
  service tasking-overlap (e.g. ContiLeaks FSB liaison), or formal designation of the group as
  state-aligned. The evidence must be cited in the actor record's `sources`/`notes`. These actors
  count toward the harboring state in every state-derived statistic **by design** — the proxies
  namespace models the state's criminal-proxy ecosystem (cf. `ru/sanctions-response-2022`'s
  criminal-proxy-mobilization pillar). Sensitivity note: ~31% of RU-bucket operations come from
  `ru/proxies/*`; analyses that need state-organ-only tempo must exclude the proxies subtree.
- **`criminal/<slug>`**: no documented state nexus. `criminal` is an explicit **pseudo-state**
  bucket in per-state evaluation tables (not `??`).
- **`<state>/unscoped/<slug>`**: state assessed, service placement unresolved (QC frontier).

**Canonical state derivation** (`site/src/utils/atlas-core.ts` — the ONLY implementations;
do not reimplement): `actorStateId()` = primary service's state, else `criminal`, else a
2-letter id head, else undefined. `eventActorStateId()` = actor-truth for eval stratification
(returns `criminal`). `eventStateId()` = nation-state mapping for display/markers/null-actor
analyses (criminal → undefined; may fall back to an **attacker-rationale** doctrine's state).
Python analyses replicating state derivation must follow the same policy.

---

## services  (`atlas/services/<state>/<slug>.yaml`, id `<state>/<unit>[/<sub>]`)

Intelligence services / military units / state-aligned vendors.

| field | type | req | notes |
|---|---|---|---|
| `id` | str | REQUIRED | e.g. `ru/gru`, `ru/gru/26165`, `ae/darkmatter` |
| `nation_state_id` | str | REQUIRED | FK → nation-states |
| `name` | str | REQUIRED | |
| `parent_service_id` | str\|null | REQUIRED | FK → services (hierarchy) |
| `short_name`, `summary`, `mission` | str | optional (~97/84%) | |
| `aliases` | list\<str\> | optional (84%) | plain strings here (unlike actor aliases) |
| `active_since` / `active_until` | date / date\|null | optional (84%) | |
| `sources` | list\<str\> | optional (84%) | FK → sources |
| `contested` / `contested_notes` | bool / str | optional (1%) | disputed parent assignment |

> Convention: placeholder `*/unscoped` services hold actors awaiting real service placement
> (a QC backlog — see `audit/verify_atlas.py` `backlog-unscoped`).

---

## nation-states  (`atlas/nation-states/<id>.yaml`, id 2-letter)

| field | type | req | notes |
|---|---|---|---|
| `id` | str | REQUIRED | `us`, `ru`, `cn`, … (17: ae by cn fr il in ir kp kr pk ps ru sa tr uk us vn) |
| `name` | str | REQUIRED | full official name |
| `short_name` | str | REQUIRED | common name |
| `summary` | str | REQUIRED | strategic posture prose |

> Note: 17 nation-states exist but only **15 have doctrines** (`ps`, `sa` are actor-only).

---

## doctrines  (`atlas/doctrines/<state>/<slug>.yaml`, id `<state>/<slug>`)

The strategic frameworks — the moat. Pillars nest inside; programs nest inside pillars.

| field | type | req | notes |
|---|---|---|---|
| `id` | str | REQUIRED | `ru/military-doctrine-2014` |
| `kind` | str | REQUIRED | **construct class** (audit H4): `statute` (enacted law/constitution/binding resolution) \| `strategy` (formal published strategy/plan/doctrine document) \| `posture` (inferred-or-declared behavioral posture, no governing text — most have `issued_on: null`) \| `treaty` (international agreement/pledge) \| `event-anchor` (a dated geopolitical event used as a doctrinal anchor). The "doctrine" class deliberately spans these; **temporal claims (op-follows-publication) are only meaningful for dated `statute`/`strategy`/`treaty` records**, and analyses must say which subset they use. |
| `nation_state_id` | str | REQUIRED | FK → nation-states |
| `name`, `short_name` | str | REQUIRED | |
| `issued_by` | str\|null | REQUIRED | issuing body |
| `issued_on` | date\|null | REQUIRED | |
| `status` | str | REQUIRED | `active` \| `inferred` \| `superseded` |
| `superseded_by_id` | str\|null | REQUIRED | FK → doctrines |
| `inherits_from_ids` | list\<str\> | REQUIRED | FK → doctrines |
| `official_text_url` | str\|null | REQUIRED | |
| `summary`, `cyber_relevance` | str | REQUIRED | |
| `sources` | list\<str\> | REQUIRED | FK → sources |
| `pillars` | list\<dict\> | optional (81%) | see below (199 pillars total) |

**`pillars[]`** — id `<doctrine_id>/<slug>`:

| field | type | req | notes |
|---|---|---|---|
| `id` | str | REQUIRED | `ru/gerasimov-framework/non-military-means` |
| `name` | str | REQUIRED | |
| `summary` | str | optional (89%) | |
| `target_sectors` | list | optional (81%) | FK → sectors |
| `key_terms` | list | optional (49%) | |
| `programs` | list | optional (2%) | named programs — id `<pillar_id>/<slug>` (3 levels deep) |

---

## sources  (`atlas/sources/<publisher>/<date>_<slug>.yaml`, id `<publisher>/<date>_<slug>`)

| field | type | req | notes |
|---|---|---|---|
| `id` | str | REQUIRED | `mandiant/2024-04-17_apt44-unearthing-sandworm` |
| `kind` | str | REQUIRED | `govt-primary` \| `vendor-research` \| `journalism` \| `industry` \| `cert-advisory` \| `think-tank` \| `reference` \| `academic` \| `leaked-doc` \| `book` \| … (not tightly enum-enforced; a few singletons exist — candidate for normalization) |
| `publisher` | str | REQUIRED | |
| `title` | str | REQUIRED | |
| `url` | str\|null | REQUIRED | `null` allowed **only with a `note`** |
| `published_on` | date\|null | REQUIRED | |
| `retrieved_on` | date | REQUIRED | when curl-verified |
| `tier` | str | REQUIRED | `primary` \| `secondary` \| `tertiary` |
| `archive_url` | str\|null | optional (87%) | wayback/archive copy |
| `raw_snapshot` | str\|null | optional | filename in `atlas/sources/raw/` (gitignored local archive) of the captured raw source content — reproducible verification against link-rot / archive.org blocks. Added by LLM-audit |
| `content_sha256` | str\|null | optional | SHA-256 of the raw snapshot, committed so the local archive's integrity is independently checkable |
| `notes` | str | optional | normalized to `notes` (2026-06-20; the legacy singular `note` was retired from the data and the schema). LLM audits add an `AUDIT (date, model/effort):` line + verbatim supporting quotes |

---

## targets  (`atlas/targets/...`, id `orgs/<slug>` · `infra/<slug>`)

The named-victim registry (the discriminative target-org feature). Referenced by
`events.targets[].target_id` when it starts `orgs/` or `infra/`.

| field | type | req | notes |
|---|---|---|---|
| `id` | str | REQUIRED | `orgs/ukrenergo`, `infra/...` |
| `name` | str | REQUIRED | |
| `sector_id` | str | REQUIRED | FK → sectors |
| `nation_state_id` | str | REQUIRED | the target's country |
| `criticality` | str | REQUIRED | `national-cii` \| `regional-cii` \| `commercial` \| `civil-society` |
| `tech_focus` | list\<str\> | REQUIRED | |
| `summary` | str | REQUIRED | |
| `sources` | list\<str\> | REQUIRED | FK → sources |

---

## timeline-markers  (`atlas/timeline-markers/<state>/<slug>.yaml`)

Dated geopolitical / capability context (cyber-command stand-ups, strategy publications,
windows like the Davidson Window). **Capability/doctrine markers — NOT attacker↔victim
tension** (this is why the forecaster excludes them; see `docs/FORECASTING-2026-05-31.md`).

| field | type | req | notes |
|---|---|---|---|
| `id` | str | REQUIRED | `in/dcya/stand-up`, `cn/taiwan/davidson-window-2027` |
| `doctrine_id` | str\|null | REQUIRED | FK → doctrines |
| `date` | date\|dict | REQUIRED | a date, or a `date_range` dict |
| `description` | str | REQUIRED | |
| `cited_by` | list\<str\> | REQUIRED | FK → sources |
| `date_range` | dict | optional (1%) | for spanning markers |

---

## policy-actions  (`atlas/policy-actions/...`)

**State diplomatic / coercive actions — the directionality entity.** This is where a *US
sanction or indictment against a Russian actor* lives: `issued_by_state_id: us`,
`targets_state_ids: [ru]`. Directionality here is **acting-state → target-state** (the
opposite of an attack); do not read it as an operation.

| field | type | req | notes |
|---|---|---|---|
| `id` | str | REQUIRED | |
| `issued_by_state_id` | str | REQUIRED | the **acting** state (or `multilateral`) |
| `targets_state_ids` | list\<str\> | REQUIRED | the states/actors **acted against** |
| `action_type` | str | REQUIRED | `sanction` \| `indictment` \| `diplomatic-statement` \| `export-control` \| `asset-seizure` \| `legislative-action` \| `treaty` \| `vote` \| `election` \| `summit` \| `military-exercise` \| `weapons-test` \| `troop-movement` \| `political-transition` \| `mega-event` |
| `date` | date | REQUIRED | |
| `summary` | str | REQUIRED | |
| `official_url` | str\|null | REQUIRED | |
| `sources` | list\<str\> | REQUIRED | FK → sources |
| `significance` | str | optional (58%) | `high` \| `medium` |
| `confidence` | str | optional (41%) | `confirmed` \| `projected` \| `scheduled` |
| `date_range` | dict | optional (17%) | |
| `notes` | str | optional (43%) | |

---

## sectors  (aggregate: `atlas/sectors/sectors.yaml` → `{sectors: [...]}`, 96 entries)

| field | type | req | notes |
|---|---|---|---|
| `id` | str | REQUIRED | `government`, `ics/water`, `energy/oil-gas` (slash = hierarchy) |
| `name` | str | REQUIRED | |
| `parent_id` | str\|null | REQUIRED | FK → sectors (top-level if null) |
| `summary` | str | optional (4%) | |

## malware-lineage  (aggregate: `atlas/malware-lineage.yaml` → `{id, families}`)

Malware lineage groups for the lineage-aware-credit feature (e.g. Trickbot↔Conti).

---

## Controlled vocabularies (quick reference)

- **incident_type** (25): intrusion, data-theft, destructive, wiper, ransomware, financial-theft, extortion, supply-chain, pre-positioning, disruption, espionage, surveillance, bulk-collection, reconnaissance, influence-operation, hack-and-leak, leak, insider, cyber-physical, documentary, disclosure, doctrine-publication, attribution-publication, policy, law-enforcement. *(Last six are "meta"; an event whose types are all meta is excluded from the eval label set but kept in training.)*
- **initial_vector** (8): phishing, n-day, 0-day, supply-chain, valid-creds, insider, physical, unknown.
- **false_flag_risk**: none, suspected, confirmed.
- **attributing_org_confidence**: high, moderate, low.
- **attribution_level**: activity-cluster, nation, named-actor, named-unit.
- **qc.verified_by**: a model id (e.g. claude-opus-4.8, with qc.effort) = LLM audit · kara = human verification.
- **auspex_assessment**: concur, concur-with-caveat, partial, contested.
- **doctrine_link confidence / anticipated-marker confidence**: attested, strongly_inferred, plausible *(markers: attested, strongly_inferred)*.
- **target role**: primary, collateral, staging, transit.
- **target criticality**: national-cii, regional-cii, commercial, civil-society.
- **actor status**: active, dormant, indicted, sanctioned, disbanded.
- **actor alias confidence**: equivalent, overlapping, disputed.
- **doctrine status**: active, inferred, superseded.
- **source tier**: primary, secondary, tertiary.
- **policy-action action_type / significance / confidence**: (see policy-actions table).

---

## Foreign-key map

```
event.attributions[].actor_id            → actor.id        (null = counter-action/unattributed)
event.attributions[].attribution_source_id, .service_id → source.id, service.id
event.doctrine_links[].doctrine_id/pillar_id/program_id → doctrine / pillar / program
event.doctrine_links[].attesting_source_id → source.id
event.sources[]                          → source.id
event.targets[].target_id  sectors/*     → sector.id
                           orgs/* infra/* → target.id  (registry)
event.anticipated_timeline_markers[].marker_id → timeline-marker.id
actor.primary_service_id / additional_service_ids[] → service.id
actor.default_doctrine_alignment_ids[] / target_sector_ids[] → doctrine|pillar / sector
service.nation_state_id / parent_service_id → nation-state / service
doctrine.nation_state_id / superseded_by_id / inherits_from_ids[] → nation-state / doctrine
doctrine.pillars[].target_sectors[]      → sector.id
target.sector_id / nation_state_id       → sector / nation-state
timeline-marker.doctrine_id / cited_by[] → doctrine / source
policy-action.issued_by_state_id / targets_state_ids[] → nation-state (or `multilateral`)
sector.parent_id                         → sector.id
```

---

## Directionality & counter-action modeling (read this before auditing tags)

The single biggest source of tagging error is confusing **who acted** with **who was hit**.
Two distinct models, by design:

1. **An operation** (an attack) → an **event** with `attributions[].actor_id` = the
   perpetrator and `targets[]` = the victims. Direction: actor-state → target-country.
2. **A state action *against* a cyber actor** (US sanctions/indicts a Russian group) →
   primarily a **policy-action** (`issued_by_state_id` → `targets_state_ids`), OR an event
   modeled as a **counter-action**: `attributions[].actor_id: null`, the acting body in
   `attributing_org`, incident_type drawn from the meta set (law-enforcement / policy /
   attribution-publication / disclosure / documentary), and the subject described in the
   summary. The 119 null-actor events include these.

Consequences for verification (enforced/surfaced by `audit/verify_atlas.py`):
- A **source's publisher country need NOT match the actor's country** — a US-government
  source reporting a Russian actor is normal and must not be flagged.
- A doctrine on an attributed op should match the **actor's** state; a doctrine on a
  null-actor counter-action may be the **acting** state's. `doctrine-state-mismatch`
  surfaces the ambiguous cases for human review rather than auto-failing them.
- A purely-meta event that still names an actor, or a core operation with no actor, is a
  **review** item, not an error — the convention is nuanced and human-judged.
