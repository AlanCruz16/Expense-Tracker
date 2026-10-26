import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"

type FakeExpense = { id: string; date: string; amount: number; comment: string | null; categories: { name: string } }

let expenses: FakeExpense[] = []
const expenseQuery = vi.fn()
let user: { id: string } | null = { id: "user-1" }

// Stands in for Supabase: returns the expenses whose date is inside the
// requested range, the way the real query would. A fresh client object per
// call, like a real client created during render.
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: async () => ({ data: { user } }) },
    from: () => {
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

// Charts need real layout to render. Bar charts are replaced by a plain list of
// their x-axis labels so tests can see which months a chart covers; the other
// charts aren't what these tests check.
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>()
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    AreaChart: () => null,
    PieChart: () => null,
    BarChart: ({ data }: { data: { month?: string; name?: string }[] }) => (
      <ol>
        {data.map((d) => (
          <li key={d.month ?? d.name}>{d.month ?? d.name}</li>
        ))}
      </ol>
    ),
  }
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

// Gives a refetch loop time to show up before asserting on the query log
const settle = () => new Promise((resolve) => setTimeout(resolve, 50))

function card(title: string) {
  return screen.getByText(title).closest("[data-slot='card']") as HTMLElement
}

describe("ReportsDashboard history window", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date(2026, 9, 15, 12))
    expenses = []
    user = { id: "user-1" }
    expenseQuery.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("loads the last six months of expenses", async () => {
    await renderReports()
    expect(expenseQuery).toHaveBeenCalledWith("2026-05-01", "2026-10-31")
  })

  it("loads its expenses exactly once on mount", async () => {
    expenses = [expense("oct-rent", "2026-10-05", 100)]
    await renderReports()

    expect(card("Total Spent")).toHaveTextContent("$100.00")
    await settle()
    expect(expenseQuery).toHaveBeenCalledTimes(1)
  })

  it("stops loading when the session has expired", async () => {
    user = null
    await renderReports()

    expect(expenseQuery).not.toHaveBeenCalled()
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

  describe("when the tab stays open into the next month", () => {
    async function renderThenCrossIntoNovember() {
      await renderReports()
      vi.setSystemTime(new Date(2026, 10, 2, 9))
    }

    function comparisonMonths() {
      return within(card("Monthly Comparison")).getAllByRole("listitem").map((li) => li.textContent)
    }

    it("keeps the next-month control disabled on the newest loaded month", async () => {
      await renderThenCrossIntoNovember()

      await goBack(1)
      await userEvent.click(screen.getByRole("button", { name: "Next month" }))

      expect(shownMonth()).toBe("October 2026")
      expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled()
    })

    it("jumps back to the newest loaded month from the current-month shortcut", async () => {
      await renderThenCrossIntoNovember()

      await goBack(2)
      await userEvent.click(screen.getByRole("button", { name: "Current Month" }))

      expect(shownMonth()).toBe("October 2026")
    })

    it("keeps the monthly comparison chart on the loaded months", async () => {
      await renderThenCrossIntoNovember()

      await goBack(1)

      expect(comparisonMonths()).toEqual(["May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26", "Oct 26"])
    })
  })
})
