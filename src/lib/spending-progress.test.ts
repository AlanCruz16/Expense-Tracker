import { describe, expect, it } from "vitest"
import { spendingProgressPercent } from "@/lib/spending-progress"

describe("spendingProgressPercent", () => {
  it("is the share of income spent", () => {
    expect(spendingProgressPercent(250, 1000)).toBe(25)
  })

  it("caps at 100 when spending exceeds income", () => {
    expect(spendingProgressPercent(1500, 1000)).toBe(100)
  })

  it("is 0 with no income and no spending", () => {
    expect(spendingProgressPercent(0, 0)).toBe(0)
  })

  it("is full (over budget) with no income but some spending", () => {
    expect(spendingProgressPercent(40, 0)).toBe(100)
  })
})
