# China — Notable cyber events, 2010–2026

Chronological. Inclusion bar: strong public attribution (DOJ / OFAC / CISA / Five-Eyes joint / tier-1 vendor) **and** plausible doctrine linkage. ~55 events. Linkage confidence per SCHEMA: **attested** (the attributing source explicitly names the strategic goal), **strongly inferred** (target + actor + timing align with named doctrine pillar, no compelling alternative), **plausible** (consistent but other explanations exist).

---

### 2009-12 — Operation Aurora

- **Attributed actor**: APT17 / Elderwood (attribution confidence: high; attributing source: Mandiant, Symantec, McAfee).
- **Target**: Google, Adobe, Juniper, Rackspace, ~30 other tech and defense firms; access to Chinese-dissident Gmail accounts.
- **Vector / TTP**: IE 0-day (CVE-2010-0249) → Hydraq/Aurora trojan via spear-phish and watering-hole.
- **Outcome**: source-code theft; access to dissident accounts; Google subsequently withdrew its mainland search engine.
- **Doctrine linkage**: dissident suppression (Intelligence Law–precursor activity); foundational tech IP (precursor to MIC2025).
- **Linkage confidence**: strongly inferred.
- **Citations**: Wikipedia Operation Aurora; McAfee 2010 disclosure; Google blog 12 Jan 2010.

### 2010–2014 — Su Bin / C-17, F-22, F-35 data theft

- **Attributed actor**: Su Bin + two unnamed PLA officers (attribution confidence: high; attributing source: DOJ — Su Bin pled guilty March 2016).
- **Target**: Boeing (C-17), Lockheed Martin (F-22, F-35) — via subcontractor networks.
- **Vector / TTP**: long-running spear-phish + access to compromised contractor accounts; ~630,000 files exfiltrated from Boeing C-17 program alone.
- **Outcome**: aviation IP theft equivalent to "5 Libraries of Congress" per DOJ; correlations with Chengdu Aircraft Industry Group's J-20 development.
- **Doctrine linkage**: Military-Civil Fusion; MIC2025 aerospace pillar; PLA Air Force modernization.
- **Linkage confidence**: attested (DOJ explicitly cites military-aviation data and PRC end use).
- **Citations**: DOJ press release March 2016. <https://justice.gov/opa/pr/chinese-national-pleads-guilty-conspiring-hack-us-defense-contractors-systems-steal-sensitive>

### 2010–2012 — APT1 / Comment Crew campaign exposure

- **Attributed actor**: APT1 / PLA Unit 61398 (high; Mandiant Feb 2013 + DOJ May 2014 indictment of five PLA officers).
- **Target**: 141 organizations across 20 industries — including Westinghouse (nuclear reactor designs), U.S. Steel, Alcoa, SolarWorld, Allegheny Technologies, USW.
- **Vector / TTP**: spear-phish + custom backdoors (AURIGA, BANGAT) + HTRAN proxies.
- **Outcome**: hundreds of terabytes of IP exfiltrated to Shanghai netblocks.
- **Doctrine linkage**: 12th FYP / Strategic Emerging Industries (2010); precursor MIC2025 sector targeting (nuclear, steel, solar).
- **Linkage confidence**: attested (DOJ 2014 indictment specifies victims and commercial advantage to PRC SOEs).
- **Citations**: Mandiant APT1 report. <https://services.google.com/fh/files/misc/mandiant-apt1-report.pdf>

### 2011–2013 — RSA SecurID breach + Lockheed follow-on

- **Attributed actor**: assessed APT1 / PLA, with some analysts assigning APT12 (medium; vendor reporting).
- **Target**: RSA (EMC), then Lockheed Martin and other defense primes leveraging stolen seed values.
- **Outcome**: undermined trust in millions of two-factor tokens; downstream Lockheed intrusion blocked.
- **Doctrine linkage**: MCF aerospace targeting.
- **Linkage confidence**: strongly inferred.

### 2012-09 — Telvent / OASyS DNA breach

- **Attributed actor**: Comment Crew / APT1 (medium; KrebsOnSecurity reporting).
- **Target**: Telvent Canada (ICS SCADA vendor to North American oil & gas pipelines).
- **Outcome**: project files and access to customer networks compromised — first reported PRC pre-positioning event vs. critical-infrastructure OT.
- **Doctrine linkage**: precursor to intelligentized / system-destruction posture against U.S. critical infrastructure.
- **Linkage confidence**: plausible.

### 2014-06 — Office of Personnel Management (OPM) breach

- **Attributed actor**: MSS Jiangsu State Security Department (high; U.S. IC public attribution; PII later cross-referenced with Anthem and Equifax thefts).
- **Target**: U.S. OPM — Standard Form 86 background-investigation records.
- **Vector / TTP**: compromise via KeyPoint contractor; lateral movement; long dwell.
- **Outcome**: 22.1 million SF-86 records (security-clearance applicants, family, and references) stolen — the most consequential single PII theft in U.S. national-security history.
- **Doctrine linkage**: MCF / Intelligence Law — bulk PII enables MSS HUMINT vetting/targeting of cleared U.S. persons.
- **Linkage confidence**: attested (U.S. IC public attribution explicitly cited counterintelligence value).
- **Citations**: <https://en.wikipedia.org/wiki/Office_of_Personnel_Management_data_breach>

### 2015-02 — Anthem breach

- **Attributed actor**: Deep Panda / Black Vine (assessed MSS-linked; high; DOJ 2019 indictment of Fujie Wang, MSS-linked).
- **Target**: Anthem Inc. (U.S. health insurer).
- **Outcome**: ~78.8 million member records (PII + employment).
- **Doctrine linkage**: bulk-PII collection complementing OPM (MCF/HUMINT enabler).
- **Linkage confidence**: attested.

### 2015-08 — Bureaucratic theft: U.S. Navy / sub-warfare data (Sea Dragon)

- **Attributed actor**: assessed China-based (medium; Washington Post reporting 2018).
- **Target**: U.S. Navy contractor handling submarine warfare R&D (Sea Dragon project, anti-ship Tomahawk on subs).
- **Outcome**: hundreds of GB exfiltrated.
- **Doctrine linkage**: MCF / PLAN modernization.
- **Linkage confidence**: strongly inferred.

### 2017-03 — Operation Cloud Hopper (APT10)

- **Attributed actor**: APT10 / MSS Tianjin (high; PwC + BAE Apr 2017; DOJ Dec 2018 indictment).
- **Target**: managed service providers (HPE, IBM, Fujitsu, NTT, others); through them, dozens of MSP customers in 12+ countries.
- **Vector / TTP**: phish MSPs → harvest admin credentials → pivot into customer environments → ChChes, RedLeaves, Quasar.
- **Outcome**: theft from aerospace, satellite, telecom, healthcare, manufacturing — explicitly cited in DOJ indictment.
- **Doctrine linkage**: MIC2025 (10/10 sectors touched); MCF.
- **Linkage confidence**: attested.
- **Citations**: DOJ Dec 2018 press release. <https://www.justice.gov/archives/opa/pr/two-chinese-hackers-associated-ministry-state-security-charged-global-computer-intrusion>

### 2017-07 — NetSarang supply-chain attack (ShadowPad debut)

- **Attributed actor**: APT41 / Barium (high; Kaspersky + Microsoft).
- **Target**: NetSarang Xmanager / Xshell — server-management software widely used by IT administrators.
- **Outcome**: ShadowPad backdoor delivered to thousands of enterprise customers; opportunity for selective second-stage exploitation.
- **Doctrine linkage**: MIC2025 IT and software pillar; supply-chain pivots into MCF-relevant targets.
- **Linkage confidence**: strongly inferred.

### 2017-09 — CCleaner supply-chain attack

- **Attributed actor**: APT41 / Barium (high; Avast / Cisco Talos).
- **Target**: Piriform CCleaner — 2.27 million downloads compromised.
- **Outcome**: selective second-stage targeting of ~40 specific tech firms (Intel, Samsung, Cisco, Microsoft, Sony, VMware) for IP collection.
- **Doctrine linkage**: MIC2025 IT / semiconductor pillar.
- **Linkage confidence**: strongly inferred.

### 2017-05 to 2017-07 — Equifax breach

- **Attributed actor**: PLA 54th Research Institute (high; DOJ indictment Feb 2020).
- **Target**: Equifax Inc.
- **Vector / TTP**: exploitation of unpatched Apache Struts (CVE-2017-5638); pivot through internal Equifax network; deletion of logs to evade detection; exfiltration via 34 servers in ~20 countries.
- **Outcome**: PII of 145 million Americans (names, DOB, SSN); driver's license numbers for 10 million; credit-card data for 200,000.
- **Doctrine linkage**: MCF / bulk-PII collection (counterintelligence and HUMINT enabling).
- **Linkage confidence**: attested.
- **Citations**: DOJ press release Feb 2020. <https://www.justice.gov/usao-ndga/pr/chinese-military-personnel-charged-computer-fraud-economic-espionage-and-wire-fraud>

### 2018-04 — ASUS Live Update supply-chain attack ("ShadowHammer")

- **Attributed actor**: APT41 / Barium (high; Kaspersky).
- **Target**: ASUS notebook owners — ~1 million devices received trojanized updates; selective targeting of ~600 MAC addresses.
- **Doctrine linkage**: targeted intelligence collection on individuals of interest; consistent with MIC2025 IT / hardware sector mapping.
- **Linkage confidence**: plausible.

### 2018 — Texas energy company compromise (APT31)

- **Attributed actor**: APT31 / Wuhan XRZ (high; DOJ indictment + OFAC SDN March 2024 explicitly cite a 2018 Texas-based energy company compromise).
- **Target**: unnamed Texas energy company.
- **Doctrine linkage**: critical infrastructure; MIC2025 power-equipment sector; early indication of energy-sector pre-positioning posture.
- **Linkage confidence**: attested.

### 2018–2019 — Marriott / Starwood breach

- **Attributed actor**: China-linked (MSS-affiliated; medium-high; U.S. official statements 2018; Reuters reporting).
- **Target**: Marriott / Starwood guest reservation database.
- **Outcome**: ~500 million guest records.
- **Doctrine linkage**: MCF / Intelligence Law — bulk travel-pattern data of foreign officials.
- **Linkage confidence**: strongly inferred.

### 2019-05 — TeamViewer breach attributed (post-hoc disclosure)

- **Attributed actor**: APT41 / Winnti (medium; German press 2019).
- **Target**: TeamViewer GmbH.
- **Outcome**: persistent access; downstream targeting capability.
- **Doctrine linkage**: MIC2025 / supply-chain leverage.
- **Linkage confidence**: plausible.

### 2019–2020 — APT41 video-game and cryptocurrency campaigns

- **Attributed actor**: APT41 / Chengdu 404 (high; DOJ Aug 2019 / Aug 2020 indictments).
- **Target**: video-game publishers (in-game currency theft); cryptocurrency exchanges; SE Asian gambling operators.
- **Doctrine linkage**: financial gain (the "private" half of APT41's Double Dragon mission); not directly doctrine-driven but tolerated by state.
- **Linkage confidence**: attested.

### 2020-09 — APT41 global campaign indictment

- **Attributed actor**: APT41 (high; DOJ Sept 2020).
- **Target**: 100+ victims worldwide — Taiwanese telecom, Indian government, SE Asian governments, U.S. tech.
- **Doctrine linkage**: MIC2025 telecom, MCF, Taiwan-relevant collection.
- **Linkage confidence**: attested.
- **Citations**: <https://www.justice.gov/archives/opa/pr/seven-international-cyber-defendants-including-apt41-actors-charged-connection-computer>

### 2020-12 — SolarWinds "Spiral" cluster (PRC-distinct from SVR's Sunburst)

- **Attributed actor**: Spiral / TG-3390-adjacent (medium; SecureWorks; Microsoft).
- **Target**: U.S. government entities exploited via SolarWinds — distinct intrusion set from APT29 Sunburst (CVE-2020-10148 / "Supernova").
- **Doctrine linkage**: MCF.
- **Linkage confidence**: plausible.

### 2021-01 to 2021-03 — Microsoft Exchange ProxyLogon (Hafnium)

- **Attributed actor**: Hafnium / MSS (high; White House attribution 19 July 2021).
- **Target**: ~250,000 on-prem Exchange servers globally; targeted high-value organizations including infectious-disease researchers, law firms, universities, defense contractors, think tanks, NGOs.
- **Vector / TTP**: 0-day chain CVE-2021-26855/26857/26858/27065 → web-shell deployment.
- **Outcome**: bulk initial access at unprecedented scale; downstream selective exploitation.
- **Doctrine linkage**: MCF / Intelligence Law — strategic collection across MIC2025 sectors; explicit U.S. government framing as MSS irresponsible behavior.
- **Linkage confidence**: attested (White House statement).
- **Citations**: ODNI/NCSC bulletin. <https://www.dni.gov/files/NCSC/documents/SafeguardingOurFuture/HAFNIUM%20Compromises%20MS%20Exchange%20Servers.pdf>

### 2021-05 — Pulse Connect Secure VPN exploitation (APT5 + China cluster)

- **Attributed actor**: assessed China-based (high; CISA AA21-110A; Mandiant).
- **Target**: U.S. and European defense, government, and financial-sector Pulse Secure customers.
- **Doctrine linkage**: MCF defense collection.
- **Linkage confidence**: strongly inferred.

### 2021-07 — APT40 indictment and Hainan State Security Department exposure

- **Attributed actor**: APT40 (high; DOJ indictment + CISA AA21-200a).
- **Target**: maritime, biomedical, robotics R&D in 12+ countries, plus BRI-relevant industries.
- **Doctrine linkage**: explicitly attested — CISA cites Belt and Road and PLAN-relevant maritime targeting.
- **Linkage confidence**: attested.
- **Citations**: <https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-200a>

### 2021–2022 — APT41 USAHerds U.S. state-government breach

- **Attributed actor**: APT41 (high; Mandiant March 2022).
- **Target**: at least 6 U.S. state governments via 0-day in USAHerds animal-health management software (CVE-2021-44207), plus Log4Shell.
- **Doctrine linkage**: political intelligence; potential bulk PII; aligns with MCF + Intelligence Law collection.
- **Linkage confidence**: strongly inferred.
- **Citations**: Mandiant. <https://cloud.google.com/blog/topics/threat-intelligence/apt41-us-state-governments>

### 2022 — BRONZE STARLIGHT ransomware as smokescreen

- **Attributed actor**: BRONZE STARLIGHT / DEV-0401 (medium-high; SecureWorks).
- **Target**: pharma, electronics design, aerospace and defense (Indian conglomerate), media — ~15 of 21 known victims align with state-tasked espionage interest.
- **Outcome**: LockFile, AtomSilo, Rook, Night Sky, Pandora ransomware deployed as cover for IP theft.
- **Doctrine linkage**: MIC2025 (pharma, electronics); MCF.
- **Linkage confidence**: strongly inferred.

### 2022 — Mustang Panda EU / Vatican / Myanmar campaigns

- **Attributed actor**: Mustang Panda (high; Proofpoint, Recorded Future).
- **Target**: EU diplomatic missions; Vatican; SE Asian governments; refugees / diaspora orgs.
- **Doctrine linkage**: BRI political intelligence; Tibet/Uyghur diaspora targeting (Intelligence Law).
- **Linkage confidence**: strongly inferred.

### 2023-05 — Volt Typhoon Microsoft / CISA initial disclosure

- **Attributed actor**: Volt Typhoon (high; Microsoft + CISA AA23-144a + Five Eyes).
- **Target**: Guam telecom and U.S. critical infrastructure (communications, manufacturing, utility, transportation, construction, maritime, government, IT, education).
- **Vector / TTP**: edge-device exploitation (FortiGuard), LOLBins, valid accounts.
- **Outcome**: pre-positioning rather than data theft.
- **Doctrine linkage**: attested — CISA explicitly assesses pre-positioning for disruption in a future U.S.-PRC contingency (intelligentized warfare / Taiwan).
- **Linkage confidence**: attested.
- **Citations**: <https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-144a>; Microsoft <https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/>

### 2023-05 — Storm-0558 forged-token Exchange Online intrusion begins

- **Attributed actor**: Storm-0558 (high; Microsoft).
- **Target**: U.S. State Dept (Secretary's office), Commerce (Sec. Raimondo's office), Congressional staff, ~25 organizations.
- **Vector / TTP**: stolen Microsoft MSA signing key (acquired via 2021 crash dump) → forged Azure AD tokens → OWA access.
- **Outcome**: ~60,000 State Dept emails exfiltrated; six-week dwell.
- **Doctrine linkage**: Taiwan / China-policy collection; MCF / Intelligence Law.
- **Linkage confidence**: strongly inferred.
- **Citations**: <https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/>

### 2023-07 — APT41 Taiwan research-institute compromise

- **Attributed actor**: APT41 (medium; Cisco Talos).
- **Target**: Taiwanese government-affiliated computing research institute.
- **Outcome**: ShadowPad + Cobalt Strike; documents exfiltrated.
- **Doctrine linkage**: Taiwan / MCF; semiconductor and computing R&D collection (MIC2025).
- **Linkage confidence**: strongly inferred.
- **Citations**: <https://blog.talosintelligence.com/chinese-hacking-group-apt41-compromised-taiwanese-government-affiliated-research-institute-with-shadowpad-and-cobaltstrike-2/>

### 2023-09 — Cisco IOS XE mass exploitation (Salt Typhoon adjacency)

- **Attributed actor**: assessed Salt Typhoon / MSS-supporting contractors (high; CISA AA25-239a frames N-day edge exploitation as core TTP).
- **Target**: tens of thousands of Cisco IOS XE devices; selective follow-on into telecom carriers.
- **Doctrine linkage**: intelligentized warfare SIGINT.
- **Linkage confidence**: strongly inferred.

### 2023-11 — Massachusetts LELWD utility Volt Typhoon discovery

- **Attributed actor**: Volt Typhoon (high; Dragos + LELWD case study).
- **Target**: Littleton Electric Light & Water Department (MA municipal utility).
- **Outcome**: 300+ day dwell before discovery (since Feb 2023); lateral movement and data exfiltration, but no customer-sensitive data per investigation.
- **Doctrine linkage**: intelligentized warfare / Taiwan contingency pre-positioning.
- **Linkage confidence**: strongly inferred.

### 2024-01 — DOJ / FBI takedown of KV-botnet (Volt Typhoon proxy infrastructure)

- **Attributed actor**: Volt Typhoon (high; DOJ press release 31 Jan 2024; Lumen Black Lotus Labs).
- **Target**: SOHO routers (EOL Cisco, NetGear) repurposed as Volt Typhoon proxy fabric.
- **Outcome**: court-authorized FBI operation removed malware from compromised devices and cut C2.
- **Doctrine linkage**: attested — DOJ statement explicitly cites threat to U.S. critical infrastructure and PRC state sponsorship.
- **Linkage confidence**: attested.
- **Citations**: Lumen Black Lotus Labs <https://blog.lumen.com/kv-botnet-dont-call-it-a-comeback/>

### 2024-02 — CISA AA24-038a Volt Typhoon expanded advisory

- **Attributed actor**: Volt Typhoon (high; CISA + NSA + FBI + Five Eyes).
- **Target**: U.S. critical infrastructure across communications, energy, transport, water/wastewater.
- **Doctrine linkage**: attested — advisory states pre-positioning is "in the event of a major crisis or conflict with the United States."
- **Linkage confidence**: attested.
- **Citations**: <https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a>

### 2024-02 — i-Soon document leak

- **Attributed actor**: insider leak from Anxun ("i-Soon"), a Chengdu-based MSS/MPS/PLA contractor (high; corroborated by SentinelLabs, Unit 42, BBC, NHK).
- **Target**: not an event per se but a disclosure event.
- **Outcome**: first systematic public view of PRC's hacker-for-hire ecosystem; ties to APT41, POISON CARP, and Hong Kong democracy targeting.
- **Doctrine linkage**: validates the contractor-bureau model implementing MCF / Intelligence Law tasking.
- **Linkage confidence**: attested.

### 2024-03 — APT31 / Wuhan XRZ DOJ indictment + OFAC sanctions

- **Attributed actor**: APT31 (high; DOJ + OFAC + UK NCSC + UK FCDO).
- **Target**: U.S. White House and State Department officials, IPAC parliamentarians, defense contractors, energy, telecom; 2018 Texas energy compromise.
- **Doctrine linkage**: attested — Treasury cites critical infrastructure and political-espionage objectives.
- **Linkage confidence**: attested.
- **Citations**: <https://home.treasury.gov/news/press-releases/jy2205>

### 2024-07 — APT41 "DUST" global campaign (Mandiant)

- **Attributed actor**: APT41 (high; Mandiant + Google TAG).
- **Target**: shipping, logistics, technology, automotive, media in UK, Italy, Spain, Turkey, Taiwan, Thailand, Singapore.
- **Vector / TTP**: ANTSWORD/BLUEBEAM web shells → DUSTPAN dropper → BEACON.
- **Doctrine linkage**: BRI logistics intelligence; MIC2025 / 15th FYP industrial-system collection; Taiwan.
- **Linkage confidence**: strongly inferred.
- **Citations**: <https://cloud.google.com/blog/topics/threat-intelligence/apt41-arisen-from-dust>

### 2024-09 — FBI Flax Typhoon "Raptor Train" botnet takedown

- **Attributed actor**: Flax Typhoon / Integrity Technology Group (high; FBI press conference; later OFAC sanctions Jan 2025).
- **Target**: 260,000+ IoT/SOHO devices globally.
- **Outcome**: botnet disrupted; identified operating company.
- **Doctrine linkage**: attested — FBI / Treasury cite critical-infrastructure pre-positioning.
- **Linkage confidence**: attested.

### 2024-09 to 2024-12 — Salt Typhoon U.S. telecom mass compromise

- **Attributed actor**: Salt Typhoon / MSS (high; WSJ; FBI/CISA public statements; OFAC Jan 17 2025 designation of Sichuan Juxinhe).
- **Target**: AT&T, Verizon, T-Mobile, Lumen, Spectrum/Charter, Consolidated, Windstream — including CALEA lawful-intercept gateways.
- **Outcome**: bulk metadata access for >1M users; targeted content interception against political figures (incl. campaign staff for both 2024 U.S. presidential candidates).
- **Doctrine linkage**: attested — Treasury cites MSS sponsorship and SIGINT mission; CISA AA25-239a frames as global espionage system.
- **Linkage confidence**: attested.
- **Citations**: <https://home.treasury.gov/news/press-releases/jy2792>; <https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a>

### 2024-12 — U.S. Treasury BeyondTrust compromise (Silk Typhoon / APT27 cluster)

- **Attributed actor**: Silk Typhoon / Hafnium-adjacent (high; Treasury statement Dec 30 2024; OFAC sanctions on Yin Kecheng Jan 17 2025).
- **Target**: U.S. Treasury — OFAC and Office of the Secretary; ~3,000 unclassified files across 100 workstations.
- **Vector / TTP**: exploitation of BeyondTrust Remote Support (CVE-2024-12356 / CVE-2024-12686) → access to Treasury's authentication keys.
- **Doctrine linkage**: attested (by inference) — targeting OFAC reads as counterintelligence on pending sanctions against PRC, esp. Salt Typhoon / Flax Typhoon designations announced just weeks later.
- **Linkage confidence**: attested.
- **Citations**: <https://home.treasury.gov/news/press-releases/sb0042>

### 2025-01 — OFAC sanctions Integrity Tech (Flax Typhoon operator)

- **Attributed actor**: Flax Typhoon (high; OFAC).
- **Doctrine linkage**: attested — Treasury explicitly cites PRC state-sponsored critical-infrastructure activity.
- **Linkage confidence**: attested.
- **Citations**: <https://home.treasury.gov/news/press-releases/jy2769>

### 2025-01 — OFAC sanctions Sichuan Juxinhe (Salt Typhoon operator) + Yin Kecheng

- **Attributed actor**: Salt Typhoon (MSS); Yin Kecheng (MSS, Shanghai).
- **Doctrine linkage**: attested.
- **Citations**: <https://home.treasury.gov/news/press-releases/jy2792>

### 2025-07 — SharePoint "ToolShell" mass exploitation

- **Attributed actor**: Linen Typhoon (APT27), Violet Typhoon (APT31), Storm-2603 — all assessed PRC (high; Microsoft).
- **Target**: globally exposed on-prem SharePoint servers; including U.S. nuclear-weapons-related National Nuclear Security Administration entities per public reporting.
- **Doctrine linkage**: MIC2025 IT pillar + MCF (NNSA targeting).
- **Linkage confidence**: strongly inferred.

### 2025-08 — CISA / Five Eyes AA25-239a "Countering PRC Salt Typhoon" advisory

- **Attributed actor**: Salt Typhoon / OPERATOR PANDA / RedMike / UNC5807 / GhostEmperor (high; 13-government joint).
- **Target**: telecom, government, transportation, lodging, military networks across 80 countries / 200+ companies (FBI Aug 27 2025 statement).
- **Doctrine linkage**: attested — advisory explicitly states "feed global espionage system."
- **Linkage confidence**: attested.
- **Citations**: <https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a>

### 2025-09 — Mustang Panda renewed EU/NATO diplomatic campaign

- **Attributed actor**: Mustang Panda / TA416 (high; Proofpoint).
- **Target**: EU / NATO diplomatic missions across European countries.
- **Doctrine linkage**: BRI political intelligence + Russia-policy collection (in Mongolia/Russia-relevant geographies).
- **Linkage confidence**: strongly inferred.

### 2026-03 — Mustang Panda Middle East expansion

- **Attributed actor**: Mustang Panda / TA416 (medium; Proofpoint).
- **Target**: diplomatic and government entities in Middle East (post–Iran-conflict surge).
- **Doctrine linkage**: BRI political intelligence; new MENA collection priority.
- **Linkage confidence**: plausible.

---

## Aggregate patterns

- **Pre-2018**: dominant pattern is bulk commercial IP theft mapping to MIC2025 / Strategic Emerging Industries pillars (APT1, APT10, APT3, Su Bin, OPM/Anthem/Equifax bulk-PII).
- **2018–2021**: pivot to political intelligence and supply-chain leverage (APT31 vs. White House / IPAC, APT41 supply-chain attacks, Hafnium ProxyLogon).
- **2021–present**: emergence of **pre-positioning** doctrine — Volt Typhoon (May 2023), Flax Typhoon (Sept 2024), Salt Typhoon (Sept–Dec 2024) — explicitly framed by U.S. attribution as preparation for kinetic-contingency disruption and bulk SIGINT collection.
- **2024–2026**: contractor-ecosystem maturation visible from i-Soon, Wuhan XRZ, Sichuan Juxinhe, Integrity Tech disclosures — MSS provincial bureaus + private front companies is the operational pattern, with Five-Eyes coordination on attribution and sanctions accelerating.
