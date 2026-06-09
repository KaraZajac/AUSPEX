# analysis/ — strategic-pattern analyses of the who×why join

Read-only, source-derived analyses that exploit the doctrine dimension (the thing pure
attribution can't do). Independent of the TS engine; run on system `python3` + pyyaml.

> **`FINDINGS.md`** is the reproducible numeric ledger — every figure these scripts produce, with
> its reproduce command and method caveats, and a blank interpretation slot per finding. The
> readings below are tool documentation; the dissertation interpretation is the candidate's.

- **`doctrine_to_operations.py`** — ★ **the core-theory test: do cyber operations come out of
  strategic documents?** Three observable legs, each computed on ALL attacker-rationale links
  *and* on ATTESTED-only links (a cited source — not the analyst — names the strategic goal):
  **(1) legibility** — 81% of operations carry a doctrine link (27% attested) — explicitly a
  *tagging-coverage* measure (selection-on-dependent-variable caveat built in); **(2) precedence**
  — 73–76% of (op, dated-doctrine) *pairs* follow the document, median +3yr, **robust on the
  construct-clean formal subset** (kind ∈ statute/strategy/treaty: 71–76%), with the 21–32% of
  pairs linking undated postures disclosed as excluded; **(3) information** — **null-corrected**
  (permutation null, the mo_narrowing method): doctrine resolves **~27% of actor-uncertainty**
  (1.76 bits; pool 91→**27** actors; attested 26%, pool 41→16). *Correction 2026-06-09:* the
  previously-reported naive figures (65–70% resolved, pool 91→5) contained ~6× sparsity
  overfitting, and the "attested cut is stronger" claim was an artifact of that sparsity —
  null-corrected, the two cuts are statistically indistinguishable (27% vs 26%). The script
  prints naive AND corrected, labeled; cite the corrected. **Cannot prove generation** —
  carries reverse-codification / analyst-tagging / common-cause / selection confounds explicitly.

- **`mo_narrowing.py`** — ★ **does doctrine → target → outcome progressively narrow the actor?**
  (the "each nation-state has its own MO" theory). Two parts: **(A)** a per-state MO fingerprint
  table — outcome buckets data / denial / money / influence — which confirms the signatures
  qualitatively (**KP=money 44% is the sharpest fingerprint in the corpus**; RU/IR=denial;
  CN=data); **(B)** an information-theoretic incremental chain on the actor. **The key
  methodological result:** the *naive* chain looks like doctrine+target+MO cuts the suspect
  pool 106→2, but a **label-permutation null** shows 60% of the deepest cells are singletons —
  the deep drop is **overfitting, not signal**. Null-corrected, **doctrine does the real work**
  (1.4 bits, pool 106→40); target and MO carry real info *alone* (~0.5 bits each) but are
  **largely redundant with doctrine** and add nothing verifiable beyond it at 547 events. So the
  theory holds **at the tails** (distinctive MOs like KP-money), not the espionage-saturated bulk.
  Runs on `false_flag_risk=none` only (honouring "if not a false flag"). Carries the
  **circularity** caveat (analysts *use* MO to attribute → partly definitional).

- **`doctrine_trends.py`** — doctrine activity over time, per-state op-tempo, **strategic
  pivots** (a state's dominant doctrine shifting early→late), leading-vs-lagging (do ops
  precede or follow the doctrine's publication), and doctrine co-occurrence.

- **`deterrence.py`** — does naming-and-shaming change behaviour? An **event-study with a
  difference-in-differences** control: punitive policy-actions (sanction / indictment /
  export-control / asset-seizure) against a TARGET STATE vs the state's ±2yr op tempo,
  differenced against the rest-of-world. *Corrected 2026-06-09 (audit C4):* right-censoring
  guard (16 truncated 2025 actions dropped — they had inflated "defiance"), window-CLUSTERING
  for effective-N (overlapping windows were pseudo-replication: 66 raw actions = only **4**
  independent (state, window) observations), and the contaminated-control + proxies-in-RU
  caveats made explicit. Honest summary: per-action mean DiD **+0.08** (≈ nothing); clustered
  mean **−0.29** on n=4 with endogeneity biased *toward* exactly that sign — **the deterrence
  question is not identifiable from this corpus design**; the analysis's value is demonstrating
  why (a finding in itself). State-level only.

- **`actor_deterrence.py`** — the sharper, ACTOR-level version (does naming a *specific* actor
  change *its* tempo?). Bridges call-outs/indictments to actors via meta events carrying an
  `actor_id` + `operators_named`. **Result is a negative methodological finding, by design:**
  the apparent strong "deterrence" (mean DiD −0.71) is an **artifact** — it contradicts the
  state-level cut, rests on N=9 actors with 1–4 ops each, and the built-in endogeneity
  diagnostic shows it concentrates in actors named *at their peak op-year* (−1.31 vs −0.23
  off-peak) → regression to the mean, not deterrence. The script *prints its own refutation.*
  Take-away: **the state level is the defensible granularity**; the actor level is too sparse
  and too endogenous for a causal read here.

```sh
python3 analysis/doctrine_to_operations.py
python3 analysis/mo_narrowing.py
python3 analysis/doctrine_trends.py
python3 analysis/deterrence.py
python3 analysis/actor_deterrence.py
```

> Caveat to carry into any write-up: absolute op-tempo over time partly reflects
> **corpus-collection coverage** (recent events are easier to source), not only real
> escalation. The *relative* findings — doctrine mix shifts, recent-share, pivots,
> lead/lag timing — are more robust to that bias than raw yearly counts. The two deterrence
> scripts are **observational and descriptive — association, not effect**; both carry the
> endogeneity (reverse-causality) caveat prominently, and `actor_deterrence.py` is retained
> precisely as a worked example of *recognising and rejecting* a confounded positive result.
