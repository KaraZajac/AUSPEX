# FINDINGS — numeric ledger for the who×why analyses

**Purpose.** A reproducible record of every number the `analysis/` scripts produce, each with
its exact reproduce command and the method caveats that bound it. This is a **verification aid
and planning scaffold, not dissertation prose.** Every `Interpretation (Kara):` slot is left
blank deliberately — the reading, the argument, and the claims are the candidate's to write and
to verify independently.

**Snapshot.** Corpus at 2026-07-11 · **785 events** · 223 actors · 86 doctrines · 179
policy-actions · 1,773 sources · **git `4657c60`** (each script prints this fingerprint as its
first output line — a stale ledger is self-evident). **This ledger supersedes the 2026-07-02
version** (808 events / 701 ops). What changed the numbers since then:
1. **THE EVENT-AUDIT CENSUS IS COMPLETE — 785/785 events (100%) audited 6-point vs RAW**
   (was ~46% at the 2026-07-02 ledger). This **retires the QC-selection-bias threat** flagged in
   the engine review: there is no longer an audited-vs-unaudited split to run a sensitivity cut
   across — the whole corpus *is* the audited stratum. The census removed a further batch of
   fabricated + duplicate events (net **808 → 785**) and continued stripping over-attestations,
   which is why the **attested legibility stratum shrank again (14% → 9%)** — the honest
   direction as the analyst-named-goal claims are held to the source.
2. **The who×why structure is ROBUST to the census.** Across a 100% re-audit + ~23 event
   deletes/merges, the load-bearing numbers barely moved: doctrine→actor null-corrected MI
   **1.70 → 1.67 bits** (all) / **1.02 → 0.94 bits** (attested); F2 doctrine-feature
   **1.30 → 1.22 REAL bits**; +3yr precedence unchanged; deterrence still non-identified. Stability
   under a full audit is itself a result — the relationships are not an artifact of unverified tags.
Where a previously-published number changed materially, the old value is shown ~~struck~~.

**Reproduce (all).** System `python3` + `pyyaml`, from repo root:
```sh
make findings          # runs all five below and prints the corpus fingerprint
# or individually:
python3 analysis/doctrine_to_operations.py
python3 analysis/mo_narrowing.py
python3 analysis/doctrine_trends.py
python3 analysis/deterrence.py
python3 analysis/actor_deterrence.py
```
Every figure regenerates from the one command in its section. Independent of the TS engine.
All scripts use ATTACKER-RATIONALE doctrine links only (victim-response / defender-response
links are the other side's doctrine — see `docs/SCHEMA.md` perspective field).

---

## F1 · Do operations come out of strategic documents? (`doctrine_to_operations.py`)

Population: **648 operational events** (86 doctrines, 222 actors). Each leg on **all**
attacker-rationale links and on **attested-only** links (a cited source — not the analyst —
names the strategic goal).

| Leg | Measure | All links | Attested-only |
|---|---|---|---|
| 1 Legibility | ops carrying a doctrine link | 495/648 (**76%** ~~80%~~) | 62/648 (**9%** ~~14%~~) |
| | *(explicitly a tagging-coverage measure — see caveat 4)* | | |
| 2 Precedence | (op, dated-doctrine) pairs | 468 | 41 |
| | excluded: pairs linking an UNDATED doctrine | 250/718 (34%) | 32/73 (43%) |
| | median gap / % follow | **+3 yr** / 74% | **+5 yr** / 78% |
| | **formal-only** (kind ∈ statute/strategy/treaty) | n=400 · +4 yr · **72%** | n=36 · +8 yr · **77%** |
| 3 Information | H(actor) | 6.46 bits (≈88) | 4.73 bits (≈26) |
| | naive MI *(do not cite — sparsity-inflated)* | ~~4.21 bits / pool→5~~ | ~~3.69 bits / pool→2~~ |
| | **null-corrected real MI** (K=40 permutation) | **1.67 bits (26%)** | **0.94 bits (20%)** |
| | **null-corrected suspect pool** | **88 → 28 actors** | **26 → 14 actors** |

**Standing correction (audit C2, 2026-06-09).** The LEG 3 figures are the **null-corrected**
conditional entropy, not the naive drop (which overstates narrowing ~6×). The claim: **knowing
the doctrine resolves ~26% of actor-uncertainty and cuts the effective suspect pool ~3.1×**
(88→28). Null-corrected, the all-links (26%) and attested-only (20%) cuts are the same order of
magnitude — the relationship is **not merely an artifact of how we chose to tag** (an attested
source, not the analyst, names the goal), though it is no longer "stronger under attestation."

Most actor-determining doctrines (H≈0): Begin Doctrine→Olympic Games team; China Standards
2035→APT10; Industrial-Collection→APT32; NIS Counter-DPRK→DarkHotel; Mavi Vatan→Sea Turtle;
Persistent Engagement→JTF-ARES; Defend Forward + NSPM-13→Cyber Mission Force. Most generic:
Deniable-Retaliation-via-Hacktivism (H 3.20), Post-2022 Sanctions-Response (3.33), BRI/Digital
Silk Road (3.43), Informatized Warfare (3.55), MCF (3.55), 2017 Nat-Intel-Law (4.01). Exemplar
attested chains (single actor, gap ≤12yr): Sanctions-Response 2022→Turla (+1); NATO Ultimatum
2021→APT28 (+1); Informatized Warfare 2019→Volt Typhoon (+4); Russkiy Mir 2007→Sandworm (+8).
Stuxnet: Olympic Games (2009, us/olympic-games-team) ← Title 10/50 + Begin Doctrine + Counter-Iran
posture (IL, explicit `attacker-rationale`); the Iranian Asymmetric-Warfare link is
`perspective: victim-response` and excluded from all who×why computations. (The former
`2007-01/olympic-games-stuxnet` duplicate was merged into `2010-06/stuxnet-natanz` in this census.)

**Method caveats:** observational; cannot prove generation. (1) reverse codification;
(2) analyst-mediated tagging (attested cut is the honest one); (3) common-cause geopolitics;
(4) **selection on the dependent variable** — doctrines enter the atlas because ops were
observed, and resistant ops may simply not get links, so legibility measures tagging coverage,
not the world's doctrinal saturation (the corpus also selects attributable state operations in
the first place); (5) cite only null-corrected LEG 3 figures. Pairs ≠ ops (multi-doctrine ops
contribute multiple pairs). Year-granular.

**Interpretation (Kara):** _______________________________________________

---

## F2 · MO chain: doctrine → target → outcome (`mo_narrowing.py`)

Population: **493 operational events** (single attributed actor, `false_flag_risk=none`;
excluded: 46 false-flag, 109 multi-actor). Perspective-filtered.

**A. Per-state MO fingerprint** (top rows by n; full table in script output):

| state | n | data | denial | money | access | signature |
|---|---|---|---|---|---|---|
| cn | 98 | 86% | 1% | 2% | 10% | data |
| ru | 70 | 58% | 31% | 2% | 2% | data (denial 31%) |
| criminal | 61 | 13% | 18% | **65%** | 3% | **money** |
| kp | 53 | 30% | 11% | **50%** | 7% | **money** |
| ir | 48 | 54% | 35% | 8% | 2% | data (denial 35%) |

H(state) 3.54 → H(state|MO) 3.00 (null 3.44) → **MO resolves 12% of state-identity beyond
chance.**

**B. Single features** (baseline H(actor)=6.85 bits ≈115 actors; REAL = null-corrected):
doctrine −1.21 REAL bits · sector −0.31 · MO −0.44.

**C. Incremental chain** (REAL pool): nothing 115 → +doctrine **49.5** (+**1.22 bits**) →
+sector (Δreal **−0.57**) → +MO (Δreal **−0.09**). Deepest level: 228 cells, **58% singletons**.
Doctrine does the real work; target/MO are real *alone* (§B ~0.3–0.4 bits each) but redundant
beyond doctrine at this corpus size; the naive 115→2 chain is overfitting (the negative Δreal
values flag the correction's own instability at singleton-dominated depths). "Theory holds at the
TAILS, not the bulk": MO is a clean fingerprint where non-modal (KP/criminal=money is the
sharpest in the corpus), but espionage/data-theft is the universal default, a weak average
discriminator.

**Method caveats:** circularity (analysts use MO/target/doctrine *to* attribute — partly
definitional; the REAL bits quantify how stereotyped each actor is, not a fully independent
signal); permutation null (K=40, stable); trust REAL not naive; primary-feature simplification;
year-granular; collection-biased.

**Interpretation (Kara):** _______________________________________________

---

## F3 · Doctrine trends over time (`doctrine_trends.py`)

**718 attacker-rationale doctrine-links** across operations, 1996–2026 (86 doctrines, 15 states).
Within-year normalization (each link weighted 1/year-total) flags collection-bias-sensitive
findings (⚠ = raw vs normalized recent-share diverge materially).

- **Most-active doctrines (raw n · recent-3yr share raw|normalized):** kp/8th-congress 45
  (37%|36%); cn/nat-intel-law-2017 43 (**53%|27% ⚠**); cn/mcf 38 (7%|1%); in/regional-collection
  37 (29%|14%); ir/cyber-deniable-retaliation 28 (32%|30%); ir/forward-defense 27 (18%|21%);
  ru/military-doctrine-2014 27 (**25%|5% ⚠**); ru/russkiy-mir 26 (26%|12%); cn/intelligentized 24
  (**50%|27% ⚠**); ru/info-security-2016 24; ir/asymmetric 24; pk/asymmetric-posture 24;
  cn/mic2025 23; ir/resistance-axis 23; ru/sanctions-response 21 (47%|44%).
  *Recent-share rankings for the ⚠ doctrines are substantially collection-density-driven.*
- **State op-tempo (raw count · normalized rank shift):** cn 167 (1→1), ru 135 (2→2), ir 122
  (3→3), kp 81 (4→6), in 46 (5→7), ae 32 (→8), pk 24 (→12, −5), tr 22 (→10), il 21, **us 20
  (6→4 — rises under normalization)**. Raw rankings for kp/in/pk/tr are partly density artifacts;
  cn/ru/ir are robust.
- **Strategic pivots (state's #1 doctrine, early half → late half):** cn MCF→Nat-Intel-Law;
  ru Russkiy-Mir→Military-Doctrine-2014; ir Deniable-Retaliation→Forward-Defense; kp Songun→
  8th-Congress; in Contractor/Hack-for-Hire→Regional-Collection.
- **Lead/lag:** n=468 pairs · median **+3yr** · 18% precede / 7% same-year / 74% follow.
  *(Same computation as F1 LEG 2 — must agree, and does.)*
- **Top same-state co-occurring pairs:** mcf+mic2025 (12); ir deniable-retaliation+resistance-axis
  (11); ae procurement+regime-protection (10); ir asymmetric+forward-defense (9);
  mcf+nat-intel-law (9); ru military-doctrine+russkiy-mir (9).

**Method caveats:** absolute tempo reflects collection coverage — **measured, not asserted**:
the normalized columns are the robustness check, and several headline recent-shares do NOT
survive it. Year-granular.

**Interpretation (Kara):** _______________________________________________

---

## F4 · State-level deterrence / naming-and-shaming (`deterrence.py`)

**Corrected 2026-07-02 (audit C4a, recurrence):** boundary = last *complete* year (2025), tempo
counted once per distinct attacker-state (not per attribution). Both fixes carry forward.

Outputs (51 of 83 punitive actions have usable ±2yr windows; **32 right-censored** past 2025):
- **Per-action view** (pseudo-replicated, kept for continuity): mean DiD **+0.12** (~~+0.11~~),
  median −0.01 — 50% deceleration / 49% acceleration ≈ **no signal, if anything a slight sign
  flip toward defiance**. Per-state: ru +0.20, cn −0.07, kp +0.23, ir +0.16.
- **Per window-cluster view (effective-N):** the actions collapse to **n=4** independent
  (state, window) observations — cn −1.13, ru −0.76, kp −0.90, ir +0.03; mean **−0.69** (~~−0.54~~),
  median −0.76.
- **Verdict (gated by a sign test):** *"n=4 clusters is too small for inference — clustered
  mean DiD −0.69 is DESCRIPTIVE ONLY (two-sided sign test **p=0.62**; not significant). Do NOT
  read as deterrence or defiance."* The script prints no directional conclusion.

**Honest summary: the deterrence question is NOT identifiable from this corpus design.** The
per-action estimate is ≈0 (mildly positive); the clustered estimate is negative but on n=4 with
a non-significant sign test, endogeneity biased *toward* that sign, and a contaminated control.
The analysis's contribution is methodological: it demonstrates *why* state-level
naming-and-shaming effects cannot be read off an event atlas of this size and structure.

**Method caveats:** endogeneity (actions respond to surges → false-deterrence bias);
pseudo-replication (cite clusters, not actions); contaminated control (treated units in the
"rest of world"); RU bucket includes `ru/proxies/*` crews by the documented placement rule;
year-granular; right-censored actions dropped. Association, not effect.

**Interpretation (Kara):** _______________________________________________

---

## F5 · Actor-level deterrence (`actor_deterrence.py`)

Retained as a worked example of recognising and rejecting a confounded positive result.
**N=8 actors** (2 named-by-indictment, 6 disclosure-only; more dropped as right-censored).
all-namings mean DiD **−1.05** (~~−0.85~~) (median −0.74, 87% decelerated-vs-world); indictment
subgroup n=2 **−1.59**; disclosure-only n=6 **−0.87**; endogeneity diagnostic: **named-at-peak
−1.33 vs off-peak −0.78** (n=4) → regression to the mean. **Verdict: UNDERPOWERED + CONFOUNDED**
— parallel-trends violated by construction (naming triggered by the actor's own surge), control
contaminated (other named actors in the control windows), per-actor op counts 1–4. Do NOT claim
actor-level deterrence; the state-level clustered view is the defensible granularity, and it is
itself non-significant (F4). Note the actor-level mean (−1.05) does not cohere with the
state-level per-action cut (≈0) — disagreement at N=8 is expected and reinforces the
non-identification verdict.

**Interpretation (Kara):** _______________________________________________

---

## Cross-analysis checks

- **F1 ↔ F2 (both null-corrected):** F1 doctrine→actor real MI **1.67 bits / pool 88→28**
  (event-weighted, multi-actor ops included) vs F2 doctrine-feature **1.22 REAL bits / pool
  115→49.5** (single-actor ops, false-flag-filtered). Same order of magnitude under different
  conditioning — *that* is the honest consistency claim; the naive-vs-corrected gap (~6×) is
  itself a finding about sparse-corpus information estimates.
- **+3yr precedence** appears identically in F1 LEG 2 and F3 lead/lag (**n=468 both**) — same
  computation, two entry points; they agree, and survive the formal-only construct cut (72%).
- **KP/criminal signature** recurs: F2 money **50% / 65%** (unique to the two profit-motivated
  buckets); F3 Songun→8th-Congress pivot; 8th-Congress the most-active doctrine (its recent-share
  survives normalization better than the CN laws: 37%→36% vs 53%→27%).
- **Deterrence:** F4 and F5 are both classified as unidentified/underpowered designs; neither
  supports a deterrence claim in either direction (F4 now explicitly refuses one on n=4/p=0.62).
- **Census robustness:** every headline above is within noise of the 2026-07-02 (808-event, ~46%
  audited) ledger despite a 100% re-audit + 23 deletes/merges — the who×why relationships do not
  depend on unverified tags. The one directional move (attested legibility 14%→9%) is the
  expected consequence of holding analyst-named goals to the source.

_Last regenerated: 2026-07-11 · git `4657c60` · 785 events (100% qc-audited). Re-run
`make findings` after any corpus change; do not edit numbers by hand. Each script prints its own
corpus fingerprint, so a mismatch between this header and a fresh run is immediately visible._
