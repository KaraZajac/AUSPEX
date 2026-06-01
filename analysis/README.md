# analysis/ — strategic-pattern analyses of the who×why join

Read-only, source-derived analyses that exploit the doctrine dimension (the thing pure
attribution can't do). Independent of the TS engine; run on system `python3` + pyyaml.

- **`doctrine_trends.py`** — doctrine activity over time, per-state op-tempo, **strategic
  pivots** (a state's dominant doctrine shifting early→late), leading-vs-lagging (do ops
  precede or follow the doctrine's publication), and doctrine co-occurrence.

```sh
python3 analysis/doctrine_trends.py
```

> Caveat to carry into any write-up: absolute op-tempo over time partly reflects
> **corpus-collection coverage** (recent events are easier to source), not only real
> escalation. The *relative* findings — doctrine mix shifts, recent-share, pivots,
> lead/lag timing — are more robust to that bias than raw yearly counts.
