import { endOfMonth, format, startOfMonth } from "date-fns"

export type MonthRange = { start: string; end: string }

// First and last day of the month containing `date`, as local yyyy-MM-dd
// strings. Expense dates are calendar dates, so comparing against these
// (rather than UTC timestamps) keeps the range exact in any timezone.
export function monthRange(date: Date): MonthRange {
  return {
    start: format(startOfMonth(date), "yyyy-MM-dd"),
    end: format(endOfMonth(date), "yyyy-MM-dd"),
  }
}
