# DPRK cyber actors

Named clusters attributed to the DPRK. Vendor naming is fragmented — for each cluster the entry lists all known aliases and which vendor coined which.

> Note on hierarchy: "Lazarus Group" / "Hidden Cobra" is used by US Government (CISA, FBI, Treasury) as an **umbrella** for RGB-attributed cyber activity. Mandiant's March 2024 "Not So Lazarus" report disaggregates the umbrella into distinct actor clusters reporting to **Lab 110** (the expanded successor to Bureau 121), with additional clusters elsewhere in the RGB and MSS. The Microsoft "Sleet" taxonomy is the most granular contemporary mapping.

---

### Lazarus Group (core) — aliases: Hidden Cobra, TEMP.Hermit, Diamond Sleet, ZINC, Labyrinth Chollima, NICKEL ACADEMY

- **Parent service**: RGB → Lab 110 (expanded Bureau 121). Front-companies historically: Chosun Expo Joint Venture (Dalian, PRC); Chosun Baeksul Trading Company (Shenyang, PRC).
- **Active since**: 2007 (some assessments); first major op July 2009 (Operation Troy DDoS).
- **Status**: active; multiple individuals indicted (Park Jin Hyok 2018; Jon Chang Hyok and Kim Il 2021); OFAC SDN-listed.
- **Primary mission**: hybrid — destructive ops, espionage, and revenue. Most "Lazarus" press attributions are now better mapped to a more specific sub-cluster.
- **Sectors targeted**: media (Sony 2014), critical infrastructure (WannaCry 2017, indirect), ROK government and banking (DarkSeoul 2013), defense industrial base globally.
- **Notable TTPs**: destructive wipers (Destover/SHAMOON-class custom); supply-chain compromise; spear-phishing via fake recruiters on LinkedIn; signed malware abusing stolen certs.
- **Public attribution**: DOJ Park Jin Hyok complaint (Sep 2018); DOJ Three-Hacker indictment (Feb 2021); OFAC SDN; FBI/CISA AA20-239A; CrowdStrike Labyrinth Chollima profile; Microsoft Diamond Sleet.
- **Doctrine alignment**: Juche (asymmetric independent capability); Songun (RGB institutional ownership); pre-2018 Byungjin (Sony, Bangladesh, WannaCry all sit inside this window); post-2018 nuclear-modernization doctrine.

---

### APT38 — aliases: BlueNoroff, BeagleBoyz, Stardust Chollima, Sapphire Sleet, NICKEL GLADSTONE, COPERNICIUM, TA444

- **Parent service**: RGB → Lab 110, financial-theft cluster. Mandiant separates APT38 from "Lazarus core" precisely because the financial-targeting tradecraft is distinct.
- **Active since**: ~2014.
- **Status**: active; sanctioned; named in DOJ Three-Hacker indictment Feb 2021.
- **Primary mission**: financial theft against banks, SWIFT-network endpoints, cryptocurrency exchanges, ATMs.
- **Sectors targeted**: banks in 38+ countries (Bangladesh, Vietnam, Taiwan, Mexico, Chile, India, Malta, Africa); cryptocurrency exchanges; over time has progressively migrated from SWIFT to crypto.
- **Notable TTPs**: long, careful pre-positioning (often months) inside target banks; SWIFT Alliance Access message manipulation; local-printer subversion to suppress fraudulent-transfer evidence; FASTCash ATM-cashout malware.
- **Public attribution**: Mandiant APT38 report (Oct 2018); DOJ Three-Hacker indictment (Feb 2021) explicitly names Bangladesh Bank, banks in Vietnam, Mexico, Malta, and crypto exchange thefts; CISA AA20-239A (BeagleBoyz); Microsoft Sapphire Sleet.
- **Doctrine alignment**: hard-currency mechanism doctrine; post-2018 nuclear-modernization line; Office 39 revenue stream.

---

### TraderTraitor / Citrine Sleet / Jade Sleet cluster — aliases: Jade Sleet, UNC4899, Slow Pisces, Citrine Sleet (AppleJeus), UNC4736, AppleJeus, Hidden Cobra (overlap)

- **Parent service**: RGB **3rd Bureau** (named explicitly in FBI IC3 Bybit PSA, Feb 2025). Treated by Microsoft as multiple "Sleets" with substantial operational overlap.
- **Active since**: 2018 (AppleJeus campaign).
- **Status**: active; OFAC sanctioned (Lazarus wallet sanction April 2022, post-Ronin); referred to by US Government as "TraderTraitor."
- **Primary mission**: cryptocurrency theft via supply-chain attacks on Web3 vendors, fake-recruiter social engineering of crypto-firm employees, trojanized crypto-trading applications.
- **Sectors targeted**: cryptocurrency exchanges, custody/wallet vendors, DeFi bridges, Web3 developer tooling, npm/PyPI ecosystem.
- **Notable TTPs**: trojanized cryptocurrency trading apps (CelasTradePro, JMTTrading); fake LinkedIn recruiters delivering malicious "coding tests"; npm package poisoning; Chromium zero-day exploitation (CVE-2024-7971); supply-chain pivot (3CX → X_TRADER → downstream crypto firms; JumpCloud → cryptocurrency clients; Safe{Wallet} → Bybit).
- **Public attribution**: CISA AA22-108A (April 2022 TraderTraitor advisory); FBI Harmony PSA (Jan 2023); FBI Stake.com PSA (Sept 2023); FBI DMM Bitcoin PSA (Dec 2024); FBI Bybit PSA250226 (Feb 26 2025); Microsoft Citrine Sleet blog Aug 2024; Mandiant UNC4899/UNC4736 reporting; Treasury 2022 Ronin wallet SDN.
- **Doctrine alignment**: hard-currency mechanism (top-tier earner); 8th Party Congress modernization plan as ultimate purpose; sanctions-evasion doctrine.

---

### Andariel — aliases: Onyx Sleet, Silent Chollima, Stonefly, APT45, PLUTONIUM, DarkSeoul (historical)

- **Parent service**: RGB → Lab 110, militarized-targeting cluster. ~1,600 personnel per ROK MND historical estimates.
- **Active since**: 2009 (early Operation Troy participation); the Andariel name dates to ~2015.
- **Status**: active; indicted (Rim Jong Hyok, Kansas grand jury, July 2024); Treasury sanctioned.
- **Primary mission**: dual — strategic-intel collection against defense / aerospace / nuclear / government targets, *plus* healthcare-sector ransomware (Maui) as a revenue self-funder for those operations.
- **Sectors targeted**: ROK and US defense contractors; aerospace; US Air Force bases (2); NASA Office of Inspector General (per 2024 indictment); healthcare and pharma (Maui ransomware victims, May 2021–2023); energy.
- **Notable TTPs**: Maui ransomware (custom, manually deployed); exploitation of public-facing apps (Log4Shell CVE-2021-44228; TerraMaster OS CVE-2022-24990; SonicWall SMA100 CVE-2021-20038); long-dwell defense-network intrusions; PRC-routed money laundering to fund operational infrastructure.
- **Public attribution**: DOJ Rim Jong Hyok indictment (July 25 2024); FBI/CISA/HHS AA22-187A Maui Ransomware advisory (July 2022); CISA AA23-040A joint advisory with ROK NIS (Feb 2023); Microsoft Onyx Sleet; Symantec Stonefly tracking.
- **Doctrine alignment**: 8th Party Congress modernization line (defense-tech collection on missile/sub/satellite systems); hard-currency mechanism (Maui ransomware funds further intrusions); Songun institutional legacy.

---

### Kimsuky — aliases: APT43, Velvet Chollima, Emerald Sleet, Black Banshee, THALLIUM, TA427, Springtail, Earth Kumiho, ARCHIPELAGO

- **Parent service**: RGB; some elements likely tasked by United Front Department (UFD) on diaspora targeting. Mandiant March 2023 report consolidated reporting under "APT43."
- **Active since**: at least 2012.
- **Status**: active; OFAC sanctioned the Kimsuky entity in November 2023; the South Korean MOFA imposed counterpart sanctions.
- **Primary mission**: strategic and political intelligence collection on nuclear/foreign-policy issues; targeting of think tanks, academics, journalists, defectors, NGOs.
- **Sectors targeted**: ROK foreign-policy think tanks; US Korea-watcher think tanks (CSIS, Brookings); US Treasury (per DOJ 2023 indictment naming THALLIUM); journalists at NK News, Daily NK, RFA; defector networks; nuclear-policy academics.
- **Notable TTPs**: long-tail spear-phishing impersonating journalists/researchers; credential harvesting via fake login pages for Naver, Google, Daum, university SSO; BabyShark, KLogEXE, FPSpy malware families; self-funding via small-scale cybercrime (per Mandiant APT43).
- **Public attribution**: Treasury OFAC sanctions on Kimsuky entity (Nov 30 2023); Mandiant APT43 report (Mar 28 2023); Microsoft Emerald Sleet blog; CISA AA20-301A; Volexity multiple reports; KISA / ROK NIS joint reporting.
- **Doctrine alignment**: strategic-information / Juche internal-security doctrine; nuclear-modernization line (collection on adversary nuclear-policy responses).

---

### APT37 — aliases: ScarCruft, Reaper, InkySquid, Ricochet Chollima, Group123, TEMP.Reaper, Geumseong121, APT-C-28, Venus 121

- **Parent service**: Ministry of State Security (MSS) — distinguished from RGB. Operational separation from Kimsuky despite target overlap.
- **Active since**: 2012.
- **Status**: active; not formally indicted/sanctioned as a unit (individuals not yet publicly named).
- **Primary mission**: espionage on individuals and entities that threaten regime political security — defectors, dissidents, journalists, ROK/JP policy entities. Less financial motivation than RGB clusters.
- **Sectors targeted**: ROK (primary), Japan, Vietnam, Middle East (Kuwait, Romania), Russia, India, Nepal, China; targeting profile skewed toward individuals and small NGOs rather than large enterprises.
- **Notable TTPs**: Hangul Word Processor (HWP) zero-days and weaponized documents; ROKRAT, Chinotto, GoldBackdoor malware families; Flash zero-day chains (CVE-2018-4878, CVE-2016-4171); LNK-based infection chains (2023+).
- **Public attribution**: FireEye/Mandiant *APT37 (Reaper)* report (Feb 2018); Kaspersky ScarCruft research (2016+); Cisco Talos Group 123; Volexity InkySquid (2021).
- **Doctrine alignment**: Juche internal-security tasking (defectors, diaspora); strategic-information doctrine; minimally aligned to hard-currency doctrine — APT37 does not appear to pursue financial theft.

---

### Moonstone Sleet — aliases: Storm-1789 (predecessor designation)

- **Parent service**: RGB-aligned per Microsoft; operationally distinct from Diamond Sleet but began as a Diamond Sleet code-reuser, suggesting personnel migration or shared parent organization.
- **Active since**: ~early August 2023 (Microsoft assessment May 2024).
- **Status**: active.
- **Primary mission**: hybrid — cyberespionage, revenue (ransomware), and access acquisition through unusually creative cover (fake game, fake company personas).
- **Sectors targeted**: software vendors, defense aerospace, education, IT/communication, financial services; targets globally distributed.
- **Notable TTPs**: trojanized PuTTY and SumatraPDF; fake-company social engineering ("StarGlow Ventures," "C.C. Waterfall"); malicious game *DeTankWar*; npm-package distribution; **FakePenny** custom ransomware (April 2024, ~$6.6M demand).
- **Public attribution**: Microsoft MSTIC blog (May 28 2024); subsequent Microsoft and vendor follow-ups (Aug 2024 npm targeting).
- **Doctrine alignment**: hard-currency mechanism (FakePenny); nuclear-modernization line (defense aerospace targets); innovation in revenue diversification (gaming vector).

---

### DPRK Remote IT-Worker Fraud Cluster — aliases: "Wagemole" (Palo Alto Unit 42), Famous Chollima (CrowdStrike, partial), Jasper Sleet (Microsoft, from June 2025), "UNC5267" (Mandiant, partial)

- **Parent service**: Munitions Industry Department (MID) of WPK and Ministry of External Economic Relations are the named bureaucratic owners in OFAC sb0416 (May 2024); RGB facilitates through forged-documents support; downstream revenue flows to Office 39 and weapons procurement.
- **Active since**: ~2018 in current form (UN PoE has tracked DPRK overseas IT workers since at least 2016).
- **Status**: highly active; multiple OFAC actions 2022–2025; DOJ Christina Chapman sentencing July 25 2025; 14-national DOJ indictment (Dec 2024).
- **Primary mission**: revenue (wage fraud) and increasingly insider-access acquisition and post-employment extortion.
- **Sectors targeted**: US Fortune 500 (Chapman case: 309 US businesses defrauded, 68 identities stolen); crypto firms and Web3 startups (where IT-worker placement can pivot directly to TraderTraitor crypto-theft); broad enterprise SaaS, gaming, and AI.
- **Notable TTPs**: stolen US-citizen identities; AI-generated headshots and increasingly deepfaked interviews; "laptop farms" inside the US (the Chapman model); routing of corporate laptops via shipping to PRC border cities then into DPRK; fake LinkedIn and GitHub personas; ETH-denominated wage receipt; *post-termination* data-exfiltration and extortion (Microsoft Jasper Sleet, June 2025).
- **Public attribution**: Treasury sb0416 (May 2024); Treasury sb0302 (Mar 2023); Treasury sb0230 (Mar 2024); DOJ press release on 14-national indictment (Dec 12 2024); DOJ Christina Chapman sentencing (July 24 2025); Microsoft Jasper Sleet blog (June 30 2025); FBI joint advisory with State and Treasury (May 2022, updated Oct 2023).
- **Doctrine alignment**: **direct** — Treasury sb0416 explicitly states proceeds "generate revenue to fund the DPRK's WMD programs." This is gold-standard attested doctrine linkage to the 8th Party Congress modernization line.

---

### Less-prominent named clusters (briefly)

- **H0lyGh0st (PLUTONIUM / DEV-0530)** — Microsoft-named DPRK-aligned ransomware operation (2022); small SMB targeting. CISA covered in AA23-040A.
- **APT37 sub: InkySquid** — Volexity 2021 browser-exploit campaign against South Korean newspaper.
- **Famous Chollima** — CrowdStrike's name overlapping with the IT-worker scheme and some Diamond Sleet activity; used inconsistently across vendors.
- **Lazarus subgroup: Bureau 325 / Lab 110 medical-research cell** — UK NCSC and Microsoft reported COVID-19 vaccine research targeting (Pfizer, AstraZeneca, Cerba) in 2020–21; not consistently named as a separate APT but real.
- **Konni** — sometimes attributed to DPRK (Cisco Talos), sometimes overlapped with Kimsuky; attribution debated.

---

## Attribution-source matrix

| Source | Strongest contributions |
| --- | --- |
| DOJ | Indictments name specific individuals and unit alignments (Park Jin Hyok 2018; Jon Chang Hyok + Kim Il 2021; Rim Jong Hyok 2024; 14-national IT-worker 2024). |
| Treasury OFAC | SDN listings tie names to entities and articulate the **WMD-financing strategic goal** — primary source for attested doctrine linkage. |
| FBI IC3 / Cyber Division | Per-incident attribution PSAs (Harmony, Stake.com, DMM, Bybit) with cluster naming. |
| CISA | Joint advisories with NSA/FBI/ROK NIS/HHS (#StopRansomware DPRK, Maui, TraderTraitor, BeagleBoyz). |
| UN 1718 PoE | Independent verification of crypto-theft scale through March 2024. **Mandate ended April 2024**. |
| MSMT (Multilateral Sanctions Monitoring Team) | New (2024–) replacement for UN PoE; preliminary reports already cited by State Dept. |
| ROK NIS / KISA | Localized intel-source attribution; jointly publishes with US in CISA advisories. |
| Mandiant | "Not So Lazarus" (Mar 2024); APT43 report (Mar 2023); APT38 report (2018); APT37 report (2018). |
| Microsoft MSTIC | "Sleet" taxonomy granularity; Diamond/Sapphire/Onyx/Emerald/Citrine/Moonstone/Jasper Sleet blogs. |
| CrowdStrike | "Chollima" taxonomy; Labyrinth, Silent, Stardust, Ricochet, Famous. |
| Kaspersky | ScarCruft research; Lazarus persistent tracking. |
| Chainalysis / TRM Labs / Elliptic | Crypto on-chain tracing — primary for connecting theft events to subsequent laundering and cumulative totals. |
