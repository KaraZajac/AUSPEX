# AUSPEX — verification gate + helpers. See audit/README.md and docs/SCHEMA.md.

.PHONY: verify install-hooks audit conformance schema findings help

help:                ## list targets
	@grep -hE '^[a-z-]+:.*##' $(MAKEFILE_LIST) | sed 's/:.*## /\t/' | sort

verify:              ## run the full verification gate (schema conformance + consistency + engine validator)
	@sh audit/gate.sh

install-hooks:       ## enable the git pre-commit gate for this clone
	@chmod +x .githooks/pre-commit audit/gate.sh
	@git config core.hooksPath .githooks
	@echo "✓ pre-commit gate installed (core.hooksPath=.githooks). Bypass once with: git commit --no-verify"

conformance:         ## schema conformance only — does every record fit the JSON Schema?
	@python3 audit/check_conformance.py

audit:               ## full consistency report (referential / source hygiene / tagging review lists)
	@python3 audit/verify_atlas.py

schema:              ## re-derive the empirical schema profile (keeps docs/SCHEMA.md honest)
	@python3 audit/introspect_schema.py

findings:            ## regenerate the analysis ledger numbers (each script prints a corpus fingerprint)
	@for s in doctrine_to_operations mo_narrowing doctrine_trends deterrence actor_deterrence; do \
		python3 analysis/$$s.py; echo; \
	done
