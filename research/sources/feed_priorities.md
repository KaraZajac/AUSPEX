# MVP feed-ingest priorities

Ranking criteria, in order: (a) high signal-to-noise for actor-named cyber events; (b) machine-readable with stable schema; (c) reliably free and persistent; (d) breadth of adversary coverage. A feed scoring high on all four ranks above one strong on three.

## Tier 1 — ingest on day one

1. **CISA Cybersecurity Advisories RSS** (`https://www.cisa.gov/cybersecurity-advisories/all.xml`). Every AA-series and joint Five-Eyes advisory passes through here. Free, stable, RSS, named actors with technical detail. The single highest-yield feed in the catalog.
2. **CISA KEV catalog** (`https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`). JSON, schema is stable, updated weekday afternoons, includes the `knownRansomwareCampaignUse` flag and CISA-curated CVE→threat-actor links via cross-references in their advisories. CC0-mirror on GitHub for redundancy.
3. **Treasury OFAC** — both the **Recent Actions RSS** (`https://ofac.treasury.gov/ofac-recent-actions.xml`) and the **SDN advanced XML** (`https://www.treasury.gov/ofac/downloads/sanctions/1.0/sdn_advanced.xml`). The press releases are where doctrine linkage is "attested" in the AUSPEX confidence sense; the SDN file is the canonical entity list. Filter program code for CYBER, CYBER2, DPRK, RUSSIA-EO14024, IRAN-EO13606, etc.
4. **DOJ press releases RSS** (`https://www.justice.gov/feeds/justice-news.xml`). Indictments and takedowns are the highest-confidence public attributions available; the NSD/NatSec Cyber section is the sub-stream of interest. Volume is high — keyword-filter at ingest (hack, intrusion, ransomware, computer fraud, FARA-cyber).
5. **MITRE ATT&CK STIX** (`https://github.com/mitre-attack/attack-stix-data`). Not an event feed — it's the **schema spine** for actor identities. Pin to release tag; re-diff on each MITRE release (bi-annual). Provides the canonical group IDs and authoritative alias lists that everything else hangs off.
6. **CSIS Significant Cyber Incidents** (monthly PDF). The closest thing to a single curated event timeline maintained by a tier-1 think tank. No CSV, so build a PDF→JSON parser once and amortize. High signal, low volume, broad geographic coverage.
7. **Microsoft Security Blog RSS** (`https://www.microsoft.com/en-us/security/blog/feed/`). MSTIC publishes here under the weather taxonomy with explicit confidence language; ~weekly fresh actor reporting.
8. **Mandiant / Google Threat Intelligence blog RSS** (`https://cloud.google.com/blog/topics/threat-intelligence/rss`). The other half of the Microsoft + Mandiant duopoly for high-quality nation-state reporting; UNC# cluster work appears here first.

These eight feeds together cover every nation-state actor in scope (China, Russia, Iran, DPRK, plus US offensive ops disclosed via journalism) with at least one high-signal source, and every one of them is free, public, and machine-readable enough for a small parser team.

## Tier 2 — ingest in week two

9. **CrowdStrike Falcon blog RSS** — completes the big-three vendor coverage; introduces Panda/Bear/Kitten/Chollima naming for cross-referencing.
10. **The Record (Recorded Future News) RSS** — best ongoing journalism feed for cyber, low-latency, with original reporting not duplicated elsewhere.
11. **UK NCSC RSS** + **ACSC Australia RSS** + **CCCS Canada RSS** — Five-Eyes coverage beyond CISA; frequently the first to attribute things US declines to (the SVR SolarWinds attribution was led by NCSC).
12. **abuse.ch (URLhaus, ThreatFox, MalwareBazaar) JSON APIs** — indicator firehose, free, CC0; ThreatFox tags by actor cluster which is rare in free feeds.
13. **MISP-galaxy threat-actor JSON** — community-maintained alias graph; secondary to MITRE for canonical IDs but broader.
14. **Volexity blog RSS** + **SentinelLabs RSS** — low-volume, very high-signal vendor research, especially on China and DPRK.
15. **Talos RSS** and **Unit 42 RSS** — fill out the vendor coverage matrix.

## Tier 3 — once Tier 1-2 is humming

16. National CERTs in target languages: BSI (DE), CERT-FR (FR), JPCERT/CC (EN), KrCERT (KR). Language parsing overhead, but unique regional events not in CISA flow.
17. Kaspersky Securelist, ESET WeLiveSecurity, Trend Research — strong technical reporting but with geopolitical caveats (Kaspersky especially); cross-reference, don't rely on.
18. Chainalysis / TRM / Elliptic — for crypto-attribution events, especially DPRK theft. Annual reports anchor; blog posts catch breaking news.
19. CSIS, ASPI, RUSI, CNAS — strategic context, not event feeds; pull on doctrine update cycles, not daily.
20. UN 1718 archive — historical only; treat as a one-shot ingest of the existing PDF corpus, not an ongoing feed (mandate ended Apr 2024).

## What we explicitly defer or skip for MVP

- **CISA AIS / TAXII**: requires legal agreement, not free in the "reliably free for an MVP" sense.
- **FBI Flash / PIN**: TLP-restricted, requires InfraGard or sector-ISAC membership.
- **Recorded Future Insikt full PDFs**: paywalled; the blog teasers suffice for MVP.
- **Bloomberg / WSJ / paywalled wires**: defer until licensed.
- **Telegram and dark-web leak sites directly**: too noisy and unreliable for MVP; let ransomwatch / ransomware.live aggregate.

The MVP ingest surface is therefore eight Tier-1 sources, all free and structured, covering government attribution (CISA, OFAC, DOJ), strategic curation (CSIS, MITRE), and the two strongest vendor research streams (Microsoft, Mandiant). This is sufficient to populate a credible event timeline for every country in the AUSPEX scope from week one.
