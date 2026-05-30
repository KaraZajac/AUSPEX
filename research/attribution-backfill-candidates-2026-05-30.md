# AUSPEX attribution-source candidates — 2026-05-30 (FOR REVIEW)

**70 candidates** kept across 11 doctrine-states + a non-state e-crime block, after dropping **2 in-batch cross-slice duplicates** (the re-listed Flax Typhoon MSTIC 2023-08-24 Taiwan disclosure and the re-listed Winter Vivern ESET Roundcube CVE-2023-5631 disclosure — each appeared twice with identical actor/date/URL). No candidate matched anything already in the corpus or the prior 55-candidate queue (`research/corpus-backfill-candidates-2026-05-30.md`).
**Leverage: 13 candidates give a *singleton* actor its 2nd corpus event** — Flax Typhoon, Storm-2603, Cadet Blizzard, Winter Vivern, APT15, APT37, Trigona, Cuba, BlackTech, APT17, BlackByte, Emotet, Moses Staff (verified at exactly 1 event each in `atlas/events/`); APT37 alone draws 3 new events. **39 candidates open a brand-new actor**, including two entirely new state slices — **Palestine (PS: Arid Viper, APT-C-23, Molerats)** and **Saudi Arabia-as-actor (SA: KINGDOM)**.
**Source / attributing-org mix:** 53 vendor-report, 12 tracker (all CFR Cyber Operations Tracker), 5 news. Confidence as fetched (un-upgraded): ~52 strongly_inferred, 16 attested, 2 plausible. Attributing orgs led by CFR (12), Microsoft/MSTIC (9), ESET (6) and CrowdStrike (6), then Google/GTIG/Mandiant, Cisco Talos, Secureworks/Sophos, Dragos, Palo Alto Unit 42, SentinelLABS, Recorded Future, Volexity, Check Point, Proofpoint, Kaspersky, Seqrite, TG Soft, a Five-Eyes+Japan joint advisory, France/VIGINUM, and the ROK National Office of Investigation.

> Legend: ⟢ singleton→2nd · ⟢ NEW actor in slice · ⟢ NEW state slice · ⟢ thin-state. Confidence shown is the **fetched** vendor/agency posture, carried through un-upgraded.

---

## AE — UAE  (THIN STATE)
*3 candidates — all NEW actors. Existing AE actors: project-raven, karma-operators, stealth-falcon, beacon-red-operators.*

- **[2021-12] UAE targeting of Jamal Khashoggi's widow Hanan Elatr with NSO Pegasus** — actor (NEW; United Arab Emirates per CFR) — `surveillance/espionage` — strongly_inferred  —  ⟢ NEW actor in slice · ⟢ thin-state
  attributed by: CFR Cyber Operations Tracker (citing The Washington Post / The Verge) · source: https://www.cfr.org/cyber-operations/targeting-of-jamal-khashoggis-wife-hanan-elatr (tracker)
  "The widow of Saudi dissident Jamal Khashoggi … was targeted by the NSO Group's Pegasus malware at the request of the United Arab Emirates."   summary: Hanan Elatr targeted with Pegasus at UAE request (Dec 2021). Distinct from Great iPwn / Princess Haya / Ahmed Mansoor and from the prior queue's Abu Dhabi Secrets item.

- **[2015-01] UAE interception of Qatari royal family and Michelle Obama emails via CyberPoint** — actor (NEW; UAE via CyberPoint contractors, Project Raven predecessor) — `espionage/intrusion/surveillance` — strongly_inferred  —  ⟢ NEW actor in slice · ⟢ thin-state
  attributed by: CFR Cyber Operations Tracker (citing The New York Times / The New Yorker) · source: https://www.cfr.org/cyber-operations/targeting-of-qatari-royal-family (tracker)
  "The United Arab Emirates, using hackers contracted through CyberPoint, intercepted emails between former First Lady Michelle Obama and Her Highness Sheikha Moza bint Nasser of Qatar."   summary: 2015 operation (reported Feb 2021); the CyberPoint contractor model preceding DarkMatter/Project Raven. Distinct from the inventory's 2014 Project Raven and 2016 Karma.

- **[2019-12] ToTok messaging app exposed as a UAE government mass-surveillance tool** — actor (NEW; Emirati government, ToTok / DarkMatter-linked) — `surveillance/bulk-collection` — strongly_inferred  —  ⟢ NEW actor in slice · ⟢ thin-state
  attributed by: CFR Cyber Operations Tracker (citing The New York Times) · source: https://www.cfr.org/cyber-operations/surveillance-of-individuals-in-the-united-arab-emirates-uae-and-globally (tracker)
  "ToTok, a popular Emirati messaging app, was revealed to be a mass surveillance tool used by the Emirati government."   summary: A bulk-collection vector absent from the AE inventory; tracks conversations, movements and relationships in the UAE and globally.

## AE — UAE — existing actor (not singleton)
- **[2023-09-22] Stealth Falcon (UAE) Deadglyph backdoor espionage against a Middle East government entity** — Stealth Falcon (`ae/darkmatter/stealth-falcon`) — `espionage/intrusion/surveillance` — strongly_inferred  —  ⟢ thin-state
  attributed by: ESET Research · source: https://www.welivesecurity.com/en/eset-research/stealth-falcon-preying-middle-eastern-skies-deadglyph/ (vendor-report)
  "we attribute Deadglyph with high confidence to the Stealth Falcon APT group … linked to the United Arab Emirates according to MITRE."   summary: Mideast government victim + related Qatar sample. Malware→actor high-confidence; UAE-state nexus via MITRE → strongly_inferred. (Stealth Falcon already has 5 corpus events.)

---

## IL — Israel  (THIN STATE)
*4 candidates — all NEW actors. Existing IL actors: predatory-sparrow, nso-group, candiru, paragon.*

- **[2020-05] Israel destructive cyberattack disrupting Iran's Shahid Rajaee Port** — actor (NEW; Israeli state cyber operator) — `cyber-physical/disruption/destructive` — strongly_inferred  —  ⟢ NEW actor in slice · ⟢ thin-state
  attributed by: CFR Cyber Operations Tracker (citing The Washington Post and Israeli/regional press) · source: https://www.cfr.org/cyber-operations/disruption-of-operations-at-shahid-rajaee-port (tracker)
  "Israel retaliated against Iran … by launching a cyberattack against Iran's Shahid Rajaee Port, disrupting its operations."   summary: May 2020 retaliation for the attempted poisoning of Israeli water facilities; counterpart to the existing Iranian water-utility entry. Distinct from Predatory Sparrow / Stuxnet / Grim Beeper / Mossad-raid.

- **[2015-06] Duqu 2.0 espionage against P5+1 Iran-nuclear-negotiation venues (Israel-linked)** — actor (NEW; Duqu 2.0 operators, Kaspersky-disclosed) — `espionage/surveillance/intrusion` — strongly_inferred  —  ⟢ NEW actor in slice · ⟢ thin-state
  attributed by: CFR Cyber Operations Tracker (citing Kaspersky Lab and The Wall Street Journal) · source: https://www.cfr.org/cyber-operations/duqu-2-0 (tracker)
  "A threat actor, using a tool dubbed Duqu 2.0, targeted individuals and companies linked to the P5+1 … conducting negotiations on Iran's nuclear program."   summary: NOT the US inventory's 2011 Duqu toolkit — different year, different campaign (P5+1 hotels + Kaspersky itself), CFR attributes to Israel (page cites WSJ "Spy Virus Linked to Israel").

- **[2022-01] Israeli police signals-intelligence unit domestic Pegasus surveillance of local officials** — actor (NEW; Israel Police SIGINT unit) — `surveillance/espionage` — strongly_inferred  —  ⟢ NEW actor in slice · ⟢ thin-state
  attributed by: CFR Cyber Operations Tracker (citing Calcalist) · source: https://www.cfr.org/cyber-operations/targeting-of-local-israeli-officials (tracker)
  "The signals intelligence unit of the Israeli police is suspected of using Pegasus spyware to surveil local officials and their families in Israel."   summary: A domestic warrantless-surveillance event absent from the IL inventory.

- **[2017-10] Israel compromise of Kaspersky Lab leading to NSA-contractor tip-off** — actor (NEW; Israeli government CNE) — `intrusion/espionage` — strongly_inferred  —  ⟢ NEW actor in slice · ⟢ thin-state
  attributed by: CFR Cyber Operations Tracker (citing The New York Times and The Washington Post) · source: https://www.cfr.org/cyber-operations/compromise-of-kaspersky-labs (tracker)
  "A threat actor, believed to be the Israeli government, compromised Kaspersky Labs, a Russia-based cybersecurity company."   summary: Israeli counterintelligence/CNE against a third-country vendor — observing Russian searches of Kaspersky telemetry for NSA tooling, then tipping off US officials.

---

## PS — Palestine  (NEW STATE SLICE)
*3 candidates — all NEW actors. No PS slice or actor directory in the inventory; CFR lists "Palestine, State of" as suspected sponsor for all three. Highest-leverage block: opens a state with three named actors.*

- **[2022-04] APT-C-23 'Operation Bearded Barbie' catfishing/espionage against Israeli defense and law-enforcement officials** — actor (NEW; APT-C-23, Hamas cyberwarfare division) — `espionage/surveillance/intrusion` — strongly_inferred  —  ⟢ NEW state slice
  attributed by: CFR Cyber Operations Tracker (citing Cybereason 'Operation Bearded Barbie' and Bloomberg) · source: https://www.cfr.org/cyber-operations/targeting-of-israeli-officials (tracker)
  "Hamas-linked actor APT-C-23 targeted Israelis with an espionage campaign to exfiltrate sensitive information from individuals working in law enforcement, the military, and emergency services."   summary: Fabricated personas social-engineering Israeli defense/LE/emergency-services officials; Windows + Android implants. (Underlying Cybereason confidence moderate-high.)

- **[2023-10] Arid Viper trojanized 'Skipped' Arabic dating-app spyware campaign** — actor (NEW; Arid Viper, Gaza-based APT) — `surveillance/espionage/intrusion` — strongly_inferred  —  ⟢ NEW state slice
  attributed by: CFR Cyber Operations Tracker (citing Cisco Talos) · source: https://www.cfr.org/cyber-operations/targeting-of-users-of-an-arabic-dating-app (tracker)
  "Arid Viper, a threat actor believed to operate from the Palestinian Territories, created a compromised version of the Arabic dating app Skipped and distributed it online."   summary: Trojanized clone of the "Skipped" app delivering Android spyware (Oct 2023).

- **[2022-02] Molerats spear-phishing of Middle Eastern governments, think tanks, and a state airline** — actor (NEW; Molerats / TA402 / Gaza Cybergang) — `espionage/intrusion` — strongly_inferred  —  ⟢ NEW state slice
  attributed by: CFR Cyber Operations Tracker (citing Proofpoint) · source: https://www.cfr.org/cyber-operations/targeting-of-middle-eastern-governments-foreign-policy-think-tanks-and-a-state-affiliated-airline (tracker)
  "The Palestinian threat actor Molerats targeted Middle Eastern governments, foreign policy think tanks, and a state-affiliated airline with spear-phishing emails containing a remote access Trojan."   summary: Geofenced RAT delivery (Feb 2022). Third distinct PS actor.

---

## SA — Saudi Arabia  (NEW STATE SLICE)
*1 candidate — NEW actor. Saudi Arabia appears in the inventory only as a victim; this opens Saudi-as-actor.*

- **[2018-10] KINGDOM Pegasus targeting of dissident Omar Abdulaziz in Canada** — actor (NEW; KINGDOM, Saudi-linked Pegasus operator) — `surveillance/espionage` — strongly_inferred  —  ⟢ NEW state slice
  attributed by: CFR Cyber Operations Tracker (citing Citizen Lab) · source: https://www.cfr.org/cyber-operations/targeting-of-omar-abdulaziz (tracker)
  "A threat actor targeted the iPhone of Omar Abdulaziz, a critic of the Kingdom of Saudi Arabia living in Canada … The threat actor uses the Pegasus tool, created by the NSO Group."   summary: Targeting of a Khashoggi associate in Canada; Citizen Lab's KINGDOM operator, CFR sponsor = Saudi Arabia.

---

## KR — South Korea  (THIN STATE)
*1 candidate — NEW actor. KR is the thinnest slice (6 doctrine/meta events, zero operational).*

- **[2020-03] DarkHotel five-zero-day campaign targeting North Koreans and NK-focused professionals (South Korea-linked)** — actor (NEW; DarkHotel) — `espionage/surveillance/intrusion` — plausible  —  ⟢ NEW actor in slice · ⟢ thin-state
  attributed by: CFR Cyber Operations Tracker (citing Wired and Google Threat Analysis Group) · source: https://www.cfr.org/cyber-operations/targeting-of-north-koreans-and-north-korea-focused-professionals (tracker)
  "DarkHotel, a South Korea–linked threat actor, used five zero-days in a single campaign targeting North Koreans, demonstrating an unusual level of sophistication."   summary: First operational candidate for KR-as-actor. **plausible** — the underlying Google TAG report names no state; CFR carries the "South Korea-linked" framing. Scope the corpus event to the NK targeting (the WHO-phishing element is not on this CFR page).

---

## PK — Pakistan  (THIN STATE)
- **[2024-07-01] Transparent Tribe (APT36) 'CapraTube Remix' — CapraRAT Android spyware in gamer/weapons/TikTok lure apps** — Transparent Tribe (`pk/isi/transparent-tribe`) — `surveillance/espionage/intrusion` — strongly_inferred  —  ⟢ thin-state
  attributed by: SentinelLABS (SentinelOne) · source: https://www.sentinelone.com/labs/capratube-remix-transparent-tribes-android-spyware-targeting-gamers-weapons-enthusiasts/ (vendor-report)
  "[four new CapraRAT APKs attributed to] Transparent Tribe (APT36 / Operation C-Major) … the July 2024 CapraTube Remix wave."   summary: Distinct from the 2022 CapraRAT entries and 2024-04 ElizaRAT; not among the prior-queue PK items. (TT already has 17 corpus events.)

---

## IN — India  (THIN STATE)
- **[2024-07] SideWinder H2-2024 toolset update and pivot to nuclear-energy and maritime/port targets across South Asia, the Middle East and Africa** — SideWinder (`in/ntro/sidewinder`) — `espionage/intrusion/reconnaissance` — strongly_inferred  —  ⟢ thin-state
  attributed by: Kaspersky GReAT · source: https://securelist.com/sidewinder-apt-updates-its-toolset-and-targets-nuclear-sector/115847/ (vendor-report)
  "we observed other attacks that indicated a specific interest in nuclear power plants and nuclear energy in South Asia."   summary: Toolset refresh + maritime/port and Djibouti/Egypt/Africa expansion. Securelist names SideWinder but not a national origin; India is the established mapping → strongly_inferred. Distinct from 2024-01 StealerBot and 2025-04 Pahalgam. (SideWinder has 11 corpus events.)

---

## FR — France  (THIN STATE)
- **[2025-05-06] France (VIGINUM/SGDSN + Ministry for Europe and Foreign Affairs) publicly attributes the Storm-1516 information-manipulation campaign to Russia** — actor (NEW; Storm-1516) — `influence-operation/attribution-publication` — attested  —  ⟢ NEW actor in slice · ⟢ thin-state
  attributed by: France — Ministry for Europe and Foreign Affairs + VIGINUM / SGDSN · source: https://warontherocks.com/2025/07/calling-out-russia-frances-shift-on-public-attribution/ (news)
  "[VIGINUM] described the group [Storm-1516] as operating from Russia, with ties to the Kremlin."   summary: New actor in the thin FR slice; distinct from Portal Kombat / RRN-Doppelganger / Matriochka. CAVEATS: actor-state RU vs reporting-state FR (decide filing); re-pull the SGDSN/VIGINUM PDF (`20250507 Technical report Storm-1516`) as primary; confirm new-slug vs the existing Doppelganger/RRN actor.

---

## CN — China — SINGLETON FILLS
*Highest-leverage CN block. Flax Typhoon, Storm-2603, BlackTech, APT15 and APT17 each have exactly 1 corpus event today.*

- **[2023-08-24] MSTIC outs Flax Typhoon — China-based living-off-the-land espionage against Taiwanese organizations** — Flax Typhoon (`cn/mss/flax-typhoon`) — `intrusion/espionage/pre-positioning` — attested  —  ⟢ singleton→2nd event
  attributed by: Microsoft Threat Intelligence (MSTIC) · source: https://www.microsoft.com/en-us/security/blog/2023/08/24/flax-typhoon-using-legitimate-software-to-quietly-access-taiwanese-organizations/ (vendor-report)
  "Microsoft attributes this campaign to Flax Typhoon (overlaps with ETHEREAL PANDA), a nation-state actor based out of China."   summary: The canonical Aug-2023 Taiwan-espionage disclosure (China Chopper, SoftEther VPN bridge, minimal-malware LotL). Distinct from the 2024 Raptor Train takedown, 2025 OFAC/Integrity Tech and 2022 botnet entries. *(An in-batch duplicate of this exact event was dropped.)*

- **[2024-06-24] RedJuliett (Flax Typhoon) network-perimeter exploitation against 75+ Taiwanese organizations** — Flax Typhoon (`cn/mss/flax-typhoon`) — `espionage/intrusion/reconnaissance/data-theft` — strongly_inferred  —  ⟢ singleton→2nd event (2nd Flax Typhoon candidate this batch)
  attributed by: Recorded Future (Insikt Group) · source: https://www.recordedfuture.com/research/redjuliett-intensifies-taiwanese-cyber-espionage-via-network-perimeter (vendor-report)
  "[RedJuliett] closely overlaps with public reporting under the aliases Flax Typhoon and Ethereal Panda."   summary: Nov-2023→Apr-2024 perimeter-appliance exploitation; "a likely Chinese state-sponsored group."

- **[2025-07-22] MSTIC ties Storm-2603 to ransomware (Warlock/LockBit) deployment via SharePoint ToolShell exploitation** — Storm-2603 (`cn/mss/storm-2603`) — `intrusion/ransomware/extortion` — strongly_inferred  —  ⟢ singleton→2nd event
  attributed by: Microsoft Threat Intelligence (MSTIC) · source: https://www.microsoft.com/en-us/security/blog/2025/07/22/disrupting-active-exploitation-of-on-premises-sharepoint-vulnerabilities/ (vendor-report)
  "The group that Microsoft tracks as Storm-2603 is assessed with moderate confidence to be a China-based threat actor."   summary: Ransomware via ToolShell from 18 Jul 2025; GPO distribution of Warlock; prior Warlock+LockBit. CAVEAT: page attributes EDR-disabling to direct registry modifications, NOT BYOVD — drop/soften that detail. Distinct from the corpus 2025-07-07 multi-actor ToolShell entry [APT27/APT31/Storm-2603].

- **[2023-09-27] BlackTech (PRC) Cisco-router firmware-backdoor campaign — NSA/FBI/CISA + Japan NPA/NISC joint advisory (AA23-270A)** — BlackTech (`cn/mss/blacktech`) — `intrusion/espionage/pre-positioning` — attested  —  ⟢ singleton→2nd event
  attributed by: NSA, FBI, CISA, Japan NPA, Japan NISC · source: https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-csa-cyber-report-sept-2023 (vendor-report)
  "[joint advisory names] cyber actors known as BlackTech [as] People's Republic of China-Linked Cyber Actors [hiding] in Router Firmware."   summary: 2nd BlackTech event (corpus has only 2019 PLEAD/ASUS). Cisco page is thin on the TTP detail — intake may prefer AA23-270A as primary.

- **[2024-04] BlackTech / Earth Hundun 2024 Waterbear→Deuterbear espionage against Asia-Pacific tech, research and government** — BlackTech (`cn/mss/blacktech`) — `espionage/intrusion` — strongly_inferred  —  ⟢ singleton→2nd event (2nd BlackTech candidate this batch)
  attributed by: Trend Micro (actor/campaign naming); PRC nexus via the 2023 CISA/NSA/FBI + Japan NISC/NPA joint advisory · source: https://thehackernews.com/2024/04/blacktech-targets-tech-research-and-gov.html (news)
  "Technology, research, and government sectors in the Asia-Pacific region have been targeted by a threat actor called BlackTech … Trend Micro is tracking the threat actor under the moniker Earth Hundun."   summary: Distinct campaign-level event; China-nexus rests on the separate govt advisory → strongly_inferred.

- **[2025-04-28] PurpleHaze (APT15-linked) reconnaissance and ShadowPad/GoReShell intrusions against SentinelOne and 70+ orgs** — APT15 (`cn/mss/apt15`) — `reconnaissance/intrusion/espionage/data-theft` — strongly_inferred  —  ⟢ singleton→2nd event
  attributed by: SentinelLABS (SentinelOne) · source: https://www.sentinelone.com/labs/top-tier-target-what-it-takes-to-defend-a-cybersecurity-company-from-todays-adversaries/ (vendor-report)
  "[we assess] with high confidence that PurpleHaze is a China-nexus actor, loosely linking it to APT15."   summary: 2nd APT15 event (corpus has only 2015 Ke3chang Okrum). The prior-queue BADBAZAAR/APT15 item is a different advisory.

- **[2024-07-02] APT17 (PRC) 9002 RAT espionage against Italian government agencies and companies (fake Skype for Business installer)** — APT17 (`cn/mss/apt17`) — `intrusion/espionage` — strongly_inferred  —  ⟢ singleton→2nd event
  attributed by: TG Soft (CERT-Yoroi / C.R.A.M.) · source: https://www.tgsoft.it/news/news_archivio.asp?id=1557 (vendor-report)
  "a Chinese cyber actor … associated with the APT17 group also known as DeputyDog."   summary: 24 Jun + 2 Jul 2024 attacks on Italian targets; 9002 RAT diskless via a spoofed Equitalia-Giustizia Skype installer. 2nd APT17 event (corpus has only 2009 Operation Aurora). Single-vendor PRC assessment → strongly_inferred.

## CN — China — NEW actors
*16 candidates opening 15 new China-nexus actors (Evasive Panda gets two events). All absent from the CN inventory and prior queue.*

- **[2026-02-25] GTIG/Mandiant disrupt GRIDTIDE — UNC2814 PRC-nexus global espionage (telecom & government, 42 countries)** — actor (NEW; UNC2814 / GRIDTIDE) — `espionage/intrusion/data-theft/disruption` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: GTIG / Mandiant · source: https://cloud.google.com/blog/topics/threat-intelligence/disrupting-gridtide-global-espionage-campaign (vendor-report)
  "The threat actor, UNC2814, is a suspected People's Republic of China (PRC)-nexus cyber espionage group that GTIG has tracked since 2017."   summary: 53 victim intrusions across 42 countries (+20 suspected); disruption via terminating attacker Cloud Projects + revoking Sheets API.

- **[2025-03-11] Mandiant attributes Juniper Junos OS router backdoors (TINYSHELL) to China-nexus UNC3886** — actor (NEW; UNC3886) — `espionage/intrusion/pre-positioning` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: Mandiant / GTIG · source: https://cloud.google.com/blog/topics/threat-intelligence/china-nexus-espionage-targets-juniper-routers (vendor-report)
  "Mandiant attributed these backdoors to the China-nexus espionage group, UNC3886."   summary: Six TINYSHELL backdoors on Junos OS routers + veriexec bypass; router pre-positioning. Distinct from UNC5221/BRICKSTORM and the Typhoon clusters.

- **[2024-11-19] LIMINAL PANDA — multi-year China-nexus espionage against global telecom networks (custom GSM/SIGTRAN tooling)** — actor (NEW; LIMINAL PANDA) — `espionage/intrusion/data-theft/surveillance` — plausible  —  ⟢ NEW actor in slice
  attributed by: CrowdStrike (Counter Adversary Operations) · source: https://www.crowdstrike.com/en-us/blog/liminal-panda-telecom-sector-threats/ (vendor-report)
  "[China-nexus assessment stated at LOW confidence]"   summary: Telecom intrusions since 2020; SIGTRANslator/CordScan/PingPong; S.Asia/Africa. CrowdStrike's own LOW-confidence China-nexus supports ICD-203 **plausible**.

- **[2025-08-04] GLACIAL PANDA — China-nexus telecom intrusions harvesting call-detail records** — actor (NEW; GLACIAL PANDA) — `espionage/intrusion/data-theft/surveillance` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: CrowdStrike (OverWatch / CAO) · source: https://www.crowdstrike.com/en-us/blog/crowdstrike-2025-threat-hunting-report-ai-weapon-target/ (vendor-report)
  "GLACIAL PANDA [named as] a China-nexus adversary [in] telecom networks."   summary: CAVEAT — the cited THR-2025 page supports actor + China-nexus + telecom but NOT the ShieldSlide/trojanized-OpenSSH/CDR TTP specifics; source separately.

- **[2025-08-04] GENESIS PANDA — China-nexus cloud-conscious initial-access broker (finance/media/telecom/tech, 11 countries)** — actor (NEW; GENESIS PANDA; overlaps Earth Lamia) — `intrusion/espionage/reconnaissance/data-theft` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: CrowdStrike (OverWatch / CAO) · source: https://www.crowdstrike.com/en-us/blog/crowdstrike-2025-threat-hunting-report-ai-weapon-target/ (vendor-report)
  "GENESIS PANDA [named as] a suspected cloud-conscious China-nexus adversary."   summary: CAVEAT — same THR-2025 page; supports actor + suspected China-nexus + cloud but NOT the 11-countries / IMDS / Earth-Lamia specifics. (Shares its URL with GLACIAL PANDA but is a distinct new actor.)

- **[2025-12-04] WARP PANDA — China-nexus espionage against US legal/tech/manufacturing using BRICKSTORM and ESXi implants** — actor (NEW; WARP PANDA) — `espionage/intrusion/data-theft/reconnaissance` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: CrowdStrike (Counter Adversary Operations) · source: https://www.crowdstrike.com/en-us/blog/warp-panda-cloud-threats/ (vendor-report)
  "[newly-identified China-nexus actor WARP PANDA] … [PRC strategic-interests intel-collection motive stated verbatim]."   summary: BRICKSTORM/Junction/GuestConduit/JSP shells. Distinct from the corpus 2024-04 UNC5221 BRICKSTORM entries (this page does not mention UNC5221); reviewer decides alias-vs-distinct on shared tooling.

- **[2024-04-04] MSTIC names Raspberry Typhoon (RADIUM) — China-based military/maritime espionage around the South China Sea** — actor (NEW; Raspberry Typhoon) — `intrusion/espionage/reconnaissance` — attested  —  ⟢ NEW actor in slice
  attributed by: Microsoft Threat Intelligence (MSTIC) · source: https://www.microsoft.com/en-us/security/security-insider/threat-landscape/east-asia-threat-actors-employ-unique-methods (vendor-report)
  "In June 2023, Raspberry Typhoon, a nation-state activity group based out of China, successfully targeted military and executive entities in Indonesia and a Malaysian maritime system…"   summary: South China Sea targeting ahead of an Indonesia-China-US naval exercise. Distinct from Volt/Salt/Flax/Hafnium-Silk.

- **[2024-10-28] Evasive Panda CloudScout toolset steals Taiwanese government and religious cloud data via session-cookie theft** — actor (NEW; Evasive Panda / Daggerfly / Bronze Highland / StormBamboo) — `espionage/intrusion/data-theft/surveillance` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: ESET · source: https://www.eset.com/us/about/newsroom/research/eset-discovers-cloudscout-china-aligned-evasive-panda-targets-taiwan-and-data-stored-in-the-cloud/ (vendor-report)
  "[CloudScout attributed to] Evasive Panda, a China-aligned APT group, operating since at least 2012."   summary: Session-cookie theft to bypass 2FA, harvesting Google Drive/Gmail/Outlook via MgBot; Taiwanese religious institution (May 2022) + suspected govt entity (Feb 2023). **Same actor as the StormBamboo candidate below — one new actor, two distinct events.**

- **[2024-08-02] StormBamboo (Evasive Panda / Daggerfly) compromises an ISP to poison software-update DNS and deploy MACMA / MGBot** — actor (NEW; Evasive Panda / Daggerfly / StormBamboo / StormCloud) — `supply-chain/intrusion/espionage` — strongly_inferred  —  ⟢ NEW actor in slice (2nd event, same new actor)
  attributed by: Volexity (names StormBamboo = Evasive Panda); PRC-nexus is the established community attribution · source: https://www.volexity.com/blog/2024/08/02/stormbamboo-compromises-isp-to-abuse-insecure-software-update-mechanisms/ (vendor-report)
  "In mid-2023, Volexity detected and responded to multiple incidents involving systems becoming infected with malware linked to StormBamboo (aka Evasive Panda, and previously tracked … under \"StormCloud\")."   summary: ISP-level DNS poisoning of insecure auto-updates; MACMA (macOS) + POCOSTICK/MGBot; attacker host in Hong Kong. China appears only as a tag → strongly_inferred.

- **[2024-07-16] RedNovember (TAG-100) global Pantegana/Cobalt Strike espionage against government, defense and technology orgs** — actor (NEW; RedNovember / TAG-100) — `espionage/intrusion/reconnaissance/data-theft` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: Recorded Future (Insikt Group) · source: https://www.recordedfuture.com/research/rednovember-targets-government-defense-and-technology-organizations (vendor-report)
  "TAG-100 is highly likely a Chinese state-sponsored threat activity group."   summary: Perimeter-appliance exploitation across US/Taiwan/South Korea/Panama/Fiji; Pantegana, Cobalt Strike, SparkRAT, LESLIELOADER. Minor victimology wording (Fiji vs Panama counts) to reconcile at intake.

- **[2025-03-20] Operation FishMedley — FishMonger (I-SOON) global espionage against governments, NGOs and think tanks** — actor (NEW; FishMonger / Earth Lusca / Aquatic Panda / TAG-22; Winnti umbrella) — `espionage/intrusion/data-theft` — attested  —  ⟢ NEW actor in slice
  attributed by: ESET · source: https://www.welivesecurity.com/en/eset-research/operation-fishmedley/ (vendor-report)
  "[ESET assesses] with high confidence that Operation FishMedley was conducted by the FishMonger APT group [and independently determined FishMonger is operated by I-SOON]."   summary: Seven victims; ShadowPad/Spyder/SodaMaster/RPipeCommander. DISTINCT from the corpus i-Soon doc-leak (APT41) and the prior-queue DOJ i-Soon indictment (APT27). QUOTE CAVEAT: supporting_quote is a paraphrase — correct to ESET's exact wording.

- **[2025-02] Cisco Talos attributes 2025 Sagerunex espionage to Lotus Blossom (Billbug / Thrip / Spring Dragon)** — actor (NEW; Lotus Blossom) — `espionage/intrusion/data-theft` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: Cisco Talos · source: https://blog.talosintelligence.com/lotus-blossom-espionage-group/ (vendor-report)
  "Talos assesses with high confidence that Lotus Blossom (also referred to as Spring Dragon, Billbug, Thrip) threat actors are responsible for these campaigns."   summary: Sagerunex backdoor (Dropbox/Twitter/Zimbra C2); Philippines/Vietnam/Hong Kong/Taiwan. No in-text sponsor → strongly_inferred for the CN nexus. Distinct from Naikon/APT30 and BlackTech.

- **[2026-01] Cisco Talos discloses UAT-7290 China-nexus espionage against South Asian telecom (Red Foxtrot / PLA Unit 69010 overlap)** — actor (NEW; UAT-7290) — `espionage/intrusion/reconnaissance/pre-positioning` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: Cisco Talos · source: https://blog.talosintelligence.com/uat-7290/ (vendor-report)
  "Talos assesses with high confidence that UAT-7290 is a sophisticated threat actor falling under the China-nexus of Advanced Persistent Threat actors (APTs)."   summary: Red Foxtrot overlap (RF→PLA Unit 69010 per Recorded Future 2021); RushDrop/DriveSwitch/SilentRaid + Bulbature ORB tooling.

- **[2026-05] Cisco Talos discloses UAT-8302 China-nexus espionage against South American and Southeastern European governments** — actor (NEW; UAT-8302) — `espionage/intrusion/reconnaissance` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: Cisco Talos · source: https://blog.talosintelligence.com/uat-8302/ (vendor-report)
  "Talos assesses with high confidence that UAT-8302 is a China-nexus advanced persistent threat (APT) group…"   summary: NetDraft/CloudSorcerer v3/SNAPPYBEE/DeedRAT/ZingDoor/VSHELL/SNOWLIGHT; South America (since late 2024) + SE Europe (2025). Extends PRC coverage into Latin America.

- **[2025-01] Unit 42 discloses CL-STA-0048 China-origin espionage against South Asian telecom and government (PlugX; DragonRank overlap)** — actor (NEW; CL-STA-0048) — `espionage/intrusion/data-theft` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: Palo Alto Networks Unit 42 · source: https://unit42.paloaltonetworks.com/espionage-campaign-targets-south-asian-entities/ (vendor-report)
  "we assess with moderate-high confidence that this activity originates in China."   summary: South Asian telecom + government-employee-data; PlugX primary backdoor; overlaps-but-distinct-from DragonRank.

- **[2026-02] Unit 42 discloses TGR-STA-1030 (UNC6619) state-aligned global government espionage across 37 countries (Shadow Campaigns)** — actor (NEW; TGR-STA-1030 / UNC6619) — `espionage/intrusion/data-theft/reconnaissance` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: Palo Alto Networks Unit 42 · source: https://unit42.paloaltonetworks.com/shadow-campaigns-uncovering-global-espionage/ (vendor-report)
  "We assess with high confidence that TGR-STA-1030 is a state-aligned group that operates out of Asia."   summary: ~37-country government targeting, GMT+8, DiaoYu.exe + 'JackMa' artifacts. STATE CAVEAT: Unit 42 says "out of Asia," not China — keep state at strongly_inferred and preserve the hedge.

## CN — China — existing actors (not singleton) + 1 state-unattributed new actor
- **[2025-08-25] GTIG discloses UNC6384 (Mustang Panda-linked) adversary-in-the-middle captive-portal campaign against Southeast Asian diplomats (SOGU.SEC/PlugX)** — Mustang Panda (`cn/mss/mustang-panda`) — `espionage/intrusion/surveillance` — strongly_inferred
  attributed by: GTIG · source: https://cloud.google.com/blog/topics/threat-intelligence/prc-nexus-espionage-targets-diplomats (vendor-report)
  "GTIG attributes this campaign to UNC6384, a PRC-nexus cyber espionage group believed to be associated with … TEMP.Hex (also known as Mustang Panda)."   summary: AitM captive-portal; STATICPLUGIN→CANONSTAGER→SOGU.SEC(PlugX). Maps to Mustang Panda (9 events); distinct Aug-2025 op.

- **[2025-08-21] MURKY PANDA — China-nexus trusted-relationship cloud/SaaS compromise (Silk Typhoon-aligned) for downstream email espionage** — Hafnium / Silk Typhoon (`cn/mss/hafnium`) — `espionage/intrusion/data-theft/supply-chain` — strongly_inferred
  attributed by: CrowdStrike (Counter Adversary Operations) · source: https://www.crowdstrike.com/en-us/blog/murky-panda-trusted-relationship-threat-in-cloud/ (vendor-report)
  "[MURKY PANDA activity] aligns with … Silk Typhoon [and is] likely driven by intelligence-collection objectives."   summary: Neo-reGeorg/CloudedHope/Entra-ID-secret/CVE-2023-3519. Maps to Silk Typhoon (corpus = ProxyLogon 2021, BeyondTrust 2024-12); distinct 2025 cloud-supply-chain event.

- **[2024-04] Cisco Talos discloses ArcaneDoor (UAT4356 / STORM-1849) state-sponsored espionage via Cisco ASA zero-days** — actor (NEW; UAT4356 / STORM-1849) — `intrusion/espionage/reconnaissance` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: Cisco Talos · source: https://blog.talosintelligence.com/arcanedoor-new-espionage-focused-campaign-found-targeting-perimeter-network-devices/ (vendor-report)
  "we assess with high confidence that these actions were performed by a state-sponsored actor."   summary: CVE-2024-20353/20359; Line Dancer + Line Runner implants. STATE CAVEAT: the source does NOT name a state — the CN tag is the candidate's own inference; keep state at most strongly_inferred/unattributed.

---

## RU — Russia — SINGLETON FILLS
*Cadet Blizzard, Winter Vivern and Emotet each have exactly 1 corpus event today.*

- **[2023-06-14] MSTIC graduates Cadet Blizzard as a novel, distinct GRU-associated Russian threat actor** — Cadet Blizzard (`ru/gru/cadet-blizzard`) — `attribution-publication/destructive/wiper/hack-and-leak` — attested  —  ⟢ singleton→2nd event
  attributed by: Microsoft Threat Intelligence (MSTIC) · source: https://www.microsoft.com/en-us/security/blog/2023/06/14/cadet-blizzard-emerges-as-a-novel-and-distinct-russian-threat-actor/ (vendor-report)
  "Microsoft assesses that Cadet Blizzard operations are associated with the Russian General Staff Main Intelligence Directorate (GRU)."   summary: DEV-0586 graduation; WhisperGate MBR-wiper, defacements, the 'Free Civilian' hack-and-leak persona. Distinct meta event vs the corpus singleton's 2022 WhisperGate operational entry — adds the GRU association.

- **[2024-09-05] Cadet Blizzard / GRU Unit 29155 — Five Eyes + allies attribution for sabotage/espionage against US and global critical infrastructure (AA24-249A)** — Cadet Blizzard (`ru/gru/cadet-blizzard`) — `intrusion/destructive/wiper/espionage/pre-positioning/attribution-publication` — attested  —  ⟢ singleton→2nd event (2nd Cadet Blizzard candidate this batch)
  attributed by: FBI, CISA, NSA + Five Eyes + Czechia, Estonia, Germany, Latvia, Ukraine (AA24-249A) · source: https://www.computerweekly.com/news/366609814/NCSC-and-allies-call-out-Russias-Unit-29155-over-cyber-warfare (news)
  "[AA24-249A attributes GRU Unit 29155 / 161st Specialist Training Centre, = Cadet Blizzard / Ember Bear, incl. WhisperGate and thousands of domain-scans]."   summary: Distinct formal Unit-29155 state-attribution advisory (vs the MSTIC graduation above).

- **[2023-10-25] Winter Vivern exploits Roundcube webmail zero-day (CVE-2023-5631) against European governments and a think tank** — Winter Vivern (`ru/proxies/winter-vivern`) — `espionage/intrusion/data-theft/surveillance` — strongly_inferred  —  ⟢ singleton→2nd event
  attributed by: ESET · source: https://www.welivesecurity.com/en/eset-research/winter-vivern-exploits-zero-day-vulnerability-roundcube-webmail-servers/ (vendor-report)
  "[ESET attributes exploitation of the Roundcube XSS zero-day from Oct 11 2023 to] Winter Vivern."   summary: 2nd Winter Vivern event (corpus has only 2022-04 credential-phish). RU-nexus caveat: ESET's only affiliation hint is a low-confidence Belarus/MoustachedBouncer link — preserve the hedge; RU placement rests on the existing corpus TA473 entry, not this source. *(An in-batch duplicate of this exact event was dropped.)*

- **[2021-11-14] Emotet botnet returns and rebuilds via TrickBot infrastructure ('Operation Reacharound')** — Emotet (`ru/proxies/emotet`) — `intrusion/supply-chain` — strongly_inferred  —  ⟢ singleton→2nd event
  attributed by: Cryptolaemus research group, GData, Advanced Intel · source: https://www.bleepingcomputer.com/news/security/emotet-malware-is-back-and-rebuilding-its-botnet-via-trickbot/ (news)
  "Emotet research group Cryptolaemus, GData, and Advanced Intel have begun to see the TrickBot malware dropping a loader for Emotet on infected devices."   summary: The Nov-2021 rebuild after the Jan-2021 Ladybird takedown. (Corpus shows one prior Emotet attribution event — the Dec-2020 Mealybug-prep entry — so this is its 2nd; the Jan-2021 takedown sits under the US slice.)

## RU — Russia — NEW actors
- **[2025-02-19] GTIG details Russia-linked UNC4221 Signal phishing kit (Kropyva-mimic / PINPOINT) targeting Ukrainian military** — actor (NEW; UNC4221 / UAC-0185) — `espionage/surveillance/intrusion/reconnaissance` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: GTIG · source: https://cloud.google.com/blog/topics/threat-intelligence/russia-targeting-signal-messenger/ (vendor-report)
  "UNC4221 (tracked by CERT-UA as UAC-0185) is an additional Russia-linked threat actor who has actively targeted Signal accounts used by Ukrainian military personnel."   summary: Kropyva-mimic kit, malicious device-linking QR codes abusing Signal linked-devices, PINPOINT geolocation. Distinct from Sandworm/APT28/Turla/Star Blizzard.

- **[2025-12-04] UTA0355 (Russia) spoofs European security conferences in OAuth/device-code phishing of foreign-policy experts and former senior US officials** — actor (NEW; UTA0355) — `espionage/intrusion` — attested  —  ⟢ NEW actor in slice
  attributed by: Volexity · source: https://www.volexity.com/blog/2025/12/04/dangerous-invitations-russian-threat-actor-spoofs-european-security-events-in-targeted-phishing-attacks/ (vendor-report)
  "This is the same threat actor previously reported on in April 2025 by Volexity … the Russian threat actor it tracks as UTA0355."   summary: Spoofed Belgrade Security Conference, Brussels Indo-Pacific Dialogue, World Nuclear Exhibition; OAuth/device-code credential phishing. Volexity calls it Russian outright (state attested).

## RU — Russia — existing actor (not singleton)
*2 candidates mapping to Sandworm (26 corpus events), both via the same Dragos 2026 Year-in-Review URL — distinct sub-tracked activity (ELECTRUM vs KAMACITE), two distinct events.*

- **[2025-12] ELECTRUM December-2025 attack on Polish distributed energy resources (wind/solar) — first major coordinated DER-scale OT operation** — Sandworm (`ru/gru/74455/sandworm`) — `cyber-physical/disruption/destructive` — strongly_inferred
  attributed by: Dragos (ELECTRUM–SANDWORM association; no political/state attribution) · source: https://www.dragos.com/blog/dragos-2026-ot-cybersecurity-year-in-review (vendor-report)
  "In December 2025, ELECTRUM targeted Polish energy infrastructure in the first major coordinated attack against distributed energy resources like wind farms and solar installations at scale."   summary: Distinct from the corpus's latest Sandworm entry (2025-04 ZEROLOT). The Year-in-Review does not itself tie ELECTRUM to SANDWORM — validate via the Dragos ELECTRUM threat profile.

- **[2025-03] KAMACITE sustained reconnaissance of U.S. industrial devices (March–July 2025) — control-loop mapping for ICS pre-positioning** — Sandworm (`ru/gru/74455/sandworm`) — `reconnaissance/pre-positioning/intrusion` — strongly_inferred
  attributed by: Dragos (KAMACITE–SANDWORM overlap; no political/state attribution) · source: https://www.dragos.com/blog/dragos-2026-ot-cybersecurity-year-in-review (vendor-report)
  "KAMACITE conducted systematic reconnaissance of U.S. industrial devices between March-July 2025, mapping control loops by targeting operator interfaces (HMIs), actuators (VFDs), meters, and remote gateways together."   summary: Distinct US pre-positioning recon event (Sandworm corpus entries are Ukraine/Poland wipers, Industroyer, Prestige). Shares the Year-in-Review URL with the ELECTRUM item.

---

## KP — North Korea — SINGLETON FILL
*APT37 has exactly 1 corpus event today (2021 InkySquid / Daily NK). Three APT37 candidates here collectively make it strongly LOO-rankable.*

- **[2025-08-29] APT37 / InkySquid (ScarCruft) Operation HanKook Phantom — RokRAT spear-phishing of South Korean government and academics** — APT37 (`kp/mss/apt37`) — `espionage/intrusion/data-theft` — attested  —  ⟢ singleton→2nd event
  attributed by: Seqrite Labs · source: https://www.seqrite.com/blog/operation-hankook-phantom-north-korean-apt37-targeting-south-korea/ (vendor-report)
  "APT-37 … InkySquid, ScarCruft, Reaper, Group123 … a North Korean state-backed cyber espionage group."   summary: LNK + PowerShell loaders → RokRAT; exfil via Dropbox/pCloud/Yandex; ROK gov/research/academic. Distinct from the prior-queue Mar-2025 Kimsuky XenoRAT-embassy item.

- **[2022-12-07] Google TAG attributes Internet Explorer zero-day (CVE-2022-41128) Itaewon-lure campaign to North Korean APT37** — APT37 (`kp/mss/apt37`) — `espionage/intrusion` — attested  —  ⟢ singleton→2nd event (2nd APT37 candidate this batch)
  attributed by: Google Threat Analysis Group (TAG) · source: https://blog.google/threat-analysis-group/internet-explorer-0-day-exploited-by-north-korean-actor-apt37/ (vendor-report)
  "We attribute this activity to a group of North Korean government-backed actors known as APT37."   summary: CVE-2022-41128 IE JScript zero-day; "221031 Seoul Yongsan Itaewon" lure; RTF→HTML→IE chain; SK targeting.

- **[2026-05-05] ScarCruft (APT37) BirdCall multiplatform supply-chain compromise of a Yanbian gaming platform** — APT37 (`kp/mss/apt37`) — `supply-chain/espionage/surveillance/intrusion` — strongly_inferred  —  ⟢ singleton→2nd event (3rd APT37 candidate this batch)
  attributed by: ESET · source: https://www.welivesecurity.com/en/eset-research/rigged-game-scarcruft-compromises-gaming-platform-supply-chain-attack/ (vendor-report)
  "[sqgame supply-chain compromise attributed to] ScarCruft (APT37 / Reaper) … suspected to be a North Korean espionage group."   summary: BirdCall Windows/Android backdoor (screenshots + voice recording); target = Yanbian "refugees or defectors." Disclosure 2026-05-05; compromise dates to late 2024.

## KP — North Korea — NEW actors
- **[2024-11-22] MSTIC (CYBERWARCON 2024) details Sapphire Sleet — North Korean LinkedIn/VC-impersonation crypto theft exceeding $10M** — actor (NEW; Sapphire Sleet; overlaps APT38 / BlueNoroff) — `financial-theft/intrusion` — attested  —  ⟢ NEW actor in slice
  attributed by: Microsoft Threat Intelligence (MSTIC) · source: https://www.microsoft.com/en-us/security/blog/2024/11/22/microsoft-shares-latest-intelligence-on-north-korean-and-chinese-threat-actors-at-cyberwarcon/ (vendor-report)
  "The North Korean threat actor that Microsoft tracks as Sapphire Sleet has been conducting cryptocurrency theft … since at least 2020."   summary: >$10M over six months; LinkedIn-recruiter + fake-VC impersonation. New actor (BlueNoroff/APT38 are separate); distinct from the prior-queue UNC1069 axios-npm item.

- **[2024-11-22] MSTIC (CYBERWARCON 2024) details Ruby Sleet — North Korea aerospace/satellite espionage and VeraPort supply-chain compromise of a Korean construction firm** — actor (NEW; Ruby Sleet; overlaps CERIUM) — `espionage/supply-chain/intrusion/data-theft` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: Microsoft Threat Intelligence (MSTIC) · source: https://www.microsoft.com/en-us/security/blog/2024/11/22/microsoft-shares-latest-intelligence-on-north-korean-and-chinese-threat-actors-at-cyberwarcon/ (vendor-report)
  "the threat actor successfully compromised a Korean construction company and replaced a legitimate version of VeraPort software with a version that communicates with known Ruby Sleet infrastructure."   summary: Page presents Ruby Sleet categorically as North Korean (the "may be used by North Korea" hedge attaches to whether stolen tech advances DPRK weapons, not nationality) — attested is defensible; strongly_inferred is conservative. Shares the CYBERWARCON URL with Sapphire Sleet but is a distinct new actor.

- **[2024-11-01] GOLDEN CHOLLIMA — DPRK-nexus recruitment-fraud intrusion of a European fintech, cloud pivot and cryptocurrency theft** — actor (NEW; GOLDEN CHOLLIMA; split from LABYRINTH CHOLLIMA) — `financial-theft/intrusion/data-theft/supply-chain` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: CrowdStrike (Counter Adversary Operations) · source: https://www.crowdstrike.com/en-us/blog/labyrinth-chollima-evolves-into-three-adversaries/ (vendor-report)
  "[LABYRINTH CHOLLIMA split into three DPRK-nexus adversaries incl. GOLDEN CHOLLIMA]"   summary: Malicious Python packages via recruitment fraud to a European fintech; cloud/IAM pivot; crypto diverted to adversary wallets. DPRK-nexus asserted without per-sub-unit govt-sponsorship → strongly_inferred. (Page does not name Bybit/$1.46B for PRESSURE CHOLLIMA — correctly not re-proposed.)

## KP — North Korea — existing actor (not singleton)
*2 candidates mapping to Kimsuky (6 corpus events).*

- **[2024-04-23] South Korean National Office of Investigation attributes 83 defense-contractor breaches to Lazarus, Kimsuky and Andariel** — Kimsuky (`kp/rgb/kimsuky`) — `espionage/intrusion/data-theft` — attested
  attributed by: South Korea National Office of Investigation (KNPA) · source: https://therecord.media/south-korean-defense-companies-cyber-espionage-north-korea (news)
  "[83 defense companies infiltrated; data stolen from ~10, Oct 2022–Jul 2023; Kimsuky exploited an email-server flaw at a subcontractor Apr–Jul 2023]."   summary: Distinct from the corpus AA24-207A (Jul-2024 Andariel) and all other Kimsuky entries. Reviewer flag: file under KP (actor-state) vs cross-ref KR (attributing/victim state).

- **[2025-01] TA427 (Kimsuky / Emerald Sleet) trials the ClickFix technique against North-Korea-focused think tanks, leading to QuasarRAT** — Kimsuky (`kp/rgb/kimsuky`) — `espionage/intrusion` — strongly_inferred
  attributed by: Proofpoint · source: https://www.proofpoint.com/us/blog/threat-insight/around-world-90-days-state-sponsored-actors-try-clickfix (vendor-report)
  "In January and February 2025, Proofpoint first observed TA427 operators targeting individuals in fewer than five organizations in the think tank sector with a new infection chain using the ClickFix technique."   summary: TA427 overlaps Kimsuky/Emerald Sleet; QuasarRAT delivery. The page's parallel MuddyWater (TA450) and APT28 (TA422) ClickFix trials are NOT proposed as separate events here — only the Kimsuky event.

---

## IR — Iran — SINGLETON FILL
*Moses Staff has exactly 1 corpus event today (the 2021-11 emergence).*

- **[2023-01-26] Moses Staff / Cobalt Sapling — Secureworks links the 'Abraham's Ax' persona to the Iranian operator; Saudi government targeting** — Moses Staff (`ir/moses-staff`) — `hack-and-leak/data-theft/destructive/influence-operation` — strongly_inferred  —  ⟢ singleton→2nd event
  attributed by: Secureworks Counter Threat Unit (CTU) · source: https://www.secureworks.com/blog/abrahams-ax-likely-linked-to-moses-staff (vendor-report)
  "Abraham's Ax is another hacktivist group persona operated by the Iranian COBALT SAPLING threat group [which also runs Moses Staff]."   summary: Abraham's Ax hit Saudi government ministries incl. the Ministry of Interior. 2nd Moses Staff event. INTAKE NOTE: secureworks.com 301-redirects to https://www.sophos.com/en-us/news/abrahams-ax-likely-linked-to-moses-staff — update source_url (original returns a redirect, not a clean 200).

## IR — Iran — NEW actor
- **[2025-06-05] BladedFeline (OilRig subgroup) Whisper/Shahmaran espionage against Kurdish and Iraqi government officials** — actor (NEW; BladedFeline) — `espionage/intrusion/data-theft` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: ESET · source: https://www.welivesecurity.com/en/eset-research/bladedfeline-whispering-dark/ (vendor-report)
  "[BladedFeline,] an Iran-aligned cyberespionage group, active since at least 2017 [assessed with MEDIUM confidence a subgroup of OilRig / APT34]."   summary: KRG, Government of Iraq and an Uzbek telecom; Shahmaran/Whisper(Veaty)/PrimeCache. Distinct from existing APT34/OilRig, MuddyWater, Void/Scarred Manticore.

## IR — Iran — existing actors (not singleton)
- **[2024-07-15] MuddyWater (MOIS) deploys the new BugSleep backdoor in 2024 phishing campaigns against Israel and the wider region** — MuddyWater (`ir/mois/muddywater`) — `espionage/intrusion` — attested
  attributed by: Check Point Research · source: https://research.checkpoint.com/2024/new-bugsleep-backdoor-deployed-in-recent-muddywater-campaigns/ (vendor-report)
  "MuddyWater, an Iranian threat group affiliated with the Ministry of Intelligence and Security (MOIS), is known to be active since at least 2017."   summary: Post-Oct-2023 escalation; BugSleep onset May 2024; 50+ spear-phish across 10+ sectors (Israeli + Saudi/Turkey/Azerbaijan/India/Portugal). Distinct from the corpus MuddyViper (2024-09) and US-DIB (2024-08) entries.

- **[2024-01] Dragos BAUXITE OT/ICS campaigns — PLC compromise and custom backdoors on OT devices, overlapping the IRGC-IO CyberAv3ngers persona** — CyberAv3ngers (`ir/irgc-io/cyberav3ngers`) — `cyber-physical/intrusion/reconnaissance` — strongly_inferred
  attributed by: Dragos (behavioural tracking, explicitly no political attribution); IRGC-IO nexus carried by the established CyberAv3ngers attribution · source: https://www.dragos.com/threat/bauxite (vendor-report)
  "Based on capabilities and network infrastructure, this group shares substantial technical overlaps with the pro-Iranian hacktivist persona CyberAv3ngers."   summary: Stage-2 ICS Kill Chain; PLC compromise + custom OT-device backdoors; US/Australia/UK/Israel victims. Maps to CyberAv3ngers (8 events) via the overlap; distinct from the Unitronics/Aliquippa/IOCONTROL entries. Iran nexus carried by the CyberAv3ngers identity → strongly_inferred.

- **[2023-09-14] MSTIC reports Peach Sandstorm (APT33) February–July 2023 password-spray campaign with Entra ID cloud reconnaissance** — APT33 (`ir/irgc/apt33`) — `intrusion/espionage/reconnaissance` — attested
  attributed by: Microsoft Threat Intelligence (MSTIC) · source: https://www.microsoft.com/en-us/security/blog/2023/09/14/peach-sandstorm-password-spray-campaigns-enable-intelligence-collection-at-high-value-targets/ (vendor-report)
  "Since February 2023, Microsoft has observed password spray activity against thousands of organizations carried out by an actor we track as Peach Sandstorm (HOLMIUM)."   summary: Feb–Jul 2023; satellite/defense/pharma; AzureHound + Roadtools for Entra ID/Azure recon. DISTINCT from the prior-queue Aug-2024 Tickler item and the Dec-2023 Curious Serpens/FalseFont item; corpus APT33 entries are all 2012–2016 Shamoon/Cleaver era.

---

## none — Non-state / e-crime  (e-crime / non-state)
*Existing e-crime actors live under `atlas/actors/criminal/`. SINGLETONS: Trigona, Cuba, BlackByte (1 event each). NEW actors: Intellexa/Predator, Storm-0501, Storm-1811, CORDIAL/SNARKY SPIDER.*

- **[2024-03] Secureworks CTU attributes the Trigona ransomware operation to GOLD BEGONIA (RaaS lifecycle, 2022–2024)** — Trigona (`ru/proxies/trigona`) — `ransomware/extortion/data-theft` — attested  —  ⟢ singleton→2nd event
  attributed by: Secureworks Counter Threat Unit (CTU) / Sophos · source: https://www.sophos.com/en-us/threat-profiles/gold-begonia (vendor-report)
  "GOLD BEGONIA was a financially motivated cybercriminal threat group that operated and distributed the Trigona ransomware."   summary: Full RaaS lifecycle (Oct 2022 → infra offline May 2024). Operator-level attribution giving the singleton a 2nd event (corpus Trigona = the 2023-10 Ukrainian Cyber Alliance leak-site defacement). NOTE: corpus Trigona is filed under `ru/proxies/` yet the operator has no corroborated state direction — confirm filing at intake.

- **[2024-02] Secureworks CTU attributes the Cuba ransomware operation to GOLD FLAMINGO (no corroborated state direction)** — Cuba Ransomware (`criminal/cuba`) — `ransomware/extortion/data-theft` — attested  —  ⟢ singleton→2nd event
  attributed by: Secureworks Counter Threat Unit (CTU) / Sophos · source: https://www.sophos.com/en-us/threat-profiles/gold-flamingo (vendor-report)
  "GOLD FLAMINGO was a financially motivated cybercriminal threat group responsible for operating Cuba ransomware [and] CTU researchers are unable to corroborate any findings of government direction."   summary: Last victim early Feb 2024, now inactive. Operator-level attribution giving the singleton a 2nd event (corpus Cuba = the 2022-12 CISA/FBI advisory).

- **[2024-08-28] BlackByte ransomware exploits VMware ESXi CVE-2024-37085 (Cisco Talos) — Conti-linked RaaS** — BlackByte (`criminal/blackbyte`) — `ransomware/extortion/intrusion` — strongly_inferred  —  ⟢ singleton→2nd event
  attributed by: Cisco Talos (Talos Incident Response) · source: https://thehackernews.com/2024/08/blackbyte-ransomware-exploits-vmware.html (vendor-report)
  "[per Cisco Talos, BlackByte likely exploiting CVE-2024-37085 via a malicious 'ESX Admins' AD group; self-propagating wormable encryptor; BYOVD with four drivers; Conti-shutdown lineage]."   summary: 2nd BlackByte event (corpus has only 2022 SF 49ers). Conti lineage is a vendor assessment → strongly_inferred.

- **[2023-09-22] Google TAG discloses Intellexa Predator iOS zero-day exploit chain (Egypt)** — actor (NEW; Intellexa / Predator, commercial spyware vendor) — `surveillance/intrusion` — attested  —  ⟢ NEW actor in slice
  attributed by: Google Threat Analysis Group (TAG) · source: https://blog.google/threat-analysis-group/0-days-exploited-by-commercial-surveillance-vendor-in-egypt/ (vendor-report)
  "Developed by the commercial surveillance vendor, Intellexa, this exploit chain is used to install its Predator spyware surreptitiously onto a device."   summary: CVEs 2023-41993/41991/41992 (+Android 4762). New PSOA actor (distinct from NSO, Stealth Falcon, Paragon). CAVEAT: the TAG page does NOT name the victim Ahmed Eltantawy — that detail is from the linked Citizen Lab report; source the named-victim claim separately.

- **[2024-09-26] MSTIC details Storm-0501 hybrid-cloud ransomware extending on-prem intrusions into Azure/Entra ID** — actor (NEW; Storm-0501) — `ransomware/extortion/data-theft/intrusion` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: Microsoft Threat Intelligence (MSTIC) · source: https://www.microsoft.com/en-us/security/blog/2024/09/26/storm-0501-ransomware-attacks-expanding-to-hybrid-cloud-environments/ (vendor-report)
  "Storm-0501 is a financially motivated cybercriminal group that uses commodity and open-source tools to conduct ransomware operations."   summary: Active since 2021 (Sabbath, then RaaS affiliate for BlackCat/LockBit/Hunters International/Embargo); on-prem AD→Entra ID pivot; US gov/manufacturing/transportation/LE targets.

- **[2024-05-15] MSTIC attributes Quick Assist / Teams vishing social-engineering-to-Black-Basta intrusions to Storm-1811** — actor (NEW; Storm-1811, Black Basta affiliate / access operator) — `intrusion/ransomware/extortion` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: Microsoft Threat Intelligence (MSTIC) · source: https://www.microsoft.com/en-us/security/blog/2024/05/15/threat-actors-misusing-quick-assist-in-social-engineering-attacks-leading-to-ransomware/ (vendor-report)
  "Storm-1811 is a financially motivated cybercriminal group known to deploy Black Basta ransomware."   summary: Quick Assist abuse since mid-April 2024; email-bombing, phone/Teams IT-support impersonation; ScreenConnect/NetSupport/Qakbot/Cobalt Strike → Black Basta. The distinctly-tracked access/affiliate operator, not the Black Basta brand.

- **[2026-04-30] CORDIAL SPIDER and SNARKY SPIDER — Com-aligned data-theft-and-extortion crews vishing identity/SaaS platforms (US multi-sector)** — actor (NEW; CORDIAL SPIDER / SNARKY SPIDER) — `extortion/data-theft/intrusion/disruption` — strongly_inferred  —  ⟢ NEW actor in slice
  attributed by: CrowdStrike (Counter Adversary Operations; via CyberScoop) · source: https://cyberscoop.com/crowdstrike-cordial-spider-snarky-spider-extortion-attacks/ (news)
  "[a financially-motivated 'new wave'] closely aligned with Scattered Spider and linked to other subsets of The Com, including SLSH and ShinyHunters."   summary: Vishing/identity-platform/SaaS/MFA-manipulation, DDoS and swatting across US academic/aviation/retail/hospitality/automotive/finance/legal/tech. No state nexus. New named actors not in the corpus Scattered Spider/ShinyHunters/The Com cluster nor the prior-queue e-crime block. (Two crews disclosed together; decide one-actor-vs-two at intake.)

---

### How to use this

**Nothing here is authoritative.** This is an agent-assembled shortlist, not corpus data. Before any item enters the atlas, Kara must, per item:

1. **Independently re-verify the source.** Every URL was agent-fetched and must be re-checked by hand — confirm the page still loads, says what the quote claims, and that the quote is verbatim. Honour the explicit caveats: the CrowdStrike THR-2025 page does **not** carry the GLACIAL PANDA ShieldSlide/OpenSSH/CDR or GENESIS PANDA 11-countries/IMDS/Earth-Lamia specifics; the Google TAG Intellexa page does **not** name the victim (Citizen Lab does); the FishMonger supporting_quote is a paraphrase; the Dragos Year-in-Review does **not** itself tie ELECTRUM/KAMACITE to SANDWORM (the threat-profiles do); the Moses Staff secureworks.com URL 301-redirects to Sophos (use the Sophos URL); the Storm-1516 War-on-the-Rocks piece is secondary — re-pull the SGDSN/VIGINUM PDF as primary. The CFR-tracker dates that are "first reported" years later (CyberPoint 2015→Feb 2021; ToTok) should be dated by the operation, with the disclosure date recorded separately.

2. **Set the final ICD-203 label yourself.** The `confidence` shown is the **fetched** vendor/agency posture carried through **un-upgraded** — AUSPEX never upgrades. Set the attributing-org high/moderate/low **and** the separate `auspex_assessment`, preserving every caveat: the two **plausible** items (DarkHotel — Google TAG names no state; LIMINAL PANDA — CrowdStrike's own LOW-confidence China-nexus) and the **state-not-named** hedges (ArcaneDoor/UAT4356 and TGR-STA-1030 are state-sponsored / "out of Asia" but NOT China-attributed by the source; Lotus Blossom has no in-text sponsor; Winter Vivern's RU nexus is only a low-confidence Belarus link).

3. **Confirm the actor slug — no renames.** Verify each `NEW:` actor truly has no existing slug (corrections add **aliases**, never rename). Resolve the alias-vs-distinct calls: WARP PANDA vs the corpus UNC5221/BRICKSTORM cluster; CORDIAL vs SNARKY SPIDER (one record or two); Evasive Panda's two events (CloudScout + StormBamboo) under a single new slug. Decide cross-state filings: Storm-1516 (actor-state RU, reporting-state FR), the KNPA 83-defense-contractor item (KP vs KR), Trigona's `ru/proxies/` placement vs its "no corroborated state direction." Doctrine linkage is independent of attribution and uses its own attested/strongly_inferred/plausible label.

4. **Write the schema entry, validate, re-baseline.** On-disk event YAML under `atlas/events/YYYY/MM/<slug>.yaml`; add each source in `publisher/YYYY-MM-DD_slug` form with a curl-verified URL (`url: null` + note if it can't be verified — never a fabricated URL); then run `pnpm validate` and **re-baseline the evals before commit**. New state slices (PS, SA) need their `atlas/nation-states/<id>.yaml` and `atlas/actors/<id>/` scaffolding plus doctrine stubs before their events will validate.

---

*Full document written to `/Users/kara/Documents/Projects/AUSPEX/research/attribution-source-candidates-2026-05-30.md`. Counts verified against `atlas/events/` and `atlas/actors/`: 72 candidates in → 2 in-batch duplicates dropped → 70 kept; 13 distinct singleton actors get a 2nd event (18 candidate events feed them; APT37 draws 3); 39 distinct new actors (40 new-actor events, Evasive Panda has 2); 2 brand-new state slices (PS, SA).*