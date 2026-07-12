# AUSPEX paper

The dataset + methods paper. Everything regenerates from the atlas.

```sh
# from repo root, once: python3 -m venv .venv && .venv/bin/pip install matplotlib pyyaml numpy
cd paper
../.venv/bin/python figures.py     # -> figures/*.pdf  (recomputed live from atlas/)
tectonic main.tex                  # -> main.pdf
```

`figures.py` recomputes Figures 1, 2, 4, 5 and the census panel of 3 directly from the atlas YAML
using the exact conventions of the `analysis/` scripts (META set, attacker-rationale perspective
filter, terminal-MO buckets). The engine-eval and information-theoretic constants (Figures 3, 6, 7)
are pinned to the published ledgers — `analysis/FINDINGS.md` (`make findings`) and the `site/`
eval suite — with the provenance recorded inline in `figures.py`; a stale constant shows up as a
diff against a fresh `make findings`. Corpus provenance: 785 events, git 4657c60..bfc382d.
