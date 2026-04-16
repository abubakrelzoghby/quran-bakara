# Schedule reference (domain content)

Authoritative numeric values live in **`api/data.json`**. This page summarizes the **intended reading map** (also described in the archived Arabic user guide).

## People (fixed order)

مريم, يحيى, أحمد — order matches `config.people` and rotation indices.

## Rotation by week (within the 3-week cycle)

| Week | مريم | يحيى | أحمد |
|------|------|------|------|
| 1 | Section 1 | Section 2 | Section 3 |
| 2 | Section 2 | Section 3 | Section 1 |
| 3 | Section 3 | Section 1 | Section 2 |

Week *N* repeats the row for `((N - 1) % 3) + 1` in this table.

## Section 1 — verses 1–123 (reading days 1–6)

| Day in week | Verses | Page (Mushaf) |
|---------------|--------|-----------------|
| 1 | 1–29 | 1 |
| 2 | 30–57 | 6 |
| 3 | 58–74 | 9 |
| 4 | 75–91 | 11 |
| 5 | 92–105 | 14 |
| 6 | 106–123 | 17 |
| 7 | Compensation day (no verse span in data) | — |

## Section 2 — verses 124–218

| Day | Verses | Page |
|-----|--------|------|
| 1 | 124–141 | 19 |
| 2 | 142–157 | 22 |
| 3 | 158–176 | 24 |
| 4 | 177–188 | 27 |
| 5 | 189–203 | 29 |
| 6 | 204–218 | 32 |
| 7 | Compensation | — |

## Section 3 — verses 219–286

| Day | Verses | Page |
|-----|--------|------|
| 1 | 219–232 | 34 |
| 2 | 233–242 | 37 |
| 3 | 243–253 | 39 |
| 4 | 254–263 | 42 |
| 5 | 264–273 | 44 |
| 6 | 274–286 | 46 |
| 7 | Compensation | — |

## Start date

Week 1 begins on **`config.startDate`** in `api/data.json` (currently `2025-12-12`). Changing it shifts all calendar dates in the UI.

## Product ideas (from archived docs, not implemented)

- Standalone page listing all splits without week context.
- Auto roll / Friday reminder for “next week”.
- Configurable people count and dynamic splits.
