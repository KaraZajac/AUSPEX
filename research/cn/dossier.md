# China — AUSPEX dossier (executive synthesis)

**Scope**: PRC state-sponsored cyber program, 2010–2026. This synthesis sits on top of `doctrines.md`, `actors.md`, `events.md`, and `sources.md`.

## Bottom line

The PRC operates the world's largest, most diversified, and most doctrine-aligned state cyber program. Three institutional pillars — the Ministry of State Security (MSS), the People's Liberation Army (PLA, since April 2024 the Cyberspace Force and Information Support Force as successors to the Strategic Support Force), and the Ministry of Public Security (MPS) — task a sprawling ecosystem of provincial state-security bureaus and private contractor front companies (Chengdu 404 / Wuhan XRZ / Hainan Xiandun / Sichuan Juxinhe / Beijing Integrity Technology / i-Soon / Boyusec / Huaying Haitai). Their tasking flows from a coherent doctrinal stack — Made in China 2025, the 14th and 15th Five-Year Plans, Military-Civil Fusion, the Digital Silk Road, intelligentized warfare, and Taiwan reunification — and Western attribution has become precise enough since 2018 that named events map to specific provincial bureaus and contractors with high confidence.

## Top doctrines (operational salience)

1. **Made in China 2025 / 14th–15th FYP / Dual Circulation** — the master industrial-policy stack drives all observed commercial-IP theft. Ten enumerated MIC2025 sectors (advanced IT, CNC/robotics, aerospace, maritime, rail, NEVs, power equipment, agricultural equipment, new materials, biopharma) form the canonical target taxonomy. The 14th FYP's "chokepoint" framing and the 15th FYP's AI+ initiative tighten this further around semiconductors, AI accelerators, fusion energy, biotech, and 6G.
2. **Military-Civil Fusion (MCF)** — the legal-strategic license to treat the entire foreign civilian R&D base as a military intelligence target. Operationally, MCF is why apparently commercial APTs (APT10, APT41) and clearly military operations (Su Bin / J-20, PLA 54th RI / Equifax) sit in the same campaigns: they feed the same fused requirements pipeline.
3. **Intelligentized warfare and Taiwan reunification (PLA 2027 milestone)** — drives the pre-positioning posture. CISA's February 2024 advisory (AA24-038a) is the cleanest attested linkage in the public record: Volt Typhoon is in U.S. critical infrastructure "to enable lateral movement to OT assets to disrupt functions … in the event of a major crisis or conflict."
4. **Belt and Road / Digital Silk Road** — drives regional political-intelligence collection (Mustang Panda, APT15, APT30) and operations against BRI-relevant industries (named explicitly in the APT40 CISA advisory).
5. **2017 National Intelligence Law + Data Security Law / PIPL** — the legal apparatus that converts every PRC-domiciled vendor (Huawei, Tencent, Hikvision, Integrity Tech, Sichuan Juxinhe) into a compelled collection node. Not a tasking doctrine, but the indispensable enabler.
6. **Standards 2035** — drives collection on 5G/6G, AI, quantum, IoT standardization processes; overlaps with DSR market expansion.

## Top services

| Service | Role | Representative actors |
|---|---|---|
| **MSS** (Ministry of State Security, civilian foreign intelligence + counterintelligence) | Largest cyber sponsor; runs provincial state-security departments that contract out to private companies | Hubei SSD → APT31 (Wuhan XRZ); Hainan SSD → APT40 (Hainan Xiandun); Tianjin SSB → APT10 (Huaying Haitai); Guangdong SSD → APT3 (Boyusec); Jiangsu SSD → APT26/Anthem/OPM; Shanghai-based MSS officers → Hafnium / Silk Typhoon / Yin Kecheng; Sichuan-based → Salt Typhoon (Sichuan Juxinhe); Beijing-based → Flax Typhoon (Integrity Tech) |
| **PLA Cyberspace Force / Information Support Force** (since April 2024; successors to the Strategic Support Force est. 2015, itself succeeding the 3PLA / Unit 61398 era) | Military cyber, EW, space, psychological operations; system-destruction warfare doctrine | APT1 / Unit 61398; PLA 54th Research Institute (Equifax); APT30 / Unit 78020; assessed parentage of Volt Typhoon |
| **MPS** (Ministry of Public Security, domestic) | Domestic dissident, Tibet, Uyghur, Hong Kong democracy targeting; uses same contractors | i-Soon (mixed MPS/MSS clientele); operations vs. diaspora |

## Top actors by impact

1. **Volt Typhoon** — the most strategically significant single PRC actor as of 2026. Pre-positioning in U.S. critical infrastructure; OT-oriented; CISA's named threat for Taiwan-contingency disruption.
2. **Salt Typhoon** — the largest known SIGINT compromise of telecommunications infrastructure in U.S. history. MSS-attributed (Treasury, Jan 2025). 200+ companies / 80 countries (FBI, Aug 2025).
3. **APT41** — the most versatile and persistent PRC actor; dual-mode state + criminal; supply-chain virtuoso (NetSarang, CCleaner, ASUS); USAHerds; ongoing global "DUST" campaign 2023–25.
4. **Hafnium / Silk Typhoon** — ProxyLogon (2021, ~250,000 servers); Treasury BeyondTrust compromise (Dec 2024).
5. **APT10** — Operation Cloud Hopper redefined supply-chain compromise; touched 10/10 MIC2025 sectors.
6. **APT40** — the BRI/maritime actor; cleanly attested via 2021 DOJ indictment and CISA AA21-200a.
7. **APT31** — political-targeting backbone; first PRC group sanctioned alongside indictment (March 2024).
8. **Flax Typhoon** — IoT botnet-builder; first PRC critical-infrastructure operator whose operating company (Integrity Tech) was sanctioned by name (Jan 2025).
9. **Mustang Panda** — the workhorse for regional political-intelligence collection; durable across decade-plus.
10. **APT27 / Linen Typhoon / Emissary Panda** — long-running defense-aerospace-telecom actor; tied to 2024 Treasury compromise via Yin Kecheng designation.

## Target-sector pattern

The PRC sector-targeting pattern is the most legible signature in cyber attribution. Mapping observed events back to MIC2025's ten sectors:

- **Advanced IT / semiconductors / software**: APT10 (Cloud Hopper), APT41 (NetSarang, CCleaner, ASUS, Taiwan research), Volt Typhoon (IT services), Storm-0558 (Microsoft).
- **Aerospace / aviation**: Su Bin (C-17, F-22, F-35), APT26 / Turbine Panda (CFM/GE/Safran engines), APT10 (satellites), APT1 (aerospace).
- **Maritime / naval**: APT40 (cleanly attested via CISA), Sea Dragon contractor breach.
- **Power / energy**: APT31 (2018 Texas energy company), APT3 (Siemens), Volt Typhoon (electric utilities incl. LELWD), Flax Typhoon (Taiwan utilities).
- **Telecom / 5G / 6G**: Salt Typhoon (U.S. tier-1 carriers), APT41, APT27, APT31.
- **Biotech / pharma / health**: APT10 (Cloud Hopper pharma), APT41 (healthcare), Hafnium (infectious-disease researchers), APT40 (biomedical R&D), Anthem (PII-via-health-insurer).
- **New materials, agricultural equipment, advanced rail, NEVs**: less publicly cataloged but periodically appears in APT10 / APT41 customer lists.

Two non-MIC2025 patterns also dominate:

- **Bulk PII for HUMINT**: OPM (22.1M SF-86 records), Anthem (78.8M health records), Equifax (145M credit records), Marriott (500M travel records). Combined with the National Intelligence Law's data-localization regime, the MSS has near-comprehensive coverage of cleared U.S. personnel and their families.
- **Pre-positioning in U.S. critical infrastructure**: Volt Typhoon, Flax Typhoon, Salt Typhoon — qualitatively new since 2021; explicitly tied by attributing governments to a Taiwan-contingency scenario.

## Signature events

(Detail in `events.md`. Selected because each cleanly anchors a doctrine pillar.)

- **2010–14 — Su Bin / C-17 / F-22 / F-35** — the cleanest attested aerospace-IP-for-J-20 case; MCF anchor.
- **2014 — OPM** — defines the bulk-PII-for-HUMINT pattern; Jiangsu MSS attribution.
- **2017 — Operation Cloud Hopper (APT10)** — every MIC2025 sector touched; MSP supply-chain template established.
- **2017 — Equifax (PLA 54th RI)** — explicit DOJ economic-espionage charges against PLA officers.
- **2021-03 — Microsoft Exchange ProxyLogon (Hafnium)** — White House high-confidence MSS attribution; ~250,000 servers; first major Exchange 0-day reckoning.
- **2023-05 — Volt Typhoon disclosure** — defines the pre-positioning era; intelligentized-warfare doctrine made operational.
- **2024-01 — DOJ / FBI KV-botnet takedown** — first court-authorized U.S. operation against PRC proxy infrastructure on private routers.
- **2024-03 — APT31 / Wuhan XRZ indictment + OFAC sanctions** — template for the contractor-bureau attribution model.
- **2024-12 — Treasury BeyondTrust (Silk Typhoon)** — counterintelligence on pending OFAC actions against China; sanctions-aware adversary.
- **2025-01 — OFAC sanctions on Sichuan Juxinhe + Integrity Tech** — formal Treasury attribution of Salt Typhoon and Flax Typhoon operating companies.
- **2025-08 — CISA AA25-239a Salt Typhoon multinational advisory** — 13-government joint attribution; 200+ companies, 80 countries.

## Sourcing notes (and confidence discipline)

- **Highest-confidence events** are those with DOJ indictments, OFAC SDN designations, and / or CISA joint advisories that explicitly name a strategic goal. These are tagged **attested** per AUSPEX SCHEMA. The 2024–25 Treasury sanctions on Wuhan XRZ, Integrity Tech, and Sichuan Juxinhe — each accompanied by named individuals — are unusual in cleanly linking actor → contractor → MSS bureau and represent a maturing Western attribution capability.
- **Most "doctrine linkage = attested" tags here** lean on three documents: CISA AA21-200a (APT40 → BRI explicit), CISA AA24-038a (Volt Typhoon → pre-positioning for U.S.-PRC conflict explicit), and OFAC press releases (which now routinely name PRC strategic objectives).
- **Be cautious** with vendor naming-fragmentation: APT15 / Nylon Typhoon / Ke3chang / Vixen Panda / Nickel can refer to closely overlapping but not identical activity clusters. Microsoft's "Typhoon" taxonomy (2023) is being adopted but does not always cleanly map to MITRE / FireEye-Mandiant / CrowdStrike heritage names. Where ambiguity exists this dossier prefers the heritage name and lists the Microsoft alias.
- **i-Soon (Feb 2024 leak)** is the single most important corroborating source for the contractor-bureau model. SentinelLabs, Unit 42, and BBC/NHK independently authenticated the documents.
- **Gaps**:
  - **MPS** activity is under-attributed publicly; most Western indictments target MSS or PLA.
  - **APT19 / APT22 / APT26** are dormant or low-activity under those labels; their personnel have likely been re-clustered into MSS/PLA successor groups not yet given stable names.
  - **15th FYP-era** events are still surfacing; many 2025–26 campaigns lack DOJ-grade attribution yet (Mustang Panda's Middle East expansion, Storm-2603, ongoing Salt Typhoon expansion).
  - **PRC offensive use of LLMs / generative AI** is still emerging; the OpenAI / Microsoft February 2024 disclosure named Charcoal Typhoon but provided limited indicators.
  - **Direct Chinese-government text** — for several doctrines (MCF in particular) there is no single public master document; English-language references in this dossier therefore lean on CRS, CSET translations, and tier-1 think-tank summaries where the original Chinese source is internal or scattered across CCP CC and State Council pronouncements.

## Implications for AUSPEX tagging

When a new PRC-attributed event surfaces, the typical doctrine-mapping decision tree is:

1. Is the target in MIC2025's ten sectors **and** is the actor MSS-tasking-flavor (APT10/31/40/41 ecosystem)? → tag MIC2025 + applicable FYP; **strongly inferred** absent explicit attributing-source goal statement.
2. Is the target U.S. or allied critical infrastructure (power, water, telecom, transport, pipelines, ports) **and** is the actor in the Volt/Salt/Flax/KV cluster? → tag intelligentized warfare + Taiwan-contingency; CISA/Treasury have generally elevated this to **attested**.
3. Is the target BRI-partner country government, telecom, or competing-infrastructure operator? → tag BRI / DSR; lean **strongly inferred**.
4. Is the target a foreign politician, dissident, journalist, or diaspora org? → tag 2017 Intelligence Law (for legal-regime context); typical actors APT31 / Mustang Panda / APT15.
5. Is the target a PRC-domiciled foreign business or PRC user data? → tag DSL / PIPL (the defensive doctrine).

Where multiple doctrines apply (most events touch 2+), prefer the most-specific. MIC2025 trumps MCF where the target is in a named sector; the intelligentized-warfare frame supersedes generic espionage where pre-positioning behavior is observed; Taiwan-contingency framing supersedes intelligentized warfare where Guam / INDOPACOM-logistical-relevance is in the target list.
