# T1 — Source verification report (content-match, curl_cffi Chrome impersonation)

_Tooling: `audit/t1_content_match.py` — fetches each source with browser-grade TLS impersonation (defeats WaPo/Reuters/WSJ JA3 blocks that give curl/wget false 000/401/403), then matches page title+body against the record's title+notes. This is T1 check #1 ("source resolves; content matches the citation") done to the content level — status-only checks miss soft-404s. NOT a `verified_by:kara` stamp; this is machine triage for the human census._

## Across 1153 sources with a URL

| status | n | meaning |
|---|--:|---|
| ok_match | 815 | 2xx + content matches the record |
| review_low_overlap | 246 | low title/body overlap — refined below |
| hard_404 | 48 | 404/410 — gone |
| soft404_homepage | 7 | 200 but redirected to site homepage — content gone |
| blocked | 31 | 401/403/429 even impersonated — could not verify |
| error | 6 | network/parse failure — retry |

### review_low_overlap (246) refined by final-URL slug preservation
- **53 likely CONTENT-ROT** (redirected to homepage/section, or near-zero overlap) — spot-check 5/5 confirmed genuinely broken.
- **193 likely OK** (article slug preserved → paraphrased title) — *probably* fine, but NOT content-certified (≈ANSSI-style redirects to a section index can leak through). Treat as 'pass machine resolve, pending content eyeball', not verified.

## Actionable — genuinely broken: 108 sources

hard_404 (48) + soft404_homepage (7) + likely-rot (53). Most are URL migrations (FBI→IC3, FireEye→Mandiant→Google Cloud, Lawfare→lawfaremedia, 38North/CSET restructures) — content usually exists at a new address; fix `url:` (+ re-archive). The rest need a replacement second source.

### by publisher (top)
- 6× `symantec`
- 6× `lawfare`
- 5× `reuters`
- 4× `fbi`
- 3× `odni`
- 3× `mandiant`
- 3× `wapo`
- 3× `mcafee`
- 3× `nakasone`
- 3× `therecord`
- 2× `bis`
- 2× `bundesregierung`
- 2× `cisco-talos`
- 2× `38north`
- 2× `fireeye`

### could-not-verify (manual): blocked + error
- [403] `amnesty/2021-02-24_click-and-bait-apt32-diaspora`
- [403] `council-eu/2020-07-30_first-cyber-sanctions`
- [403] `council-eu/2021-09-24_belarus-ghostwriter-statement`
- [403] `council-eu/2022-05-10_viasat-russia-attribution`
- [403] `fsecure/2015-09-17_the-dukes`
- [403] `nca/2024-02-20_operation-cronos`
- [403] `nca/operation-cronos-page`
- [403] `nyt/2013-09-05_nsa-foils-much-encryption`
- [403] `regjeringen-no/2020-10-13_storting-attribution`
- [403] `sb-by/2019-03-19_info-security-concept-text`
- [403] `socket/2025-08_contagious-interview-supply-chain`
- [403] `amnesty/2021-07-18_forensic-methodology-pegasus`
- [403] `amnesty/2023-10-31_donot-targeting-kashmir-activists`
- [403] `bilgesam/2019-12_mavi-vatan-analysis`
- [403] `ccdcoe/2025_predatory-sparrow-iran-financial`
- [403] `ccdcoe/cyberlaw-operation-orchard`
- [403] `ccdcoe/georgia-russia-conflict-2008`
- [403] `ccdcoe/predatory-sparrow-toolkit`
- [403] `ccdcoe/shamoon-cyberlaw`
- [403] `cymmetria/2016-07_unveiling-patchwork`
- [403] `nyt/2009-03-28_ghostnet`
- [403] `nyt/2012-06-01_sanger-obama-order-cyberattacks-iran`
- [403] `nyt/2012-06-01_sanger-olympic-games`
- [403] `nyt/2013-01-30_chinese-hackers-nyt`
- [403] `nyt/2014-03-22_shotgiant-huawei`
- [403] `nyt/2015-01-12_centcom-twitter`
- [403] `nyt/2016-08-19_shadow-brokers-first-post`
- [403] `nyt/2019-06-15_russian-grid-implants`
- [403] `nyt/2019-06-22_iran-cyber-retaliation`
- [403] `nyt/2022-06-26_predatory-sparrow-khuzestan`
- [403] `scf/2021_turkey-transnational-repression`
- [None] `gerasimov/2013-02-27_value-of-science-in-foresight`
- [None] `hgm-uab/2024-07-15_ncss-2024-2028-text`
- [None] `mod-in/2019-05_dcya-stand-up`
- [None] `moitt-pk/2021-07-27_ncsp-text`
- [None] `solarium/2020-03-11_final-report`
- [None] `pangulab/2022-02-23_bvp47-backdoor`

## Full broken list
- [primary] `belta/2019-03-18_security-council-meeting` (hard_404) — https://www.belta.by/president/view/lukashenko-approves-concept-of-information-security-336789-2019/
- [primary] `bis/2022-10-07_advanced-computing-semiconductor-controls` (hard_404) — https://www.federalregister.gov/documents/2022/10/13/2022-21658/implementation-of-additional-export-controls-certain-advanced-computing-and-semiconductor
- [primary] `bis/2025-05-13_huawei-ascend-enforcement` (soft404_homepage) — https://www.bis.doc.gov/index.php/policy-guidance/2025-ascend-enforcement
- [primary] `bundesregierung/2021-09-06_ghostwriter-attribution` (hard_404) — https://www.auswaertiges-amt.de/en/newsroom/news/2492802
- [primary] `bundesregierung/2024-05-03_apt28-spd-attribution` (hard_404) — https://www.auswaertiges-amt.de/en/newsroom/news/-/2660484
- [primary] `csat-ro/2024-12_romanian-election-declassified-intel` (hard_404) — https://www.presidency.ro/en/media/security/declassified-intelligence-on-foreign-interference-in-the-romanian-presidential-election
- [primary] `dni/2025-03_gabbard-ssci-opening-statement` (review_low_overlap) — https://www.dni.gov/
- [primary] `dod/2018_cyber-strategy-summary` (hard_404) — https://media.defense.gov/2018/Sep/18/2002041658/-1/-1/1/CYBER_STRATEGY_SUMMARY_FINAL.PDF
- [primary] `dragos/2025-03_lelwd-volt-typhoon` (hard_404) — https://www.dragos.com/wp-content/uploads/2025/03/Dragos_Littleton_Electric_Water_CaseStudy.pdf
- [primary] `fbi/2020-09-17_rana-malware` (review_low_overlap) — https://www.ic3.gov
- [primary] `fbi/2022-06-01_wray-boston-college` (hard_404) — https://www.fbi.gov/news/speeches/director-wrays-remarks-at-the-boston-conference-on-cyber-security-2022
- [primary] `fbi/2024-08_aria-sepehr-ayandehsazan` (review_low_overlap) — https://www.ic3.gov
- [primary] `fbi/2025-08-27_salt-typhoon-statement` (hard_404) — https://www.fbi.gov/news/press-releases/fbi-statement-on-salt-typhoon
- [primary] `fireeye/2017-09-20_apt33` (review_low_overlap) — https://www.mandiant.com/resources/blog/apt33-insights-into-iranian-cyber-espionage
- [primary] `hhs/2024-04-19_change-healthcare-bulletin` (hard_404) — https://www.hhs.gov/sites/default/files/change-healthcare-cyberattack-sector-alert-tlpclear.pdf
- [primary] `iran-constitution/article-150` (hard_404) — https://irandataportal.syr.edu/wp-content/uploads/2013/11/Constitution.pdf
- [primary] `mandiant/2021-04-28_ghostwriter-unc1151` (review_low_overlap) — https://www.mandiant.com/resources/blog/unc1151-linked-to-belarus-government
- [primary] `mcafee/2011-02-10_night-dragon` (soft404_homepage) — https://www.mcafee.com/enterprise/en-us/assets/white-papers/wp-global-energy-cyberattacks-night-dragon.pdf
- [primary] `mcafee/2011-08-02_shady-rat` (soft404_homepage) — https://www.mcafee.com/enterprise/en-us/assets/white-papers/wp-operation-shady-rat.pdf
- [primary] `meity/2013-07-02_ncsp-text` (hard_404) — https://www.meity.gov.in/writereaddata/files/downloads/National_cyber_security_policy-2013%281%29.pdf
- [primary] `mha/2014_ntro-overview` (review_low_overlap) — https://www.mha.gov.in/
- [primary] `micitt-cr/2022-04-18_conti-attribution` (review_low_overlap) — https://www.micitt.go.cr/
- [primary] `mit-gov-tr/2014-04-26_law-6532-overview` (review_low_overlap) — https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6532.pdf
- [primary] `msrc/2024-01-19_midnight-blizzard-microsoft-corporate` (review_low_overlap) — https://msrc.microsoft.com/blog/2024/01/microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard/
- [primary] `nakasone/2019_ssci-testimony-ira` (review_low_overlap) — https://www.intelligence.senate.gov/
- [primary] `nakasone/2022-05_senate-armed-services-testimony` (review_low_overlap) — https://www.armed-services.senate.gov/
- [primary] `nakasone/2024_testimony` (review_low_overlap) — https://www.armed-services.senate.gov/
- [primary] `nsab/2020-08_draft-national-cybersecurity-strategy-summary` (review_low_overlap) — https://www.dsci.in/
- [primary] `nviso/2025-09-29_unc5174-vmware-cve-2025-41244` (review_low_overlap) — https://blog.nviso.eu/
- [primary] `odni/2017-01-06_ica-2017-01d-russia-election-assessment` (hard_404) — https://www.dni.gov/files/documents/ICA_2017_01.pdf
- [primary] `odni/2024-08-19_election-joint-statement` (hard_404) — https://www.dni.gov/index.php/newsroom
- [primary] `odni/2024-08-19_iran-2024-election-statement` (hard_404) — https://www.dni.gov/index.php/newsroom/press-releases/press-releases-2024/3958-joint-statement-from-the-fbi-cisa-and-odni-on-iran-attempting-to-influence-2024-election
- [primary] `recorded-future/2017-05_apt3-boyusec-mss` (hard_404) — https://www.recordedfuture.com/chinese-mss-behind-apt3
- [primary] `saudi-nca/2020-01_dustman-bapco` (review_low_overlap) — https://nca.gov.sa
- [primary] `state-council/2015-05-19_mic2025-original` (soft404_homepage) — https://english.www.gov.cn/policies/latest_releases/2015/05/19/content_281475110703534.htm
- [primary] `state/2020-04-15_dprk-cyber-threat-advisory` (hard_404) — https://www.state.gov/guidance-on-the-north-korean-cyber-threat/
- [primary] `symantec/2016-05-26_swift-attacks-lazarus` (hard_404) — https://docs.broadcom.com/doc/swift-attackers-malware-linked-to-more-financial-attacks
- [primary] `symantec/2017-02-12_lazarus-banks` (hard_404) — https://symantec-enterprise-blogs.security.com/blogs/threat-intelligence/attackers-target-dozens-global-banks-new-malware
- [primary] `threatconnect/2015-09_naikon-pla-78020` (review_low_overlap) — https://threatconnect.com/blog/camerashy-closing-the-aperture-on-chinas-unit-78020/
- [primary] `toyota/2019-03-29_unauthorised-access-disclosure` (hard_404) — https://www.toyota.com.au/news/update-attempted-cyberattack
- [secondary] `baker-institute/russias-use-of-energy-weapon-in-europe` (review_low_overlap) — https://www.bakerinstitute.org/research/russias-use-energy-weapon-in-europe
- [secondary] `blackberry/2024-06-18_transparent-tribe-elizarat` (review_low_overlap) — https://blogs.blackberry.com/en/2024/06/transparent-tribe-targets-indian-government-defense-and-aerospace
- [secondary] `chainalysis/2025-06_nobitex-drain` (review_low_overlap) — https://www.chainalysis.com
- [secondary] `checkpoint/2021-01-28_lebanese-cedar` (hard_404) — https://research.checkpoint.com/2021/after-lying-low-signsight-spyware-resurfaces-lebanese-cedar/
- [secondary] `cisco-talos/2017-05-03_konni-rat` (hard_404) — https://blog.talosintelligence.com/konni-malware-under-the-radar-for-years/
- [secondary] `cisco-talos/2017-11_patchwork-badnews-continuation` (review_low_overlap) — https://blog.talosintelligence.com/
- [secondary] `claroty/2024-12-13_iocontrol-iran-ot` (hard_404) — https://claroty.com/team82/research/inside-a-new-ot-iot-cyberweapon-iocontrol
- [secondary] `cnn/2015-02-26_clapper-iran-sands` (review_low_overlap) — https://money.cnn.com
- [secondary] `cnn/2022-06-01_wray-boston-childrens` (review_low_overlap) — https://www.cnn.com
- [secondary] `cset/2018-08-03_mic2025-translation` (hard_404) — https://cset.georgetown.edu/publication/made-in-china-2025/
- [secondary] `cyberscoop/2018_nspm-13-existence-reporting` (review_low_overlap) — https://cyberscoop.com/
- [secondary] `cyberscoop/2020-10-12_trickbot` (review_low_overlap) — https://cyberscoop.com/
- [secondary] `defensescoop/2025_dual-hat-shelved-coverage` (review_low_overlap) — https://defensescoop.com/
- [secondary] `defensescoop/2025_southcom-hunt-forward` (review_low_overlap) — https://defensescoop.com/
- [secondary] `digichina/2018-04-09_mic2025-analysis` (hard_404) — https://digichina.stanford.edu/work/translation-made-in-china-2025/
- [secondary] `fdd/2021-05-26_defusing-mcf` (hard_404) — https://www.fdd.org/analysis/2021/05/26/defusing-military-civil-fusion/
- [secondary] `fireeye/2017-09-20_apt33-report` (review_low_overlap) — https://www.mandiant.com/resources/blog/apt33-insights-into-iranian-cyber-espionage
- [secondary] `google-tag/charming-kitten` (review_low_overlap) — https://blog.google/threat-analysis-group/
- [secondary] `halcyon/2025-07_pay2key-i2p` (review_low_overlap) — https://www.halcyon.ai
- [secondary] `ibm-xforce/2019-12_zerocleare` (review_low_overlap) — https://www.ibm.com/security/xforce
- [secondary] `ibm-xforce/2020-01_dustman-bapco` (review_low_overlap) — https://www.ibm.com/security/xforce
- [secondary] `kaspersky/2016-06-01_scarcruft-research` (review_low_overlap) — https://securelist.com/all/?tag=ScarCruft
- [secondary] `kela/2025-07_pay2key-i2p` (review_low_overlap) — https://ke-la.com
- [secondary] `lemonde/2014-03-21_snowglobe-piste-francaise` (review_low_overlap) — https://www.lemonde.fr/pixels/article/2014/03/21/cyberespionnage-la-piste-francaise_4387232_4408996.html
- [secondary] `mandiant/2018-02-20_apt37-reaper-report` (review_low_overlap) — https://www.mandiant.com/resources/blog/apt37-overlooked-north-korean-actor
- [secondary] `mandiant/2023-03-28_apt43-report` (hard_404) — https://services.google.com/fh/files/misc/apt43-report.pdf
- [secondary] `mcafee/2013-07-09_operation-troy` (soft404_homepage) — https://www.mcafee.com/enterprise/en-us/assets/white-papers/wp-dissecting-operation-troy.pdf
- [secondary] `reuters/2014-11-02_keypoint-breach` (soft404_homepage) — https://www.reuters.com/article/us-cybersecurity-keypoint/u-s-government-contractor-keypoint-says-it-suffered-cyber-breach-idUSKBN0J22GO20141119
- [secondary] `reuters/2016-05-15_tien-phong-attempted` (soft404_homepage) — https://www.reuters.com/article/us-cyber-heist-vietnam/cyber-attack-hit-vietnams-tien-phong-bank-idUSKCN0Y6092
- [secondary] `reuters/2022-01-14_fsb-revil-raid` (hard_404) — https://www.reuters.com/world/europe/russia-takes-down-revil-hacking-group-us-request-fsb-2022-01-14/
- [secondary] `skymavis/2022-04-27_root-cause-postmortem` (hard_404) — https://roninblockchain.substack.com/p/community-alert-ronin-validators
- [secondary] `swp/2020-07_turkish-foreign-policy-blue-homeland` (hard_404) — https://www.swp-berlin.org/en/publication/turkeys-blue-homeland-doctrine
- [secondary] `symantec/2011-02_w32-stuxnet-dossier` (review_low_overlap) — https://www.symantec.com/security_response/whitepapers.jsp
- [secondary] `symantec/2011-10-18_duqu-w32` (review_low_overlap) — https://www.symantec.com/security_response/whitepapers.jsp
- [secondary] `symantec/2013-06-26_darkseoul-four-years` (hard_404) — https://www.broadcom.com/support/security-center/protection-bulletin/four-years-of-darkseoul-cyberattacks-against-south-korea
- [secondary] `symantec/2024-08-30_stonefly-post-indictment` (hard_404) — https://www.security.com/threat-intelligence/stonefly-north-korea-extortion
- [secondary] `therecord/2022-12-21_cybercom-midterm` (review_low_overlap) — https://therecord.media/
- [secondary] `therecord/2024_hunt-forward-zambia` (review_low_overlap) — https://therecord.media/
- [secondary] `therecord/2025-05_dual-hat-separation-shelved` (review_low_overlap) — https://therecord.media/
- [secondary] `theregister/2025-07_pay2key-i2p` (review_low_overlap) — https://www.theregister.com
- [secondary] `timesofisrael/2020-12_shirbit` (review_low_overlap) — https://www.timesofisrael.com
- [secondary] `timesofisrael/2021-10_atraf-leak` (review_low_overlap) — https://www.timesofisrael.com
- [secondary] `uacrisis/russkiy-mir-quasi-ideology` (hard_404) — https://uacrisis.org/en/russkiy-mir-as-the-kremlin-s-quasi-ideology
- [secondary] `wapo/2013-08-30_black-budget-231-offensive-ops` (hard_404) — https://www.washingtonpost.com/world/national-security/us-spy-agencies-mounted-231-offensive-cyber-operations-in-2011-documents-show/2013/08/30/
- [secondary] `wapo/2017-07-16_qatar-uae-hack` (hard_404) — https://www.washingtonpost.com/world/national-security/uae-orchestrated-hacking-of-qatari-government-sites-sparking-regional-upheaval-according-to-us-intelligence-officials/2017/07/16/00f7e3da-6a6f-11e7-8eb5-cbccc2e7bfbf_story.html
- [secondary] `wapo/2020-10-09_nakashima-trickbot` (hard_404) — https://www.washingtonpost.com/national-security/cyber-command-trickbot-disruption/2020/10/09/19587aae-0a32-11eb-a166-dc429b380d10_story.html
- [secondary] `wsj/2024-09-25_salt-typhoon-telecom-breach` (hard_404) — https://www.wsj.com/articles/china-cyberattack-us-internet-providers-260bd835
- [secondary] `yahoo/2020_iran-soleimani-cyber-retaliation` (review_low_overlap) — https://www.yahoo.com/
- [secondary] `zdnet/2019-04-17_lab-dookhtegan-leak` (review_low_overlap) — https://www.zdnet.com
- [tertiary] `38north/2018-04-22_byungjin-completion-analysis` (hard_404) — https://www.38north.org/2018/04/byungjin-completion-analysis/
- [tertiary] `38north/2021-01-09_kim-8th-congress-report` (hard_404) — https://www.38north.org/2021/01/kim-jong-uns-report-to-the-8th-party-congress/
- [tertiary] `cpx/2024-10_state-of-cybersecurity-uae-report-2024` (hard_404) — https://www.cpx.net/media-center/press-releases/state-of-cybersecurity-in-the-uae/
- [tertiary] `fas/section-1642-analysis` (review_low_overlap) — https://fas.org/
- [tertiary] `idsa/2019-06-13_indias-defence-cyber-agency` (hard_404) — https://www.idsa.in/issuebrief/indias-defence-cyber-agency-mahapatra-130619
- [tertiary] `lawfare/2018_defend-forward-fischerkeller` (hard_404) — https://www.lawfaremedia.org/article/defending-forward-defending-cyberspace
- [tertiary] `lawfare/2022_biden-offensive-cyber-policy-changes` (review_low_overlap) — https://www.lawfaremedia.org/
- [tertiary] `lawfare/2023_dod-cyber-strategy-analysis` (hard_404) — https://www.lawfaremedia.org/article/the-2023-department-of-defense-cyber-strategy-what-s-next-
- [tertiary] `lawfare/2023_ncs-2023-analysis` (hard_404) — https://www.lawfaremedia.org/article/national-cybersecurity-strategy
- [tertiary] `lawfare/chesney-title-10-title-50` (review_low_overlap) — https://www.lawfaremedia.org/
- [tertiary] `lawfare/two-hats-better-than-two-heads` (review_low_overlap) — https://www.lawfaremedia.org/
- [tertiary] `opennukenet/2021-01_8th-congress-analysis` (hard_404) — https://opennuclear.org/publications/dprk-8th-congress
- [tertiary] `publicintelligence/dod-cyber-mission-analysis` (review_low_overlap) — https://publicintelligence.net/
- [tertiary] `reuters/2023-06-04_hakan-fidan-foreign-minister` (hard_404) — https://www.reuters.com/world/middle-east/erdogan-names-spymaster-fidan-foreign-minister-2023-06-04/
- [tertiary] `reuters/2024-03-28_russia-veto-poe` (hard_404) — https://www.reuters.com/world/russia-vetoes-renewal-un-monitors-north-korea-sanctions-2024-03-28/
- [tertiary] `sofrep/2017-05-12_turkish-intelligence-overhaul` (hard_404) — https://sofrep.com/news/turkey-intelligence-restructuring/
- [tertiary] `takshashila/2020-09_indian-intelligence-architecture` (review_low_overlap) — https://takshashila.org.in/
- [tertiary] `warontherocks/2018_persistent-engagement-healey` (review_low_overlap) — https://warontherocks.com/
- [tertiary] `warontherocks/2023-09_cyber-realism` (review_low_overlap) — https://warontherocks.com/