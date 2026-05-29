# Attribution methodology and AUSPEX confidence scheme

Attribution — naming the human or organization behind a cyber operation — is the load-bearing inference in everything AUSPEX does. This document specifies how it's done in practice across the field, where the practice fails, and what convention AUSPEX should adopt.

## (a) The three-tier model

In working practice, attribution comes from three sources with different evidentiary weights:

1. **Government attribution.** A state's intelligence community publicly names another state or its agents. The signal is strong because the attributor (typically) has access to non-public intelligence (signals collection, HUMINT, partner-service liaison) and because the legal/political consequences of being wrong are severe. Examples: the US Treasury naming "DPRK's RGB Bureau 121" in OFAC designations; the UK FCDO attributing the SolarWinds campaign to the SVR (Apr 2021); DOJ indictments of named PLA / GRU / MSS / RGB officers (Mueller's GRU indictment, the APT41 Chengdu 404 indictment, the Hafnium / Silk Typhoon indictment of July 2025, the APT31 indictment of March 2024). When five or more Five-Eyes governments co-sign an advisory (as for Volt Typhoon), the inference is the strongest the public record supports.
2. **Intelligence-vendor attribution.** Mandiant, Microsoft MSTIC, CrowdStrike, Recorded Future Insikt, Volexity, Kaspersky GReAT, etc. publish technical assessments. Vendors see victim telemetry, malware code lineage, infrastructure overlaps, and operator OPSEC failures — sometimes earlier and at greater depth than governments. They lack subpoena power and SIGINT, so they typically attribute by **cluster** (UNC2452, APT41) rather than by individual or institution, and they degrade gracefully to "China-nexus" / "Russia-aligned" when the unit-level signal is thin.
3. **Open-source attribution.** Researchers, journalists, and OSINT collectives (Citizen Lab, DFRLab, ZachXBT for crypto-theft, the SSU's Gamaredon doxxings, the i-Soon leak analyses by Recorded Future and Krebs). Coverage is uneven, but the long tail of open work has produced some of the highest-confidence attributions in the field — including the GRU Unit 26165 OPSEC-failure reporting around the Bellingcat-corroborated names.

These tiers are **complementary, not redundant.** Government attributions are politically expensive and lag; vendor reports are continuous; open source surfaces things the other two will not publicly admit. A robust attribution typically appears at *two or three* tiers within months of each other.

## (b) Evidence frameworks

Two analytic frameworks dominate the discipline and AUSPEX should explicitly map every event to one or both:

- **The Diamond Model of Intrusion Analysis** (Caltagirone, Pendergast, Betz, 2013): each event has four vertices — *adversary*, *capability*, *infrastructure*, *victim* — linked by *meta-features* (timestamp, phase, result). Attribution is the assertion of an *adversary* identity supported by edges to other diamonds via shared capability or infrastructure. AUSPEX should treat infrastructure pivots (TLS-cert overlaps, passive-DNS, registrant reuse) and capability lineage (compiler artifacts, code reuse, custom RAT families) as the two evidentiary spines.
- **Lockheed-Martin Kill Chain** (Hutchins, Cloppert, Amin, 2011): seven phases — reconnaissance, weaponization, delivery, exploit, install, C2, actions-on-objectives — useful for *staging* attribution. A single intrusion can have **different attributable parties per phase** (e.g., an access broker for initial access, a state operator for hands-on-keyboard, a different actor for the final exfil). Recording the kill-chain phase against an attribution is essential.

## (c) The limits of attribution

Four failure modes are well documented and AUSPEX must explicitly model them:

1. **False flags.** The canonical case is **Olympic Destroyer** (Pyeongchang, Feb 2018): the malware contained crafted artifacts — a Lazarus-style "rich header," fake Korean-language strings, infrastructure overlap with Chinese-attributed activity — designed to mislead. Kaspersky's analysis demonstrated the false flag; Sandworm (GRU 74455) was eventually charged in the Oct 2020 DOJ indictment. Every fast attribution to Olympic Destroyer was wrong. **Implication for AUSPEX**: never lock in an attribution within 72 hours of an incident absent government confirmation; explicitly track "alternative-hypotheses considered."
2. **Criminal / state blurring.** The **Conti leaks** (Feb 2022) showed an ecrime group with internal Slack-equivalent discussions of FSB liaison, sanctions awareness, and tasking-shaped pressure to support state objectives in Ukraine. Treasury and FCDO subsequent sanctions designated specific Trickbot/Conti members as Russian-state-linked. APT41 is the canonical Chinese hybrid: state-tasked espionage by day, ecrime by night, sometimes within the same intrusion. AUSPEX should not maintain a strict state-vs-criminal dichotomy; instead, model **motivation per operation**, not per actor.
3. **Contractor outsourcing.** The **i-Soon leak** (Feb 2024) and the subsequent DOJ indictment (Mar 2025) of 12 Chinese contract hackers and MPS/MSS officers exposed the entire vendor ecosystem behind groups like Volt Typhoon, Hafnium, APT31 (Wuhan Xiaoruizhi), APT40 (Hainan Xiandun), APT10 (Tianjin Huaying Haitai), and APT41 (Chengdu 404). The operational implication: many "Chinese state" intrusion sets are private contractors selling capability to multiple MSS bureaus, MPS bureaus, and PLA units, **with overlapping personnel and code reuse across what vendors track as distinct clusters.** Russia's contractor ecosystem (Positive Technologies for SVR, Vulkan for GRU per the 2023 Vulkan Files) follows a similar pattern. AUSPEX must allow N-to-M relationships between actor clusters and *sponsoring* state organs.
4. **Multi-stage operations.** As noted above (kill-chain framing), different stages have different attributions. Initial Access Brokers (IABs) frequently sell access to ransomware operators that may be different again from data-extortion specialists. Pre-positioning ops (Volt Typhoon) and intelligence-collection ops (APT29) can share initial vectors but diverge by stage. Per-event attribution should record stage-specific confidence.

## (d) Confidence-language norms (ICD-203)

The US IC has codified analytic confidence in **ODNI Intelligence Community Directive 203** (issued 2007, revised Jan 2015). ICD-203 distinguishes two separate dimensions analysts must report:

- **Likelihood** of the judgment: a probabilistic estimate ("almost no chance" → "almost certain"), with a 7-point standard scale.
- **Confidence** in the judgment: a separate scale ("high / moderate / low"), reflecting the strength of the underlying source base and the analytic logic — *not* the probability.

The critical insight: **confidence and likelihood are independent.** You can be highly confident that an outcome is *unlikely* (a well-sourced negative). You can be low-confidence that an outcome is *likely* (a thin-sourced positive). The two scales should never be conflated.

- **High confidence**: high-quality, multi-source, corroborating information; little or no ambiguity; sound analytic logic; few or no plausible alternative judgments.
- **Moderate confidence**: credibly sourced and plausible but not at "high"; alternatives exist but evidence favors the named judgment.
- **Low confidence**: information is scant, questionable, fragmented; difficulty corroborating; significant gaps; multiple plausible interpretations.

Vendor practice loosely mirrors this. Mandiant, Microsoft, and CISA all use "high / medium-or-moderate / low" confidence in publicly released attribution assessments, and NSA/CISA joint advisories explicitly invoke the ICD-203 framing.

## (e) Proposed AUSPEX confidence scheme

AUSPEX records two attributions per event: **actor attribution** (which cluster) and **doctrine linkage** (which strategic goal). Each carries its own confidence. We adopt a two-dimensional scheme reconciling IC and vendor practice with the schema's existing labels.

### Actor-attribution confidence (mapped to schema field `attribution confidence`)

| AUSPEX label | ICD-203 equivalent | Practical criterion |
|---|---|---|
| `high` | High confidence | Government attribution (indictment, sanctions, joint advisory) **or** at least two independent tier-1 vendors converge on the same cluster with shared technical pivots. |
| `medium` | Moderate confidence | One tier-1 vendor with detailed technical reporting, or a national CERT attribution, with no contradicting public reporting. |
| `low` | Low confidence | Single-source vendor "low-confidence" assessment, OSINT, leak-site claim, or "China-nexus / Russia-aligned" regional attribution without cluster specificity. |

### Doctrine-linkage confidence (mapped to schema field `linkage confidence`)

The schema already specifies three values; we map them to evidentiary criteria:

| AUSPEX label | Criterion |
|---|---|
| `attested` | The attributing government / vendor *explicitly* states the strategic objective. Example: OFAC sanctions text citing "support to DPRK WMD program" for crypto-theft; CISA advisory naming "pre-positioning for disruption of critical infrastructure" for Volt Typhoon. |
| `strongly inferred` | Target sector + timing + actor's known mission align with a named doctrine pillar with no plausible alternative explanation. Example: APT41 stealing source code from a US semiconductor firm aligns directly with Made in China 2025 self-sufficiency pillars; no competing explanation. |
| `plausible` | The event is consistent with the doctrine pillar but other motivations (financial, opportunistic, tasking-of-convenience) are also consistent. Flag for analyst review. |

### Operating rules

1. **Both dimensions are required** for any attested event entry.
2. **False-flag check**: any `high` attribution within 30 days of incident discovery must record at least one explicitly-considered alternative hypothesis.
3. **Re-attribution audit**: when a public attribution upgrades (e.g., vendor → government), update the event entry and preserve the prior assessment with a timestamp. The history is itself evidence.
4. **Stage-specific attribution** is permitted: an event may carry per-stage attribution rows (initial access vs. hands-on-keyboard vs. exfil) where stages have distinct actors.
5. **Vendor source of record**: cite the *originating* vendor / government for the attribution; do not cite secondary reporting.

## Reference sources

- ODNI ICD-203 (Analytic Standards), Jan 2015: https://www.dni.gov/files/documents/ICD/ICD-203.pdf
- Caltagirone, Pendergast, Betz, "The Diamond Model of Intrusion Analysis," CCIWG 2013.
- Hutchins, Cloppert, Amin, "Intelligence-Driven Computer Network Defense" (Lockheed-Martin Kill Chain), 2011.
- Kaspersky, "OlympicDestroyer is here to trick the industry," GReAT, 2018.
- Robert M. Lee, "The Problem of Attribution in ICS" and related Dragos writings on the costs of premature attribution.
- NSA/CISA/FBI/NCSC joint advisory AA24-038A (Volt Typhoon), Feb 2024 — exemplar of ICD-203-style confidence language in a joint product.
- DOJ Press Release, "Justice Department Charges 12 Chinese Contract Hackers" (i-Soon), Mar 2025.
- Treasury OFAC press releases on CYBER2 designations — exemplar of "attested" doctrine linkage language.
