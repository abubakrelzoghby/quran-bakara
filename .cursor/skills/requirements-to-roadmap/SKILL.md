---
name: requirements-to-roadmap
description: Analyze .cursor/docs/new-system-requests and convert requirements into owner-friendly phases, features, open decisions, and first implementation candidates without editing application code.
disable-model-invocation: true
---

# Requirements To Roadmap

Use this before implementation when the owner wants to shape the new system.

## Inputs

- `.cursor/docs/new-system-requests/PRODUCT_BRIEF.md`
- `.cursor/docs/new-system-requests/DEEP_ANALYSIS_AND_PLAN.md`
- `.cursor/docs/new-system-requests/CANONICAL_18_PARTS.md`
- Current app overview docs under `.cursor/docs/overview/`

## Output

Return a concise roadmap with:
1. Product phases.
2. Features inside each phase.
3. Dependencies between features.
4. Open owner decisions.
5. Shared-hosting risks.
6. Suggested first safe implementation slice.
7. What should not be built yet.

## Rules

- Do not edit application code.
- Do not start implementation.
- Keep shared hosting as a hard constraint.
- Prefer small vertical slices over broad rewrites.
- Clearly label assumptions vs confirmed requirements.
- If requirements conflict, surface the conflict instead of resolving silently.

## Owner Prompt

```text
Use requirements-to-roadmap.
Analyze .cursor/docs/new-system-requests and convert them into phases and features.
No implementation.
Keep shared hosting as a hard constraint.
```
