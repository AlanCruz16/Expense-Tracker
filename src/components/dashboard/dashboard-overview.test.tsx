import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { format } from "date-fns"
import { createFakeSupabase, type FakeSupabase } from "@/test/fake-supabase"

let supabase: FakeSupabase

// A fresh client object per call, like a real client created during render
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ ...supabase }) }))

// Charts need real layout; they aren't what these tests check
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>()
  return { ...actual, ResponsiveContainer: () => null }
})

const { DashboardOverview } = await import("@/components/dashboard/dashboard-overview")

const groceries = { id: "cat-groceries", name: "Groceries" }
const today = format(new Date(), "yyyy-MM-dd")

// Gives a refetch loop time to show up before asserting on the query log
const settle = () => new Promise((resolve) => setTimeout(resolve, 50))

describe("DashboardOverview", () => {
  it("loads this month's expenses and income once on mount and shows them", async () => {
    supabase = createFakeSupabase({
      expenses: [
        { id: "e-1", amount: 40, date: today, categories: groceries },
        { id: "e-2", amount: 60, date: today, categories: groceries },
      ],
      profiles: [{ id: "user-1", monthly_income: 1000 }],
    })
    render(<DashboardOverview />)

    expect(await screen.findByText("$100.00")).toBeInTheDocument()
    expect(screen.getByText("2 transactions")).toBeInTheDocument()
    expect(screen.getByText("$900.00")).toBeInTheDocument()
    await settle()
    expect(supabase.selects.sort()).toEqual(["expenses", "profiles"])
  })
})
