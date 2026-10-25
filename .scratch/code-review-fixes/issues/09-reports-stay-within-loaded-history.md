# 09: Reports stay within loaded history

**What to build:** The reports page only fetches the last six months of expenses, but month navigation goes back without limit. Older months show $0 and "No expenses for this month" even when expenses exist. On the oldest loaded month, "vs Last Month" compares against an unloaded month, which counts as 0. Navigation and comparisons should only cover data that has actually been loaded.

**Blocked by:** 00 (Set up Vitest), 01 (Prefactor: one shared month-range helper)

**Status:** done

- [x] The previous-month control is disabled on the oldest month in the loaded history window
- [x] "vs Last Month" is hidden (or shows "no data") when the previous month is outside the loaded window
- [x] Months inside the window show the same totals as before
- [x] The history window's date range is built with the shared month-range helper from ticket 01

## Comments

- New `src/lib/history-window.ts`: `historyWindow(today, months)` builds the loaded window from `monthRange` (oldest month's start to this month's end), and `isMonthLoaded(date, window)` says whether a month lies inside it. The reports page computes its window once on mount and uses it for the fetch, the back arrow and the comparisons.
- On the oldest loaded month, "vs Last Month" shows "No data" with "<Month> isn't loaded", and Category Trends drops the previous-month bars and the "vs <Month>" subtitle.
- The month arrows now have `aria-label`s ("Previous month" / "Next month"); the component tests find them by those names.
- Component tests (`reports-dashboard.test.tsx`) fake the Supabase client with a date-range filter and stub recharts' `ResponsiveContainer`, since jsdom has no layout.
- `npm run lint` still has the 2 earlier `no-explicit-any` errors in `reports-dashboard.tsx` (ticket 11).
