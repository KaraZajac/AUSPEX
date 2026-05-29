# United States — Cyber Actors (publicly attributed)

US offensive cyber units are rarely "outed" the way adversary APTs are. The actors below are either (a) self-identified by US government press releases, (b) attributed by tier-1 vendors (Kaspersky, Symantec) by tracking malware families later corroborated by leaks, or (c) journalistically named on multi-source reporting. Each entry flags which.

---

### Equation Group (aliases: APT-C-40, EQGRP)

- **Parent service**: NSA — Tailored Access Operations (TAO), now part of the Computer Network Operations Directorate / Cybersecurity Directorate reorganization (formerly designator S32 within Signals Intelligence Directorate)
- **Active since**: 2001 (Kaspersky's earliest samples; some artifacts trace to 1996)
- **Status**: active (units continuing in different organizational form; the *toolkit* exposed in 2016–17 is presumed rotated)
- **Primary mission**: signals intelligence via computer network exploitation — collection, not effect
- **Sectors targeted**: governments, militaries, telecoms (especially routers/firewalls and mobile-network core), nuclear research, financial institutions (BSI/EastNets — banking-message intermediaries in the Middle East), embassies, energy, aerospace; targeting heavily skewed to Iran, Russia, Pakistan, Afghanistan, India, China, Syria, Mali
- **Notable TTPs**: hard-drive firmware implants (EquationDrug, GrayFish), supply-chain interdiction (CD-ROM intercepts at Mecca attendee returns; Cisco router shipping intercepts per Snowden), zero-days at scale, persistent BIOS/UEFI implants, "DoubleFantasy"/"TripleFantasy" validators, **EternalBlue/EternalRomance/EternalChampion** SMB exploits, **DoublePulsar** kernel implant, **FuzzBunch** exploitation framework
- **Public attribution**:
  - Kaspersky GReAT, "Equation: The Death Star of Malware Galaxy" Feb 16, 2015 (Cancún SAS)
  - Shadow Brokers leaks Aug 2016 – April 2017 (full TAO toolkit dumps with NSA internal slang/codenames)
  - Confirmed by Reuters reporting citing former NSA personnel
  - Bvp47 backdoor: Pangu Lab (China) Feb 2022 — additional corroboration
- **Doctrine alignment**: pre-NSPM-13 SIGINT collection mission (Title 50). Distinct from CYBERCOM offensive ops. Equation Group's tooling underwrites the "find, fix, finish" intelligence support to CYBERCOM and policymakers.
- **Confidence**: very high (leak-corroborated technical attribution with internal documentation revealing TAO branding)

---

### Longhorn / The Lamberts (aliases: Lamberts family — Green/Black/Blue/Pink/Gray/White Lambert)

- **Parent service**: CIA — Center for Cyber Intelligence (CCI), specifically the Engineering Development Group (EDG); subdivisions per Vault 7: Embedded Development Branch (EDB), Operational Support Branch (OSB), Remote Devices Branch (RDB), Mobile Development Branch (MDB), Network Devices Branch (NDB)
- **Active since**: 2011 confirmed; Symantec found earliest activity 2007
- **Status**: presumed active; specific 2007–2013 tooling exposed in Vault 7 (2017) is presumed retired/rotated
- **Primary mission**: HUMINT-support cyber, covert action support, executive-target collection — broader effects mandate than NSA TAO (covert action authority under Title 50 §3093)
- **Sectors targeted**: government, financial, telecoms, energy, aerospace, IT — across Europe, Middle East, Asia, Africa (Symantec counted 40+ targets in 16 countries)
- **Notable TTPs**: in-memory implants, custom encryption (AES with custom modes per Vault 7), modular post-exploitation; specific named tools — Fluxwire (Symantec: Corentry), HIVE C2 framework, Brutal Kangaroo (air-gap jump via USB), Year Zero, Weeping Angel (Samsung TV firmware implant), Athena, Pandemic, ELSA (Wi-Fi geolocation)
- **Public attribution**:
  - WikiLeaks Vault 7 release March 7, 2017 onward (8,761 documents)
  - Symantec "Longhorn: Tools used by cyberespionage group linked to Vault 7" April 10, 2017 — connected pre-existing Longhorn cluster to Vault 7 tools with "high confidence"
  - Kaspersky "Unraveling the Lamberts Toolkit" April 11, 2017 — independent tracking under Lamberts naming
  - Joshua Schulte (former CIA EDG developer) convicted July 13, 2022 of leaking Vault 7
- **Doctrine alignment**: CIA Title 50 covert action; the EDG/CCI architecture is the operational expression of the CIA's authority to conduct cyber covert action with presidential finding
- **Confidence**: high — Symantec/Kaspersky technical attribution + Vault 7 documentary corroboration + Schulte conviction

---

### "Olympic Games" team (no public unit designation — joint US/Israel)

- **Parent service**: NSA + CIA on US side; Unit 8200 on Israeli side. Reported originating sponsor: Bush administration NSC and CIA; continued under Obama.
- **Active since**: development circa 2005–2007; deployment 2007–2010 (Stuxnet); related malware 2009–2012 (Duqu, Flame, Gauss)
- **Status**: operation "publicly known"; specific unit composition opaque
- **Primary mission**: sabotage of Iranian nuclear enrichment (Stuxnet at Natanz); reconnaissance (Flame, Duqu) and financial-system mapping (Gauss, against Lebanese banking)
- **Sectors targeted**: Iranian nuclear (Natanz, Bushehr-area), Iranian oil ministry (Flame "Wiper" precursor), Lebanese banking (Gauss)
- **Notable TTPs**: four-zero-day worm (Stuxnet); PLC rootkit targeting Siemens S7-315/417; spread via removable media to bridge air gaps; certificate theft from Realtek and JMicron for driver-signing; ICS-specific payload mutating centrifuge rotor speeds
- **Public attribution**:
  - David Sanger, NYT, "Obama Order Sped Up Wave of Cyberattacks Against Iran" June 1, 2012
  - Sanger, *Confront and Conceal* (2012)
  - Kim Zetter, *Countdown to Zero Day* (2014)
  - Snowden's June 2013 SPIEGEL interview confirmed US/IL Stuxnet authorship from the IC's perspective
  - Symantec W32.Stuxnet dossier (Falliere/O'Murchu/Chien) Feb 2011
- **Doctrine alignment**: predates the NSPM-13/Defend Forward era but is the foundational US offensive-cyber case study. Demonstrated cyber as a *strategic-effect* tool; influenced both PPD-20/NSPM-13 development and Iranian counter-doctrine
- **Confidence**: high (multi-source journalism + Snowden corroboration); never officially acknowledged by US or Israeli governments

---

### Joint Task Force ARES (JTF-ARES)

- **Parent service**: USCYBERCOM (Title 10) — established 2016 under then-Maj. Gen. Paul Nakasone (then commander of Army Cyber Command, later USCYBERCOM/NSA)
- **Active since**: April–May 2016; flagship op (Glowing Symphony) launched November 2016
- **Status**: active (continues as counter-VEO cyber task force)
- **Primary mission**: deny ISIS use of cyberspace — disrupt media/propaganda infrastructure, financial nodes, C2
- **Sectors targeted**: ISIS-controlled or ISIS-affiliated online media (al-Hayat Media Center, Amaq Agency social-media accounts, content-distribution servers), encryption-using messaging infrastructure
- **Notable TTPs**: account takeover, password reset abuse via stored recovery emails, content-delivery infrastructure disruption, infrastructure provider engagement
- **Public attribution**: DoD-acknowledged (Carter, then Mattis); CYBERCOM press releases; National Security Archive FOIA-declassified 120-day assessment Jan 2020; NPR/Dina Temple-Raston "How the U.S. Hacked ISIS" Sept 2019 (multi-part)
- **Doctrine alignment**: prototypical Defend Forward operation; counter-terrorism extension of Persistent Engagement
- **Confidence**: attested

---

### Cyber National Mission Force (CNMF)

- **Parent service**: USCYBERCOM sub-unified command (elevated December 19, 2022; previously NMF-Cyber)
- **Active since**: 2014 (initial); 2018 FOC; 2022 sub-unified
- **Status**: active; currently commanded by Maj. Gen. Lorna Mahlock (USMC, first Marine and first Black female 2-star to command a sub-unified command)
- **Primary mission**: defend the nation in cyberspace — runs the Hunt Forward program, IRA-style election-defense operations, and CYBERCOM's overt named ops against adversary criminal/state infrastructure
- **Sectors targeted**: adversary-controlled infrastructure on partner-state networks; election-period adversary infrastructure; criminal-services-as-state-proxy networks (Trickbot)
- **Notable TTPs**: collaborative-hunt with partner CERTs/intelligence services; release of adversary indicators (CNMF has uploaded hundreds of malware samples to VirusTotal since 2018, an unprecedented overt-attribution practice); kinetic-light disruption (DDoS/account-actions/infrastructure-removal) coordinated with FBI/Treasury
- **Public attribution**: cybercom.mil; multiple Nakasone/Haugh testimony
- **Doctrine alignment**: operational arm of Persistent Engagement / Defend Forward / Hunt Forward
- **Confidence**: attested

---

### NSA Special Source Operations (SSO) and Tailored Access Operations sub-units (TAO/ROC/ANT)

- **Parent service**: NSA
- **Sub-units (per Snowden/Der Spiegel):**
  - **TAO Remote Operations Center (ROC) — S321**: ~600 staff (as of 2013); CNE operators conducting remote computer exploitation
  - **TAO Access Technologies Operations (ATO)**: physical-access / interdiction operations
  - **TAO Data Network Technologies Branch (DNT)**: tool development
  - **TAO Telecommunications Network Technologies Branch (TNT)**: telecom-network tradecraft
  - **TAO Mission Infrastructure Technologies Branch (MIT)**: C2 infrastructure
  - **Advanced/Access Network Technology (ANT) Division**: the ANT catalog (50 pages, $0–$250,000 implants) — hardware/firmware implants, RF retroreflectors (COTTONMOUTH, RAGEMASTER), router/firewall implants (JETPLOW for Cisco PIX, FEEDTROUGH for Juniper, HALLUXWATER for Huawei)
  - **Special Source Operations (SSO)**: collection from US telecom partners (PRISM, FAIRVIEW, BLARNEY, STORMBREW)
- **Active since**: TAO since 1997; ANT 2008-era catalog
- **Status**: organizationally reorganized; capabilities presumed continuing
- **Public attribution**: Snowden 2013 documents (Der Spiegel "NSA Secret Toolbox" Dec 30, 2013); James Bamford; The Intercept SIDtoday releases
- **Doctrine alignment**: NSA's Title 50 SIGINT mission; the toolkit underwriting Equation Group activity
- **Confidence**: high (extensive documentary leak)

---

### Special Collection Service (SCS) — codename F6

- **Parent service**: joint CIA + NSA black-budget program; HQ Beltsville, Maryland; leadership rotates CIA/NSA
- **Active since**: late 1970s
- **Status**: active
- **Primary mission**: close-access SIGINT — covert insertion of collection equipment in diplomatic premises and difficult-access targets ("STATEROOM" cover for embassy-rooftop collection)
- **Sectors targeted**: foreign embassies, presidential/PM offices, multilateral institutions (UN HQ NY, EU Brussels), critical communications hubs
- **Notable operations attributed**: Merkel cellphone targeting (2002–2013, Snowden), tap on EU institutions, Brazilian presidency monitoring, UN HQ wiretap (Snowden NSA Stateroom slides)
- **Public attribution**: Snowden 2013 documents; James Bamford *Body of Secrets*; The Intercept SIDtoday "SCS and Executive Protection" and "State of Covert Collection" releases
- **Doctrine alignment**: Title 50 SIGINT collection; supports policymaker briefings and diplomatic negotiations
- **Confidence**: high (documentary leak; never officially acknowledged)

---

### Cyber Mission Force — generalized actor entry

- **Parent service**: USCYBERCOM (133 teams at FOC; 147-team end-state per FY24 budget)
- **Composition by service**:
  - **ARCYBER / 780th MI Brigade** (Army; Fort Meade and Fort Gordon)
  - **FLTCYBER / 10th Fleet** (Navy; Fort Meade)
  - **AFCYBER / 16th Air Force** (Air Force; Lackland)
  - **MARFORCYBER** (Marines; Fort Meade)
  - **SPACECYBER** (Space Force; relatively new)
  - **Coast Guard Cyber Command** (CGCYBER; supports homeland defense missions)
- **Team types**:
  - **Cyber Combat Mission Teams (CMTs)** — 27 teams, aligned to combatant commands
  - **Cyber Protection Teams (CPTs)** — 68 teams, defend DoDIN
  - **Cyber National Mission Teams (NMTs)** — 13 teams, under CNMF
  - **Cyber Support Teams** — CSTs and NSTs
- **Doctrine alignment**: the force-presentation model executing the 2023 DoD Cyber Strategy
- **Confidence**: attested (official structure)

---

### "Tilted Temple" / "Crouching Yeti" inverse — i.e., not US

(Included only to flag: the names sometimes thrown at US actors like "Project Sauron" / "ProjectSauron" / "Strider" by Symantec/Kaspersky 2016 are *not* publicly attributed to the US despite tradecraft similarity. Excluded from this dossier as un-attributed.)

---

### CIA Information Operations Center (IOC)

- **Parent service**: CIA (Directorate of Operations until 2015 reorg; now Directorate of Digital Innovation cooperates closely with CCI)
- **Active since**: founded 1996 as "Critical Defense Technologies Division"; reorganized into IOC
- **Status**: active; less publicly visible than CCI
- **Primary mission**: HUMINT-paired cyber operations supporting covert action programs
- **Public attribution**: Bob Woodward (Washington Post and books) — covert action coverage; no direct technical attribution
- **Confidence**: medium (existence well-attested; operational scope inferred)

---

## Summary table

| Actor | Service | Title | Attribution evidence | Confidence |
|---|---|---|---|---|
| Equation Group | NSA TAO | 50 | Kaspersky 2015 + Shadow Brokers 2016–17 | very high |
| Longhorn/Lamberts | CIA CCI/EDG | 50 | Symantec/Kaspersky 2017 + Vault 7 + Schulte conviction | high |
| Olympic Games team | NSA+CIA+IL Unit 8200 | mixed | Sanger, Zetter, Snowden, Symantec | high (journalism) |
| JTF-ARES | CYBERCOM | 10 | DoD official + FOIA | attested |
| CNMF | CYBERCOM | 10 | cybercom.mil | attested |
| SCS / F6 | CIA + NSA | 50 | Snowden + Bamford | high (leak) |
| CMF (CMT/CPT/NMT) | CYBERCOM | 10 | official | attested |
| ANT / ROC / TAO sub-units | NSA | 50 | Snowden / Der Spiegel | high (leak) |
| CIA IOC | CIA | 50 | journalism | medium |
