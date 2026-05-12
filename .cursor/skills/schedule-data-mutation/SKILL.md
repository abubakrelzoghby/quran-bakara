---
name: schedule-data-mutation
description: Safely change Quran Bakara schedule structure, people, rotation, start dates, 18-part assignments, or progress key implications. Use when modifying schedule data or week logic.
paths:
  - "api/data.json"
  - "api/get_data.php"
  - "assets/js/script.js"
  - "assets/js/person.js"
---

# Schedule Data Mutation

## Instructions

1. Treat `api/data.json` as the active source of truth.
2. For future system changes, read `.cursor/docs/new-system-requests/PRODUCT_BRIEF.md` and `CANONICAL_18_PARTS.md`; do not start phase planning unless the user asks.
3. Validate `config.people`, `sections`, `parts`, and `rotationPattern` together.
4. Keep PHP week logic and JavaScript fallback logic aligned.
5. Before changing person names or progress key format, identify migration impact for `progress.json` and localStorage.
6. Keep the runtime shared-hosting friendly: plain PHP/JS/JSON, no build step.
7. Update docs when changing product behavior, not just data values.

## Verification

- `get_data.php` can return valid JSON.
- `index.html` can render all people and days.
- `person.html` can render each configured person.
- Day 7 catch-up behavior remains intentional.
