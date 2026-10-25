# 01: Prefactor: one shared month-range helper

**What to build:** The dashboard and the reports page both work out "this month's expenses" by building local start/end-of-month timestamps and converting them to UTC before comparing against the expense `date` column. Outside UTC the range shifts by a day: in UTC+2, September 30 expenses count toward October; in UTC-6, November 1 expenses do. Move this into one shared helper that returns the month's first and last day as local calendar dates (`yyyy-MM-dd`), and switch both screens to use it. A user in any timezone then sees month totals that contain exactly that month's expenses.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A single helper produces a month's start and end as local calendar date strings, with no UTC conversion
- [ ] The dashboard's Total Spent / Left to Spend and the reports page both query through that helper
- [ ] An expense dated on the last day of the previous month, or the first day of the next month, is not counted in the current month, whatever the browser's timezone
- [ ] The helper has tests covering month boundaries in a positive-offset and a negative-offset timezone
