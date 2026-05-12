---
name: defensive-refactor-checkpoint
description: Prepare safe git checkpoints before multi-file refactors, phase changes, API reshaping, storage changes, or broad architectural edits.
disable-model-invocation: true
---

# Defensive Refactor Checkpoint

## Instructions

1. Run `git status --short` and identify unrelated changes.
2. Explain the refactor boundary and proposed checkpoint.
3. Ask the user for explicit approval before committing.
4. If approved, commit the clean pre-refactor state first.
5. Make the refactor in a separate change set and invoke `workflow-verifier` before completion.

## Rules

- Never create commits without explicit user approval.
- Never include `progress.json`, secrets, credentials, or unrelated work.
- Keep checkpoint commits separate from implementation commits.
