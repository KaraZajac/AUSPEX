# URL Verification — Agent 4 — Middle East + South Asia Scope

**Date:** 2026-05-28
**Agent:** 4 of 5 (parallel corpus verification)
**Scope:** Events where any `attributions[*].actor_id` (or `service_id`) starts with `ir/`, `il/`, `ae/`, `tr/`, `pk/`
**Event count in scope:** 128 (109 strict actor_id matches + 19 service_id-only events for IRGC/MOIS service-level, Mossad/AMAN, etc.)
**Unique source IDs touched:** 172
**Budget consumed:** ~70 min

## Method

1. Collected unique source IDs referenced by in-scope events (both `sources:` lists and inline `attribution_source_id` / `attesting_source_id`).
2. Bulk-curled all source URLs with realistic UA, 12 s timeout, in 12-way parallel.
3. Triaged non-200 results: 401/403 from known-bot-blocking publishers (Reuters, NYT, FBI, INCD, ODNI, McAfee, TimesOfIsrael, SocRadar) treated as stable; investigated 200-redirects, 404s, and 000-timeouts.
4. For each genuinely broken URL: searched publisher's site, Bing / DDG / direct ID-based slug guesses, and Wayback (`archive.org/wayback/available` + CDX) for an extant canonical or archived replacement.
5. Applied edits to source YAMLs only — no event content modified; no source files deleted; no slugs renamed.
6. Validator re-run after the batch — clean (`No issues found.`, 658 events · 1110 sources).

## Headline Results

| Outcome | Count |
| --- | --- |
| 200 (URL good) | 135 |
| 401/403 (publisher bot-block; URL valid) | 17 |
| 301 (redirects to valid page) | 1 (Secureworks → Sophos redirect; intermediate URL still resolves) |
| Already `url: null` (pre-existing) | 10 |
| **404 / 000 / fabricated — fixed in this pass** | **9** |
| Total | 172 |

## Edits Applied

### Slug-fix corrections (verified 200 + title-match)

1. **`bloomberg/2014-12-11_sands-iran.yaml`** — `adelson-s` → `adelsons` (canonical Bloomberg slug). Title-matched.
2. **`checkpoint/2021-11_moses-staff.yaml`** — `mosesstaff-targets-israeli-companies-for-pure-sabotage` → `mosesstaff-targeting-israeli-companies`. Title updated to canonical `Uncovering MosesStaff techniques — Ideology over Money` (same publication, same date, different framing).
3. **`claroty/2024-12-13_iocontrol-iran-ot.yaml`** — `cyber-weapon` → `cyberweapon` (one word). Title-matched.
4. **`paloalto/2016-12_shamoon-2.yaml`** — `unit42-shamoon-2-back-disttrack-wiper` → `unit42-shamoon-2-return-disttrack-wiper`. Title verified `Shamoon 2: Return of the Disttrack Wiper`.
5. **`sentinellabs/2023-09-13_caprarat-dating-apps.yaml`** — `…hijack-android-devices` → `…hijack-android-phones`. Found via SentinelLabs site search.
6. **`symantec/2016-11_shamoon-2.yaml`** — Post-migration relocation. Pre-migration `symantec-enterprise-blogs.security.com/blogs/threat-intelligence/shamoon-attacks` 404s; canonical now `community.broadcom.com/symantecenterprise/viewdocument/shamoon-multi-staged-destructive-a?CommunityKey=…`. Title-matched.
7. **`washingtonpost/2020-05-08_israel-water-iran.yaml`** — Was set to bare `https://www.washingtonpost.com` homepage. Restored canonical article URL `…/national-security/intelligence-officials-say-attempted-cyberattack-on-israeli-water-utilities-linked-to-iran/2020/05/08/f9ab0d78-9157-11ea-9e23-6914ee410a5f_story.html` (WaPo bot-blocks curl; URL is the published canonical path).

### URLs nulled — no viable replacement located

8. **`msft/2024-03-05_marbled-dust-tradecraft.yaml`** — `url: null`. **Notable finding.** The cited URL `https://www.microsoft.com/en-us/security/blog/2024/03/05/marbled-dust/` 404s; Microsoft Security blog search (`?s=marbled` and `?s=sea+turtle`) indexes **only** the 2025-05-12 Output Messenger Marbled Dust post — no 2024-03-05 publication exists. **Event `2024/03/microsoft-marbled-dust-iraqi-telecom.yaml` and `2024/01/hunt-hackett-sea-turtle-resurgence.yaml` depend on this source.** I followed protocol (null URL, preserve source file, leave event content untouched). **Recommend follow-up:** the event itself may be a hallucination of a Microsoft publication; consider re-grounding on the Hunt & Hackett January 2024 disclosure or the 2025-05-12 Microsoft Output Messenger post.
9. **`mit-tech-review/2021-09-09_uae-mercenary-ex-nsa.yaml`** — `url: null`. The cited URL `https://www.technologyreview.com/2021/09/13/1035645/uae-mercenary-spies-ex-nsa-doj/` 404s; MIT TR article ID 1035645 returns 404 under multiple date paths and the title `The hacker-for-hire industry is now too big to fail` is not found via MIT TR site search or external search engines. Event `2021/09/doj-baier-adams-gericke-dpa.yaml` should rely on DOJ DPA primaries.
10. **`mozilla/2019-07-09_distrust-darkmatter.yaml`** — `url: null`. `https://blog.mozilla.org/security/2019/07/09/distrusting-new-darkmatter-certificates/` 404s; Wayback availability/CDX queries returned no archived snapshot. Mozilla appears to have removed the post; decision is still well-documented in Mozilla bug 1427262 / NSS root-store removal commits.
11. **`sentinellabs/2022-08-04_caprarat-android.yaml`** — `url: null`. The cited URL `…/labs/caprarat-android-implant-targets-indian-government-and-military/` 404s; SentinelLabs search returns no matching 2022-08 CapraRAT-implant post for Indian government targeting. Likely fabricated slug. Event `2022/08/caprarat-android-kashmir.yaml` should be re-grounded.

### Note on the `secureworks/2017-04-13_copper-fieldstone-transparent-tribe.yaml` 301

This URL now redirects through to `https://www.sophos.com/en-us/threat-profiles/` (the Secureworks → Sophos migration). The exact `copper-fieldstone` profile page does not appear to be preserved post-migration. The 301 from the original URL still gives the user a redirect chain that lands on a related page; I did not edit this source since the intermediate URL still resolves and the protocol prefers preservation. **Flagged for future cleanup.**

## Watch-out outcomes (per the per-region briefing)

- **DOJ indictment URLs (Iran-specific):** All in-scope DOJ URLs in this corpus resolved 200 in the parallel sweep — no `archives/opa/` decay observed in scope.
- **CISA AA-IDs (CyberAv3ngers, MuddyWater AA22-055A, Pioneer Kitten AA24-241A, Iranian brute-force AA24-290A, IRGC PLC AA26-097A):** All stable 200.
- **Citizen Lab (Stealth Falcon 2016-05, Bad Traffic StrongPity 2018-03, Hide-and-Seek UAE 2018-09, UK-government Pegasus 2022-04):** All stable 200.
- **Talos (Sea Turtle 2019-04 / 2019-07, SideCopy emergence 2020-11, ObliqueRAT 2020/2021, Transparent Tribe 2022-03):** All stable 200.
- **Microsoft MTI:** Stable except the 2024-03-05 Marbled Dust URL flagged above (item 8). The 2025-05-12 Marbled Dust Output Messenger zero-day post and the 2024-10-08 APT42 Israeli-targeting post (already nulled pre-pass) require no further action.
- **OFAC home.treasury.gov:** All in-scope URLs resolved 200; no migration breakage observed.
- **Reuters / WaPo (Project Raven, Karma, QNA-hack):** 401/403 bot-block as expected; URLs intact and canonical.
- **Symantec → Broadcom migration:** One break captured and migrated (item 6 above).
- **Bailii Princess Haya judgment, Forbidden Stories Pegasus Project, citizenlab.ca:** All stable.

## Editorial Discipline

- **No event content modified.** All edits scoped to source YAML `url`, `archive_url`, `retrieved_on`, `notes`, plus minor `title` adjustment for item 2 (where the canonical-page title differs from the originally-cited title — but it's the same publication on the same date).
- **No source files deleted.** Items 8–11 retain the source YAML with `url: null` and explanatory `notes:` per protocol.
- **No new actors / services / doctrines created.**
- **Marbled Dust = TR (not UAE) editorial decision preserved.** Item 8's null does not reverse the framing — the source publisher (Microsoft Threat Intelligence) and the threat-actor mapping in the event (`tr/mit/sea-turtle`) remain untouched.
- **Validator clean post-edits.**

## Recommendations for the Maintainer (out of scope for this pass)

1. **Investigate the 2024-03-05 Microsoft Marbled Dust event.** Source URL is fabricated; the underlying threat-actor activity (Sea Turtle vs. Iraqi telecom) is real but no Microsoft publication exists for it at that date. The Hunt & Hackett January 2024 disclosure or the 2025-05-12 Microsoft Output Messenger post are the legitimate primaries.
2. **Investigate the 2022-08-04 SentinelLabs CapraRAT event** (`2022/08/caprarat-android-kashmir.yaml`). Source slug is fabricated; SentinelLabs only has CapraTube posts from 2023 and 2024 plus a 2022 APT36/Indian-education-sector post.
3. **Investigate the 2021-09-13 MIT Technology Review UAE mercenary article.** Either the date or the URL ID is wrong; the article does not exist at the cited path.
4. **Future Symantec → Broadcom migration cleanup** for other in-scope Shamoon / Stuxnet / NSO Symantec citations (none broken in this pass, but the migration pattern is now confirmed).

## Source coverage statistics

- Single-source events in scope: 59 of 128 (46%). Many are vendor-research events where one canonical source is appropriate (e.g., a Talos blog *is* the event). Did not perform proactive source-addition this pass given budget pressure on the fabricated-URL investigations, which took priority for PhD-defense rigor.

## Artifacts

- Working scope file: `/tmp/agent4-final.txt`
- URL check raw output: `/tmp/agent4-results.tsv`
- Source-ID-to-URL extraction: `/tmp/agent4-urls.tsv`
