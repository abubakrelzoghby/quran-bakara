Use autonomous-phase-cycle.

Start this phase and do not ask me between steps:

$ARGUMENTS

Constraints:
- Keep shared hosting as a hard constraint.
- Start from a clean `dev` branch.
- Create a new feature branch before edits: `feature/<roadmap-id-or-short-slug>`.
- Do not commit, push, merge, deploy, or delete production/runtime data.
- Do not add TypeScript, Node, npm, bundlers, frameworks, Composer packages, or a build step.
- Implement only the first safe vertical slice.
- Use senior-analyst -> senior-planner -> senior-implementer -> senior-tester.
- If tests fail inside the slice, fix once and re-test.
- Stop only for unclear requirements, unsafe operations, new runtime requirements, or scope expansion.

Branching:
- Run `git status --short --branch`.
- If not on `dev`, stop and ask.
- If the tree is not clean, stop and ask.
- Create the feature branch with a plain command, for example `git switch -c feature/p1-f1-calendar-projection`.
- Keep all phase edits on that feature branch.
- Leave commit, merge, branch deletion, and push to `/push-dev`.

Documentation:
- Read `.cursor/docs/new-system-requests/ROADMAP.md` if it exists.
- Save the phase handoff to `.cursor/docs/new-system-requests/phases/<phase-or-feature-slug>.md`.
- Update `.cursor/docs/new-system-requests/ROADMAP.md` after testing:
  - mark the slice status as Done, In progress, Blocked, or Not started,
  - add links to the phase note,
  - record remaining follow-up work.
