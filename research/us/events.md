# United States — Cyber Events (publicly attributed)

Events below are operations *attributed to* US or Five Eyes actors with US participation, 2007–2026. Each entry uses the SCHEMA event-entry format with an explicit confidence label distinguishing:

- **attested** — officially acknowledged by the US government
- **strongly inferred** — multi-source tier-1 journalism with no credible alternative explanation
- **plausible** — leak-derived or single-source; included for completeness

When attribution rests on a leak (Snowden, Shadow Brokers, Vault 7), the entry says so.

---

### 2007–2010 Operation Olympic Games / Stuxnet

- **Attributed actor**: Joint US/Israel — NSA + CIA + IDF Unit 8200 (attribution confidence: high; attributing source: Sanger/NYT 2012, Snowden 2013, Symantec, Kim Zetter)
- **Target**: Iranian uranium enrichment facility at Natanz (Siemens S7-300/417 PLCs driving IR-1 centrifuges)
- **Vector / TTP**: airgap-bridging worm via USB removable media; four Windows zero-days; signed driver using stolen Realtek/JMicron certificates; PLC rootkit modulating centrifuge rotor speeds while spoofing SCADA feedback
- **Outcome**: estimated destruction of ~1,000 IR-1 centrifuges; ~2-year delay in Iranian enrichment program (per ISIS analysis); discovered after escape into the wild in 2010
- **Doctrine linkage**: counter-proliferation via cyber sabotage; established cyber as a strategic-effect tool; informed PPD-20 / NSPM-13 development
- **Linkage confidence**: strongly inferred (never officially acknowledged)
- **Citations**: David Sanger, "Obama Order Sped Up Wave of Cyberattacks Against Iran," NYT June 1, 2012; Symantec W32.Stuxnet Dossier Feb 2011; Kim Zetter, *Countdown to Zero Day*.

### 2011-09 Duqu

- **Attributed actor**: Olympic Games team (attribution confidence: high; attributing source: Kaspersky, Symantec, code-similarity with Stuxnet)
- **Target**: Iranian and other Middle Eastern targets — industrial certificate authorities, ICS-related intelligence collection
- **Vector / TTP**: Word zero-day kernel exploit; modular reconnaissance toolkit sharing Tilded Platform with Stuxnet
- **Outcome**: intelligence collection enabling future ICS operations
- **Doctrine linkage**: pre-attack reconnaissance for Olympic Games / continuing counter-proliferation
- **Linkage confidence**: strongly inferred
- **Citations**: Kaspersky GReAT analysis; CrySyS Lab (Hungary) initial discovery.

### 2012-05 Flame (sKyWIper)

- **Attributed actor**: Olympic Games team (attribution confidence: high; attributing source: Kaspersky, Washington Post sources June 2012)
- **Target**: Iranian Oil Ministry and Iranian National Oil Company; broader Middle East collection
- **Vector / TTP**: massive 20MB modular toolkit; MD5 collision attack abusing Microsoft Terminal Services licensing certificate to MITM Windows Update; audio, screen, Bluetooth-proximity collection
- **Outcome**: extensive collection; spurred Microsoft to deprecate weak hash algorithms; led to Iranian discovery of "Wiper" precursor
- **Doctrine linkage**: counter-proliferation collection
- **Linkage confidence**: strongly inferred
- **Citations**: Kaspersky Flame report May 2012; Washington Post Ellen Nakashima/Greg Miller June 19, 2012.

### 2012 Gauss

- **Attributed actor**: Olympic Games team (attribution confidence: high; attributing source: Kaspersky)
- **Target**: Lebanese banking sector (BankMed, Byblos Bank, Fransabank, Credit Libanais)
- **Vector / TTP**: Flame-related platform; financial-targeting modules
- **Outcome**: collection on financial flows of interest (presumed Hezbollah-related)
- **Doctrine linkage**: counter-terrorism finance collection / sanctions enforcement
- **Linkage confidence**: plausible
- **Citations**: Kaspersky "Gauss: Nation-state cyber-surveillance meets banking Trojan" Aug 2012.

### 2010–2013 Operation Socialist — Belgacom intrusion

- **Attributed actor**: GCHQ (Five Eyes; US-benefiting) (attribution confidence: high; attributing source: Snowden documents via Der Spiegel Sept 2013, The Intercept Dec 2014)
- **Target**: Belgacom (Belgian state-owned telecom — engineers' workstations and GRX roaming infrastructure)
- **Vector / TTP**: Quantum Insert — fake LinkedIn pages serving exploits to specific Belgacom engineers; lateral movement to GRX operator infrastructure
- **Outcome**: persistent SIGINT access to EU/African telecom roaming traffic
- **Doctrine linkage**: Five Eyes collection priorities; "first documented case of EU-state cyber attack on another EU state" (Snowden)
- **Linkage confidence**: attested (by Belgian prosecutor 2018; GCHQ has never confirmed)
- **Citations**: Der Spiegel Sept 20, 2013; Ryan Gallagher, The Intercept "Operation Socialist" Dec 13, 2014; Belgian federal prosecutor announcement 2018.

### 2002–2013 Merkel cellphone targeting

- **Attributed actor**: Special Collection Service (NSA + CIA) (attribution confidence: high; attributing source: Snowden 2013, Der Spiegel)
- **Target**: Chancellor Angela Merkel's mobile communications
- **Vector / TTP**: close-access SIGINT from US embassy Berlin rooftop (STATEROOM)
- **Outcome**: long-running political-leadership collection; major diplomatic incident Oct 2013
- **Doctrine linkage**: SCS executive-protection / strategic-leader collection mission
- **Linkage confidence**: plausible (US neither confirmed nor denied; Obama statement said no current/future targeting of Merkel)
- **Citations**: Der Spiegel Oct 23, 2013; Snowden documents.

### 2013 Petrobras / Brazilian executive targeting

- **Attributed actor**: NSA (attribution confidence: high; attributing source: Snowden 2013, Globo TV Fantastico Sept 2013)
- **Target**: Petrobras (Brazilian state oil); Brazilian Presidency (Dilma Rousseff); Mexican President's office
- **Vector / TTP**: man-in-the-middle on private corporate networks; SIGINT collection
- **Outcome**: economic and political collection; caused Rousseff to cancel US state visit Sept 2013
- **Doctrine linkage**: economic/strategic-resource collection (pre-salt oil reserves); leadership intent collection
- **Linkage confidence**: plausible
- **Citations**: Globo Fantastico Sept 8, 2013; Washington Post Sept 8, 2013.

### 2010–2014 Regin / WARRIORPRIDE platform

- **Attributed actor**: Five Eyes (NSA + GCHQ) (attribution confidence: high; attributing source: The Intercept Jan 2015, Kaspersky code-overlap with QWERTY keylogger from Snowden docs)
- **Target**: telecoms (Belgacom), EU institutions, governments and individuals across 14+ countries
- **Vector / TTP**: highly modular, multi-stage CNE platform (called WARRIORPRIDE at NSA, DAREDEVIL at GCHQ); GSM base-station monitoring modules
- **Outcome**: long-haul SIGINT
- **Doctrine linkage**: Five Eyes telecom-collection priorities
- **Linkage confidence**: strongly inferred (technical attribution + leak corroboration)
- **Citations**: Symantec "Regin" white paper Nov 2014; Kaspersky Regin/QWERTY analysis Jan 2015; The Intercept Jan 2015.

### 2009–2014 Operation Shotgiant — Huawei HQ targeting

- **Attributed actor**: NSA TAO (attribution confidence: high; attributing source: Snowden 2013, NYT/Der Spiegel March 2014)
- **Target**: Huawei HQ in Shenzhen; founder Ren Zhengfei communications; Huawei product source code
- **Vector / TTP**: network exploitation via TAO
- **Outcome**: collection on Huawei leadership and product internals; assessment of PLA links
- **Doctrine linkage**: counter-PRC SIGINT
- **Linkage confidence**: strongly inferred
- **Citations**: NYT David Sanger/Nicole Perlroth March 22, 2014; Der Spiegel same date.

### 2007–2017 Longhorn / Vault 7 operations (cumulative)

- **Attributed actor**: CIA CCI/EDG (Longhorn / Lamberts) (attribution confidence: high; attributing source: Symantec April 2017, Kaspersky April 2017, WikiLeaks Vault 7 March 2017, Schulte conviction 2022)
- **Target**: 40+ organizations across 16 countries in Europe, Asia, Africa, Middle East — governments, telecoms, financial, energy, IT, aerospace
- **Vector / TTP**: tools detailed in Vault 7 — HIVE C2, Fluxwire/Corentry, Brutal Kangaroo (airgap), Weeping Angel (Samsung TV firmware), Pandemic (file-share), ELSA (Wi-Fi geolocation)
- **Outcome**: covert-action-support and HUMINT-pair cyber collection
- **Doctrine linkage**: CIA Title 50 covert action authorities
- **Linkage confidence**: strongly inferred
- **Citations**: Symantec "Longhorn" April 10, 2017; Kaspersky "Lamberts Toolkit" April 11, 2017; WikiLeaks Vault 7; US v. Schulte (SDNY).

### 2016-11 Operation Glowing Symphony (counter-ISIS)

- **Attributed actor**: USCYBERCOM Joint Task Force ARES (attribution confidence: attested; attributing source: DoD official statements, FOIA-declassified after-actions)
- **Target**: ISIS media infrastructure — al-Hayat Media Center, Amaq Agency social-media and content-hosting; ISIS financial-messaging accounts
- **Vector / TTP**: account takeover; password-reset abuse via stored recovery emails; engagement with infrastructure providers; content disruption
- **Outcome**: significant degradation of ISIS online propaganda; ongoing campaign (continued after initial 30-day surge)
- **Doctrine linkage**: counter-VEO under Defend Forward (proto-doctrine in 2016)
- **Linkage confidence**: attested
- **Citations**: National Security Archive FOIA release Jan 21, 2020; Dina Temple-Raston NPR series Sept 2019; Carter / Mattis public statements 2016–17.

### 2016–2017 Shadow Brokers leaks (collateral)

- **Attributed actor**: unknown leaker; tooling attributed to NSA TAO (attribution confidence: high; attributing source: NSA documents leaked match TAO branding, classifications)
- **Target**: not an operation — *collateral event* where adversaries obtained NSA tools and weaponized them
- **Vector / TTP**: theft of TAO toolkit (FuzzBunch, DanderSpritz, EternalBlue, DoublePulsar, EternalRomance, EternalSynergy, EternalChampion, EsteemAudit, ExplodingCan)
- **Outcome**: tools used by DPRK (WannaCry, May 2017 — $4B+ damage), Russia GRU (NotPetya, June 2017 — $10B+ damage per Greenberg), Iranian APT34, multiple criminal actors
- **Doctrine linkage**: counter-example — the operational/strategic cost of stockpiling zero-days; informed Vulnerabilities Equities Process (VEP) reforms
- **Linkage confidence**: attested (NSA tool authorship); the *leak* itself remains uncharged. Suspect Harold T. Martin III charged for separate retention; not convicted of being the Shadow Brokers source.
- **Citations**: NYT Scott Shane "Shadow Brokers" series 2016–17; Andy Greenberg, *Sandworm* (2019); Microsoft MS17-010 advisory.

### 2017-03 Vault 7 release (collateral)

- **Attributed actor**: Joshua Schulte (CIA EDG developer, convicted July 2022) (attribution confidence: attested; attributing source: SDNY conviction)
- **Target**: CIA CCI/EDG tooling exfiltrated 2016, published by WikiLeaks
- **Outcome**: ~8,761 documents and files exposing CIA cyber-tools; described in actors.md
- **Linkage confidence**: attested
- **Citations**: WikiLeaks Vault 7 (March 7 – Nov 9, 2017); SDNY indictment and conviction US v. Schulte.

### 2018-10 IRA disruption (Russia Small Group)

- **Attributed actor**: USCYBERCOM Russia Small Group (RSG) under CNMF (attribution confidence: attested; attributing source: WaPo Ellen Nakashima Feb 27, 2019; Nakasone testimony)
- **Target**: Internet Research Agency, St. Petersburg (Yevgeny Prigozhin troll farm)
- **Vector / TTP**: not publicly detailed; reported denial-of-service-style internet-access disruption during US midterm voting period
- **Outcome**: "took the IRA offline" during voting; first publicly acknowledged US offensive cyber op against Russian state-aligned target
- **Doctrine linkage**: Defend Forward / Persistent Engagement; election-defense doctrine; first major exercise of NSPM-13 authorities
- **Linkage confidence**: attested
- **Citations**: Ellen Nakashima WaPo Feb 27, 2019; NBC News Courtney Kube Feb 26, 2019; Nakasone Senate Intelligence Committee testimony.

### 2018-onward Hunt Forward Montenegro

- **Attributed actor**: CYBERCOM CNMF (attribution confidence: attested; attributing source: WaPo Nakashima May 2019, CNMF press releases)
- **Target**: Montenegrin government networks (post-NATO accession, Russian-linked harassment)
- **Vector / TTP**: defensive hunt operations on invitation; sample collection
- **Outcome**: indicators released to VirusTotal; partner capacity built
- **Doctrine linkage**: Hunt Forward
- **Linkage confidence**: attested
- **Citations**: WaPo Nakashima May 7, 2019; cybercom.mil press release.

### 2020-03 Hunt Forward Estonia

- **Attributed actor**: CYBERCOM CNMF (attribution confidence: attested)
- **Target**: Estonian government networks
- **Outcome**: joint defensive operation; CYBERCOM press release Dec 3, 2020 explicitly named partnership
- **Doctrine linkage**: Hunt Forward
- **Linkage confidence**: attested
- **Citations**: https://www.cybercom.mil/Media/News/Article/2433245/

### 2020-09/10 Trickbot disruption (pre-2020-election)

- **Attributed actor**: USCYBERCOM (jointly with Microsoft DCU under separate authority) (attribution confidence: attested; attributing source: WaPo Ellen Nakashima Oct 9, 2020)
- **Target**: Trickbot botnet (~1M infected hosts) — Russian-speaking criminal operators
- **Vector / TTP**: config injection of malformed records to break bot-master communication; coordinated with Microsoft court-ordered C2 takedown
- **Outcome**: temporary disruption; criminal operators rebuilt; election-period ransomware threat reduced
- **Doctrine linkage**: election defense / Defend Forward against criminal-services-as-proxy for state actors
- **Linkage confidence**: attested
- **Citations**: WaPo Ellen Nakashima Oct 9, 2020; CyberScoop Oct 12, 2020.

### 2018–2024 Hunt Forward Ukraine (multiple deployments)

- **Attributed actor**: CYBERCOM CNMF (attribution confidence: attested; attributing source: Nakasone Senate testimony May 2022; NSArchive declassified CNMF doc Nov 2022)
- **Target**: Ukrainian government and critical-infrastructure networks
- **Specific deployments**:
  - 2018 initial
  - **December 2021 – February 2022** (pre-Russian invasion) — two-month deployment of joint Navy/Marine team; persisted until days before Feb 24 invasion
- **Vector / TTP**: collaborative hunt; sample collection; defensive remediation
- **Outcome**: hardened Ukrainian networks pre-invasion; intelligence on Russian pre-positioning (NotPetya-family tradecraft, WhisperGate, HermeticWiper precursors)
- **Doctrine linkage**: Hunt Forward; alliance signaling
- **Linkage confidence**: attested
- **Citations**: Nakasone Senate Armed Services testimony May 2022; CyberScoop reporting; NSArchive declassified CNMF Ukraine document Nov 28, 2022.

### 2022 Hunt Forward Lithuania, Latvia, Croatia

- **Attributed actor**: CYBERCOM CNMF (attribution confidence: attested)
- **Target**: respective partner government networks
- **Outcome**: indicators released
- **Doctrine linkage**: Hunt Forward
- **Linkage confidence**: attested
- **Citations**: cybercom.mil press releases 2022.

### 2022-09–12 Hunt Forward Albania (post-Iranian attack)

- **Attributed actor**: CYBERCOM CNMF (attribution confidence: attested; attributing source: cybercom.mil press release March 23, 2023)
- **Target**: Albanian government networks following Iranian MOIS Homeland Justice ransomware attacks (July and Sept 2022)
- **Vector / TTP**: defensive hunt; technical findings provided to Albanian government
- **Outcome**: persistence and lateral indicators captured; basis for CISA AA22-264A advisory (Sept 2022)
- **Doctrine linkage**: Hunt Forward, ally response, counter-Iran
- **Linkage confidence**: attested
- **Citations**: https://www.cybercom.mil/Media/News/Article/3337717/ ; CISA AA22-264A; The Record reporting March 23, 2023.

### 2022-Q4 CYBERCOM 2022 midterm offensive ops

- **Attributed actor**: CYBERCOM (attribution confidence: attested; attributing source: Nakasone interview WaPo Dec 22, 2022)
- **Target**: Russian and Iranian actors targeting 2022 midterm election infrastructure
- **Vector / TTP**: not detailed
- **Outcome**: Nakasone: "we are doing operations against Russia and Iran ahead of the midterms"; deemed successful
- **Doctrine linkage**: election defense / Persistent Engagement
- **Linkage confidence**: attested
- **Citations**: Ellen Nakashima WaPo Dec 22, 2022; The Record Dec 21, 2022.

### 2023-12 → 2024-01 KV-Botnet / Volt Typhoon disruption

- **Attributed actor**: FBI + DOJ (court-ordered); coordinated with CYBERCOM/NSA on attribution (attribution confidence: attested; attributing source: DOJ press release Jan 31, 2024; FBI Director Wray testimony)
- **Target**: KV-Botnet — hundreds of compromised Cisco/NetGear SOHO routers used by PRC MSS-linked Volt Typhoon to obfuscate intrusions into US critical infrastructure
- **Vector / TTP**: secret court order from district court Dec 2023; FBI used Volt Typhoon's own toolset to remotely delete KV-Botnet malware and sever C2 connection; coordinated public advisory
- **Outcome**: temporary disruption; CISA/FBI/NSA joint advisory exposed Volt Typhoon's "living-off-the-land" pre-positioning campaign against US water, energy, transport, communications
- **Doctrine linkage**: Disrupt-and-Dismantle pillar of National Cybersecurity Strategy; defend critical infrastructure
- **Linkage confidence**: attested
- **Citations**: DOJ "U.S. Government Disrupts Botnet" press release Jan 31, 2024; CISA AA24-038A; FBI Director Wray HASC testimony Jan 31, 2024.

### 2019 (reported) Russian electric grid pre-positioning

- **Attributed actor**: CYBERCOM (attribution confidence: medium; attributing source: NYT Sanger/Perlroth June 15, 2019)
- **Target**: Russian electric grid (reported "implants" / reconnaissance)
- **Vector / TTP**: not disclosed
- **Outcome**: signaling / deterrent; Trump denied report
- **Doctrine linkage**: deterrence-by-cost-imposition; counter-Russia grid-attack capability
- **Linkage confidence**: plausible (single major-outlet sourcing, denied by then-POTUS)
- **Citations**: NYT David Sanger/Nicole Perlroth June 15, 2019.

### 2024-onward Hunt Forward SOUTHCOM (Latin America/Caribbean)

- **Attributed actor**: CYBERCOM CNMF (attribution confidence: attested; attributing source: Gen. Dan Caine Senate testimony April 2025)
- **Target**: partner-government networks across SOUTHCOM AOR; discovered PRC ("Chinese Communist Party") malware on multiple foreign-partner networks
- **Outcome**: indicators shared; partner capacity built
- **Doctrine linkage**: Hunt Forward; counter-PRC pre-positioning
- **Linkage confidence**: attested
- **Citations**: Caine testimony April 1, 2025; DefenseScoop reporting.

### 2024 Hunt Forward Zambia

- **Attributed actor**: CYBERCOM CNMF (attribution confidence: attested)
- **Target**: Zambian government networks
- **Doctrine linkage**: Hunt Forward; African partnership expansion
- **Linkage confidence**: attested
- **Citations**: cybercom.mil; Breaking Defense / The Record reporting 2024.

### 2024 Hunt Forward Canada

- **Attributed actor**: CYBERCOM CNMF + CSE (Canadian counterpart)
- **Target**: Canadian government networks
- **Linkage confidence**: attested
- **Citations**: Gen. Haugh April 2024 posture statement.

### 2024 Hunt Forward Lithuania (second deployment)

- **Attributed actor**: CYBERCOM CNMF
- **Linkage confidence**: attested
- **Citations**: cybercom.mil 2024 release.

### 2018-onward CMF VirusTotal sample releases (cumulative event)

- **Attributed actor**: CYBERCOM CNMF (attribution confidence: attested; attributing source: CYBERCOM @CNMF_VirusTotal account; CYBERCOM press releases)
- **Target**: not a target — overt-attribution practice
- **Outcome**: hundreds of malware samples publicly released attributed to GRU (Sandworm), MSS (APT41 et al), MOIS, RGB. Major step toward overt-attribution norm.
- **Doctrine linkage**: Persistent Engagement (cost imposition through attribution)
- **Linkage confidence**: attested
- **Citations**: CYBERCOM CNMF on VirusTotal (https://www.virustotal.com/gui/user/CYBERCOM_Malware_Alert/); cybercom.mil press releases.

### 2025-01 Treasury OFAC sanctions on Salt Typhoon contractor

- **Attributed actor**: US Treasury OFAC (administrative — not a cyber op, but a doctrine-implementation event) (attribution confidence: attested)
- **Target**: Sichuan Juxinhe Network Technology and individual Yin Kecheng (PRC MSS-linked contractor enabling Salt Typhoon)
- **Outcome**: SDN listing; cost imposition under National Cybersecurity Strategy disrupt-and-dismantle pillar
- **Doctrine linkage**: imposing costs on PRC cyber-services market
- **Linkage confidence**: attested
- **Citations**: Treasury OFAC press release Jan 17, 2025.

### 2025-04 FBI $10M Salt Typhoon bounty

- **Attributed actor**: FBI Rewards for Justice (attribution confidence: attested)
- **Target**: Salt Typhoon operators
- **Doctrine linkage**: disrupt and dismantle
- **Linkage confidence**: attested
- **Citations**: FBI Rewards for Justice notice April 2025.

### 2024 Hunt Forward Kenya (reported)

- **Attributed actor**: CYBERCOM CNMF (attribution confidence: medium — reported in cumulative tallies; specific press release not located)
- **Linkage confidence**: plausible
- **Citations**: Gen. Haugh April 2024 statement aggregate.

### 2024-onward operations against Iranian-linked actors (election)

- **Attributed actor**: CYBERCOM + ODNI + FBI joint (attribution confidence: attested; attributing source: ODNI/FBI/CISA joint statements Aug–Oct 2024)
- **Target**: Iranian APT42 ("Mint Sandstorm") and related actors targeting US 2024 election campaigns
- **Vector / TTP**: not detailed; ODNI publicly attributed Iranian operations against Trump 2024 campaign
- **Outcome**: indictments (Sept 2024 — three IRGC operatives indicted); ongoing CYBERCOM disruption per posture statements
- **Doctrine linkage**: election defense
- **Linkage confidence**: attested
- **Citations**: ODNI/FBI/CISA Aug 19, 2024 joint statement; DOJ Sept 27, 2024 indictment.

### 1996–2013 cumulative TAO operations (per Snowden — "231 offensive cyber operations in 2011")

- **Attributed actor**: NSA TAO (attribution confidence: attested by virtue of leaked NSA budget doc)
- **Target**: 231 offensive operations across 2011 alone per leaked "black budget" (Snowden / WaPo Aug 30, 2013)
- **Outcome**: indicative of operational tempo; specific targets only partially disclosed (China, Russia, Iran, North Korea per leaked Presidential Policy Directive 20)
- **Linkage confidence**: attested (existence of operations); specific targets mostly plausible
- **Citations**: Barton Gellman/Ellen Nakashima WaPo "U.S. spy agencies mounted 231 offensive cyber-operations" Aug 30, 2013; PPD-20 leaked text.

### 2019 Iran retaliation strike (post-tanker attacks)

- **Attributed actor**: CYBERCOM (attribution confidence: attested; attributing source: Trump administration officials to WaPo/NYT June 22, 2019)
- **Target**: Iranian IRGC intelligence systems used to plan tanker attacks; missile-control systems (reported)
- **Vector / TTP**: not detailed
- **Outcome**: degraded Iranian capability per US officials; followed Trump's recall of kinetic strike
- **Doctrine linkage**: cyber-as-proportional-response; NSPM-13 authority exercise
- **Linkage confidence**: attested (officially confirmed by senior officials, on background)
- **Citations**: WaPo Ellen Nakashima June 22, 2019; NYT David Sanger/Julian Barnes June 22, 2019.

### 2020 Iran retaliation (post-Soleimani)

- **Attributed actor**: CYBERCOM (attribution confidence: plausible; not officially confirmed)
- **Target**: Iranian government networks following Jan 3, 2020 Soleimani strike
- **Linkage confidence**: plausible
- **Citations**: Yahoo News reporting (Jenna McLaughlin/Zach Dorfman) 2020.

### 2025 disruption of ransomware infrastructure (RaidForums / LockBit / others — joint Five Eyes)

- **Attributed actor**: FBI + Europol + NCA (attribution confidence: attested for LockBit "Operation Cronos" Feb 2024 announcement; ongoing 2024–25 operations)
- **Target**: LockBit affiliate infrastructure; other RaaS operators
- **Vector / TTP**: undercover infiltration, server seizure, decryption-key release
- **Outcome**: significant operational disruption to LockBit (later partially reconstituted)
- **Doctrine linkage**: Disrupt-and-Dismantle pillar of National Cybersecurity Strategy
- **Linkage confidence**: attested
- **Citations**: DOJ press releases Feb 20, 2024 and Oct 8, 2024; NCA Operation Cronos page.

### 2025 KV-Botnet follow-up + Volt Typhoon continued exposure

- **Attributed actor**: FBI + CISA + NSA (attribution confidence: attested)
- **Target**: continued Volt Typhoon presence in US critical infrastructure
- **Outcome**: ongoing public exposure; sanctions (Jan 2025); congressional testimony
- **Linkage confidence**: attested
- **Citations**: CISA AA24-038A and updates 2024–25; ODNI 2025 ATA.

---

## Event-count summary

- **Officially acknowledged (attested)** ops in this dossier: ~25
- **Strongly inferred** (multi-source journalism): ~8
- **Plausible** (single-source or leak-derived without independent corroboration): ~5

Total: ~38 events covering 2007–2026.
