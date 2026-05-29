# DPRK cyber events 2009–2026

Chronological. Each entry follows the AUSPEX SCHEMA event-entry format with confidence labels. Reference: `actors.md` for cluster definitions, `doctrines.md` for doctrine pillars.

> Note on dollar values: incident totals are at-the-time USD where possible. Crypto-theft totals frequently revised upward post-incident as more on-chain laundering is traced; values reflect best public estimate.

---

### 2009-07 Operation Troy (DDoS Independence Day attacks)

- **Attributed actor**: Lazarus precursor (later folded into Lazarus core) (attribution confidence: high; attributing source: ROK NIS, McAfee, multiple subsequent vendor confirmations)
- **Target**: US and South Korean government, financial, and news websites (~40 targets including White House, Treasury, DHS, Korean Presidential Blue House)
- **Vector / TTP**: Mydoom/Dozer-based botnet DDoS over Independence Day weekend
- **Outcome**: Sustained DDoS disruption; no destructive impact; first publicly attributed DPRK cyber op
- **Doctrine linkage**: Songun (RGB demonstrating capability under military-first ideology); Juche (asymmetric independent capability against perceived adversaries)
- **Linkage confidence**: plausible
- **Citations**: [1] McAfee *Operation Troy* (2013); [2] Wikipedia 2009 cyberattacks.

---

### 2011-03 Ten Days of Rain

- **Attributed actor**: Lazarus core (attribution confidence: high; McAfee, ROK NIS)
- **Target**: ROK government, US Forces Korea infrastructure, ROK financial sector
- **Vector / TTP**: DDoS + reconnaissance probes
- **Outcome**: Disruption, limited damage
- **Doctrine linkage**: Songun-era institutional cyber capability development
- **Linkage confidence**: plausible
- **Citations**: [3] McAfee *Ten Days of Rain* (2011).

---

### 2013-03 DarkSeoul wiper attacks

- **Attributed actor**: Lazarus / DarkSeoul cluster (attribution confidence: high; ROK NIS, McAfee, Symantec)
- **Target**: KBS, MBC, YTN (broadcasters); Shinhan Bank, Nonghyup, Jeju Bank
- **Vector / TTP**: spear-phishing → wiper malware (Jokra/HastatiWiper) with delayed-trigger
- **Outcome**: ~32,000 systems wiped; multi-day banking and broadcasting outage
- **Doctrine linkage**: Songun-era political signaling; demonstration of destructive capability against ROK critical sectors; Juche asymmetric response posture
- **Linkage confidence**: strongly inferred
- **Citations**: [4] Symantec *Four Years of DarkSeoul Cyberattacks Against South Korea Continue on Anniversary of Korean War* (2013); [5] Wikipedia 2013 SK cyberattack.

---

### 2014-11 Sony Pictures Entertainment destructive attack

- **Attributed actor**: Lazarus core / "Guardians of Peace" persona (attribution confidence: high; FBI public attribution Dec 19 2014; DOJ Park Jin Hyok indictment 2018)
- **Target**: Sony Pictures Entertainment (Culver City, CA, USA)
- **Vector / TTP**: spear-phishing → SMB-spreading wiper (Destover) + data exfiltration → public-leak coercion
- **Outcome**: ~3,000 systems wiped; >100TB exfiltrated; cancellation/limited release of *The Interview*; estimated >$35M cleanup
- **Doctrine linkage**: Juche regime-dignity / political-signaling; first US-attributed nation-state destructive attack on a US private company
- **Linkage confidence**: attested (FBI 2014 attribution explicitly names regime retaliation for *The Interview*)
- **Citations**: [6] FBI press release Dec 19 2014; [7] DOJ Park Jin Hyok complaint Sept 2018.

---

### 2015-12 Banco del Austro (Ecuador) SWIFT theft

- **Attributed actor**: APT38 (attribution confidence: medium-high; retrospectively per Mandiant 2018 APT38 report)
- **Target**: Banco del Austro, Ecuador
- **Vector / TTP**: SWIFT-message manipulation; pre-Bangladesh prototype attack
- **Outcome**: $12M stolen, partially recovered via litigation against Wells Fargo
- **Doctrine linkage**: Byungjin window hard-currency generation
- **Linkage confidence**: strongly inferred
- **Citations**: [8] Mandiant APT38 report (2018); [9] Reuters reporting 2016.

---

### 2016-02 Bangladesh Bank SWIFT heist

- **Attributed actor**: APT38 / Lazarus (attribution confidence: high; DOJ Three-Hacker indictment Feb 2021; FBI attribution 2017; Mandiant 2018)
- **Target**: Bangladesh Bank (central bank), via NY Fed correspondent account
- **Vector / TTP**: long-dwell network compromise (months); SWIFT Alliance Access message manipulation; printer-output suppression to delay detection over a weekend
- **Outcome**: $81M transferred to RCBC Manila + $20M to Sri Lanka; $850M further attempted but blocked. ~$15M of the $81M recovered. Largest publicly-confirmed bank cyber-heist of its time.
- **Doctrine linkage**: Byungjin parallel-development financing; canonical hard-currency-mechanism attestation
- **Linkage confidence**: attested (DOJ 2021 indictment language)
- **Citations**: [10] DOJ Three-Hacker indictment Feb 17 2021; [11] Mandiant APT38 (2018); [12] Wikipedia Bangladesh Bank robbery.

---

### 2016 Through 2017 — Global SWIFT campaign (FEIB Taiwan, BancoEstado Chile, etc.)

- **Attributed actor**: APT38 (attribution confidence: high; DOJ 2021, Mandiant 2018)
- **Target**: banks in Vietnam (Tien Phong Bank, attempted), Taiwan (Far Eastern International Bank ~$60M), Mexico (Bancomext attempted), Chile (BancoEstado), Malta (Bank of Valletta 2019 — see below)
- **Vector / TTP**: SWIFT-network compromise; FASTCash ATM-cashout-coordinated operations
- **Outcome**: tens of millions stolen across operations; pattern documented in CISA AA20-239A (BeagleBoyz)
- **Doctrine linkage**: hard-currency mechanism
- **Linkage confidence**: attested
- **Citations**: [13] CISA AA20-239A; [14] DOJ Three-Hacker indictment.

---

### 2017-05 WannaCry 2.0 global ransomware worm

- **Attributed actor**: Lazarus core (attribution confidence: high; UK NCSC + Five Eyes joint public attribution Dec 19 2017; DOJ Park Jin Hyok complaint Sept 2018)
- **Target**: ~200,000 systems in 150+ countries; UK NHS the highest-profile victim
- **Vector / TTP**: EternalBlue SMBv1 exploit (CVE-2017-0144) + DoublePulsar; ransomware payload with kill-switch domain
- **Outcome**: estimated $4B+ global economic damage; NHS surgery cancellations; minimal actual ransom collected (~$140K)
- **Doctrine linkage**: hard-currency mechanism (ransomware payment); broad strategic signaling. Note: many assessments consider the actual revenue accidental and the worm an out-of-control test.
- **Linkage confidence**: attested
- **Citations**: [15] White House Bossert statement Dec 18 2017; [16] DOJ Park Jin Hyok complaint; [17] UK NCSC.

---

### 2017-2018 Cryptocurrency exchange thefts (Youbit, Bithumb, Coinis, Yapizon)

- **Attributed actor**: Lazarus/APT38 (attribution confidence: high; ROK NIS, US Treasury, multiple subsequent indictments)
- **Target**: South Korean crypto exchanges
- **Vector / TTP**: spear-phishing of exchange employees; wallet-key extraction
- **Outcome**: tens of millions stolen; Youbit forced into bankruptcy
- **Doctrine linkage**: hard-currency mechanism; early pivot from SWIFT to crypto
- **Linkage confidence**: attested
- **Citations**: [18] DOJ Three-Hacker indictment 2021 (covers some of these); [19] UN PoE 2019 report.

---

### 2018 AppleJeus campaign begins

- **Attributed actor**: TraderTraitor / Citrine Sleet (attribution confidence: high; CISA AA21-048A, Microsoft Aug 2024)
- **Target**: cryptocurrency exchanges and traders globally
- **Vector / TTP**: trojanized crypto-trading apps (Celas Trade Pro, JMTTrading, Union Crypto Trader, Kupay Wallet, CoinGoTrade, Dorusio, Ants2Whale) — long-running campaign across multiple versions
- **Outcome**: tens of millions cumulative; precursor tradecraft for later TraderTraitor heists
- **Doctrine linkage**: hard-currency mechanism
- **Linkage confidence**: attested (CISA names DPRK WMD financing)
- **Citations**: [20] CISA AA21-048A AppleJeus.

---

### 2019-02 Bank of Valletta (Malta)

- **Attributed actor**: APT38 (attribution confidence: high; Mandiant, Maltese authorities)
- **Target**: Bank of Valletta, Malta
- **Vector / TTP**: SWIFT-style fraudulent transfers
- **Outcome**: €13M transferred to UK, US, Czech, HK accounts; transactions reversed; bank shut systems down for ~1 day
- **Doctrine linkage**: hard-currency mechanism
- **Linkage confidence**: attested
- **Citations**: [21] Reuters Feb 2019; [22] Mandiant APT38 follow-up tracking.

---

### 2019-08 Cosmos Bank (India) FASTCash ATM cash-out

- **Attributed actor**: APT38 / BeagleBoyz (attribution confidence: high; CISA AA20-239A)
- **Target**: Cosmos Cooperative Bank, Pune, India
- **Vector / TTP**: FASTCash malware on bank's payment-switch infrastructure; coordinated worldwide ATM cash-out
- **Outcome**: $13.5M extracted from ATMs in 28 countries simultaneously
- **Doctrine linkage**: hard-currency mechanism
- **Linkage confidence**: attested
- **Citations**: [23] CISA AA20-239A.

---

### 2020 COVID-19 vaccine research targeting (Pfizer, AstraZeneca, Cerba)

- **Attributed actor**: Lazarus core + Kimsuky (attribution confidence: high; Microsoft Nov 2020; UK NCSC; ROK NIS Feb 2021)
- **Target**: Pfizer, AstraZeneca, Cerba HealthCare, and multiple pharmaceutical / vaccine research firms across 6 countries
- **Vector / TTP**: spear-phishing impersonating WHO recruiters; credential harvesting
- **Outcome**: data exfiltration; ROK NIS attributed an attempted breach of Pfizer
- **Doctrine linkage**: strategic-intel collection; Juche self-reliance (regime vaccine development); arguably also revenue (later monetization risk)
- **Linkage confidence**: strongly inferred
- **Citations**: [24] Microsoft MSTIC Nov 2020; [25] Reuters ROK NIS report Feb 2021.

---

### 2021-02 Three-Hacker DOJ indictment unsealed

- **Attributed actor**: Lazarus / APT38 — Jon Chang Hyok, Kim Il, Park Jin Hyok (attribution confidence: highest, DOJ indictment)
- **Target**: retrospective consolidation of 2014–2020 ops
- **Outcome**: not an attack event itself, but a primary-source consolidation of attribution covering Sony, Bangladesh Bank, WannaCry, multiple SWIFT thefts, AppleJeus, ATM cash-outs, Marine Chain ICO fraud, and a $1.3B attempted theft total
- **Doctrine linkage**: attestation document — names "Reconnaissance General Bureau" and "Lab 110"
- **Linkage confidence**: attested
- **Citations**: [26] DOJ press release Feb 17 2021.

---

### 2021-08 InkySquid browser-exploit campaign

- **Attributed actor**: APT37 / InkySquid (attribution confidence: high; Volexity)
- **Target**: South Korean newspaper Daily NK; defectors and journalists
- **Vector / TTP**: watering-hole using IE/Edge zero-days; BLUELIGHT and RokRAT delivery
- **Outcome**: targeted surveillance compromise
- **Doctrine linkage**: Juche internal-security / strategic-information
- **Linkage confidence**: attested (Volexity explicitly notes defector/journalist targeting)
- **Citations**: [27] Volexity InkySquid blog Aug 2021.

---

### 2021-12 Log4Shell exploitation begins

- **Attributed actor**: multiple DPRK clusters (Andariel especially, per CISA AA23-040A) (attribution confidence: high)
- **Target**: opportunistic global; ransomware staging into healthcare and energy
- **Vector / TTP**: CVE-2021-44228 (Log4Shell) initial access
- **Outcome**: ransomware deployment (Maui), espionage staging
- **Doctrine linkage**: hard-currency mechanism + 8th Party Congress modernization tasking
- **Linkage confidence**: attested
- **Citations**: [28] CISA AA22-187A; [29] CISA AA23-040A.

---

### 2022-03 Ronin Network / Axie Infinity hack

- **Attributed actor**: TraderTraitor / Lazarus (attribution confidence: high; Treasury OFAC SDN April 14 2022; FBI)
- **Target**: Ronin sidechain (Sky Mavis / Axie Infinity)
- **Vector / TTP**: spear-phishing of Sky Mavis engineer via fake job offer → access to 4 validator nodes + Axie DAO compromise for 5th validator signature
- **Outcome**: 173,600 ETH + 25.5M USDC stolen, worth **$625M** at time. Largest DeFi exploit to date.
- **Doctrine linkage**: hard-currency mechanism → 8th Party Congress modernization line (Treasury cites WMD/missile financing)
- **Linkage confidence**: attested
- **Citations**: [30] Treasury OFAC Apr 14 2022 (first DPRK crypto-wallet SDN); [31] FBI statement Apr 14 2022.

---

### 2022-04 CISA AA22-108A TraderTraitor advisory

- **Attributed actor**: TraderTraitor cluster (attribution confidence: high; multi-agency)
- **Target**: blockchain technology and cryptocurrency industry
- **Vector / TTP**: trojanized crypto apps via fake job recruitment
- **Outcome**: not an event itself — joint advisory consolidating the cluster and providing IoCs
- **Doctrine linkage**: hard-currency mechanism
- **Linkage confidence**: attested
- **Citations**: [32] CISA AA22-108A.

---

### 2022-06 Harmony Horizon Bridge hack

- **Attributed actor**: Lazarus / APT38 / TraderTraitor (attribution confidence: high; FBI Jan 23 2023)
- **Target**: Harmony Horizon Bridge
- **Vector / TTP**: validator-node private-key compromise via TraderTraitor social-engineering
- **Outcome**: **$100M** stolen; subsequently laundered through RAILGUN privacy protocol; partial seizure by Binance/Huobi
- **Doctrine linkage**: hard-currency mechanism → WMD/missile financing
- **Linkage confidence**: attested
- **Citations**: [33] FBI Jan 23 2023; [34] Elliptic Harmony briefing.

---

### 2022-07 CISA Maui Ransomware advisory

- **Attributed actor**: Andariel (attribution confidence: high; CISA/FBI/HHS)
- **Target**: US Healthcare and Public Health Sector (since May 2021)
- **Vector / TTP**: manually deployed Maui ransomware; AES encryption with operator-supplied keys
- **Outcome**: multi-victim hospital encryption events; ransoms paid in BTC
- **Doctrine linkage**: hard-currency mechanism (ransom proceeds → further intrusions per 2024 Rim Jong Hyok indictment); also strongly inferred secondary mission of disruption tolerance against US healthcare
- **Linkage confidence**: attested
- **Citations**: [35] CISA AA22-187A.

---

### 2022-08 DEV-0530 / H0lyGh0st ransomware

- **Attributed actor**: PLUTONIUM / H0lyGh0st (attribution confidence: high; Microsoft MSTIC July 2022)
- **Target**: small/medium businesses globally
- **Vector / TTP**: opportunistic ransomware; demands ~1.2–5 BTC
- **Outcome**: modest revenue; pattern of low-yield ransomware
- **Doctrine linkage**: hard-currency mechanism (lower tier)
- **Linkage confidence**: attested
- **Citations**: [36] Microsoft MSTIC July 14 2022.

---

### 2023-02 CISA AA23-040A — #StopRansomware DPRK

- **Attributed actor**: Andariel + multiple DPRK ransomware operations (attribution confidence: high; CISA/NSA/FBI/HHS/ROK NIS/ROK DSA joint)
- **Target**: critical-infrastructure entities (especially Healthcare/PH)
- **Vector / TTP**: Maui, H0lyGh0st, exploitation of Log4Shell / SonicWall SMA100 / TerraMaster OS
- **Outcome**: joint cybersecurity advisory; major doctrinal-attestation document — links ransomware to DPRK WMD financing
- **Doctrine linkage**: hard-currency mechanism → 8th Party Congress line
- **Linkage confidence**: attested
- **Citations**: [37] CISA AA23-040A Feb 9 2023.

---

### 2023-03 3CX supply-chain compromise

- **Attributed actor**: UNC4736 / Labyrinth Chollima / Diamond Sleet (attribution confidence: high; Mandiant, CrowdStrike, Volexity)
- **Target**: 3CX DesktopApp users (~600,000 customers globally; selective second-stage on cryptocurrency firms)
- **Vector / TTP**: cascading supply-chain compromise — initial access via *prior* compromise of Trading Technologies *X_TRADER* installer (the first publicly documented cascading software-supply-chain attack); then trojanized 3CX DesktopApp; DLL side-loading; ICONIC Stealer + Gopuram second stage
- **Outcome**: data exfiltration from selected crypto victims; broad downstream IoC scramble
- **Doctrine linkage**: hard-currency mechanism (crypto-firm targeting); supply-chain innovation
- **Linkage confidence**: attested
- **Citations**: [38] Mandiant 3CX blog Apr 2023; [39] CrowdStrike Labyrinth Chollima statement; [40] Volexity ICONIC report.

---

### 2023-06 Atomic Wallet user-wallet theft

- **Attributed actor**: Lazarus (attribution confidence: high; Elliptic Jun 2023; FBI subsequent referencing)
- **Target**: Atomic Wallet end users
- **Vector / TTP**: undisclosed wallet-software compromise; mass private-key exfiltration
- **Outcome**: initial estimate $35M; revised to **~$100M** by Elliptic. Laundered via Sinbad mixer (same as Harmony).
- **Doctrine linkage**: hard-currency mechanism
- **Linkage confidence**: attested (subsequent OFAC Sinbad sanctioning explicitly cites DPRK)
- **Citations**: [41] Elliptic Atomic Wallet blog; [42] Treasury OFAC Sinbad sanction Nov 29 2023.

---

### 2023-07 JumpCloud supply-chain compromise

- **Attributed actor**: TraderTraitor / Labyrinth Chollima (attribution confidence: high; Mandiant, CrowdStrike, SentinelLabs)
- **Target**: JumpCloud (cloud identity SaaS); ~5 downstream crypto-customer firms
- **Vector / TTP**: spear-phishing into JumpCloud; lateral pivot through JumpCloud commands API; downstream crypto-firm compromise
- **Outcome**: ~$147.5M follow-on crypto thefts from compromised downstream firms
- **Doctrine linkage**: hard-currency mechanism; supply-chain pivot doctrine
- **Linkage confidence**: attested
- **Citations**: [43] JumpCloud post-incident report Jul 2023; [44] Mandiant blog; [45] CrowdStrike attribution.

---

### 2023-07 Alphapo / CoinsPaid heists

- **Attributed actor**: Lazarus (attribution confidence: high; FBI Aug 22 2023 PSA)
- **Target**: Alphapo (~$60M), CoinsPaid (~$37M), Atomic Wallet (separately)
- **Vector / TTP**: hot-wallet compromise; social-engineering of crypto-platform staff
- **Outcome**: combined ~$100M
- **Doctrine linkage**: hard-currency mechanism
- **Linkage confidence**: attested
- **Citations**: [46] FBI PSA Aug 22 2023.

---

### 2023-09 Stake.com crypto-casino theft

- **Attributed actor**: Lazarus (attribution confidence: high; FBI PSA Sept 6 2023)
- **Target**: Stake.com (online casino)
- **Vector / TTP**: undisclosed wallet/key compromise
- **Outcome**: **$41M** stolen across BNB, ETH, Polygon chains
- **Doctrine linkage**: hard-currency mechanism
- **Linkage confidence**: attested
- **Citations**: [47] FBI PSA Sept 6 2023.

---

### 2023-11 Kimsuky entity OFAC sanction

- **Attributed actor**: Kimsuky (attribution confidence: highest; OFAC)
- **Target**: not an attack — sanctioning of the cluster itself
- **Outcome**: Treasury SDN designation of Kimsuky as a DPRK government cyber actor responsible for stealing strategic intelligence
- **Doctrine linkage**: strategic-information doctrine; Juche internal-security
- **Linkage confidence**: attested
- **Citations**: [48] Treasury press release Nov 30 2023.

---

### 2023-11 Sinbad mixer sanction

- **Attributed actor**: Lazarus (as user of Sinbad) (attribution confidence: highest; OFAC)
- **Target**: Sinbad.io mixer (designation)
- **Outcome**: Treasury SDN designation; mixer used to launder Ronin, Harmony, Atomic Wallet proceeds
- **Doctrine linkage**: sanctions-evasion-as-state-policy; hard-currency mechanism
- **Linkage confidence**: attested
- **Citations**: [49] Treasury Nov 29 2023.

---

### 2023-11 Malligyong-1 reconnaissance satellite launch (referenced for doctrine timeline, not a cyber event)

- Listed here only for AUSPEX cross-reference: DPRK successfully orbits its first military reconnaissance satellite, fulfilling 8th Party Congress item 9 — confirms doctrine-event linkage for the satellite-related defense-contractor intrusion campaigns of 2022–2023.

---

### 2024-03 Treasury sb0230 — DPRK fraud network

- **Attributed actor**: Office 39 / IT-worker fraud facilitators (attribution confidence: highest; OFAC)
- **Target**: not an attack — sanctioning of facilitators in UAE, China, Russia
- **Outcome**: SDN designation of multiple individuals and entities for laundering cybercrime and IT-worker proceeds to fund DPRK weapons programs
- **Doctrine linkage**: sanctions-evasion; 8th Party Congress modernization line
- **Linkage confidence**: attested
- **Citations**: [50] Treasury sb0230 Mar 2024.

---

### 2024-04 UN Panel of Experts mandate ended

- **Attributed actor**: n/a (Russia veto in UNSC)
- **Target**: AUSPEX data-availability impact only
- **Outcome**: Independent UN sanctions monitoring on DPRK ceased after 15 years. Final 1718 PoE report released March 2024 documented ~$3B DPRK crypto theft 2017–2023 and 58 incidents under investigation.
- **Doctrine linkage**: structural — degrades primary-source baseline for sanctions evasion monitoring
- **Linkage confidence**: attested (this is the documentary fact)
- **Citations**: [51] UN 1718 PoE final report Mar 2024; [52] Reuters Russia veto Mar 28 2024.

---

### 2024-05 DMM Bitcoin theft

- **Attributed actor**: TraderTraitor / Jade Sleet / UNC4899 (attribution confidence: high; FBI/DC3/Japan NPA joint Dec 23 2024)
- **Target**: DMM Bitcoin (Japan-based exchange), via supply-chain compromise of Ginco (Japan-based enterprise wallet software vendor)
- **Vector / TTP**: LinkedIn fake-recruiter targeting a Ginco employee → malicious Python "pre-employment test" → session-cookie hijack → impersonation in Ginco's unencrypted comms system → manipulation of a legitimate DMM transaction request
- **Outcome**: **$308M (4,502.9 BTC)** stolen — largest crypto hack of 2024
- **Doctrine linkage**: hard-currency mechanism → 8th Party Congress modernization line
- **Linkage confidence**: attested
- **Citations**: [53] FBI press release Dec 23 2024; [54] Cointelegraph / The Record coverage.

---

### 2024-05 Microsoft outs Moonstone Sleet

- **Attributed actor**: Moonstone Sleet / Storm-1789 (attribution confidence: high; Microsoft MSTIC)
- **Target**: software vendors, defense aerospace, education, IT, financial services
- **Vector / TTP**: fake companies (StarGlow Ventures, C.C. Waterfall), trojanized PuTTY/SumatraPDF, malicious *DeTankWar* game, npm packages, FakePenny custom ransomware ($6.6M demand)
- **Outcome**: campaign disclosure; novel revenue-vector innovation
- **Doctrine linkage**: hard-currency mechanism + 8th Party Congress modernization line (aerospace targets)
- **Linkage confidence**: attested
- **Citations**: [55] Microsoft MSTIC May 28 2024.

---

### 2024-05 Treasury sb0416 — IT-worker fraud sanctions

- **Attributed actor**: DPRK Munitions Industry Department + facilitators (attribution confidence: highest; OFAC)
- **Target**: not an attack — sanctioning of 6 individuals + 2 entities
- **Outcome**: SDN designation; Treasury explicitly states IT-worker scheme generated **~$800M in 2024** to fund DPRK WMD programs
- **Doctrine linkage**: 8th Party Congress modernization line — attested
- **Linkage confidence**: attested
- **Citations**: [56] Treasury sb0416 May 2024.

---

### 2024-05 Christina Chapman arrest / 14-person superseding indictment building

- **Attributed actor**: DPRK IT-worker scheme (attribution confidence: highest; DOJ)
- **Target**: 309 US businesses, 68 stolen identities; one of the largest IT-worker fraud rings publicly charged
- **Outcome**: Chapman plea Feb 2025; sentenced 102 months July 24 2025; $17M in fraudulent revenue documented
- **Doctrine linkage**: hard-currency mechanism — attested
- **Linkage confidence**: attested
- **Citations**: [57] DOJ Chapman sentencing release July 24 2025; [58] DOJ original indictment May 2024.

---

### 2024-07 Andariel indictment (Rim Jong Hyok)

- **Attributed actor**: Andariel / Onyx Sleet / APT45 (attribution confidence: highest; DOJ Kansas grand jury)
- **Target**: retrospective consolidation — US hospitals (Maui ransomware), NASA OIG, 4 US defense contractors, 2 US Air Force bases, ROK & Taiwan defense industrial base, Chinese-launched-energy/defense entities
- **Vector / TTP**: spear-phishing + Log4Shell exploitation; Maui ransomware deployment; ransom-payment laundering via PRC facilitators to purchase further infrastructure
- **Outcome**: indictment; State Department $10M Rewards-for-Justice offer
- **Doctrine linkage**: 8th Party Congress modernization (defense-tech collection); hard-currency mechanism (ransomware revenue → operational infrastructure → further intrusions)
- **Linkage confidence**: attested
- **Citations**: [59] DOJ press release July 25 2024.

---

### 2024-08 Citrine Sleet Chromium zero-day (CVE-2024-7971)

- **Attributed actor**: Citrine Sleet / AppleJeus / Labyrinth Chollima (attribution confidence: medium-high; Microsoft MSTIC)
- **Target**: cryptocurrency-sector employees
- **Vector / TTP**: voyagorclub[.]space exploit domain; V8 type-confusion zero-day RCE; Windows sandbox escape; **FudModule** rootkit (admin-to-kernel; previously used by Diamond Sleet)
- **Outcome**: targeted RCE; pre-positioning for follow-on crypto theft
- **Doctrine linkage**: hard-currency mechanism
- **Linkage confidence**: attested
- **Citations**: [60] Microsoft MSTIC blog Aug 30 2024.

---

### 2024-08 Symantec Stonefly post-indictment activity

- **Attributed actor**: Andariel / Stonefly (attribution confidence: high; Symantec/Broadcom)
- **Target**: 3 US organizations
- **Vector / TTP**: extortion attempts
- **Outcome**: post-indictment proof of continued operations
- **Doctrine linkage**: hard-currency mechanism
- **Linkage confidence**: attested
- **Citations**: [61] Symantec/Broadcom Aug 2024.

---

### 2024-09 Kimsuky KLogEXE / FPSpy

- **Attributed actor**: Kimsuky / APT43 (attribution confidence: high; Palo Alto Unit 42)
- **Target**: South Korea-related individuals
- **Vector / TTP**: spear-phishing; new keylogger (KLogEXE) and surveillance tool (FPSpy)
- **Outcome**: targeted surveillance
- **Doctrine linkage**: strategic-information / Juche internal-security
- **Linkage confidence**: strongly inferred
- **Citations**: [62] Palo Alto Unit 42 Sept 2024.

---

### 2024-12 DOJ 14-national IT-worker indictment

- **Attributed actor**: DPRK IT-worker scheme (attribution confidence: highest; DOJ)
- **Target**: US Fortune 500 + small/mid US businesses; multi-year scheme
- **Outcome**: 14 DPRK nationals indicted; identifies the Yanbian Silverstar Network / Volasys Silver Star front companies in PRC
- **Doctrine linkage**: 8th Party Congress modernization
- **Linkage confidence**: attested
- **Citations**: [63] DOJ press release Dec 12 2024.

---

### 2025-02 Bybit / Safe{Wallet} heist

- **Attributed actor**: TraderTraitor (FBI named); subordinate to RGB 3rd Bureau (attribution confidence: highest; FBI IC3 PSA250226 Feb 26 2025)
- **Target**: Bybit cryptocurrency exchange, via supply-chain compromise of Safe{Wallet} (Gnosis Safe) developer environment
- **Vector / TTP**: compromise of Safe{Wallet} developer's machine; injection of malicious JavaScript into the Safe UI loaded specifically for Bybit's multisig transactions; manipulation of cold-to-warm-wallet transfer to redirect funds
- **Outcome**: **~$1.5B in virtual assets** stolen — **largest cryptocurrency theft in history**. Funds converted to BTC and dispersed across thousands of addresses on multiple chains.
- **Doctrine linkage**: hard-currency mechanism → 8th Party Congress modernization line (Treasury/FBI standard language)
- **Linkage confidence**: attested
- **Citations**: [64] FBI IC3 PSA250226 Feb 26 2025; [65] The Hacker News Safe{Wallet} post-mortem.

---

### 2025-06 Microsoft Jasper Sleet — IT-worker evolution

- **Attributed actor**: Jasper Sleet (DPRK IT-worker cluster, MS designation) (attribution confidence: high; Microsoft)
- **Target**: global enterprises employing remote IT workers
- **Vector / TTP**: AI-generated personas; deepfaked interviews; **post-termination data extortion** as new tactic
- **Outcome**: doctrinal evolution from passive wage-fraud to active insider-extortion
- **Doctrine linkage**: hard-currency mechanism; expansion of revenue-generation taxonomy
- **Linkage confidence**: attested
- **Citations**: [66] Microsoft Jasper Sleet blog June 30 2025.

---

### 2025-07 Christina Chapman sentencing

- **Attributed actor**: DPRK IT-worker facilitation network (attribution confidence: highest; DOJ)
- **Target**: AUSPEX deterrence-baseline event
- **Outcome**: 102-month sentence; full restitution order
- **Doctrine linkage**: 8th Party Congress modernization line
- **Linkage confidence**: attested
- **Citations**: [67] DOJ sentencing release July 24 2025.

---

### 2025 ongoing — cumulative annual crypto theft (~$2B, multi-incident)

- **Attributed actor**: TraderTraitor + adjacent (attribution confidence: high; Chainalysis Dec 2025)
- **Target**: cryptocurrency platforms globally
- **Vector / TTP**: continued supply-chain + social-engineering vectors
- **Outcome**: $2.02B+ stolen in 2025; cumulative DPRK total $6.75B+ lower-bound
- **Doctrine linkage**: 8th Party Congress modernization line
- **Linkage confidence**: attested
- **Citations**: [68] Chainalysis crypto-hacking 2026 report (released Dec 18 2025).

---

### 2026-01 State Department / MSMT report

- **Attributed actor**: n/a — sanctions monitoring
- **Target**: AUSPEX baseline
- **Outcome**: State Department public release "DPRK Violations and Evasions of UN Sanctions through Cyber and IT Worker Activities" — first major US gov consolidated assessment in the post-UN-PoE era; preserves attestation chain
- **Doctrine linkage**: full doctrine consolidation document
- **Linkage confidence**: attested
- **Citations**: [69] State Department release Jan 2026.

---

## Patterns of note

1. **Tempo correlation with missile testing**: each year of accelerated DPRK missile/satellite testing (notably 2022, 2023, 2025) coincides with record or near-record annual crypto-theft totals, consistent with the doctrinal proposition that cyber funds modernization.
2. **Supply-chain doctrine is recent and accelerating**: from 3CX (2023) → JumpCloud (2023) → Safe{Wallet} (2025), DPRK has institutionalized supply-chain pivot as a default targeting model for crypto firms. Expect more.
3. **IT-worker fraud is now the second revenue channel**: by Treasury's own numbers (~$800M in 2024), the IT-worker scheme rivals annual crypto-theft yield and is structurally more resilient.
4. **Healthcare and aerospace remain Andariel's dual focus**: the 2024 Rim indictment explicitly links these two target sets through the same actor and the same revenue→operations loop.
5. **Espionage clusters (Kimsuky, APT37) operate at much lower visibility**: rarely produce a single high-yield event but produce continuous low-grade compromise of policy ecosystems. Likely under-counted in event timelines like this one.
