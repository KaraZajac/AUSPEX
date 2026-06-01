# analysis/ — strategic-pattern analyses of the who×why join

Read-only, source-derived analyses that exploit the doctrine dimension (the thing pure
attribution can't do). Independent of the TS engine; run on system `python3` + pyyaml.

- **`doctrine_to_operations.py`** — ★ **the core-theory test: do cyber operations come out of
  strategic documents?** Three observable legs, each computed on ALL links *and* on
  ATTESTED-only links (where a cited source — not the analyst — names the strategic goal):
  **(1) legibility** — 83% of operations carry a doctrine link (29% attested); **(2) precedence**
  — 73–75% of ops *follow* the document, median +3yr (the temporal arrow); **(3) information**
  — knowing the doctrine resolves **65% of actor-uncertainty** (70% attested), shrinking the
  effective suspect pool from **91→5 actors** (42→3 attested). The relationship is *stronger*
  on the attested cut, so it is not an artifact of AUSPEX's own tagging. Surfaces the most
  actor-determining vs. most generic doctrines, exemplar document→op chains, and the founding
  Stuxnet case. **Cannot prove generation** — carries the reverse-codification / analyst-tagging
  / common-cause confounds explicitly.

- **`doctrine_trends.py`** — doctrine activity over time, per-state op-tempo, **strategic
  pivots** (a state's dominant doctrine shifting early→late), leading-vs-lagging (do ops
  precede or follow the doctrine's publication), and doctrine co-occurrence.

- **`deterrence.py`** — does naming-and-shaming change behaviour? An **event-study with a
  difference-in-differences** control: for each punitive policy-action (sanction / indictment
  / export-control / asset-seizure) against a TARGET STATE, the state's op tempo in the ±2yr
  windows is differenced against the rest-of-world trend. Finding: mean DiD **+0.17** — no
  detectable deterrence (mild acceleration); endogeneity biases *toward* false deterrence, so
  the observed acceleration only strengthens the no-deterrence reading. State-level only.

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
