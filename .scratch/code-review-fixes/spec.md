# Code review fixes

Fix the ten findings from the whole-app code review run on 2026-10-25 (high effort): two security holes (an unauthenticated receipt-analysis endpoint and an open redirect in the auth callback), broken user flows (a missing auth error page, deleting in-use categories, no sign-out or import on mobile, import stuck on errors), wrong numbers (timezone-shifted month ranges, reports past the loaded history, unvalidated import amounts) and stuck loading states.

Out of scope: the review's smaller cleanup items (recomputed memos, duplicated `ICONS` map, unused `rules` state, the 50-row expenses limit, the sign-out 307 question).

## Decisions

- Deleting an in-use category or payment method is **blocked with a clear message**. No data is nulled out or reassigned (ticket 05).

## Tickets

The task graph lives in `issues/`. `00` (Vitest setup) blocks everything else, since every ticket is built test-first. After it lands, everything except `09` is on the frontier; `09` also waits on `01`.

## Integration branch

`bug-fixes-october`. One squashed commit per ticket; see `docs/agents/git-workflow.md`.
