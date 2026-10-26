import { describe, expect, it } from "vitest"
import { historyWindow, isMonthLoaded } from "@/lib/history-window"

describe("historyWindow", () => {
  it("spans whole months from the oldest loaded month to the end of this month", () => {
    expect(historyWindow(new Date(2026, 9, 15), 6)).toEqual({ start: "2026-05-01", end: "2026-10-31" })
  })

  it("crosses year boundaries", () => {
    expect(historyWindow(new Date(2027, 1, 3), 6)).toEqual({ start: "2026-09-01", end: "2027-02-28" })
  })
})

describe("isMonthLoaded", () => {
  const window = historyWindow(new Date(2026, 9, 15), 6)

  it("includes the oldest and newest months of the window", () => {
    expect(isMonthLoaded(new Date(2026, 4, 20), window)).toBe(true)
    expect(isMonthLoaded(new Date(2026, 9, 1), window)).toBe(true)
  })

  it("excludes the month before the window", () => {
    expect(isMonthLoaded(new Date(2026, 3, 30), window)).toBe(false)
  })

  it("excludes the month after the window", () => {
    expect(isMonthLoaded(new Date(2026, 10, 1), window)).toBe(false)
  })
})
