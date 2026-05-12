---
name: software-development-cycle
description: Run the standard owner-friendly cycle for small Quran Bakara software features: understand, implement, verify, summarize. Use when adding small features or making focused changes.
---

# Software Development Cycle

Use this for small features and focused improvements.

## Cycle

1. Understand the request in one short paragraph.
2. Read only the files and docs directly related to the change.
3. Implement the smallest complete change in plain HTML, CSS, vanilla JS, PHP, or JSON.
4. Avoid TypeScript, Node, npm, frameworks, bundlers, Composer packages, and build output unless the owner explicitly approves.
5. Verify the affected page/API path.
6. Summarize changed files, behavior, and verification.

## Default Subagents

- Use `senior-analyst` only if the request is unclear or touches multiple areas.
- Use `senior-implementer` for the approved focused change.
- Use `senior-tester` after implementation when behavior changed.

## Owner Prompt

```text
Use software-development-cycle.
Implement this small feature: ...
Keep shared hosting simple. No build tools.
```
