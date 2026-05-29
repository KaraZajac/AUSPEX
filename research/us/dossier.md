# United States — Cyber Dossier (Synthesis)

## Structural note

This dossier is deliberately asymmetric vs. the AUSPEX adversary dossiers (CN, RU, IR, KP). US cyber **doctrine** is unusually public — the White House, DoD, CYBERCOM, NSA, CISA and ONCD publish strategies, command visions, FOIA-released after-action assessments, and Congressional testimony at a level no AUSPEX adversary approaches. US cyber **operations**, by contrast, are mostly classified. Public knowledge of US offensive cyber comes from three asymmetrical sources:

1. **Officially acknowledged operations** — a small but growing set (Hunt Forward deployments, the 2018 IRA disruption, Operation Glowing Symphony against ISIS, the 2023–24 KV-Botnet disruption, the Trickbot disruption ahead of 2020).
2. **Leak-attributed operations** — Snowden (2013), Shadow Brokers (2016–17), Vault 7 (2017). These are factually grounded but a *frozen 2007–2013 snapshot*; the modern toolkit will have rotated.
3. **Journalistically reported** — Sanger's *Confront and Conceal* (Stuxnet/Olympic Games), Greenberg's *Sandworm* (NotPetya blowback from leaked NSA tooling), Zetter's *Countdown to Zero Day*, Nakashima at WaPo, Ellen Nakashima/Joseph Menn at Reuters.

Lean on this asymmetry. The **doctrines** section is rich and primary-sourced. The **actors** and **events** sections honestly flag confidence: officially acknowledged, journalistically reported, or leak-derived.

---

## Top doctrines (canonical)

1. **National Cybersecurity Strategy (March 2023)** — five pillars: defend critical infrastructure, disrupt and dismantle threat actors, shape market forces, invest in a resilient future, forge international partnerships. Implementation Plan v1 (July 2023) and v2 (May 2024). Successor: **Trump "Cyber Strategy for America" (March 2026)** — seven-page framework reorienting toward private-sector offensive partnership and cybercrime focus.
2. **2023 DoD Cyber Strategy** — formalizes "campaigning" as the integrative concept enclosing **Defend Forward** (2018) and **Persistent Engagement** (CYBERCOM 2018 Command Vision). Grounded explicitly in Russia–Ukraine experience.
3. **NSPM-13 (2018)** — Trump-era delegation of time-sensitive cyber-operations authority to SecDef/CYBERCOM, removing the prior NSPD-20 White House-centric approval choke point. Text classified; existence/effects reported widely; partially retained under Biden's 2022 policy adjustment; Trump 2.0 preserved.
4. **Hunt Forward / persistent partnerships** — CYBERCOM's overt foreign-deployment program by the Cyber National Mission Force (CNMF). Publicly acknowledged in 28+ countries since 2018 (Ukraine, Estonia, Lithuania, Latvia, Albania, Montenegro, North Macedonia, Croatia, Zambia, Canada, plus SOUTHCOM-region partners).
5. **Title 10 / Title 50 authorities** — military (Title 10, CYBERCOM) vs. intelligence (Title 50, NSA/CIA) framework that structures every US offensive cyber operation; Section 1642 NDAA FY2019 created an explicit standing authority for active defense against RU/CN/IR/KP.
6. **CISA Secure-by-Design** (2023→) and **ONCD Open-Source Software Security Initiative (OS3I)** (2023→) — the defensive industrial-policy half of the strategy: shift liability to producers, harden the dependency graph.
7. **Cyberspace Solarium Commission** (2020 final report → CSC 2.0 ongoing) — the quasi-doctrinal blueprint behind much of the above; ~79% of 82 recommendations implemented or in-flight by 2024, with notable rollback in the 2025 assessment.

## Top services / commands

- **NSA** (Title 50 SIGINT; TAO/Computer Network Operations Directorate — formerly S32, now part of the Cybersecurity Directorate/Directorate of Operations reorg). Fort Meade. Dual-hatted with CYBERCOM as of writing — separation review shelved in 2025.
- **U.S. Cyber Command (CYBERCOM)** — Title 10 unified combatant command since 2018; commands the **Cyber Mission Force** (133 teams, FOC May 2018): CMTs, CPTs, NMTs, CSTs, NSTs.
- **Cyber National Mission Force (CNMF)** — elevated to sub-unified command December 2022; runs Hunt Forward and most named overt offensive ops.
- **CIA** — Title 50 covert action; the **Center for Cyber Intelligence (CCI)** is the unit Vault 7 exposed. **Special Collection Service (SCS / F6)** is a joint CIA/NSA close-access program.
- **FBI Cyber Division** — domestic disruption authority (court-ordered takedowns like KV-Botnet 2024).
- **CISA** — DHS civilian-network defender; Secure-by-Design lead.
- **ONCD** — Office of the National Cyber Director (2021, by statute); coordinates whole-of-government strategy execution.
- **Service cyber components** — ARCYBER (Army), Fleet Cyber/10th Fleet (Navy), AFCYBER/16th AF (Air Force), MARFORCYBER, SPACECYBER.

## Top actors (publicly attributed)

| Vendor name | Attributed to | Source | Confidence |
|---|---|---|---|
| Equation Group / APT-C-40 | NSA TAO | Kaspersky (2015) + Shadow Brokers leak (2016–17) | very high (leak-corroborated) |
| Longhorn / The Lamberts | CIA CCI | Symantec (2017) + Kaspersky + Vault 7 (WikiLeaks 2017) | high (technical alignment with Vault 7) |
| (no vendor name) | "Olympic Games" team — US + Israel joint | Sanger/NYT 2012, Zetter | high (journalism-attested, never officially confirmed) |
| Joint Task Force ARES | CYBERCOM counter-ISIS | DoD-acknowledged + FOIA-declassified | attested |
| Cyber National Mission Force (CNMF) | CYBERCOM Hunt Forward | self-announced via cybercom.mil press releases | attested |

## Target sector pattern (from public record)

- **Adversary military C2 and propaganda infrastructure** — ISIS networks (Glowing Symphony), IRA troll farm (2018).
- **Adversary critical infrastructure (pre-positioned / contemplated)** — Iran's Natanz uranium enrichment (Stuxnet, 2007–10); Russian electrical grid (reported "implants" — NYT 2019).
- **Foreign telecommunications carriers** — Belgacom (GCHQ-led, Five Eyes; Snowden), Brazilian/Mexican networks (Snowden), Huawei HQ (Snowden — Operation Shotgiant).
- **Foreign heads of state / diplomatic** — Merkel cellphone (SCS), Brazilian presidency, EU institutions (Snowden).
- **Foreign state-owned strategic enterprises** — Petrobras (Snowden), SWIFT, French foreign ministry (Snowden).
- **Adversary cyber-criminal infrastructure** when it threatens US elections — Trickbot (2020), KV-Botnet/Volt Typhoon (2023–24).
- **Partner-network malicious activity** — Hunt Forward target set: kicking RU/CN/IR/KP actors off allied networks.

## Signature events (the canon)

- **Stuxnet / Olympic Games** (2007–2010) — joint US/Israeli sabotage of Iranian centrifuges. Journalistically attested (Sanger 2012). Never officially acknowledged.
- **Flame** (2012) and **Duqu** (2011) — sister malware in the Olympic Games family. Kaspersky/Symantec technical attribution; US/IL implied.
- **Regin** (active 2003–14, exposed 2014) — Five Eyes long-haul espionage platform (telecoms, EU). Snowden + Kaspersky/Symantec.
- **Operation Socialist** (2010–13) — GCHQ breach of Belgacom; Five Eyes partner op US benefited from.
- **Merkel phone tap** (Snowden 2013) — SCS close-access program.
- **Shadow Brokers leak** (2016–17) — NSA TAO tooling (EternalBlue, DoublePulsar, FuzzBunch). EternalBlue weaponized by DPRK (WannaCry, May 2017) and Russia (NotPetya, June 2017) — the most consequential US cyber blowback of the modern era.
- **Vault 7 leak** (March–Nov 2017) — CIA CCI tooling published by WikiLeaks; Joshua Schulte convicted 2022.
- **Operation Glowing Symphony** (Nov 2016 – ongoing) — CYBERCOM/JTF-ARES counter-ISIS information-warfare disruption. FOIA-declassified.
- **IRA disruption** (Nov 2018) — CYBERCOM took the Internet Research Agency offline during US midterm voting. Officially acknowledged by Nakasone.
- **Trickbot pre-2020-election disruption** (Sep–Oct 2020) — CYBERCOM + Microsoft.
- **Hunt Forward Ukraine** (Dec 2021 – Feb 2022) — pre-invasion deployment to harden Ukrainian networks.
- **KV-Botnet / Volt Typhoon takedown** (Dec 2023 court order, announced Jan/Feb 2024) — FBI-led, court-ordered eviction of PRC malware from US SOHO routers.

## Sourcing notes (be honest)

- **Tier 1 (primary)**: whitehouse.gov, defense.gov, cybercom.mil, nsa.gov, cisa.gov, dni.gov, justice.gov press releases. All current strategies live here.
- **Tier 1 (declassified)**: National Security Archive's Cyber Vault at GWU has the FOIA'd Glowing Symphony after-actions and CMF establishment docs. Indispensable.
- **Leak archives**: Der Spiegel's Snowden archive, The Intercept's SIDtoday, WikiLeaks Vault 7 — date-stamp these as **2007–2013 snapshots**.
- **Tier 1 journalism**: David Sanger (NYT) on national-cyber strategy and Olympic Games; Ellen Nakashima (WaPo) on CYBERCOM ops; Andy Greenberg (Wired) on NotPetya and Sandworm; Kim Zetter (Zero Day blog, *Countdown to Zero Day*) on Stuxnet; Joseph Menn (WaPo/Reuters); Sean Lyngaas at CNN; Christopher Bing at Reuters; *The Record* (Recorded Future) for hunt-forward and DOJ takedowns; *CyberScoop*, *DefenseScoop*, *Breaking Defense* on policy.
- **Think tanks**: Lawfare (best legal/doctrine commentary), CNAS, CSIS, RAND, Atlantic Council DFRLab, FDD CCTI, Hoover (Chesney on Title 10/50).

## What is *not* in this dossier — and why

- We do **not** assume that Snowden- or Shadow-Brokers-era capabilities reflect current TAO/CCI tradecraft. Treat those as historic technical baselines.
- We do **not** speculate on rumored ops that lack at least journalistic attribution from a tier-1 outlet with multiple sources. (E.g., the 2019 NYT "implants in Russian grid" report is included as journalistically reported; analyst-blog speculations are not.)
- Five Eyes partner operations (GCHQ, ASD, CSE, GCSB) are included only where US involvement is documented; standalone GCHQ ops (e.g., the bulk of Operation Socialist's tradecraft) are referenced as context, not US events.
