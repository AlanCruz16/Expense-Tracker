# Code review fixes

Fix the ten findings from the whole-app code review run on 2026-10-25 (high effort): two security holes (an unauthenticated receipt-analysis endpoint and an open redirect in the auth callback), broken user flows (a missing auth error page, deleting in-use categories, no sign-out or import on mobile, import stuck on errors), wrong numbers (timezone-shifted month ranges, reports past the loaded history, unvalidated import amounts) and stuck loading states.

Out of scope: the review's smaller cleanup items (recomputed memos, duplicated `ICONS` map, unused `rules` state, the 50-row expenses limit, the sign-out 307 question).

## Decisions

- Deleting an in-use category or payment method is **blocked with a clear message**. No data is nulled out or reassigned (ticket 05).

## Tickets

The task graph lives in `issues/`. `00` (Vitest setup) blocks everything else, since every ticket is built test-first. After it lands, everything except `09` is on the frontier; `09` also waits on `01`.

Follow-up tickets from reviewing that work:

- `10`: save buttons recover when the session has expired, and the spending progress bar never shows NaN.
- `11`: make lint pass by typing the reports chart tooltip.
- `12`: remove unused code flagged by lint, except the out-of-scope `rules` state.
- `13`: give data-loading effects complete, stable dependencies, so each screen loads once on mount with no lint suppressions.

`10` and `11` wait on `00`; `12` waits on `11`; `13` waits on `10` and `12`.

## Integration branch

`bug-fixes-october`. One squashed commit per ticket; see `docs/agents/git-workflow.md`.
