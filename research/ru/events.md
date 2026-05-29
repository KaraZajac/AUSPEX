# Russia — Notable Cyber Events (2007–2026)

Chronological. Inclusion threshold: strong public attribution by US/UK/EU governments and/or tier-1 vendor reporting; events that materially shaped the strategic/policy record. Doctrine linkage labeled per SCHEMA confidence labels (attested / strongly inferred / plausible).

---

### 2007-04 Estonia DDoS campaign ("Bronze Soldier")

- **Attributed actor**: Pro-Kremlin patriotic hackers (Nashi-affiliated Konstantin Goloskokov self-claimed 2009); state direction inferred, not legally proven (attribution confidence: medium; sources: Estonian CERT, NATO CCDCOE)
- **Target**: Estonian government, banking, media — government and banking sites offline
- **Vector / TTP**: distributed DDoS via botnets, 22 days
- **Outcome**: paralysis of Estonian online services; catalyst for NATO Cooperative Cyber Defence Centre of Excellence (Tallinn)
- **Doctrine linkage**: Russkiy Mir (response to Soviet WWII monument relocation insulting "Russian world" symbolism); information confrontation
- **Linkage confidence**: strongly inferred
- **Citations**: NATO CCDCOE, "Analysis of the 2007 Cyber Attacks Against Estonia." https://ccdcoe.org/uploads/2018/10/Ottis2008_AnalysisOf2007FromTheInformationWarfarePerspective.pdf ; RFE/RL coverage of Goloskokov admission (2009).

### 2008-08 Georgia cyber campaign

- **Attributed actor**: Russian Business Network plus assessed GRU coordination (attribution confidence: medium; sources: US-CCU, Greylogic, Bumgarner)
- **Target**: Georgian government websites, banking, media — synchronized with Russian military operations against South Ossetia
- **Vector / TTP**: DDoS, defacements, BGP manipulation
- **Outcome**: Georgian government communications degraded during 5-day war
- **Doctrine linkage**: first publicly observed integration of cyber with kinetic; precursor to 2014 Military Doctrine's non-contact concept. Russkiy Mir/near abroad.
- **Linkage confidence**: strongly inferred
- **Citations**: US-CCU report (2009); CCDCOE "Georgia-Russia conflict (2008)." https://cyberlaw.ccdcoe.org/wiki/Georgia-Russia_conflict_(2008)

### 2014-04 to 2016-12 Yahoo intrusion

- **Attributed actor**: FSB officers Dmitry Dokuchaev and Igor Sushchin, with criminal hackers Belan and Baratov (attribution confidence: high; source: DOJ indictment Mar 2017)
- **Target**: Yahoo — 500M+ user accounts; specific selection of journalists, US/Russian officials
- **Vector / TTP**: account database compromise; targeted account access via forged cookies
- **Outcome**: First US criminal cyber charges against Russian government officials
- **Doctrine linkage**: classical FSB foreign intelligence collection (2016 Information Security Doctrine premise); selection of Russian journalist and dissident targets aligns with regime-security strand
- **Linkage confidence**: attested (DOJ named targeting of journalists and government officials)
- **Citations**: DOJ press release (15 Mar 2017). https://www.justice.gov/opa/pr/us-charges-russian-fsb-officers-and-their-criminal-conspirators-hacking-yahoo-and-millions ; FBI "Charges Announced in Massive Cyber Intrusion Case."

### 2015-05 Bundestag intrusion

- **Attributed actor**: Fancy Bear / APT28 (GRU Unit 26165) (attribution confidence: high; sources: BfV, UK FCDO sanctions Oct 2020)
- **Target**: German Bundestag — 16GB exfiltrated, parliamentary network offline for days
- **Vector / TTP**: spearphishing, X-Agent deployment, lateral movement
- **Outcome**: prolonged compromise; UK sanctions on GRU 26165 + officer Dmitry Badin (Oct 2020); German arrest warrant for Badin
- **Doctrine linkage**: foreign-government strategic espionage; political-leadership targeting feeds influence operations
- **Linkage confidence**: strongly inferred
- **Citations**: UK Gov, "UK enforces new sanctions against Russia for cyber attack on German Parliament." https://www.gov.uk/government/news/uk-enforces-new-sanctions-against-russia-for-cyber-attack-on-german-parliament

### 2015-12 Ukraine power grid attack (Prykarpattyaoblenergo)

- **Attributed actor**: Sandworm (GRU Unit 74455) (attribution confidence: high; sources: ICS-CERT, SANS/E-ISAC, US DOJ Oct 2020 indictment)
- **Target**: three Ukrainian energy distribution companies (Prykarpattyaoblenergo, Chernivtsioblenergo, Kyivoblenergo)
- **Vector / TTP**: BlackEnergy3 spearphishing → six-month dwell → coordinated remote breaker operation via stolen credentials + KillDisk wiper + TDoS against call center
- **Outcome**: ~225,000 customers without power for 1–6 hours; first publicly acknowledged cyber-induced grid outage
- **Doctrine linkage**: Russkiy Mir / Ukraine theater; energy weaponization
- **Linkage confidence**: attested (DOJ Oct 2020 indictment explicitly names the operation as supporting destabilization of Ukraine)
- **Citations**: CISA IR-ALERT-H-16-056-01. https://www.cisa.gov/news-events/ics-alerts/ir-alert-h-16-056-01 ; DOJ Oct 2020 indictment.

### 2016-03 to 2016-11 DNC/DCCC hack and election interference

- **Attributed actor**: GRU Unit 26165 (Fancy Bear / APT28) and GRU Unit 74455 (Sandworm) (attribution confidence: high; sources: Mueller indictment Jul 2018, IC Assessment Jan 2017)
- **Target**: Democratic National Committee, DCCC, Clinton campaign chair John Podesta, US state election infrastructure
- **Vector / TTP**: spearphishing → X-Agent → exfiltration → laundering via Guccifer 2.0 persona, DCLeaks, WikiLeaks
- **Outcome**: leak operation timed with Democratic Convention and pre-election period; 12 GRU officers indicted
- **Doctrine linkage**: Gerasimov framework (information confrontation), 2014 Military Doctrine (destabilize adversary politics)
- **Linkage confidence**: attested (Mueller indictment and IC Assessment explicitly name election interference as strategic goal)
- **Citations**: DOJ indictment of Netyksho et al. (13 Jul 2018). https://www.justice.gov/file/1080281/download ; ODNI Assessment ICA 2017-01D.

### 2016-08 to 2016-09 WADA / IAAF / OPCW campaign

- **Attributed actor**: Fancy Bear / APT28 (GRU Unit 26165) (attribution confidence: high; source: Dutch MIVD public exposure Oct 2018, DOJ Oct 2018 indictment)
- **Target**: World Anti-Doping Agency, USADA, IAAF, Olympic athletes' TUE records; later OPCW Hague (close-access op)
- **Vector / TTP**: spearphishing, Wi-Fi credential theft, on-site close-access (Hague Apr 2018 operation interdicted by Dutch authorities)
- **Outcome**: medical records of 25+ athletes leaked via "Fancy Bear" branded site; retaliation for McLaren Report on Russian doping
- **Doctrine linkage**: regime-prestige defense, information confrontation
- **Linkage confidence**: attested (DOJ Oct 2018 indictment names retaliation for doping investigation)
- **Citations**: DOJ Indictment Morenets et al. (4 Oct 2018). https://www.justice.gov/opa/pr/us-charges-russian-gru-officers-international-hacking-and-related-influence-and

### 2016-12 Ukraine power grid attack ("Industroyer/CrashOverride")

- **Attributed actor**: Sandworm (GRU Unit 74455) (attribution confidence: high; sources: ESET, Dragos, DOJ Oct 2020 indictment)
- **Target**: Ukrenergo transmission substation Pivnichna, Kyiv
- **Vector / TTP**: Industroyer ICS-tailored framework with IEC 60870-5-101/104, OPC DA, IEC 61850 protocol modules
- **Outcome**: ~1 hour blackout for parts of Kyiv; first ICS-purpose-built malware after Stuxnet
- **Doctrine linkage**: energy weaponization; Russkiy Mir / Ukraine theater
- **Linkage confidence**: attested (DOJ Oct 2020 indictment)
- **Citations**: ESET "WIN32/INDUSTROYER" (Jun 2017); Dragos CRASHOVERRIDE analysis.

### 2017-04 to 2018-12 Berserk Bear / Dragonfly 2.0 US energy sector campaign

- **Attributed actor**: FSB Center 16 — Berserk Bear (attribution confidence: high; sources: CISA TA18-074A Mar 2018, DOJ Mar 2022 indictment of Akulov/Gavrilov/Tyukov)
- **Target**: US/UK/EU electric utilities, nuclear power (Wolf Creek Nuclear Operating Corp.), petroleum
- **Vector / TTP**: watering-hole on ICS-vendor sites, spearphishing, supply-chain (trojaned ICS software updates), Cisco router exploitation
- **Outcome**: pre-positioning access in ICS environments; no observed disruptive action
- **Doctrine linkage**: energy weaponization; coercive leverage pre-positioning
- **Linkage confidence**: attested (DOJ indictment names objective as "establishing access to industrial control systems")
- **Citations**: CISA TA18-074A. https://www.cisa.gov/news-events/cybersecurity-advisories/aa20-296a ; DOJ press release (24 Mar 2022). https://www.justice.gov/opa/pr/four-russian-government-employees-charged-two-historical-hacking-campaigns-targeting

### 2017-06 NotPetya

- **Attributed actor**: Sandworm (GRU Unit 74455) (attribution confidence: high; sources: UK NCSC + White House attribution Feb 2018, Five Eyes joint attribution, DOJ Oct 2020 indictment)
- **Target**: Ukrainian businesses via M.E.Doc tax software supply chain; global collateral spread
- **Vector / TTP**: M.E.Doc software supply-chain compromise; EternalBlue + Mimikatz worm
- **Outcome**: ~$10B global damage (per White House); Maersk, Merck, FedEx/TNT, Mondelez, Reckitt Benckiser, Saint-Gobain disrupted; most-destructive cyberattack in history per White House
- **Doctrine linkage**: Russkiy Mir / Ukraine destabilization; tolerated collateral damage to Western firms reads as feature, not bug
- **Linkage confidence**: attested (White House Feb 2018 statement explicitly cites destabilization of Ukraine)
- **Citations**: White House Press Statement (15 Feb 2018); UK NCSC attribution. https://www.gov.uk/government/news/foreign-office-minister-condemns-russia-for-notpetya-attacks ; DOJ Oct 2020 indictment.

### 2017-08 Triton/Trisis attack (Petro Rabigh)

- **Attributed actor**: Russian Ministry of Defense TsNIIKhM (attribution confidence: high; sources: US Treasury OFAC Oct 2020, DOJ Mar 2022 indictment of Evgeny Gladkikh)
- **Target**: Schneider Electric Triconex Safety Instrumented System at Saudi Petro Rabigh petrochemical facility
- **Vector / TTP**: long-dwell IT-to-OT lateral movement; custom Triton/Trisis SIS-targeting malware
- **Outcome**: plant unscheduled shutdown when payload misfired; first known SIS-targeting nation-state malware — capable of disabling safety mechanisms that prevent catastrophic events
- **Doctrine linkage**: energy weaponization; ultimate coercive leverage capability
- **Linkage confidence**: attested (US Treasury OFAC press release names TsNIIKhM responsibility)
- **Citations**: US Treasury OFAC, "Treasury Sanctions Russian Government Research Institution Connected to the Triton Malware" (23 Oct 2020). https://home.treasury.gov/news/press-releases/sm1162 ; DOJ press release (24 Mar 2022).

### 2017-10 BadRabbit ransomware

- **Attributed actor**: assessed Sandworm/BlackEnergy ecosystem (attribution confidence: medium; sources: ESET, Talos)
- **Target**: Russian media outlets, Ukrainian Kyiv metro, Odessa airport, Ukrainian ministries
- **Vector / TTP**: drive-by water-holed news sites delivering fake Flash update; SMB worm
- **Outcome**: limited but visible disruption
- **Doctrine linkage**: Ukraine destabilization; possible false-flag obfuscation by hitting Russian outlets
- **Linkage confidence**: plausible
- **Citations**: ESET BadRabbit analysis; Cisco Talos coverage.

### 2018-02 Olympic Destroyer (PyeongChang Winter Olympics)

- **Attributed actor**: Sandworm (GRU Unit 74455) (attribution confidence: high; sources: UK NCSC Oct 2020, DOJ Oct 2020 indictment)
- **Target**: 2018 PyeongChang Winter Olympics IT systems
- **Vector / TTP**: destructive malware deployed at opening ceremony; deliberate Lazarus/Chinese false-flag artifacts
- **Outcome**: WiFi, ticketing app, RFID gates disrupted; first nation-state false-flag operation publicly dissected
- **Doctrine linkage**: regime-prestige retaliation for Russia's IOC flag ban
- **Linkage confidence**: attested (UK Gov press release directly cites retaliation for Russian doping consequences)
- **Citations**: UK Gov, "UK exposes series of Russian cyber attacks against Olympic and Paralympic Games" (19 Oct 2020). https://www.gov.uk/government/news/uk-exposes-series-of-russian-cyber-attacks-against-olympic-and-paralympic-games

### 2018-04 OPCW Hague close-access operation (interdicted)

- **Attributed actor**: GRU Unit 26165 (Fancy Bear) (attribution confidence: high; source: Dutch MIVD Oct 2018 public disclosure)
- **Target**: OPCW investigation into Skripal Novichok poisoning and Syrian chemical-weapons cases
- **Vector / TTP**: GRU officers traveled to Hague to conduct on-site Wi-Fi compromise; interdicted by AIVD/MIVD
- **Outcome**: operation disrupted; equipment seized; identities exposed
- **Doctrine linkage**: regime defense against accountability mechanisms; information confrontation
- **Linkage confidence**: attested (DOJ Oct 2018 indictment)
- **Citations**: Dutch MoD MIVD press conference (4 Oct 2018); DOJ Indictment.

### 2019-09 to 2020-12 SolarWinds Orion supply-chain compromise (SUNBURST)

- **Attributed actor**: SVR / APT29 / Cozy Bear / Nobelium (attribution confidence: high; sources: White House attribution Apr 2021, FBI Director Wray statement Jun 2021, Treasury OFAC EO 14024)
- **Target**: SolarWinds Orion, ~18,000 downloads of trojaned update, ~100 victim organizations actually targeted including US Treasury, Commerce, State, DHS, DOE/NNSA, Justice; Microsoft, FireEye, Mimecast
- **Vector / TTP**: software-build-system compromise inserting SUNBURST/SUNSPOT/TEARDROP backdoors into legitimate signed updates
- **Outcome**: most-significant strategic-espionage supply-chain compromise on record; reshaped US executive-branch cyber policy (EO 14028)
- **Doctrine linkage**: SVR strategic intelligence collection; 2016 Information Security Doctrine and 2023 FPC strategic-espionage strand
- **Linkage confidence**: attested (White House fact sheet explicitly names "broad-scope cyber espionage")
- **Citations**: White House Fact Sheet (15 Apr 2021). https://www.whitehouse.gov/briefing-room/statements-releases/2021/04/15/fact-sheet-imposing-costs-for-harmful-foreign-activities-by-the-russian-government/ ; CISA Emergency Directive 21-01. https://www.cisa.gov/news-events/directives/ed-21-01-mitigate-solarwinds-orion-code-compromise

### 2020-07 COVID-19 vaccine research targeting

- **Attributed actor**: APT29 / Cozy Bear (SVR) (attribution confidence: high; source: CISA + NCSC + NSA + CSE Joint Advisory)
- **Target**: COVID-19 vaccine research organizations in US, UK, Canada (Oxford, AstraZeneca, etc.)
- **Vector / TTP**: WellMess, WellMail custom malware; CVE-2019-19781 (Citrix) exploitation
- **Outcome**: theft of vaccine research IP; political embarrassment for Russia
- **Doctrine linkage**: pandemic-era strategic intelligence + competition with Sputnik V vaccine narrative
- **Linkage confidence**: strongly inferred
- **Citations**: CISA AA20-201A / NCSC advisory (16 Jul 2020). https://www.ncsc.gov.uk/news/advisory-apt29-targets-covid-19-vaccine-development

### 2021-04 to 2021-12 Continuous SVR cloud-identity campaign

- **Attributed actor**: APT29 / Nobelium / Midnight Blizzard (attribution confidence: high; sources: Microsoft MSTIC, CISA)
- **Target**: US/EU government agencies, NGOs, IT service providers post-SolarWinds (Mimecast, Microsoft customer support tooling)
- **Vector / TTP**: password spray, OAuth abuse, MFA-fatigue, golden SAML
- **Outcome**: continuous strategic collection
- **Doctrine linkage**: SVR strategic espionage
- **Linkage confidence**: strongly inferred
- **Citations**: Microsoft MSTIC reporting (multiple, 2021–2024).

### 2022-01 WhisperGate wiper (pre-invasion)

- **Attributed actor**: Cadet Blizzard / Ember Bear / DEV-0586 (GRU, distinct from Sandworm per MSTIC) (attribution confidence: high; source: Microsoft MSTIC Jun 2023, Ukrainian CERT)
- **Target**: Ukrainian government websites and IT systems
- **Vector / TTP**: MBR wiper masquerading as ransomware; hack-and-leak "Free Civilian" persona
- **Outcome**: defacements of >70 Ukrainian government sites; signal of impending invasion
- **Doctrine linkage**: Russkiy Mir; pre-kinetic shaping
- **Linkage confidence**: attested
- **Citations**: MSTIC blog (Jan 2022; Jun 2023). https://www.microsoft.com/en-us/security/blog/2022/01/15/destructive-malware-targeting-ukrainian-organizations/

### 2022-02-23 HermeticWiper

- **Attributed actor**: Sandworm (GRU Unit 74455) (attribution confidence: high; sources: ESET, Mandiant, CERT-UA)
- **Target**: hundreds of systems across 5+ Ukrainian organizations (finance, government contractors) on eve of invasion
- **Vector / TTP**: signed-driver disk wiper deployed via GPO; HermeticWizard worm propagator
- **Outcome**: wide disruption coordinated with invasion D-day
- **Doctrine linkage**: invasion-synchronized non-contact warfare; Russkiy Mir
- **Linkage confidence**: attested
- **Citations**: ESET (24 Feb 2022). https://www.welivesecurity.com/2022/03/01/isaacwiper-hermeticwizard-wiper-worm-targeting-ukraine/

### 2022-02-24 Viasat KA-SAT / AcidRain

- **Attributed actor**: GRU (attribution confidence: high; sources: EU Council, UK FCDO, US State, Five Eyes joint attribution May 2022)
- **Target**: Viasat KA-SAT consumer modems serving Ukrainian military and tens of thousands of European broadband customers; collateral wind-turbine outages in Germany
- **Vector / TTP**: AcidRain wiper pushed via management network compromise; bricked tens of thousands of modems
- **Outcome**: Ukrainian military C2 degradation in opening hours of invasion; major spillover
- **Doctrine linkage**: invasion-supporting non-contact warfare; NATO-degradation
- **Linkage confidence**: attested (EU/UK/US joint attribution explicitly names Russia and invasion-support objective)
- **Citations**: Council of the EU (10 May 2022). https://www.consilium.europa.eu/en/press/press-releases/2022/05/10/russian-cyber-operations-against-ukraine-declaration-by-the-high-representative-on-behalf-of-the-european-union/ ; SentinelLabs AcidRain analysis.

### 2022-02 IsaacWiper / 2022-03 CaddyWiper

- **Attributed actor**: Sandworm (attribution confidence: high; sources: ESET, CERT-UA)
- **Target**: Ukrainian government network (IsaacWiper); Ukrainian bank and government (CaddyWiper)
- **Vector / TTP**: data wipers
- **Outcome**: data destruction
- **Doctrine linkage**: continuous Ukraine destabilization; invasion support
- **Linkage confidence**: attested
- **Citations**: ESET, "A year of wiper attacks in Ukraine" (24 Feb 2023). https://www.welivesecurity.com/2023/02/24/year-wiper-attacks-ukraine/

### 2022-04 Industroyer2 attempt (Ukrenergo)

- **Attributed actor**: Sandworm (attribution confidence: high; sources: ESET + CERT-UA joint report Apr 2022)
- **Target**: Ukrainian high-voltage electrical substation
- **Vector / TTP**: Industroyer2 + CaddyWiper combo; IEC 60870-5-104 manipulation
- **Outcome**: attempted blackout of ~2M customers; thwarted by ESET/Microsoft/CERT-UA collaboration
- **Doctrine linkage**: energy weaponization; Ukraine destabilization
- **Linkage confidence**: attested
- **Citations**: CERT-UA #4435; ESET research (12 Apr 2022). https://www.welivesecurity.com/2022/04/12/industroyer2-industroyer-reloaded/

### 2022-06+ Sustained DDoS/influence campaigns by Killnet, NoName057(16), XakNet

- **Attributed actors**: Russia-aligned hacktivist proxies (state nexus assessed) (attribution confidence: medium-high; sources: CISA AA22-110A, Mandiant, EU "Operation Eastwood")
- **Target**: government, financial, transport sectors of NATO members and Ukraine-aligned states (Lithuania, Italy, Germany, Poland, Czechia, US)
- **Vector / TTP**: layer-7 DDoS, defacements, leak operations via Telegram coordination
- **Outcome**: largely performative/morale impact; 1,500+ claimed NoName057(16) DDoS attacks
- **Doctrine linkage**: post-2022 sanctions-response posture; information confrontation
- **Linkage confidence**: strongly inferred (state direction); attested for individual sanctioned operators
- **Citations**: CISA AA22-110A. https://www.cisa.gov/news-events/cybersecurity-advisories/aa22-110a ; Europol "Operation Eastwood" press releases (Jul 2024, ongoing).

### 2023-05 Snake malware network disrupted (Operation MEDUSA)

- **Attributed actor**: Turla / FSB Center 16 (attribution confidence: high; source: DOJ + FBI public statement)
- **Target**: NATO governments, journalists, defense industrial base in 50+ countries (the FSB long-dwell collection infrastructure, not victims of MEDUSA itself)
- **Vector / TTP**: PERSEUS court-authorized remote disable of Snake nodes
- **Outcome**: most-sophisticated FSB espionage tool dismantled globally
- **Doctrine linkage**: strategic intelligence operation; demonstrates the doctrine in practice
- **Linkage confidence**: attested
- **Citations**: DOJ press release (9 May 2023). https://www.justice.gov/opa/pr/justice-department-announces-court-authorized-disruption-snake-malware-network

### 2023-08 to 2024-01 Ukrainian telecom Kyivstar disruption (Solntsepyok claim)

- **Attributed actor**: assessed Sandworm front (attribution confidence: high; source: SBU, CERT-UA)
- **Target**: Kyivstar — Ukraine's largest mobile operator (~25M subscribers)
- **Vector / TTP**: 6+ month dwell; full destruction of Kyivstar IT environment
- **Outcome**: ~48-hour total outage of mobile/internet; air-raid alerts disrupted
- **Doctrine linkage**: Russkiy Mir; Ukraine destabilization; civilian-resilience target
- **Linkage confidence**: attested
- **Citations**: Reuters and Kyiv Post coverage of SBU statement (Jan 2024); CERT-UA.

### 2023-11 Midnight Blizzard breach of Microsoft corporate

- **Attributed actor**: APT29 / Midnight Blizzard / SVR (attribution confidence: high; source: Microsoft MSRC Jan 2024 and SEC 8-K filing)
- **Target**: Microsoft corporate email; senior leadership and cybersecurity, legal staff
- **Vector / TTP**: password spray against legacy non-production test tenant without MFA → OAuth app abuse → Exchange Online full_access_as_app role
- **Outcome**: emails and source-code-related materials exfiltrated; HPE also breached via parallel campaign (disclosed Jan 2024)
- **Doctrine linkage**: SVR strategic intelligence; identity-provider supply chain
- **Linkage confidence**: attested
- **Citations**: Microsoft MSRC (19 Jan 2024). https://www.microsoft.com/en-us/msrc/blog/2024/01/microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard

### 2023-10 to 2024-02 TeamCity CVE-2023-42793 exploitation by SVR

- **Attributed actor**: SVR (attribution confidence: high; source: CISA AA23-347A Joint Advisory, FBI, NSA, NCSC PL, CCCS)
- **Target**: software developers using JetBrains TeamCity (assessed pre-positioning for future supply-chain operations)
- **Outcome**: persistent access to ~100 organizations
- **Doctrine linkage**: SVR strategic espionage; supply-chain pre-positioning (echo of SolarWinds methodology)
- **Linkage confidence**: attested
- **Citations**: CISA AA23-347A (13 Dec 2023). https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-347a

### 2023-12 Star Blizzard sanctions and indictments

- **Attributed actor**: Star Blizzard / FSB Center 18 (attribution confidence: high; source: UK NCSC + CISA AA23-341A; DOJ + Treasury + UK FCDO)
- **Target**: UK, US, EU policy elites, exiled Russian dissidents, academics, defense intellectuals; 2019 UK election leak (US-UK trade docs)
- **Vector / TTP**: Evilginx-style AitM credential phishing; tailored persona impersonation
- **Outcome**: two FSB-aligned individuals (Korinets, Peretyatko) indicted and sanctioned
- **Doctrine linkage**: information confrontation; shaping Western policy discourse
- **Linkage confidence**: attested
- **Citations**: CISA AA23-341A (7 Dec 2023). https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-341a ; UK Foreign Office press release.

### 2024-01 Aliquippa, PA / Texas water utility intrusions (CARR)

- **Attributed actor**: Cyber Army of Russia Reborn / GRU Unit 74455 (attribution confidence: high — Treasury sanctioned Jul 2024; Mandiant assessed Sandworm-affiliated; some incidents distinct from CyberAv3ngers Iranian operator)
- **Target**: small US water utilities — Muleshoe, Abernathy, Stanton (TX), Indiana wastewater (note: Aliquippa PA was CyberAv3ngers/IRGC, not Russian — sometimes conflated in reporting)
- **Vector / TTP**: exploitation of internet-exposed HMIs; manipulation to overflow/empty tanks; Telegram-published proof videos
- **Outcome**: physical effects (tank overflow in Muleshoe); low absolute damage, high signaling value
- **Doctrine linkage**: post-2022 sanctions-response; performative deterrence signaling
- **Linkage confidence**: attested (Treasury press release names CARR's "support for Russia's geopolitical interests")
- **Citations**: US Treasury OFAC (19 Jul 2024). https://home.treasury.gov/news/press-releases/jy2473 ; Mandiant analysis (Apr 2024). https://cloud.google.com/blog/topics/threat-intelligence/sandworm-disrupts-power-ukraine-operational-technology/

### 2024-04 Sandworm Frostygoop Ukrainian heating disruption (Lviv)

- **Attributed actor**: Sandworm (attribution confidence: high; source: Dragos / Industrial Cyber + CERT-UA)
- **Target**: Lvivteploenergo heating provider, Lviv, Ukraine
- **Vector / TTP**: FrostyGoop Modbus-targeting ICS malware
- **Outcome**: ~600 buildings lost heat for two days in mid-winter
- **Doctrine linkage**: energy weaponization; civilian-resilience attack
- **Linkage confidence**: attested
- **Citations**: Dragos FrostyGoop report (Jul 2024).

### 2024-05 APT28 spearphishing of German SPD and Czech/Polish entities

- **Attributed actor**: APT28 (attribution confidence: high; sources: German MFA public attribution May 2024, Czech MFA)
- **Target**: German SPD (Scholz's party), Czech and Polish government/military
- **Vector / TTP**: CVE-2023-23397 Outlook NTLM relay
- **Outcome**: Germany formally summoned Russian charge d'affaires; "intolerable" cyberattack
- **Doctrine linkage**: NATO political-infrastructure targeting; election shaping
- **Linkage confidence**: attested
- **Citations**: German Federal Government statement (3 May 2024); EU statement of solidarity.

### 2024-07 Operation Eastwood disrupts NoName057(16)

- **Attributed actor**: NoName057(16) (Russia-aligned hacktivist front per Europol)
- **Target**: NATO public-facing infrastructure (>1,500 attacks since 2022)
- **Outcome**: Europol-led takedown of >100 servers across 13 countries; 6 arrest warrants
- **Doctrine linkage**: post-2022 sanctions-response; performative DDoS
- **Linkage confidence**: attested
- **Citations**: Europol press release (Jul 2024).

### 2024-12 Romanian presidential election interference (TikTok influence + DDoS)

- **Attributed actor**: assessed Russia-aligned influence apparatus (attribution confidence: medium; source: Romanian Supreme Council of National Defense, declassified Dec 2024)
- **Target**: Romanian presidential election; pro-Călin Georgescu TikTok amplification
- **Outcome**: Constitutional Court annulled first-round result citing foreign interference; first such annulment in EU
- **Doctrine linkage**: information confrontation; NATO political-stability degradation
- **Linkage confidence**: strongly inferred
- **Citations**: Romanian CSAT declassified intelligence (Dec 2024); Politico EU and Reuters reporting.

### 2025-08 CISA + NSA + FBI + Five Eyes advisory on FSB Center 16 Cisco IOS exploitation

- **Attributed actor**: FSB Center 16 (Berserk Bear lineage) (attribution confidence: high; source: CISA joint advisory)
- **Target**: telecoms, energy, government — exploiting CVE-2018-0171 (Cisco Smart Install) globally
- **Outcome**: long-running collection campaign exposed
- **Doctrine linkage**: SIGINT-style strategic collection; pre-positioning
- **Linkage confidence**: attested
- **Citations**: CISA joint cybersecurity advisory (Aug 2025) — referenced in Industrial Cyber. https://industrialcyber.co/threats-attacks/russian-fsb-center-16-exploits-decade-old-cisco-flaw-in-cyber-espionage-campaign-to-target-critical-infrastructure/

### 2025-12 DOJ disrupts CARR and NoName057(16)

- **Attributed actor**: CARR (GRU); NoName057(16) (assessed state-sanctioned via CISM)
- **Outcome**: DOJ press release confirming CARR "founded, funded, and directed by the GRU"; foreign national extradited and indicted for support role
- **Doctrine linkage**: post-2022 sanctions-response; deniable retaliation
- **Linkage confidence**: attested
- **Citations**: DOJ press release (Dec 2025). https://www.justice.gov/opa/pr/justice-department-announces-actions-combat-two-russian-state-sponsored-cyber-criminal

---

## Continuing baseline events (compressed)

- 2014–present **Gamaredon (FSB Center 18, Crimea)** — continuous high-volume spearphishing against Ukrainian government; >5,000 attacks per SBU. Attested (SBU Nov 2021). Russkiy Mir baseline.
- 2018–2019 **VPNFilter** — Sandworm router botnet; FBI takedown May 2018. Attributed by US DOJ. Energy/critical-infra pre-positioning.
- 2020 **Norwegian Parliament email compromise** — APT28; attributed by Norwegian government Oct 2020. Strategic espionage.
- 2021–present **APT29 cloud-tenant collection** — continuous against US/UK/EU government tenants; Microsoft and HPE breaches Jan 2024.
- 2022–present **Continuous wiper waves in Ukraine** — DoubleZero, AcidPour (AcidRain successor), SwiftSlicer, RuRansom; ESET catalog.
- 2023 **Polish railway emergency-radio disruption** (Aug 2023) — pro-Russian actors; attribution to specific unit unclear; ABW investigation ongoing.
- 2024 **CISA water/wastewater advisories** — Russian and Iranian operators against US water utilities; CISA AA24-038A focused on PRC Volt Typhoon but parallel advisories on Russian/Iranian water-sector activity.
- 2024 **APT29 / Midnight Blizzard TeamViewer breach** (Jun 2024) — corporate environment of TeamViewer compromised; attributed to APT29.
- 2025 **Continued APT44 OT operations against Ukrainian grid and heating** — Dragos, Mandiant, CERT-UA quarterly reports.
