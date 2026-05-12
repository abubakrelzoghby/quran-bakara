---
name: phase-change-cycle
description: Run the controlled cycle for big Quran Bakara phase changes from .cursor/docs/new-system-requests: analyze, plan thin slice, checkpoint, implement, test. Use for groups, new schedule modes, storage, access codes, or new pages.
---

# Phase Change Cycle

Use this for major changes, especially anything from `.cursor/docs/new-system-requests/`.

## Cycle

1. Analyze: invoke `senior-analyst` to read current docs and the relevant new-system request.
2. Plan: invoke `senior-planner` to define the smallest useful vertical slice.
3. Checkpoint: before multi-file edits, use `defensive-refactor-checkpoint` and ask the owner before committing.
4. Implement: invoke `senior-implementer` for only the approved slice.
5. Test: invoke `senior-tester` to verify behavior and shared-hosting compatibility.
6. Decide: owner approves next slice, revises direction, or stops.

## Shared Hosting Constraint

- Keep deployment as file upload plus PHP execution.
- Prefer host-supported SQLite or MySQL only if persistence must grow beyond JSON.
- Do not introduce TypeScript, Node runtime, npm, frontend frameworks, or compiled assets without explicit approval.

## Owner Prompt

```text
Use phase-change-cycle.
Analyze this phase only, no implementation yet: ...
Keep shared hosting as a hard constraint.
```
