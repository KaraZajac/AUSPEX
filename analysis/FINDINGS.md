# FINDINGS — numeric ledger for the who×why analyses

**Purpose.** A reproducible record of every number the `analysis/` scripts produce, each with
its exact reproduce command and the method caveats that bound it. This is a **verification aid
and planning scaffold, not dissertation prose.** Every `Interpretation (Kara):` slot is left
blank deliberately — the reading, the argument, and the claims are the candidate's to write and
to verify independently.

**Snapshot.** Corpus at 2026-06-09 (post-correction re-baseline) · 818 events · 205 actors ·
86 doctrines (now `kind`-classified: 48 strategy / 23 posture / 7 statute / 6 treaty /
2 event-anchor) · 179 policy-actions · 1,272 sources. **This ledger supersedes the 2026-05-31
version**: the analyses were corrected per `docs/MODELING-AUDIT-2026-06-09.md` (C2, C4, H4, H7)
— permutation-null correction in F1, right-censoring + effective-N clustering in F4,
perspective-filtered doctrine links throughout, within-year normalization in F3. Where a
previously-published number changed, the old value is shown ~~struck~~ with the reason.

**Reproduce (all).** System `python3` + `pyyaml`, from repo root:
```sh
python3 analysis/doctrine_to_operations.py
python3 analysis/mo_narrowing.py
python3 analysis/doctrine_trends.py
python3 analysis/deterrence.py
python3 analysis/actor_deterrence.py
```
Every figure regenerates from the one command in its section. Independent of the TS engine.
All scripts now use ATTACKER-RATIONALE doctrine links only (victim-response / defender-response
links are the other side's doctrine — see `docs/SCHEMA.md` perspective field).

---

## F1 · Do operations come out of strategic documents? (`doctrine_to_operations.py`)

Population: 731 operational events. Each leg on **all** attacker-rationale links and on
**attested-only** links (a cited source — not the analyst — names the strategic goal).

| Leg | Measure | All links | Attested-only |
|---|---|---|---|
| 1 Legibility | ops carrying a doctrine link | 594/731 (**81%**) | 201/731 (**27%**) |
| | *(explicitly a tagging-coverage measure — see caveat 4)* | | |
| 2 Precedence | (op, dated-doctrine) pairs | 600 | 203 |
| | excluded: pairs linking an UNDATED doctrine | 288 (32%) | 55 (21%) |
| | median gap / % follow | **+3 yr** / 73% | **+3 yr** / 76% |
| | **formal-only** (kind ∈ statute/strategy/treaty) | n=503 · +3 yr · **71%** | n=181 · +3 yr · **76%** |
| 3 Information | H(actor) | 6.50 bits (≈91) | 5.37 bits (≈41) |
| | naive MI *(do not cite — sparsity-inflated)* | ~~4.25 bits / pool→5~~ | ~~3.76 bits / pool→3~~ |
| | **null-corrected real MI** (K=40 permutation) | **1.76 bits (27%)** | **1.37 bits (26%)** |
| | **null-corrected suspect pool** | **91 → 27 actors** | **41 → 16 actors** |

**Correction (2026-06-09, audit C2).** The previously-published LEG 3 figures (65–70%
uncertainty resolved; pool 91→5 / 42→3) were the naive conditional entropy — the same
sparsity-overfitting F2's permutation null was built to remove (~6× overstatement here). The
corrected claim: **knowing the doctrine resolves ~27% of actor-uncertainty and cuts the
effective suspect pool ~3.4×** (91→27). The earlier claim that the attested cut was *stronger*
(70% vs 65%) was an artifact of the smaller subset's sparsity — null-corrected, the cuts are
indistinguishable (27% vs 26%), which still supports "not an artifact of our tagging," just
not "stronger."

Most actor-determining doctrines (H≈0): Hunt Forward→CNMF; LII→Storm-1516; 14th/15th FYP &
Dual Circulation→APT41-cluster; RU NSS→Star Blizzard; Begin Doctrine→Olympic Games team.
Most generic: Sanctions-Response (H 4.27), Nat-Intel-Law 2017 (3.56), MCF (3.54).
Exemplar attested chains (gap ≤10yr): NATO Ultimatum 2021→APT28 (+1); 8th Congress→Citrine
Sleet/3CX (+1); Defend Forward/NSPM-13→Iran-retaliation (+1); Info-Security 2016→Berserk Bear
(+2); Hunt Forward→Estonia (+2); Sanctions-Evasion 2014→Pioneer Kitten (+3); MIC2025→APT31 (+3).
Stuxnet: Olympic Games (2007, us/olympic-games-team) ← Begin Doctrine + Counter-Iran posture
(IL, explicit `attacker-rationale` — joint-op cross-state rationale) + Title 10/50; the 2009
null-actor record's Iranian doctrine link is now `perspective: victim-response` and excluded
from all who×why computations.

**Method caveats:** observational; cannot prove generation. (1) reverse codification;
(2) analyst-mediated tagging (attested cut); (3) common-cause geopolitics; (4) **selection on
the dependent variable** — doctrines enter the atlas because ops were observed, and resistant
ops may simply not get links, so legibility measures tagging coverage; (5) cite only
null-corrected LEG 3 figures. Pairs ≠ ops (multi-doctrine ops contribute multiple pairs).

**Interpretation (Kara):** _______________________________________________

---

## F2 · MO chain: doctrine → target → outcome (`mo_narrowing.py`)

Population: 549 operational events (single attributed actor, `false_flag_risk=none`;
excluded: 50 false-flag, 132 multi-actor). Perspective-filtered.

**A. Per-state MO fingerprint** (top rows; full table in script output):

| state | n | data | denial | money | access | signature |
|---|---|---|---|---|---|---|
| cn | 101 | 78% | 0% | 1% | 18% | data |
| ru | 93 | 41% | 38% | 5% | 12% | data (denial 38%) |
| kp | 58 | 22% | 15% | **44%** | 15% | **money** |
| ir | 53 | 54% | 39% | 1% | 1% | data (denial 39%) |
| criminal | 47 | 31% | 40% | 25% | 2% | denial |

H(state) 3.56 → H(state|MO) 3.02 (null 3.47) → **MO resolves 13% of state-identity beyond
chance.**

**B. Single features** (baseline H(actor)=6.74 bits ≈107 actors; REAL = null-corrected):
doctrine −1.38 REAL bits · sector −0.52 · MO −0.51.

**C. Incremental chain** (REAL pool): nothing 107 → +doctrine **40.7** (+1.39 bits) →
+sector 52.9 (−0.38) → +MO 59.2 (−0.16). Deepest level: 229 cells, 59% singletons. Doctrine
does the real work; target/MO are real alone but redundant beyond doctrine at this corpus size;
the naive 107→2 chain is overfitting (the negative Δreal values flag the correction's own
instability at singleton-dominated depths).

**Method caveats:** circularity (analysts use MO/target/doctrine *to* attribute — partly
definitional); permutation null (K=40, stable); trust REAL not naive; primary-feature
simplification; year-granular.

**Interpretation (Kara):** _______________________________________________

---

## F3 · Doctrine trends over time (`doctrine_trends.py`)

888 attacker-rationale doctrine-links across operations, 1996–2026. **New (audit follow-up):
within-year normalization** (each link weighted 1/year-total) — raw vs normalized divergence
flags collection-bias-sensitive findings.

- **Most-active doctrines (raw n · recent-3yr share raw|normalized):** kp/8th-congress 50
  (34%|23%); in/regional-collection 48 (22%|9%); cn/nat-intel-law-2017 47 (**55%|18% —
  norm-divergent ⚠**); cn/mcf 44 (9%|1%); ru/sanctions-response 41 (58%|48%);
  ir/deniable-retaliation 35 (42%|30%); cn/intelligentized 30 (56%|42%);
  ru/military-doctrine-2014 28 (**28%|5% ⚠**); ir/asymmetric-warfare 26 (**42%|13% ⚠**).
  *Recent-share rankings for the ⚠ doctrines are substantially collection-density-driven.*
- **State op-tempo (raw rank vs normalized rank):** cn 186 (1→1), ru 164 (2→2), ir 142 (3→4),
  kp 90 (4→6), **us 60 (5→3 — rises under normalization)**, in 58 (6→7), vn/pk/tr each −2.
  Raw rankings for kp/vn/pk/tr are partly density artifacts; cn/ru are robust.
- **Strategic pivots (unchanged):** cn MCF→Nat-Intel-Law; ru Military-Doctrine→Sanctions-
  Response; ir Asymmetric→Deniable-Retaliation; kp Songun→8th-Congress; us Title-10/50→NCS-2023.
- **Lead/lag:** n=600 pairs · median **+3yr** · 18% precede / 8% same-year / 73% follow.
  *(Same computation as F1 LEG 2 — must agree, and does.)*
- **Top same-state co-occurring pairs:** mcf+mic2025; mcf+nat-intel-law;
  military-doctrine+russkiy-mir; asymmetric+deniable-retaliation.

**Method caveats:** absolute tempo reflects collection coverage — **now measured, not
asserted**: the normalized columns are the robustness check, and several headline recent-shares
do NOT survive it. Year-granular.

**Interpretation (Kara):** _______________________________________________

---

## F4 · State-level deterrence / naming-and-shaming (`deterrence.py`)

**Corrected 2026-06-09 (audit C4): the previous finding is withdrawn.** The prior ledger said
mean DiD ~~+0.17, "no deterrence; mild acceleration; endogeneity strengthens the reading"~~.
Three defects drove that number: 16 right-censored 2025 actions with half-empty post-windows
(inflating "defiance"), pseudo-replication (overlapping ±2yr windows counted as independent),
and treated states inside the "rest-of-world" control.

Corrected outputs:
- **Per-action view** (66 of 83 actions; 16 right-censored dropped; still pseudo-replicated,
  kept for continuity): mean DiD **+0.08**, median +0.02 — ≈ no signal. Per-state: ru −0.04,
  cn +0.17, kp +0.11, ir +0.21.
- **Per window-cluster view (effective-N — cite this one):** the 66 actions collapse to
  **n=4** independent (state, window) observations — kp −1.00, ru −0.75, cn −0.83, ir +1.40;
  mean **−0.29**.

**Honest summary: the deterrence question is NOT identifiable from this corpus design.** The
per-action estimate is ≈0; the clustered estimate is weakly deceleration-consistent but sits on
n=4 with endogeneity biased *toward* exactly that sign and a contaminated control. The
analysis's contribution is methodological: it demonstrates *why* state-level
naming-and-shaming effects cannot be read off an event atlas of this size and structure.

**Method caveats:** endogeneity (actions respond to surges → false-deterrence bias);
pseudo-replication (cite clusters, not actions); contaminated control (treated units in the
"rest of world"); RU bucket includes `ru/proxies/*` crews (~31% of RU ops) by the documented
placement rule; year-granular; right-censored actions dropped. Association, not effect.

**Interpretation (Kara):** _______________________________________________

---

## F5 · Actor-level deterrence (`actor_deterrence.py`)

Unchanged in design (it already had the right-censoring guard); retained as a worked example of
recognising and rejecting a confounded positive result. N=9 actors; all-namings mean DiD
**−0.71** (median −0.88); endogeneity diagnostic: named-at-peak **−1.31** vs off-peak **−0.23**
→ regression to the mean. *Updated:* the control-contamination caveat is now explicit (~27% of
some control windows are other named actors), and the cross-check no longer cites the withdrawn
state-level +0.17 — both granularities are now framed as **designs too weak for the question**.

**Interpretation (Kara):** _______________________________________________

---

## Cross-analysis checks — corrected framing

- **F1 ↔ F2 (the methodological lesson, replacing the old "consistent across methods" claim):**
  F1's original 91→5 was the naive version of the number F2's permutation null was built to
  debunk; the 2026-05-31 ledger cited them as mutually confirming, which was wrong. NOW both
  use the null: F1 doctrine→actor real MI **1.76 bits / pool 91→27** (event-weighted, multi-actor
  ops included) vs F2 doctrine-feature **1.38–1.39 REAL bits / pool 107→41** (single-actor ops,
  false-flag-filtered). Same order of magnitude under different conditioning — *that* is the
  honest consistency claim, and the naive-vs-corrected gap (~6×) is itself a finding about
  sparse-corpus information estimates.
- **+3yr precedence** appears identically in F1 LEG 2 and F3 lead/lag (n=600 both) — same
  computation, two entry points; they agree. It also survives the formal-only construct cut.
- **KP signature** recurs: F2 money 44% (unique); F3 Songun→8th-Congress pivot; 8th-Congress
  the most-active doctrine (and its recent-share survives normalization better than the CN
  laws: 34%→23% vs 55%→18%).
- **Deterrence:** F4 and F5 no longer "contradict" — both are now classified as unidentified
  designs; neither supports a deterrence claim in either direction.

_Last regenerated: 2026-06-09 (post-audit corrections, perspective-filtered links,
`kind`-classified doctrines). Re-run the commands above after any corpus change; do not edit
numbers by hand. Prior ledger: git history at f57666d._
