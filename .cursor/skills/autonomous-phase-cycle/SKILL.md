---
name: autonomous-phase-cycle
description: Run a full Quran Bakara phase workflow from analysis to planning to first safe implementation slice to testing without asking the owner between steps. Use when the owner wants autonomous multi-agent execution.
disable-model-invocation: true
---

# Autonomous Phase Cycle

Use this only when the owner explicitly asks for no further input.

## Owner Approval Scope

The starting prompt is approval to:
- Analyze the phase.
- Plan the smallest safe vertical slice.
- Implement that slice.
- Test that slice.
- Continue fixing issues found by tests when the fix stays inside the approved slice.

The starting prompt is not approval to:
- Commit, push, merge, deploy, or delete production data.
- Add TypeScript, Node, npm, bundlers, frameworks, Composer packages, or a build step.
- Introduce secrets, external services, paid APIs, or non-shared-hosting requirements.
- Expand beyond the phase/slice if analysis shows the request is too large or ambiguous.

## Multi-Agent Sequence

1. Invoke `senior-analyst`.
2. Pass its handoff to `senior-planner`.
3. Parent agent chooses the smallest safe slice from the plan.
4. Invoke `senior-implementer` for that slice only.
5. Invoke `senior-tester`.
6. If tester finds a small issue inside the slice, invoke `senior-implementer` once more, then re-test.
7. Save a phase note under `.cursor/docs/new-system-requests/phases/<phase-or-feature-slug>.md`.
8. Update `.cursor/docs/new-system-requests/ROADMAP.md` with the final status, phase-note link, completed work, and remaining work.
9. Stop and summarize.

## Phase Note Format

Each phase note should include:
- Phase or feature name.
- Date.
- Analyst handoff.
- Planner slice.
- Files changed.
- Tester result.
- Final status: Done, In progress, Blocked, or Not started.
- Follow-up work.

## Stop Conditions

Stop and ask the owner only if:
- Required product behavior is unclear.
- The safe slice would need a new runtime/dependency/build step.
- The change requires destructive git/file operations, commit/push/deploy, or real data migration.
- Tests reveal a larger design problem outside the approved slice.

## Owner Prompt

```text
Use autonomous-phase-cycle.
Start this phase and do not ask me between steps: ...
Keep shared hosting as a hard constraint.
Do not commit, push, deploy, add build tools, or expand beyond the first safe slice.
```
