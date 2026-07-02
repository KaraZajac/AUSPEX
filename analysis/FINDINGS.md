# FINDINGS — numeric ledger for the who×why analyses

**Purpose.** A reproducible record of every number the `analysis/` scripts produce, each with
its exact reproduce command and the method caveats that bound it. This is a **verification aid
and planning scaffold, not dissertation prose.** Every `Interpretation (Kara):` slot is left
blank deliberately — the reading, the argument, and the claims are the candidate's to write and
to verify independently.

**Snapshot.** Corpus at 2026-07-02 · **808 events** · 215 actors · 86 doctrines · 179
policy-actions · 1,379 sources · **git `f34e973`** (each script now prints this fingerprint as
its first output line — a stale ledger is self-evident). **This ledger supersedes the 2026-06-09
version** (818 events / 731 ops). What changed the numbers since then:
1. the **QC census** (~46% of events now audited) removed **3 fabricated events**
   (sidewinder-maritime, apt36-pension-portal, ghostwriter-german-greens) and **3 duplicates**
   (apt32-covid-wuhan, facebook-cyberone, sidewinder-china-academic / cyfirma-donot), and
   **re-graded attestation** (the 2026-06-19 over-attestation pass roughly **halved the attested
   stratum** — F1 attested legibility 27% → 14%);
2. the **deterrence right-censoring fix** (last *complete* year, not last year *present*) +
   **attribution de-duplication** — which **flipped the sign** of the per-action state-level DiD.
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

Population: **701 operational events** (86 doctrines, 215 actors). Each leg on **all**
attacker-rationale links and on **attested-only** links (a cited source — not the analyst —
names the strategic goal).

| Leg | Measure | All links | Attested-only |
|---|---|---|---|
| 1 Legibility | ops carrying a doctrine link | 562/701 (**80%**) | 102/701 (**14%** ~~27%~~) |
| | *(explicitly a tagging-coverage measure — see caveat 4)* | | |
| 2 Precedence | (op, dated-doctrine) pairs | 558 | 93 |
| | excluded: pairs linking an UNDATED doctrine | 275/833 (33%) | 36/129 (27%) |
| | median gap / % follow | **+3 yr** / 73% | **+3 yr** / 78% |
| | **formal-only** (kind ∈ statute/strategy/treaty) | n=474 · +3 yr · **71%** | n=85 · +3 yr · **78%** |
| 3 Information | H(actor) | 6.52 bits (≈92) | 4.87 bits (≈29) |
| | naive MI *(do not cite — sparsity-inflated)* | ~~4.21 bits / pool→5~~ | ~~3.67 bits / pool→2~~ |
| | **null-corrected real MI** (K=40 permutation) | **1.70 bits (26%)** | **1.02 bits (21%)** |
| | **null-corrected suspect pool** | **92 → 28 actors** | **29 → 14 actors** |

**Standing correction (audit C2, 2026-06-09).** The LEG 3 figures are the **null-corrected**
conditional entropy, not the naive drop (which overstates narrowing ~6×). The claim: **knowing
the doctrine resolves ~26% of actor-uncertainty and cuts the effective suspect pool ~3.3×**
(92→28). Null-corrected, the all-links (26%) and attested-only (21%) cuts are the same order of
magnitude — the relationship is **not merely an artifact of how we chose to tag** (an attested
source, not the analyst, names the goal), though it is no longer "stronger under attestation."

Most actor-determining doctrines (H≈0): Begin Doctrine→Olympic Games team; China Standards
2035→APT10; Industrial-Collection→APT32; NIS Counter-DPRK→DarkHotel; Mavi Vatan→Sea Turtle;
RU NSS→Star Blizzard; 14th/15th FYP→APT41-cluster. Most generic: Informatized Warfare (H 3.31),
Forward Defense (3.35), BRI/Digital Silk Road (3.41), MCF (3.59), 2017 Nat-Intel-Law (3.85),
Post-2022 Sanctions-Response (3.90). Exemplar attested chains (gap ≤12yr): Sanctions-Response
2022→Turla (+1); NATO Ultimatum 2021→APT28 (+1); 8th Congress 2021→Lazarus/ChipMixer (+2);
Info-Security 2016→Berserk Bear (+2); Byungjin 2013→APT38 (+3); Sanctions-Evasion 2014→Pioneer
Kitten (+3); Defend Forward 2018→CMF (+4); Informatized Warfare 2019→Salt Typhoon (+5). Stuxnet:
Olympic Games (2007, us/olympic-games-team) ← Begin Doctrine + Counter-Iran posture (IL, explicit
`attacker-rationale`) + Title 10/50; the 2009 null-actor record's Iranian doctrine link is
`perspective: victim-response` and excluded from all who×why computations.

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

Population: **521 operational events** (single attributed actor, `false_flag_risk=none`;
excluded: 48 false-flag, 132 multi-actor). Perspective-filtered.

**A. Per-state MO fingerprint** (top rows by n; full table in script output):

| state | n | data | denial | money | access | signature |
|---|---|---|---|---|---|---|
| cn | 95 | 85% | 1% | 2% | 11% | data |
| criminal | 70 | 30% | 41% | 22% | 5% | denial |
| ru | 69 | 49% | 36% | 0% | 11% | data (denial 36%) |
| kp | 57 | 21% | 15% | **47%** | 14% | **money** |
| ir | 53 | 54% | 39% | 1% | 1% | data (denial 39%) |

H(state) 3.57 → H(state|MO) 3.04 (null 3.47) → **MO resolves 12% of state-identity beyond
chance.**

**B. Single features** (baseline H(actor)=6.80 bits ≈112 actors; REAL = null-corrected):
doctrine −1.31 REAL bits · sector −0.41 · MO −0.46.

**C. Incremental chain** (REAL pool): nothing 112 → +doctrine **45** (+**1.30 bits**) →
+sector (Δreal **−0.50**) → +MO (Δreal **−0.15**). Deepest level: 236 cells, **61% singletons**.
Doctrine does the real work; target/MO are real *alone* (§B ~0.4–0.5 bits each) but redundant
beyond doctrine at this corpus size; the naive 112→2 chain is overfitting (the negative Δreal
values flag the correction's own instability at singleton-dominated depths).

**Method caveats:** circularity (analysts use MO/target/doctrine *to* attribute — partly
definitional); permutation null (K=40, stable); trust REAL not naive; primary-feature
simplification; year-granular; collection-biased.

**Interpretation (Kara):** _______________________________________________

---

## F3 · Doctrine trends over time (`doctrine_trends.py`)

**833 attacker-rationale doctrine-links** across operations, 1996–2026 (86 doctrines, 15 states).
Within-year normalization (each link weighted 1/year-total) flags collection-bias-sensitive
findings (⚠ = raw vs normalized diverge ≥20 points).

- **Most-active doctrines (raw n · recent-3yr share raw|normalized):** kp/8th-congress 52
  (36%|25%); cn/nat-intel-law-2017 46 (**54%|19% ⚠**); in/regional-collection 42 (26%|12%);
  cn/mcf 40 (10%|2%); ir/cyber-deniable-retaliation 35 (40%|33%); ru/sanctions-response 33
  (51%|42%); ir/forward-defense 31 (19%|26%); cn/intelligentized 29 (51%|42%);
  ru/military-doctrine-2014 27 (**29%|5% ⚠**); ru/russkiy-mir 27 (25%|11%).
  *Recent-share rankings for the ⚠ doctrines are substantially collection-density-driven.*
- **State op-tempo (raw count · normalized rank shift):** cn 180 (1→1), ru 151 (2→2), ir 142
  (3→3), kp 90 (4→6), in 52 (5→7), **us 45 (6→4 — rises under normalization)**, ae 32, pk 26,
  tr 25, il 21. Raw rankings for kp/in/pk/tr are partly density artifacts; cn/ru are robust.
- **Strategic pivots (state's #1 doctrine, early half → late half):** cn MCF→Nat-Intel-Law;
  ru Military-Doctrine→Sanctions-Response; kp Songun→8th-Congress; in Contractor/Hack-for-Hire→
  Regional-Collection; us Title-10/50→NCS-2023.
- **Lead/lag:** n=558 pairs · median **+3yr** · 18% precede / 8% same-year / 73% follow.
  *(Same computation as F1 LEG 2 — must agree, and does.)*
- **Top same-state co-occurring pairs:** mcf+mic2025 (14); mcf+nat-intel-law (11);
  ir asymmetric+deniable-retaliation (10); ae procurement+regime-protection (10);
  ir deniable-retaliation+forward-defense (9); ru military-doctrine+russkiy-mir (9).
  *(Section 5 now excludes pure-meta events, matching sections 1–4.)*

**Method caveats:** absolute tempo reflects collection coverage — **measured, not asserted**:
the normalized columns are the robustness check, and several headline recent-shares do NOT
survive it. Year-granular.

**Interpretation (Kara):** _______________________________________________

---

## F4 · State-level deterrence / naming-and-shaming (`deterrence.py`)

**Corrected 2026-07-02 (audit C4a, recurrence).** The prior ledger's ~~−0.29 clustered /
+0.08 per-action~~ used the last year *present* (2026, partial + collection-lagged) as the
right-censoring boundary, keeping half-empty post-windows and biasing toward false
"deterrence"; and it counted op-tempo once **per attribution** (multi-org events over-counted
~8%). Both are fixed (boundary = last *complete* year = 2025; tempo = once per distinct
attacker-state).

Corrected outputs (51 of 83 punitive actions have usable ±2yr windows; **32 right-censored**
past 2025):
- **Per-action view** (pseudo-replicated, kept for continuity): mean DiD **+0.11** (~~−0.42~~ /
  ~~+0.08~~), median +0.02 — 45% deceleration / 54% acceleration ≈ **no signal, if anything a
  slight sign flip toward defiance**. Per-state: ru +0.17, cn −0.11, kp +0.26, ir +0.20.
- **Per window-cluster view (effective-N):** the actions collapse to **n=4** independent
  (state, window) observations — cn −0.92, ru −0.64, kp −0.77, ir +0.15; mean **−0.54**.
- **Verdict (now gated by a sign test):** *"n=4 clusters is too small for inference — clustered
  mean DiD −0.54 is DESCRIPTIVE ONLY (two-sided sign test **p=0.62**; not significant). Do NOT
  read as deterrence or defiance."* The script no longer prints a directional conclusion.

**Honest summary: the deterrence question is NOT identifiable from this corpus design.** The
per-action estimate is ≈0 (mildly positive); the clustered estimate is negative but on n=4 with
a non-significant sign test, endogeneity biased *toward* that sign, and a contaminated control.
The analysis's contribution is methodological: it demonstrates *why* state-level
naming-and-shaming effects cannot be read off an event atlas of this size and structure.

**Method caveats:** endogeneity (actions respond to surges → false-deterrence bias);
pseudo-replication (cite clusters, not actions); contaminated control (treated units in the
"rest of world"); RU bucket includes `ru/proxies/*` crews (~31% of RU ops) by the documented
placement rule; year-granular; right-censored actions dropped. Association, not effect.

**Interpretation (Kara):** _______________________________________________

---

## F5 · Actor-level deterrence (`actor_deterrence.py`)

Retained as a worked example of recognising and rejecting a confounded positive result (it
already used the complete-year censoring guard; the attribution-dedup fix now applies here too).
**N=10 actors** (3 named-by-indictment, 7 disclosure-only; 3 more dropped as right-censored).
all-namings mean DiD **−0.85** (median −0.78, 70% decelerated-vs-world); indictment subgroup n=3
**−1.50**; endogeneity diagnostic: **named-at-peak −1.98 vs off-peak −0.37** (n=7) → regression
to the mean. **Verdict: UNDERPOWERED + CONFOUNDED** — parallel-trends violated by construction
(naming triggered by the actor's own surge), control contaminated (~27% of some control windows
are other named actors), per-actor op counts 1–4. Do NOT claim actor-level deterrence; the
state-level clustered view is the defensible granularity, and it is itself non-significant (F4).

**Interpretation (Kara):** _______________________________________________

---

## Cross-analysis checks

- **F1 ↔ F2 (both null-corrected):** F1 doctrine→actor real MI **1.70 bits / pool 92→28**
  (event-weighted, multi-actor ops included) vs F2 doctrine-feature **1.30 REAL bits / pool
  112→45** (single-actor ops, false-flag-filtered). Same order of magnitude under different
  conditioning — *that* is the honest consistency claim; the naive-vs-corrected gap (~6×) is
  itself a finding about sparse-corpus information estimates.
- **+3yr precedence** appears identically in F1 LEG 2 and F3 lead/lag (**n=558 both**) — same
  computation, two entry points; they agree, and survive the formal-only construct cut (71%).
- **KP signature** recurs: F2 money **47%** (unique); F3 Songun→8th-Congress pivot; 8th-Congress
  the most-active doctrine (its recent-share survives normalization better than the CN laws:
  36%→25% vs 54%→19%).
- **Deterrence:** F4 and F5 are both classified as unidentified/underpowered designs; neither
  supports a deterrence claim in either direction (F4 now explicitly refuses one on n=4/p=0.62).

_Last regenerated: 2026-07-02 · git `f34e973` · 808 events. Re-run `make findings` after any
corpus change; do not edit numbers by hand. Each script prints its own corpus fingerprint, so a
mismatch between this header and a fresh run is immediately visible._
