# Phase Notes

This folder stores durable notes from `/start-phase` runs.

Each phase note should use a stable slug, for example:

- `p1-f1-calendar-projection.md`
- `p1-f2-canonical-18-parts.md`
- `p1-f3-solo-preview.md`

## Required Format

```markdown
# [ID] [Feature / Slice Name]

**Date:** YYYY-MM-DD
**Status:** Done | In progress | Blocked | Not started
**Roadmap item:** [ID from ROADMAP.md]

## Analyst Handoff

...

## Planner Slice

...

## Implementation Summary

...

## Verification

...

## Follow-Up

...
```

After creating or updating a phase note, update `../ROADMAP.md` with:

- final status,
- link to this note,
- remaining work.
