---
name: quran-verse-formatting
description: Format and verify Quran verse ranges, first-verse labels, Uthmani snippets, and Arabic schedule copy. Use when editing api/data.json, Surah/Ayah metadata, Quran snippets, or reading schedule text.
paths:
  - "api/data.json"
  - ".cursor/docs/**/*.md"
---

# Quran Verse Formatting

## Instructions

1. Read the relevant schedule reference before editing Quran data; use `.cursor/docs/new-system-requests/CANONICAL_18_PARTS.md` for future 18-part work.
2. Preserve approved Arabic text exactly. Do not invent Uthmani script, page numbers, or verse labels.
3. Keep numeric ranges in `verseStart` and `verseEnd`; keep human display copy in `firstVerse` or `verseRange`.
4. Preserve day 7 as catch-up unless the user explicitly changes the reading model.
5. After edits, verify section ranges, part counts, and rotation compatibility.

## Required Checks

- `sections[].parts.length` matches `config.daysPerWeek`.
- Days 1 through `config.readingDays` have numeric verse and page metadata.
- `config.compensationDay` entries use `null` for verse/page fields.
- Arabic copy remains RTL-friendly and readable.
