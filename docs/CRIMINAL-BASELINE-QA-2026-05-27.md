# Criminal-Baseline QA — 2026-05-27

Audit of the ~67 criminal-baseline events added to `atlas/` in the
preceding ~2-hour window. Read-only audit; nothing was modified.

## Headline counts

- **67 events** newly added under `atlas/events/<YYYY>/<MM>/`
- **54 sources** newly added across 13 publishers (krebs, doj, cisa,
  treasury, kaspersky, group-ib, symantec, kroll, fbi, europol,
  ncsc-uk, bitdefender, agari, riskiq)
- **14 criminal actor stubs** under `atlas/actors/criminal/`
- **22 org stubs** under `atlas/targets/orgs/`
- `pnpm run validate` from `site/` — **clean** (425 events, 837 sources,
  no schema errors)

## Pass / fail at a glance

| Pass | Result |
| --- | --- |
| A — `doctrine_links: []` integrity | **PASS** (67/67) |
| B — URL verification (sb0001 shape) | **PASS** for live URLs; many DOJ URLs unverifiable from this tool but plausible; **0 live-and-wrong** content mismatches found |
| C — Slug taxonomy + actor consistency | **PASS** (all FKs resolve; no state-actor slugs misfiled into criminal corpus; no actor-as-target Flag-5 shapes) |
| D — Factual / editorial review | **FAIL** — multiple systemic and individual issues; details below |

## Pass A findings (doctrine_links violations)

**None.** All 67 new events have `doctrine_links: []`. The abstain-class
contract is intact.

## Pass B findings (URL hallucinations and content mismatches)

### Verified live (title matches claimed title or summary)

All Krebs on Security, Group-IB, Kaspersky/Securelist, Symantec, CISA,
Treasury, Europol URLs (32 sources) — verified by direct fetch.
Titles match what the source stub claims.

### Verified via Wayback CDX

- `doj/2024-05-29_911s5-yunhe-wang.yaml` — Wayback snapshot
  `20240529162718` title: *"911 S5 Botnet Dismantled and Its
  Administrator Arrested in Coordinated International Operation"* —
  matches.
- `doj/2018-08-01_fin7-three-indictments-cluster.yaml` — Wayback
  snapshot `20180801172305` title: *"Three Members of Notorious
  International Cybercrime Group 'Fin7' In Custody for Role in
  Attacking Over 100 U.S. Companies"* — matches.

### Unverifiable but plausible

The following DOJ URLs return HTTP 200 (so the URL exists) but the
justice.gov Akamai interstitial blanks the `<title>` tag, and Wayback
returned no usable snapshots in the available endpoints during this
audit. URL slugs are consistent with DOJ press-release conventions;
treating as unverifiable, **not flagged**.

- `doj/2022-11-16_z-library-takedown.yaml`
- `doj/2022-10-25_sokolovsky-raccoon-extradition.yaml`
- `doj/2019-11-21_terpin-sim-swap-civil.yaml`
- `doj/2019-09-10_operation-rewired-bec.yaml`
- `doj/2023-01-18_bitzlato-takedown.yaml`
- `doj/2024-11-12_ptitsyn-phobos-extradition.yaml`
- `doj/2024-07-09_fitzpatrick-breachforums-plea.yaml`
- `doj/2023-04-05_genesis-market-edmi-takedown.yaml`
- `doj/2025-05-21_lumma-ndtx-takedown.yaml`

### `url: null` with reasoning captured

Five Agari sources, the DOJ Operation WireWire stub, and several
others correctly use `url: null` with a notes-field explanation
("Agari corporate URLs no longer serve the historic blog index",
"site migration", etc.). This is the right pattern — no action.

### No sb0001-shape hallucinations detected

Every URL we could verify resolved to a page whose content matches
the source stub's claimed title/topic. No "real URL with wrong
content" cases. Pass B is clean.

## Pass C findings (slug taxonomy issues)

### Actor IDs

All 18 distinct `actor_id` values used across the new events
resolve to existing `actors/criminal/*.yaml` files (or are `null`).

No event uses an actor slug from `ru/proxies/`, `cn/`, `ir/`, `kp/`,
or `us/`. Pass.

### Target IDs

All target_ids start with `orgs/`, `sectors/`, `infra/`, or
`targets/persons/`. No actor-as-target (Flag 5) shapes.

All `orgs/*` target_ids resolve to existing `targets/orgs/*.yaml`
files.

All `sectors/*` target_ids resolve against `atlas/sectors/sectors.yaml`.
No invented sectors. 19 distinct sectors used; all valid.

### Sources

All `sources:` and `attribution_source_id:` references resolve to
existing files. No dangling source pointers.

## Pass D findings (factual / editorial issues)

### D1. Wrong filename / event content mismatch — `events/2024/02/autonation-hunters-international.yaml` (HIGH)

The filename and `id:` field say "autonation". The `name:`, `summary:`,
`outcome_summary:`, `quantified_impact:`, `targets:`, and entire body
describe **Hoya Corporation** (Japanese optical/photomask manufacturer)
— not AutoNation (US car dealership group). The event also lists
`start_date: 2024-03-30` (March) but is filed under `2024/02/`.

Targets `sectors/ict/semiconductors/equipment` and
`sectors/healthcare/biotech` are correct for Hoya but make no sense
for AutoNation. There is an existing `targets/orgs/hoya.yaml` stub
that should be the target. This appears to be a copy/paste error
where the agent kept the AutoNation filename but pasted Hoya content.

### D2. Empty `sources: []` — editorial-norm violation (MEDIUM)

Two events ship with no sources at all:

- `events/2024/02/anydesk-production-intrusion.yaml`
- `events/2024/02/cencora-data-theft.yaml`

Per `atlas/README.md` §1: *"Source-anchored. Every claim has a
`sources:` list referencing files under `sources/`. No source = the
claim doesn't ship."* Both events include unverified narrative claims
(AnyDesk certificate rotation, Cencora $75M ransom payment) with the
Reuters URL only embedded in a `notes:` field as paraphrase.

### D3. Systemic — proxy/umbrella sources for victim-specific events (MEDIUM, ~15 events)

The dominant editorial issue. Many specific-victim events cite an
umbrella advisory or unrelated NHS statement as their only source.
Some events acknowledge this in `notes:` ("placeholder pointing at
the nearest contemporaneous primary source"); most do not.

Affected events (single source is unrelated to specific incident):

- `events/2024/01/inc-ransom-leicester-city-council.yaml` — cites
  `ncsc-uk/2024-03-27_nhs-dumfries-galloway-statement` (the wrong
  NHS incident; no Leicester-specific source). Also: `id:` says
  `2024-01/...` but `start_date: 2024-03-07` — March, not Jan; the
  file is filed under `2024/01/` for the wrong month.
- `events/2024/05/christies-ransomhub.yaml` — cites NHS Synnovis
  statement; `notes:` explicitly acknowledges this is a placeholder.
- `events/2024/05/bianlian-omni-hotels.yaml` — only source is the
  general AA23-136A BianLian advisory; no Omni-specific source.
- `events/2025/02/lee-enterprises-qilin.yaml` — cites NHS Synnovis
  statement for a US newspaper incident.
- `events/2024/04/frontier-ransomhub.yaml` — only source is generic
  AA24-242A RansomHub advisory.
- `events/2024/09/halliburton-followup-ransomhub.yaml` — same.
- `events/2023/11/yamaha-motor-philippines-inc-ransom.yaml` — cites
  NHS Dumfries statement; `notes:` acknowledges placeholder.
- `events/2023/12/court-services-victoria-qilin.yaml` — cites NHS
  Synnovis; `notes:` acknowledges placeholder.
- `events/2024/01/tietoevry-3am-finland.yaml` — only source is the
  Symantec 3AM documentary report (not Tietoevry-specific).
- `events/2024/01/schneider-electric-cactus.yaml` — only source is
  the Kroll Cactus documentary report.
- `events/2024/02/integris-hunters-international-doxing.yaml` —
  cites Bitdefender Hunters cluster report; no Integris-specific
  source.
- `events/2023/09/clorox-scattered-spider.yaml` — cites AA23-320A
  Scattered Spider advisory; no Clorox-specific source.
- `events/2022/02/sf-49ers-blackbyte.yaml` — cites FBI CU-000159-MW
  general BlackByte advisory; no 49ers-specific source.
- `events/2023/12/xerox-inc-ransom.yaml` (not directly read but
  identical pattern by ID/source-distribution).

Pattern looks like the agents had only umbrella advisories at hand,
needed to populate `sources:` to pass schema validation, and used
the nearest plausible primary as a stand-in. The corpus passes the
mechanical "source citation exists" check but fails the editorial
"the cited source documents this claim" intent.

### D4. Anachronistic attribution sources (MEDIUM, 2 cases)

- `events/2024/02/operation-phobos-aetor-8base.yaml` — event date
  Feb 8-12 2024; cites `doj/2024-11-12_ptitsyn-phobos-extradition`
  (Nov 2024) as primary attribution source. The Ptitsyn case is
  the upstream-administrator extradition, separately tracked. The
  Feb 2024 Phobos Aetor operation's primary sources should be the
  Royal Thai Police / Europol Feb 2024 statements.
- `events/2014/02/carbanak-bank-heists.yaml` — `attribution_date:
  2015-02-16` (the Kaspersky disclosure), but `attribution_source_id`
  is `doj/2018-08-01_fin7-three-indictments`. The Kaspersky 2015
  source exists at `sources/kaspersky/2015-02-16_carbanak-great-bank-robbery.yaml`
  (and is listed under the new sources here) — it should be the
  attribution_source. The 2018 DOJ source is appropriate as a
  follow-up citation but not for the 2015 attribution event.

### D5. Vendor-attribution confidence rating (LOW, ~6 cases)

User's prompt notes: vendor attribution → `moderate` usually;
explicit-naming-by-government → `high`. Several events claim `high`
confidence on what is single-vendor attribution:

- `events/2023/05/kroll-cactus-discovery.yaml` — Kroll vendor only,
  `attributing_org_confidence: high`.
- `events/2023/07/fin8-alphv-sardonic.yaml` — Bitdefender Labs only,
  `high`.
- `events/2023/09/3am-symantec-discovery.yaml` — Symantec only, `high`.
- `events/2023/10/hunters-international-bitdefender-disclosure.yaml`
  (not directly read but by pattern).
- `events/2017/08/cobalt-group-atm-jackpotting.yaml` — Group-IB
  only, `high`.
- `events/2020/11/ultrarank-disclosure.yaml` (by pattern).

For documentary discovery events (where the vendor *is* the
attestation) this may be defensible; for "victim X attributed to
cluster Y by vendor Z" it should usually be `moderate`. Worth a
review pass.

### D6. Boundary-case readings (REVIEW; conclusions hold)

- **AT&T Snowflake (2024-04/att-snowflake-shinyhunters)** — Sibling
  agent's reading holds. The operator profile (UNC5537 / ShinyHunters /
  Moucka) is cleanly criminal-financial: Moucka pleaded out, ransom
  paid on-chain, no IC reporting of state nexus. The event's
  summary explicitly frames it as a "boundary instance: high state-
  interest target with no state operator" — that is the correct
  doctrinal framing. **Keep in criminal-baseline.**
- **Ticketmaster ShinyHunters leak (2024-05/ticketmaster-shinyhunters-leak)**
  — Same logic. UNC5537 cluster boundary set by Mandiant Jun 10
  2024; no state attribution surfaced through 2024-25. **Keep in
  criminal-baseline.**
- **Change Healthcare RansomHub repost (2024-04/change-healthcare-ransomhub-repost)**
  — Timing distinction holds. The event's text explicitly says
  "the same dataset previously held by the ALPHV affiliate 'Notchy'
  after the February 2024 intrusion" — i.e. acknowledges ALPHV was
  the original intrusion operator and this April event covers only
  the RansomHub-brand re-extortion. The narrative is honest about
  the affiliate-portability question. The YAML does **not** claim
  RansomHub did the original intrusion. **Reading is correct;
  keep in criminal-baseline.** Note that the original 2024-02
  Change Healthcare ALPHV intrusion is presumably in `ru/proxies/`
  state corpus (not part of this audit).

### D7. Date ordering — generally clean

Date-ordering spot-check across the sample: all `start_date <=
disclosure_date <= end_date` except where flagged in D3
(Leicester filename month mismatch). British Airways event has
`end_date: 2018-09-05` < `disclosure_date: 2018-09-06` which is
internally consistent (skimmer stopped one day before BA's
public disclosure).

## Recommended actions (in priority order)

Per user instructions, NOTHING was changed in the atlas. These are
recommendations only.

1. **Fix `events/2024/02/autonation-hunters-international.yaml`**
   (D1) — either rename file + id to `hoya-hunters-international`,
   correct the `start_date` to 2024-03-30 (and move file to
   `events/2024/03/`), and set `targets:` accordingly using
   `orgs/hoya`; or completely rewrite the event to cover AutoNation
   if that was the intended subject. Most likely the agent meant
   Hoya throughout — the filename was an early-draft placeholder
   that was never updated. **Block retraining until resolved.**
2. **Fix Leicester filename / month** (D3 sub-bullet) — move to
   `events/2024/03/` and update id from `2024-01/...` to `2024-03/...`.
3. **Resolve empty-sources events** (D2) — either add the Reuters /
   AnyDesk-statement / equivalent primary sources to `sources/`, or
   remove the events. Keeping them with `sources: []` violates the
   atlas editorial norm even though it passes the validator.
4. **Address the proxy-source pattern** (D3) — for the ~13 affected
   events, either:
   a. Add SEC 8-K filings, victim press statements, or BleepingComputer
      / TheRecord journalism as victim-specific sources; or
   b. Add an explicit `notes:` field on every such event flagging
      the source as a placeholder (currently inconsistent — only
      Christie's, Yamaha, Court Services Victoria do this).
   The doctrine engine's training will treat these citations as
   authoritative; mislabeled provenance corrupts the abstain-class
   signal even though `doctrine_links: []` is correct.
5. **Fix anachronistic attribution sources** (D4) — Operation Phobos
   Aetor and Carbanak both have sources that postdate the events
   they attribute. The Carbanak fix is easy: the 2015 Kaspersky source
   is already in the new source corpus.
6. **Confidence-rating pass** (D5) — sweep the vendor-only attributions
   to `moderate` unless the event is itself the documentary disclosure
   event.
7. **No action needed** on the AT&T / Ticketmaster / Change Healthcare
   boundary cases — sibling-agent classification is sound.

## Audit method notes (for the next reviewer)

- All events touched in window `>= 2026-05-27T14:33:51Z` were
  in-scope. Read 21 events in full; spot-checked schema for the rest.
- URL verification: parallel `curl -A Mozilla` fetches with title
  extraction; DOJ URLs cross-checked via Wayback CDX (`web.archive.org/cdx/search/cdx`)
  rather than the availability endpoint, which returned empty for
  every modern justice.gov URL during this run.
- `pnpm run validate` from `/Users/kara/Documents/Projects/AUSPEX/site`
  reports clean.
- Sectors-FK check stripped the `sectors/` prefix before comparing
  against `atlas/sectors/sectors.yaml` (which stores bare ids).
