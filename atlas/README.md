# `atlas/` — the AUSPEX doctrine atlas

This is the canonical dataset. The whole product is built on top of
what lives in this directory. Treat it like code.

See [`../docs/DATA_MODEL.md`](../docs/DATA_MODEL.md) for the entity
definitions and relationships.

## Layout

```
atlas/
  nation-states/<id>.yaml                          # cn, ru, ir, kp, us
  services/<state>/<slug>.yaml                     # mss, gru-26165, irgc-io, rgb, nsa-tao
  doctrines/<state>/<slug>.yaml                    # mic2025, fpc-2023, resistance-axis, byungjin, ncs-2023
                                                   # pillars and programs nested INSIDE the doctrine file
  actors/<state>/<slug>.yaml                       # apt41, sandworm, lazarus, muddywater, equation-group
  sectors/sectors.yaml                             # flat taxonomy file (hierarchy via parent_id)
  targets/orgs/<slug>.yaml                         # saudi-aramco, sony-pictures, ronin-bridge
  targets/infra/<slug>.yaml                        # ukraine-power-grid, viasat-ka-sat
  policy-actions/<state-or-multilateral>/<YYYY-MM-DD>_<slug>.yaml
  timeline-markers/<state>/<slug>.yaml             # davidson-window-2027, mic2025-milestone, etc.
  events/<YYYY>/<MM>/<slug>.yaml                   # nested by date for sortable ls
  sources/<publisher>/<YYYY-MM-DD>_<slug>.yaml     # grouped by publisher for ease of audit
  campaigns/<slug>.yaml                            # v0.1 — Kimsuky surveillance, Volt Typhoon ongoing
```

## Editorial norms

1. **Source-anchored.** Every claim has a `sources:` list referencing
   files under `sources/`. No source = the claim doesn't ship.
2. **Confidence-labeled.** Doctrine links use the
   `attested / strongly_inferred / plausible` enum from SCHEMA.
   Attribution confidence uses ICD-203 `high / moderate / low`.
3. **Doctrine linkage is independent of actor attribution.** An
   event can be doctrine-tagged without a named actor (see
   `docs/DATA_MODEL.md` §9). Tag it anyway.
4. **Slugs are stable.** A slug is forever. If a name changes
   (Brass Typhoon → Mustang Panda → whatever), add an alias; don't
   rename the slug.
5. **Dates are ISO 8601.** Daterange = `start: YYYY-MM-DD, end: YYYY-MM-DD`.
6. **YAML, not JSON.** JSON is generated at build time.

## Gold-standard examples to read first

- `doctrines/cn/mic2025.yaml` — doctrine with all 10 pillars nested
- `doctrines/kp/byungjin.yaml` — superseded doctrine, simpler shape
- `actors/kp/lazarus.yaml` — multi-service actor with full alias table
- `events/2022/03/ronin-bridge.yaml` — simple event, one doctrine link, attested
- `events/2023/05/volt-typhoon-public-disclosure.yaml` — complex event, two pillars in one doctrine + timeline marker, mixed confidence
- `sources/treasury/2022-04-14_lazarus-axie.yaml` — primary-source citation

## Validation (v0.1)

A Python validator under `tools/validate.py` will check:
- Every slug used as an FK resolves to an existing entity
- Required fields populated per SCHEMA
- Confidence enums match the controlled vocabulary
- Source citations point to files that exist
- Date ordering sane (`start_date <= disclosure_date`)

Not built yet. Will be the first script after the normalizer pass.
