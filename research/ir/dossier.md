# Iran — Cyber Program Dossier

## Executive summary

Iran's state-sponsored cyber program is the operational arm of a regime ideology that fuses Islamic-revolutionary deterrence, sanctions-era economic siege mentality, and a "forward defense" military doctrine. Cyber is the lowest-cost, highest-deniability instrument in that toolkit, and Tehran uses it for four distinct missions: (1) **deniable retaliation** against Israel, the United States, the Gulf monarchies, and dissidents abroad; (2) **regime preservation** via surveillance, suppression, and intimidation of diaspora, journalists, and opposition activists; (3) **strategic espionage** against governments, defense industrial bases, energy, and academia/think-tanks aligned with the nuclear file; and (4) **revenue and disruption** through ransomware, extortion, and crypto sanctions-evasion. Unlike Russia's GRU/SVR or China's MSS, Iran tolerates and increasingly relies on contractor-front blurring (Najee Technology, Afkar System, Emennet Pasargad, Rana Intelligence Computing) and hacktivist personas (CyberAv3ngers, HomeLand Justice, Moses Staff, Black Shadow) that provide deniability while serving state goals.

## Top doctrines (cyber-relevant)

1. **Forward Defense / "Mosaic Defense"** — engage adversaries outside Iran's borders, through proxies, to keep conflict away from the homeland. Cyber is the deniable extension of Quds Force projection. (See `doctrines.md` §1.)
2. **Axis of Resistance** — Tehran's network of state and non-state allies (Hezbollah, Houthis, PMF, Hamas, post-Assad remnants) is mirrored in the cyber domain by IRGC tasking of proxy hacker fronts and capability transfer to Hezbollah cyber units. (§2)
3. **Asymmetric warfare doctrine** — assumes conventional inferiority versus US/Israel; cyber, drones, missiles, maritime swarming are the asymmetric equalizers. (§3)
4. **Constitutional role of the IRGC** (Article 150) — guardianship of the revolution authorizes the IRGC, including IRGC-Cyber and IRGC-IO, to conduct extraterritorial operations including offensive cyber against perceived enemies. (§4)
5. **Sanctions evasion as state policy** — every Iranian "Year of …" Nowruz designation since 2018 has named production, the knowledge-based economy, or inflation control; sanctions-evasion (oil, crypto, financial networks) is a permanent state priority and a recurring driver of cyber-enabled theft, extortion, and crypto laundering. (§5)
6. **Post-Soleimani retaliation posture** — the January 3, 2020 strike on Qasem Soleimani created an enduring, openly-stated revenge obligation; DOJ-attested 2024 hack-and-leak indictments expressly name avenging Soleimani as a motive. (§6)
7. **Cyber as deniable retaliation via hacktivist fronts** — IRGC-IO and MOIS routinely operate behind named personas (CyberAv3ngers / HomeLand Justice / Moses Staff / Black Shadow / Emennet Pasargad's "Enemies of the People") to launder destructive or coercive operations through a pseudo-hacktivist veneer. (§7)

## Top services

- **IRGC-Cyber / IRGC Electronic Warfare and Cyber Defense Organization** — premier offensive cyber arm; parent of APT33, APT35-Charming Kitten / Phosphorus / Mint Sandstorm cluster, Pioneer Kitten / Fox Kitten.
- **IRGC-Intelligence Organization (IRGC-IO)** — counterintelligence and dissident targeting; parent of APT42 and (per CISA Dec 2023) the CyberAv3ngers persona.
- **Ministry of Intelligence and Security (MOIS / VAJA / VEVAK)** — civilian intelligence; parent of MuddyWater (Static Kitten), APT34 / OilRig, APT39 (Chafer) / Rana Intelligence Computing front, and the HomeLand Justice persona used against Albania.
- **IRGC Quds Force** — regional/cross-border ops; sponsors and capability-transfers to Hezbollah's cyber unit ("Lebanese Cedar" / Volatile Cedar lineage).
- **Contractor ecosystem** — Emennet Pasargad (election interference, sanctioned 2021), Najee Technology / Afkar System (IRGC-affiliated ransomware, sanctioned 2022), Rana Intelligence Computing (MOIS front for APT39, sanctioned 2020), Mehrsam Andisheh Saz Nik / Sayyed Shojaa Mojarad–linked entities (CyberAv3ngers infrastructure, sanctioned 2024).

## Top named actors

- **APT33** (Refined Kitten / Elfin / Peach Sandstorm / HOLMIUM) — IRGC; energy and aerospace; Shamoon lineage.
- **APT34 / OilRig** (Helix Kitten / Hazel Sandstorm / Cobalt Gypsy / Crambus / Earth Simnavaz) — MOIS; Middle East government, telecom, energy.
- **APT35** (Charming Kitten / Phosphorus / Mint Sandstorm / TA453 / Ballistic Bobcat) — IRGC; think-tanks, journalists, diaspora, US officials, nuclear/policy researchers.
- **APT42** (Mint Sandstorm cluster overlap / TA453 overlap) — IRGC-IO; social-engineering credential theft, 2024 Trump-campaign hack-and-leak.
- **MuddyWater** (Static Kitten / Mango Sandstorm / Mercury / Seedworm / TEMP.Zagros / Earth Vetala) — MOIS; telecom, government, oil & gas, defense across Asia/Africa/Europe/NA.
- **APT39** (Chafer / Remix Kitten / Remexi / ITG07 / Rana Intelligence Computing) — MOIS; dissident surveillance and travel/telecom sector.
- **Pioneer Kitten / Fox Kitten** (UNC757 / Parisite / Lemon Sandstorm / Rubidium) — IRGC-affiliated; initial-access broker partnering with ransomware affiliates; Pay2Key operator.
- **CyberAv3ngers** — IRGC-IO persona (per CISA AA23-335A and OFAC Feb 2024 designations); critical-infrastructure OT.
- **HomeLand Justice** — MOIS persona used against Albania (2022).
- **Moses Staff** (Marigold Sandstorm / DEV-0500) — Iran-linked; Israel-focused destructive/leak ops.
- **Black Shadow / DEV-0270 (Nemesis Kitten)** — destructive-leak persona overlapping Phosphorus subgroup.
- **Emennet Pasargad** — IRGC contractor; 2020 US election voter-intimidation ("Proud Boys" emails), broader IO.
- **Lebanese Cedar / Volatile Cedar** — Hezbollah-linked but with Iranian operator involvement; telecom/ISP.

Flagged but **not** Iranian: **Predatory Sparrow / Gonjeshke Darande** — pro-Israel actor (widely attributed to IDF Unit 8200) that targets Iranian rail, fuel, and steel. Included in `actors.md` only for context — every Iran-attributed event should be cross-checked against the possibility of an Israeli or anti-regime hacktivist false-flag.

## Target sector pattern

Iran's target list is the most ideologically legible of any cyber program:

- **Israel, all sectors** — water (2020), insurance (Shirbit 2020), logistics (CyberServe 2021), academia (Technion 2023 DarkBit), tourism (2023 hotels), telecom, hospitals.
- **Gulf energy** — Saudi Aramco, RasGas, Bapco (Shamoon 1/2/3), continuous APT33 reconnaissance.
- **US critical infrastructure** — financial DDoS (Operation Ababil 2012-13), Bowman Dam SCADA reconnaissance (2013), water OT (CyberAv3ngers 2023-24), aerospace (Log4j 2022).
- **Diaspora, journalists, think-tanks, nuclear policy researchers** — APT35/APT42 perennial.
- **US political campaigns and election infrastructure** — 2020 (Emennet Pasargad), 2024 (IRGC trio Jalili/Aghamiri/Balaghi).
- **Albania and MEK-related targets** — exiled MEK presence in Albania is the perennial trigger for HomeLand Justice operations.
- **Healthcare and academia in US/UK** — Boston Children's Hospital (2021, thwarted), Vermont hospital, UK Federation of Tower Hamlets-style local-government attacks via MuddyWater.

## Signature events (full list in `events.md`)

- **2010** — Stuxnet (against Iran; included as the precipitating event that catalyzed Iran's offensive cyber buildup).
- **2012** — Shamoon wipes 30,000+ Saudi Aramco workstations.
- **2012-13** — Operation Ababil DDoS of 46+ US banks (IRGC, indicted 2016).
- **2013** — Bowman Avenue Dam SCADA intrusion (IRGC, indicted 2016).
- **2014** — Sands Casino destructive attack (Iran, per DNI Clapper testimony).
- **2016, 2018** — Shamoon 2 and 3 waves against Saudi targets.
- **2017** — HBO extortion (Behzad Mesri, IRGC-linked).
- **2019** — Lab Dookhtegan leak of APT34's toolkit on Telegram.
- **2020 Apr** — attempted OT poisoning of Israeli water utilities.
- **2020 Oct-Nov** — Emennet Pasargad "Proud Boys" voter-intimidation emails; voter-registration data theft (CISA AA20-304A).
- **2020-21** — Pay2Key against Israeli companies.
- **2021 Jun** — Boston Children's Hospital intrusion attempt (thwarted; FBI Director Wray, June 2022 disclosure).
- **2022 Jul/Sep** — HomeLand Justice destructive attack on Government of Albania → diplomatic break (Sept 2022); CISA AA22-264A, Treasury sanctions of MOIS Sept 9 2022.
- **2022 Sep** — CISA AA22-257A: IRGC-affiliated ransomware exploitation of Log4j/Fortinet/Exchange; DOJ indicts Mansour Ahmadi, Khatibi, Nikaeen.
- **2023 Feb** — DarkBit ransomware against Technion (Israel), attributed by INCD to MuddyWater/MERCURY.
- **2023 Nov-2024** — CyberAv3ngers Unitronics campaign; Aliquippa PA water authority Nov 25 2023; CISA AA23-335A Dec 1 2023; OFAC sanctions Feb 2 2024.
- **2024 May-Sep** — IRGC trio (Jalili, Aghamiri, Balaghi) hack-and-leak against Trump campaign; DOJ indictment Sept 27 2024.
- **2025-26** — Pay2Key.I2P resurgence as IRGC-aligned RaaS post Israel–Iran kinetic exchanges; CISA AA26-097A reissue of IRGC-affiliated PLC exploitation warning.

## Sourcing notes

Iran is unusually well-attested because the US government has chosen to make cyber attribution a tool of public pressure: Treasury OFAC has designated Iranian actors at least eight separate times (2018 SamSam; Sept 2020 APT39/Rana; Nov 2021 Emennet Pasargad; Feb 2022 MOIS; Sept 2022 MOIS over Albania; Sept 2022 IRGC ransomware contractors; Feb 2024 CyberAv3ngers infrastructure; Sept 2025 IRGC crypto network), and DOJ has unsealed indictments naming specific IRGC and MOIS officers in 2016, 2018, 2019, 2020, 2021, 2022, and 2024. CISA, FBI, NSA, US Cyber Command, INCD (Israel), NCSC (UK), CCCS (Canada), and ACSC (Australia) routinely co-sign joint advisories with explicit IRGC or MOIS attribution. Iranian primary sources are sparse on cyber but rich on doctrine: Khamenei's annual Nowruz "Year of …" designations and the Supreme Leader's office speeches frame the strategic priorities, and Tasnim / Fars / Press TV provide the propaganda overlay. The IRGC itself does not publicly acknowledge cyber operations, so the "official text" field for cyber-specific tasking is generally empty — we rely on Western government attribution and tier-1 vendor research, cross-checked.

Confidence in doctrine-event linkage is highest where US Treasury/DOJ explicitly names the strategic motive (the 2024 indictment naming Soleimani revenge; the 2022 MOIS designation citing Albania-MEK; the Feb 2024 CyberAv3ngers designation citing Israel-equipment retaliation). It is lower for Shamoon 1 (no public US indictment, vendor attribution only) and for many Israel-Iran tit-for-tat exchanges where attribution is implied rather than declared.

## Known gaps and analyst caveats

- IRGC's internal cyber unit numbering remains opaque; vendor "APT" labels do not cleanly map to Iranian organizational charts.
- The Iran–Hezbollah cyber capability transfer is well-asserted but rarely documented operationally.
- A meaningful share of "Iranian" hacktivist personas may be either contractor-run or false-flag; analyst review is required for any event where attribution rests solely on a Telegram channel.
- 2025-2026 Pay2Key.I2P operations blend cybercrime and state coercion in ways US Treasury has only begun to designate; expect attribution to clarify through 2026.
