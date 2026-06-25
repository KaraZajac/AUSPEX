# Actor service-placement audit — consolidated report (June 2026)

*Generated 2026-06-25 (claude-opus-4.8/max). Companion to the per-batch git commits (`git log --grep "service-audit"`) and the DATASHEET "Actor-record service audit" bullet. This report is the reviewable roster; the per-actor evidence (verbatim source quotes, raw-snapshot SHA-256s) lives in each actor's `notes:` and each cited source's `AUDIT (…)` line.*

## What was audited, and the rule

Every actor placed at a specific service node — `<nation>/<service>/<slug>` (e.g. `cn/mss/apt40`, `ru/gru/sandworm`) — had that **service** placement re-verified against the actor's **own cited sources**, by independent LLM audit (Claude Opus 4.8, max effort). For each, the raw source was fetched, SHA-256-hashed, and read directly (not the curated prose).

**Decision rule.** KEEP the service placement **only if a cited source names the service** (MSS / GRU / SVR / IRGC / MOIS / RGB / NSA / GCHQ / CIA / TsNIIKhM / DarkMatter / MİT / …) — capture the verbatim quote. Otherwise **DEMOTE** to `<nation>/unscoped/<slug>` (nation nexus preserved, service withdrawn), aliasing the former id in `notes` and FK-propagating `actor_id` across referencing events. A **stable-slug** rule applies: demotion changes the service segment of the id, never the slug.

**The audit discriminates — it is not a blanket demotion.** Well-attributed state actors whose own sources name the service are kept; placements resting on inference, cluster-equivalence, or "nation-aligned" framing are demoted. The split is visible below: the same real-world family can land on opposite verdicts purely on what *its own record cites* (e.g. APT38 kept vs TraderTraitor demoted — both Lazarus/RGB in the literature, but only APT38's record cited an RGB-naming source).

## Results (current atlas state, provisional + curated passes combined)

| Outcome | Count |
|---|---|
| **Kept** at a named service (source-grounded) | 53 |
| **Demoted** to `<nation>/unscoped` (no cited source named the service) | 83 |
| **Re-homed** (wrong-service correction) | 1 — APT26 `cn/pla` → `cn/mss` |
| **Moved to `criminal/`** (profit-criminal, no state nexus) | 18 |

The curated sweep proper (8 batches + overflow, 2026-06-24/25) covered the ~114 *curated* service-placed actors: 67 demoted, 47 kept, 1 re-homed. An earlier provisional pass (2026-06-23/24) covered ~21 backfill stubs. The combined current-state roster follows.

## KEPT — service is source-named (53)

**China — MSS** (DOJ/Treasury indictments naming the provincial State Security bureau, or White House attribution):
- `cn/mss/apt40` (Hainan SSD, DOJ 2021), `cn/mss/apt31` (Hubei SSD / Wuhan XRZ front, DOJ+OFAC 2024), `cn/mss/apt10` (Tianjin SSB, DOJ 2018), `cn/mss/apt3` (Boyusec, DOJ/intrusiontruth), `cn/mss/apt41` (DOJ 2020), `cn/mss/hafnium` (White House 2021 "MSS"), `cn/mss/salt-typhoon` (OFAC 2025 — MSS tied to the Sichuan Juxinhe contractor), `cn/mss/apt26` (**re-homed from cn/pla** — CrowdStrike + DOJ name the MSS Jiangsu Bureau, not the PLA).

**China — PLA** (named unit):
- `cn/pla/apt1` (Unit 61398, Mandiant 2013 + DOJ 2014), `cn/pla/54th-ri-equifax` (54th Research Institute, DOJ 2020), `cn/pla/apt30` (Unit 78020 via the Naikon equivalence — caveat noted), `cn/pla/uat-7290` (PLA-SSF, re-homed earlier).

**Iran — IRGC / IRGC-IO** (OFAC/CISA/Mandiant naming the IRGC):
- `ir/irgc/emennet-pasargad` (OFAC: IRGC-EWCD), `ir/irgc/afkar-system` + `ir/irgc/najee-technology` (OFAC+CISA: "IRGC-affiliated companies"), `ir/irgc/apt35` (Microsoft: IRGC), `ir/irgc-io/apt42` (Mandiant: "on behalf of the IRGC-IO"), `ir/irgc-io/cyberav3ngers` (CISA+OFAC: IRGC — sub-org flag: sources name the IRGC-CEC, not the IO it's filed under).

**Iran — MOIS:**
- `ir/mois/muddywater` (CISA AA22-055A: "as part of … MOIS"), `ir/mois/apt39` + `ir/mois/rana-intelligence-computing` (OFAC+FBI: Rana = MOIS front), `ir/mois/homeland-justice` (OFAC: MOIS, Albania), `ir/mois/scarred-manticore` (Check Point: MOIS — the reference positive case), `ir/mois/apt34` (Lab Dookhtegan leak — WEAK keep, tertiary), `ir/mois/handala` (kept as a MOIS false-flag persona; MISP `country=PS` is the cover).

**North Korea — RGB** (OFAC 2019 / DOJ / Mandiant naming the Reconnaissance General Bureau):
- `kp/rgb/lazarus`, `kp/rgb/bluenoroff`, `kp/rgb/andariel`, `kp/rgb/apt38` (all OFAC 2019 "controlled by the RGB" by canonical name; APT38 also DOJ 2021 + CISA BeagleBoyz), `kp/rgb/kimsuky` (OFAC 2023 "subordinate to the RGB" + Mandiant), `kp/rgb/citrine-sleet` (Microsoft: "Bureau 121 of … the RGB" — sub-bureau corrected 3rd-bureau→bureau-121).

**Russia — GRU / SVR / TsNIIKhM:**
- `ru/svr/apt29` (White House/Treasury/CISA: "the SVR, also known as APT29"), `ru/tsniikhm/triton` (Treasury+DOJ: TsNIIKhM built the Triton tooling), `ru/gru/cadet-blizzard` (MSTIC: GRU; Five-Eyes AA24-249A: Unit 29155), `ru/gru/xaknet` (Mandiant: GRU/APT44 operators), `ru/gru/carr` (DOJ 2025: "founded, funded, and directed by the GRU" — sub-unit corrected 74455→parent).

**Russia — proxies** (documented state-nexus, `primary_service_id: null`):
- `ru/proxies/conti` (Treasury: "associated with Russian intelligence services" + safe-haven; ContiLeaks), `ru/proxies/lockbit` (OFAC: Russia "offers safe harbor … groups such as LockBit" — borderline, ecosystem-level), `ru/proxies/noname05716` (DOJ 2025: "state-sanctioned project … administered … by an IT organization established by order of the President of Russia"), `ru/proxies/danabot-operators` + `ru/proxies/winter-vivern` (kept earlier; winter-vivern RU/BY-contested per Kara).

**US / UK / IL** (attribution via the Snowden / Shadow-Brokers / Vault7 record + journalism, or declassified govt records):
- `us/nsa/equation-group` + `us/nsa/tao-sub-units` (Der Spiegel ANT catalog: "TAO … the NSA's top operative unit"; Pangu Lab "US NSA Equation Group"), `uk/gchq/regin-operators` + `uk/gchq/op-socialist-operators` (The Intercept/Der Spiegel via Snowden: GCHQ/Belgacom), `uk/gchq/cne-actor` (Guardian: GCHQ/Tempora — 6 Snowden programmes), `us/cia/longhorn-lamberts` (WikiLeaks Vault7 + Schulte conviction), `us/cybercom/cnmf-actor` (CNMF elevation + Nakasone: Hunt Forward Ukraine) + `us/cybercom/jtf-ares-actor` (NSArchive/NPR/DoD: Operation Glowing Symphony), `kr/nis/election-interference-cluster` (NIS named for the 2012 op; Won Sei-hoon convicted), `il/police-sigint/…` (kept earlier), `ae/darkmatter/karma-operators` + `ae/darkmatter/project-raven` (Reuters names DarkMatter — distinguished from the demoted stealth-falcon, where it was inference).

## DEMOTED — no cited source named the service (83 total; sweep highlights)

Grouped by the *former* service, with the pattern that justified demotion:

- **India NTRO** → `in/unscoped`: sidewinder, donot-team, patchwork — vendors said "suspected Indian" / linked the Innefu commercial vendor, never the NTRO.
- **Iran IRGC/MOIS** → `ir/unscoped`: apt33 (FireEye "the Iranian government"; confirms the event-audit flag), pioneer-kitten (CISA "Government of Iran"), cyber-toufan (Check Point "Iranian threat actor"; hacktivist front), + the earlier agrius (the reference negative case).
- **North Korea RGB** → `kp/unscoped`: tradertraitor (its own sources say only "Lazarus/APT38"; the RGB designation is on the *service* record, not the actor), h0lygh0st (Microsoft even hedges the state nexus), moonstone-sleet.
- **France DGSE** → `fr/unscoped`: animal-farm, casper-actor, snowglobe-actor — CSEC named only "a French intelligence agency"; nulled the per-event `fr/dgse/technical-directorate` overrides.
- **UAE DarkMatter** → `ae/unscoped`: stealth-falcon (Citizen Lab "circumstantial link to the UAE government"; DarkMatter founded after the activity began), beacon-red-operators (MIT-TR source was a 404/fabricated citation).
- **Pakistan ISI** → `pk/unscoped`: transparent-tribe (+20 events), sidecopy — "Pakistan-based" / "Pakistan-aligned", never the ISI.
- **Turkey MİT** → `tr/unscoped`: sea-turtle, promethium — "Turkey-based" / "government-sponsored", never the MİT (Citizen Lab calls StrongPity "unattributed").
- **Belarus KGB** → `by/unscoped` (+ nation flags): ghostwriter (Mandiant: Belarusian gov/military; Germany+EU attribute the influence side to Russia/GRU), uac-0050 (CERT-UA: "ties to Russian law enforcement").
- **Western operator stubs** → `<nation>/unscoped` + retire-candidate (per Kara, **kept as stubs, not deleted**): fr/comcyber, kr/coc, uk/ncf, us/cmf (force-structure; backs 5 events), kr/krcert (a defensive CERT — mis-modeled).

## MOVED to `criminal/` — profit-criminal, no documented state nexus (18)

Per Kara's "profit-criminal → criminal/" policy (Emotet precedent): the RaaS/botnet crews demoted because no cited source documented a Russian-state nexus (the `ru/proxies` bar) were re-homed to the stateless `criminal/` namespace (`id criminal/<slug>`, `primary_service_id: null`, nation prefix dropped):

> akira, alphv, black-basta, blackmatter, clop, darkside, hive, icedid, karakurt, medusa, play, qakbot, revil, rhysida, royal, snatch, trigona, vice-society

Their FBI/CISA/OFAC/Europol takedown + sanctions documents frame them as "RaaS" / "cybercriminals" / nationality-only; the FSB's REvil raid was *at US request* (the end of tolerance, not a nexus); State RfJ bounties are conditional "sought links," not attributions; MISP assigns them no state sponsor. **Conti + LockBit were kept at `ru/proxies`** (documented state-nexus / safe-harbor) and **killnet at `ru/unscoped`** (politically-aligned, not tasked).

## Flags & decisions

- **Retire-candidates → KEPT as `<nation>/unscoped` stubs** (Kara's decision 2026-06-25): fr/comcyber, kr/coc, uk/ncf, us/cmf, kr/krcert, ae/beacon-red. (kr/nso was retired earlier, by name.)
- **Sub-service corrections** (kept at the parent/sourced level): citrine-sleet 3rd-bureau→bureau-121; carr 74455→ru/gru; conti center-18→null; noname ru/gru→null (DOJ names CISM, not the GRU).
- **Source-integrity fixes applied**: junk `Gelsemium` misp_galaxy nulled on 3 unrelated actors; the CARR attribution in the ru/gru + ru/gru/74455 service files corrected (Treasury→DOJ Dec-2025; parent, not Unit 74455); alphv source mis-slug repaired (AA23-061A is Royal's; ALPHV's is AA23-353A).
- **Open question flagged for Kara**: us/cmf backs 5 real CYBERCOM events — keep as a generic `us/unscoped` fallback (current state) vs null those events' `actor_id` with CYBERCOM in `attributing_org`.

## Reproducibility

Every KEEP cites the verbatim service-naming quote in the actor's `notes`; every cited source carries `raw_snapshot` + `content_sha256` + an `AUDIT (2026-06-…, claude-opus-4.8/max)` line. Raw captures live in the gitignored `atlas/sources/raw/`. The gate (`make verify`) is green at every batch commit (schema conformance + atlas FK consistency + engine validator); 0 stale FKs after each.
