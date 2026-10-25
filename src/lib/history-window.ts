import { subMonths } from "date-fns"
import { monthRange, type MonthRange } from "@/lib/month-range"

// The span of expense history a page has loaded: whole months, from the
// oldest of the last `months` months through the end of the current one.
export type HistoryWindow = MonthRange

export function historyWindow(today: Date, months: number): HistoryWindow {
  return {
    start: monthRange(subMonths(today, months - 1)).start,
    end: monthRange(today).end,
  }
}

// Whether the month containing `date` lies inside the loaded window
export function isMonthLoaded(date: Date, window: HistoryWindow): boolean {
  const { start, end } = monthRange(date)
  return start >= window.start && end <= window.end
}
