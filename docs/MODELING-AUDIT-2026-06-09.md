# Modeling audit — logic errors & dissertation-defensibility review

**2026-06-09.** Four parallel adversarial audits (data model · engines · eval methodology ·
strategic analyses) over the full repo, hunting for logic errors in how cyber threats are
modeled. Corpus at 818 events. Findings ranked by **dissertation risk**. Claims marked ✓ were
independently re-verified against code/data after the audit (file:line re-read or statistic
recomputed); unmarked claims are single-audit findings that should be re-verified before being
acted on. **This document records defects; fixes are deliberately NOT bundled into it** — each
fix should be its own verified change with a re-baseline.

---

## TIER 1 — CRITICAL: would not survive a defense unaddressed

### C1. The who×why join is semantically inconsistent — `doctrine_id` means three different things ✓

The dissertation's core construct ("attribution names the who; doctrine names the why") assumes
a doctrine link = *the attacker's strategic rationale*. The corpus actually uses **three
semantics**:

1. **Attacker's rationale** (most events) — e.g. Bowman Dam ← `ir/asymmetric-warfare`, Iran is
   the perpetrator.
2. **Victim's doctrinal response** — `atlas/events/2010/06/stuxnet-natanz.yaml:42-53` ✓: a
   US/IL operation against Iran, tagged `ir/asymmetric-warfare [attested]` because *"Khamenei
   and senior IRGC commanders have repeatedly cited Stuxnet as the case for cyber as asymmetric
   equalizer"* — the doctrine is the **victim's** reaction.
3. **Mirror-image observation** — `atlas/events/2025/06/predatory-sparrow-bank-sepah.yaml`:
   Israeli actor tagged with **Iran's** doctrine as "the mirror image of the pillar Iran applies
   abroad." Plus **39 attributed events** carry a doctrine from a *different* state than the
   actor (e.g. Sandworm operations tagged with **UK** NCS doctrines because the NCSC advisory
   "exercises UK doctrine").

Consequences ripple everywhere: the doctrine engine trains `ir/asymmetric-warfare` on a mix of
Iranian ops *and operations against Iran*; UK doctrine profiles train on Russian attack
features; the F1 who×why information numbers mix the semantics.

**Compounding eval bug ✓:** `eventStateId()` (`site/src/utils/atlas-core.ts:1180-1203` ✓) falls
back to **the first doctrine link's state** when actor+service are null. So in every per-state
eval table, **Stuxnet is labeled an *Iranian* event**, Predatory Sparrow fuel-pumps is Iranian,
and Operation Cronos (US/UK LE takedown of LockBit) is a *US* event. ~51 core-operation
null-actor events get their eval state from the doctrine author, not the perpetrator.

**Fix:** add `perspective: attacker-rationale | victim-response | counter-doctrine` to
doctrine_link; train/eval engines on `attacker-rationale` only; remove (or perspective-filter)
the doctrine fallback in `eventStateId`; re-baseline doctrine/pillar/joint + per-state tables.

### C2. F1 vs F2 cross-analysis incoherence — the headline "91→5 suspects" is the uncorrected version of a number F2 already debunked ✓(method)

`doctrine_to_operations.py` LEG 3 computes H(actor|doctrine) **without** the permutation-null
sparsity correction that `mo_narrowing.py` (F2) introduced precisely because the naive version
overfits (60% singleton cells; naive 106→2 vs corrected 106→40). Audit recomputation with the
null applied to F1's rows: pool ≈ **32 actors, not 5** (~23% uncertainty resolved, not 65-70%).
Worse, `analysis/FINDINGS.md` cross-checks present F1 (naive 70%) and F2 (corrected 1.40 bits)
as **"consistent across methods"** — they are the same construct at different rigor, disagreeing
~6-8× in pool size. An examiner who reads both sections finds this immediately. The README also
quotes the 91→5 figure.

**Fix:** port the permutation null into F1; replace 91→5 / 42→3 with null-corrected figures
everywhere (FINDINGS.md, README, thesis scaffold); reframe the cross-check as a
**methodological lesson** (naive vs corrected), which is honestly more interesting.

### C3. Ground-truth circularity cluster ✓(recomputed)

Three mutually reinforcing facts an examiner will chain together:

- **67% of attributed events (454/678 ✓ recomputed) have exactly one source, and that source IS
  the attribution document.** Label, features (summary text), and evidence come from the same
  document. (Worst case: OPM breach — sole source Wikipedia, tier tertiary, confidence high.)
- **100% of 1,023 doctrine_links carry `analyst: claude`** (machine-assigned WHY labels), and
  ~128 doctrine-tagged events still carry "QC pending" markers — while `docs/SCHEMA.md:100`
  says "machine-authored under human review."
- **Prose summaries were written by an analyst who knew the attribution.** The actor-NAME scrub
  is real, but framing vocabulary ("DPRK-style revenue operation") remains analyst-mediated;
  the conservative prose-ablated bound (~52%) exists in MODELING-DIAGNOSTICS but is not
  surfaced beside the headline.

None of this is fatal — but the *framing* must change: published accuracy is **agreement with
analyst-concurred vendor attribution**, not accuracy against verified ground truth, and that
sentence currently appears nowhere user-visible (README "Current accuracy" is unqualified).

**Fix:** (1) one framing sentence in README + methodology; (2) a **human inter-rater
verification study** — Kara hand-verifies a stratified random sample of doctrine_links (e.g.
n=100: re-derive the link from sources blind to the stored tag; report agreement + κ). This
single study converts the "machine-tagged" weakness into a *measured reliability number* and is
the highest-value defensibility investment available; (3) clear the QC-pending backlog or stop
counting those links in headline evals.

### C4. `deterrence.py` has three structural defects (its conclusion may survive, but not its arithmetic)

- **No right-censoring guard** ✓(by contrast with `actor_deterrence.py:69` which has the MAXY
  guard): 8 punitive actions from 2025 are included with half-empty post-windows (4×CN each
  contributing DiD=+1.17), mechanically inflating "defiance."
- **Pseudo-replication:** overlapping ±2yr windows — RU's 29 actions yield 346 overlapping
  window-pairs; n=73 is far from 73 independent observations (effective N per state ≈ 3-5).
- **Contaminated control:** "rest of world" includes states that are themselves under punitive
  action in the same windows (treated units in the control). Same structural issue in
  `actor_deterrence.py`'s control (≈27% of Ghostwriter's control window is other named actors).

**Fix:** add the MAXY guard; collapse to non-overlapping (state × window) units or use a block
bootstrap; either exclude co-treated states from the control or demote F4/F5 from "event-study
DiD" to "descriptive before/after tempo comparison." The endogeneity caveat is already strong —
these are *additional* and currently unacknowledged.

---

## TIER 2 — HIGH: examiner will attack; fix or defend explicitly

### H1. Doctrine-name label leakage in prose — the un-fixed twin of the actor-name leak ✓(scrub absence verified)

Actor names/aliases are scrubbed from prose features (`prose-features.ts` ✓); **doctrine names
are not**. Tokens like `mcf`, `mic2025`, `intelligentized`, `defend`, `forward` pass straight
into prose features; audit found ~75 doctrine-labeled events (~11%) carry an escapable doctrine
token, concentrated in thesis-central doctrines (`cn/mic2025` 19%, `cn/mcf` 7%). The doctrine
69.2%/87% numbers are optimistic by an unmeasured amount.
**Fix:** `doctrineNameTokens()` scrub parallel to the actor scrub; re-baseline doctrine, pillar,
joint. (Expect ~1-3pp; the actor-name analog cost <1pp after the same fix.)

### H2. Stacked-eval `knownCampaigns` LOO contamination ✓(code re-read)

`stacked-attribution.ts:152-160` builds the campaign→actor map from **all events including the
held-out one** before the LOO loop, so `campaignMatch` can fire for the true actor *because of
the held-out event itself* (decisive for singleton campaigns; redundant for large ones). Also:
`campaign_id` is co-assigned with attribution by the same analyst (the ablation exists: −6-7pp —
keep publishing it beside the headline).
**Fix:** build `knownCampaigns` per-iteration excluding `heldOut`; re-baseline stacked (the
+9.3pp lift may shrink ~1pp).

### H3. Six divergent state-derivation implementations + the undocumented `ru/proxies` boundary

Six implementations of "which state is this event" disagree on `criminal/*` (→ `'criminal'` vs
`undefined`/`'??'`) and on `ru/proxies/*` with null service. Consequences: the stacked eval
stratifies by a different state than the LOO per-state table reports; the `'??'` bucket (n≈101)
is unexplained anywhere; the Russia state page omits LockBit/ALPHV while evals count them as
RU. And the **placement rule for `ru/proxies/` vs `criminal/` is documented nowhere** — yet 31%
of "RU" ops in the deterrence analysis are proxy/criminal actors with
`nation_state_affiliation: null`, and `doctrine_trends.py` derives state a *third* way
(doctrine's state). E4's criminal-gate +6.9pp inherits whichever boundary was drawn.
**Fix:** one canonical `eventStateId()` (with an explicit `criminal` policy) used by every eval
and analysis; write the proxies/criminal criterion into SCHEMA.md; re-baseline per-state tables;
explain `'??'`.

### H4. "Doctrine" is five constructs wearing one name

86 doctrines mix statute law (~9), published strategies (~51), **inferred postures with no
text** (~19, `issued_on: null` ×14), treaties (Five Eyes 1946, duplicated under us/ and uk/),
and **geopolitical events as doctrine anchors** (`ru/nato-ultimatum-2021`;
`ir/post-soleimani-retaliation` is dated by the *drone strike*). Every temporal claim ("73%
follow publication") silently drops the undated 32% of pairs (`doctrine_to_operations.py:69-71`)
and averages incommensurables. Construct validity is a guaranteed viva question.
**Fix:** add `kind: statute | strategy | posture | treaty | event-anchor` to the doctrine
schema; scope precedence claims to `statute|strategy`; disclose the dropped-pair fraction; fix
`fr/nato-cyber-defence-pledge` (empty sources + inverted `inherits_from`).

### H5. Retrodiction presented where prospection could be read, and the forecast headline's denominator

- LOO trains on events *after* the held-out event (temporal weight `exp(-|Δy|/τ)` is two-sided
  ✓); README's "Current accuracy" never says "retrodictive."
- **`temporal-eval.ts:164` ✓ still drops unrankable events from the denominator** — the one eval
  that escaped the null=miss re-baseline. The temporal numbers are inflated relative to every
  other table (test set is ~26% cold-start new actors).
- The **forecast "top-5 ~40%"** in the README is the *rankable-only* figure; all-events is
  **28.9%**, stated in docs/FORECASTING but not beside the README claim.
**Fix:** "retrodictive (LOO)" caption; null=miss in temporal-eval + re-baseline; README forecast
line shows both numbers.

### H6. ICD-203 is claimed but not implemented ✓(SCHEMA.md:38)

`attributing_org_confidence: high/moderate/low` matches ICD-203's *confidence* dimension fine —
but doctrine-link `attested / strongly_inferred / plausible` is an AUSPEX-custom evidentiary
scale, not ICD-203, and SCHEMA.md:38 claims both are "ICD-203-disciplined." Citable from the
standard itself. Also: 14 `attested` links have no `attesting_source_id` (violates the
schema's own rule; only a WARN); 359 `high`-confidence attributions sit on single-source events
against the project's own sourcing norm.
**Fix:** rename the doctrine scale honestly ("AUSPEX evidentiary scale, inspired by but distinct
from ICD-203"); make attested-without-source an ERROR; sweep the 359 high/single-source
attributions (downgrade or add sources).

### H7. Legibility (83%) is selection on the dependent variable

Doctrine links are *added by the analyst*; ops that don't read as doctrinal simply don't get
links, and the corpus itself selects attributable state operations. "83% of ops are doctrinally
legible" partly measures tagging effort, not the world. Unacknowledged in F1/FINDINGS.
**Fix:** acknowledge explicitly; report the attested-only legibility (29%) as the conservative
bound; consider a "doctrine-link considered and rejected" marker going forward.

---

## TIER 3 — MEDIUM: document or tighten

- **Bootstrap CIs assume i.i.d. events** (acknowledged in `eval-stats.ts` source, AUDIT
  estimates design effect ≈2 → CIs ~√2 too narrow) — surface on the public pages.
- **In-sample hyperparameter selection:** λ=0.2, actorWeight=2.0, T=2.0/3.0/3.0 all
  selected/fit on the same LOO they're reported on; E1-E4 ran 4 experiments uncorrected; E4's
  +6.9pp still lacks its promised bootstrap CI. Label as in-sample; validate winners on the
  temporal split; CI E4 before promoting.
- **MITRE caches degrade silently** (`atlas.ts` warn-only): a clean clone reproduces *different*
  headline numbers with no error. Make the eval fail loudly; document the prerequisite. The
  MITRE *baseline* also skips unmappable actors (not null=miss) — denominator mismatch with the
  engine comparison.
- **Corpus-growth decomposition (74.5→61.7→65.1) is not reproducible from committed artifacts**
  (provisional 785-event state + per-event dumps never committed). Commit a frozen snapshot or
  label the decomposition as such.
- **`false_flag_risk: none` is an undocumented default** (94.7% of events), and 36 former `low`
  values were collapsed into `none` — write the assignment methodology.
- **Contested attribution is structurally absent:** `contested` used 3× in 917 attribution rows;
  multi-attribution ≈ corroboration, not dispute. The model never sees adversarial attribution.
- **Forecast presentation:** hardcoded `nowYear=2026`; `riskPercentile` is corpus-coverage
  density labeled "risk"; state dyad applies a state's whole history to all its actors. Rename
  band to "comparable-event density"; derive year at build.
- **/predict train-serve skew:** campaign/operators/markers/org-target features are always
  absent for pasted prose; the page cites LOO numbers that include them. Disclose beside the UI.
- **Collection-bias robustness is asserted, not shown:** within-year normalization flips UK's
  tempo rank by 9 places and cuts `cn/national-intelligence-law-2017` recent-share by 37pp —
  add the normalized view to doctrine_trends.
- **Calibration constants** fit in-sample and now stale-labeled (815 vs 818) — refit on a split.
- **FINDINGS.md drift** is mostly guarded by the snapshot framing, but F4's per-state figures
  moved (CN +0.39→+0.34) — regenerate after the C4 fixes anyway.
- Sector taxonomy: `critical-infrastructure` catch-all (35 events) vs specific sectors;
  `defense` vs `aerospace/defense` both used (once simultaneously).
- Five Eyes doctrine duplicated under us/ and uk/ (double training signal, acknowledged in-file).

## What already holds up (genuinely defensible, keep citing)

null=miss re-baselining; the actor-name prose de-leak + published leak-free deltas; the
CNB-vs-GBT class-imbalance defense (McNemar p<0.001); temporal validation for forecasting
(never LOO); the F2 permutation null (it caught *your own* naive number — that's the rigor
story); the eval-first discipline with committed null results (E1-E3); the independent Python
audit harness + pre-commit gate; campaign-ablation as a published sensitivity bound; the
corpus-growth "composition not regression" *analysis design* (modulo committing its artifacts).

## Recommended fix order

1. **Semantics first (C1):** `perspective` field + eventStateId fallback fix → re-baseline.
   Everything downstream inherits this.
2. **Leak fixes (H1, H2, H5-temporal):** doctrine-name scrub, per-LOO knownCampaigns,
   temporal null=miss → one combined re-baseline, publish deltas.
3. **State unification (H3):** canonical eventStateId + documented proxies/criminal rule →
   re-baseline per-state + E4 CI.
4. **Analyses corrections (C2, C4, H7):** F1 null-correction, deterrence guards/demotion,
   selection-effect caveats → regenerate FINDINGS.md.
5. **Framing pass (C3, H5, H6):** the one-sentence ground-truth qualifier, "retrodictive"
   caption, forecast both-denominators, ICD-203 rename, CI i.i.d. note.
6. **The inter-rater study (C3):** Kara's blind re-derivation of a stratified doctrine-link
   sample — the single highest-value addition for the dissertation.

*Generated from four parallel adversarial audits, key claims independently re-verified (✓).
Numbers cited are from the 818-event corpus on 2026-06-09.*
