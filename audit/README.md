# audit/ — independent atlas verification harness

`verify_atlas.py` reads the **raw atlas YAML directly** (Python + pyyaml, *not* the AUSPEX
TS engine) and reports, with reasons, the events / sources / tags a human must verify. It
is an *independent* check by design: a reviewer (or examiner) can trust it without trusting
AUSPEX's own code, and it turns "verify 1,000+ sources and tags by hand" into "review the
flagged subset."

It does **not** decide truth. `ERROR` = structural breakage (fails the run). `WARN`,
`REVIEW`, `INFO` are *worklists for you*, not failures.

## Run

```sh
python3 audit/verify_atlas.py                 # fast: structural + consistency checks
python3 audit/verify_atlas.py --check-urls    # also curl-probes every source URL (slow, 1,000+)
```

Output: a grouped console report + a full `audit/audit-report.json` (diffable across runs to
track verification progress). Exit non-zero only on `ERROR`.

## What it checks

| check | severity | what / why |
|---|---|---|
| `fk-*`, `enum`, `yaml` | ERROR | dangling foreign keys + controlled-vocab violations, re-derived independently |
| `source-orphan` | WARN | source referenced by no event/actor/doctrine/service/marker |
| `source-dup` | WARN | multiple source records sharing one URL (merge, or a generic-landing-URL artifact) |
| `source-url` | WARN | source with **no url, no archive_url, and no note** — violates the "url:null + note" rule |
| `source-kind` | WARN | missing `kind` |
| `icd203-attested` | WARN | a doctrine_link marked `attested` with **no `attesting_source_id`** (attested needs a source naming the goal) |
| `convention-counterop` | REVIEW | a **purely-meta** event (disclosure/advisory/sanction/indictment) that still names an attacker — *counter-action that should be null-actor, or a disclosure that legitimately names the actor?* |
| `convention-nullactor` | REVIEW | a **core operation** (intrusion/theft/wiper/…) with **no actor** — genuinely unattributed, or missing attribution? |
| `direction-selftarget` | REVIEW/INFO | actor targets its own country — domestic surveillance (expected) vs a directionality/modeling error |
| `doctrine-state-mismatch` | REVIEW | **the key tagging-error catch:** a doctrine whose state ≠ the attributed actor's state (mis-tagged doctrine, a cross-state op, or a counter-action where the doctrine is the *acting* state's — verify which) |
| `doctrine-nullactor` | INFO | count of doctrine_links on null-actor events (allowed by design; spot-check counter-ops) |
| `backlog-*` | INFO | QC frontier: provisional markers, TODO(QC) markers, `/unscoped` actors, ops missing a doctrine link |
| `url-dead` / `url-summary` | REVIEW/INFO | (with `--check-urls`) non-2xx/3xx URLs — bot-blocks or dead links to re-pull |

## Deliberate non-checks (false-positive traps we refuse to fall into)

- **We do NOT require a source's publisher country to match the actor's country.** A US
  government source reporting a Russian actor is normal; flagging it would be pure noise.
- **We do NOT treat a Western-actor → adversary-country event as inherently wrong**
  (Stuxnet US→IR is a real operation). Directionality is surfaced only via the counter-op
  conventions, never a "who-may-attack-whom" prior.
- The counter-op detector keys on `incident_type`, **not** on text — "law-enforcement" in a
  name (e.g. "…law-enforcement officials") is not a counter-action.

## How to use it for hand-verification

1. `ERROR` → fix immediately (and `pnpm validate` should agree).
2. `source-url` (WARN) → your **source-verification worklist**: every source needs a working
   URL or an explicit `url:null` + note. Pair with `--check-urls` for liveness.
3. `doctrine-state-mismatch` (REVIEW) → your **tagging-error worklist**: each is a doctrine
   on a different-state actor — confirm it's an intended cross-state/counter-op case or fix it.
4. `convention-*` (REVIEW) → confirm the counter-op / null-actor modeling on each.
5. `backlog-*` (INFO) → the QC frontier; work it down over time and re-run to watch it shrink.

The harness surfaces; **you verify and decide.** Re-run after edits; diff `audit-report.json`
to prove progress (useful as a dissertation appendix: a falling REVIEW count over time).
