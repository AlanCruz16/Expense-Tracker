# Git workflow

How work moves through git in this repo. Solo project: no PRs, no CI, no `.github/`.

## Branches

- `main` is the deployed branch.
- Batches of work happen on a named branch off `main` (e.g. `bug-fixes-october`). That branch is the **integration branch** for `/implement-spec`.
- When the batch is done, the user merges the integration branch into `main` themselves. Don't open PRs or push unless asked.

## Commits

- Short, lowercase, imperative messages: `fix login not redirecting to dashboard`, `add forgot password flow`. No conventional-commit prefixes.
- **One commit per ticket** on the integration branch. The message is `[NN] <what changed>`, e.g. `[02] require login to analyze receipts`.
- That commit also includes the ticket file update that resolves it (see `issue-tracker.md`).
- End every commit message with the attribution line from the session's system reminder.

## With `/implement-spec`

- Implementers work on per-ticket branches (`ticket/NN-<slug>`) in their own worktrees and may commit freely there.
- The merger lands each ticket with `git merge --squash ticket/NN-<slug>`, then makes one commit in the format above. The integration branch never gets merge commits or WIP commits.
- The post-review fixes (step 7) land as one more commit: `fix code review findings`.
- Delete the `ticket/*` branches and worktrees after their squash lands.
- Before each ticket commit, `npm test`, `npm run lint` and `npm run build` must pass (ticket 00 adds `npm test`; until it lands, only lint and build apply).
