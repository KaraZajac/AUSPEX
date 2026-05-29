# Atlas URL & Source Verification Sweep — 2026-05-26

Scope: 902 URLs checked (760 source-stub `url:` fields + 142 policy-action `official_url:` fields).
Method: HEAD then GET fallback with browser UA, then `<title>`-tag content check on the
high-risk subset (Treasury press releases, recent CISA AAs, DOJ press releases, vendor blogs).
Triggered by the `treasury/2025-02-12_irgc-io-cyber-officials` / `sb0001` incident.

Top-line numbers:
- 618 / 902 returned 200
- 122 returned 404
- 108 returned 403 (mostly bot-blocks, not data issues)
- 26 returned 000 (DNS/TLS/timeout — overwhelmingly WaPo, which 000s on `curl` regardless)
- 12 returned 401 (Reuters paywall/bot-block)
- 5 returned 400, 3 returned 5xx/410

The 200-status set was further checked for content mismatch on the 67 Treasury press-release
URLs (sm/sb/jy series). Twelve sb0001-shape mismatches surfaced — these are by far the
most important findings and are listed first below.

---

## 1. Real-URL-Wrong-Content (sb0001 shape) — HIGHEST PRIORITY

These return HTTP 200 with a real Treasury press-release page, but the page's content
is unrelated to what the atlas stub claims. This is exactly the failure mode that
caused the deletion of `treasury/2025-02-12_irgc-io-cyber-officials`. Most are Biden-era
`jy####` IDs that have been guessed without verification.

| File (atlas/...) | Claimed (in stub) | URL | What the page actually is |
|---|---|---|---|
| `policy-actions/us/2023-03-23_dprk-bankers-sb0302-sanctions.yaml` | DPRK bankers sb0302 sanctions (2023-03-23) | https://home.treasury.gov/news/press-releases/jy1356 | "Remarks by Deputy Secretary Adeyemo at the U.S. Hispanic Chamber of Commerce's 2023 Legislative Summit" |
| `policy-actions/us/2024-03-07_sb0230-dprk-fraud-network-sanctions.yaml` | DPRK fraud network sb0230 (2024-03-07) | https://home.treasury.gov/news/press-releases/jy2150 | "READOUT: Secretary Yellen's Meeting with President Boric of Chile" |
| `policy-actions/us/2024-05-16_dprk-it-workers-sanctions.yaml` | DPRK IT workers (2024-05-16) | https://home.treasury.gov/news/press-releases/jy2336 | "Statement from Secretary Yellen at the Conclusion of the Section 301 Review" |
| `policy-actions/us/2024-08-15_aria-sepehr-ayandehsazan-sanctions.yaml` | Aria Sepehr Ayandehsazan / IRGC-IO (2024-08-15) | https://home.treasury.gov/news/press-releases/jy2538 | "Treasury Adds Further Sanctions Targeting Houthi and Hizballah Trade Networks" |
| `policy-actions/us/2024-09-27_irgc-election-interference-sanctions.yaml` | IRGC election interference (2024-09-27) | https://home.treasury.gov/news/press-releases/jy2596 | "Statement by Secretary Yellen on CFTC's Final Guidance on Voluntary Carbon Markets" |
| `policy-actions/us/2024-12-30_beyondtrust-silk-typhoon-sanctions.yaml` | BeyondTrust / Silk Typhoon (2024-12-30) | https://home.treasury.gov/news/press-releases/jy2755 | "Treasury Targets Facilitators for Procuring Sensitive Navigational Systems for Iran" |
| `policy-actions/us/2025-01-03_flax-typhoon-integrity-tech-sanctions.yaml` | Flax Typhoon / Integrity Tech (2025-01-03) | https://home.treasury.gov/news/press-releases/jy2762 | "Treasury Releases Final Regulations Implementing Bipartisan Tax Reporting Requirements for Brokers of Digital Assets" |
| `sources/treasury/2023-05-16_matveev-sdn.yaml` | "Treasury Sanctions Russian National Mikhail Pavlovich Matveev for His Role in Ransomware Attacks" (2023-05-16) | https://home.treasury.gov/news/press-releases/jy1494 | "With Over 300 Sanctions, U.S. Targets Russia's Circumvention and Evasion, Military-Industrial Supply Chains, and Future Energy Revenues" |
| `sources/treasury/2023-11-30_kimsuky-sanction.yaml` | "Treasury Targets DPRK Cyber Espionage Group Kimsuky" (2023-11-30) | https://home.treasury.gov/news/press-releases/jy1924 | "READOUT: 2023 APEC Finance Ministers' Meeting" |
| `sources/treasury/2022-04-14_lazarus-axie.yaml` | "U.S. Treasury Sanctions North Korea-Linked Hackers Behind Theft of $620 Million" (2022-04-14) | https://home.treasury.gov/news/press-releases/jy0731 | "U.S. Treasury Designates Facilitators of Russian Sanctions Evasion" |
| `policy-actions/us/2022-04-14_lazarus-ronin-sdn-designation.yaml` | Lazarus / Ronin SDN (2022-04-14) | https://home.treasury.gov/news/press-releases/jy0731 | (same — "Facilitators of Russian Sanctions Evasion") |
| `policy-actions/us/2022-03-24_fsb-center-16-sanctions.yaml` | FSB Center-16 sanctions (2022-03-24) | https://home.treasury.gov/news/press-releases/jy0628 | "Treasury Sanctions Russians Bankrolling Putin and Russia-Backed Influence Actors" |

Notes:
- All twelve are in the Biden-era `jy####` range. The pattern strongly suggests these
  IDs were guessed by interpolation from the published_on date rather than copied from
  the actual Treasury page.
- Several of these have an `archive_url: web.archive.org/...` co-located, but that
  archive URL would just point at the same wrong live page, so the archive does not
  redeem the citation.
- A non-trivial number of the actual press releases DO exist at neighboring IDs — for
  example, the real Kimsuky designation is jy1938 (returns the matching title we have).
  Re-derivation should be straightforward via Treasury's press-release search.

Borderline cases (200, content is in the right topic family but a different doctrinal frame —
inspect manually before re-citing as primary):

- `sources/treasury/2018-11-28_samsam-ofac.yaml` cites sm556. sm556 page is real, titled
  "Treasury Designates Iran-Based Financial Facilitators of Malicious Cyber Activity and for the
  First Time Identifies Associated Digital Currency Addresses". That IS the SamSam OFAC release —
  matches. Listed only to confirm it is OK.
- `sources/treasury/2024-08-15_aria-sepehr-ayandehsazan.yaml` (source, not the policy-action above)
  cites jy2292; page title is "Treasury Designates Iranian Cyber Actors Targeting U.S. Companies
  and Government Agencies". Matches.

---

## 2. Broken URLs (HTTP 4xx / 5xx / 410)

### home.treasury.gov (404 — likely hallucinated press-release IDs)

Note: the `jy` prefix corresponds to Janet Yellen's tenure and was retired at the
January 2025 administration transition. Any `jy####` ID dated AFTER 2025-01-20
cannot be real. All six 404s below are post-transition jy IDs, plus one pre-transition
jy1488 that also looks invented:

- https://home.treasury.gov/news/press-releases/jy1488 — `policy-actions/us/2023-05-16_matveev-lockbit-sanctions.yaml:14` (real ID for Matveev appears to be jy1494, though that is itself mismatched per Section 1)
- https://home.treasury.gov/news/press-releases/jy2858 — `policy-actions/us/2025-07-01_aeza-group-sanctions.yaml:13`
- https://home.treasury.gov/news/press-releases/jy2872 — `policy-actions/us/2025-07-08_song-kum-hyok-andariel-sanctions.yaml:13` (source stub for the same event correctly uses sb0190)
- https://home.treasury.gov/news/press-releases/jy2940 — `policy-actions/us/2025-09-16_irgc-crypto-shadow-banking-sanctions.yaml:13`
- https://home.treasury.gov/news/press-releases/jy2989 — `policy-actions/us/2025-11-04_dprk-bankers-sb0302-sanctions.yaml:13` (source stub uses sb0302 correctly)
- https://home.treasury.gov/news/press-releases/jy3104 — `policy-actions/us/2026-01-15_zedcex-zedxion-sanctions.yaml:13`

### www.justice.gov (19 × 404)

- `https://www.justice.gov/file/1080281/download` — Mueller GRU-12 indictment PDF. Appears in both `policy-actions/us/2018-07-13_mueller-gru-twelve-indictment.yaml:14` and `sources/doj/2018-07-13_mueller-gru-twelve-indictment.yaml:7`. DOJ moved file repository; replace with the OPA press-release URL or the courtlistener mirror.
- `https://www.justice.gov/opa/pr/blacksuit-ransomware-takedown` — `policy-actions/us/2025-05-15_blacksuit-disruption.yaml:12`. Slug looks invented.
- `https://www.justice.gov/opa/pr/carr-noname-takedown` — `policy-actions/us/2025-12-15_carr-noname-actions.yaml:13`. Slug looks invented; correct slug for any future-dated DOJ release is unknowable.
- `https://www.justice.gov/opa/press-releases` — bare press-release index, not a specific cite. Appears in `sources/doj/2024-02-20_lockbit-cronos.yaml:5`, `sources/doj/2024-09-27_irgc-2024-election-indictment.yaml:5`, `sources/doj/2024-10-08_lockbit-followup.yaml:5`, `sources/doj/2025-05-15_blacksuit-disruption.yaml:5`. Four stubs with placeholder URLs.
- Eleven 404s where the slug looks correctly-formed but the page is gone (most likely moved to `/archives/opa/pr/<slug>`, e.g. `chinese-intelligence-officer-convicted-espionage-crimes-...`, `five-defendants-charged-multi-year-scheme-...`, `four-russian-government-employees-charged-two-historical-hacking-campaigns-...`, `iranian-nationals-charged-multi-year-hacking-campaign-...`, `justice-department-and-international-partners-disrupt-redline-and-meta-infostealer-malware`, `justice-department-announces-court-authorized-disruption-snake-malware-network`, `justice-department-indicts-14-north-koreans-...`, `chinese-national-pleads-guilty-conspiring-hack-us-defense-contractors-systems`, `french-national-sentenced-three-years-prison-...`, `high-level-organizer-notorious-hacking-group-fin7-sentenced-...`, `operation-magnus-redline-meta-infostealer`). Mechanical fix: prepend `/archives` to the path.

### www.federalregister.gov (11 × 404)

Pattern: URL is missing the trailing slug. Format is `/documents/YYYY/MM/DD/YYYY-NNNNN/slug`,
and the atlas stubs end at `/YYYY-NNNNN/`. The slug is required.

- 2022-21658 (`policy-actions/us/2022-10-07_october-7-semis-controls.yaml:18`, `sources/bis/2022-10-07_advanced-computing-semiconductor-controls.yaml:8`)
- 2021-07477 (`policy-actions/us/2021-04-08_supercomputing-entities.yaml:14`, `sources/bis/2021-04-08_supercomputing-entities.yaml:6`)
- 2020-18213 (`policy-actions/us/2020-08-17_huawei-fdpr-expansion.yaml:13`, `sources/bis/2020-08-17_huawei-fdpr-amendment.yaml:8`)
- 2020-28031 (`policy-actions/us/2020-12-18_smic-entity-list.yaml:13`, `sources/bis/2020-12-18_smic-entity-list.yaml:7`)
- 2023-23055 (`policy-actions/us/2023-10-17_october-7-amendments.yaml:13`, `sources/bis/2023-10-17_october-7-amendments.yaml:7`)
- 2019-10616 (`policy-actions/us/2019-05-15_huawei-entity-list.yaml:15`)

### www.whitehouse.gov (6 × 404)

White House content does not persist across administrations — the 2021 Biden URLs
were purged at the 2025 transition.
- `https://www.whitehouse.gov/briefing-room/speeches-remarks/2021/06/16/remarks-by-president-biden-in-press-conference-4/` — `sources/whitehouse/2021-06-16_geneva-summit-readout.yaml:7`
- `https://www.whitehouse.gov/briefing-room/statements-releases/2021/04/15/fact-sheet-imposing-costs-for-harmful-foreign-activities-by-the-russian-government/` — `sources/whitehouse/2021-04-15_svr-solarwinds-attribution.yaml:7`
- `https://www.whitehouse.gov/briefing-room/statements-releases/2021/06/16/u-s-russia-presidential-joint-statement-on-strategic-stability/` — `policy-actions/us/2021-06-16_geneva-summit.yaml:14`
- `https://www.whitehouse.gov/briefing-room/statements-releases/2021/07/19/the-united-states-joined-by-allies-and-partners-attributes-malicious-cyber-activity-and-irresponsible-state-behavior-to-the-peoples-republic-of-china/` — `sources/state/2021-07-19_white-house-mss-attribution.yaml:8`
- `https://www.whitehouse.gov/wp-content/uploads/2023/03/National-Cybersecurity-Strategy-2023.pdf` — `policy-actions/us/2023-03-02_national-cyber-strategy.yaml:14`
- `https://www.whitehouse.gov/wp-content/uploads/2026/03/cyber-strategy-for-america-2026.pdf` — `policy-actions/us/2026-03-06_cyber-strategy-for-america.yaml:13` (future-dated; slug appears speculative)

Recommendation: switch all WH 404s to `web.archive.org` snapshots and set `archive_url:`.

### www.state.gov (4 × 404)

- `https://www.state.gov/dprk-msmt-consolidation-2026/` — `policy-actions/us/2026-01-08_dprk-msmt-consolidation.yaml:15` (slug appears speculative)
- `https://www.state.gov/guidance-on-the-north-korean-cyber-threat/` — `sources/state/2020-04-15_dprk-cyber-threat-advisory.yaml:6`
- `https://www.state.gov/jcpoa-and-iran-status/` — `policy-actions/multilateral/2015-07-14_jcpoa-agreement.yaml:14`
- `https://www.state.gov/reward-offers-for-information-on-conti-associated-individuals/` — `sources/state/2022-05-06_rfj-conti-reward.yaml:7`

### www.ncsc.gov.uk (6 × 404)

- `https://www.ncsc.gov.uk/news/2025-07-18-authentic-antics-attribution` — `policy-actions/multilateral/2025-07-18_uk-authentic-antics-attribution.yaml:12` (slug pattern wrong; NCSC uses descriptive slugs, not `YYYY-MM-DD-`)
- `https://www.ncsc.gov.uk/news/2026-apt28-router-advisory` — `policy-actions/multilateral/2026-04-07_apt28-router-hijacking-attribution.yaml:13` (slug speculative)
- `https://www.ncsc.gov.uk/news/further-ttps-associated-with-svr-cyber-actors` — `sources/ncsc-uk/2021-05_further-ttps-svr.yaml:6`
- `https://www.ncsc.gov.uk/news/uk-and-allies-expose-china-state-affiliated-targeting-of-uk-democratic-institutions-parliamentarians` — `sources/ncsc-uk/2024-03-25_apt31-electoral-commission.yaml:7`
- `https://www.ncsc.gov.uk/news/uk-retail-cyber-incidents` — `sources/ncsc-uk/2025-05-20_scattered-spider-uk-retail.yaml:5`
- `https://www.ncsc.gov.uk/news/wannacry-attributed-north-korea` — `sources/uknscsc/2017-12-19_wannacry-attribution.yaml:5`

### www.cisa.gov (2 × 404)

- `https://www.cisa.gov/news-events/cymbersecurity-advisories/aa25-239a` — `sources/cisa/2025-08-27_aa25-239a-salt-typhoon.yaml:7`. **Typo** — "cymbersecurity-advisories" should be "cybersecurity-advisories". Mechanical fix.
- `https://www.cisa.gov/sites/default/files/2024-04/CSRB_Review_of_the_Summer_2023_MEO_Intrusion_Final_Report_508c.pdf` — `sources/csrb/2024-04_storm-0558-review.yaml:7`. CISA renamed the file when it moved to the new CSRB page.

### www.proofpoint.com (3 × 404)

- `https://www.proofpoint.com/us/blog/threat-insight/ta416-goes-ground-and-returns-updated-plugx-malware-loader-koreaplug` — `sources/proofpoint/2022_mustang-panda-eu-vatican.yaml:7`
- `https://www.proofpoint.com/us/blog/threat-insight/ta416-mustang-panda-eu-nato-2025` — `sources/proofpoint/2025-09_mustang-panda-eu-nato.yaml:5`. Slug pattern with year-suffix is atypical for Proofpoint; suspect speculative.
- `https://www.proofpoint.com/us/blog/threat-insight/ta416-mustang-panda-middle-east-2026` — `sources/proofpoint/2026-03_mustang-panda-mena.yaml:5`. Same shape; suspect speculative.

### Other 4xx (selected high-signal)

- `https://www.justice.gov/opa/pr/` — `sources/doj/2024-11-04_moucka-snowflake-indictment.yaml:8`. Bare placeholder (no slug). Redirects to /news/press-releases (HTTP 200) so was not caught above by 404, but is a placeholder URL that needs the real cite.
- `https://www.lawfaremedia.org/article/national-cybersecurity-strategy` (and two other Lawfare articles) — `sources/lawfare/2023_ncs-2023-analysis.yaml:6`. Lawfare slugs are typically multi-word; check.
- `https://www.mandiant.com/resources/blog/ghostwriter-unc1151-microbackdoor` — `sources/mandiant/2021-11-16_unc1151-belarus-link.yaml:5`. Mandiant rebranded to cloud.google.com/security; this is the old URL pattern.
- `https://www.microsoft.com/en-us/security/blog/2024/03/05/marbled-dust/` — `sources/msft/2024-03-05_marbled-dust-tradecraft.yaml:5`. Microsoft renames Marbled-Dust posts; slug needs verification.
- `https://www.sentinelone.com/labs/capratube-...` and `.../caprarat-android-implant...` — both `sources/sentinellabs/...`. URL pattern reorganized.
- `https://services.google.com/fh/files/misc/apt38-report.pdf` and `.../apt43-report.pdf` — both Mandiant report PDFs that Google moved. `sources/mandiant/2018-10-03_apt38-report.yaml`, `sources/mandiant/2023-03-28_apt43-report.yaml`.
- `https://www.dragos.com/blog/frostygoop-ics-malware/` — `sources/dragos/2024-07_frostygoop-ukrainian-heating.yaml:6`. Dragos slug renamed.
- `https://www.dragos.com/blog/volt-typhoon-lelwd-case-study/` — `sources/dragos/2025-03_lelwd-volt-typhoon.yaml:7`. Slug verification needed.
- `https://www.eurojust.europa.eu/news/international-action-disrupts-redline-and-meta-infostealers` — `sources/eurojust/2024-10-29_operation-magnus.yaml:5`.

### 5xx and 410

- 500: `https://www.bbc.com/news/technology-66877441` — `sources/bbc/2023-08-24_kurtaj-conviction.yaml:7`. Transient BBC error; recheck.
- 503: `https://www.presidency.ro/en/media/security/declassified-intelligence-on-foreign-interference-in-the-romanian-presidential-election` — `sources/csat-ro/2024-12_romanian-election-declassified-intel.yaml:7`. Likely intermittent.
- 410: `https://www.finance.senate.gov/hearings/hacking-americas-health-care` — `sources/congress/2024-05-01_witty-testimony.yaml:7`. Senate Finance removed; archive available.

### YAML hygiene

- `sources/nhan-dan/2018-07-26_resolution-29-summary.yaml:5` — the `url:` field is `https://nhandan.vn/  # exact URL not preserved; full text not published`. The inline `#` comment was concatenated into the URL value rather than parsed as a YAML comment. Set `url: null` or move the comment to a separate line.

---

## 3. Verification Not Possible (paywalled / blocked / archive-only)

These returned 401/403 due to bot-detection or paywall and could not be content-checked.
They are NOT necessarily broken — most are likely valid live URLs.

- **www.reuters.com** (12): all return 401 on HEAD/GET without a session. Treat as paywalled.
- **www.fbi.gov** (15 × 403), **www.nytimes.com** (10 × 403), **www.dni.gov** (8 × 403), **www.consilium.europa.eu** (8 × 403), **www.cybercom.mil** (9 × 403), **www.congress.gov** (5 × 403), **www.bloomberg.com** (5 × 403) — all bot-blocks; manual spot-check needed for sb0001-shape findings.
- **www.washingtonpost.com** (15 × 000): WaPo aggressively rate-limits `curl` regardless of UA. Treat as unverifiable from this tool.
- **www.wsj.com**: 401, paywalled.
- **www.auswaertiges-amt.de** (2 × 400): German Foreign Office returns 400 on `curl`; site itself is fine.
- **content.time.com**: 406 with redirect to time.com/archive — URL is live but at a new location.
- `sources/pangulab/2022-02-23_bvp47-backdoor.yaml`: pangulab.cn returns 000 (DNS or TLS issue from this network).

---

## 4. Date drift between event and cited source (Sweep C)

57 (event, source) pairs differ by >30 days. The overwhelming majority are legitimate
retrospective citations (a 2017 retrospective source attesting to a 1999 event, 2020
indictment attesting to a 2014 attribution, etc.) and are EXPECTED.

The following look anomalous and warrant manual review:

| Drift (d) | Event | Source | Note |
|---|---|---|---|
| +2405 | `2024-08/hunt-forward-lithuania-second` (attribution_date 2024-12-31) | `cybercom/hunt-forward-press-cumulative` (2018-06-01) | A 2018 cumulative press page can't attest to a 2024 op. Looks like a placeholder citation. |
| +1674 | `2022-03/hunt-forward-lithuania-latvia-croatia` (attribution_date 2022-12-31) | `cybercom/hunt-forward-press-cumulative` (2018-06-01) | Same placeholder pattern. |
| +1889 | `2019-05/teamviewer-breach` (2019-05-17) | `mandiant/2024-07-18_apt41-dust` (2024-07-18) | Retrospective — acceptable but worth confirming the 2024 report actually does cite the 2019 TeamViewer breach. |
| +3044 | `2014-06/opm-breach` (2015-09-01) | `wikipedia/opm-data-breach` (2024-01-01) | Wikipedia is a weak attestation source; the OPM breach has primary US-government attribution that should be cited instead. |
| +1357 | `2014-11/sony-pictures` (attribution_date 2018-09-06) | `fbi/2014-12-19_sony-fbi-attribution` (2014-12-19) | The attribution_date is the 2018 Park Jin Hyok indictment date but the source is the 2014 FBI flash. Probably a source-mixup — either swap source to `doj/2018-09-06_park-jin-hyok-complaint` or set attribution_date to 2014-12-19. |
| +1146 | `2010-05/operation-socialist-belgacom` (attribution_date 2018-02-01) | `intercept/2014-12-13_operation-socialist` (2014-12-13) | Attribution_date 2018-02-01 looks invented; the Intercept disclosure was 2014-12-13. |
| +1134 | `2016-11/glowing-symphony` (attribution_date 2016-12-13) | `nsarchive/2020-01-21_glowing-symphony-after-actions` (2020-01-21) | An after-action document can't be the attestation of a 2016-12 attribution_date. |
| +901 | `2022-06/russian-aligned-hacktivist-ddos-campaign` (2023-06-14) | `doj/2025-12_carr-noname-actions` (2025-12-01) | Future-dated DOJ source attesting to a 2023 attribution. |
| +502 | (same event) | `europol/2024-07_operation-eastwood-noname` (2024-07-17) | Event also cites this — Operation Eastwood 2024 source paired with attribution_date 2025-12-01 in a reverse-order match. Inconsistency cluster around this event. |
| +517 | `2017-08/triton-petro-rabigh` (attribution_date 2022-03-24) | `treasury/2020-10-23_tsniikhm-triton-sanctions` (2020-10-23) | 2022-03-24 attribution_date but 2020 source — likely should reference the 2022 DOJ Berserk-Bear / Triton indictment instead. |
| +454 | `2010-01/apt1-comment-crew-campaign` (attribution_date 2014-05-19) | `mandiant/2013-02-19_apt1-report` (2013-02-19) | 2014-05-19 is the PLA-5 indictment date but APT1 wasn't part of PLA-5; source should be the 2013 Mandiant report (date matches). |
| +384 | `2020-10/emennet-proud-boys-voter-intimidation` (attribution_date 2020-10-30) | `doj/2021-11-18_kazemi-kashian` (2021-11-18) | The DOJ indictment is the natural attribution source — attribution_date should be 2021-11-18, not 2020-10-30. |

The other 45 drift findings are recognisably retrospective and look acceptable.

---

## Methodology notes & caveats

- HTTP probing used a Chrome-on-macOS UA; some hosts still bot-blocked anyway (NYT, FBI,
  Bloomberg, WSJ). 403s in that list are not data issues.
- The Treasury content-mismatch check used `<title>` tag comparison against the
  filename/stub-claimed event. Two-step verification was done (HEAD then GET), so a
  200 result is the actual final URL after redirects.
- `archive_url:` fields were not separately probed.
- Book-ISBN sources (no `url:`) were skipped by design.
- 902 URLs total; 67 high-risk Treasury URLs received `<title>` content checks. A similar
  content-check pass over DOJ, NCSC, and CISA URLs would extend the sb0001-shape coverage —
  recommend running it next, since the methodology has now identified twelve sb0001-shape
  hits in just the Treasury subset and that hit-rate (~18%) is high enough to predict
  more in other government-press-release hosts.
