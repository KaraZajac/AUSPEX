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
- **Confidence is ICD-203-disciplined** and never upgraded: doctrine links use
  `attested` / `strongly_inferred` / `plausible`; attributing-org confidence uses
  `high` / `moderate` / `low`; both are distinct from `auspex_assessment` (our editorial
  stance).
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
| `attributing_org_confidence` | str | REQUIRED | `high` \| `moderate` \| `low` |
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
| `confidence` | str | REQUIRED | `attested` \| `strongly_inferred` \| `plausible` |
| `reasoning` | str | REQUIRED | why this op serves this doctrine |
| `contested` | bool | REQUIRED | |
| `analyst` | str | REQUIRED | currently `claude` (machine-authored under human review) |
| `attesting_source_id` | str\|null | optional (81%) | FK → sources; **required when `confidence: attested`** |
| `counter_explanation` | str\|null | optional (23%) | rationale when the link is contested/counter-intuitive |
| `perspective` | str | optional (~2.5%) | `attacker-rationale` (default when absent) \| `victim-response` \| `defender-response` — **whose doctrine the link names**, relative to the operation it explains. `defender-response` = the discloser/prosecutor's doctrine on an event documenting someone else's operation (UK NCS on a Sandworm advisory; NCS-2023 on an indictment of an attributed actor). `victim-response` = the victim state's doctrine (the event's effect on / mirror of it — Stuxnet → Iran's asymmetric-warfare doctrine). **Only attacker-rationale links feed engine training, eval label sets, the who×why join, and attacker-state derivation**; the others are atlas context. Cross-state links *without* a tag are flagged by `verify_atlas.py doctrine-state-mismatch`. |

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
| `notes` / `note` | str | optional | **both spellings occur — normalize to `notes`** |

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
