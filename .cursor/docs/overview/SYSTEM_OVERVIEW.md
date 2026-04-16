# System overview — Quran Baqarah reading schedule

## Purpose

This is a **small family web app** (Arabic UI, RTL) for a **3-person rotation** to read **Surah Al-Baqarah** over **3 major sections**, across **weeks**. Each calendar week has **7 rows**: **6 reading days** plus **1 compensation / catch-up day** (“يوم الاستدراك”). The app shows **who reads which slice of which section** on each day, highlights progress with colors, and optionally **persists completion** to a JSON file on the server via PHP.

There is **no build step** — vanilla JS, one shared stylesheet, PHP endpoints under `api/`.

---

## Repository layout (what matters)

| Path | Role |
|------|------|
| `index.html` | Full household schedule for one selected week (navigable past ↔ current). |
| `person.html` | Single-person view; completion toggles + password gate. |
| `assets/css/styles.css` | All styling (responsive, person colors, progress bars, modals). |
| `assets/js/script.js` | **Core:** data load, schedule generation, progress (local + remote), shared helpers. Loaded by both pages. |
| `assets/js/person.js` | **Person page only:** person picker, week nav, completion button wiring, verification prompts. |
| `api/data.json` | **Canonical schedule:** config, `sections` (3), each with `parts` for days 1–7. |
| `api/get_data.php` | Returns merged JSON: config + sections + rotation + **server-calculated `currentWeek`** and `currentWeekRotation`. |
| `api/get_progress.php` | Reads **`../progress.json`** (repo root), returns flat JSON object of completion keys. |
| `api/save_progress.php` | POST JSON `{ key, completed }` → read/write **`../progress.json`**. |
| `api/fetch_server_data.php` | **Dev/ops helper:** cURL production `get_progress.php`, writes **`../progress.json`**. HTML output, Arabic UI. |
| `progress.json` | **Runtime file** at repo root; **listed in `.gitignore`** (not committed). Created on first save or by fetch script. |

---

## Domain model

### People

Fixed in `api/data.json` → `config.people`: **مريم**, **يحيى**, **أحمد** (order matters for rotation indexing).

### Sections

Three logical blocks of the surah (`sections[]`), each with:

- `id` (1-based), `name`, `verseRange` (human-readable string).
- `parts[]`: one entry per **day 1..7** inside the week **for that section**.
  - Days **1–6**: real reading ranges (`verseStart`, `verseEnd`, `page`, `firstVerse`).
  - Day **7**: placeholders (`verseStart`/`verseEnd`/`page` often `null`); UI treats as **compensation day** — no “completed” toggle on person page.

### Rotation

`rotationPattern` is an array of **3 rows** (weeks 1–3 modulo), each row length = number of people:

```text
Week N uses row index: (N - 1) % 3
Row value at personIndex = sectionIndex (0-based into sections[])
```

Example from data: week 1 → `[0,1,2]` (person 0 → section 1, person 1 → section 2, person 2 → section 3). Week 2 shifts, week 3 shifts again, week 4 repeats week 1’s mapping.

**Client and server both** derive the same rotation index from the week number; `get_data.php` also returns `currentWeekRotation` for the **current** calendar week.

### Week numbering and dates

- **`config.startDate`** (ISO date string): start of **week 1** (first day of that week in the model).
- **`currentWeek`**: computed as `floor(daysBetween(startDate, today) / 7) + 1` in PHP (`get_data.php`). JS mirrors a similar fallback if API fails.
- **`getWeekDates(weekNumber)`** in JS: takes `startDate`, adds `(weekNumber - 1) * 7` days, then builds **7 consecutive dates** — these drive “today / past / future” styling.

### Navigation rules (both pages)

- User can view **week 1 … currentWeek** only — **no future weeks** (buttons hidden / clamped).
- **Refresh** always resets the “displayed week” to **current** week (not persisted in `localStorage`).

---

## Front-end behavior

### `script.js` responsibilities

1. **`loadData()`** — `GET api/get_data.php` → fills global `DATA`, sets `CURRENT_WEEK` from API when present. On failure, uses a **minimal fallback** (empty `sections` — UI degrades).
2. **`loadRemoteProgress()`** — `GET api/get_progress.php` → `REMOTE_PROGRESS` object (or `null` if unavailable, e.g. `file://`).
3. **Schedule generation** — `generateSchedule(displayedWeek)` builds rows: for each day, each person gets **one section** and **one part** from that section for that day number.
4. **Progress resolution** — `isDayCompleted(person, week, day)`:
   - If `REMOTE_PROGRESS` has the key → use server truth.
   - Else → `localStorage` under `baqaraReadingStatus`.
5. **Styling** — `getDayCssClass`: completed → green; else today / past incomplete / future; day 7 special (green if days 1–6 all complete, else warning yellow).
6. **Main page** — Renders one big table, modal for part details, week nav, aggregate progress bar across all three people (reading days 1–6 only for counts).

### `person.js` responsibilities

1. **`selectedPerson`** from `localStorage` key `selectedPerson` (validated against known names).
2. Renders **one column** schedule for that person’s section for the displayed week.
3. **Completion toggle** — delegated click on `.complete-btn`: calls `ensurePersonVerified` → `setDayCompleted` + `saveDayCompletedRemote`.
4. **`ensurePersonVerified`** — if not yet verified on device, `prompt()` for a **6-digit password**; on success sets `verified: true` in `localStorage` structure.

### Passwords (important for security posture)

Defined in **`script.js`** as `PERSON_PASSWORDS` (plain object, **hard-coded**). This is **obfuscation for family use**, not strong auth. Anyone with the repo sees the numbers. Changing passwords requires editing JS and redeploying.

---

## `localStorage` schema (`baqaraReadingStatus`)

JSON shape:

```json
{
  "persons": {
    "مريم": {
      "verified": true,
      "completedDays": {
        "مريم__week3-day2": true
      }
    }
  }
}
```

Keys for days: `` `${personName}__week${weekNumber}-day${dayNumber}` `` — must stay in sync with PHP progress file keys.

---

## PHP API contract

### `GET api/get_data.php`

Response includes at least:

- `config`, `sections`, `rotationPattern`
- `currentWeek`, `currentWeekRotation`

### `GET api/get_progress.php`

Returns a **flat** JSON object: keys are day keys, values are `true` (or key omitted when false). Empty file → `{}`.

### `POST api/save_progress.php`

Body: `{ "key": "مريم__week1-day1", "completed": true|false }`

- Validates JSON body and non-empty `key`.
- Merges into `../progress.json` and returns `{ ok, key, completed, all }` where `all` is the full map (client refreshes `REMOTE_PROGRESS` from this when possible).

---

## Why PHP is required for a correct run

The browser loads schedule and progress via **`fetch()`** to same-origin PHP URLs. Opening `index.html` as **`file://`** typically **breaks** those requests. Use a local PHP built-in server from the project root (see `OPERATIONS.md`).

---

## Agent checklist when modifying behavior

1. **Schedule or rotation** — Edit `api/data.json`; ensure `rotationPattern` length matches people count; keep `parts` aligned with `daysPerWeek` / `readingDays` in config.
2. **Week logic** — Any change to `startDate` or week index must stay consistent between **`get_data.php`** and **`script.js`** fallback.
3. **Progress key format** — Changing `getDayKey` requires migrating **`progress.json`** and any stored `localStorage` keys (or accept orphaned keys).
4. **Person list** — Hard-coded in HTML buttons, `person.js` validation, CSS class maps, and `data.json`; keep all in sync.
5. **Git** — Do not commit real `progress.json` if it contains family data; it is gitignored by design.

---

## Legacy Arabic docs vs this repository (read this once)

Older Arabic markdown (now under **`.cursor/docs/old-docs/`**) sometimes describes a **different file layout** than what PHP does today.

**Plain explanation:** Those documents were written as if the project had extra pieces — for example a `config.php` that switches “local” vs “production”, or separate files like `progress.local.json` / `progress.server.json`. In the **current codebase**, those files **do not exist**. Progress is stored in **one place**: **`progress.json` next to `api/`** (repo root), read and written by `get_progress.php` and `save_progress.php`. The fetch helper also writes that same `progress.json`.

So the warning means: **do not trust the Arabic file names as documentation of behavior** until you open `api/*.php` and confirm. The archived text is still useful for **Arabic UX copy**, **verse tables**, and **product intent** — see [`SCHEDULE_REFERENCE.md`](./SCHEDULE_REFERENCE.md) and [`../old-docs/ARCHIVE_NOTE.md`](../old-docs/ARCHIVE_NOTE.md).
