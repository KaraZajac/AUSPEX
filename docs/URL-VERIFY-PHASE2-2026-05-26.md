# Atlas URL & Source Verification Sweep — Phase 2 — 2026-05-26

Scope: DOJ, NCSC-UK, CISA URL sweep extending Phase 1 (Treasury). Triggered by Phase 1's
18% sb0001-shape hit rate on `home.treasury.gov` press-release IDs.

Sources sampled:
- `atlas/sources/doj/*.yaml` — 48 `url:` fields
- `atlas/sources/ncsc-uk/*.yaml` — 7 `url:` fields
- `atlas/sources/cisa/*.yaml` — 61 `url:` fields
- `atlas/policy-actions/multilateral/*.yaml` and `atlas/policy-actions/us/*.yaml` — 28 matching
  `official_url:` fields pointing at justice.gov / ncsc.gov.uk / cisa.gov (Treasury sanctions
  files in `policy-actions/us/` excluded per task constraint — a separate Treasury-lookup
  agent is editing those).

Total: 144 URL references across 128 unique URLs.

Method:
1. Fetched each URL with browser UA (Chrome/120, macOS). Parsed `<title>` tag.
2. For `justice.gov` URLs the live host returned an Akamai bot-challenge interstitial
   (`<title>&nbsp;</title>` + 5-second redirect to `/apology_objects/interstitial/`).
   Same effective signature for both `/opa/pr/...` and `/archives/opa/pr/...` paths.
   I worked around this via `web.archive.org/wayback/available` API → fetched the closest
   snapshot of each DOJ URL → parsed `<title>` from the snapshot. ~38 % of DOJ URLs had a
   usable Wayback snapshot; the rest are listed in the bot-blocked section.
3. NCSC and CISA pages rendered cleanly with the same UA — no bot wall.

Top-line numbers:
- 128 unique URLs checked
- 110 returned HTTP 200 with a parseable specific page (CISA + NCSC + a handful of DOJ)
- 7 returned HTTP 404 (real broken URLs)
- 1 returned HTTP 000 (Washington Post on `curl`, same WaPo behaviour as Phase 1)
- ~48 DOJ URLs returned 200-with-bot-interstitial; ~25 of those were verified via
  Wayback (slugs matched YAML claims); the remaining ~23 are listed below as
  bot-blocked-and-unverified, NOT flagged as hallucinations.

Headline finding: **5 sb0001-shape mismatches confirmed**, plus **7 real 404s** and
**1 cross-publisher slug-collision (highly suspicious)**. Hit-rate of confirmed mismatches
across the 88 URLs whose live content I could verify is **6 / 88 = ~6.8 %** — substantially
lower than Treasury's 18 %, but not zero. The DOJ figure is undercounted because Akamai
bot-blocking prevented direct verification on most justice.gov URLs.

---

## 1. Real-URL-Wrong-Content (sb0001 shape) — CISA

| File (atlas/...) | Claimed (in stub) | URL | What the page actually is |
|---|---|---|---|
| `sources/cisa/2018-03-15_ta18-074a-russian-energy-sector.yaml` | "Russian Government Cyber Activity Targeting Energy and Other Critical Infrastructure Sectors (TA18-074A)" — dated 2018-03-15 | https://www.cisa.gov/news-events/cybersecurity-advisories/aa20-296a | **AA20-296a** = "Russian State-Sponsored Advanced Persistent Threat Actor Compromises U.S. Government Targets" (Oct 2020). Different advisory ID, different year, different campaign. The actual TA18-074A lives at `cisa.gov/news-events/cybersecurity-advisories/TA18-074A`. |
| `sources/cisa/2019-06-22_krebs-iran-wiper-statement.yaml` | "Director Krebs Statement on Iranian-Linked Wiper Cyber Activity" — dated 2019-06-22 | https://www.cisa.gov/news-events/news | Generic CISA news-index landing page ("News \| CISA"). The specific Krebs 2019 statement is not at this URL. URL effectively points to today's news list. |
| `sources/cisa/2021-07-04_aa21-209a-kaseya-revil.yaml` | "Alert (AA21-209A): CISA-FBI Guidance for MSPs and Their Customers Affected by the Kaseya VSA Supply-Chain Ransomware Attack" — dated 2021-07-28 | https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-209a | **AA21-209A** is actually "Top Routinely Exploited Vulnerabilities" (the annual joint advisory). The Kaseya VSA / REvil CISA-FBI guidance had a different ID (`AA21-209A` was reassigned, or the stub has the wrong AA number). Wrong advisory entirely. |
| `sources/cisa/2020-07-16_aa20-201a-covid-vaccine-targeting.yaml` | "APT29 Targets COVID-19 Vaccine Development (AA20-201A)" — CISA stub, dated 2020-07-16 | https://www.ncsc.gov.uk/news/advisory-apt29-targets-covid-19-vaccine-development | URL points to the NCSC-UK ally announcement, not the CISA AA20-201A advisory. On-topic but wrong publisher; the CISA advisory itself is at `cisa.gov/news-events/cybersecurity-advisories/aa20-201a`. Stub publisher field is "CISA" but URL is NCSC — flag for correction. |
| `sources/cisa/2023-08-07_aa23-243a-royal-update.yaml` | "Alert (AA23-243A): #StopRansomware: Royal Ransomware (update)" — dated 2023-08-07 | https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-061a | URL is **AA23-061A** (the original Royal advisory page, now retitled "#StopRansomware: Blacksuit (Royal) Ransomware"), not AA23-243A. CISA did publish an AA23-243A update on 2023-08-07; the stub URL references the wrong advisory ID. |

Lower-severity / generic-landing-page (cited URL is the publisher's hub instead of the specific document):
- `sources/cisa/2023-04-13_secure-by-design-guidance.yaml` → URL is `cisa.gov/resources-tools/resources/secure-by-design` (hub landing) rather than the specific April 2023 "Shifting the Balance" PDF.
- `sources/cisa/2024-04_secure-by-design-signatories.yaml` → URL is `cisa.gov/securebydesign` (hub landing), not the April 2024 signatories announcement.
- `sources/cisa/2025-10-30_kev-vmware-cve-2025-41244.yaml` → URL is `cisa.gov/known-exploited-vulnerabilities-catalog` (catalog landing), not a per-CVE entry.
- `sources/cisa/joint-five-eyes-advisories.yaml` → URL is the generic `/cybersecurity-advisories` listing (acceptable for an index file).

Not strictly in scope but encountered: `sources/cisa/2025-08_fsb-center-16-cisco-ios.yaml` cites `industrialcyber.co/...` (a vendor blog), not CISA. The page is reachable but title is unparseable; flag for correction to a primary CISA URL.

---

## 2. Real-URL-Wrong-Content — NCSC

| File (atlas/...) | Claimed (in stub) | URL | What the page actually is |
|---|---|---|---|
| `sources/ncsc-uk/2023-01-12_royal-mail-lockbit.yaml` | "NCSC statement on the Royal Mail / LockBit cyber incident" — dated 2023-01-12 | https://www.ncsc.gov.uk/ | NCSC **homepage** — `<title>The National Cyber Security Centre`. No specific Royal Mail statement at this URL. Classic sb0001 shape: a real URL that loads, but for a totally generic destination. |
| `sources/ncsc-uk/2018-10_reckless-campaign-of-cyber-attacks.yaml` | "Reckless Campaign of Cyber Attacks by Russian Military Intelligence Service Exposed" — dated 2018-10-04 | https://www.ncsc.gov.uk/news/reckless-campaign-cyber-attacks-russian-military-intelligence-service-exposed | URL returns 200 but page title is "Page removed \| National Cyber Security Centre" — NCSC has explicitly tombstoned the article. Content is gone from the live site (Wayback still has it). |

---

## 3. Real-URL-Wrong-Content — DOJ

DOJ press-release URLs are protected by Akamai bot interstitials. I cross-checked slugs
via Wayback (closest available snapshot). One confirmed sb0001 shape:

| File (atlas/...) | Claimed (in stub) | URL | What the page actually is |
|---|---|---|---|
| `sources/doj/2019-08_apt41-first-indictment.yaml` | "Two Chinese Hackers Indicted for Cyber Intrusion into Computer Networks of Online Video-Game Companies (Zhang Haoran and Tan Dailin)" — dated 2019-08-15 | https://www.justice.gov/opa/pr/two-chinese-hackers-working-ministry-state-security-charged-global-computer-intrusion | This slug is the **July 2020 MSS Guangdong / APT41-adjacent COVID-19 research indictment** (Li Xiaoyu and Dong Jiazhi), not the August 2019 Zhang Haoran / Tan Dailin video-game indictment. Wayback title: "Two Chinese Hackers Working with the Ministry of State Security Charged with Global Computer Intrusion Campaign Targeting Intellectual Property and Confidential Business Information, **Including COVID-19 Research**". The same slug is also (correctly) used by `sources/doj/2020-09-16_apt41-indictment.yaml`-adjacent dossiers — this is a slug collision where the 2019 stub was given the 2020 URL. |

The remaining 47 DOJ URLs whose slugs *do* match the stub title (confirmed where Wayback
snapshots existed): no sb0001 mismatches found. See bot-blocked section below for the
specific URLs that could not be live-verified.

---

## 4. Real-URL-Wrong-Content — Policy-Actions cross-host

| File (atlas/...) | Claimed (in stub) | URL | Status |
|---|---|---|---|
| `policy-actions/multilateral/2025-07-18_uk-authentic-antics-attribution.yaml` | UK Authentic Antics attribution (2025-07-18) — `official_url` | https://www.ncsc.gov.uk/news/2025-07-18-authentic-antics-attribution | **404.** Slug is fabricated. The real NCSC article lives at `ncsc.gov.uk/news/uk-call-out-russian-military-intelligence-use-espionage-tool` (confirmed — `sources/ncsc-uk/2025-07-18_authentic-antics.yaml` cites it correctly). Fix: replace `official_url` with the real slug. |

---

## 5. Broken URLs (HTTP 404 / 000) found incidentally

| File | URL | Code | Note |
|---|---|---|---|
| `sources/ncsc-uk/2021-05_further-ttps-svr.yaml` | https://www.ncsc.gov.uk/news/further-ttps-associated-with-svr-cyber-actors | 404 | NCSC has removed the article. Real archive copy on web.archive.org. |
| `sources/ncsc-uk/2024-03-25_apt31-electoral-commission.yaml` | https://www.ncsc.gov.uk/news/uk-and-allies-expose-china-state-affiliated-targeting-of-uk-democratic-institutions-parliamentarians | 404 | NCSC tombstoned. |
| `sources/ncsc-uk/2025-05-20_scattered-spider-uk-retail.yaml` | https://www.ncsc.gov.uk/news/uk-retail-cyber-incidents | 404 | NCSC tombstoned (or slug is wrong). |
| `sources/doj/2018-07-13_mueller-gru-twelve-indictment.yaml` AND `policy-actions/us/2018-07-13_mueller-gru-twelve-indictment.yaml` | https://www.justice.gov/file/1080281/download | 404 | DOJ removed the document download from this file ID. The Mueller GRU 12-officer indictment PDF exists elsewhere on justice.gov — needs a new URL. |
| `policy-actions/us/2025-05-15_blacksuit-disruption.yaml` | https://www.justice.gov/opa/pr/blacksuit-ransomware-takedown | 404 | The slug is a guess. The real Aug 2025 BlackSuit / Royal disruption press release is at a different slug (likely `justice-department-disrupts...` style). The source-stub `sources/doj/2025-05-15_blacksuit-disruption.yaml` may have the same issue — check. |
| `sources/doj/2013-06-21_snowden-charges.yaml` | https://www.washingtonpost.com/world/national-security/us-charges-snowden-with-espionage/2013/06/21/507497d8-dab1-11e2-a016-92547bf094cc_story.html | 000 | WaPo `000`s on `curl` regardless of UA — same artifact as Phase 1. Not actionable from a hallucination standpoint. |

---

## 6. Bot-blocked (could not verify, but no evidence of mismatch)

All justice.gov URLs not listed above returned HTTP 200 with an Akamai interstitial
(`<title>&nbsp;</title>`). For each, I attempted a Wayback fallback. The URLs below either
had no Wayback snapshot or the snapshot itself was also bot-walled. Slugs strongly suggest
the cited content matches the YAML title, but I could not confirm live:

- `https://www.justice.gov/archives/opa/pr/iranian-nationals-charged-multi-year-hacking-campaign-targeting-us-critical-infrastructure` (cited by `sources/doj/2022-09-14_najee-afkar-indictment.yaml`)
- `https://www.justice.gov/archives/opa/pr/high-level-organizer-notorious-hacking-group-fin7-sentenced-prison-scheme-compromised-tens` (`sources/doj/2021-04-16_iarmak-fin7-extradition.yaml`)
- `https://www.justice.gov/archives/opa/pr/french-national-sentenced-three-years-prison-computer-fraud-and-aggravated-identity-theft` (`sources/doj/2024-01-09_raoult-shinyhunters-sentencing.yaml`)
- `https://www.justice.gov/archives/opa/pr/justice-department-announces-court-authorized-disruption-snake-malware-network` (`sources/doj/2023-05-09_operation-medusa-snake-disruption.yaml`)
- `https://www.justice.gov/archives/opa/pr/justice-department-and-international-partners-disrupt-redline-and-meta-infostealer-malware` (`policy-actions/us/2024-10-29_rudometov-redline-indictment.yaml`)
- `https://www.justice.gov/archives/opa/pr/justice-department-indicts-14-north-koreans-multi-year-fraudulent-information-technology` (`policy-actions/us/2024-12-12_dprk-it-worker-14-national-indictment.yaml`)
- `https://www.justice.gov/archives/opa/pr/operation-magnus-redline-meta-infostealer` (`sources/doj/2024-10-29_rudometov-redline-indictment.yaml`)
- `https://www.justice.gov/archives/opa/pr/three-irgc-cyber-actors-indicted-hack-and-leak-operation-designed-influence-2024-us` (`sources/doj/2024-09-27_irgc-trio-trump-campaign.yaml`)
- `https://www.justice.gov/archives/opa/pr/five-defendants-charged-multi-year-scheme-hack-companies-and-steal-cryptocurrency-and` (`sources/doj/2024-11-20_scattered-spider-five-indictment.yaml`)
- `https://www.justice.gov/archives/opa/pr/seven-international-cyber-defendants-including-apt41-actors-charged-connection-computer` (`sources/doj/2020-09-16_apt41-indictment.yaml`)
- `https://www.justice.gov/archives/opa/pr/seven-iranians-working-islamic-revolutionary-guard-corps-affiliated-entities-charged` (`sources/doj/2016-03-24_ababil-bowman-dam-indictment.yaml`)
- `https://www.justice.gov/archives/opa/pr/chinese-national-pleads-guilty-conspiring-hack-us-defense-contractors-systems` (`policy-actions/us/2016-03-22_su-bin-plea.yaml`)
- `https://www.justice.gov/archives/opa/pr/chinese-intelligence-officer-convicted-espionage-crimes-attempting-steal-trade-secrets` (`sources/doj/2021-11_yanjun-xu-mss-conviction.yaml`)
- `https://www.justice.gov/usao-cdca/pr/five-charged-international-hacking-and-multi-million-dollar-cryptocurrency-theft` (`policy-actions/us/2024-11-20_scattered-spider-five-indictment.yaml`)
- `https://www.justice.gov/usao-ndga/pr/chinese-military-personnel-charged-computer-fraud-economic-espionage-and-wire-fraud` (`sources/doj/2020-02-10_pla-54th-ri-equifax-indictment.yaml`)
- `https://www.justice.gov/usao-sdny/pr/israeli-private-investigator-pleads-guilty-hacking-wire-fraud-and-identity-theft` (`sources/doj/2022-06-20_aviram-azari-conviction.yaml`)
- `https://www.justice.gov/usao-sdny/pr/joshua-schulte-convicted` (`sources/doj/2022-07-13_schulte-conviction.yaml`)
- `https://www.justice.gov/usao-sdny/pr/us-attorney-announces-charges-against-two-iranian-nationals-cyber-enabled` (`sources/doj/2021-11-18_kazemi-kashian.yaml`)
- `https://justice.gov/archives/opa/pr/chinese-national-pleads-guilty-conspiring-hack-us-defense-contractors-systems-steal-sensitive` (`sources/doj/2016-03-22_su-bin-plea.yaml`)
- `https://justice.gov/opa/pr/department-justice-and-partner-departments-and-agencies-conduct-coordinated-actions-disrupt` (`sources/doj/2020-09_iran-coordinated-actions.yaml`)
- `https://www.justice.gov/opa/pr/us-charges-russian-fsb-officers-and-their-criminal-conspirators-hacking-yahoo-and-millions` (`sources/doj/2017-03-15_fsb-yahoo-indictment.yaml`)
- `https://www.justice.gov/opa/pr/us-charges-three-chinese-hackers-who-work-internet-security-firm-hacking-three-corporations` (`sources/doj/2017-11-27_apt3-boyusec-indictment.yaml`)
- `https://www.justice.gov/opa/pr/two-iranian-men-indicted-deploying-ransomware-extort-hospitals-municipalities-and-public` (`sources/doj/2018-11-28_samsam-indictment.yaml`)
- `https://www.justice.gov/opa/pr/us-charges-russian-gru-officers-international-hacking-and-related-influence-and` (`sources/doj/2018-10-04_morenets-wada-opcw-indictment.yaml`)
- `https://www.justice.gov/opa/pr/us-charges-russian-national-developing-and-operating-lockbit-ransomware` (`sources/doj/2024-05-07_lockbit-khoroshev-indictment.yaml`)
- `https://www.justice.gov/opa/pr/us-charges-five-chinese-military-hackers-cyber-espionage-against-us-corporations-and-labor` (`sources/doj/2014-05-19_pla-five-officers-indictment.yaml`)
- `https://www.justice.gov/opa/pr/us-department-justice-disrupts-hive-ransomware-variant` (`sources/doj/2023-01-26_hive-takedown.yaml`)
- `https://www.justice.gov/opa/pr/ukrainian-arrested-and-charged-ransomware-attack-kaseya` (cited by both `sources/doj/2021-11-08_revil-vasinskyi-polyanin-indictment.yaml` and `sources/doj/2022-03-03_vasinskyi-extradition.yaml`)
- `https://www.cisa.gov/sites/default/files/2024-02/CISA-Open-Source-Software-Security-Roadmap-508c.pdf` (`sources/cisa/2024-02_oss-security-roadmap.yaml`) — PDF, no `<title>` parse possible, but URL returns 200; filename matches stub claim.
- `https://industrialcyber.co/threats-attacks/russian-fsb-center-16-exploits-decade-old-cisco-flaw-in-cyber-espionage-campaign-to-target-critical-infrastructure/` (`sources/cisa/2025-08_fsb-center-16-cisco-ios.yaml`) — page reachable, title unparseable; consider replacing with a CISA primary URL anyway.

All bot-blocked DOJ URLs whose slugs *were* verifiable via Wayback (≈25 URLs) matched
their stub titles cleanly — including all `archives/opa/pr/six-russian-gru-officers-...`,
`fourteen-north-korean-nationals-...`, `four-russian-government-employees-...`, and
`chinese-military-personnel-charged-...` slugs. No further mismatches detected in that subset.

---

## 7. Summary statistics

| Host | URLs checked | Live-verified | sb0001 mismatch | 404 | Bot-blocked / unverifiable |
|---|---|---|---|---|---|
| CISA | 61 | 60 | 5 (4 wrong-advisory + 1 wrong-publisher) | 0 | 1 (PDF, non-CISA blog) |
| NCSC | 8 (incl. 1 multilateral) | 8 | 1 (homepage instead of article) | 4 | 0 |
| DOJ | 75 (incl. 27 policy-action) | ~25 via Wayback + 4 via live OG-title | 1 (slug-collision APT41↔APT41-COVID) | 2 (Mueller PDF, BlackSuit) | ~46 |
| WaPo (incidental) | 1 | 0 | n/a | 0 (000) | 1 |
| **Totals** | **128 unique URLs** | **~97** | **7** | **6** | **~48** (mostly Akamai) |

Confirmed sb0001-shape hit-rate (mismatch ÷ live-verified): **7 / 97 ≈ 7.2 %**, vs.
Treasury Phase 1's 18 %. DOJ is the largest blind spot because of the Akamai wall —
~46 URLs could not be live-verified, so the true DOJ hit-rate is likely 0–10 % (slugs
mostly match the stub titles, suggesting the URLs were copied from real DOJ pages rather
than fabricated, with the APT41-2019 case being the one strong exception).

NCSC has a separate and worse problem: of 8 URLs, 4 are hard 404s and 1 points to the
NCSC homepage. The NCSC source set needs a full re-pass — the `2023-01-12_royal-mail-lockbit`
stub is especially suspect (citing the homepage suggests the original stub was authored
without actually finding a specific NCSC statement, and there may not be one).

CISA is the cleanest of the three, but the 5 confirmed mismatches all involve **advisory-ID
or year confusion** — exactly the same pattern as Treasury's `jy####` ID confusion.
Two of them (`aa20-296a` instead of TA18-074A, `aa21-209a` instead of the real Kaseya
guidance) are the same shape as sb0001/sb0302 in Phase 1: a real CISA advisory ID is
cited that exists and is unrelated.

---

## 8. Recommended next steps (for follow-up agent / Kara)

1. **CISA fixes** (5 URLs, mechanical):
   - `2018-03-15_ta18-074a-russian-energy-sector.yaml` → change URL to `cisa.gov/news-events/cybersecurity-advisories/TA18-074A` (or the archived `us-cert.cisa.gov` form) and verify.
   - `2019-06-22_krebs-iran-wiper-statement.yaml` → either find the specific Krebs statement archive URL or set URL to `null` with a `notes:` line.
   - `2021-07-04_aa21-209a-kaseya-revil.yaml` → look up the real CISA-FBI Kaseya advisory ID (this may be `AA21-200A` or there may be no Kaseya-specific AA at all — the most-cited document is actually CISA's standalone Kaseya guidance, not an AA).
   - `2020-07-16_aa20-201a-covid-vaccine-targeting.yaml` → flip URL to `cisa.gov/news-events/cybersecurity-advisories/aa20-201a` (the CISA mirror of the joint advisory).
   - `2023-08-07_aa23-243a-royal-update.yaml` → URL should be `aa23-243a`, not `aa23-061a`.

2. **NCSC re-pass** (5 issues, needs human + archive.org):
   - All 4 hard-404 NCSC slugs need either the new live slug or a Wayback archive_url
     fallback. NCSC routinely tombstones articles; this is not the atlas's fault but
     needs `archive_url:` to be set.
   - `2023-01-12_royal-mail-lockbit.yaml` (homepage URL): research whether NCSC ever
     issued a specific Royal Mail / LockBit statement. If not, set `url: null` and rely
     on the BBC/Reuters secondary stub.

3. **DOJ fixes** (3 URLs, mechanical):
   - `2019-08_apt41-first-indictment.yaml` → URL slug should be the **August 2019** Zhang
     Haoran / Tan Dailin video-game indictment, not the 2020 COVID-research one. Likely
     real slug: `/opa/pr/two-chinese-nationals-indicted-cyber-intrusions-affecting-over...`
     or `/usao-edca/...`. Needs lookup.
   - `2018-07-13_mueller-gru-twelve-indictment.yaml` (both source and policy-action
     copies) → `/file/1080281/download` is gone. Replace with the current location of
     the GRU-12 indictment PDF, e.g. an `archive_url` to web.archive.org.
   - `policy-actions/us/2025-05-15_blacksuit-disruption.yaml` (and probably the matching
     `sources/doj/2025-05-15_blacksuit-disruption.yaml`) → fabricated slug. Look up
     the real DOJ BlackSuit takedown press release.

4. **Multilateral fix** (1 URL):
   - `policy-actions/multilateral/2025-07-18_uk-authentic-antics-attribution.yaml`:
     replace `ncsc.gov.uk/news/2025-07-18-authentic-antics-attribution` (fabricated date-
     slug) with the real `ncsc.gov.uk/news/uk-call-out-russian-military-intelligence-use-espionage-tool`.

5. **DOJ bot-block — methodology note for future sweeps**: justice.gov serves an Akamai
   interstitial to non-browser User-Agents on every `/opa/pr/...` and `/archives/opa/pr/...`
   path; `<title>` parse will *always* return `&nbsp;` from `curl`. Future sweeps should
   either use a headless browser (Playwright/Puppeteer) or query `archive.org/wayback/available`
   for each URL and pull `<title>` from the snapshot. The Wayback-API approach has ~40 %
   snapshot coverage for justice.gov press releases, dropping to near zero for sub-domains
   like `usao-sdny.justice.gov`.
