# New system roadmap

**Status:** Implementation has started. See the tracking table for per-slice status.

**Sources:** [`PRODUCT_BRIEF.md`](./PRODUCT_BRIEF.md), [`DEEP_ANALYSIS_AND_PLAN.md`](./DEEP_ANALYSIS_AND_PLAN.md), [`CANONICAL_18_PARTS.md`](./CANONICAL_18_PARTS.md), and the current app overview docs.

---

## Implementation tracking

Phase notes are saved in [`phases/`](./phases/). After each `/start-phase` run, update this table with the final status and a link to the phase note.

| ID | Feature / slice | Status | Phase note | Remaining work |
|----|-----------------|--------|------------|----------------|
| P1-F1 | Calendar projection spec/module for Friday through Thursday weeks | Done | [`p1-f1-calendar-projection.md`](./phases/p1-f1-calendar-projection.md) | None; next follow-up is P1-F2 canonical reading template. |
| P1-F2 | Static canonical `P01` through `P18` reading template | Not started | - | Map current `api/data.json` parts to stable part IDs. |
| P1-F3 | Tiny PHP assignment preview for solo once/week | Not started | - | Print deterministic assignments for multiple weeks. |
| P1-F4 | Pilot storage decision: SQLite vs MySQL/MariaDB | Not started | - | Confirm shared-hosting support. |
| P2-F1 | Pure assignment function for presets | Not started | - | Depends on P1 template/calendar. |
| P2-F2 | Solo once/week preset | Not started | - | Depends on assignment function. |
| P2-F3 | Solo twice/week preset | Not started | - | Depends on assignment function. |
| P2-F4 | Three-person legacy-style preset | Not started | - | Depends on assignment function. |
| P2-F5 | Two-person preset rules | Blocked | - | Needs owner decisions for daily layouts. |
| P3-F1 | Group creation and code generation API | Not started | - | Depends on storage decision. |
| P3-F2 | Join/read validation and member unlock | Not started | - | Depends on group schema. |
| P4-F1 | Group-first client flows | Not started | - | Depends on group API and schedule engine. |
| P5-F1 | Hardening and deploy checklist | Not started | - | Depends on final storage/session choices. |

Status values: `Not started`, `In progress`, `Done`, `Blocked`.

---

## Confirmed requirements

- Build a dynamic group-based planner for **1, 2, or 3 participants**.
- Keep **two-person setup** as a first-class visible option, not an advanced or hidden flow.
- Preserve the weekly product frame: **Friday through Wednesday** are reading days; **Thursday** is catch-up only.
- Use the canonical **18-part reading backbone** (`P01` through `P18`) derived from the current 3 sections x 6 reading-day structure.
- Support solo once/week, solo twice/week, two-person parallel, two-person sequential, and three-person legacy-style presets in v1 scope.
- Use lightweight access: a **group code** to join/read the schedule, plus a **per-member code** before marking that member's progress.
- Generate group and member codes automatically at group creation or member setup.
- Let the group creator distribute codes out of band.
- Treat the next product version as greenfield data. No migration is required from current `progress.json`, localStorage keys, or the fixed household setup.
- Keep shared hosting as a hard constraint: plain PHP, HTML, CSS, JS, and host-supported storage.

## Assumptions

- The current Arabic RTL visual language, progress colors, modal detail pattern, and simple weekly navigation remain good UX references.
- The new system can live alongside the legacy app until cutover.
- Storage should be SQLite if the target host supports a writable DB file outside the web root; otherwise use MySQL/MariaDB.
- Server sessions or short-lived opaque tokens are acceptable after successful group/member code validation, so users do not re-enter codes on every toggle.
- The current "no future weeks" navigation rule likely remains, but still needs owner confirmation for all new presets.

---

## Product phases

### Phase 1: Foundation and canon

**Goal:** Prove the new schedule model without touching the user-facing app.

Features:

- Freeze the calendar spec: Friday week start, six reading days, Thursday catch-up.
- Define a single calendar projection module/spec for product week index to real dates.
- Extract or reference the canonical `P01` through `P18` reading template as group-agnostic content.
- Decide pilot storage: SQLite or MySQL/MariaDB.
- Create a minimal assignment preview path for one preset, without building the final UI.

Exit criteria:

- A tiny PHP script or endpoint can print deterministic assignments for one preset across multiple weeks.
- The output uses real canonical part IDs and the Friday through Thursday calendar shape.

### Phase 2: Schedule engine v1

**Goal:** Centralize preset logic before building group flows around it.

Features:

- Implement a pure assignment function that accepts preset, member count, member order, week index, and calendar anchor.
- Add solo once/week.
- Add solo twice/week: full surah once every three reading days, twice across Friday through Wednesday.
- Add three-person legacy-style rotation using thirds (`P01-P06`, `P07-P12`, `P13-P18`).
- Add deterministic assignment snapshots for regression checks.
- Add two-person sequential and two-person parallel after the remaining day-by-day rules are decided.

Exit criteria:

- Every implemented preset produces repeatable schedule data from the same inputs.
- The engine does not depend on UI state or database queries.

### Phase 3: Group lifecycle and access

**Goal:** Make schedules group-specific and move write protection to the server.

Features:

- Add group creation with participant count, preset selection, member names, and week anchor.
- Generate group and member codes.
- Store only hashed codes.
- Add join/read validation using group code.
- Add member unlock for progress writes.
- Issue an HTTP-only cookie or opaque short-lived session after successful validation.
- Add basic rate limiting for code attempts.

Exit criteria:

- A group can be created, joined, and read through API calls.
- Progress writes require server-side member authorization.

### Phase 4: Client flows

**Goal:** Replace fixed-household assumptions with simple group-first UX.

Features:

- Landing page: create group or join group.
- Setup wizard: headcount, preset, member names, confirmation of Friday/Thursday rhythm, generated code reveal.
- Group dashboard: shared weekly schedule, aggregate progress, and links to member views.
- Member view: single-member reading list, completion toggles, member-code unlock.
- RTL-first responsive styling using the current app as a design reference.

Exit criteria:

- Manual local testing passes for solo, duo, and trio groups.
- Completion state is group-scoped and member-scoped.

### Phase 5: Hardening and deploy path

**Goal:** Make the new system safe enough for staging and production upload.

Features:

- Document HTTPS expectations.
- Document database backup and restore.
- Document file permissions for shared hosting.
- Confirm rate limiting behavior on the target host.
- Gate or remove old unauthenticated progress write paths when the new flow replaces them.
- Add staging validation notes aligned with the existing `dev -> staging -> main` workflow.

Exit criteria:

- Staging deploy checklist passes.
- Production deployment has clear backup, rollback, and endpoint exposure notes.

---

## Dependencies

- Client flows depend on the schedule engine and group API shape.
- Progress writes depend on server-side group/member validation.
- Two-person preset implementation depends on owner decisions for daily layouts.
- Storage schema depends on the target host's SQLite or MySQL/MariaDB support.
- Deployment hardening depends on final storage and session choices.
- Legacy endpoint removal depends on the new progress flow being complete and verified.

---

## Open owner decisions

- For two-person parallel once/week, how should each person's nine parts map onto six reading days: fixed `2+2+2+1+1+1`, page-weighted packing, or another rule?
- Should both people in two-person parallel use the same daily pattern, or can their day layouts differ?
- For two-person parallel twice/week, what exact day-by-day assignment should be used across the two three-day segments?
- For two-person sequential, should person A always read first and person B second, or should the order swap weekly?
- Should the current "no future weeks" navigation rule apply to every new preset?
- Which storage option does the pilot host support best: SQLite or MySQL/MariaDB?
- Should session state use HTTP-only cookies, opaque tokens, or code re-entry per sensitive action?

---

## Shared-hosting risks

- SQLite may be unavailable or hard to secure on some hosts, which could force MySQL/MariaDB.
- Writable files or DB files must not be exposed under the public web root.
- Concurrent progress toggles are risky with JSON storage; avoid multi-group progress in shared JSON files.
- Code validation needs rate limiting, but shared hosting may limit reliable IP/session controls.
- HTTPS is required in production so group and member codes are not exposed in transit.
- The legacy `save_progress.php` endpoint is unauthenticated; keeping it live beside the new system could create confusion or risk.

---

## First safe implementation slice

When implementation starts, begin with:

1. A calendar projection spec/module for Friday through Thursday weeks.
2. A static canonical `P01` through `P18` reading template derived from current data.
3. A tiny PHP preview script or endpoint that prints assignments for **solo once/week** across a few weeks.

This slice avoids storage, auth, and UI rewrite risk while proving the new schedule backbone.

---

## Do not build yet

- Arbitrary participant counts beyond 1, 2, and 3.
- Email/password accounts or a heavy authentication product.
- Audit logs.
- Migration from current `progress.json` or browser localStorage.
- Frameworks, bundlers, TypeScript, Composer dependencies, or Node build steps.
- Final UI rewrites before the schedule engine and access model are settled.
- Two-person preset variants whose day-by-day rules are still undecided.
