# 09: Reports stay within loaded history

**What to build:** The reports page only fetches the last six months of expenses, but month navigation goes back without limit. Older months show $0 and "No expenses for this month" even when expenses exist. On the oldest loaded month, "vs Last Month" compares against an unloaded month, which counts as 0. Navigation and comparisons should only cover data that has actually been loaded.

**Blocked by:** 01 (Prefactor: one shared month-range helper)

**Status:** ready-for-agent

- [ ] The previous-month control is disabled on the oldest month in the loaded history window
- [ ] "vs Last Month" is hidden (or shows "no data") when the previous month is outside the loaded window
- [ ] Months inside the window show the same totals as before
- [ ] The history window's date range is built with the shared month-range helper from ticket 01
