# Cursor agent documentation — `quran-bakara`

This folder exists so **any agent working in Cursor** can quickly understand the **real** behavior of the repository.

## Read next (in order)

1. **[SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)** — Product intent, architecture, schedule math, state model, APIs, and safety notes (includes **legacy docs vs code**).
2. **[SCHEDULE_REFERENCE.md](./SCHEDULE_REFERENCE.md)** — Verse/page tables and rotation summary (merged from the old Arabic user guide; cross-check `api/data.json`).
3. **[OPERATIONS.md](./OPERATIONS.md)** — How to run locally, deployment-related scripts, fetch helper.
4. **[GIT_BRANCHING.md](./GIT_BRANCHING.md)** — Recommended branching strategy for solo and team workflows.

## Archived Arabic originals

Human-readable Arabic copies (and their limitations) live under **[`../old-docs/`](../old-docs/)** — start with [`../old-docs/ARCHIVE_NOTE.md`](../old-docs/ARCHIVE_NOTE.md).

## Scope

- **In scope:** Static HTML/CSS/JS front end, small PHP JSON APIs, `api/data.json` schedule source, optional `progress.json` at repo root (gitignored).
- **Do not assume exists:** `config.php`, `progress.local.json`, `progress.server.json` — those names appear in archived Arabic notes as a **planned** split; the **running** code uses a single `progress.json` path (see system overview).

## Language rule

All content under `.cursor/` is **English only**, per project convention for agent-facing material.
