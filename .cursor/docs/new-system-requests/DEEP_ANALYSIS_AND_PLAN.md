# Deep analysis & strategic plan (revisable)

**Related brief:** [`PRODUCT_BRIEF.md`](./PRODUCT_BRIEF.md)  
**Status:** This document is **deliberately revisable**. Requirements may shift; sections below call out **assumptions** and **decision points** so we can amend without rewriting the whole codebase narrative.

**Audience:** Product owner + implementers (human or agent).  
**Depth:** Strategic — **design, data, backend, frontend**, milestone-shaped. **Not** a ticket-level backlog.

---

## Pause — what to pick up later (no action required now)

**Already recorded:** requirements and decisions in [`PRODUCT_BRIEF.md`](./PRODUCT_BRIEF.md); strategic plan in this file; **P01–P18** map and two-person parallel **story + math** in [`CANONICAL_18_PARTS.md`](./CANONICAL_18_PARTS.md).

**Still open for a future refinement pass (not blocking the pause):**

- **Duo parallel once/week → daily layout:** how each person’s **nine** small parts map onto **six** reading days (e.g. fixed pattern `2+2+2+1+1+1` vs page-weighted packing); whether both people use the **same** day pattern or independent calendars.
- **Duo parallel twice/week** and **duo sequential:** day-by-day assignment detail under Fri–Wed / Thu catch-up.
- **Implementation kickoff:** only when the stakeholder explicitly asks to start building / phase planning.

---

## 1. Executive summary

The current app is a **single-tenant, three-person, file-backed** schedule viewer with **optional PHP persistence** for completion flags. The target is a **multi-tenant, group-based** planner for **1–3 members**, **fixed Islamic-week framing** (reading **Fri–Wed**, catch-up **Thu**), multiple **reading presets** (solo / pair / trio, parallel vs sequential where relevant), and **lightweight access** via **auto-generated group + per-member codes** distributed by the group creator.

That jump is large enough that **treating the next version as a new product spine** (new persistence model, new API surface, new client flow) is reasonable — while **reusing** the proven **verse/day split** and UX patterns from the current repository as **content and inspiration**, not as a hard constraint on architecture.

---

## 2. Current system — what actually constrains us

**Strengths to preserve conceptually**

- Clear **6 + 1** weekly rhythm in the UI.
- Rich **Arabic RTL** presentation, color semantics for progress, modal detail for parts.
- **Flat completion map** keyed by logical day — simple to merge server/client.

**Structural limits (why “extend in place” gets painful fast)**

- **Single `data.json`** encodes both **canonical surah slices** and **one household’s rotation** (`rotationPattern`, `config.people`, `startDate`).
- **Week index** and **rotation row** are computed from **one global `startDate`** in `get_data.php` — there is no notion of **per-group calendar**.
- **`day` 1–7** in JSON are **ordinal slots within the weekly template**, not **weekday names**. The product brief now **fixes** Fri→Wed reading and Thu catch-up; we need an explicit **calendar projection layer** so “day 3” in the template maps to a **real Gregorian date** per group.
- **Security:** `save_progress.php` is effectively **unauthenticated**; person “passwords” live in **client JS**. The new model wants **server-aware** group + member codes — that implies **new server-side validation**, not a patch on the old endpoints alone.

**Implication:** Even if we keep **PHP** and **no heavy framework**, we should plan for **new tables or structured storage**, **new routes**, and a **small onboarding client** (could still be vanilla JS or could move to a build step — decision in §6).

---

## 3. Target domain model (conceptual)

### 3.1 Entities (logical)

| Concept | Role |
|--------|------|
| **Group** | Tenant boundary: one schedule configuration + one progress space. |
| **Member** | 1–3 people; display name; **secret member code** (hashed server-side). |
| **Group code** | Join / read schedule; **secret** (hashed). |
| **Preset** | Chosen pattern: solo once / solo twice / duo parallel (variants) / duo sequential / trio (legacy-like). |
| **Week anchor** | Defines how **product weeks** map to **Gregorian** dates (v1: week starts **Friday**, catch-up **Thursday** — see brief). |
| **Reading template** | Canonical **18-unit** map (may remain derived from today’s **3 sections × 6 reading days** structure until we formalize explicit 18-node IDs). |
| **Assignment** | For a given `(group, calendar_week, member, reading_day_index)` → which **template slice(s)** to read. |
| **Completion** | For a given `(group, calendar_week, member, reading_day_index)` → done / not done (day 7 / Thu catch-up rules per preset). |

### 3.2 Calendar engine (non-negotiable for correctness)

Build a **single module** (language-agnostic spec first) that outputs, for any **group week index** or **anchor Friday date**:

- The **seven dates** of that product week (Fri … Thu).
- Which index is **catch-up** (always the Thursday slot in v1).
- Which indices allow **toggleable completion** vs display-only.

All presets **consume** this engine so we never re-implement weekday math in three places.

### 3.3 Preset matrix (v1 scope)

**Assumption (revisable):** “Reading day index” `d ∈ {1..6}` maps to **Fri→Wed** in order; `d = 7` is **Thursday catch-up** in the **date row**, but may remain **non-assignable** for reading portions depending on preset.

| Members | Mode (from brief) | High-level assignment shape |
|--------:|-------------------|-----------------------------|
| 1 | Once / week | Spread **18 units** across **6** days; Thu catch-up. |
| 1 | Twice / week | **Two full passes** in **6** days → **one pass per 3 days**; Thu catch-up only. |
| 2 | Parallel (once / week) | **Decided:** **9 + 9** split on the **18 canonical parts** (**P01–P09** vs **P10–P18**); **swap halves each week**. Pair completes **one full surah / week**; **each person** completes a **full personal surah every 2 weeks**. Daily spread across Fri–Wed is a **layout** problem (still to detail). See [`CANONICAL_18_PARTS.md`](./CANONICAL_18_PARTS.md). |
| 2 | Parallel (twice / week) | Two joint “half-surah” bursts in **3-day** windows within Fri–Wed; align with solo cadence philosophy. |
| 2 | Sequential | Person A: full surah Fri–Sun (or first 3 reading indices); Person B: Mon–Wed; Thu catch-up. |
| 3 | Legacy-style | Current **section-per-person** rotation with **3-week cycle** — generalized with **named members** and **group-relative** `startDate`. |

**Remaining detail (not blocking the 9+9 rule):** how the **nine** parts per person distribute across **Fri–Wed** (e.g. strict per-day list vs flexible catch-up on Thu only) — decide during UI/assignment design.

---

## 4. Data layer — options and recommendation direction

### 4.1 Requirements the storage must satisfy

- **Multi-group isolation** (no accidental cross-read of progress).
- **Atomic updates** to completion (two members toggling “done” close together).
- **Recoverability** if we rotate codes or add members.
- **Simple deploy** on typical shared PHP hosting (still a likely constraint).

### 4.2 Options (strategic tradeoffs)

| Approach | Pros | Cons |
|----------|------|------|
| **SQLite** (single file per server) | Real queries, transactions, easy backups, portable | Need PHP PDO + file permissions; some hosts dislike arbitrary DB files |
| **One JSON file per group** | Matches mental model of today | Concurrency, query, and migration pain escalate quickly |
| **MySQL/MariaDB** (managed or local) | Production-grade | More ops; may be overkill for family scale |

**Direction (revisable):** Prefer **SQLite** for v1 **if** hosting allows a writable DB file outside the web root; else **MySQL** on the same host. Avoid **multi-write JSON** as the long-term source of truth.

### 4.3 Secrets handling

- Store **only hashes** (e.g. `password_hash` with bcrypt/argon2id if available in PHP version) of **group code** and **member codes**.
- Optionally store **masked hints** for the creator UI (“••••781”) — never store plaintext after creation.
- **Rotation:** allow creator to **regenerate** group or member codes and **invalidate** old hashes — specify in detailed phase.

---

## 5. Backend / API shape (conceptual)

Split responsibilities into **namespaces** (not final filenames):

1. **Public setup** — create group, pick preset, add members (or count), receive generated codes once (show-and-save flow).
2. **Join / read** — validate **group code** → return **schedule view model** (no member secrets).
3. **Progress read** — with **group code** (or session token issued after validation): fetch completion map for the group/week range.
4. **Progress write** — require **group code** + **member code** (or short-lived session after both validated) to set **that member’s** completion for a key.

**Session vs double-submit:** For ergonomics, after successful **group + member** validation, issue an **HTTP-only cookie** or **opaque session id** with **short TTL** and **binding to member + group** — avoids re-prompting every toggle while keeping **server-side** enforcement.

**Decision point:** Exact **threat model** (public internet vs family VPN) affects rate limiting, CAPTCHA, and TLS enforcement — document in ops, not in this file’s depth.

---

## 6. Frontend / UX architecture (conceptual)

### 6.1 Surfaces

| Surface | Purpose |
|---------|---------|
| **Landing** | “Create group” vs “Join group” (enter group code). |
| **Setup wizard** | Stepwise: headcount → preset → names (optional) → confirm **Fri/Thu** rule → reveal **codes** + copy helpers. |
| **Group dashboard** | Week navigator (only up to **current** product week if we keep today’s rule), aggregate progress, links to **member view**. |
| **Member view** | Same as today’s `person.html` intent: one column, toggles, **prompt for member code** once per device/session. |

### 6.2 Tech stance (revisable)

- **Vanilla + PHP** remains viable if we accept **careful** modular JS (ES modules) and a small bundler **optional**.
- If complexity grows (wizard state, client validation), a **lightweight SPA** (e.g. Vite + small framework) may reduce incidental bugs — **trade cost** of build pipeline vs maintainability. **Milestone 1** can prototype wizard in static HTML to decide.

### 6.3 RTL & content

- Keep **RTL-first** CSS; reuse palette semantics from `styles.css` where possible.
- **Separate “content JSON”** (verse spans) from **“tenant JSON”** in authoring to reduce merge pain.

---

## 7. Schedule generation — implementation strategy

**Do not** embed preset logic in SQL or ad hoc in PHP endpoints. Instead:

1. **Authoritative reading graph:** export current surah splits into a **versioned static artifact** (JSON or PHP array) with stable **part IDs** (e.g. `S1-D3` or explicit 18 IDs once modeled).
2. **Pure function `assign(preset, memberCount, weekIndex, ...)`** returns assignments for rendering.
3. **Unit-testable** in isolation (PHP PHPUnit or Node test runner on shared JSON) — critical because **two-person parallel** is easy to get subtly wrong.

**Gap vs brief’s “18 parts”:** Today’s file is **3 sections × (6 reading days + 1 catch-up slot)**. The brief mentions **18 atomic units** in a hierarchy. **Milestone:** produce a **single mapping table** from current `sections[].parts[day]` to **18 IDs** (or justify staying section-based for v1 UI). This is **foundational** before polishing duo presets.

---

## 8. Security & privacy (proportionate to product)

- Codes are **shared secrets** — treat as **session bootstrap**, not banking auth.
- Enforce **HTTPS** in production; never echo secrets in URLs (POST body or headers only).
- **Rate limit** code attempts per IP + per group id.
- **Audit log** (optional v2): who toggled what — probably out of v1.

---

## 9. Milestones (medium detail — not full task lists)

### Milestone A — **Foundation & canon**

- Freeze **calendar module** spec (Fri week start, Thu catch-up, date projection).
- Extract **static surah template** from current `data.json` into **group-agnostic** content.
- Decide storage (**SQLite vs MySQL**) for pilot host.

**Exit:** A CLI or tiny PHP script prints assignments for **one** preset for N weeks — no UI.

---

### Milestone B — **Group lifecycle & auth**

- Schema: `groups`, `members`, `hashed_codes`, `preset`, `anchor_start` (or `first_friday`), `created_at`.
- Endpoints: create group, join (validate group code), member unlock, issue session.
- Creator page: show codes **once** with **copy** buttons + warning.

**Exit:** Curl/Postman can create a group and fetch schedule JSON for **solo once** with fake assignments stubbed.

---

### Milestone C — **Preset engine v1**

- Implement **solo once**, **solo twice**, **trio (legacy rotation)** against real template.
- **Two-person sequential** (clear rules).
- **Two-person parallel** (both variants) — may slip to **Milestone C2** if matrix needs extra stakeholder input.

**Exit:** Deterministic assignment snapshots checked into `tests/fixtures/` for regression.

---

### Milestone D — **Client: join + dashboard + member**

- Implement flows per §6; reuse styling language from legacy pages.
- Progress toggles hit **authenticated** write API.

**Exit:** Manual test script in `OPERATIONS.md` style passes for 1/2/3 members on local PHP server.

---

### Milestone E — **Hardening & deploy path**

- TLS notes, file permissions, backup of DB file, rate limits.
- Remove or gate **`save_progress.php` Old World`** if replaced — avoid dual-write confusion.

**Exit:** Staging deploy checklist satisfied.

---

## 10. Risks, unknowns, and explicit “we may change this”

| Item | Risk / note |
|------|-------------|
| **Duo parallel “once/week”** | Ambiguity in daily vs weekly completion semantics — **clarify in a short follow-up** before locking UI. |
| **18-part formalization** | May require **data model change** vs current section/day grid — schedule **before** heavy UI. |
| **“No future weeks” rule** | Current app clamps navigation; confirm same for **all presets** in multi-tenant mode. |
| **Hosting** | SQLite availability may force **MySQL** — plan is **host-driven**, not ideological. |
| **Language** | UI Arabic first; admin/errors can stay Arabic with **optional** English later. |

---

## 11. “New system vs same repo” stance

**Same repository** is fine as a **monorepo**: e.g. `legacy/` or keep current root as static archive and add `public/` + `src/` for new API — **or** branch-by-era. **Greenfield data** (per brief) means we **do not** need backward-compatible reads of old `progress.json` keys.

**Recommendation:** **New API + new storage + new pages** alongside legacy until cutover; then delete dead PHP to reduce attack surface.

---

## 12. Changelog

| Date | Author | Notes |
|------|--------|--------|
| 2026-04-18 | Agent | Initial deep analysis & milestone plan; marked revisable; aligned to `PRODUCT_BRIEF.md`. |
| 2026-04-18 | Agent | Duo parallel once/week: replaced open question with **9+9 swap** rule; added pointer to `CANONICAL_18_PARTS.md`. |
| 2026-04-18 | Agent | Added **Pause — resume pointers** (daily 9→6 layout still TBD; other presets TBD). |
