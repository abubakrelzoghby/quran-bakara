# Canonical 18 reading units — extraction from current schedule data

**Purpose:** Stable backbone for assigning work across members in one group. Aligns stakeholder hierarchy (**3 majors × 3 subs × 2 small = 18**) with the existing six reading slices per **major section** in `api/data.json` (days **1–6** per section; day **7** is catch-up only and **not** one of the 18).

**Source of truth for verse spans:** `api/data.json` (and cross-check [../overview/SCHEDULE_REFERENCE.md](../overview/SCHEDULE_REFERENCE.md)).

---

## Hierarchy (how to read the table)

- **Major 1–3** = the three top-level `sections[]` blocks in `data.json` (قسم 1 / 2 / 3).
- **Sub 1–3 (within each major)** = three pairs of consecutive **reading-day** rows (`day` **1–2**, **3–4**, **5–6**).
- **Small A / Small B** = each single reading-day row inside that pair (one day’s assignment in the current model).

Thus each **small part** = **one** of the eighteen assignable slices.

---

## The 18 parts (reading order through the surah)

| Part ID | Major | Sub (within major) | Small (within sub) | Section `day` | Verse span (from `data.json`) |
|--------:|-------|--------------------|--------------------|---------------|-------------------------------|
| P01 | 1 | 1 | A | 1 | 1–29 |
| P02 | 1 | 1 | B | 2 | 30–57 |
| P03 | 1 | 2 | A | 3 | 58–74 |
| P04 | 1 | 2 | B | 4 | 75–91 |
| P05 | 1 | 3 | A | 5 | 92–105 |
| P06 | 1 | 3 | B | 6 | 106–123 |
| P07 | 2 | 1 | A | 1 | 124–141 |
| P08 | 2 | 1 | B | 2 | 142–157 |
| P09 | 2 | 2 | A | 3 | 158–176 |
| P10 | 2 | 2 | B | 4 | 177–188 |
| P11 | 2 | 3 | A | 5 | 189–203 |
| P12 | 2 | 3 | B | 6 | 204–218 |
| P13 | 3 | 1 | A | 1 | 219–232 |
| P14 | 3 | 1 | B | 2 | 233–242 |
| P15 | 3 | 2 | A | 3 | 243–253 |
| P16 | 3 | 2 | B | 4 | 254–263 |
| P17 | 3 | 3 | A | 5 | 264–273 |
| P18 | 3 | 3 | B | 6 | 274–286 |

**Not counted in 18:** any `day: 7` row labeled catch-up / استدراك (no verse span in data).

---

## Two useful groupings for presets

- **Halves (9 + 9) for two-person parallel “once per week”:** **H1 = P01–P09**, **H2 = P10–P18** (swap halves each week — see product brief update).
- **Thirds (6 + 6 + 6) for three-person rotation:** **T1 = P01–P06** (major 1), **T2 = P07–P12** (major 2), **T3 = P13–P18** (major 3) — matches current “one major section per person per week” shape.

---

## Two-person parallel once/week — “major / sub” story (**equivalent** to H1 vs H2)

Stakeholder description (same assignment as **P01–P09** vs **P10–P18**, but easier to explain in UI):

| Stakeholder rule | Maps to part IDs |
|------------------|------------------|
| **Entire major 1** → person A | **P01–P06** |
| **Entire major 3** → person B | **P13–P18** |
| **Major 2 — sub 1** (first two reading days of major 2) → person A | **P07–P08** |
| **Major 2 — sub 3** (last two reading days of major 2) → person B | **P11–P12** |
| **Major 2 — sub 2** (middle pair) **split:** one small part → A, one → B | **P09 → A**, **P10 → B** |

**Counts:** person A = 6 + 2 + 1 = **9**; person B = 1 + 2 + 6 = **9**. Together = **all 18** in one week.

**Weekly swap:** exchange which human holds the **H1** bundle vs the **H2** bundle (same as swapping **P01–P09** vs **P10–P18**).

---

## Changelog

| Date | Notes |
|------|--------|
| 2026-04-18 | Initial extraction; maps 3×3×2 to current `sections[].parts[day 1–6]`. |
| 2026-04-18 | Added stakeholder “major/sub” narrative for duo parallel once/week; proved **equivalent** to **P01–P09** / **P10–P18**. |
