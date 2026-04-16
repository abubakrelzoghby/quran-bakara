# Archived Arabic documentation (moved from `/docs`)

These files were originally at the repository root in `docs/`. They are **kept for human reference** (Arabic prose, rotation tables, deployment ideas).

## Trust model for agents

When anything here **disagrees with the PHP/JS source**, **the source wins**. See [../overview/SYSTEM_OVERVIEW.md](../overview/SYSTEM_OVERVIEW.md) and [../overview/OPERATIONS.md](../overview/OPERATIONS.md).

## Known mismatches (why this archive exists)

| Topic | Some archived Arabic docs claim | What the code actually does |
|-------|-----------------------------------|-------------------------------|
| Progress file(s) | `config.php`, `progress.local.json`, `progress.server.json`, split read/write | **`get_progress.php` / `save_progress.php` use a single `progress.json` at repo root** (see `api/*.php`). No `config.php` in tree. |
| Fetch script output | Saves `progress.server.json` | **`fetch_server_data.php` writes `../progress.json`** (same file the app reads). |
| Paths | `dev/fetch_server_data.php` | **`api/fetch_server_data.php`** |
| Data source | Data embedded only in `script.js` | Schedule comes from **`api/data.json`** via **`get_data.php`** |

The Arabic files still contain **useful domain content** (verse ranges per day, rotation narrative, product goals) even where the plumbing description is outdated.
