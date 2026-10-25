import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"

type FakeExpense = { id: string; date: string; amount: number; comment: string | null; categories: { name: string } }

let expenses: FakeExpense[] = []
const expenseQuery = vi.fn()

// Stands in for Supabase: returns the expenses whose date is inside the
// requested range, the way the real query would
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
    from: (table: string) => {
      if (table === "profiles") {
        return { select: () => ({ eq: () => ({ single: async () => ({ data: { monthly_income: 0 } }) }) }) }
      }
      return {
        select: () => ({
          gte: (_col: string, start: string) => ({
            lte: (_col2: string, end: string) => ({
              order: async () => {
                expenseQuery(start, end)
                return { data: expenses.filter((e) => e.date >= start && e.date <= end) }
              },
            }),
          }),
        }),
      }
    },
  }),
}))

// Charts need real layout to render; they aren't what these tests check
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>()
  return { ...actual, ResponsiveContainer: () => null }
})

function expense(id: string, date: string, amount: number, category = "Food"): FakeExpense {
  return { id, date, amount, comment: id, categories: { name: category } }
}

async function renderReports() {
  render(<ReportsDashboard />)
  await screen.findByText("Total Spent")
}

async function goBack(times: number) {
  for (let i = 0; i < times; i++) {
    await userEvent.click(screen.getByRole("button", { name: "Previous month" }))
  }
}

// The month name shown between the navigation arrows
function shownMonth() {
  return screen.getByRole("button", { name: "Previous month" }).nextElementSibling?.textContent
}

function card(title: string) {
  return screen.getByText(title).closest("[data-slot='card']") as HTMLElement
}

describe("ReportsDashboard history window", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date(2026, 9, 15, 12))
    expenses = []
    expenseQuery.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("loads the last six months of expenses", async () => {
    await renderReports()
    expect(expenseQuery).toHaveBeenCalledWith("2026-05-01", "2026-10-31")
  })

  it("disables the previous-month control on the oldest loaded month", async () => {
    await renderReports()

    await goBack(4)
    expect(shownMonth()).toBe("June 2026")
    expect(screen.getByRole("button", { name: "Previous month" })).toBeEnabled()

    await goBack(1)
    expect(shownMonth()).toBe("May 2026")
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled()
  })

  it("shows no comparison on the oldest loaded month, since the month before wasn't loaded", async () => {
    expenses = [expense("may-rent", "2026-05-10", 120)]
    await renderReports()

    await goBack(5)

    const vsLastMonth = card("vs Last Month")
    expect(vsLastMonth).toHaveTextContent("No data")
    expect(vsLastMonth).not.toHaveTextContent("%")
  })

  it("shows the same totals and comparison as before for months inside the window", async () => {
    expenses = [
      expense("may-rent", "2026-05-10", 100),
      expense("june-rent", "2026-06-01", 120),
      expense("june-food", "2026-06-30", 30),
      expense("june-savings", "2026-06-15", 500, "Savings"),
    ]
    await renderReports()

    await goBack(4)

    expect(card("Total Spent")).toHaveTextContent("$150.00")
    expect(card("Total Spent")).toHaveTextContent("2 transactions")
    expect(card("vs Last Month")).toHaveTextContent("+50.0%")
    expect(card("vs Last Month")).toHaveTextContent("$50.00 more")
  })
})
