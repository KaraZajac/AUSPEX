# Iran — Named Cyber Actors

### APT33 (aliases: Refined Kitten, Elfin, Peach Sandstorm, HOLMIUM, Magnallium)

- **Parent service**: IRGC (assessed); operating from companies including Nasr Institute and Sayyed Shojaa Mojarad-linked entities per various reporting.
- **Active since**: 2013.
- **Status**: active.
- **Primary mission**: espionage and pre-positioning in aerospace, defense, and energy; destructive capability development (Shamoon lineage).
- **Sectors targeted**: aerospace (Saudi, US, South Korean), petrochemical, energy (Saudi Aramco upstream and refining), defense.
- **Notable TTPs**: spear-phishing with aerospace-themed lures, custom backdoors (TURNEDUP, NANOCORE wrappers), commodity malware, password-spray; linked by multiple vendors to Shamoon disk-wiper operations.
- **Public attribution**: FireEye / Mandiant 2017 report; Microsoft (as Peach Sandstorm / HOLMIUM); CrowdStrike (Refined Kitten).
- **Doctrine alignment**: Forward Defense (Gulf-energy and Israel-supporter targeting); Asymmetric Warfare (destructive capability).

### APT34 (aliases: OilRig, Helix Kitten, Cobalt Gypsy, IRN2, Hazel Sandstorm, EUROPIUM, Crambus, Earth Simnavaz, TA452, ITG13)

- **Parent service**: MOIS (assessed by Mandiant, Microsoft, and multiple vendors).
- **Active since**: c. 2014.
- **Status**: active.
- **Primary mission**: regional cyber-espionage against Middle East government, telecom, energy, and financial sectors.
- **Sectors targeted**: government (Iraq, Jordan, Saudi, UAE, Kuwait, Yemen, Lebanon), telecom, energy, financial services, transportation.
- **Notable TTPs**: DNS tunneling (DNSpionage, Karkoff), web-shell deployment, supply-chain compromises of MSPs and IT vendors, credential theft; toolkit (Glimpse, PoisonFrog, HyperShell, HighShell, Fox Panel, Webmask) leaked via Lab Dookhtegan in 2019.
- **Public attribution**: Mandiant/FireEye; Microsoft; Cisco Talos; Symantec (as Crambus); Lab Dookhtegan personal-data dump of MOIS officers (2019).
- **Doctrine alignment**: Forward Defense (regional adversary intelligence); Axis of Resistance (intel on Iraqi political/military actors).

### APT35 (aliases: Charming Kitten, Phosphorus, Mint Sandstorm, TA453, Newscaster, Ballistic Bobcat, Magic Hound)

- **Parent service**: IRGC (per Microsoft, Mandiant, Proofpoint, SecureWorks).
- **Active since**: 2014 or earlier.
- **Status**: active.
- **Primary mission**: strategic espionage and surveillance against journalists, dissidents, think-tanks, US officials, nuclear/Iran policy researchers.
- **Sectors targeted**: think-tanks (Brookings, RAND, Atlantic Council, FDD targets), media (BBC Persian, VOA, Iran International staff), academic nuclear-policy researchers, US Treasury officials, current/former Trump admin officials, Iranian diaspora.
- **Notable TTPs**: long-running social-engineering with persona development; OAuth abuse; Google Workspace and Microsoft 365 credential phishing; HYPERSCRAPE mailbox exfiltration; mobile spyware against Iranian dissidents.
- **Public attribution**: Microsoft (annual Mint Sandstorm reports); Mandiant; Google TAG; Microsoft civil lawsuit 2019 seizing 99 domains; multiple US indictments of named operators 2018-2024.
- **Doctrine alignment**: Constitutional IRGC role (counter-foreign-threat); Post-Soleimani retaliation (named officials targeting); Forward Defense.

### APT42 (aliases: overlap with Mint Sandstorm cluster, TA453 overlap; UNC788; CALANQUE; Yellow Garuda)

- **Parent service**: IRGC-Intelligence Organisation (IRGC-IO), per Mandiant.
- **Active since**: 2015 (vendor assessment).
- **Status**: active; indicted operators Sept 2024.
- **Primary mission**: domestic counter-dissident plus foreign hack-and-leak; targets US political figures and campaigns.
- **Sectors targeted**: NGOs, media, academia, legal services, activists; in 2024, US presidential campaigns.
- **Notable TTPs**: extended rapport-building social engineering; impersonation of journalists, conference organisers; harvesting credentials then mobile-device surveillance; "hack-and-leak" via journalist intermediaries.
- **Public attribution**: Mandiant "Untangling Iran's APT42 Operations" (2024); DOJ Sept 27 2024 indictment of Masoud Jalili, Seyyed Ali Aghamiri, Yaser Balaghi.
- **Doctrine alignment**: Constitutional IRGC role; Post-Soleimani retaliation (explicitly named in DOJ indictment).

### MuddyWater (aliases: Static Kitten, Mango Sandstorm, Mercury, Seedworm, TEMP.Zagros, Earth Vetala, DEV-1084 in DarkBit work)

- **Parent service**: MOIS, formally attributed by CISA AA22-055A (Feb 2022).
- **Active since**: c. 2017.
- **Status**: active.
- **Primary mission**: cyber-espionage and increasingly destructive disk-wiping disguised as ransomware (DarkBit).
- **Sectors targeted**: telecommunications, defense, government (local and national), oil and natural gas — across Asia, Africa, Europe, North America. Notable Israel focus (Technion 2023).
- **Notable TTPs**: PowerShell-heavy custom tooling (POWERSTATS, PowGoop), DLL side-loading, exploitation of public-facing vulns, hands-on-keyboard intrusions; ransomware front (DarkBit) for destructive ops.
- **Public attribution**: CISA AA22-055A; Talos; Trend Micro; INCD attribution of Technion DarkBit attack to MuddyWater/MERCURY (Feb 2023).
- **Doctrine alignment**: Forward Defense; Asymmetric Warfare; Cyber-as-deniable-retaliation (DarkBit persona).

### APT39 (aliases: Chafer, Remix Kitten, Remexi, ITG07, Cadelspy; front: Rana Intelligence Computing Company)

- **Parent service**: MOIS, per US Treasury OFAC designation (Sept 17, 2020).
- **Active since**: 2014.
- **Status**: sanctioned; activity continued under successor groupings.
- **Primary mission**: surveillance of dissidents and journalists; secondary travel-sector and telecom collection enabling movement tracking.
- **Sectors targeted**: travel, telecom, high-tech; Iranian dissidents domestically and across 30+ countries.
- **Notable TTPs**: Remexi backdoor; mobile spyware (RANA Android malware); deep collection on individuals.
- **Public attribution**: Treasury OFAC sm1127 (Sept 2020); FBI joint advisory; FireEye/Mandiant initial 2019 report.
- **Doctrine alignment**: Constitutional regime-preservation; Forward Defense (against diaspora).

### Pioneer Kitten / Fox Kitten (aliases: UNC757, Parisite, Rubidium, Lemon Sandstorm; operates Pay2Key)

- **Parent service**: IRGC-affiliated (FBI/CISA AA20-259A and AA24-241A assessment).
- **Active since**: 2017.
- **Status**: active; rebranded ransomware activity in 2025.
- **Primary mission**: initial-access broker selling/handing-off access to ransomware affiliates (NoEscape, RansomHouse, ALPHV/BlackCat); direct ransomware via Pay2Key.
- **Sectors targeted**: US defense, education, financial services, local government, healthcare; Israeli companies (Pay2Key 2020-21, Pay2Key.I2P 2025).
- **Notable TTPs**: exploitation of edge devices (Fortinet, Citrix, Pulse Secure, F5, Palo Alto, Check Point); webshells; credential theft; partnership rather than self-deployment of ransomware.
- **Public attribution**: CISA AA24-241A (Aug 2024); CrowdStrike (Pioneer Kitten); ClearSky 2020 "Fox Kitten" report; Check Point Pay2Key 2020 report.
- **Doctrine alignment**: Sanctions-Evasion (revenue); Asymmetric Warfare; Cyber-as-deniable-retaliation (Pay2Key persona).

### CyberAv3ngers (no aliases beyond persona)

- **Parent service**: IRGC-Intelligence Organisation (IRGC-IO), per CISA AA23-335A (Dec 1, 2023) and OFAC designations (Feb 2, 2024). Specifically tied by OFAC to officers of the IRGC-IO Cyber-Electronic Command including Hamid Reza Lashgarian.
- **Active since**: 2020 (early activity, Bay Area water defacement); high-tempo operations from Oct 2023.
- **Status**: active; sanctioned.
- **Primary mission**: OT/ICS sabotage and intimidation; specifically targets Israeli-made equipment in Western critical infrastructure.
- **Sectors targeted**: water and wastewater (US, Israel, Ireland), energy.
- **Notable TTPs**: exploitation of internet-exposed Unitronics Vision PLCs with default/weak credentials; replacement of ladder logic; HMI defacement with anti-Israel messaging; intentional alarms ("we want to be found").
- **Public attribution**: CISA/FBI/NSA/EPA/INCD/CCCS/NCSC joint advisory AA23-335A; Treasury OFAC Feb 2 2024 designation of six IRGC-IO officials including Lashgarian; CISA AA26-097A 2026 reissue.
- **Doctrine alignment**: Cyber-as-deniable-retaliation (attested via OFAC); Forward Defense; Axis of Resistance (anti-Israel coercion).

### HomeLand Justice (persona)

- **Parent service**: MOIS, per US Treasury OFAC jy0941 (Sept 9, 2022) and CISA AA22-264A.
- **Active since**: June 2022.
- **Status**: active (intermittent).
- **Primary mission**: destructive and leak operations against Albanian government and any state hosting the MEK.
- **Sectors targeted**: Albanian government IT, Albanian state police, immigration databases.
- **Notable TTPs**: 14-month dwell time before July 2022 destructive launch; ROADSWEEP wiper; ZeroCleare-like wiper variant; post-attribution retaliatory wave Sept 2022.
- **Public attribution**: Treasury OFAC; CISA AA22-264A; Mandiant; Microsoft (as DEV-0861/0166 cluster).
- **Doctrine alignment**: Cyber-as-deniable-retaliation (attested via OFAC); Constitutional regime-preservation (MEK is regime's existential opposition).

### Moses Staff (aliases: Marigold Sandstorm, DEV-0500)

- **Parent service**: Iran-aligned; specific service attribution less firm than CyberAv3ngers / HomeLand Justice.
- **Active since**: Sept 2021.
- **Status**: active.
- **Primary mission**: anti-Israel coercive leak and disruption operations.
- **Sectors targeted**: Israeli engineering, finance, retail, manufacturing.
- **Notable TTPs**: PyDCrypt encryption (not financially-motivated; no decryption offered); StrifeWater RAT; data-leak Telegram channel.
- **Public attribution**: Check Point; Cybereason; SOCRadar.
- **Doctrine alignment**: Forward Defense; Cyber-as-deniable-retaliation; Axis of Resistance.

### Black Shadow / DEV-0270 / Nemesis Kitten

- **Parent service**: assessed sub-group of Phosphorus / Mint Sandstorm (IRGC).
- **Active since**: 2020.
- **Status**: active.
- **Primary mission**: leak-and-extortion against Israeli companies.
- **Sectors targeted**: Israeli insurance (Shirbit 2020), logistics/IT (CyberServe 2021 — Atraf LGBTQ dataset leaked), tourism, telecom.
- **Notable TTPs**: BitLocker-abuse encryption; ransom demands as cover for ideological coercion.
- **Public attribution**: Microsoft Threat Intelligence (DEV-0270); Israeli National Cyber Directorate references.
- **Doctrine alignment**: Asymmetric Warfare; Cyber-as-deniable-retaliation.

### Emennet Pasargad (aliases: behind "Enemies of the People" and other 2020 personas; aka Net Peygard Samavat; Aria Sepehr Ayandehsazan front)

- **Parent service**: IRGC contractor.
- **Active since**: 2018 or earlier.
- **Status**: sanctioned (Nov 18, 2021) and re-designated (Aug 2024 under "Aria Sepehr Ayandehsazan" name for 2024 election ops).
- **Primary mission**: cyber-enabled influence operations and election interference.
- **Sectors targeted**: US state election websites; US voters (2020 "Proud Boys" intimidation emails); Israeli organisations.
- **Notable TTPs**: voter-data scraping via cURL exploitation of misconfigured state portals; mass-email intimidation; impersonation of US extremists and Israeli/American media outlets; persona-driven hack-and-leak.
- **Public attribution**: Treasury OFAC jy0494 (Nov 18, 2021); DOJ indictment of Seyyed Mohammad Hosein Musa Kazemi and Sajjad Kashian (Nov 2021); CISA AA20-304A; FBI Aug 2024 advisory naming Aria Sepehr Ayandehsazan front.
- **Doctrine alignment**: Cyber-as-deniable-retaliation; Post-Soleimani retaliation (electoral discord); Constitutional regime-preservation.

### Najee Technology / Afkar System (IRGC-affiliated contractor cluster)

- **Parent service**: IRGC-affiliated (Treasury OFAC jy0948, Sept 14, 2022).
- **Active since**: 2020.
- **Status**: sanctioned; principals indicted.
- **Primary mission**: ransomware-for-revenue with IRGC patronage.
- **Sectors targeted**: US/UK/Israel/Australia/Iran-adversary critical infrastructure; including 2021 Boston Children's Hospital attempt (thwarted), Vermont healthcare, a US domestic-violence shelter.
- **Notable TTPs**: Fortinet/Exchange/Log4j exploitation; BitLocker abuse; double extortion.
- **Public attribution**: Treasury jy0948; DOJ indictment of Mansour Ahmadi, Ahmad Khatibi Aghda, Amir Hossein Nikaeen Ravari (Sept 14, 2022); CISA AA22-257A.
- **Doctrine alignment**: Sanctions-evasion (revenue); Asymmetric Warfare.

### Rana Intelligence Computing Company (MOIS front for APT39)

- **Parent service**: MOIS (Treasury OFAC Sept 17, 2020).
- **Active since**: ~2014 (as APT39 activity).
- **Status**: sanctioned; 45 individuals designated.
- **Primary mission**: dissident and travel-sector surveillance.
- **Sectors targeted**: see APT39.
- **Notable TTPs**: see APT39; FBI released eight previously-undisclosed Rana malware sets in 2020 disclosure.
- **Public attribution**: Treasury OFAC sm1127; FBI advisory; FireEye/Mandiant.
- **Doctrine alignment**: Constitutional regime-preservation.

### Lebanese Cedar / Volatile Cedar

- **Parent service**: Hezbollah-linked, with IRGC-Quds Force capacity-building support; possible Iranian operators involved (per Iran International / Check Point analysis).
- **Active since**: 2012.
- **Status**: active.
- **Primary mission**: telecom and ISP collection in Israel and Lebanon's neighborhood, plus regional adversary intelligence.
- **Sectors targeted**: telecom, ISPs, hosting providers in US, UK, Israel, Egypt, Saudi, UAE, Lebanon, Jordan, Palestinian Authority.
- **Notable TTPs**: Explosive RAT; Caterpillar webshell; long dwell time.
- **Public attribution**: Check Point 2015 and 2021 reports; Kaspersky.
- **Doctrine alignment**: Axis of Resistance.

### Black Reward (hacktivist persona; anti-regime)

- **Parent service**: NOT Iranian state-aligned; appears to be Iranian dissident hacktivists.
- **Status**: included for analyst awareness — Iranian-language hacktivist personas can be either state-fronts or genuinely anti-regime. Black Reward leaks against the Atomic Energy Organisation of Iran (Oct 2022) and Press TV/Hafhashtad (2023) are assessed anti-regime.
- **Doctrine alignment**: counter-regime; flag for analyst review on any "Iranian hacktivist" attribution.

### Predatory Sparrow (Gonjeshke Darande) — NOT IRANIAN (flagged for context)

- **Parent service**: assessed Israel-linked, widely attributed to IDF Unit 8200 by Israeli media and US defense officials cited in NYT.
- **Status**: active; included here only because they target Iran and complicate the picture.
- **Activity**: 2021 Iran fuel-station network attack; June 2022 Khuzestan steel mill destructive OT attack; Dec 2023 fuel-station re-run; June 2025 Iranian crypto-exchange Nobitex hack ($90M+ drained); Sepah Bank attacks.
- **Doctrine alignment**: not Iranian. Any event in `events.md` should be checked: if Predatory Sparrow claims it, the actor field is Israel-aligned, not Iran.
