# Operations — run, deploy, sync

## Local development

### Requirements

- **PHP** available on `PATH` (the app is not a Node/React build).

### Run

From the repository root (directory containing `index.html`):

```bash
php -S localhost:8080
```

Then open:

- `http://localhost:8080/index.html` — full schedule  
- `http://localhost:8080/person.html` — personal view with completion controls  

Stop with `Ctrl+C`.

### First-time note on `progress.json`

- Path used by PHP: **`{repo_root}/progress.json`** (one level **above** `api/`).
- The file is **gitignored**. After clone, it may not exist until:
  - someone toggles completion on `person.html` (triggers `save_progress.php`), or  
  - you run the fetch script (below).

Until `get_progress.php` can read a file, `loadRemoteProgress()` fails softly and the app uses **localStorage only** for completion (unless `REMOTE_PROGRESS` was populated).

---

## Archived Arabic docs

Original Arabic markdown was moved to **`.cursor/docs/old-docs/`**. Some paths and filenames there are outdated; see [`../old-docs/ARCHIVE_NOTE.md`](../old-docs/ARCHIVE_NOTE.md).

---

## Production sync helper (`api/fetch_server_data.php`)

- **Purpose:** Pull remote progress from a configured production URL and write **`progress.json`** locally.
- **Configuration:** `$SERVER_URL` inside the PHP file (default in repo points to a specific host — update for your environment).
- **Usage:** Hit the script via the PHP server, e.g. `http://localhost:8080/api/fetch_server_data.php`.
- **Security note:** Uses `CURLOPT_SSL_VERIFYPEER => false` — convenient for debugging, **avoid in hardened production pipelines**.

---

## Deployment (conceptual)

1. Deploy HTML, `assets/`, and `api/` to a host that executes **PHP**.
2. Ensure the web server can **read/write** `progress.json` at the path expected by `get_progress.php` / `save_progress.php` (parent of `api/`).
3. Do not expose write endpoints without understanding risk: **`save_progress.php` has no authentication** — anyone who can POST to it can alter the JSON map. The **person page passwords** only protect the UI flow on a given browser, not the API.

---

## Testing checklist (manual)

1. `get_data.php` returns 200 and valid JSON with `currentWeek`.
2. `person.html`: select each person, navigate weeks, open modal on a part.
3. Toggle “تم” / “إلغاء”: verify `progress.json` updates and reload reflects state.
4. `index.html`: aggregate progress bar moves when remote progress includes keys for all people.

---

## Windows note

If `php` is not found in Git Bash or PowerShell, install PHP for Windows or use a stack (Laragon, XAMPP) and run the built-in server from the project root with the same command.
