# Ongoing cyber-event source catalog

Sources for continuous AUSPEX ingest. Columns: **Name | URL | Cadence | Format | Content type | Ingest difficulty**. "Difficulty" is a one-line ops note.

Legend for *Format*: RSS/Atom = simple syndication; JSON = REST endpoint; STIX = STIX 2.x bundle (TAXII or static); CSV/XML = bulk file; HTML = scrape-only; PDF = scrape + OCR/parse.

---

## 1. Government / IC — primary attribution sources

| Name | URL | Cadence | Format | Content type | Ingest difficulty |
|---|---|---|---|---|---|
| CISA Alerts & Advisories (all) | https://www.cisa.gov/news-events/cybersecurity-advisories ; RSS: https://www.cisa.gov/cybersecurity-advisories/all.xml | Multiple per week | RSS + HTML | Advisories incl. AA/AR/MAR series, joint advisories | Easy. RSS is canonical; full body lives on HTML page. Parse HTML for indicators / actor names. |
| CISA ICS Advisories | https://www.cisa.gov/cybersecurity-advisories/ics-advisories.xml | Several/week | RSS | ICS/OT vendor advisories | Easy. Same shape as above. |
| CISA Known Exploited Vulnerabilities (KEV) | JSON: https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json ; CSV mirror at https://github.com/cisagov/kev-data | Weekday updates | JSON / CSV | CVE catalog with date-added, due-date, ransomware-use flag | Trivial. Stable schema. CC0 mirror on GitHub. |
| CISA Automated Indicator Sharing (AIS) | https://www.cisa.gov/topics/cyber-threats-and-advisories/information-sharing/automated-indicator-sharing-ais | Real-time | STIX/TAXII | IOC stream | Hard. Requires onboarding agreement and TAXII client. Gated. |
| FBI IC3 PSAs / Industry Alerts | https://www.ic3.gov/PSA ; https://www.ic3.gov/CSA | Sporadic (weekly-ish) | HTML | Public service announcements; cyber annual report | Medium. HTML only, no RSS. Scrape index. |
| FBI Flash / PIN reports | https://www.ic3.gov/CSA (public summaries) ; TLP:GREEN/AMBER via InfraGard | As released | PDF + TLP-marked | TLP-marked tactical advisories | Hard. Most are TLP-restricted; only declassified versions are public. |
| DOJ Press Releases (all) | https://www.justice.gov/news/press-releases ; RSS: https://www.justice.gov/feeds/justice-news.xml | Daily | RSS + HTML | Indictments, takedowns, sanctions | Easy. Tag by NSD/criminal-division to narrow to cyber. |
| DOJ National Security Division News | https://www.justice.gov/nsd/press-room | Weekly | HTML | Espionage & nation-state cyber indictments (NatSec Cyber section, est. 2023) | Easy. Subset of DOJ feed. |
| DOJ U.S. Attorneys press releases | https://www.justice.gov/usao/pressreleases (RSS available) | Daily | RSS | District-level indictments incl. cyber | Medium. High volume; filter by keywords. |
| Treasury OFAC Recent Actions | https://ofac.treasury.gov/recent-actions ; RSS at https://ofac.treasury.gov/ofac-recent-actions.xml | Daily | RSS + HTML | Sanctions designations, press releases | Easy. RSS announces; details on press-release page. |
| Treasury OFAC SDN list | https://www.treasury.gov/ofac/downloads/sdn.xml ; advanced: https://www.treasury.gov/ofac/downloads/sanctions/1.0/sdn_advanced.xml ; CSV: https://www.treasury.gov/ofac/downloads/sdn.csv | Updated on action | XML + CSV + JSON | Full sanctions list incl. CYBER2 program designations | Easy. sdn_advanced.xml is the recommended schema. Filter program=CYBER/CYBER2. |
| Treasury OFAC Sanctions List Service | https://ofac.treasury.gov/sanctions-list-service | Daily | API / bulk | Modern API for all OFAC lists | Easy. Replaces ad hoc downloads. |
| ODNI Annual Threat Assessment | https://www.dni.gov/index.php/newsroom/reports-publications | Annual (Feb-Mar) | PDF | IC consensus assessment | Medium. PDF parse; one big drop/year. |
| NSA Cybersecurity Advisories | https://www.nsa.gov/Press-Room/Cybersecurity-Advisories-Guidance/ | Monthly-ish | HTML + PDF | Joint advisories (often co-signed with CISA / Five Eyes) | Medium. No RSS; scrape index. Overlaps CISA AA-series. |
| UK NCSC Advisories | https://www.ncsc.gov.uk/section/keep-up-to-date/reports-advisories ; RSS at https://www.ncsc.gov.uk/api/1/services/v1/report-rss-feed.xml | Weekly | RSS | UK government attributions, advisories, joint statements | Easy. RSS available. |
| CCCS Canada Alerts | https://www.cyber.gc.ca/en/alerts-advisories ; RSS available | Weekly | RSS | Canadian Centre for Cyber Security advisories | Easy. |
| ACSC Australia Alerts | https://www.cyber.gov.au/about-us/view-all-content/alerts-and-advisories ; RSS at https://www.cyber.gov.au/rss/news.xml | Weekly | RSS | Aussie govt cyber advisories | Easy. |
| BSI Germany | https://www.bsi.bund.de/SiteGlobals/Functions/RSSFeed/RSSNewsfeed/RSSNewsfeed_WID.xml | Weekly | RSS (DE) | German federal IT-security advisories | Medium. German-language; translate at parse. |
| ANSSI France (CERT-FR) | https://www.cert.ssi.gouv.fr/feed/ ; alerts: https://www.cert.ssi.gouv.fr/alerte/feed/ | Daily | RSS (FR) | French CERT advisories | Medium. French-language. |
| JPCERT/CC | https://www.jpcert.or.jp/english/rss/jpcert-en.rdf ; Blog: https://blogs.jpcert.or.jp/en/atom.xml | Weekly | RSS / Atom (EN) | Japanese CERT advisories, regional APT research | Easy. English feeds maintained. |
| KrCERT/CC (KISA, Korea) | https://www.krcert.or.kr/data/secNoticeList.do | Weekly | HTML (KR) | Korean CERT | Hard. Korean-language, no RSS. |
| Israel INCD | https://www.gov.il/en/departments/news/?OfficeId=cyber-government | Weekly | HTML | Israeli national cyber directorate advisories | Medium. |
| Singapore CSA | https://www.csa.gov.sg/alerts-advisories | Monthly | HTML | Singapore CSA advisories | Easy. |
| ENISA Threat Landscape | https://www.enisa.europa.eu/topics/cyber-threats/threats-and-trends | Annual + sporadic | PDF | EU consolidated threat landscape | Medium. Big-bang reports; not real-time. |
| Five Eyes joint advisories | Co-published via CISA AA-series + national CERTs | As released | RSS (via CISA) | Cross-attributed advisories (e.g., Volt Typhoon, Salt Typhoon) | Easy via CISA. |

---

## 2. UN / multilateral

| Name | URL | Cadence | Format | Content type | Ingest difficulty |
|---|---|---|---|---|---|
| UN 1718 (DPRK) Panel of Experts archive | https://www.un.org/securitycouncil/sanctions/1718/panel_experts/reports | Mandate ended **30 Apr 2024** (Russia veto, 28 Mar 2024) | PDF | Historical reports, gold standard for DPRK sanctions evasion incl. cyber-theft | Medium. Static archive only — flag as no-longer-updated. The final 2024 mid-term report is the last. |
| UN GGE on cyber (reports archive) | https://www.un.org/disarmament/group-of-governmental-experts/ | Cycles; latest 2021 final | PDF | Consensus reports on responsible state behavior | Low cadence; doctrine/norms reference, not event feed. |
| UN OEWG on cyber | https://meetings.unoda.org/open-ended-working-group-on-information-and-communication-technologies-2021 | Quarterly sessions | PDF + webcast | Negotiating texts, national position papers | Medium. Useful for state-doctrine signaling. |

---

## 3. Major vendor research blogs

All listed are free RSS unless noted. Latency is usually < 1 day; some embargoes for coordinated disclosures.

| Name | URL | Cadence | Format | Content type | Ingest difficulty |
|---|---|---|---|---|---|
| Mandiant / Google Threat Intelligence | https://cloud.google.com/blog/topics/threat-intelligence/rss | 2-5/week | RSS | Investigative reports; UNC/APT tracking | Easy. Note: rebranded under GTIG (Google Threat Intelligence Group) in 2024. |
| Microsoft Security Blog | https://www.microsoft.com/en-us/security/blog/feed/ | Multiple/week | RSS | MSTIC reports under weather taxonomy | Easy. |
| Microsoft Threat Intelligence (X/Twitter) | @MsftSecIntel | Daily | API/scrape | Early-warning indicator drops | Medium. Need API. |
| CrowdStrike Falcon blog | https://www.crowdstrike.com/blog/feed/ | Weekly | RSS | Adversary reports under Panda/Bear/Kitten/Chollima taxonomy; annual GTR | Easy. |
| Recorded Future Insikt Group | https://www.recordedfuture.com/feed (research index) | Weekly | RSS + reports gated by login for full PDFs | Strategic research; named actors (RedMike, BlueDelta…) | Medium. Headlines free; deep PDFs gated. |
| Cisco Talos | https://blog.talosintelligence.com/feeds/posts/default | 2-3/week | RSS (Atom) | Malware analysis, intrusion sets | Easy. |
| Kaspersky GReAT (Securelist) | https://securelist.com/feed/ | Weekly | RSS | Long-form research, APT quarterly | Easy. Geopolitical caveat — but technically strong. |
| ESET Research (WeLiveSecurity) | https://www.welivesecurity.com/en/rss/feed/ | Several/week | RSS | EU-leaning APT coverage (Gamaredon, Sandworm) | Easy. |
| SentinelLabs | https://www.sentinelone.com/labs/feed/ | Weekly | RSS | Original research; strong on DPRK, China | Easy. |
| Volexity | https://www.volexity.com/blog/feed/ | Monthly | RSS | Deep IR investigations; APT29, China APT | Easy. Low volume, very high signal. |
| Palo Alto Unit 42 | https://unit42.paloaltonetworks.com/feed/ | Several/week | RSS | Threat research (Taurus naming) | Easy. |
| Proofpoint Threat Insight | https://www.proofpoint.com/us/threat-insight/rss.xml | Weekly | RSS | TA-numbered actor tracking, esp. crimeware/Iran | Easy. |
| Trend Micro Research / ZDI | https://www.trendmicro.com/en_us/research/rss.xml ; ZDI: https://www.zerodayinitiative.com/rss/published/ | Weekly | RSS | Earth-* naming for APTs; zero-day advisories | Easy. |
| Group-IB | https://www.group-ib.com/blog/feed/ | Weekly | RSS | Crime + nation-state | Easy. Russian-founded; relocated to Singapore. |
| Sekoia.io | https://blog.sekoia.io/feed/ | Weekly | RSS | EU vendor; APT43, OilRig coverage | Easy. |
| Dragos (ICS) | https://www.dragos.com/blog/feed/ | Monthly | RSS | ICS/OT-focused actor naming (VOLTZITE, ELECTRUM, BAUXITE) | Easy. Gated annual YIR report. |
| Claroty Team82 | https://claroty.com/team82/blog (RSS via /feed) | Monthly | RSS | OT/ICS vulnerability research | Easy. |
| Secureworks CTU (now Sophos) | https://www.secureworks.com/research (BRONZE/IRON/GOLD naming) | Monthly | HTML | Threat profiles | Medium. Wind-down following Sophos acquisition (Feb 2025) — flag for schema drift. |

---

## 4. Independent / open

| Name | URL | Cadence | Format | Content type | Ingest difficulty |
|---|---|---|---|---|---|
| CSIS Significant Cyber Incidents | https://www.csis.org/programs/strategic-technologies-program/significant-cyber-incidents ; download PDF current version: https://csis-website-prod.s3.amazonaws.com/s3fs-public/...significant_cyber_incidents.pdf | Monthly | PDF (no CSV officially) | Curated incident timeline | Medium. PDF parsing needed; ~one chronological list per release. UniBo academic mirror has historical XLS. **Flag: no official CSV.** |
| MITRE ATT&CK | STIX: https://github.com/mitre-attack/attack-stix-data ; web: https://attack.mitre.org/groups/ | Bi-annual + minor releases (latest v19, Apr 2026) | STIX 2.1 JSON | Canonical actor taxonomy + aliases | Easy. STIX bundle is the source of truth for naming cross-walks. |
| MITRE/CTI (legacy STIX 2.0) | https://github.com/mitre/cti | Frozen/legacy | STIX 2.0 | Legacy ATT&CK | Easy but deprecated; prefer attack-stix-data. |
| MISP threat-sharing | https://www.misp-project.org/feeds/ | Continuous | MISP JSON | Community indicator feeds | Medium. Self-hosted instance; warninglists & galaxy useful for alias maps. |
| MISP-galaxy (actor mappings) | https://github.com/MISP/misp-galaxy | Continuous | JSON | Threat-actor cluster JSON incl. synonyms | Easy. Best machine-readable alias source after MITRE. |
| OpenCTI public datasets | https://github.com/OpenCTI-Platform/connectors | Continuous | STIX | Connector-driven; integrates many sources | Medium. Run own instance. |
| AlienVault OTX | https://otx.alienvault.com/api ; pulses RSS via per-user | Continuous | JSON API | Community pulses; uneven quality | Easy API; medium signal. |
| abuse.ch (URLhaus, MalwareBazaar, ThreatFox, Feodo) | https://urlhaus.abuse.ch/api/ ; https://bazaar.abuse.ch/api/ ; https://threatfox.abuse.ch/api/ ; Feodo: https://feodotracker.abuse.ch/downloads/ipblocklist.json | Continuous | JSON / CSV / MISP | IOC feeds; ThreatFox tags by actor | Easy. CC0. Best indicator firehose, free. (Now Spamhaus-managed but feeds remain free.) |
| Ransomwhe.re | https://api.ransomwhe.re/export | Continuous | JSON | Ransom-payment blockchain tracking | Easy. |
| Ransomwatch / ransomware.live | https://www.ransomwatch.io/ ; https://api.ransomware.live/ | Continuous | JSON | Leak-site claim scraping | Easy. Note: ransomwatch.io scrape-only; ransomware.live exposes JSON. |
| Threat-actor naming compendia | MISP-galaxy clusters (above); Florian Roth's threat actor encyclopedia: https://apt.etda.or.th/ ; Malpedia: https://malpedia.caad.fkie.fraunhofer.de/ | Continuous | HTML + JSON | Cross-vendor name maps | Easy. Malpedia API is best non-MISP source. |

---

## 5. Journalism

| Name | URL | Cadence | Format | Content type | Ingest difficulty |
|---|---|---|---|---|---|
| The Record (Recorded Future News) | https://therecord.media/feed | Daily | RSS | Breaking cyber news, gov leaks | Easy. Tier-1 for ongoing event surface. |
| CyberScoop | https://cyberscoop.com/feed/ | Daily | RSS | Federal cyber beat | Easy. |
| Risky Business newsletter + podcast | https://risky.biz/feeds/ | Weekly | RSS | Analytical roundup | Easy. |
| Krebs on Security | https://krebsonsecurity.com/feed/ | 2-4/week | RSS | Investigative original reporting | Easy. |
| Wired (Greenberg, Newman) | https://www.wired.com/feed/category/security/latest/rss | Daily | RSS | Long-form nation-state reporting | Easy. |
| NYT cyber (Sanger et al) | https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml | Daily | RSS | National-security cyber | Easy. Paywall on full body. |
| WaPo (Nakashima) | https://www.washingtonpost.com/arc/outboundfeeds/rss/category/national-security/ | Daily | RSS | IC and cyber beat | Easy. Paywall on body. |
| Reuters (Bing, Satter) | https://www.reuters.com/technology/cybersecurity/ | Daily | RSS via aggregator | Wire reporting | Easy. |
| Bloomberg cyber | https://www.bloomberg.com/cybersecurity | Daily | RSS via aggregator | Wire + investigations | Easy. Paywall. |
| Lawfare | https://www.lawfaremedia.org/rss | Weekly | RSS | Legal analysis, indictments | Easy. |
| Just Security | https://www.justsecurity.org/feed/ | Weekly | RSS | Legal/policy commentary | Easy. |

---

## 6. Crypto / financial attribution

| Name | URL | Cadence | Format | Content type | Ingest difficulty |
|---|---|---|---|---|---|
| Chainalysis | https://www.chainalysis.com/blog/feed/ ; annual Crypto Crime Report | Weekly + annual | RSS + PDF | DPRK/sanctions/ransomware tracing | Easy. Annual report is the strategic anchor. |
| TRM Labs | https://www.trmlabs.com/insights (RSS) | Weekly | RSS + reports | Same domain; complementary attributions | Easy. |
| Elliptic | https://www.elliptic.co/blog (RSS) | Weekly | RSS | UK-based; ransomware payments, OFAC compliance | Easy. |
| Inca Digital | https://incadigital.com/insights | Monthly | HTML | Forensic crypto, DPRK-focused work | Medium. |
| ZachXBT | https://x.com/zachxbt | Daily | Tweet stream | Open-source crypto-theft attribution incl. DPRK ops | Medium. Twitter API constraints. |

---

## 7. Academic / think-tank

| Name | URL | Cadence | Format | Content type | Ingest difficulty |
|---|---|---|---|---|---|
| ASPI International Cyber Policy Centre | https://www.aspi.org.au/program/international-cyber-policy-centre | Monthly | PDF + HTML | China-focused (esp. influence, supply chain) | Medium. |
| RUSI | https://www.rusi.org/publications | Monthly | PDF | UK think-tank; Russia, ransomware | Medium. |
| CEPA | https://cepa.org/topics/cybersecurity/ | Weekly | HTML | Transatlantic policy | Easy. |
| CNAS | https://www.cnas.org/topics/technology-and-national-security | Monthly | PDF | US grand strategy, including DPRK cyber | Medium. |
| Atlantic Council DFRLab / CSI | https://dfrlab.org/ ; https://www.atlanticcouncil.org/programs/scowcroft-center-for-strategy-and-security/cyber-statecraft-initiative/ | Weekly | RSS | Influence-ops; cyber statecraft | Easy. |
| FDD | https://www.fdd.org/topics/cyber/ | Weekly | RSS | Sanctions-focused; Iran, DPRK | Easy. |
| ISW (Critical Threats) | https://www.understandingwar.org/ ; https://www.criticalthreats.org/ | Daily | RSS | Iran/Russia situational reports | Easy. |
| ECFR | https://ecfr.eu/topic/cyber/ | Monthly | HTML | EU policy lens | Easy. |
| Stanford Internet Observatory (now CIO/Stanford) | https://cyber.fsi.stanford.edu/ | Monthly | PDF | Influence operations | Medium. Note SIO wound down 2024; successor projects continue. |
| Carnegie Endowment cyber program | https://carnegieendowment.org/programs/technology/ | Monthly | HTML | Norms + state behavior | Easy. |

---

## Notes on gated / unstable feeds (flag these for ops)

- **CISA AIS / TAXII**: requires signed connection agreement; not usable for an MVP without legal review.
- **FBI Flash / PIN**: TLP-restricted; only the redacted public versions appear via IC3. Plan partnerships (e.g., InfraGard) if higher fidelity is needed.
- **Recorded Future Insikt full PDFs**: gated by paid login; the public blog summaries are free.
- **Bloomberg / NYT / WaPo body**: paywalled; headlines via RSS are free, full text needs a subscription or licensed feed.
- **UN 1718 Panel of Experts**: **archive only**; mandate ended 30 Apr 2024 after Russian veto. No replacement mechanism yet. Treat as historical reference.
- **Secureworks CTU**: post-Sophos acquisition (Feb 2025), the BRONZE/IRON/GOLD naming taxonomy may be sunset or merged into Sophos X-Ops — schema drift expected.
- **MISP-galaxy / MITRE ATT&CK**: stable but versioned; pin to a release tag and re-diff on each update rather than tracking master.
- **OFAC SDN advanced XML**: schema is stable but listings get appended/removed without notice; diff weekly against last known-good.
- **CSIS incidents PDF**: no official CSV or JSON — schema is implicitly defined by the document. Parse with care; the University of Bologna mirror has historical structured data but is not maintained by CSIS.
