#!/bin/sh
# AUSPEX verification gate — run before committing atlas/schema changes.
# Runs the independent Python checks (no node needed) plus the engine validator if pnpm is
# present. Quiet on pass, verbose on the failing check. Exits non-zero if any gate fails.
#   sh audit/gate.sh   (or: make verify)
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" || exit 2
fail=0
echo "── AUSPEX verification gate ──"

# 1. schema conformance — every record fits audit/schemas/atlas.schema.json
if python3 audit/check_conformance.py >/tmp/auspex-gate-conf.log 2>&1; then
  echo "  ✓ schema conformance  ($(grep -oE 'TOTAL: [0-9]+/[0-9]+' /tmp/auspex-gate-conf.log))"
else
  echo "  ✗ schema conformance — records do not fit the schema:"
  sed -n '/non-conforming/,$p' /tmp/auspex-gate-conf.log | sed 's/^/    /' | head -40
  fail=1
fi

# 2. atlas consistency — referential integrity + enums (structural ERRORs only gate)
if python3 audit/verify_atlas.py >/tmp/auspex-gate-cons.log 2>&1; then
  echo "  ✓ atlas consistency   (0 structural errors)"
else
  echo "  ✗ atlas consistency — structural errors:"
  sed -n '/── ERROR/,/── WARN/p' /tmp/auspex-gate-cons.log | sed 's/^/    /'
  fail=1
fi

# 3. engine validator (FK + feature enums) — only if pnpm is available
if command -v pnpm >/dev/null 2>&1; then
  if ( cd site && pnpm validate ) >/tmp/auspex-gate-val.log 2>&1; then
    echo "  ✓ engine validator    (pnpm validate clean)"
  else
    echo "  ✗ pnpm validate failed:"
    tail -25 /tmp/auspex-gate-val.log | sed 's/^/    /'
    fail=1
  fi
else
  echo "  • pnpm not found — skipped engine validator (Python checks still gate FK + enums)"
fi

if [ "$fail" -eq 0 ]; then echo "✓ GATE PASSED"; else
  echo "✗ GATE FAILED — fix the above, or run 'make verify' for full output. (override once with: git commit --no-verify)"
fi
exit "$fail"
