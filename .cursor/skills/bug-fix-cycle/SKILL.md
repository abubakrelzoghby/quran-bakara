---
name: bug-fix-cycle
description: Diagnose and fix Quran Bakara bugs with a minimal evidence-based loop. Use when something is broken, rendering incorrectly, saving wrong progress, or behaving unexpectedly.
---

# Bug Fix Cycle

Use this when the owner reports a bug.

## Cycle

1. Reproduce or identify the failing path from the owner report.
2. Read the smallest relevant files and docs.
3. State the likely root cause with evidence.
4. Apply the smallest fix.
5. Verify the original failing path and any adjacent risk.
6. Summarize root cause, fix, and verification.

## Default Subagents

- Use `senior-analyst` for unclear or cross-file bugs.
- Use `senior-implementer` for the fix.
- Use `senior-tester` to verify the bug no longer reproduces.

## Owner Prompt

```text
Use bug-fix-cycle.
Bug: ...
Expected: ...
Actual: ...
```
