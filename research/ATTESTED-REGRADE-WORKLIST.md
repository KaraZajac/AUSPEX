# Attested-link re-grade worklist (2026-06-19)

> **STATUS (2026-06-19): the `a` bucket is DONE.** All 74 `a`-bucket events (94 attested links)
> were downgraded `attested → strongly_inferred`/`plausible`, each with an `inference_basis`
> (proximate signal + the goal the source does not name); 5 links found to genuinely name their
> goal were kept attested. Corpus attested links 350 → 256. Committed in 6 cluster commits
> (`4b632d9` kp · `ab08aa6` ncs · `df7042c` ru · `65aa7cf` ir · `14be5ad` cn · `c676c93` other);
> gate green throughout; **no `qc:` stamp written**. Still open: **R** (re-fetch first — several
> `a`/`ir`/`cn` links were downgraded *pending re-fetch* and can be restored once their source
> text is confirmed), **b**/**M** (keep + add source quote), **C**/**F**/**Z**.

_**Assistive triage, not verdicts.** Auto-bucketed from the census pre-pass `overclaimed` notes against the new WHY-ladder (`docs/SCHEMA.md` → doctrine-link confidence). **No labels were edited and no `qc:` stamp was written** — every disposition is Kara's to confirm per the per-event protocol. Buckets are heuristic from note text; read the note before acting. Order of operations: re-fetch **R** first (archive.org throttling permitting — several will resolve to genuine attestations and leave the pool), then work **b**/**M** (keep, add quote), then **a** (downgrade), then **C**/**F**._

| bucket | events | action |
|---|---:|---|
| **b** | 2 | KEEP `attested` + add source quote |
| **M** | 11 | SPLIT PER-LINK |
| **a** | 74 | DOWNGRADE `attested` → `strongly_inferred` |
| **R** | 64 | RE-FETCH FIRST |
| **C** | 3 | RE-POINT SOURCE |
| **F** | 14 | FIX REASONING |
| **Z** | 10 | INFERRED-SIDE overreach |


## b — KEEP `attested` + add source quote — goal named in substance, slug absent  (2)

### `2018-04/aa18-106a-russian-network-infrastructure`  — prepass: downgrade-confidence
- attested links: `uk/ncs-2016`
- note: attested + defender-response via the technical alert, reasoning calls it 'the canonical operational expression of the NCS 2016 deter pillar's attribution-as-deterrence framing'. Fetched alert is a technical IOC advisory — it does NOT contain deter/deterrence/attribution-as-deterrence language. The 'deter pillar' strategic goal is AUSPEX doctrinal interpretation, not stated by the source; attested label is therefore not strictly source-grounded. Perspective (defender-response, attributing-UK side) is reasonable.

### `2025-02/lockbit-bashe-reconstitution`  — prepass: needs-human-judgment
- attested links: `us/ncs-2023`
- note: us/ncs-2023 marked attested to an EMPTY source. Attested requires a non-null source that explicitly names the doctrine; an empty file names nothing — unverifiable, cannot stand as honest.


## M — SPLIT PER-LINK — one link honest (goal named), another overclaimed; grade each separately  (11)

### `2018-06/hunt-forward-montenegro`  — prepass: needs-human-judgment
- attested links: `us/hunt-forward`
- note: us/hunt-forward link 'attested' to attesting_source_id wapo/2019-05-07 — but that source has text_len 0, so nothing in it can name the doctrine. Attested requires the source to explicitly name the goal; an empty source cannot. The CYBERCOM index does not name a Montenegro Hunt Forward op either.

### `2019-06/iran-retaliation-tanker`  — prepass: fix-then-stamp
- attested links: `us/nspm-13`, `us/defend-forward`
- note: Both us/nspm-13 and us/defend-forward are marked confidence:attested to the WaPo article, but the fetched WaPo text names NEITHER NSPM-13 nor Defend Forward — it only reports the strike. The 'cited by officials as exercise of NSPM-13' claim is not in this text. Downgrade both to strongly_inferred unless a source that explicitly names them is cited. (us/ndaa-1642 strongly_inferred is fine.)

### `2020-09/trickbot-disruption`  — prepass: downgrade-confidence
- attested links: `us/defend-forward`
- note: us/defend-forward marked attested via WaPo, but WaPo's thin text never names Defend Forward; CyberScoop names 'persistent engagement' strategy, not Defend Forward. No attesting source explicitly names the doctrine. nspm-13 link is strongly_inferred (null) - honest.

### `2021-06/kaeri-kimsuky-intrusion`  — prepass: add-second-source
- attested links: `kr/nis-counter-dprk`
- note: confidence=attested with attesting_source_id=wikipedia/kaeri, but the Wikipedia article does NOT name the strategic goal (NIS counter-DPRK critical-infrastructure posture) — it only describes the institute. attested bar (source explicitly names the strategic goal) is not met.

### `2022-05/treasury-blender-mixer-sanction`  — prepass: fix-then-stamp
- attested links: `kp/8th-congress-defense-plan`
- note: Source DOES name the generic WMD goal ('generate revenue for its unlawful weapons of mass destruction (WMD) and ballistic missile programs'), so the WMD-financing assertion is grounded; BUT kp/8th-congress-defense-plan is a specific named doctrine the source never mentions - the attested link maps a generic WMD-financing line to a specific Party-Congress plan. Borderline: goal-language present, named-doctrine not.

### `2024-01/kv-botnet-follow-up`  — prepass: downgrade-confidence
- attested links: `us/ncs-2023`, `us/odni-ata-cyber`
- note: MIXED: us/odni-ata-cyber attested to 2025 ATA is HONEST — ATA explicitly names 'tracked publicly as Volt Typhoon... also referred to as Salt Typhoon' and PRC pre-positioning. BUT us/ncs-2023 attested to AA24-038A is OVERCLAIMED — the technical advisory never names the National Cybersecurity Strategy 2023 or a 'defend critical infrastructure' pillar; downgrade that link to strongly_inferred.

### `2024-02/isoon-leak`  — prepass: downgrade-confidence
- attested links: `cn/national-intelligence-law-2017`
- note: cn/national-intelligence-law-2017 link is confidence:attested with attesting_source_id = SentinelLabs, but the source text NEVER names the National Intelligence Law, '2017,' 'compelled vendor cooperation,' or that pillar. Per KEY RULE, attested requires the source explicitly name the strategic goal; it does not; should be strongly_inferred. (The cn/mcf link is correctly strongly_inferred with null attesting; fine.)

### `2024-09/kimsuky-klogexe-fpspy`  — prepass: fix-then-stamp
- attested links: `kp/strategic-information`
- note: Link kp/strategic-information confidence:attested with attesting_source_id=treasury/2023-11-30. Treasury DOES name a strategic-collection goal ('Kimsuky for gathering intelligence to support the DPRK's strategic objectives'). BUT the attested link binds THIS 2024 KLogEXE/FPSpy event to that doctrine, while Treasury predates and never mentions this tooling/event — the attestation is of the actor's general doctrine, not this event. The reasoning itself says target/tool 'align with' the doctrine (an inference). Borderline — recommend downgrade to strongly_inferred.

### `2025-04/fbi-salt-typhoon-bounty`  — prepass: downgrade-confidence
- attested links: `us/ncs-2023`
- note: us/ncs-2023 'attested' to the PSA, but the PSA does not name the 'National Cyber Strategy 2023' or 'Disrupt and Dismantle.' The bounty IS a cost-imposition/disruption action, but the source does not explicitly name the strategic doctrine. Borderline — attestation of the named goal is not in source; consider strongly_inferred.

### `2025-11/treasury-dprk-bankers-laundering`  — prepass: downgrade-confidence
- attested links: `kp/8th-congress-defense-plan`, `kp/office-39-sanctions-evasion`
- note: MIXED: kp/8th-congress-defense-plan attested is HONEST on substance — Treasury explicitly names WMD financing ('fund the regime's nuclear weapons program', 'WMD and ballistic missile programs') though not the literal '8th Congress' label. BUT kp/office-39-sanctions-evasion attested is OVERCLAIMED — source names the laundering/sanctions-evasion network but NEVER names 'Office 39'/'Bureau 39'; downgrade that link to strongly_inferred.

### `2026-01/state-dept-dprk-msmt-consolidation`  — prepass: needs-human-judgment
- attested links: `kp/8th-congress-defense-plan`, `kp/office-39-sanctions-evasion`
- note: Both links attested via State MSMT. Source DOES explicitly name the WMD-financing goal: 'These activities generate revenue for the DPRK's unlawful weapons of mass destruction (WMD) and ballistic missile programs.' That supports an attested WMD-financing/revenue goal. BUT the source does NOT name 'kp/8th-congress-defense-plan' or 'kp/office-39' constructs verbatim. If the doctrine_ids map to the WMD-financing goal generically, attested is legitimate; if they require the specific 8th-Congress/Office-39 framing, downgrade. Strongest goal-naming attestation in the chunk.


## a — DOWNGRADE `attested` → `strongly_inferred` — goal not named (only behaviour / weaker goal)  (74)

### `2009-07/anssi-establishment`  — prepass: downgrade-confidence
- attested links: `fr/lutte-informatique-defensive`
- note: fr/lutte-informatique-defensive confidence:attested with attesting_source_id anssi/about-anssi, but the fetched about-page text does NOT name 'lutte informatique defensive'/LID or the defensive-vs-offensive (DGSE) separation it supposedly attests. Only a general cyber-defence mission. Attested bar unmet → downgrade or cite a source naming LID and the structural separation.

### `2013-10/muscular-google-yahoo-disclosure`  — prepass: needs-human-judgment
- attested links: `uk/five-eyes`
- note: uk/five-eyes attested to WaPo: the captured excerpt never describes MUSCULAR as a joint GCHQ-NSA operation, never names GCHQ or 'Five Eyes' — it attributes solely to NSA. On available text the joint/Five-Eyes attestation is not present; downgrade to strongly_inferred unless a fuller WaPo capture is supplied. (Full article does support joint, but the fetched text does not.)

### `2014-06/opm-breach`  — prepass: downgrade-confidence
- attested links: `cn/mcf`
- note: cn/mcf marked confidence:attested with attesting_source=wikipedia/opm. Source documents SF-86 sensitivity and biometric/agent-identification value but does NOT explicitly name MCF / Military-Civil Fusion nor frame an IC statement on 'HUMINT-vetting value' as the strategic goal. Closer to strongly_inferred than attested. national-intelligence-law plausible (null attesting) fine.

### `2014-11/cable-wireless-gchq-partnership`  — prepass: needs-human-judgment
- attested links: `uk/five-eyes`
- note: uk/five-eyes link 'attested' to attesting_source_id spiegel/2014-12-28 with reasoning 'Snowden slides explicitly walk the Five Eyes partner-access model for the GERONTIC fibre taps.' The fetched text does NOT name GERONTIC or carrier fibre taps; it only references the 'Five Eyes alliance' generally. The attested claim's specific basis (GERONTIC carrier partnership) is absent — overclaimed.

### `2015-03/khnp-dprk-attribution`  — prepass: needs-human-judgment
- attested links: `kr/nis-counter-dprk`, `kr/nis-counter-dprk`
- note: Both kr/nis-counter-dprk links marked attested (perspective defender-response) with attesting_source=wikipedia/khnp — but that source does not contain the NIS attribution act. Attestation source is non-substantive. Also two near-identical attested links to the same doctrine_id may be redundant.

### `2015-12/sumit-gupta-belltrox-indictment`  — prepass: fix-then-stamp
- attested links: `in/contractor-hack-for-hire`
- note: in/contractor-hack-for-hire attested, reasoning 'The SDNY indictment characterizes the matter as a commercial hack-for-hire scheme'. Source is NDCA (not SDNY) and characterizes it as a private-investigator email-hacking conspiracy, not a 'commercial hack-for-hire scheme' — that framing is an AUSPEX inference.

### `2016-11/glowing-symphony`  — prepass: downgrade-confidence
- attested links: `us/defend-forward`
- note: us/defend-forward attested via the 2020 after-action, but that source does NOT contain 'Defend Forward' or 'Persistent Engagement' (both 0). The reasoning itself concedes the op 'pre-dat[es] the formal doctrine statement (2018)' and is cited 'retrospectively' — i.e. an analytic mapping, not attested in the cited source. Better as strongly_inferred.

### `2017-05/wannacry`  — prepass: downgrade-confidence
- attested links: `kp/byungjin`
- note: kp/byungjin attested to the Park complaint: the complaint frames WannaCry as destructive ransomware + attribution, NOT as a hard-currency/WMD-financing operation (revenue framing in the complaint attaches to Bangladesh Bank, not WannaCry). The link's own reasoning concedes 'actual revenue yield was accidental.' Downgrade attested to strongly_inferred/plausible.

### `2018-01/applejeus-campaign`  — prepass: downgrade-confidence
- attested links: `kp/byungjin`, `kp/8th-congress-defense-plan`
- note: Link 1 attested(WMD-financing) via AA21-048A, but the fetched AA21-048A names only sanctions evasion ('circumvent international sanctions on North Korea') — it does NOT name WMD/nuclear financing. So 'attributes proceeds to DPRK WMD financing' overstates the fetched source. Link 2 (TraderTraitor continuation) attested via AA22-108A is reasonable as continuation. Downgrade link 1 to strongly_inferred or cite AA20-239A/Treasury for WMD wording.

### `2018-01/mossad-iran-nuclear-archive-raid`  — prepass: downgrade-confidence
- attested links: `il/begin-doctrine`, `il/counter-iran-posture`
- note: Two links marked confidence:attested with attesting_source=wikipedia. KEY RULE fails: 'Begin Doctrine' appears ONLY in the article's navigation sidebar, not in body text framing this op; the source does NOT articulate a 'no-tolerance-regional-nuclear' goal in Netanyahu's reveal, nor name 'counter-iran-posture'. AMAD targeting is confirmed but the doctrine NAMES are AUSPEX constructs the tertiary source does not explicitly attest. Downgrade both to strongly_inferred, or supply a source where Netanyahu names the strategic goal.

### `2018-10/ira-disruption`  — prepass: downgrade-confidence
- attested links: `us/defend-forward`, `us/nspm-13`
- note: Both us/defend-forward and us/nspm-13 marked 'attested' via the WaPo source - but the WaPo text never names 'Defend Forward' or 'NSPM-13' (and the richer Nakasone testimony also has ZERO hits for 'NSPM', 'Defend Forward', or 'Internet Research Agency'). The operation is acknowledged but the doctrine names are not in any fetched source; these are strongly_inferred, not attested. us/ndaa-1642 strongly_inferred (null) - honest.

### `2018-11/texas-energy-apt31`  — prepass: downgrade-confidence
- attested links: `cn/mic2025`
- note: cn/mic2025 marked attested with attesting_source=treasury jy2205, but 'Made in China 2025' / MIC2025 power-equipment pillar is NOT named in the Treasury PR; the source frames it as 'critical infrastructure including the energy sector', a CI-targeting statement, not an industrial-policy doctrine attestation. KEY RULE fails — downgrade to strongly_inferred. cn/intelligentized-warfare is correctly plausible/null.

### `2019-02/bank-of-valletta`  — prepass: fix-then-stamp
- attested links: `kp/byungjin`
- note: attested kp/byungjin via CISA: CISA supports generic WMD-financing framing ('North Korea can use these funds for its UN-prohibited nuclear weapons and ballistic missile programs') but does NOT name the Bank of Valletta event or attest byungjin for THIS incident. 'attested' overreaches from a generic-campaign statement to event-specific attestation.

### `2019-08/apt41-double-dragon-mandiant`  — prepass: fix-then-stamp
- attested links: `cn/mic2025`
- note: cn/mic2025 marked confidence:attested with reasoning 'Report names targeted sectors that map 1:1 to MIC2025 pillars' — but the report names 'China's Five-Year economic development plans', NOT Made-in-China-2025/MIC2025, and does not name semiconductors. The strategic goal is not explicitly named; downgrade to strongly_inferred. (cn/mcf is correctly strongly_inferred.)

### `2020-05/wechat-international-surveillance-citizenlab`  — prepass: needs-human-judgment
- attested links: `cn/national-intelligence-law-2017`
- note: cn/national-intelligence-law-2017 marked attested, but Citizen Lab never names the 2017 NIL or 'compelled-vendor-cooperation'; it cites generic 'laws and regulations from Chinese authorities.' The cn/dsl-pipl link is plausible (null) - honest.

### `2020-10/emennet-proud-boys-voter-intimidation`  — prepass: fix-then-stamp
- attested links: `ir/cyber-deniable-retaliation`
- note: ir/cyber-deniable-retaliation marked attested via Treasury — Treasury attests the actor and the operation but does NOT name a 'deniable-retaliation' strategic goal; the doctrine label is AUSPEX framing, not literal attestation. ir/post-soleimani-retaliation correctly strongly_inferred (honest).

### `2021-03/exchange-proxylogon-hafnium`  — prepass: downgrade-confidence
- attested links: `cn/mcf`
- note: cn/mcf attested to WH statement: the source never names 'Military-Civil Fusion', 'MCF', 'MIC2025', or 'dual-use/strategic collection' — it frames the activity as 'irresponsible behavior', 'criminal contract hackers', IP theft 'for commercial advantage.' Strategic doctrine not named; downgrade attested to strongly_inferred. cn/national-intelligence-law-2017 (strongly_inferred) is honest.

### `2021-12/log4shell-dprk-exploitation`  — prepass: fix-then-stamp
- attested links: `kp/8th-congress-defense-plan`, `kp/8th-congress-defense-plan`
- note: Link 1 (attested) says 'financing of WMD programs' — the fetched AA23-040A says revenue 'supports DPRK national-level priorities and objectives, including cyber operations' but does NOT use 'WMD/nuclear'; the WMD gloss overreaches the source wording. Link 2 (attested) cites a doj/2024-07-25 Andariel/Rim Jong Hyok indictment that is NOT among the sources and 'Andariel' appears in neither fetched advisory — that attested claim is unverifiable from fetched text.

### `2022-03/google-tag-eastern-europe-disclosure`  — prepass: needs-human-judgment
- attested links: `ru/russkiy-mir`
- note: ru/russkiy-mir confidence:attested with attesting_source_id set — but source nowhere names 'Russkiy Mir' or any strategic doctrine; it is an operational IOC/activity blog. Attested bar unmet — at best inferred. (ru/nato-ultimatum-2021 strongly_inferred w/ null attester — fine.)

### `2022-04/cisa-aa22-108a-tradertraitor-advisory`  — prepass: fix-then-stamp
- attested links: `kp/8th-congress-defense-plan`
- note: kp/8th-congress-defense-plan attested with reasoning 'ties... targeting to DPRK WMD financing.' Fetched advisory says proceeds are 'to generate and launder funds to support the North Korean regime' — it does NOT say WMD or ballistic missiles. The attested goal ('regime financing') is in the text, but the specific WMD framing in the reasoning is an upgrade beyond what the advisory states. Tighten reasoning to 'support the North Korean regime' or cite a WMD-naming source.

### `2022-05/apt28-coldriver-post-invasion-phishing`  — prepass: fix-then-stamp
- attested links: `ru/russkiy-mir`
- note: ru/russkiy-mir marked attested with reasoning 'continuing targeting of Ukrainian media and government' — the targeting IS in the source, but the source does not name the Russkiy Mir doctrine; attestation overreaches a doctrine label onto descriptive TAG text. ru/nato-ultimatum-2021 (strongly_inferred) relies on the unsupported US-defense-contractor claim. Soften.

### `2022-06/russian-aligned-hacktivist-ddos-campaign`  — prepass: fix-then-stamp
- attested links: `ru/sanctions-response-2022`
- note: ru/sanctions-response-2022 confidence:attested (attesting=CISA AA22-110A) — CISA explicitly ties the DDoS to retaliation for materiel support to Ukraine, so the BEHAVIOR is named, but CISA does not name any codified 'sanctions-response-2022' doctrine/strategic goal; attested is borderline-strong for an analytic label. The duplicate ru/sanctions-response-2022 strongly_inferred (attesting=DOJ) and ru/nato-ultimatum-2021 (null) are honest inferences.

### `2022-07/albania-homeland-justice`  — prepass: fix-then-stamp
- attested links: `ir/cyber-deniable-retaliation`, `ir/constitutional-irgc-role`
- note: Both ir doctrine links are attested specifically to the TREASURY release, claiming Treasury 'explicitly cites the MEK presence in Albania.' But the fetched Treasury text does NOT contain 'MEK' / 'Mujahedin' / 'Homeland Justice' (it cites MOIS targeting Iranian dissidents generally). The MEK/Mujahideen nexus IS attested — but in the CISA AA22-264a text ('anti-Mujahideen E-Khalq (MEK) message'), not Treasury. The attestation is substantively sound but mis-attributed to the wrong source_id; re-point attesting_source_id to CISA AA22-264a.

### `2022-07/cisa-aa22-187a-maui-ransomware`  — prepass: fix-then-stamp
- attested links: `kp/8th-congress-defense-plan`
- note: kp/8th-congress-defense-plan attested via AA22-187A, but that advisory only says ransom may 'fund illicit activities' - it names neither the 8th Congress plan nor a WMD-financing goal. The companion AA23-040A does say revenue 'supports DPRK national-level priorities... including cyber operations' (a generic funding goal) but still not the named doctrine. Attested status overclaimed for the specific doctrine.

### `2022-09/najee-afkar-irgc-ransomware`  — prepass: fix-then-stamp
- attested links: `ir/sanctions-evasion`, `ir/asymmetric-warfare`
- note: ir/sanctions-evasion 'attested' to Treasury fair (names IRGC affiliation + ransomware-for-revenue + OFAC context). BUT ir/asymmetric-warfare 'attested' to CISA AA22-257A overclaimed: it's a technical TTP advisory, never uses 'asymmetric', frames no civilian-coercion intent, lists none of the cited victim set. Downgrade or re-cite to Treasury.

### `2023-01/swiftslicer-sandworm-ukraine`  — prepass: downgrade-confidence
- attested links: `ru/russkiy-mir`
- note: ru/russkiy-mir marked attested w/ ESET as attesting_source, but source never names Russkiy Mir doctrine or any strategic goal - it is analyst framing. Second link (military-doctrine-2014) is strongly_inferred, attesting null - honest.

### `2023-03/3cx-supply-chain`  — prepass: add-second-source
- attested links: `kp/8th-congress-defense-plan`
- note: kp/8th-congress-defense-plan confidence:attested, but Mandiant source does NOT name WMD/weapons-program financing - only crypto/fintech targeting. Attested requires source to name the strategic goal; it does not. Inference (strongly_inferred) would be honest.

### `2023-04/ghostwriter-pushcha-polish-lithuanian-info-ops`  — prepass: fix-then-stamp
- attested links: `ru/info-security-2016`
- note: ru/info-security-2016 marked attested (attacker-rationale) to this source, but the source does not name the actor, the campaign, or any doctrine; the attestation has no anchor in the fetched text. ru/sanctions-response-2022 strongly_inferred is also unsupported here.

### `2023-07/alphapo-coinspaid`  — prepass: fix-then-stamp
- attested links: `kp/8th-congress-defense-plan`
- note: kp/8th-congress-defense-plan attested via FBI PSA, but reasoning says PSA 'invokes the standard WMD-financing attestation pattern' - 'weapons'/'WMD' NOT in fetched PSA text. PSA attributes DPRK theft but does not name the weapons-program goal; Sinbad designation (cited) carries the WMD framing. Attribution attested; WMD-goal attestation leans on Sinbad not the PSA.

### `2023-08/qakbot-takedown`  — prepass: downgrade-confidence
- attested links: `us/ncs-2023`
- note: us/ncs-2023 marked 'attested'. The DOJ release uses 'disrupting and dismantling' verb phrasing but does NOT name the National Cybersecurity Strategy 2023 or its Disrupt-and-Dismantle pillar. The strategy goal is thematic, not explicitly named - this is at best strongly_inferred, not attested.

### `2023-09/mandiant-gru-telegram-personas-disclosure`  — prepass: downgrade-confidence
- attested links: `ru/sanctions-response-2022`, `ru/info-security-2016`
- note: ru/sanctions-response-2022 and ru/info-security-2016 both marked attested via Mandiant, but Mandiant names neither doctrine and frames this as wartime false-hacktivist fronts coordinating with the GRU — not a sanctions-response or named info-security doctrine. These are inferences mislabeled as attested. ru/military-doctrine-2014 correctly strongly_inferred.

### `2023-09/stake-com`  — prepass: downgrade-confidence
- attested links: `kp/8th-congress-defense-plan`
- note: kp/8th-congress-defense-plan attested via FBI PSA, reasoning 'FBI attribution invokes the standard WMD-financing attestation pattern' - but 'weapons'/'WMD' NOT in fetched PSA text. PSA attributes the DPRK theft but does not name the weapons-program goal. Attribution attested; WMD-goal link should be strongly_inferred or re-pointed to a Treasury release that names the goal.

### `2023-11/aliquippa-cyberav3ngers`  — prepass: fix-then-stamp
- attested links: `ir/cyber-deniable-retaliation`, `ir/forward-defense`
- note: Two 'attested' links to attesting_source_id treasury/2024-02-02 (OFAC). OFAC text does NOT name any doctrine ('cyber-deniable-retaliation' or 'forward-defense') and does NOT contain the 'made in Israel' HMI quote — that quote is in CISA, not OFAC. OFAC attests the actor/IRGC-CEC operator role but not the strategic-goal labels; analyst inference, not attestation. (resistance-axis correctly strongly_inferred.)

### `2023-11/midnight-blizzard-microsoft-corporate`  — prepass: downgrade-confidence
- attested links: `ru/info-security-2016`
- note: info-security-2016 link is confidence:attested with attesting_source_id=this MSRC post, but the post does NOT name a strategic goal/doctrine; it only says 'nation-state'/SVR and that actor sought 'information related to Midnight Blizzard itself.' The 2016 Information Security Doctrine frame is AUSPEX inference; should be strongly_inferred. fpc-2023 strongly_inferred is fine

### `2023-11/sandworm-microscada-power-disruption`  — prepass: downgrade-confidence
- attested links: `ru/energy-weaponization`, `ru/military-doctrine-2014`
- note: energy-weaponization attested is OK (substation disconnect 'coincided with mass missile strikes'). BUT military-doctrine-2014 marked attested for cyber-kinetic SYNCHRONISATION while Mandiant explicitly hedges: 'While we lack sufficient evidence to assess a possible link, we note that the timing of the attack overlaps with Russian kinetic operations.' The source does NOT attest deliberate synchronisation; downgrade. russkiy-mir strongly_inferred fine

### `2023-12/alphv-fbi-disruption`  — prepass: downgrade-confidence
- attested links: `us/ncs-2023`
- note: ncs-2023 link marked confidence:attested with attesting_source_id, but DOJ press release never names NCS-2023, 'Disrupt-and-Dismantle' pillar, or any strategic goal. Per KEY RULE attested is illegitimate here; this is at most an inference. Downgrade to strongly_inferred or supply a source that names the pillar.

### `2023-12/star-blizzard-fsb-indictment-sanctions`  — prepass: downgrade-confidence
- attested links: `ru/info-security-2016`, `ru/fpc-2023`
- note: BOTH attested links overclaim. ru/info-security-2016 (attested to CISA): sources name FSB Centre 18 but never name the 2016 Information Security Doctrine or an info-confrontation strategic goal. ru/fpc-2023 (attested to DOJ): indictment names UK/US policy-elite targets + the 2019 leak but never names the Foreign Policy Concept 2023 — it is a criminal-intrusion/malign-influence charge, not a doctrine articulation. Downgrade both to strongly_inferred. ru/nss-2021 (strongly_inferred) is honest.

### `2024-01/carr-texas-water-utility-intrusions`  — prepass: fix-then-stamp
- attested links: `ru/sanctions-response-2022`, `ru/sanctions-response-2022`
- note: ru/sanctions-response-2022 marked attested via Treasury — Treasury describes attacks 'against governments and companies located in countries that have supported Ukraine,' which supports the framing, but does not NAME a 'sanctions-response-2022' strategic doctrine; this is AUSPEX interpretation, not literal attestation. ru/nato-ultimatum-2021 correctly strongly_inferred (honest).

### `2024-02/moobot-apt28-botnet-disruption`  — prepass: downgrade-confidence
- attested links: `ru/nato-ultimatum-2021`
- note: ru/nato-ultimatum-2021 marked attested w/ DOJ attesting source, but source frames targeting of US/NATO/EU members assisting Ukraine generically; it does NOT name a 2021 NATO-ultimatum strategic goal — linkage is inference, not explicit attestation. ru/sanctions-response-2022 strongly_inferred (null attesting) is fine.

### `2024-02/ofac-cyberav3ngers-irgc-io-designations`  — prepass: fix-then-stamp
- attested links: `ir/cyber-deniable-retaliation`
- note: ir/cyber-deniable-retaliation marked confidence:attested to this release, but the release does NOT name a 'deniable retaliation' strategic goal, nor the CyberAv3ngers persona. It names IRGC-CEC operation of critical-infrastructure attacks. Reasoning ('attests IRGC-IO operation of the CyberAv3ngers persona') is not supported by the text. Downgrade to strongly_inferred.

### `2024-02/operation-cronos-lockbit`  — prepass: fix-then-stamp
- attested links: `us/ncs-2023`, `us/ncs-2023`
- note: Two us/ncs-2023 links marked confidence:attested, but neither fetched source has body text naming the Disrupt-and-Dismantle strategic goal. attesting_source_id is non-null but the source text does not NAME the goal — fails the attested rule on this fetch.

### `2024-03/acidpour-sandworm-ukraine-isp-wiper`  — prepass: downgrade-confidence
- attested links: `ru/russkiy-mir`
- note: ru/russkiy-mir marked attested via SentinelOne, but source never names a 'Russkiy Mir' strategic goal — it documents a destructive Ukraine-theater wiper. Linkage is inference labeled as attestation. ru/military-doctrine-2014 strongly_inferred (null attesting) is fine.

### `2024-03/lockbit-affiliate-matveev-sanctions`  — prepass: fix-then-stamp
- attested links: `us/ncs-2023`
- note: Link us/ncs-2023 'attested' (perspective defender-response) to attesting_source_id treasury/2023-05-16. The Treasury text never names the 2023 National Cybersecurity Strategy or its 'Disrupt and Dismantle' pillar; it speaks generically of 'all available authorities and tools'. Naming NCS-2023 Disrupt-and-Dismantle is inference, not attestation — strongly_inferred at most.

### `2024-04/mandiant-apt44-sandworm-promotion`  — prepass: downgrade-confidence
- attested links: `ru/military-doctrine-2014`, `ru/russkiy-mir`
- note: ru/military-doctrine-2014 attested — source uses 'information confrontation' concept and integration with conventional forces but does NOT name the '2014 Military Doctrine'; inferential. ru/russkiy-mir attested with reasoning merely 'report centred on Ukraine-theater' — Russkiy Mir not named in source; clear overclaim. ru/sanctions-response-2022 strongly_inferred (non-null attesting OK); persona coordination (XakNet/CARR) not in this excerpt though referenced in summary.

### `2024-04/viginum-portal-kombat-extension`  — prepass: downgrade-confidence
- attested links: `fr/lutte-informatique-influence`
- note: fr/lutte-informatique-influence attested, but source does not name 'lutte informatique d'influence (LII)' doctrine — it is a rolling technical follow-up report. Reasonable inference but not explicit attestation.

### `2024-05/dmm-bitcoin`  — prepass: downgrade-confidence
- attested links: `kp/8th-congress-defense-plan`
- note: kp/8th-congress-defense-plan attested, but the FBI source only says proceeds 'generate revenue for the regime' — it does NOT name WMD/nuclear/8th-Congress-defense-plan. The WMD-financing strategic goal is not explicitly attested in this particular source; linkage is inference.

### `2024-05/moonstone-sleet-microsoft-disclosure`  — prepass: downgrade-confidence
- attested links: `kp/8th-congress-defense-plan`
- note: First kp/8th-congress-defense-plan link marked attested, but MSTIC says only 'financial gain'/'revenue generation' - never names 8th Congress plan or WMD-financing; reasoning concedes it is 'consistent with the standard DPRK WMD-financing pattern' (an inference). The duplicate strongly_inferred link even admits 'MSTIC stops short of an explicit doctrinal call-out.' Attested status unsupported. Also note duplicate doctrine_id with two confidence levels.

### `2024-06/anssi-nobelium-france-attribution`  — prepass: downgrade-confidence
- attested links: `fr/lutte-informatique-defensive`
- note: fr/lutte-informatique-defensive attested (perspective defender-response) — the defender-response framing of a CERT-FR public attribution is reasonable, but the source does not name 'lutte informatique défensive (LID)'; the doctrine-document linkage is inference, so 'attested' is slightly strong.

### `2024-06/viginum-matriochka-disclosure`  — prepass: fix-then-stamp
- attested links: `fr/lutte-informatique-influence`, `fr/lutte-informatique-influence`
- note: Two doctrine_links are DUPLICATES — both fr/lutte-informatique-influence, both attested, same source, different reasoning phrasings. One is redundant. Also: source does not name 'lutte informatique d'influence (LII)'; attested rests on inference.

### `2024-07/aa24-207a-andariel-joint-advisory`  — prepass: needs-human-judgment
- attested links: `kr/nis-counter-dprk`, `kr/korus-cyber-cooperation`, `uk/ncs-2022`
- note: Three attested links (kr/nis-counter-dprk, kr/korus-cyber-cooperation, uk/ncs-2022) hang on the co-signatory FACT, which IS in the source (NIS, NPA, NCSC-UK named as authoring partners) — that part is attested. But the specific national DOCTRINE documents (NIS counter-DPRK pillar, KORUS framework, UK NCS-2022 Pillar 4) are not named in the advisory; the doctrine-to-document mapping is inference. Co-signing attested, doctrine label slightly strong.

### `2024-07/mandiant-apt45-andariel-graduation`  — prepass: fix-then-stamp
- attested links: `kp/8th-congress-defense-plan`, `kp/8th-congress-defense-plan`
- note: Both doctrine_links mark kp/8th-congress-defense-plan confidence:attested, but attesting_source_id is the Mandiant blog (link 1) which never names the 8th-Congress defense plan, the 13-system list, or that ransomware funds DIB collection (it explicitly cannot confirm APT45 ransomware). Link 2 also cites Mandiant for the revenue-funds-collection loop the source does not state. The actual attestation would be the DOJ indictment (not fetched). As written, 'attested' to this source is not legitimate.

### `2024-08/citrine-sleet-chrome-zero-day`  — prepass: downgrade-confidence
- attested links: `kp/8th-congress-defense-plan`
- note: kp/8th-congress-defense-plan marked confidence:attested to the MSTIC blog, but the source never names the 8th-Congress defense plan; it says crypto theft 'to generate and launder funds to support the North Korean regime.' Crypto-for-revenue is supported, but 'attested' to this specific defense-plan doctrine is an inference — should be strongly_inferred, and reasoning overstates 'pre-positioning for follow-on crypto theft / WMD-financing.'

### `2024-08/cybercom-iran-2024-election`  — prepass: needs-human-judgment
- attested links: `us/defend-forward`
- note: us/defend-forward 'attested' via the ODNI statement, which does NOT name Defend Forward or acknowledge any offensive operation. us/ndaa-1642 strongly_inferred (null) - honest. The Defend-Forward attestation overreaches a defensive attribution statement.

### `2024-09/flax-typhoon-raptor-train-takedown`  — prepass: downgrade-confidence
- attested links: `cn/intelligentized-warfare`, `cn/national-intelligence-law-2017`
- note: cn/national-intelligence-law-2017 (attested) is well-supported by the chairman-admission quote. BUT cn/intelligentized-warfare marked confidence:attested — the source frames Raptor Train as botnet/proxy/pre-positioning but never names or attests 'intelligentized warfare'; that doctrine label is an inference and should be strongly_inferred. cn/taiwan-reunification strongly_inferred (null attesting) is fine; note source contains no Taiwan reference.

### `2024-10/cisa-aa24-290a-iranian-brute-force`  — prepass: fix-then-stamp
- attested links: `ir/asymmetric-warfare`
- note: ir/asymmetric-warfare marked attested with reasoning 'civilian-CII-coercion pillar' — but the source frames the motive as credential/access harvesting for SALE to cybercriminals, not coercion; the 'coercion' characterization overstates the source. Consider rewording the attested reasoning to access-brokering, or downgrade. ir/sanctions-evasion plausible (null attesting) is honest.

### `2024-11/anssi-health-sector-state-of-threat`  — prepass: downgrade-confidence
- attested links: `fr/lutte-informatique-defensive`, `fr/lutte-informatique-defensive`
- note: fr/lutte-informatique-defensive 'attested' (x2 duplicate). The CERT-FR page does NOT name the LID doctrine, nor OIV/OSE, nor a 'cert-fr-coordination function' - those are AUSPEX framings. Publishing a threat report is consistent with LID but the doctrine/pillar is not named in the source; this is strongly_inferred, not attested.

### `2024-11/storm-2372-teams-device-code-phishing`  — prepass: downgrade-confidence
- attested links: `ru/info-security-2016`
- note: ru/info-security-2016 marked attested via MSFT, but the blog never names the 2016 Information Security Doctrine or any strategic goal; pure analyst framing. The two strongly_inferred links (null attesting) are honest.

### `2024-12/doj-14-national-it-worker-indictment`  — prepass: fix-then-stamp
- attested links: `kp/8th-congress-defense-plan`, `kp/office-39-sanctions-evasion`
- note: kp/office-39-sanctions-evasion attested — well-supported (named PRC/Russia front companies + explicit 'sanctions evasion' framing). BUT kp/8th-congress-defense-plan attested to this release — the release says proceeds benefit 'the DPRK government' generally and never names the 8th-Congress defense plan, WMD, or defense funding. That link is overclaimed as attested; should be strongly_inferred (or dropped).

### `2025-01/ofac-flax-typhoon-integrity-tech`  — prepass: downgrade-confidence
- attested links: `cn/national-intelligence-law-2017`, `cn/intelligentized-warfare`
- note: Both attested links overclaim what the release names. cn/national-intelligence-law-2017 'attested' - but the release never mentions the National Intelligence Law or compelled vendor cooperation; it only states Integrity Tech supported state-sponsored ops. cn/intelligentized-warfare 'attested' - release names 'critical infrastructure sectors' but never 'intelligentized warfare' nor 'pre-positioning'. Both are inferences, not source-named goals.

### `2025-01/treasury-salt-typhoon-sanctions`  — prepass: downgrade-confidence
- attested links: `us/ncs-2023`
- note: us/ncs-2023 marked attested, reasoning 'Officially framed under NCS 2023 Pillar 2.' The PR never mentions the National Cyber Strategy 2023 or 'Pillar 2'; it cites E.O. 13694 authorities only. Goal/doctrine not named by source.

### `2025-06/salt-typhoon-canada-telecom`  — prepass: fix-then-stamp
- attested links: `cn/intelligentized-warfare`
- note: cn/intelligentized-warfare 'attested' to globemail/2025-06-20 — but that Dec-2024 article neither confirms the Canadian breach nor names a SIGINT-collection doctrine. The reasoning even concedes attestation comes from the LATER August AA25-239A advisory. Attesting source mislabeled and does not name the goal; reassign to Dark Reading/CCCS or downgrade.

### `2025-07/ofac-aeza-bulletproof-hosting`  — prepass: fix-then-stamp
- attested links: `us/ncs-2023`
- note: us/ncs-2023 marked attested to the Treasury source, but neither source names 'National Cybersecurity Strategy', 'NCS-2023', 'Pillar 2', or 'disrupt and dismantle'; Chainalysis uses only thematic 'attacking the supply chain' language. ru/sanctions-response-2022 (strongly_inferred) is honest. Attested NCS-2023 should downgrade to strongly_inferred/plausible.

### `2025-07/toolshell-sharepoint-mass-exploitation`  — prepass: add-second-source
- attested links: `cn/mcf`
- note: cn/mcf 'attested' to microsoft/2025-07 with reasoning 'Public reporting of NNSA-related entity targeting attests the MCF dual-use-research pillar' — but the cited Microsoft source NAMES NO NNSA targeting. The strategic-goal (nuclear dual-use collection) is not in the attesting source; attestation rule violated. cn/mic2025 and cn/national-intelligence-law-2017 correctly strongly_inferred.

### `2025-10/cisa-vmware-cve-2025-41244-unc5174`  — prepass: fix-then-stamp
- attested links: `cn/national-intelligence-law-2017`
- note: cn/national-intelligence-law-2017 confidence:attested citing NVISO, but NVISO only says 'Chinese state-sponsored threat actor' — it does NOT name the 2017 National Intelligence Law, nor call UNC5174 an 'MSS contractor' (the reasoning's 'Mandiant explicitly names UNC5174 as an MSS contractor' is NOT in fetched NVISO text). Attested bar unmet → strongly_inferred, or attest to a Mandiant source that states the contractor relationship. (cn/intelligentized-warfare strongly_inferred w/ null attester — fine.)

### `2025-11/upbit-woo-x-dprk-thefts`  — prepass: add-second-source
- attested links: `kp/byungjin`, `kp/8th-congress-defense-plan`
- note: Both links confidence:attested via Chainalysis recap, but fetched recap text does not name 'kp/byungjin' or 'kp/8th-congress-defense-plan', nor does it tie these specific thefts to the 8th-Congress defense plan by name. Aggregate WMD-financing framing is industry-standard but the specific-doctrine attestation overreaches; downgrade to strongly_inferred or cite a source naming the goal.

### `2025-12/chainalysis-2025-cumulative-crypto-theft`  — prepass: downgrade-confidence
- attested links: `kp/8th-congress-defense-plan`
- note: Single attested link to 8th-congress-defense-plan; reasoning openly states the aggregate 'inherits the attestation' from per-event USG attributions. Fetched Chainalysis text does not itself name the 8th-Congress defense plan or the WMD-financing goal in the captured portion — the FBI Bybit PSA (other source) likewise lists addresses, not a strategic-goal statement. Inheritance-of-attestation is an inference, not direct attestation; downgrade to strongly_inferred or cite the underlying USG WMD-financing language.

### `2025-12/cisa-aa25-343a-pro-russia-hacktivists`  — prepass: downgrade-confidence
- attested links: `ru/sanctions-response-2022`
- note: First link attested to ru/sanctions-response-2022, but CISA advisory describes TTPs/sectors and GRU dissatisfaction — it does NOT name a '2022 sanctions-response doctrine' or a performative-disruption strategic goal. The attested label is an AUSPEX construct the source does not name; downgrade to strongly_inferred. Second link (strongly_inferred, mobilization pillar) is a reasonable inference.

### `2025-12/doj-carr-noname-disruption`  — prepass: needs-human-judgment
- attested links: `ru/sanctions-response-2022`
- note: First link attested to ru/sanctions-response-2022: DOJ explicitly establishes GRU direction + CISM state-sanctioning (criminal-proxy mobilization is well-supported as a FACT), but DOJ does not name a '2022 sanctions-response doctrine' strategic-goal construct. The proxy-mobilization attestation is the strongest in the chunk; if the doctrine_id denotes the proxy-mobilization pillar generically the attested label is defensible — needs-human-judgment on whether DOJ's GRU/CISM language counts as naming the goal. Second link strongly_inferred (aid-state targeting) reasonable.

### `2025-12/muddywater-muddyviper-israel`  — prepass: add-second-source
- attested links: `ir/resistance-axis`
- note: First link attested to ir/resistance-axis via THN, but the article does not name an 'axis of resistance' / 'resistance-axis' strategic goal — it describes espionage targeting of Israeli sectors. Attested label overreaches the vendor blog; downgrade to strongly_inferred. Second link (forward-defense, strongly_inferred) is a reasonable inference.

### `2026-01/fbi-kimsuky-quishing-advisory`  — prepass: downgrade-confidence
- attested links: `kp/strategic-information`
- note: kp/strategic-information 'attested'. The advisory describes the target set (think tanks/academia/foreign-policy experts) but does NOT name any DPRK 'strategic information' collection doctrine or strategic goal. Target description != doctrine attestation; this is strongly_inferred, not attested.

### `2026-01/ofac-zedcex-zedxion`  — prepass: fix-then-stamp
- attested links: `ir/sanctions-evasion`
- note: Link ir/sanctions-evasion confidence:attested with attesting_source_id=treasury/2026-01-15 (non-null). But the fetched text does NOT mention IRGC, sanctions-evasion, Zedcex, or Zedxion at all. As fetched, the source does not support 'attested' — an attested link whose source does not name the goal.

### `2026-04/cisa-aa26-097a-irgc-plc-reissue`  — prepass: downgrade-confidence
- attested links: `ir/cyber-deniable-retaliation`, `ir/forward-defense`
- note: Both links attested via the CISA advisory, but the advisory does NOT name 'cyber-deniable-retaliation' or 'forward-defense' or Israel — no 'retaliat/deniable/forward defen/Israel' strings present. It describes IRGC-CEC PLC targeting of US critical infrastructure. Both attested doctrine labels are AUSPEX constructs the source does not name; downgrade both to strongly_inferred (the IRGC-CEC affiliation is attested, the strategic-goal framing is inferred).

### `2026-04/cisa-aa26-113a-china-covert-botnets`  — prepass: downgrade-confidence
- attested links: `cn/intelligentized-warfare`
- note: First link attested to cn/intelligentized-warfare, but advisory does not name 'intelligentized warfare,' 'informationization,' or 'military-civil fusion' — it describes pre-positioning + espionage via botnets. Attested label not supported by source naming; downgrade to strongly_inferred (which is also present as a second link). Third link (national-intelligence-law-2017, plausible, null attesting) is a fine inference.

### `2026-04/drift-protocol-dprk-285m`  — prepass: downgrade-confidence
- attested links: `kp/byungjin`, `kp/8th-congress-defense-plan`
- note: Both links attested (byungjin via Elliptic, 8th-congress via Chainalysis), but neither fetched source names 'byungjin' or '8th Congress defense plan' — the captured texts hedge even the attribution ('likely/suspected DPRK'), let alone the strategic goal. Attested doctrine labels overreach; downgrade to strongly_inferred or plausible given the suspected-attribution posture.


## R — RE-FETCH FIRST — attesting source returned empty/dead text; undecidable until resolved  (64)

### `2007-01/tao-cumulative-2011-231-ops`  — prepass: fix-then-stamp
- attested links: `us/title-10-title-50`
- note: us/title-10-title-50 marked attested via WaPo, but WaPo text names neither Title 10/Title 50 nor PPD-20; reasoning cites 'leaked PPD-20' yet the PPD-20 source text did not fetch (no Title-50 SIGINT-tempo language available). Attestation chain unverifiable.

### `2010-01/rok-cyber-command-establishment`  — prepass: needs-human-judgment
- attested links: `kr/defense-cyber-policy-mnd`
- note: kr/defense-cyber-policy-mnd 'attested' but attesting_source_id (src0) is EMPTY -> overclaimed. kr/nis-counter-dprk (strongly_inferred, src1) HONEST — src1 states 'the National Intelligence Service named North Korea as the perpetrator.'

### `2010-01/su-bin-aviation-ip`  — prepass: fix-then-stamp
- attested links: `cn/mcf`
- note: cn/mcf marked attested ('plea agreement explicitly identifies PLA tasking and PRC end-use'), but the fetched body is empty — the PLA-tasking naming claim cannot be verified. cn/mic2025 correctly strongly_inferred (notes it pre-dates 2015 MIC2025).

### `2013-06/snowden-disclosures`  — prepass: fix-then-stamp
- attested links: `us/title-10-title-50`, `us/five-eyes`
- note: us/title-10-title-50 marked attested to the DOJ-charges source (a WaPo charging article) — but that article does NOT discuss FAA 702 / EO 12333 / Title-50 collection architecture; it reports the charges only. Attestation overreaches. us/five-eyes attested to intercept/snowden-archive is partly defensible — the index does surface 'Five-Eyes Interoperability Discussions' and UKUSA partner items — but only as headlines on an index page, not the substantive document; treat as strongly_inferred until an actual document is cited.

### `2014-02/sands-casino-destructive`  — prepass: downgrade-confidence
- attested links: `ir/constitutional-irgc-role`
- note: ir/constitutional-irgc-role marked attested with attesting_source=ODNI Clapper testimony, but that source (12 chars) did NOT resolve, and the Bloomberg/CNN text does not name a constitutional-IRGC strategic goal. KEY RULE unmet (attesting source empty). ir/cyber-deniable-retaliation correctly strongly_inferred/null.

### `2014-06/dragonfly-energetic-bear`  — prepass: fix-then-stamp
- attested links: `ru/energy-weaponization`
- note: ru/energy-weaponization 'attested' via the 2022 DOJ Berserk Bear indictment, which returned 3 chars. The claimed 'explicitly identifies the pre-positioning purpose' cannot be confirmed - Symantec doesn't use 'pre-position' either. ru/military-doctrine-2014 strongly_inferred (null source) - honest.

### `2014-12/operation-cleaver`  — prepass: add-second-source
- attested links: `ir/asymmetric-warfare`
- note: ir/asymmetric-warfare 'attested' via an empty Cylance source. The 'explicitly frames the campaign as pre-positioning across 16 countries' claim cannot be confirmed. ir/forward-defense strongly_inferred (null) - honest.

### `2015-12/tien-phong-bank-swift`  — prepass: fix-then-stamp
- attested links: `kp/byungjin`
- note: kp/byungjin marked attested to the DOJ Park Jin Hyok complaint, but that source fetched as 3 chars (empty). The attestation that the complaint 'explicitly identifies SWIFT fraud as sanctions-evasion revenue' cannot be verified from the fetched text. Downgrade or re-fetch.

### `2016-02/bangladesh-bank-swift`  — prepass: needs-human-judgment
- attested links: `kp/byungjin`
- note: kp/byungjin link 'attested' citing DOJ 2021 indictment, but that source is EMPTY — regime-revenue/Byungjin goal not named in any usable text. Attesting source non-resolving.

### `2016-08/shadow-brokers-leak`  — prepass: needs-human-judgment
- attested links: `us/title-10-title-50`
- note: doctrine_link us/title-10-title-50 confidence:attested with attesting_source_id=nyt/2016-08-19 — but that source is an unreadable JS stub and cannot name the VEP/title-10-50 goal. No resolving source mentions VEP at all. Attested bar unmet; downgrade or re-fetch.

### `2016-10/lazarus-polish-banks`  — prepass: needs-human-judgment
- attested links: `kp/byungjin`
- note: kp/byungjin marked attested to DOJ Park complaint, but that source fetch is blank (no text), so the WMD-financing/sanctions-evasion goal is not named in available text; attested unverifiable.

### `2017-03/vault7-leak`  — prepass: fix-then-stamp
- attested links: `us/title-10-title-50`
- note: us/title-10-title-50 'attested' via the Schulte conviction source, which returned only 3 chars. The Title 50 Sec 3093 covert-action framing and reform claims are not in any resolved source. Attested status unsubstantiated by fetched text.

### `2017-04/berserk-bear-us-energy-campaign`  — prepass: fix-then-stamp
- attested links: `ru/energy-weaponization`
- note: ru/energy-weaponization is marked attested with attesting_source_id = DOJ indictment, whose fetched text is EMPTY. The cited goal phrase 'establishing access to industrial control systems' does not appear in the fetched CISA text and cannot be verified in the named (empty) attestation source. attested bar not met on fetched evidence. ru/military-doctrine-2014 strongly_inferred is honest.

### `2018-02/revue-strategique-cyberdefense-publication`  — prepass: fix-then-stamp
- attested links: `fr/revue-strategique-cyberdefense-2018`
- note: fr/revue-strategique-cyberdefense-2018 is 'attested' with non-null attesting_source_id, but the source's fetched text is EMPTY (len 0). Self-referential (event IS the publication) makes it likely legitimate, but an attested link backed by an empty source must be flagged.

### `2018-04/opcw-hague-interdicted`  — prepass: add-second-source
- attested links: `ru/info-security-2016`
- note: ru/info-security-2016 attested (attesting=DOJ Morenets indictment) on the claim the indictment frames the op as retaliation against OPCW/McLaren accountability mechanisms — but DOJ text fetched empty, so the explicit naming cannot be confirmed. Attested unsubstantiable from fetched text.

### `2018-06/cnmf-virustotal-cumulative`  — prepass: fix-then-stamp
- attested links: `us/persistent-engagement`
- note: us/persistent-engagement marked attested ('self-acknowledged via the CNMF VirusTotal account'), but the fetched VirusTotal page carries no content acknowledging anything. Attested rests on an empty shell.

### `2018-10/ncsc-gru-calling-out`  — prepass: fix-then-stamp
- attested links: `uk/ncs-2016`
- note: uk/ncs-2016 (perspective: defender-response) marked attested via the NCSC release, but that release fetched 0 chars (null url). Attested cannot rest on an empty body.

### `2019-01/parly-lio-doctrine-speech`  — prepass: add-second-source
- attested links: `fr/lutte-informatique-offensive`
- note: fr/lutte-informatique-offensive 'attested' via a source that returned no text. The claim 'the event is the public announcement of the doctrine itself' is plausible historically but unverifiable from fetched material; attested status not substantiated.

### `2019-04/rok-national-cybersecurity-strategy`  — prepass: downgrade-confidence
- attested links: `kr/ncss-2019`
- note: kr/ncss-2019 marked attested ('the event IS the doctrinal publication'), but attesting_source_id is a TERTIARY Wikipedia article that did not even fetch. Attested confidence cannot rest on an empty tertiary reference — needs the primary ROK government strategy document.

### `2019-04/uae-ncs-publication`  — prepass: fix-then-stamp
- attested links: `ae/ncs-2019`
- note: ae/ncs-2019 marked attested ('self-attesting'), but attesting_source_id resolves to nothing (empty, null url). A self-attesting publication still needs the publication text; with no body, attested cannot stand.

### `2019-07/mozilla-distrust-darkmatter-ca`  — prepass: add-second-source
- attested links: `ae/procurement-led-capability`
- note: ae/procurement-led-capability marked attested with the (empty) Mozilla source as attester and reasoning that Mozilla 'explicitly framed' DarkMatter as offensive-cyber-aligned - but no Mozilla text was fetched, so the 'explicit framing' cannot be confirmed. Attested status unverifiable.

### `2020-07/mss-guangdong-li-xiaoyu-indictment`  — prepass: fix-then-stamp
- attested links: `cn/mic2025`, `cn/mcf`, `cn/national-intelligence-law-2017`
- note: THREE links (cn/mic2025, cn/mcf, cn/national-intelligence-law-2017) all marked attested with detailed 'indictment names X' reasoning, but the fetched body is empty — none of these naming claims can be verified. Three attested labels resting on an unfetched body is a notable overreach.

### `2020-09/apt41-global-campaign-indictment`  — prepass: add-second-source
- attested links: `cn/mic2025`
- note: cn/mic2025 marked attested (attesting=doj indictment) on the basis that the indictment 'names targeting of telecom, semiconductors, biotech, software' — but the DOJ text fetched empty, so the explicit strategic-goal naming cannot be confirmed. cn/mcf and cn/taiwan-reunification are strongly_inferred/null and honest as inferences.

### `2020-11/ncf-public-establishment`  — prepass: fix-then-stamp
- attested links: `uk/ncf-doctrine`
- note: uk/ncf-doctrine 'attested' via the empty gov.uk PM NCF announcement source - cannot be confirmed. uk/ncs-2022 is strongly_inferred (separate source) - that framing is honest.

### `2020-11/uae-csc-establishment`  — prepass: fix-then-stamp
- attested links: `ae/digital-economy-protection`
- note: attested ae/digital-economy-protection cites attesting_source_id u-ae/csc-mandate, but that source has len=0 — an 'attested' link cannot stand on an empty source that names nothing. Must downgrade until a source text names the defensive-coordination / digital-economy-protection goal.

### `2021-02/three-hacker-indictment`  — prepass: fix-then-stamp
- attested links: `kp/byungjin`
- note: kp/byungjin marked attested ('the indictment text itself is the canonical doctrine-attestation document'), but the indictment body did not fetch (3 chars) — the attestation cannot be verified against an empty source.

### `2021-04/aa21-116a-svr-cyber-operations`  — prepass: downgrade-confidence
- attested links: `uk/ncs-2016`
- note: uk/ncs-2016 attested to a US CISA/FBI/DHS technical advisory that never mentions the UK National Cyber Security Strategy 2016 or any 'deter' pillar — it is a TTP/network-defense document. Attested cannot stand; downgrade to strongly_inferred. Compounding: the NCSC-UK source that could support a UK-doctrine framing is empty.

### `2021-07/ncf-samlesbury-headquarters-announcement`  — prepass: fix-then-stamp
- attested links: `uk/ncf-doctrine`
- note: uk/ncf-doctrine confidence:attested with attesting_source_id set — but the attesting source has text_len 0, so it cannot name the doctrinal goal. Cannot be 'attested' against empty text. (Second link uk/ncs-2016 plausible w/ null attester — correctly an inference, honest.)

### `2021-09/doj-baier-adams-gericke-dpa`  — prepass: fix-then-stamp
- attested links: `ae/procurement-led-capability`
- note: ae/procurement-led-capability marked 'attested' to the DOJ DPA, but that source's fetched text is empty (len=4). Attested cannot stand on a source with no retrievable text naming the strategic intent.

### `2021-09/eu-belarus-ghostwriter-statement`  — prepass: fix-then-stamp
- attested links: `by/concept-info-security-2019`
- note: by/concept-info-security-2019 marked confidence:attested to the EU declaration, but the declaration text did not fetch (88-char stub), so the attestation is unsubstantiated. Reasoning also concedes it is the 'EU-side framing' of Belarusian doctrine — a perspective/inference, not a direct Belarusian doctrinal attestation.

### `2021-09/mit-tech-review-beacon-red-uae-continuity`  — prepass: add-second-source
- attested links: `ae/procurement-led-capability`, `ae/procurement-led-capability`
- note: TWO ae/procurement-led-capability links marked attested with attesting_source=MIT Tech Review, but that source returned no text — the attestation cannot be confirmed. KEY RULE unmet (no resolving attesting text). The two links are also near-duplicates citing the same goal.

### `2022-02/conti-pledge-leaks`  — prepass: fix-then-stamp
- attested links: `ru/sanctions-response-2022`
- note: ru/sanctions-response-2022 marked confidence:attested with reasoning 'Conti's own statement is the most explicit primary-source attestation... self-attested by the proxy' — but the cited Krebs source did NOT load that statement (Conti/FSB absent). The self-attestation is not present in any fetched text; the attested link is unsubstantiated as fetched.

### `2022-02/viasat-ka-sat-acidrain`  — prepass: fix-then-stamp
- attested links: `ru/military-doctrine-2014`
- note: ru/military-doctrine-2014 'attested' via council-eu source which returned only a browser-check stub - the 'invasion-support objective' naming cannot be confirmed from fetched text. ru/nato-ultimatum-2021 is strongly_inferred (null source) - honest inference.

### `2022-03/hunt-forward-lithuania-latvia-croatia`  — prepass: add-second-source
- attested links: `us/hunt-forward`
- note: us/hunt-forward attested (attesting=cumulative press releases). Hunt-forward is an acknowledged program, but the fetched index page does not name these LT/LV/HR deployments, so the per-event attestation is not substantiated by the captured text.

### `2022-03/ronin-bridge`  — prepass: fix-then-stamp
- attested links: `kp/byungjin`
- note: kp/byungjin 'attested' quotes Treasury's RGB + 'weapons of mass destruction and ballistic missile programs' language — but the cited Treasury source has EMPTY fetched text (len=0). The verbatim quote cannot be verified. The only usable govt source (FBI) does NOT name WMD/missile funding or RGB.

### `2022-06/aviram-azari-conviction`  — prepass: fix-then-stamp
- attested links: `in/contractor-hack-for-hire`
- note: in/contractor-hack-for-hire marked attested ('DOJ filing details... Indian-based contractor operators'), but the fetched body is empty — the claim that the filing details the India chain cannot be verified, and the title alone names only an Israeli PI.

### `2023-01/hive-takedown`  — prepass: fix-then-stamp
- attested links: `us/ncs-2023`
- note: us/ncs-2023 attested to the DOJ release, which is empty. The 'officially framed as Disrupt-and-Dismantle... Monaco remarks' claim is unverifiable against fetched sources (DOJ empty, Europol stub). attested bar not met on fetched evidence.

### `2023-02/technion-darkbit-muddywater`  — prepass: fix-then-stamp
- attested links: `ir/cyber-deniable-retaliation`, `ir/forward-defense`
- note: Both links (ir/cyber-deniable-retaliation, ir/forward-defense) marked attested with attesting_source=INCD, but INCD fetched empty (1 char). The MOIS service-link IS independently supported by the Microsoft secondary source; however the specific doctrine NAMES (deniable-retaliation, forward-defense) are AUSPEX constructs not named by either source. Service-link is attestable; doctrine-name attestation overreaches. Re-fetch INCD or reframe.

### `2023-02/trickbot-conti-sanctions-tranche-one`  — prepass: downgrade-confidence
- attested links: `us/ncs-2023`
- note: us/ncs-2023 marked attested (perspective:defender-response) with attesting_source=Treasury jy1714, but 'National Cybersecurity Strategy 2023' / 'Disrupt-and-Dismantle' is NOT named in the PR (text returns 0 matches). The sanctions action is documented; the strategy NAME is an AUSPEX mapping. KEY RULE unmet — downgrade to strongly_inferred. (Perspective defender-response is correct.)

### `2023-03/chipmixer-takedown`  — prepass: add-second-source
- attested links: `kp/8th-congress-defense-plan`
- note: kp/8th-congress-defense-plan marked attested with attesting_source_id=doj/2023-03-15_chipmixer-takedown, but that source fetched empty so the explicit naming of the strategic goal cannot be confirmed. Attested status is not substantiable from fetched text.

### `2023-04/washington-declaration-korus-cyber`  — prepass: fix-then-stamp
- attested links: `kr/korus-cyber-cooperation`, `kr/korus-cyber-cooperation`
- note: Both kr/korus-cyber-cooperation links are confidence:attested to the joint statement, but the fetched statement text does not contain the cyber/crypto/Strategic-Cybersecurity-Framework language the reasoning quotes. Likely further down in the (truncated) statement; not currently verifiable -> attested overclaims against fetched text.

### `2023-05/operation-medusa-snake-disruption`  — prepass: fix-then-stamp
- attested links: `ru/info-security-2016`
- note: ru/info-security-2016 marked confidence:attested with attesting_source_id = the DOJ source, but that text is EMPTY — cannot attest anything. Neither DOJ (empty) nor CISA NAMES the '2016 information security doctrine'. Attested bar unmet — downgrade to strongly_inferred or re-point to a source naming the doctrine. (ru/fpc-2023 correctly strongly_inferred.)

### `2023-08/camp-david-trilateral-cyber`  — prepass: needs-human-judgment
- attested links: `kr/korus-cyber-cooperation`
- note: kr/korus-cyber-cooperation marked 'attested' with attesting_source_id=state-gov stub that returned no text. The cyber framework is not named in any resolved source. Attested status not substantiated.

### `2023-09/trickbot-conti-sanctions-tranche-two`  — prepass: add-second-source
- attested links: `us/ncs-2023`
- note: us/ncs-2023 attested (attesting=treasury) for the 'Disrupt-and-Dismantle pillar' — but the fetched text does not name the 2023 National Cyber Strategy or its Disrupt-and-Dismantle pillar (0 hits). Attested status not substantiable from fetched text.

### `2023-11/reuters-appin-disclosure`  — prepass: needs-human-judgment
- attested links: `in/contractor-hack-for-hire`
- note: in/contractor-hack-for-hire attested to reuters/2023-11-16, but that Reuters fetch is a nav index containing no attestation; the only 'hack-for-hire/PSOA' characterization is in the SentinelOne fragment, not the cited source. ALSO flag: Appin is a PRIVATE mercenary firm — captured sources do NOT establish Indian state direction, so any state-sponsorship framing is unsupported.

### `2023-12/kyivstar-disruption`  — prepass: downgrade-confidence
- attested links: `ru/russkiy-mir`
- note: ru/russkiy-mir attested (attesting=cert-ua, which fetched empty). Reuters supports the operation as a civilian-telecom destruction but neither the empty CERT-UA source nor Reuters explicitly NAMES a 'Russkiy Mir' strategic goal; the doctrinal framing is an inference. Attested should likely be strongly_inferred. ru/military-doctrine-2014 strongly_inferred and ru/sanctions-response-2022 plausible (front-claim pattern) are honest inferences.

### `2024-01/frostygoop-lviv-heating`  — prepass: needs-human-judgment
- attested links: `ru/energy-weaponization`, `ru/russkiy-mir`
- note: TWO links (ru/energy-weaponization, ru/russkiy-mir) marked attested with attesting_source=Dragos, but the Dragos source did not fetch (0 chars) so no attestation text exists to verify; KEY RULE cannot be met. Also Dragos is a technical ICS vendor unlikely to 'name' Russkiy Mir as a strategic goal. Downgrade pending re-fetch.

### `2024-01/ghostwriter-ukraine-military-espionage-pivot`  — prepass: fix-then-stamp
- attested links: `ru/russkiy-mir`
- note: ru/russkiy-mir (perspective: attacker-rationale) marked attested via the Mandiant source, but that source is a 404 error page. Additionally the actor is Belarusian KGB while the attested doctrine is Russian (ru/russkiy-mir) — an attested cross-attribution resting on a dead source.

### `2024-02/hunt-forward-canada`  — prepass: add-second-source
- attested links: `us/hunt-forward`, `us/five-eyes`
- note: Both us/hunt-forward and us/five-eyes are marked attested with attesting_source_id=the empty Haugh posture statement. Hunt-forward is an acknowledged program, but the joint-with-CSE / Five Eyes claim is not substantiable from any fetched text here. Attested status (esp. five-eyes) unverified.

### `2024-02/lockbit-cronos`  — prepass: fix-then-stamp
- attested links: `us/ncs-2023`, `us/ncs-2023`
- note: Both us/ncs-2023 links are attested to the DOJ press release, which is EMPTY. The 'officially framed as Disrupt-and-Dismantle' claim cannot be verified against any fetched source. attested bar not met on fetched evidence (though the underlying fact is well-documented publicly).

### `2024-03/apt31-wuhan-xrz-indictment`  — prepass: fix-then-stamp
- attested links: `cn/national-intelligence-law-2017`, `cn/mic2025`, `cn/mcf`
- note: All three attested doctrine links (national-intelligence-law-2017, mic2025, mcf) cite the DOJ indictment as attesting_source_id, which is EMPTY. The substance is corroborated by Treasury jy2205 (political-espionage targets named; 2018 Texas energy-company compromise explicitly named; critical-infra/energy/IT targeting). So the attestations are substantively sound but the cited source does not resolve — re-point attesting_source_id to Treasury jy2205 or re-fetch the DOJ indictment.

### `2024-03/ncsc-fcdo-apt31-electoral-commission`  — prepass: add-second-source
- attested links: `uk/ncs-2022`, `uk/five-eyes`
- note: Both links (uk/ncs-2022, uk/five-eyes) marked attested with attesting_source=NCSC, but NCSC source fetched empty — no text to attest. KEY RULE unmet. Perspective:defender-response is appropriate, but attestation requires a resolving source naming the goal.

### `2024-05/apt28-spd-czech-polish-spearphishing`  — prepass: fix-then-stamp
- attested links: `ru/sanctions-response-2022`, `ru/nato-ultimatum-2021`
- note: Two links 'attested' citing bundesregierung source that is empty (len=0). Attested requires source explicitly naming the goal; empty source cannot. ru/nato-ultimatum-2021 reasoning also leans on NATO/EU statements not in this source. Downgrade to strongly_inferred until a usable source is attached.

### `2024-05/lockbitsupp-khoroshev-unmasking`  — prepass: downgrade-confidence
- attested links: `us/ncs-2023`
- note: us/ncs-2023 marked attested with attesting_source = DOJ indictment (textlen 3, did NOT resolve). The resolving Treasury text uses 'disruption' language but does NOT name the National Cybersecurity Strategy 2023 'Disrupt-and-Dismantle' pillar. Attestation rests on an unfetched source + a strategy name not stated; downgrade or cite a source that names NCS-2023.

### `2024-07/andariel-rim-jong-hyok-indictment`  — prepass: fix-then-stamp
- attested links: `kp/8th-congress-defense-plan`, `kp/8th-congress-defense-plan`
- note: Both kp/8th-congress-defense-plan links are attested to the DOJ indictment, which is empty. The specific attested claims (NASA OIG/Air Force/ROK-Taiwan DIB; Maui proceeds laundered via PRC facilitators funding defense-network intrusions) are NOT in the fetched proxy advisories. The revenue->national-priorities concept IS in AA23-040a, but the named attestation source does not resolve. attested bar not met on the cited source as fetched.

### `2024-07/operation-eastwood-noname-disruption`  — prepass: fix-then-stamp
- attested links: `ru/sanctions-response-2022`, `ru/sanctions-response-2022`
- note: Both ru/sanctions-response-2022 links are attested to the Europol release, which did not load. The 'Europol explicitly framed NoName as Russia-aligned proxy targeting NATO infrastructure' claim is unverifiable against the fetched stub. attested bar not met on fetched evidence.

### `2024-08/hunt-forward-lithuania-second`  — prepass: add-second-source
- attested links: `us/hunt-forward`
- note: us/hunt-forward 'attested' / 'officially acknowledged' - but the cumulative-press source resolved to an index page with no Hunt Forward Lithuania content. Official acknowledgement of THIS deployment is not in the fetched text. Hunt Forward is officially acknowledged as a program generally, but this specific second-deployment attestation isn't substantiated here.

### `2024-09/salt-typhoon-us-telecom-compromise`  — prepass: fix-then-stamp
- attested links: `cn/intelligentized-warfare`, `cn/taiwan-reunification`, `cn/national-intelligence-law-2017`
- note: cn/intelligentized-warfare (attested, CISA) HONEST — CISA title 'Compromise of Networks Worldwide to Feed Global Espionage System' names the goal. cn/taiwan-reunification (attested) cites WSJ 404 page asserting 'presidential campaign staff and senior congressional members' targeting — no usable source names this -> OVERCLAIMED. cn/national-intelligence-law-2017 (attested, Treasury) — Treasury names Sichuan Juxinhe/MSS ties but does NOT invoke the 2017 National Intelligence Law -> OVERCLAIMED.

### `2024-10/operation-magnus-redline`  — prepass: fix-then-stamp
- attested links: `us/ncs-2023`
- note: Link us/ncs-2023 (Disrupt-and-Dismantle) confidence:attested with attesting_source_id=eurojust/2024-10-29 — but that source has text_len=0. An attested link must rest on source text that names the goal; here it has no text — 'attested' unsupported/overclaimed.

### `2024-11/moucka-snowflake-indictment`  — prepass: fix-then-stamp
- attested links: `us/ncs-2023`
- note: us/ncs-2023 attested (perspective defender-response) to the DOJ indictment, which has no URL and did not fetch. The Disrupt-and-Dismantle attestation has no fetched evidence; perspective defender-response is otherwise appropriate.

### `2024-11/scattered-spider-five-indictment`  — prepass: fix-then-stamp
- attested links: `us/ncs-2023`
- note: us/ncs-2023 marked confidence:attested to the DOJ release, but the fetched text is empty so the attestation cannot be substantiated; an indictment also does not itself 'name' the NCS-2023 Disrupt-and-Dismantle pillar. Cannot stand as attested without resolving text that explicitly invokes the strategy.

### `2025-05/blacksuit-doj-disruption`  — prepass: fix-then-stamp
- attested links: `us/ncs-2023`
- note: us/ncs-2023 'attested' via an empty DOJ source. The Disrupt-and-Dismantle pillar naming cannot be confirmed (and, as in the Qakbot case, DOJ releases typically don't name the strategy). Attested unsubstantiated.

### `2025-08/cyberav3ngers-water-sector-summer-2025`  — prepass: needs-human-judgment
- attested links: `ir/cyber-deniable-retaliation`, `ir/asymmetric-warfare`
- note: Both ir doctrine links (cyber-deniable-retaliation, asymmetric-warfare) are marked attested to the WaterISAC source, which has no URL and did not fetch. attested bar cannot be met with an empty source; the 'defacements explicitly frame operations as coercive' claim is unverifiable.

### `2025-09/ofac-irgc-crypto-shadow-banking`  — prepass: fix-then-stamp
- attested links: `ir/sanctions-evasion`
- note: ir/sanctions-evasion 'attested' via a Treasury source that returned the news index, not the designation release naming the IRGC affiliation or laundering function. Attested status not substantiated by fetched text.


## C — RE-POINT SOURCE — anachronism: cited source predates the doctrine  (3)

### `2010-01/apt1-comment-crew-campaign`  — prepass: downgrade-confidence
- attested links: `cn/mic2025`
- note: cn/mic2025 attested to the 2014 DOJ indictment is ANACHRONISTIC — MIC2025 was announced in 2015, so the indictment cannot name it; the link's own reasoning concedes the victims only 'became MIC2025 pillars two years later' under the '12th Five-Year Plan.' Downgrade attested to strongly_inferred (a 12th-Five-Year-Plan attested link would be defensible — Mandiant names it). cn/mcf (strongly_inferred) is honest.

### `2019-09/solarwinds-sunburst`  — prepass: downgrade-confidence
- attested links: `ru/fpc-2023`
- note: ru/fpc-2023 attested to WH fact sheet: source DOES say 'broad-scope cyber espionage campaign' but does NOT name the Foreign Policy Concept 2023 or any Russian strategic doctrine; reasoning itself concedes 'the doctrine post-dates the operation.' Naming the espionage activity is not naming the doctrine — downgrade attested to strongly_inferred. ru/info-security-2016 (strongly_inferred) is honest.

### `2024-04/un-poe-mandate-end`  — prepass: fix-then-stamp
- attested links: `kp/office-39-sanctions-evasion`
- note: kp/office-39-sanctions-evasion marked attested to un-poe/2024-03_final-report, citing '~$3B DPRK crypto theft' — but that source's fetched text is a navigation index with no such content ('crypto'/'cyber' absent). 'Office 39' is not named in any of the three sources. The State MSMT source supports the broader sanctions-evasion fact but does not name Office 39 and post-dates the event. Attestation not substantiated by the cited source.


## F — FIX REASONING — link asserts a quote/fact absent from the source  (14)

### `2012-09/operation-ababil`  — prepass: downgrade-confidence
- attested links: `ir/asymmetric-warfare`
- note: ir/asymmetric-warfare marked attested to DOJ indictment with reasoning 'DOJ characterizes the campaign as retaliation for sanctions on Iranian banking' — that retaliation/sanctions framing is NOT in the source; DOJ says attacks were 'designed specifically to harm America and its people' but never names a sanctions-retaliation strategic goal. Attested should downgrade to strongly_inferred. ir/forward-defense (strongly_inferred) is honest.

### `2014-08/usis-contractor-breach`  — prepass: fix-then-stamp
- attested links: `cn/mcf`
- note: cn/mcf 'attested' via WaPo. Reasoning claims 'IC public attribution explicitly identified the counterintelligence-vetting purpose' - that is NOT in the fetched WaPo text, which only says 'state-sponsored.' Neither MCF nor the vetting purpose is named. Attested overclaims the thin source.

### `2015-02/anthem-breach`  — prepass: add-second-source
- attested links: `cn/mcf`
- note: cn/mcf attested via DOJ indictment — indictment establishes PII-theft/espionage objective but does NOT name MCF or a counterintelligence/bulk-PII strategic goal. MCF is an AUSPEX mapping; attestation to the specific goal not in source.

### `2018-02/olympic-destroyer`  — prepass: add-second-source
- attested links: `ru/info-security-2016`
- note: attested via UK gov release whose reasoning claims it 'explicitly cites retaliation for the IOC flag ban'. Fetched UK text does NOT contain flag-ban/doping/McLaren/retaliation language — it frames the op as 'cynical and reckless' sabotage and false-flag. The retaliation-for-flag-ban strategic-goal is not present in the fetched attesting source; summary's 'UK FCDO press release directly cited retaliation for Russia's IOC flag ban' overstates the fetched text.

### `2020-04/aa20-099a-covid-malicious-actors-joint`  — prepass: downgrade-confidence
- attested links: `uk/ncs-2016`
- note: uk/ncs-2016 marked attested via the CISA advisory, but the advisory is purely technical and names neither the UK National Cyber Strategy 2016 nor any 'defend/deter pillar.' Analyst framing only; goal/doctrine not in source.

### `2021-08/inkysquid-daily-nk`  — prepass: add-second-source
- attested links: `kp/juche`
- note: kp/juche marked attested with reasoning 'Volexity's disclosure EXPLICITLY identifies the targeted audience as defectors and journalists' — but the source does NOT explicitly identify the audience as defectors/journalists; it only describes Daily NK's editorial focus. The attested label's factual premise is not in the source. kp/strategic-information correctly strongly_inferred.

### `2022-02/hermeticwiper`  — prepass: fix-then-stamp
- attested links: `ru/russkiy-mir`
- note: ru/russkiy-mir marked attested with reasoning citing 'Ukrainian government and finance' — government is supported but finance is not in the source, the source does not attribute to Russia/Sandworm, and it names no doctrine. Attested overreaches; downgrade to strongly_inferred. (ru/military-doctrine-2014 strongly_inferred is fine.)

### `2022-08/h0lygh0st-ransomware`  — prepass: fix-then-stamp
- attested links: `kp/8th-congress-defense-plan`
- note: Link kp/8th-congress-defense-plan confidence:attested with attesting_source_id=CISA AA23-040A (non-null). But CISA says proceeds support 'DPRK national-level priorities and objectives, including cyber operations' — it does NOT name the 8th Congress defense plan or WMD/nuclear programs (the reasoning's 'fund WMD programs' is not in this text). Generic revenue->national-priorities is attested, but the specific 8th-Congress/WMD mapping is inference — 'attested' overstates.

### `2023-05/volt-typhoon-public-disclosure`  — prepass: fix-then-stamp
- attested links: `cn/taiwan-reunification`
- note: cn/taiwan-reunification is attested to Wray's testimony, and the reasoning claims Wray named Volt Typhoon pre-positioning 'in the event of a Taiwan-related conflict.' The fetched Wray text supports 'wreak havoc and cause real-world harm' and 'in the event of a conflict' but does NOT contain the word 'Taiwan' in the fetched excerpt — the 'Taiwan-related' specificity is added by AUSPEX. The attestation of generic conflict-pre-positioning holds; the Taiwan-specific framing is a mild overclaim against the fetched Wray excerpt (may be elsewhere in fuller testimony or in AA24-038A). cn/mcf strongly_inferred is honest.

### `2023-10/al-kuwaiti-gitex-50000-daily-attacks`  — prepass: add-second-source
- attested links: `ae/digital-economy-protection`
- note: ae/digital-economy-protection confidence:attested, reasoning 'Self-attested by the UAE government's own senior cybersecurity official' - but attesting_source_id is a TERTIARY journalism outlet (AGBI), not a UAE-government primary publication. A journalist paraphrasing Al-Kuwaiti is not a self-attestation. Attested with a tertiary source over-credits; strongly_inferred would be honest, or add a UAE-govt primary.

### `2024-08/aria-sepehr-ayandehsazan-fbi-advisory`  — prepass: fix-then-stamp
- attested links: `ir/cyber-deniable-retaliation`, `ir/post-soleimani-retaliation`
- note: Link 1 (ir/cyber-deniable-retaliation, attested to this advisory) is reasonable — advisory attests the contractor/persona-laundering pattern. Link 2 (ir/post-soleimani-retaliation, attested) cites attesting_source_id doj/2024-09-27_irgc-trio-trump-campaign, which is NOT in the fetched sources, and this advisory does not state a Soleimani-revenge motive; that attestation is unverifiable here.

### `2024-10/uae-csc-cpx-state-of-cybersecurity-report-2024`  — prepass: downgrade-confidence
- attested links: `ae/digital-economy-protection`
- note: ae/digital-economy-protection attested (attesting=cpx), reasoning claims the report 'explicitly framing UAE financial-sector threat posture as a doctrinal priority.' The fetched landing page does not name a doctrine nor single out finance; it is a marketing/download page. Self-attested doctrine status is not substantiated by the fetched text. ae/procurement-led-capability strongly_inferred/null is an honest inference.

### `2025-02/bybit-safe-wallet`  — prepass: downgrade-confidence
- attested links: `kp/8th-congress-defense-plan`
- note: Doctrine link kp/8th-congress-defense-plan marked 'attested' to the IC3 PSA, but the fetched PSA text contains NO WMD-financing language and does not name the 8th Congress defense plan or a strategic revenue goal. Reasoning claims 'standard WMD-financing attestation language' that is absent from this source. Attestation not met by cited source.

### `2025-07/ncsc-authentic-antics-apt28`  — prepass: fix-then-stamp
- attested links: `ru/fpc-2023`
- note: ru/fpc-2023 'attested' to ncsc-uk source: reasoning claims the sanctions package 'explicitly named GRU operations against Western interests' and ties to logistics/tech-firm Ukraine targeting — but THIS AUTHENTIC ANTICS disclosure is about email-credential theft; it does NOT name an 'FPC-2023 anti-Anglo-Saxon collection priority' or the Ukraine-aid-logistics targeting (that's the cross-referenced May advisory). Attestation of the named goal not in this source.


## Z — INFERRED-SIDE overreach — no attested link; a strongly_inferred that should be plausible  (10)

### `2020-11/covid-vaccine-targeting`  — prepass: add-second-source
- attested links: _(no attested link)_
- note: strategic-information link reasoning asserts 'Microsoft MSTIC explicitly framed the operation as collection rather than revenue' — the cited source does NOT say this (it is a policy/advocacy blog by Tom Burt, not a technical MSTIC attribution of intent, and does not characterize collection-vs-revenue). The juche link ('plausible', null) is an acceptable inference. The 'explicitly framed' claim should be softened or sourced.

### `2022-01/trend-micro-earth-karkaddan-arsenal`  — prepass: fix-then-stamp
- attested links: _(no attested link)_
- note: First doctrine link (India military-collection) honest, strongly_inferred, null attesting OK. Second link claims 'Afghan diplomatic and government targeting documented in the Trend Micro arsenal piece' — the fetched text does not document Afghan targeting, so the reasoning's factual premise is unsupported. Downgrade or drop the Afghan link, or add the companion technical brief that covers it.

### `2023-07/pwc-teal-kurma-overview`  — prepass: add-second-source
- attested links: _(no attested link)_
- note: tr/counter-gulen-kurdish-surveillance strongly_inferred (attesting null), but reasoning claims the source 'documents continued Kurdish-equity collection through 2020-2023' — the source documents no Kurdish targeting and is not a retrospective; the inference rests on evidence absent from the file.

### `2023-10/diamond-sleet-cyberlink-supply-chain`  — prepass: downgrade-confidence
- attested links: _(no attested link)_
- note: First doctrine link (strongly_inferred): reasoning asserts Diamond Sleet supply-chain compromises 'consistently culminate in crypto-wallet drainage from affected developer machines' and 'crypto-adjacent verticals' — the Microsoft source does NOT support crypto-wallet drainage for this CyberLink campaign (it says no hands-on-keyboard activity observed yet; lists media/defense/IT). This is an overreaching inference for a strongly_inferred link. Second link (plausible: education/government/defense) is also only partially supported — source says media/defense/IT, not education/government. Recommend softening first link or sourcing the crypto-drainage claim separately.

### `2024-03/secureworks-ctu-attributes-trigona-ransomware-operation-to-gold-begoni`  — prepass: needs-human-judgment
- attested links: _(no attested link)_
- note: ru/sanctions-response-2022 plausible, attesting null. The link presupposes a Russia-based RaaS crew that this source does not establish as Russian. The 'tolerated criminal-proxy' framing is reasonable IF Russia attribution holds, but the underlying Russia nexus is unsourced here. Weakest-label (plausible) is honest, but the predicate is unsupported.

### `2024-04/cisco-talos-discloses-arcanedoor-uat4356-storm-1849-state-sponsored-es`  — prepass: needs-human-judgment
- attested links: _(no attested link)_
- note: cn/intelligentized-warfare plausible, attesting null. The doctrine presupposes a China attribution the source does not make. Even at 'plausible/low', mapping a Chinese strategic doctrine onto an explicitly-unattributed campaign overreaches the source.

### `2024-05/mstic-attributes-quick-assist-teams-vishing-social-engineering-to-blac`  — prepass: needs-human-judgment
- attested links: _(no attested link)_
- note: ru/sanctions-response-2022 plausible, attesting null. The reasoning labels Storm-1811 'Russia-nexus' but this source provides no Russia attribution - only 'financially motivated'. Weakest label is honest, but the Russia predicate (and hence the tolerated-criminal-proxy doctrine) is unsupported by the fetched source.

### `2025-06/fbicisaasd-stopransomware-play-playcrypt-advisory-900-affected-entitie`  — prepass: needs-human-judgment
- attested links: _(no attested link)_
- note: FLAG: ru/sanctions-response-2022 plausible — but the reasoning itself concedes 'no stated state objective' and 'absent a clearer fit'. Tying Play to a Russian state doctrine is weak; the source provides NO Russia-nexus evidence (Conti-infrastructure overlap is the only Russia hint). The 'tolerated criminal-proxy' framing is a stretch for a group whose nexus is unestablished in this source.

### `2025-07/salt-typhoon-compromise-of-a-us-states-army-national-guard-network`  — prepass: add-second-source
- attested links: _(no attested link)_
- note: Two strongly_inferred links (taiwan-reunification + intelligentized-warfare) both null-attesting. Source supports 'could enable follow-on intrusions' and CII concern, but does NOT mention Taiwan, reunification, or pre-positioning intent — these are analyst leaps. 'strongly_inferred' is arguably too strong for the Taiwan-contingency framing the source never raises; consider downgrading taiwan link to plausible. Intelligentized-warfare pre-positioning read is more defensible but still inferred.

### `2025-10/confucius-shifts-from-wooperstealer-to-anondoor-python-backdoor-in-cam`  — prepass: add-second-source
- attested links: _(no attested link)_
- note: in/regional-collection-pakistan-china is strongly_inferred, but the India-nexus underpinning it is itself only inferred from EXTERNAL reporting (Fortinet doesn't name India). Tagging the doctrine link 'strongly_inferred' while the very India-attribution is moderate/caveated is slightly inconsistent — the doctrine inference can be no stronger than the attribution it depends on. Reasoning notes 'India-aligned' as established fact, which this source does not support. Consider downgrading to plausible OR adding the Lookout/Recorded Future India-attribution source.
