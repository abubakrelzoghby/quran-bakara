Commit current safe feature-branch changes, merge into `dev`, delete the local feature branch, and push `origin/dev`.

Use simple separate terminal commands only. No variables. No here-strings. No command chaining. No trailers.

Steps:
1. Run: `git status --short --branch`
2. Run: `git diff --cached --stat`
3. Run: `git diff --stat`
4. Run: `git log --oneline -5`
5. Confirm the current branch is a feature branch like `feature/p1-f1-calendar-projection`. If on `main` or `staging`, stop. If on `dev`, only use the fallback below.
6. Review changed files. Do not commit `progress.json`, secrets, credentials, `.env` files, or unrelated user work.
7. Stage safe files if needed with a plain `git add ...` command.
8. Commit on the feature branch with exactly: `git commit -m "Add agent workflow infrastructure"` or replace the quoted message with the owner text after `/push-dev`.
9. Run: `git switch dev`
10. Run: `git merge <feature-branch-name>`
11. Run: `git branch -d <feature-branch-name>`
12. Run: `git push origin dev`
13. Run: `git status --short --branch`
14. Run: `git log --oneline -1`

Fallback if already on `dev`:
1. Only use this if the current branch is `dev` and the owner explicitly asked to push from `dev`.
2. Commit with exactly: `git commit -m "Add agent workflow infrastructure"` or replace the quoted message with the owner text after `/push-dev`.
3. Run: `git push origin dev`

Commit message rules:
- Use only the owner-approved message.
- Do not add `Generated with Cursor`.
- Do not add `Co-Authored-By`.
- Do not add any AI signature, footer, or trailer.

Safety:
- Do not use `--no-verify`.
- Do not force push.
- Do not amend.
- Do not push to `main` or `staging`.
- Do not delete the feature branch unless the merge into `dev` succeeds.
- If hooks or merge fails, stop and report the failure.
