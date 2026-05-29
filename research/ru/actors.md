# Russia — Cyber Actors

Organized by parent service. Aliases follow vendor conventions (Microsoft "Blizzard"/"Storm" weather-system rename of 2023 included). Attribution sources prioritize US DOJ indictments, Treasury OFAC sanctions, UK NCSC / Five Eyes joint advisories, and primary vendor reporting (Mandiant, MSTIC, ESET, SentinelLabs, CrowdStrike).

---

## GRU (Main Directorate of the General Staff of the Armed Forces) — Military Intelligence

### Sandworm (aliases: APT44, Voodoo Bear, Telebots, IRIDIUM, Seashell Blizzard, Iron Viking, BE2 APT, Electrum, Quedagh)

- **Parent service**: GRU Unit 74455 — Main Center for Special Technologies (GTsST, "the Tower"), located at 22 Kirova Street, Khimki, Moscow region.
- **Active since**: at least 2009 (BlackEnergy precursor activity); operational name "Sandworm" coined by iSIGHT (now Mandiant) in 2014.
- **Status**: active; six officers indicted by DOJ Oct 2020; under EU/UK sanctions; upgraded to named APT44 by Mandiant Apr 2024.
- **Primary mission**: destructive/disruptive cyber operations supporting GRU military objectives; OT/ICS sabotage; influence operations integrated with kinetic action.
- **Sectors targeted**: electric grid, government, media, transportation, judiciary, defense, financial services, satellite comms — overwhelmingly in Ukraine, also Georgia, Poland, France, South Korea, US.
- **Notable TTPs**: BlackEnergy3, Industroyer/Industroyer2, NotPetya, Olympic Destroyer, KillDisk, HermeticWiper, CaddyWiper, IsaacWiper, AcidRain, SwiftSlicer, FrostyGoop (ICS-tailored). Living-off-the-land OT techniques (Mandiant 2023 disclosed). False-flag tradecraft (Olympic Destroyer disguised as Lazarus/Chinese).
- **Public attribution**:
  - DOJ Indictment, 15 Oct 2020 (Pittsburgh) — six GRU officers named (Andrienko, Detistov, Frolov, Kovalev, Ochichenko, Pliskin) for NotPetya, Olympic Destroyer, Ukraine grid 2015–16, French elections, Novichok inquiry targeting. https://www.justice.gov/archives/opa/pr/six-russian-gru-officers-charged-connection-worldwide-deployment-destructive-malware-and
  - UK NCSC + Five Eyes attribution of Olympic Destroyer (Oct 2020).
  - US Treasury OFAC sanctions on GTsST (2020).
  - Mandiant, "APT44: Unearthing Sandworm" (Apr 2024).
- **Doctrine alignment**: 2014 Military Doctrine (non-contact warfare), Russkiy Mir (Ukraine targeting), December 2021 Ultimatum (NATO degradation), energy weaponization (grid strikes paired with missile strikes). The most doctrine-aligned and most operationally productive Russian cyber unit.

### Fancy Bear / APT28 (aliases: Sofacy, Sednit, Pawn Storm, STRONTIUM, Tsar Team, Forest Blizzard, Group 74, IRON TWILIGHT, SNAKEMACKEREL)

- **Parent service**: GRU Unit 26165 — 85th Main Special Service Center (GTsSS), based at Komsomolsky Prospekt 20, Moscow. Cryptography/SIGINT-oriented unit.
- **Active since**: at least 2004.
- **Status**: active; twelve officers indicted by Mueller (Jul 2018) and Oct 2018 superseding; UK + EU sanctions on Unit 26165 and named officers (Badin, Morenets, et al.).
- **Primary mission**: strategic political and military espionage; election interference; hack-and-leak influence operations.
- **Sectors targeted**: government foreign-affairs and defense ministries, political parties, electoral commissions, defense contractors, think tanks, journalists, anti-doping bodies, energy and aerospace firms.
- **Notable TTPs**: X-Agent (Chopstick) cross-platform implant, X-Tunnel, Sofacy, Zebrocy, Lojax UEFI rootkit, credential phishing of webmail (Bitly URL shortener tradecraft), spearphishing with weaponized documents (Outlook NTLM relay CVE-2023-23397, RoundCube/Zimbra zero-days). On-site close-access ops (Hague OPCW 2018).
- **Public attribution**:
  - DOJ Indictment, 13 Jul 2018 (Mueller) — 12 GRU officers (Netyksho et al.) for DNC/DCCC hack and election interference. https://www.justice.gov/file/1080281/download
  - DOJ Indictment, 4 Oct 2018 — seven officers for WADA/USADA hacking, OPCW close-access, Westinghouse, MH17.
  - UK NCSC, "Reckless campaign of cyber attacks by Russian military intelligence service" (Oct 2018).
  - Dutch MIVD public exposure of Hague OPCW operation (Oct 2018).
- **Doctrine alignment**: 2014 Military Doctrine (information confrontation), 2023 Foreign Policy Concept (challenging "Anglo-Saxon" politics), NATO-degradation strand. Election interference fits cleanly under "destabilize internal political situation" of adversary states.

### Unit 54777 / 72nd Special Service Center (aliases: GRU psychological operations / "information confrontation" troops)

- **Parent service**: GRU Unit 54777 — psychological operations directorate; ties to "InfoRos," "Strategic Culture Foundation," and similar front media.
- **Active since**: post-2008 reorganization; activity visible from 2014 onward.
- **Status**: under US Treasury OFAC sanctions (multiple tranches 2020–24); officers and front entities sanctioned.
- **Primary mission**: psychological and information-influence operations abroad; production and amplification of GRU-aligned narratives.
- **Sectors targeted**: foreign-language media ecosystems, social platforms, diaspora communities, election narratives, COVID-19 disinformation.
- **Notable TTPs**: cutout media outlets, ghost-writer networks, AI-generated content (recent), coordinated inauthentic behavior on Telegram/X/Facebook.
- **Public attribution**: US Treasury OFAC press releases naming InfoRos, Strategic Culture Foundation, NewsFront as 54777 fronts (2020, 2022, 2024). US State Department GEC reports.
- **Doctrine alignment**: 2016 Information Security Doctrine and 2021 NSS "forces and means of information confrontation"; 2023 Foreign Policy Concept multipolar messaging.

### Cyber Army of Russia Reborn / CARR (aliases: Z-Pentest, "People's CyberArmy")

- **Parent service**: GRU — Treasury/DOJ assess CARR was "founded, funded, and directed by the GRU." Operationally proximate to Sandworm (Unit 74455).
- **Active since**: 2022.
- **Status**: leadership (Yuliya Pankratova, Denis Degtyarenko) sanctioned by US Treasury OFAC, 19 Jul 2024.
- **Primary mission**: deniable disruptive operations against Western critical infrastructure; performative ICS/HMI manipulation for influence effect.
- **Sectors targeted**: US water utilities (Muleshoe, Abernathy, Stanton TX; Indiana wastewater), European water utilities, agriculture/grain elevators.
- **Notable TTPs**: exploitation of internet-exposed HMIs and ICS; Telegram-published video proof; low-sophistication but high-visibility impact.
- **Public attribution**:
  - US Treasury OFAC press release (19 Jul 2024).
  - Mandiant attribution of Texas water incident to Sandworm-affiliated CARR (Apr 2024).
- **Doctrine alignment**: post-2022 sanctions-response posture; NATO-degradation; performative deterrence signaling.

---

## FSB (Federal Security Service) — Domestic security with strong external cyber mandate

### Turla (aliases: Snake, Uroburos, Venomous Bear, Waterbug, Krypton, Group 88, Secret Blizzard)

- **Parent service**: FSB Center 16 — 16th Center / Center for Electronic Surveillance of Communications (TsRRSS); SIGINT and foreign cyber-espionage element.
- **Active since**: ~2004 (Snake/Uroburos codebase developed circa 2003–04).
- **Status**: active; Snake P2P infrastructure disrupted by FBI Operation MEDUSA, 9 May 2023.
- **Primary mission**: long-dwell strategic espionage against foreign-ministry, defense, and policy targets.
- **Sectors targeted**: NATO governments (especially MFAs and embassies), defense ministries, journalists, research institutions; >50 countries.
- **Notable TTPs**: Snake/Uroburos kernel rootkit with custom P2P C2 (most-sophisticated FSB tool per DOJ), ComRAT, Kazuar, satellite-link C2 hijacking, watering-hole, on-host fileless persistence, abuse of compromised infrastructure of other APTs.
- **Public attribution**:
  - DOJ, "Court-Authorized Disruption of the Snake Malware Network" (9 May 2023), explicitly attributing Snake to "a unit within Center 16 of the FSB." https://www.justice.gov/opa/pr/justice-department-announces-court-authorized-disruption-snake-malware-network
  - CISA AA23-129A joint advisory (May 2023).
- **Doctrine alignment**: classical strategic intelligence collection — 2016 Information Security Doctrine + 2023 Foreign Policy Concept (counter "unfriendly states"). Less doctrine-disruptive, more enduring intelligence pillar.

### Berserk Bear / Energetic Bear / Dragonfly (aliases: Crouching Yeti, TEMP.Isotope, Koala Team, Iron Liberty, DYMALLOY, Ghost Blizzard)

- **Parent service**: FSB Center 16 (the same TsRRSS) — distinct from Turla operationally but in the same parent center.
- **Active since**: at least 2010; sustained energy-sector targeting since 2011.
- **Status**: indicted by DOJ Mar 2022 (case unsealed); four FSB officers named.
- **Primary mission**: pre-positioning in energy-sector ICS/OT environments globally; intelligence collection for potential future disruptive operations.
- **Sectors targeted**: electric utilities, oil & gas, nuclear (Wolf Creek 2017), petrochemicals; US, UK, Germany, Turkey, Saudi Arabia.
- **Notable TTPs**: supply-chain compromise (Havex via ICS vendor websites 2014), watering-hole, credential harvesting, ICS engineering software trojans, Cisco IOS exploitation (CVE-2018-0171 Smart Install — CISA Aug 2025 advisory).
- **Public attribution**:
  - DOJ Indictment, 24 Mar 2022 — three FSB officers (Pavel Akulov, Mikhail Gavrilov, Marat Tyukov) named for energy-sector campaign 2012–17. https://www.justice.gov/opa/pr/four-russian-government-employees-charged-two-historical-hacking-campaigns-targeting
  - US Treasury OFAC sanctions on Center 16 (Mar 2022).
  - CISA TA18-074A (Mar 2018) — first US Govt attribution of Russian energy-sector campaign.
- **Doctrine alignment**: energy weaponization strand; 2014 Military Doctrine "non-contact" pre-positioning for coercion; NATO-pressure leverage.

### Triton / Xenotime (aliases: TEMP.Veles)

- **Parent service**: TsNIIKhM (Central Scientific Research Institute of Chemistry and Mechanics) — a Russian Ministry of Defense research institute; specific connection to FSB is contested in open source.
- **Active since**: 2014; Triton incident at Saudi Petro Rabigh disclosed 2017.
- **Status**: DOJ indictment of Evgeny Gladkikh (TsNIIKhM employee) unsealed Mar 2022; US Treasury OFAC sanctions on TsNIIKhM (Oct 2020).
- **Primary mission**: industrial control safety-instrumented-system (SIS) sabotage capability.
- **Sectors targeted**: petrochemical, oil & gas — specifically Schneider Electric Triconex SIS.
- **Notable TTPs**: Triton/Trisis malware targeting SIS controllers — uniquely dangerous because it disables the last line of safety before catastrophic physical event.
- **Public attribution**: DOJ Indictment, 24 Mar 2022 (Kansas City). Mandiant FireEye TRITON Actor TTP Profile (Apr 2019).
- **Doctrine alignment**: energy weaponization; pre-positioning for catastrophic coercion. Triton's safety-system targeting is the most aggressive ICS class observed from any nation-state.

### Gamaredon (aliases: Primitive Bear, Armageddon, Shuckworm, ACTINIUM, Aqua Blizzard, BlueAlpha, Trident Ursa)

- **Parent service**: FSB Center 18 / Center for Information Security (TsIB); Crimea-based operational element per SBU.
- **Active since**: 2013 (post-Crimea ramp-up 2014).
- **Status**: active; five FSB officers publicly named by Ukrainian SBU Nov 2021.
- **Primary mission**: high-volume, persistent cyber-espionage against Ukrainian government, military, and law enforcement.
- **Sectors targeted**: Ukrainian government, military, intelligence services, law enforcement, judiciary; >5,000 attacks against >1,500 systems per SBU.
- **Notable TTPs**: noisy, mass-spearphishing with weaponized Office docs and templates; PowerShell loaders (Pterodo, PowerPunch); fast-iteration malware (low sophistication, high volume); domain churn.
- **Public attribution**:
  - SBU public attribution (4 Nov 2021) — five FSB officers named, Crimean Sevastopol cell directed by FSB Center 18. https://thehackernews.com/2021/11/ukraine-identifies-russian-fsb-officers.html
  - MSTIC ACTINIUM advisory (Feb 2022).
- **Doctrine alignment**: Russkiy Mir / near-abroad; 2014 Military Doctrine (Ukraine as continuous theater); not a strategic-effect actor, but provides continuous tactical intelligence to feed Sandworm and military operations.

### Star Blizzard (aliases: Callisto Group, SEABORGIUM, COLDRIVER, TA446, BlueCharlie, TAG-53, Group G1033)

- **Parent service**: FSB Center 18 (per CISA/NCSC Dec 2023 joint assessment) — specifically "Centre 18 of the FSB."
- **Active since**: 2015 at least.
- **Status**: active; DOJ indicted Andrey Korinets and Ruslan Peretyatko (Dec 2023); UK FCDO sanctioned same individuals.
- **Primary mission**: credential phishing and hack-and-leak against UK/US/EU policy elites, defense intellectuals, exiled dissidents, dissident journalists, and former intelligence officials.
- **Sectors targeted**: think tanks, academia, NGOs, defense ministries, parliamentarians; pre-Brexit and 2019 UK election leak operations.
- **Notable TTPs**: realistic spoofed-persona spearphishing (Evilginx-style adversary-in-the-middle webmail captures), tailored impersonation of academic conferences; recent SPICA malware (Google TAG, Jan 2024).
- **Public attribution**:
  - CISA/NCSC Joint Advisory AA23-341A (7 Dec 2023). https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-341a
  - DOJ Indictment of Korinets and Peretyatko (Dec 2023).
- **Doctrine alignment**: information confrontation (2016/2021), 2023 Foreign Policy Concept "unfriendly states" framing; targets selected to shape Western policy discourse.

---

## SVR (Foreign Intelligence Service) — Strategic foreign HUMINT/SIGINT

### Cozy Bear / APT29 (aliases: Nobelium, Midnight Blizzard, The Dukes, YTTRIUM, NobleBaron, Iron Hemlock, UNC2452, Dark Halo, BlueBravo)

- **Parent service**: SVR — specifically assessed by US Govt as SVR's cyber operations element.
- **Active since**: at least 2008 (the Dukes lineage).
- **Status**: active; US/UK formal attribution Apr 2021 (SolarWinds); Treasury OFAC sanctions Apr 2021; continuous Microsoft, ESET, Mandiant reporting.
- **Primary mission**: strategic political and policy espionage; long-dwell collection against governments, think tanks, defense, vaccine research, tech vendors.
- **Sectors targeted**: foreign ministries (Norway, Netherlands, Denmark, US State, German MFA), national-security think tanks, defense contractors, IT supply-chain vendors, COVID-19 vaccine researchers (CISA/NCSC July 2020), cloud identity providers (Microsoft, Hewlett Packard Enterprise breaches 2024).
- **Notable TTPs**: supply-chain compromise (SolarWinds Orion → SUNBURST, Mar 2020; TeamCity exploitation CVE-2023-42793), cloud identity attacks (golden-SAML, password spray, OAuth app abuse, token theft), Magic Web (custom IIS module), WellMess, Diplomatic Orbiter campaigns, "low and slow" tradecraft.
- **Public attribution**:
  - White House statement attributing SolarWinds to SVR (15 Apr 2021). https://www.whitehouse.gov/briefing-room/statements-releases/2021/04/15/fact-sheet-imposing-costs-for-harmful-foreign-activities-by-the-russian-government/
  - US Treasury OFAC EO 14024 sanctions (15 Apr 2021).
  - UK NCSC + CISA + NSA, "Further TTPs Associated with SVR Cyber Actors" (May 2021).
  - Microsoft MSRC, "Microsoft Actions Following Attack by Nation State Actor Midnight Blizzard" (Jan 2024).
- **Doctrine alignment**: classical Foreign Policy Concept (2023) priority intelligence; supports Kremlin negotiation leverage; not destructive — supports decision-superiority objectives.

---

## Criminal / Hacktivist Proxies with Documented State Nexus

### Conti / TrickBot / Wizard Spider ecosystem (aliases: Ryuk, Diavol, Maze affiliations)

- **Parent service**: non-state criminal organization with documented FSB liaison; ContiLeaks and TrickLeaks (Feb–Mar 2022) exposed FSB Center 18 contacts and tasking against US/UK/Ukraine targets.
- **Active since**: TrickBot from 2016, Conti rebrand 2020, dissolution May 2022, reconstituted into BlackBasta, BlackByte, Royal, Karakurt.
- **Status**: 11+ members sanctioned by US Treasury + UK FCDO (Feb 2023, Sep 2023); core members indicted; group fragmented.
- **Primary mission**: ransomware-for-profit with FSB-priority targeting overlay (Ukraine government, US healthcare, sanctions-aligned victims).
- **Sectors targeted**: healthcare (HSE Ireland 2021), local government, manufacturing, education, energy.
- **Notable TTPs**: TrickBot loader → Conti ransomware affiliate model; Cobalt Strike, BazarLoader; double-extortion leak sites.
- **Public attribution**:
  - US/UK Joint Sanctions, 9 Feb 2023 (seven members). https://home.treasury.gov/news/press-releases/jy1714
  - US/UK Joint Sanctions, 7 Sep 2023 (eleven members).
  - Trickleaks/ContiLeaks dumps (Feb–Mar 2022) and Krebs analysis.
- **Doctrine alignment**: post-2022 sanctions-response (deniable retaliation); tolerated-criminal-host policy that is itself a strategic instrument.

### Killnet

- **Parent service**: non-state hacktivist front with assessed state coordination; founder "Killmilk" linked to Russian state media appearances.
- **Active since**: Mar 2022.
- **Status**: active; under EU and UK observation but not formally sanctioned as of mid-2026 in primary documents reviewed.
- **Primary mission**: DDoS against NATO governments and Ukraine-supporting states; influence-shaping signaling.
- **Sectors targeted**: government public-facing portals, airports, healthcare websites in Lithuania, Italy, Germany, US, UK.
- **Notable TTPs**: layer-7 DDoS, Telegram-coordinated swarming.
- **Public attribution**: CISA AA22-110A explicitly names Killnet among Russian-aligned cybercrime/hacktivist groups. https://www.cisa.gov/news-events/cybersecurity-advisories/aa22-110a
- **Doctrine alignment**: post-2022 sanctions-response posture; performative deterrence.

### NoName057(16)

- **Parent service**: non-state hacktivist front; DOJ Dec 2025 announcement assesses state-sanctioned project administered partially through CISM (Center for the Study and Network Monitoring of the Youth Environment), established by 2018 Russian presidential order.
- **Active since**: Mar 2022.
- **Status**: under EU "Operation Eastwood" disruption (Jul 2024); DOJ indictments and Spanish/Polish arrests of operators (2024–25).
- **Primary mission**: DDoS-for-volunteers ("DDoSia" project) against Ukraine and NATO targets.
- **Sectors targeted**: government, financial, transportation in Ukraine, Poland, Czechia, Lithuania, Italy, Germany, US.
- **Notable TTPs**: DDoSia client distributed to volunteers; crypto-incentivized participation; 1,500+ claimed attacks.
- **Public attribution**: DOJ press release (Dec 2025); Europol "Operation Eastwood." https://www.justice.gov/opa/pr/justice-department-announces-actions-combat-two-russian-state-sponsored-cyber-criminal
- **Doctrine alignment**: post-2022 sanctions-response; NATO-degradation; information-confrontation force-multiplier.

### XakNet, Anonymous Russia, RaHDIt (smaller fronts)

- **Parent service**: assessed GRU-adjacent per MSTIC ("Cadet Blizzard") and Mandiant.
- **Status**: active; activity surges around Ukraine front-line developments.
- **Primary mission**: leak operations, doxxing, low-tier disruption.
- **Doctrine alignment**: post-2022 sanctions-response; influence operations.

### Cadet Blizzard / Ember Bear / DEV-0586 (WhisperGate operator)

- **Parent service**: GRU — Microsoft MSTIC assesses as distinct unit from Sandworm, "associated with GRU." Mandiant tracks as UNC2589/FROZENVISTA partial overlap.
- **Active since**: visible from Jan 2022 (pre-invasion WhisperGate wiper deployment against Ukrainian government).
- **Status**: active; MSTIC public attribution Jun 2023.
- **Primary mission**: disruptive ops, defacements, hack-and-leak.
- **Sectors targeted**: Ukrainian government (WhisperGate Jan 2022), European/Latin American government and IT services.
- **Notable TTPs**: WhisperGate MBR wiper, hack-and-leak ("Free Civilian" persona).
- **Public attribution**: MSTIC "Cadet Blizzard emerges as a novel and distinct Russian threat actor" (14 Jun 2023). https://www.microsoft.com/en-us/security/blog/2023/06/14/cadet-blizzard-emerges-as-a-novel-and-distinct-russian-threat-actor/
- **Doctrine alignment**: NATO-degradation, Russkiy Mir / Ukraine theater.
