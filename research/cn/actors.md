# China — Named cyber actors

Actors are grouped by parent service. Each entry follows the AUSPEX SCHEMA. "Public attribution" prefers DOJ indictments, Treasury OFAC actions, and joint CISA/NSA/FBI/Five-Eyes advisories; vendor reports are added only where they materially extend the picture.

Microsoft 2023 taxonomy uses "Typhoon" for PRC actors. CrowdStrike uses "Panda." Mandiant uses "APT###" or "UNC####" pre-attribution. Secureworks uses "BRONZE ###." MITRE assigns "G####."

---

## PLA-linked

### APT1 (aliases: Comment Crew, Comment Group, Comment Panda, Byzantine Candor, PLA Unit 61398, GIF89a)

- **Parent service**: PLA General Staff Department, 3rd Department (3PLA), 2nd Bureau — Unit 61398, Pudong, Shanghai. Reorganized into the PLA Strategic Support Force in 2015; SSF dissolved into Cyberspace Force in April 2024.
- **Active since**: at least 2006 (Mandiant); inactive under "APT1" branding after the 2013 exposure but personnel reassigned within SSF/CSF.
- **Status**: dormant under this label; 2014 indictment of five PLA officers (Wang Dong et al.) remains outstanding.
- **Primary mission**: industrial / commercial espionage.
- **Sectors targeted**: aerospace, satellites & telecom, scientific research, IT, energy, navigation, chemicals, financial services, government — 20 industries documented across 141 victims.
- **Notable TTPs**: spear-phishing, custom backdoors (AURIGA, BANGAT, MANITSME), HTRAN proxy chains routed through Shanghai netblocks.
- **Public attribution**: Mandiant APT1 report (Feb 2013); DOJ indictment of five PLA officers, May 2014 (Western District of Pennsylvania).
- **Doctrine alignment**: MIC2025 precursors / Strategic Emerging Industries plans (2010); Military-Civil Fusion. The 2014 DOJ indictment specifically cited theft from Westinghouse, U.S. Steel, Alcoa, Allegheny Technologies, SolarWorld, USW — almost entirely mapping to MIC2025-listed sectors.

### PLA 54th Research Institute (Equifax operators)

- **Parent service**: PLA Strategic Support Force, Network Systems Department, 54th Research Institute.
- **Status**: indicted (4 PLA officers, February 2020).
- **Primary mission**: bulk PII collection, signals/cyber R&D.
- **Sectors targeted**: financial / credit-reporting; complementary to OPM (PII for HUMINT targeting pool).
- **Public attribution**: DOJ indictment, Feb 10 2020 (Northern District of Georgia); FBI Wanted poster. <https://www.fbi.gov/wanted/cyber/chinese-pla-members-54th-research-institute>
- **Doctrine alignment**: MCF (bulk-PII as intelligence enabler); supports HUMINT vetting and recruitment of U.S. persons cleared into MIC2025-relevant sectors.

### Su Bin / FREEZER (aviation collection ring)

- **Parent service**: Chinese government / PLA tasking (per DOJ); Su Bin worked with two unnamed PLA officers operating from China.
- **Active since**: at least October 2008 through March 2014.
- **Status**: convicted (Su Bin pled guilty March 2016; sentenced to 46 months).
- **Primary mission**: defense aerospace IP theft.
- **Sectors targeted**: U.S. defense aerospace primes — Boeing (C-17), Lockheed Martin (F-22, F-35).
- **Public attribution**: DOJ press release March 2016. <https://justice.gov/opa/pr/chinese-national-pleads-guilty-conspiring-hack-us-defense-contractors-systems-steal-sensitive>
- **Doctrine alignment**: MCF; aviation sector of MIC2025; J-20 fighter program development.

---

## MSS-linked APTs

### APT3 (aliases: Gothic Panda, UPS Team, Buckeye, TG-0110, Boyusec / Guangzhou Bo Yu Information Technology Co.)

- **Parent service**: MSS, Guangdong State Security Department, via contractor Boyusec.
- **Active since**: ~2009.
- **Status**: indicted (November 2017, Western District of Pennsylvania); group largely retooled / re-clustered into other MSS contractors after exposure.
- **Primary mission**: economic and dual-use espionage.
- **Sectors targeted**: aerospace, defense, telecom, semiconductors, finance (Moody's), industrial controls (Siemens), high-precision GPS (Trimble).
- **Notable TTPs**: zero-day exploitation of IE / Flash, Pirpi backdoor, leaked/reused NSA Equation tools (DoublePulsar / EternalBlue post-2017).
- **Public attribution**: DOJ indictment Nov 2017 — Wu Yingzhuo, Dong Hao, Xia Lei. Recorded Future / Intrusion Truth attribution to MSS Guangdong, May 2017.
- **Doctrine alignment**: MIC2025 (power equipment via Siemens; navigation via Trimble; financial intelligence via Moody's).

### APT10 (aliases: Stone Panda, MenuPass, Red Apollo, CVNX, POTASSIUM, Cicada, BRONZE RIVERSIDE, Potassium, ATK 41)

- **Parent service**: MSS, Tianjin State Security Bureau, via contractor Huaying Haitai.
- **Active since**: ~2006.
- **Status**: indicted (December 2018); Zhu Hua and Zhang Shilong charged. Group continued operating under successor clusters (Cicada, Earth Tengshe).
- **Primary mission**: strategic IP theft at scale via managed-service-provider supply chain.
- **Sectors targeted**: managed service providers (HPE, IBM), aerospace, satellite, telecom, mining, pharma, biotech, U.S. Navy personnel records.
- **Notable TTPs**: spearphishing → MSP credentials → lateral pivot into MSP customers (Operation Cloud Hopper); UPPERCUT/ANEL, ChChes, RedLeaves, QuasarRAT.
- **Public attribution**: DOJ indictment Dec 2018; UK NCSC and Five-Eyes joint statement Dec 2018. Operation Cloud Hopper report by PwC and BAE Systems (April 2017).
- **Doctrine alignment**: MIC2025 (every named MIC2025 sector hit at least once via Cloud Hopper); MCF; Standards 2035 (telecom).

### APT31 (aliases: Zirconium, Judgment Panda, Violet Typhoon, BRONZE VINEWOOD, TA412, Red Keres)

- **Parent service**: MSS, Hubei State Security Department (Wuhan), via front company Wuhan Xiaoruizhi Science & Technology Co. ("Wuhan XRZ").
- **Active since**: at least 2010.
- **Status**: indicted and sanctioned (March 2024, EDNY). Seven defendants; OFAC SDN designations of Wuhan XRZ, Zhao Guangzong, Ni Gaobin.
- **Primary mission**: political and economic espionage; targeting of foreign politicians, dissidents, journalists, NGOs, plus critical infrastructure.
- **Sectors targeted**: U.S. White House, State Department, congressional staff, IPAC parliamentarians, defense contractors, aerospace, energy (2018 Texas energy compromise cited in indictment), telecom.
- **Notable TTPs**: 10,000+ malicious tracking/exploit emails; HTML smuggling; exploitation of zero-days against the Pwn2Own pipeline (Edge/Chrome).
- **Public attribution**: DOJ indictment / OFAC SDN, 25 March 2024; UK NCSC coordinated attribution.
- **Doctrine alignment**: MIC2025 / 14th FYP; 2017 National Intelligence Law (collection against IPAC, dissidents); Taiwan/Hong Kong democracy targeting.

### APT40 (aliases: Leviathan, Periscope, TEMP.Periscope, TEMP.Jumper, BRONZE MOHAWK, Mudcarp, Kryptonite Panda, Gingham Typhoon, FEVERDREAM, Hellsing, GreenCrash, Gadolinium)

- **Parent service**: MSS, Hainan State Security Department, Haikou, via front company Hainan Xiandun Technology Development Co.
- **Active since**: at least 2009.
- **Status**: indicted (July 2021, Southern District of California); four defendants including three HSSD officers (Ding Xiaoyang, Cheng Qingmin, Zhu Yunmin).
- **Primary mission**: maritime / BRI espionage; biomedical and robotics IP; government intelligence.
- **Sectors targeted**: maritime industries, naval research, biomedical, robotics, universities (esp. those with naval/maritime research programs), Belt and Road–relevant infrastructure across SE Asia / Middle East.
- **Notable TTPs**: spear-phishing, public-facing app exploitation (Confluence, Log4j, Fortinet), credential stuffing, BADFLICK / MURKYTOP / PHOTO.
- **Public attribution**: CISA AA21-200a (July 2021); DOJ indictment July 2021; multi-government joint advisory July 2024 from Five Eyes + JP + DE + KR + IN attributing TTPs explicitly to PRC MSS.
- **Doctrine alignment**: Belt and Road (explicitly named in CISA advisory); MIC2025 maritime sector; MCF; PLA naval modernization for South China Sea.

### APT41 (aliases: Wicked Panda, Barium, Winnti, Wicked Spider, Brass Typhoon, Double Dragon, Bronze Atlas, BRONZE EXPORT, Group 72, Earth Baku — at times overlaps with TG-2633)

- **Parent service**: MSS-affiliated contractors — Chengdu 404 Network Technology Co. (LEAD) and individuals (BARIUM cluster). Conducts both state-tasked espionage and personal-financial cybercrime — hence "Double Dragon."
- **Active since**: at least 2012.
- **Status**: indicted (August 2019 and August 2020, D.C.); seven defendants including Zhang Haoran, Tan Dailin, Jiang Lizhi, Qian Chuan, Fu Qiang. Group remains highly active under new tooling (DUSTPAN/DUSTTRAP, 2023–24).
- **Primary mission**: dual-mode — strategic IP theft for state plus financially motivated cryptocurrency theft and game-virtual-currency fraud.
- **Sectors targeted**: video gaming, semiconductors, telecom, healthcare, pharma, high-tech, software (supply-chain attacks on NetSarang, CCleaner, ASUS Live Update), state governments (USAHerds 2021–22), Taiwanese research, global shipping & logistics.
- **Notable TTPs**: most diverse Chinese APT — supply-chain compromise, code-signing-cert theft, ShadowPad, PlugX, Winnti, DUSTPAN dropper, exploit of N-day enterprise CVEs (Citrix, Confluence, Log4j, USAHerds).
- **Public attribution**: DOJ indictments Aug 2019 / Aug 2020; FBI Wanted poster.
- **Doctrine alignment**: MIC2025 (semiconductors, biotech, software); MCF; Taiwan reunification (Taiwan research targeting 2023); 15th FYP industrial-system priorities.

### APT15 (aliases: Ke3chang, Vixen Panda, Nickel, Nylon Typhoon, Mirage, Playful Dragon, Royal APT, BRONZE PALACE, BRONZE DAVENPORT)

- **Parent service**: assessed MSS-linked.
- **Active since**: at least 2010 (some activity traceable to 2004).
- **Status**: active.
- **Primary mission**: diplomatic and government espionage, increasingly targeting Latin America and Africa (BRI-relevant geographies).
- **Sectors targeted**: ministries of foreign affairs (UK FCO targeted in original Ke3chang campaign), oil & gas, diplomatic missions, NGOs, energy. Recent activity vs. Iranian government entities.
- **Notable TTPs**: Mirage / RoyalCli / RoyalDNS / Okrum / Ketrum backdoors; Graphican (post-2022).
- **Public attribution**: Microsoft civil lawsuit (Dec 2021) under "Nickel" naming, leading to court-authorized seizure of 42 domains; ESET, NCC Group, Mandiant reporting.
- **Doctrine alignment**: BRI / DSR (LatAm + Africa diplomatic collection); MIC2025 energy sector.

### APT17 (aliases: Aurora Panda, DeputyDog, Elderwood, Sneaky Panda, Tailgater Team, BRONZE KEYSTONE, Hidden Lynx)

- **Parent service**: assessed MSS-linked; Intrusion Truth (2019) named individuals tied to MSS Jinan State Security Bureau.
- **Active since**: ~2009 ("Operation Aurora" 2009–2010).
- **Status**: active under successor naming.
- **Primary mission**: tech-sector and political espionage.
- **Sectors targeted**: technology (Google in Aurora), defense contractors, law firms, mining, NGOs, foreign governments.
- **Notable TTPs**: 0-day exploitation (CVE-2010-0249 in IE), Hydraq/Aurora trojan, BLACKCOFFEE backdoor.
- **Public attribution**: Symantec "Elderwood" report (2012); Mandiant; Intrusion Truth.
- **Doctrine alignment**: MIC2025 IT sector; political-intelligence collection.

### APT19 (aliases: Codoso, C0d0so, Sunshop Group, BRONZE FIRESTONE, Deep Panda — partial overlap)

- **Parent service**: assessed China-based, MSS-linked.
- **Active since**: ~2013.
- **Status**: dormant / re-clustered.
- **Primary mission**: economic and government intelligence.
- **Sectors targeted**: legal, investment, banking (notable Forbes.com strategic web compromise), defense, energy.
- **Notable TTPs**: strategic web compromises (Forbes "Thought of the Day"), JS dropper chains.
- **Public attribution**: iSIGHT, FireEye / Mandiant.
- **Doctrine alignment**: financial intelligence; MIC2025 banking & energy.

### APT22 (aliases: BRONZE OLIVE, Suckfly, Group 46)

- **Parent service**: assessed China-based; MSS-linked.
- **Active since**: ~2014.
- **Status**: low activity.
- **Primary mission**: dissident, NGO, and Tibetan/Uyghur diaspora targeting; some economic espionage.
- **Sectors targeted**: pro-democracy activists, Tibetan organizations, biomedical, electronics.
- **Notable TTPs**: stolen code-signing certificates; PISCES, SOGU, BISCUIT backdoors.
- **Public attribution**: Mandiant; Symantec ("Suckfly").
- **Doctrine alignment**: National Intelligence Law (dissident suppression); some MIC2025 alignment.

### APT26 (aliases: Hippo Team, JerseyMikes, Turbine Panda, BRONZE EXPRESS)

- **Parent service**: assessed PLA-affiliated (per CrowdStrike's "Turbine Panda" reporting on PLA Jiangsu Bureau / MSS JSSD overlap).
- **Active since**: ~2010.
- **Status**: dormant / merged.
- **Primary mission**: aerospace / aviation engine technology theft.
- **Sectors targeted**: aerospace primes and engine makers (CFM/GE/Safran turbofan campaigns documented by CrowdStrike).
- **Notable TTPs**: Sakula, supply-chain compromise of HR portals at engine subcontractors.
- **Public attribution**: CrowdStrike "Huge Fan of Your Work" report (2019); DOJ Yanjun Xu MSS officer conviction (2021) for GE aviation theft — separate but related JSSD operation.
- **Doctrine alignment**: MIC2025 aerospace (COMAC C919 engine indigenization).

### APT27 (aliases: Emissary Panda, Iron Tiger, LuckyMouse, Bronze Union, TG-3390, Earth Smilodon, Linen Typhoon, Iron Taurus, Budworm)

- **Parent service**: assessed China-based; analysts split on PLA vs. MSS attribution. December 2024 OFAC sanctions on Yin Kecheng (Shanghai-based) and the BeyondTrust / Treasury intrusion were attributed to Silk Typhoon / APT27 cluster.
- **Active since**: at least 2010.
- **Status**: active.
- **Primary mission**: defense, aerospace, government, telecom espionage.
- **Sectors targeted**: defense contractors, aerospace, energy, manufacturing, embassies, telecom, gambling industry; pivot to ransomware (Polar / HelloKitty) for either smokescreen or moonlighting.
- **Notable TTPs**: HyperBro, SysUpdate, PlugX, strategic web compromises; reused tools (HUI Loader).
- **Public attribution**: SecureWorks "Threat Group-3390" reporting; OFAC sanctions Jan 17 2025 on Yin Kecheng for Treasury breach.
- **Doctrine alignment**: MIC2025; Taiwan-relevant defense industrial collection; Treasury hack → OFAC counterintelligence (PRC understanding what sanctions are pending).

### APT30 (aliases: Naikon, Override Panda)

- **Parent service**: assessed PLA Chengdu Military Region Second Technical Reconnaissance Bureau (Unit 78020) (per ThreatConnect 2015 attribution to Ge Xing).
- **Active since**: ~2005.
- **Status**: active.
- **Primary mission**: regional political-military intelligence — ASEAN governments, Indian, Australian, Vietnamese targets.
- **Sectors targeted**: South and Southeast Asia governments, militaries, ASEAN secretariat, journalists.
- **Notable TTPs**: BACKSPACE, NETEAGLE, FLASHFLOOD, RHttpCtrl, Aria-body loader.
- **Public attribution**: FireEye APT30 report (2015); ThreatConnect 2015 attribution to PLA Unit 78020.
- **Doctrine alignment**: BRI political-intelligence collection; South China Sea–adjacent state coverage.

### Mustang Panda (aliases: TA416, RedDelta, BRONZE PRESIDENT, Earth Preta, Stately Taurus, Twill Typhoon, Camaro Dragon, Luminous Moth, UNC6384, HoneyMyte)

- **Parent service**: assessed MSS-affiliated.
- **Active since**: at least 2012.
- **Status**: highly active (resurged mid-2025 against EU/NATO diplomatic missions).
- **Primary mission**: regional political-intelligence on Tibetan and Mongolian diaspora, ASEAN governments, EU institutions, NGOs.
- **Sectors targeted**: ministries of foreign affairs (Mongolia, Myanmar, Pakistan, Vietnam, the Philippines, Thailand), the Vatican, NGOs, EU institutions, Taiwan, refugee/diaspora organizations.
- **Notable TTPs**: PlugX (PUBLOAD), Korplug, TONESHELL, MQsTTang, SnakeDisk USB worm; LNK / sideloading.
- **Public attribution**: vendor consensus (Proofpoint, Trend Micro, ESET, Recorded Future, Microsoft). Less government attribution than telecom/critical-infrastructure groups.
- **Doctrine alignment**: BRI political collection; Taiwan / Hong Kong dissident tracking; ASEAN diplomatic targeting.

### Hafnium (aliases: Silk Typhoon, ZIRCONIUM — partial overlap; not the same as APT31 despite overlapping "Zirconium" tagging)

- **Parent service**: MSS, per White House attribution July 2021. December 2024 Treasury hack ascribed to "Silk Typhoon."
- **Active since**: at least 2020.
- **Status**: active (re-emerged as "Silk Typhoon" in Treasury BeyondTrust intrusion December 2024).
- **Primary mission**: bulk email collection at scale; targeted intelligence on U.S. and allied policymaking.
- **Sectors targeted**: infectious-disease researchers, law firms, universities, defense contractors, policy think tanks, NGOs, U.S. Treasury (Dec 2024) — particularly OFAC and Office of the Secretary.
- **Notable TTPs**: 0-day chain against on-prem Exchange (ProxyLogon — CVE-2021-26855/26857/26858/27065); web-shell deployment; PRC-aligned cloud-provider abuse (BeyondTrust API keys in 2024).
- **Public attribution**: White House statement 19 July 2021 attributing with high confidence to MSS-affiliated actors; ODNI/NCSC bulletin. OFAC sanctions on Yin Kecheng Jan 17 2025 for Treasury compromise.
- **Doctrine alignment**: MCF / Intelligence Law (broad collection); Taiwan / sanctions-counterintelligence (Treasury OFAC targeting).

### Storm-0558

- **Parent service**: MSS-linked (Microsoft attribution — "China-based threat actor with espionage objectives").
- **Active since**: at least 2021.
- **Status**: active.
- **Primary mission**: targeted email collection against U.S. government and policy-relevant individuals.
- **Sectors targeted**: U.S. State Department (Secretary's office, EAP bureau), Department of Commerce, U.S. Congress staff, ~25 organizations including European foreign ministries.
- **Notable TTPs**: stolen Microsoft consumer MSA signing key (acquired via a 2021 crash dump that improperly contained it), token forgery to access Exchange Online OWA.
- **Public attribution**: Microsoft MSRC / MSTIC blog July 2023; CISA / DHS Cyber Safety Review Board report April 2024.
- **Doctrine alignment**: Intelligence Law / MCF — strategic collection on U.S. China-policy decision-makers; aligned with Taiwan / trade-policy windows.

---

## Pre-positioning / OT-oriented "Typhoon" cluster

### Volt Typhoon (aliases: Vanguard Panda, BRONZE SILHOUETTE, Insidious Taurus, DEV-0391, UNC3236)

- **Parent service**: PRC state-sponsored; CISA/NSA/FBI joint assessment as PRC actor with pre-positioning mission for disruptive use. Strong indications of PLA tasking (consistent with intelligentized-warfare / system-destruction doctrine). January 2025 OFAC action against Integrity Tech is associated with Flax Typhoon, not Volt — Volt has not been individually sanctioned as of the available record.
- **Active since**: mid-2021 (Microsoft); some operations as early as 2020.
- **Status**: active; targets re-discovered as recently as 2024 (Massachusetts LELWD utility — 300+ day dwell).
- **Primary mission**: **pre-positioning** in U.S. critical infrastructure IT networks "to enable lateral movement to OT assets to disrupt functions … in the event of a major crisis or conflict with the United States" (CISA AA24-038a).
- **Sectors targeted**: communications, energy (electric utilities), water & wastewater, transportation, government, IT, manufacturing — emphasis on Guam, Pacific Northwest, sites with U.S. INDOPACOM logistical relevance.
- **Notable TTPs**: living-off-the-land (LOLBins, no malware where possible); compromised SOHO router botnet (KV-botnet) for proxy infrastructure — disrupted by DOJ/FBI court-authorized operation January 2024; FortiGuard / Ivanti / Cisco edge-device exploitation; valid-account abuse; ESXi targeting.
- **Public attribution**:
  - Microsoft MSTIC, 24 May 2023. <https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/>
  - CISA AA23-144a, 24 May 2023. <https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-144a>
  - CISA AA24-038a, 7 February 2024 (with NSA, FBI, NSA, MS-ISAC and Five Eyes). <https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a>
  - DOJ KV-botnet takedown announcement, 31 January 2024.
- **Doctrine alignment**: intelligentized / system-destruction warfare; Taiwan contingency (Davidson Window).

### Salt Typhoon (aliases: GhostEmperor, FamousSparrow, UNC2286, UNC5807, Operator Panda, RedMike, Earth Estries — overlap with this cluster)

- **Parent service**: MSS — explicitly attributed by U.S. Treasury (Jan 17 2025 designation of Sichuan Juxinhe Network Technology Co. as MSS-supporting) and joint CISA AA25-239a (Aug 2025) naming MSS-supporting companies including Sichuan Juxinhe, Beijing Huanyu Tianqiong, Sichuan Zhixin Ruijie.
- **Active since**: at least 2019; major operational visibility 2023–2025.
- **Status**: active and ongoing. FBI (Aug 2025) reported 200+ companies in 80 countries compromised.
- **Primary mission**: strategic SIGINT collection — telecom carrier compromise to enable bulk metadata, content interception, and access to lawful-intercept (CALEA) systems.
- **Sectors targeted**: U.S. telecom carriers (AT&T, Verizon, T-Mobile, Lumen, Spectrum / Charter, Consolidated, Windstream); global telecom, government, transportation, lodging, military networks; CALEA lawful-intercept gateways.
- **Notable TTPs**: PoC-grade exploitation of known N-day vulns in edge routers and security appliances (Cisco IOS XE, Fortinet, Ivanti, Palo Alto, Sophos); router-firmware modification; Demodex Windows kernel-mode rootkit; long-dwell living-off-the-land.
- **Public attribution**:
  - OFAC press release sb0042 / jy2792, Jan 17 2025. <https://home.treasury.gov/news/press-releases/jy2792>
  - CISA AA25-239a, 27 August 2025. <https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a>
  - FBI public statement Aug 27 2025.
- **Doctrine alignment**: intelligentized warfare (C4ISR node compromise); MCF; Taiwan / U.S.-decision-maker collection; National Intelligence Law (PRC contractors supplying MSS).

### Flax Typhoon (aliases: Ethereal Panda, RedJuliett)

- **Parent service**: MSS-supporting contractor — Integrity Technology Group Inc. (Beijing) sanctioned by OFAC Jan 3 2025 as the operating entity. FBI Director Wray (September 2024) publicly identified the company at the Aspen Cyber Summit.
- **Active since**: at least 2021.
- **Status**: botnet disrupted by FBI court-authorized operation September 2024 (260,000+ IoT/SOHO device botnet); group remains active.
- **Primary mission**: critical infrastructure pre-positioning / botnet-based proxy network; targeted Taiwan and Western critical infrastructure.
- **Sectors targeted**: Taiwan critical infrastructure, U.S. government, U.S. critical infrastructure, academia, media, IoT botnet building (cameras, NVRs, routers).
- **Notable TTPs**: Mirai-variant IoT botnet ("Raptor Train"); China Chopper webshell; SoftEther VPN; LOLBins.
- **Public attribution**: FBI / DOJ September 2024; OFAC sanctions on Integrity Tech, Jan 3 2025. <https://home.treasury.gov/news/press-releases/jy2769>
- **Doctrine alignment**: intelligentized warfare; Taiwan contingency; National Intelligence Law (PRC vendor compelled to support MSS).

### Linen Typhoon

- Microsoft naming overlap with APT27 cluster — see APT27 above.

### Violet Typhoon

- Microsoft naming for APT31 — see APT31 above.

### Nylon Typhoon

- Microsoft naming for APT15 / Ke3chang — see APT15 above.

### Brass Typhoon

- Microsoft naming for APT41 — see APT41 above.

### Charcoal Typhoon (DEV-0153)

- China-based actor flagged in OpenAI / Microsoft February 2024 joint report on adversarial misuse of LLMs (sandboxed account use for technical research). Limited independent attribution.

### Storm-2603

- Microsoft "Storm-####" designator for a developing PRC cluster observed exploiting July 2025 SharePoint "ToolShell" CVE chain alongside Linen Typhoon and Violet Typhoon.

---

## Contractor ecosystem (the i-Soon revelation)

The February 2024 leak of internal documents from Anxun Information Technology Co. Ltd. (安洵 / "i-Soon") provided the first systematic public view of the PRC's hacker-for-hire ecosystem and how MSS, MPS, and PLA outsource collection to private contractors. Leaked clients included ministries of public and state security and PLA units; victims included foreign governments, telecom, universities, NATO entities, and pro-democracy groups in Hong Kong. SentinelLabs and Unit 42 linked i-Soon tools and infrastructure to prior campaigns attributed to APT41 / POISON CARP / Jackpot Panda. The i-Soon leak corroborates the actor-attribution model where named APTs map back to specific MSS provincial bureaus operating via private front companies (Boyusec → APT3, Huaying Haitai → APT10, Wuhan XRZ → APT31, Hainan Xiandun → APT40, Sichuan Juxinhe → Salt Typhoon, Integrity Tech → Flax Typhoon, Chengdu 404 → APT41).

- **Citations**:
  - SentinelLabs, "Unmasking I-Soon." <https://www.sentinelone.com/labs/unmasking-i-soon-the-leak-that-revealed-chinas-cyber-operations/>
  - Unit 42, "Data From Chinese Security Services Company i-Soon Linked to Previous Chinese APT Campaigns." <https://unit42.paloaltonetworks.com/i-soon-data-leaks/>
  - CyberScoop, "Leaked documents show how firm supports Chinese hacking operations." <https://cyberscoop.com/isoon-chinese-apt-contractor-leak/>

---

## MPS-linked (Ministry of Public Security)

The MPS runs primarily domestic security and dissident-tracking operations but contracts the same vendor ecosystem (i-Soon, Boyusec, etc.). Operations attributed to MPS rather than MSS are rarely cleanly distinguished in Western reporting; the Hong Kong democracy targeting in the i-Soon leak appears to mix MPS and MSS tasking. Specific Western indictments of MPS officers are rare relative to MSS / PLA.
