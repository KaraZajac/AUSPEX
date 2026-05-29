# Iran — Notable Cyber Events (2010–2026)

Events are organised chronologically. Where Predatory Sparrow (Israeli-aligned) is implicated, the entry notes the non-Iranian attribution explicitly but is included for context only.

### 2010-06 Stuxnet (precipitating context, NOT Iranian)

- **Attributed actor**: US-Israeli operation ("Olympic Games"); attribution confidence: high; attributing source: NYT/Sanger, "Confront and Conceal" reporting; never formally acknowledged.
- **Target**: Natanz uranium-enrichment centrifuges (Iran).
- **Vector / TTP**: USB-borne multi-zero-day worm targeting Siemens S7 PLCs and Step7 engineering software.
- **Outcome**: physical destruction of approximately 1,000 IR-1 centrifuges; significant setback to Iran's enrichment programme.
- **Doctrine linkage**: catalysed Iran's investment in offensive cyber capacity; Khamenei and IRGC commanders repeatedly cite Stuxnet as the case for asymmetric cyber buildup.
- **Linkage confidence**: attested (as the precipitating event for Iran's program, not as an Iranian operation).
- **Citations**: NYT David Sanger 2012; Symantec Stuxnet dossier.

### 2012-08 Shamoon — Saudi Aramco

- **Attributed actor**: assessed Iran / APT33 (attribution confidence: high; sources: Mandiant/FireEye, McAfee, Symantec); claimed by "Cutting Sword of Justice" persona.
- **Target**: Saudi Aramco (~30,000 workstations destroyed); two weeks later RasGas (Qatar).
- **Vector / TTP**: insider-credential or phishing access; Shamoon disk-wiper overwrote MBR with image of burning US flag.
- **Outcome**: ~30,000 endpoints destroyed; significant operational disruption; recovery costs in the tens of millions USD.
- **Doctrine linkage**: Asymmetric Warfare retaliation for sanctions and Stuxnet; Forward Defense against Gulf oil rival.
- **Linkage confidence**: strongly inferred (vendor consensus; no US indictment specifically for Shamoon 1).
- **Citations**: McAfee/Mandiant Shamoon reports; CCDCOE cyberlaw toolkit entry.

### 2012-09 to 2013-05 Operation Ababil — US bank DDoS

- **Attributed actor**: IRGC; persona "Izz ad-Din al-Qassam Cyber Fighters" (attribution: high; DOJ indictment Mar 2016 named seven Iranians employed by ITSecTeam and Mersad Co.).
- **Target**: 46+ US financial institutions including Bank of America, JPMorgan Chase, Wells Fargo, Capital One, PNC, BB&T.
- **Vector / TTP**: itsoknoproblembro / Brobot DDoS botnet exploiting compromised webservers; sustained 65 Gbps peaks.
- **Outcome**: extensive online-banking disruption over months; tens of millions in mitigation cost.
- **Doctrine linkage**: Asymmetric Warfare retaliation for sanctions on Iranian banking; Forward Defense against US financial sector.
- **Linkage confidence**: attested (DOJ indictment specifies retaliation context).
- **Citations**: DOJ indictment unsealed Mar 24, 2016; Recorded Future Insikt deconstruction.

### 2013-08 Bowman Avenue Dam, Rye Brook NY

- **Attributed actor**: IRGC (Hamid Firoozi); attribution confidence: high; DOJ Mar 2016 indictment.
- **Target**: small flood-control dam SCADA in Rye Brook, NY.
- **Vector / TTP**: SCADA-facing system enumeration; reconnaissance of sluice-gate controls.
- **Outcome**: no operational impact (sluice gate offline for maintenance); demonstrated US OT vulnerability and IRGC intent.
- **Doctrine linkage**: Asymmetric Warfare; Forward Defense; demonstrative reconnaissance of US critical infrastructure.
- **Linkage confidence**: attested.
- **Citations**: DOJ press release Mar 24, 2016.

### 2014-02 Las Vegas Sands Corp destructive attack

- **Attributed actor**: Iran (attribution: high; named publicly by DNI James Clapper in Feb 2015 Senate Armed Services testimony).
- **Target**: Las Vegas Sands Corp (Sheldon Adelson).
- **Vector / TTP**: VPN credential brute-force; disk-wiping malware.
- **Outcome**: ~75% of Las Vegas servers destroyed; $40M+ recovery cost.
- **Doctrine linkage**: Constitutional regime-defense (Adelson's "detonate a nuke in Iranian desert" remark provoked Khamenei response); Cyber-as-deniable-retaliation.
- **Linkage confidence**: attested (Clapper testimony cites motive).
- **Citations**: Bloomberg Dec 2014; CNN Money Feb 2015; DNI Senate testimony.

### 2014–2015 Saudi Arabia / regional persistent intrusions — APT33

- **Attributed actor**: APT33 (attribution: medium-high; FireEye/Mandiant).
- **Target**: Saudi and South Korean aerospace and petrochemical firms.
- **Vector / TTP**: aerospace-themed spearphish; DROPSHOT/SHAPESHIFT droppers.
- **Outcome**: persistent espionage access.
- **Doctrine linkage**: Forward Defense; Sanctions-Evasion (aerospace IP for import substitution).
- **Linkage confidence**: strongly inferred.
- **Citations**: FireEye 2017 APT33 report.

### 2016-11 Shamoon 2 wave

- **Attributed actor**: APT33-linked (attribution: high; multiple vendors).
- **Target**: Saudi government ministries and private-sector targets.
- **Vector / TTP**: Shamoon disk-wiper variant; image of drowned Syrian child Aylan Kurdi.
- **Outcome**: tens of thousands of endpoints wiped across Saudi targets.
- **Doctrine linkage**: Forward Defense (anti-Saudi); Cyber-as-deniable-retaliation.
- **Linkage confidence**: strongly inferred.
- **Citations**: Palo Alto Unit 42; Symantec.

### 2017-05 to 2017-08 HBO extortion

- **Attributed actor**: Behzad Mesri, prior IRGC contractor (attribution: high; SDNY indictment Nov 21, 2017).
- **Target**: HBO (1.5 TB of pre-release content).
- **Vector / TTP**: reconnaissance and credential theft; extortion demand $6M in Bitcoin.
- **Outcome**: Game of Thrones scripts and episodes leaked; HBO refused payment.
- **Doctrine linkage**: Cyber-as-deniable-retaliation; revenue-generation pre-Pay2Key model.
- **Linkage confidence**: plausible (Mesri's IRGC background is documented, but HBO operation framed as freelance; analyst caveat).
- **Citations**: SDNY DOJ press release Nov 21, 2017.

### 2018-11 SamSam ransomware (Atlanta and others)

- **Attributed actor**: Faramarz Shahi Savandi and Mohammad Mehdi Shah Mansouri (attribution: high; DOJ Nov 28, 2018 indictment).
- **Target**: 200+ US/Canadian victims including City of Atlanta, City of Newark, Port of San Diego, Hollywood Presbyterian Medical Center, Colorado DOT.
- **Vector / TTP**: RDP brute-force; SamSam ransomware; manual deployment.
- **Outcome**: ~$30M extorted plus >$30M in remediation costs to victims.
- **Doctrine linkage**: Sanctions-Evasion (Iran-based revenue); cybercrime tolerated by state.
- **Linkage confidence**: attested as Iran-based; state-direction not asserted.
- **Citations**: DOJ Nov 28 2018 indictment; OFAC SDN designation same date.

### 2018-12 APT35 phishing of US Treasury, nuclear scientists, sanctions critics

- **Attributed actor**: APT35 / Charming Kitten (attribution: high; CertFA, ClearSky).
- **Target**: US Treasury officials, US/Israeli nuclear scientists, Iranian civil society, JCPOA critics.
- **Vector / TTP**: account-takeover spearphish; 2FA-bypass via reverse-proxy phishing kits.
- **Outcome**: credential and email theft.
- **Doctrine linkage**: Constitutional regime-defense (intelligence on JCPOA pressure architecture).
- **Linkage confidence**: strongly inferred.
- **Citations**: CertFA Dec 2018 report; ClearSky.

### 2019-04 Lab Dookhtegan leaks APT34 toolkit

- **Attributed actor**: anonymous insider/dissident (not Iranian state).
- **Target**: APT34/OilRig and by extension MOIS personnel.
- **Vector / TTP**: Telegram dump of source code (Glimpse, PoisonFrog, HyperShell, HighShell, Fox Panel, Webmask), victim lists, and PII of MOIS officers.
- **Outcome**: forced TTPs change; intelligence windfall for defenders.
- **Doctrine linkage**: counter-regime; relevant to Iran cyber by exposing MOIS-APT34 link.
- **Linkage confidence**: attested as a leak event, not as an Iranian operation.
- **Citations**: ZDNet/Catalin Cimpanu coverage; Dark Reading.

### 2019-06 Wiper attack on US Department of Homeland Security

- **Attributed actor**: Iran-linked (DHS CISA acknowledged Iranian-linked wiper campaigns during US-Iran tensions following downing of US drone).
- **Target**: US government and industry.
- **Vector / TTP**: ZeroCleare/Dustman wiper variants.
- **Outcome**: limited public outcome; advisory release.
- **Doctrine linkage**: Asymmetric Warfare retaliation.
- **Linkage confidence**: plausible.
- **Citations**: CISA Director Krebs June 2019 statements; IBM X-Force ZeroCleare report.

### 2019-12 Bapco Dustman wiper attack

- **Attributed actor**: APT34 / OilRig (attribution: medium; IBM X-Force, Saudi NCA).
- **Target**: Bahrain's national oil company Bapco.
- **Vector / TTP**: Dustman wiper.
- **Outcome**: partial disruption.
- **Doctrine linkage**: Forward Defense (Gulf rival).
- **Linkage confidence**: strongly inferred.
- **Citations**: Saudi NCA Jan 2020; IBM X-Force.

### 2020-04 Israel Water Authority OT poisoning attempt

- **Attributed actor**: Iran (attribution: medium-high; Western intelligence cited to Washington Post, Times of Israel; not formally indicted).
- **Target**: six Israeli Water Authority facilities including agricultural pumps; attempt to raise chlorine levels.
- **Vector / TTP**: OT/SCADA access via internet-exposed PLCs; manipulation of chlorination set-points.
- **Outcome**: detected and remediated; no civilian harm; one pump reportedly entered continuous operation; Israel responded with the May 9, 2020 Shahid Rajaee port cyberattack.
- **Doctrine linkage**: Forward Defense / Axis of Resistance anti-Israel coercion; Asymmetric Warfare.
- **Linkage confidence**: strongly inferred (Western intel attribution; not OFAC/DOJ attested).
- **Citations**: Washington Post (Warrick) May 8 2020; Times of Israel/Haaretz reporting.

### 2020-08 First Pay2Key wave against Israeli companies

- **Attributed actor**: Fox Kitten / Pioneer Kitten (attribution: high; ClearSky, Check Point).
- **Target**: Israeli logistics, insurance, retail.
- **Vector / TTP**: VPN/edge-device exploitation; Pay2Key ransomware with leak-site amplification.
- **Outcome**: data leaks; minimal ransoms paid.
- **Doctrine linkage**: Cyber-as-deniable-retaliation; Forward Defense.
- **Linkage confidence**: strongly inferred.
- **Citations**: ClearSky 2020 "Fox Kitten" report; Check Point Pay2Key analysis.

### 2020-09 Treasury / DOJ coordinated Iran cyber action: APT39 / Rana sanctioned; Iranian nationals indicted

- **Attributed actor**: APT39 (Rana Intelligence Computing front) — MOIS.
- **Target**: 30+ countries, dissidents, travel sector.
- **Vector / TTP**: see APT39.
- **Outcome**: OFAC designation of 45 individuals plus Rana entity; DOJ unsealed multiple indictments same week including Heidarian/Farhadi.
- **Doctrine linkage**: Constitutional regime-preservation; Forward Defense.
- **Linkage confidence**: attested (Treasury press release names MOIS).
- **Citations**: Treasury sm1127 Sept 17 2020; DOJ Sept 14-17 2020 coordinated actions.

### 2020-10 Emennet Pasargad "Proud Boys" voter intimidation and voter data theft

- **Attributed actor**: Emennet Pasargad / IRGC contractor (attribution: attested; CISA AA20-304A, AA20-296B; DOJ Nov 18 2021 indictment of Kazemi and Kashian; Treasury jy0494 Nov 2021).
- **Target**: tens of thousands of US registered voters; state election websites.
- **Vector / TTP**: cURL-based scraping of misconfigured state portals; spoofed "Proud Boys" intimidation emails; disinformation video implying fraudulent ballot casting.
- **Outcome**: voter-registration data obtained from at least one state; ~25,000 intimidation emails (~90% spam-filtered).
- **Doctrine linkage**: Cyber-as-deniable-retaliation; Post-Soleimani retaliation.
- **Linkage confidence**: attested.
- **Citations**: CISA AA20-304A; DOJ Nov 18 2021; Treasury jy0494.

### 2020-12 Shirbit insurance leak (Israel)

- **Attributed actor**: Black Shadow (Iran-aligned).
- **Target**: Shirbit Insurance (Israel).
- **Vector / TTP**: intrusion; bitcoin ransom; serial leak of customer PII.
- **Outcome**: extensive PII leak; Shirbit declined to pay.
- **Doctrine linkage**: Cyber-as-deniable-retaliation against Israel.
- **Linkage confidence**: strongly inferred.
- **Citations**: Times of Israel; INCD statements.

### 2021-06 Boston Children's Hospital intrusion attempt (thwarted)

- **Attributed actor**: Iran government-sponsored (attribution: high; FBI Director Wray, June 1, 2022 public statement).
- **Target**: Boston Children's Hospital.
- **Vector / TTP**: Fortinet vulnerability exploitation.
- **Outcome**: blocked before impact thanks to allied-intel tip.
- **Doctrine linkage**: Asymmetric Warfare (civilian-coercion targeting); Cyber-as-deniable-retaliation.
- **Linkage confidence**: attested (FBI public attribution).
- **Citations**: CNN, CBS News, Healthcare IT News June 1 2022.

### 2021-10 CyberServe / Atraf leak

- **Attributed actor**: Black Shadow.
- **Target**: Israeli hosting provider CyberServe; collateral leak of Atraf LGBTQ dating-site users.
- **Vector / TTP**: hosting intrusion; doxing leak.
- **Outcome**: thousands outed in Atraf leak; broader Israeli SME data leaked.
- **Doctrine linkage**: Cyber-as-deniable-retaliation; Forward Defense.
- **Linkage confidence**: strongly inferred.
- **Citations**: Times of Israel; The Record.

### 2021-11 Moses Staff emergence and Israeli targeting

- **Attributed actor**: Moses Staff (Iran-aligned).
- **Target**: Israeli engineering and manufacturing firms.
- **Vector / TTP**: PyDCrypt encryption with no decryption offered; data leak.
- **Outcome**: data leaked; no ransom recovery.
- **Doctrine linkage**: Cyber-as-deniable-retaliation; Forward Defense.
- **Linkage confidence**: strongly inferred.
- **Citations**: Check Point, Cybereason.

### 2022-02 CISA AA22-055A — MuddyWater formally attributed to MOIS

- **Attributed actor**: MuddyWater / MOIS.
- **Target**: telecom, defense, local government, oil & gas in Asia, Africa, Europe, North America.
- **Vector / TTP**: PowerShell tooling, public-vuln exploitation.
- **Outcome**: persistent espionage access across multiple sectors.
- **Doctrine linkage**: Forward Defense; Constitutional regime-defense.
- **Linkage confidence**: attested.
- **Citations**: CISA/FBI/NSA/CNMF/NCSC-UK joint advisory AA22-055A.

### 2022-06 Predatory Sparrow — Khuzestan Steel destructive attack (NOT IRANIAN)

- **Attributed actor**: Israel-linked Predatory Sparrow.
- **Target**: Iran's Khuzestan Steel Mojahedin Steel Company.
- **Outcome**: molten-steel spill and fire; significant plant damage.
- **Note**: included only because Iranian state media framed it as a cyber-attack on Iran. Not Iranian.
- **Citations**: NYT June 2022; CCDCOE toolkit.

### 2022-07 / 2022-09 Albania destructive attack — HomeLand Justice

- **Attributed actor**: MOIS / HomeLand Justice persona (attribution: attested; OFAC jy0941 Sept 9 2022; CISA AA22-264A).
- **Target**: Government of Albania (Total Information Management System, state police, immigration, civil registry).
- **Vector / TTP**: 14-month dwell; ROADSWEEP wiper plus ransomware-style file encryptor; data leak via HomeLand Justice site and Telegram.
- **Outcome**: forced shutdown of e-government services; Albania severed diplomatic ties with Iran Sept 7, 2022 (first state to do so over a cyber attack); follow-on retaliatory wave Sept 9, 2022.
- **Doctrine linkage**: Cyber-as-deniable-retaliation (attested — MEK presence in Albania cited explicitly in OFAC release); Constitutional regime-defense.
- **Linkage confidence**: attested.
- **Citations**: Treasury jy0941; CISA AA22-264A; Albanian PM Rama statement Sept 7 2022.

### 2022-09 Treasury / DOJ coordinated action — IRGC-affiliated ransomware contractors

- **Attributed actor**: Najee Technology / Afkar System cluster; Mansour Ahmadi, Ahmad Khatibi Aghda, Amir Hossein Nikaeen Ravari indicted (attribution: attested; Treasury jy0948 Sept 14 2022; CISA AA22-257A).
- **Target**: US/UK/Israel/Australia/Iran-adversary critical infrastructure including Boston Children's, Vermont healthcare, US domestic-violence shelter, US accounting firms.
- **Vector / TTP**: Fortinet/Microsoft Exchange/VMware Horizon Log4j exploitation; BitLocker abuse; double extortion.
- **Outcome**: hundreds of victims; tens of millions extorted.
- **Doctrine linkage**: Sanctions-Evasion (revenue); Asymmetric Warfare.
- **Linkage confidence**: attested.
- **Citations**: Treasury jy0948; DOJ indictment Sept 14 2022; CISA AA22-257A.

### 2022-10 Black Reward — Atomic Energy Organisation of Iran leak (counter-regime; for context only)

- **Attributed actor**: Black Reward (Iranian anti-regime hacktivist).
- **Target**: Iran's Atomic Energy Organisation (AEOI).
- **Outcome**: 50 GB leak; ultimatum tied to Mahsa Amini protests.
- **Note**: counter-regime — not part of Iran's cyber program.
- **Citations**: SOCRadar.

### 2023-02 DarkBit ransomware on Technion (Israel)

- **Attributed actor**: MuddyWater / MERCURY (attribution: high; Israeli National Cyber Directorate).
- **Target**: Technion — Israel Institute of Technology.
- **Vector / TTP**: DarkBit Golang ransomware for Windows and ESXi.
- **Outcome**: significant disruption; ransom not paid.
- **Doctrine linkage**: Cyber-as-deniable-retaliation; Forward Defense.
- **Linkage confidence**: attested.
- **Citations**: INCD Feb 2023; Microsoft / Picus reports on DEV-1084.

### 2023-04 Mint Sandstorm targets US critical infrastructure

- **Attributed actor**: Mint Sandstorm / APT35 (attribution: high; Microsoft Apr 18 2023).
- **Target**: US seaports, energy, transit; defense industrial base.
- **Vector / TTP**: edge-device exploitation; quick weaponisation of newly disclosed CVEs.
- **Outcome**: persistent access; intelligence collection.
- **Doctrine linkage**: Forward Defense; Asymmetric Warfare (pre-positioning).
- **Linkage confidence**: strongly inferred.
- **Citations**: Microsoft Security Blog Apr 18 2023.

### 2023-11-25 Aliquippa PA Municipal Water Authority — CyberAv3ngers

- **Attributed actor**: CyberAv3ngers / IRGC-IO (attribution: attested; CISA AA23-335A Dec 1 2023; OFAC Feb 2 2024).
- **Target**: Aliquippa, PA water booster station (Unitronics Vision PLC).
- **Vector / TTP**: exposed Unitronics PLC with default/weak credentials; HMI defaced with anti-Israel message.
- **Outcome**: pump switched to manual; no civilian impact; nationwide alarm catalysing EPA/CISA response.
- **Doctrine linkage**: Cyber-as-deniable-retaliation (explicitly cited — "every equipment made in Israel is CyberAv3ngers legal target"); Forward Defense; Axis of Resistance.
- **Linkage confidence**: attested.
- **Citations**: CISA AA23-335A; CBS Pittsburgh; WaterISAC advisory; OFAC Feb 2 2024 designation.

### 2023-12-01 CISA AA23-335A — IRGC-affiliated Unitronics PLC campaign

- **Attributed actor**: CyberAv3ngers / IRGC-affiliated (attribution: attested).
- **Target**: 75+ Unitronics PLC devices globally; at least 34 US water/wastewater facilities.
- **Vector / TTP**: as Aliquippa; default credentials and exposed port 20256/TCP.
- **Outcome**: minor OT impacts at multiple WWS facilities; PLC ladder logic supplanted.
- **Doctrine linkage**: as above.
- **Linkage confidence**: attested.
- **Citations**: CISA AA23-335A; partner advisories from INCD, NCSC-UK, CCCS.

### 2024-02-02 OFAC designates six IRGC-IO officials behind CyberAv3ngers

- **Attributed actor**: CyberAv3ngers / IRGC-IO Cyber-Electronic Command.
- **Target**: enabling-infrastructure designations (not a single victim).
- **Outcome**: SDN designations of Hamid Reza Lashgarian, Mahdi Lashgarian, Hamid Homayunfal, Mahdi Mohammad Sadeghi, Milad Mansuri, Reza Mohammad Amin Saberian.
- **Doctrine linkage**: Cyber-as-deniable-retaliation (attested).
- **Linkage confidence**: attested.
- **Citations**: Treasury OFAC Feb 2 2024 press release.

### 2024-05–2024-09 Hack-and-leak against Trump campaign

- **Attributed actor**: IRGC (Masoud Jalili, Seyyed Ali Aghamiri, Yaser Balaghi) — APT42 / Mint Sandstorm overlap (attribution: attested; DOJ Sept 27 2024 indictment).
- **Target**: Trump campaign staff, current and former US officials, journalists, NGOs.
- **Vector / TTP**: spearphishing and social engineering; mailbox compromise; "hack-and-leak" to media and supposed Biden-campaign associates.
- **Outcome**: campaign documents obtained; major media outlets declined to publish; some material leaked to alternative outlets.
- **Doctrine linkage**: Post-Soleimani retaliation (attested — indictment explicitly cites "ongoing efforts to avenge the death of Qasem Soleimani"); Cyber-as-deniable-retaliation.
- **Linkage confidence**: attested.
- **Citations**: DOJ press release Sept 27 2024; ODNI joint statement Aug 19 2024.

### 2024-08 FBI advisory on Aria Sepehr Ayandehsazan (Emennet Pasargad re-brand)

- **Attributed actor**: IRGC contractor (rebranded Emennet Pasargad).
- **Target**: 2024 US election influence; Israeli organisations.
- **Vector / TTP**: spoofed personas, hack-and-leak, mass-email coercion.
- **Doctrine linkage**: Cyber-as-deniable-retaliation; Post-Soleimani retaliation.
- **Linkage confidence**: attested.
- **Citations**: FBI/CISA joint advisory Aug 2024.

### 2024-08 CISA AA24-241A — Pioneer Kitten / Fox Kitten ransomware-affiliate broker

- **Attributed actor**: Pioneer Kitten / IRGC-affiliated.
- **Target**: US schools, healthcare, finance, local government, defense; Israel; UAE; Azerbaijan.
- **Vector / TTP**: edge-device exploitation (Citrix, Palo Alto, F5, Fortinet, Check Point); access sold or shared with NoEscape, RansomHouse, ALPHV/BlackCat.
- **Doctrine linkage**: Sanctions-Evasion (revenue); Asymmetric Warfare.
- **Linkage confidence**: attested.
- **Citations**: CISA AA24-241A.

### 2025-06 Predatory Sparrow — Nobitex Iranian crypto exchange drained (NOT IRANIAN)

- **Attributed actor**: Predatory Sparrow (Israel-aligned).
- **Target**: Nobitex (Iran's largest crypto exchange).
- **Outcome**: ~$90M drained or burned to vanity addresses.
- **Note**: counter-Iran operation; included for context.
- **Citations**: Elliptic; Chainalysis.

### 2025-07 Pay2Key.I2P resurfaces as IRGC-aligned RaaS

- **Attributed actor**: Pay2Key.I2P / Fox Kitten-aligned (attribution: medium-high; Halcyon, KELA, The Register).
- **Target**: US and Israeli organisations; affiliate model with 80% profit-share.
- **Vector / TTP**: ransomware deployed via affiliates; I2P-hosted leak site.
- **Outcome**: ~$4M extorted in first four months.
- **Doctrine linkage**: Sanctions-Evasion; Asymmetric Warfare; Cyber-as-deniable-retaliation post Israel-Iran kinetic exchanges.
- **Linkage confidence**: strongly inferred.
- **Citations**: Halcyon, KELA, The Register July 2025.

### 2025-09 OFAC designates IRGC-linked crypto network ($600M shadow-banking)

- **Attributed actor**: IRGC financial facilitators.
- **Target**: enabling infrastructure (front companies in HK and UAE).
- **Outcome**: SDN designations including seven crypto addresses.
- **Doctrine linkage**: Sanctions-Evasion (attested).
- **Linkage confidence**: attested.
- **Citations**: Treasury OFAC Sept 16 2025; Chainalysis, Elliptic, Scorechain analyses.

### 2026-01 OFAC designates Zedcex / Zedxion (first IRGC-linked exchange SDN)

- **Attributed actor**: IRGC-linked digital-asset infrastructure.
- **Outcome**: first-ever OFAC designation of IRGC-linked exchange infrastructure.
- **Doctrine linkage**: Sanctions-Evasion (attested).
- **Linkage confidence**: attested.
- **Citations**: Treasury OFAC Jan 2026; Elliptic.

### 2026-04 CISA AA26-097A — reissue of IRGC PLC exploitation warning

- **Attributed actor**: IRGC-affiliated cyber actors.
- **Target**: US critical infrastructure (water, energy, manufacturing).
- **Outcome**: advisory reissue; renewed defensive posture during continued post-strike tensions.
- **Doctrine linkage**: Forward Defense; Cyber-as-deniable-retaliation.
- **Linkage confidence**: attested.
- **Citations**: CISA AA26-097A.
