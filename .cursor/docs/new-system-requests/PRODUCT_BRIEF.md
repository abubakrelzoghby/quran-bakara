# New system requests — product brief (captured requirements)

**Status:** Living document for **requirements capture**. A **revisable** strategic analysis and milestone plan lives in **[`DEEP_ANALYSIS_AND_PLAN.md`](./DEEP_ANALYSIS_AND_PLAN.md)** (subject to change as decisions evolve).

**Language:** English (project convention for agent-facing documentation).

---

## Problem with the current system

The running app is **largely static**: it is built around **three fixed people** (names, rotation, and UI assumptions). It works well for that household shape but does not generalize.

---

## North star

Make the system **dynamic** so that **anyone** can use it: create a **personal or shared schedule** with **very simple choices** and **minimal friction** — no “heavy” authentication experience. The core planning unit remains the **calendar week**.

---

## Content model (reading map)

The stakeholder describes the surah as already split into **18 small reading units**, organized as:

- **3 major sections**
- Each major section → **3 sub-sections**
- Each sub-section → **2 small parts**

So the **canonical split is fixed** (same logical parts as today’s data); what changes is **how those parts are assigned across people and days** depending on headcount and reading pattern.

**Authoritative enumeration:** See **[`CANONICAL_18_PARTS.md`](./CANONICAL_18_PARTS.md)** — eighteen small units **P01–P18** (3 majors × 3 subs × 2 small), aligned to `api/data.json` reading days **1–6** per section.

---

## Modes by number of participants

### One person

- **Read Al-Baqarah once per week:** distribute the **existing 18-part structure** across the **six reading days** (**Friday → Wednesday**); **Thursday** is catch-up only (see calendar conventions).
- **Read it twice per week (decided):** still **only** the **six reading days** carry assigned reading. The reader completes the **full surah once every three days** within that block (i.e. **one full pass per 3-day segment**, **two passes** across the six days — same 18-part map, first half then second half). **Thursday** remains **catch-up only**, never a scheduled reading day.

**Invariant:** There is **always** a dedicated **catch-up day** (**Thursday**); assigned reading never moves onto Thursday for v1.

### Calendar conventions (decided)

- **Week start:** The product week **always** begins on **Friday**.
- **Catch-up day:** **Thursday** is **always** the compensation / catch-up day (“يوم الاستدراك”).
- **Reading block:** Six reading slots align with **Friday → Wednesday**; **Thursday** is non-reading catch-up (same 6+1 shape as today’s model, but weekdays are **fixed** — not user-selectable for v1).


### Two people (same group schedule)

The pair chooses **parallel** vs **sequential** reading.

**Parallel (examples given):**

- **Once together per week (decided — “9 + 9”):** Split the **18 canonical parts** into two complementary bundles (**P01–P09** vs **P10–P18** — see `CANONICAL_18_PARTS.md`). **Product story (same math):** person A takes **all of major 1**, person B takes **all of major 3**; **major 2** is shared — **sub 1** to A, **sub 3** to B, **sub 2** split **one small part each** (P09 vs P10). **Within one product week**, the pair **together** covers **all 18 parts**. **Swap bundles weekly** so each person alternates halves. **Outcome:** pair **1× surah / week**; each person **1× surah / 2 weeks**.
- **Twice together per week:** they read together **twice** in the week; one option described is **shared** reading where **half the surah each** is completed **within three days** (fits the **six reading days** model; **Thursday** remains catch-up only — align with solo “every three days” cadence when designing presets).

**Sequential:**

- **First three days:** the **entire surah** assignment for **person A** (using the existing part progression).
- **Next three days:** the **entire surah** assignment for **person B**.
- Catch-up is **Thursday** (see calendar conventions); detailed assignment rules remain **TBD** for implementation.

### Three people

Can match the **current** behavior: three readers, three major sections, weekly rotation pattern — as a **preset** within the generalized system.

---

## Release scope (decided)

- **v1 headcount:** Support **1, 2, and 3** participants first.
- **Product UX requirement:** **“Two people” must be a first-class, visible choice** in setup (same prominence as solo and three-person flows — not hidden, not “advanced”, not implied only by backend support).
- **Stakeholder priority:** **Two-person** presets and flows are **especially important** relative to solo/three.
- **Broader “any N” people:** Remains **out of scope for v1** / future iteration unless the brief is updated.

---

## Data migration (decided)

- **No migration required** from the current static household `data.json` / `progress.json` setup.
- The next product version may be **greenfield** (new groups, new storage); carrying over legacy per-device keys is **not** a requirement.

---

## Unknown / exploratory (stakeholder question)

The stakeholder asks whether it is **feasible** to offer **additional presets** beyond the examples above, given the **18-part** structure.

They also ask: for **good** scheduling (everyone finishing cleanly, optionally multiple joint passes per week, optionally each person finishing every week vs every *N* weeks), **what participant counts** are practical?

**This is explicitly deferred:** no sizing or feasibility answer in this document yet.

---

## Access, identity, and simplicity

- Prefer **group-first** entry: **sign up / enter as a group**, and all members see **one shared progress view** for that group’s schedule.
- **Join / view gate (decided):** Use **two layers** — a **group code** (join the group / see the schedule) **plus** a **per-person code** before someone can mark **their own** reading progress (“a bit more protection” than group-only).
- **Code lifecycle (decided):** **Group code** and **each member’s personal code** may be **generated automatically** by the system at group creation / when members are added.
- **Distribution (decided):** The **person who created the group** is responsible for **sharing** the relevant codes with members (out-of-band: chat, paper, etc.) — the product does not need a heavy account system to achieve this.
- Access control should stay **simple in UX**: codes should be **not trivially guessable**, but also **not unrealistic** for a small group.
- Avoid a **large/complex login** product. Speed and simplicity remain priorities (codes ≠ full auth product).

---

## Explicit non-goals for this document

- No deep architecture, schema, API design, or milestone plan here.
- No commitment to “new system vs evolve current codebase” — that decision comes later.

---

## Changelog

| Date | Source | Notes |
|------|--------|--------|
| 2026-04-18 | User message | Initial capture: dynamic groups, weekly unit, 1/2/3 reader patterns, group code access, defer deep analysis. |
| 2026-04-18 | User message | Decided: week starts **Friday**, **Thursday** = catch-up; v1 scope **1–3** people (**2-person** priority); **no legacy data migration**, greenfield OK. |
| 2026-04-18 | User message | Confirmed: **two-person** must be an explicit, equal setup **option** in the product; rewrote open decisions in plain language (solo double-pass calendar rule; progress-edit gate). |
| 2026-04-18 | User message | Decided solo double-pass: **6 reading days**; **full surah every 3 days**; **Thursday always catch-up** (no assigned reading on Thursday). |
| 2026-04-18 | User message | Decided access: **group code + per-person code**; codes may be **auto-generated**; **group creator distributes** codes to members (out-of-band). |
| 2026-04-18 | User message | Clarified **18-part backbone** (3×3×2) and **two-person parallel once/week**: **9+9 complementary halves per week**, **swap weekly** → pair **1× surah / week**, each person **1× surah / 2 weeks**. Documented in `CANONICAL_18_PARTS.md`. |
| 2026-04-18 | User message | Same preset, **major/sub narrative**: major1→A, major3→B; major2 sub1→A, sub3→B, sub2 split; equivalent to **P01–P09** / **P10–P18**. |
