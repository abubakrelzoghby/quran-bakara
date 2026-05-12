# P1-F1 Calendar Projection Spec/Module

**Date:** 2026-05-12
**Status:** Done
**Roadmap item:** P1-F1

## Analyst Handoff

P1-F1 should stay isolated from the legacy UI and API while it proves the new calendar backbone. The safe slice is a pure Friday-through-Thursday product-week projection with six reading days and one Thursday catch-up day.

No owner decision blocks this slice. Later integration can decide how the legacy "no future weeks" rule maps into the new group planner.

## Planner Slice

Create a shared-hosting-friendly PHP module that:

- accepts a Friday anchor date and positive 1-based week index,
- returns seven projected dates from Friday through Thursday,
- marks days 1 through 6 as reading days,
- marks day 7 as the catch-up day,
- calculates the current week index from the same Friday anchor and clamps dates before the anchor to week 1.

Do not wire the module into `api/get_data.php`, `assets/js/script.js`, storage, auth, or UI behavior in this slice.

## Implementation Summary

Added `api/lib/calendar_projection.php` with pure functions:

- `calendar_projection_project_week($anchorFriday, $weekIndex)`
- `calendar_projection_current_week_index($anchorFriday, $todayDate = null)`

The module uses `DateTimeImmutable`, validates `Y-m-d` date strings, requires the anchor to be a Friday, and throws `InvalidArgumentException` for invalid inputs.

## Verification

Completed local checks:

- `php -l api/lib/calendar_projection.php` passed.
- PHP assertions passed for week 1 Friday-through-Thursday dates, week 2 start date, reading/catch-up flags, invalid non-Friday anchor handling, and before-anchor current-week clamping.

## Follow-Up

Next roadmap item is P1-F2: static canonical `P01` through `P18` reading template. No remaining implementation work is planned for P1-F1.
