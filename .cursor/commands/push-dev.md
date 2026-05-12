Commit current safe changes and push to `origin/dev`.

Use simple separate terminal commands only. No variables. No here-strings. No command chaining. No trailers.

Steps:
1. Run: `git status --short --branch`
2. Run: `git diff --cached --stat`
3. Run: `git diff --stat`
4. Run: `git log --oneline -5`
5. Confirm the current branch is exactly `dev`. If not on `dev`, stop and ask.
6. Review changed files. Do not commit `progress.json`, secrets, credentials, `.env` files, or unrelated user work.
7. Stage safe files if needed with a plain `git add ...` command.
8. Commit with exactly: `git commit -m "Add agent workflow infrastructure"` or replace the quoted message with the owner text after `/push-dev`.
9. Push with exactly: `git push origin dev`
10. Run: `git status --short --branch`
11. Run: `git log --oneline -1`

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
- If hooks fail, stop and report the failure.
