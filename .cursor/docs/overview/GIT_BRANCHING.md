# Git branching and release workflow

This document defines the agreed Git workflow for this repository, for both:

- a **solo maintainer** (current situation), and
- a **team setup** (future growth).

The branch model is intentionally fixed as:

- `dev` for local development and integration
- `staging` for testing / pre-production validation
- `main` for production

## Current repository facts

- Remote branches currently used: `dev`, `staging`, `main`.
- `origin/HEAD` points to `dev`.
- `main` is treated as production/stable.

## Branch roles

- `dev`: the branch used for active development work. Code is written, adjusted, and integrated here first.
- `staging`: the branch used for testing the next release on a test server or pre-production environment.
- `main`: the production branch. Only code that is considered release-ready should land here.

## Short working agreement

Use this as the quick rule for humans and agents:

1. Make changes on `dev`.
2. Test locally from `dev`.
3. Promote `dev` to `staging` for server testing.
4. If testing passes, promote `staging` to `main`.
5. Treat `main` as production-only.

## Why keep both `dev` and `staging`?

Because this repository now uses a deliberate 3-step path:

- `dev` answers: "what we are building now"
- `staging` answers: "what we are testing now"
- `main` answers: "what is live / trusted now"

This separation reduces accidental production releases and makes it obvious where a change currently stands.

## Recommended workflow for a solo maintainer (you now)

Even as a solo maintainer, follow the same branch path:

1. Work on `dev`.
2. Test locally.
3. Merge `dev` into `staging`.
4. Test on the staging server.
5. Merge `staging` into `main` only after validation passes.

This adds one extra step, but keeps production cleaner and gives a stable place to test the exact candidate release.

## Team workflow (recommended)

For a team, use this predictable path:

1. Developers branch from `dev` (`feature/*`, `fix/*`).
2. PRs merge into `dev` after review + CI.
3. Release PR: `dev` -> `staging`.
4. QA/UAT on staging.
5. Promote PR: `staging` -> `main`.
6. Tag release (`vX.Y.Z`) on `main`.

This gives clear responsibilities:

- `dev`: fastest iteration
- `staging`: release candidate
- `main`: production truth

## Merge direction

Normal direction should be:

`feature/*` -> `dev` -> `staging` -> `main`

Avoid skipping levels unless there is a deliberate emergency hotfix process.

## Minimal branch policy

- Protect `main` (no direct pushes).
- Prefer protecting `staging` too.
- Prefer PR merges over direct merges for traceability.
- Require at least basic checks before merging to `main`.
- Keep commits small and descriptive.

## Practical default for this repo

This repository should now be treated as:

- `dev` = local development branch
- `staging` = testing branch
- `main` = production branch

Unless explicitly documented otherwise, agents should assume this is the correct promotion flow.
