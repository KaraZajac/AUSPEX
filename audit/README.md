# audit/ — independent atlas verification harness

Three **independent** tools that read the **raw atlas YAML directly** (Python + pyyaml,
*not* the AUSPEX TS engine), so a reviewer or examiner can trust them without trusting
AUSPEX's own code:

| tool | answers | dependency |
|---|---|---|
| `check_conformance.py` | **Does every record fit the formal schema?** (required fields, types, enums, no stray fields) | stdlib + pyyaml |
| `verify_atlas.py` | **What's inconsistent or needs human review?** (referential integrity, source hygiene, tagging conventions, directionality) | stdlib + pyyaml |
| `introspect_schema.py` | **What IS the schema, empirically?** (field presence/types/enums per entity — feeds `docs/SCHEMA.md`) | stdlib + pyyaml |

`schemas/atlas.schema.json` is the **formal, standard JSON Schema** the data is checked
against (re-validatable with `ajv` / `jsonschema` too — it is not AUSPEX-specific).

## Run

```sh
python3 audit/check_conformance.py            # all-data-fits-the-schema check (PASS/FAIL)
python3 audit/check_conformance.py --self-test # validate the validator on known good/bad cases
python3 audit/verify_atlas.py                 # consistency + referential audit
python3 audit/verify_atlas.py --check-urls    # also curl-probes every source URL (slow, 1,000+)
python3 audit/introspect_schema.py            # regenerate the empirical schema profile
```

`check_conformance.py` exits non-zero if any record fails to conform; current run:
**PASS — 2,934/2,934 records conform.** `verify_atlas.py` writes a diffable
`audit/audit-report.json` and exits non-zero only on structural `ERROR`.

> **Keeping the schema honest.** If `check_conformance` fails, either the data has a defect
> (fix it) or the schema is wrong/over-constrained (fix `schemas/atlas.schema.json` and note
> why). Example: `orgs/asean-governments` is a deliberate multi-national aggregate, so
> `target_entity.nation_state_id` was made optional rather than forcing a bogus value.
> Re-run `introspect_schema.py` after schema changes to keep `docs/SCHEMA.md` in step.

## Enforcement — the verification gate

`audit/gate.sh` runs the three hard gates and exits non-zero if any fail (quiet on pass,
verbose on the failing one): **schema conformance** (`check_conformance.py`), **atlas
consistency** (`verify_atlas.py`, structural ERRORs only), and the **engine validator**
(`pnpm validate`, skipped if pnpm isn't installed — the Python checks still gate FK + enums).

```sh
make verify          # run the gate manually
make install-hooks   # enable it as a git pre-commit hook for this clone
```

`make install-hooks` sets `core.hooksPath=.githooks`. The committed `.githooks/pre-commit`
runs the gate **only when `atlas/` or `audit/schemas/` files are staged** (non-data commits
stay instant), and **blocks the commit** on failure. Bypass a single intentional commit with
`git commit --no-verify`. WARN/REVIEW findings never block — they're worklists, not gates.

(Each clone runs `make install-hooks` once; the hook + gate are version-controlled, the
`core.hooksPath` setting is local.)

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
