# 10: Recover gracefully when the session expires, and fix the NaN progress bar

**What to build:** Several save handlers (add expense, income, categories, payment methods) return early when there's no signed-in user without resetting their loading state. If the session expires in an open tab, the user sees "You must be logged in" but the button stays spinning and disabled. Separately, the dashboard's spending progress bar divides by monthly income, so with income 0 and no expenses it renders `width: NaN%`.

**Blocked by:** 00 (Set up Vitest)

**Status:** done

- [x] In each of the four forms, a save attempt with an expired session shows the error and returns the button to its idle state
- [x] With monthly income 0, the dashboard progress bar renders as 0% (or an explicit "set your income" state), never NaN
- [x] With income 0 and some spending, the bar shows a sensible over-budget state instead of Infinity or NaN
- [x] Normal saves and normal progress-bar values are unchanged

## Comments

- All four save handlers now toast "You must be logged in" and reset their submitting/loading flag when `getUser()` returns no user (income, categories and payment methods previously returned silently). Covered by component tests using a new `expireSession()` on the fake Supabase client.
- The progress bar width comes from `spendingProgressPercent` (`src/lib/spending-progress.ts`): share of income capped at 100; with income 0 it is 0% with no spending and a full bar with spending (the bar is already red because left-to-spend is negative).
