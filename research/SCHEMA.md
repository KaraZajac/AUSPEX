# AUSPEX research dossier schema

Every country dossier follows this structure. Lifted directly into the canonical atlas later, so be source-anchored and consistent.

Data model: **nation-state → doctrine → cyber actor → target (sector / org / tech) → strategic goal**.

## File layout per country

```
research/<country>/
  dossier.md          # the synthesis
  doctrines.md        # one section per doctrine
  actors.md           # one section per APT / unit
  events.md           # chronological event list
  sources.md          # primary-source URLs for ongoing tracking
```

## Doctrine entry

```markdown
### <Doctrine name>

- **Issued**: <year> by <body> (e.g. State Council, CCP Central Committee, Kremlin, Supreme Leader's office)
- **Official text**: <URL to primary source if public>
- **Status**: active | superseded | inferred (not formally published)
- **Cyber-relevant pillars**: <bullet list of explicit or implicit cyber-relevant goals — e.g. semiconductor self-sufficiency, NATO supply interdiction, sanctions evasion>
- **Sectors / targets implied**: <e.g. MIC2025 sector list, NATO logistics, SWIFT-adjacent banks>
- **Timeline pressure**: <e.g. 2025 milestone, election cycle, sanction expiry>
- **Summary** (~150 words): plain-English what the doctrine commands and why it shapes cyber tasking
- **Citations**: numbered, primary preferred (official text > government attribution > tier-1 think tank > journalism)
```

## Actor entry

```markdown
### <Group name> (aliases: <list>)

- **Parent service**: <e.g. MSS, PLA SSF Unit 61398, GRU 26165 / Fancy Bear, MOIS, RGB Bureau 121, NSA TAO>
- **Active since**: <year>
- **Status**: active | dormant | sanctioned | indicted
- **Primary mission**: <espionage / sabotage / financial / influence / pre-positioning>
- **Sectors targeted**: <list>
- **Notable TTPs**: <brief>
- **Public attribution**: <DOJ indictment, OFAC sanctions, vendor reports — link primary sources>
- **Doctrine alignment**: <which doctrines this actor's tasking serves and why>
```

## Event entry

```markdown
### <YYYY-MM> <short event name>

- **Attributed actor**: <group> (attribution confidence: high | medium | low; attributing source: <vendor / govt>)
- **Target**: <organization / sector / country>
- **Vector / TTP**: <one-line>
- **Outcome**: <data theft / ransomware / OT disruption / pre-positioning / financial gain — quantify if known>
- **Doctrine linkage**: <which doctrine pillar this event serves; reasoning in 1–2 sentences>
- **Linkage confidence**: attested | strongly inferred | plausible
- **Citations**: numbered
```

## Confidence labels — be strict

- **attested** — the attributing government or vendor explicitly names the strategic goal (e.g. Treasury sanctions cite "support DPRK WMD program")
- **strongly inferred** — target sector + timing + actor mission align with a named doctrine pillar with no major alternative explanation
- **plausible** — fits the doctrine but other explanations exist; flag for analyst review

## Sourcing priority

1. Primary government documents (Treasury OFAC SDN listings, DOJ indictments, CISA advisories, foreign ministry releases, official doctrine texts)
2. National CERTs and intel-agency public attributions
3. Tier-1 vendor research (Mandiant, Microsoft MSTIC, CrowdStrike, Talos, Kaspersky, Volexity, Recorded Future Insikt)
4. Established think tanks (CSIS, RUSI, RAND, IISS, ECFR, ASPI)
5. Tier-1 investigative journalism (Reuters, AP, WSJ, FT, NYT, The Record, Wired)

Avoid: anonymous Telegram channels, single-source blog posts, anything not corroborated.
