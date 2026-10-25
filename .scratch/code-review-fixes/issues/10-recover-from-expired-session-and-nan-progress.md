# 10: Recover gracefully when the session expires, and fix the NaN progress bar

**What to build:** Several save handlers (add expense, income, categories, payment methods) return early when there's no signed-in user without resetting their loading state. If the session expires in an open tab, the user sees "You must be logged in" but the button stays spinning and disabled. Separately, the dashboard's spending progress bar divides by monthly income, so with income 0 and no expenses it renders `width: NaN%`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] In each of the four forms, a save attempt with an expired session shows the error and returns the button to its idle state
- [ ] With monthly income 0, the dashboard progress bar renders as 0% (or an explicit "set your income" state), never NaN
- [ ] With income 0 and some spending, the bar shows a sensible over-budget state instead of Infinity or NaN
- [ ] Normal saves and normal progress-bar values are unchanged
