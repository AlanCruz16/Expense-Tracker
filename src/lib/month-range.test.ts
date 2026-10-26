import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { monthRange, type MonthRange } from "@/lib/month-range"

// Expense dates are stored as plain yyyy-MM-dd strings, so a range is right
// when it keeps the neighbouring months' edge days out of a string comparison
function inRange(date: string, range: MonthRange) {
  return date >= range.start && date <= range.end
}

// Fixed-offset zones with no DST: UTC+2 and UTC-6
describe.each([
  { tz: "Africa/Johannesburg", offsetMinutes: -120 },
  { tz: "America/Mexico_City", offsetMinutes: 360 },
])("monthRange in $tz", ({ tz, offsetMinutes }) => {
  const originalTz = process.env.TZ

  beforeAll(() => {
    process.env.TZ = tz
  })

  afterAll(() => {
    if (originalTz === undefined) delete process.env.TZ
    else process.env.TZ = originalTz
  })

  it("runs in the pinned timezone", () => {
    expect(new Date(2026, 9, 15).getTimezoneOffset()).toBe(offsetMinutes)
  })

  it("returns the month's first and last day as local calendar dates", () => {
    expect(monthRange(new Date(2026, 9, 15))).toEqual({ start: "2026-10-01", end: "2026-10-31" })
  })

  it("stays in the same month at the very start and end of local days", () => {
    expect(monthRange(new Date(2026, 9, 1, 0, 30))).toEqual({ start: "2026-10-01", end: "2026-10-31" })
    expect(monthRange(new Date(2026, 9, 31, 23, 30))).toEqual({ start: "2026-10-01", end: "2026-10-31" })
  })

  it("leaves out the previous month's last day and the next month's first day", () => {
    const range = monthRange(new Date(2026, 9, 15))
    expect(inRange("2026-09-30", range)).toBe(false)
    expect(inRange("2026-10-01", range)).toBe(true)
    expect(inRange("2026-10-31", range)).toBe(true)
    expect(inRange("2026-11-01", range)).toBe(false)
  })

  it("handles short months", () => {
    expect(monthRange(new Date(2028, 1, 10))).toEqual({ start: "2028-02-01", end: "2028-02-29" })
  })
})
