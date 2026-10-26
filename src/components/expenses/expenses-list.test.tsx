import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createFakeSupabase, type FakeSupabase } from "@/test/fake-supabase"
import { setUpDeleteFlow } from "@/test/delete-flow"

let supabase: FakeSupabase

// A fresh client object per call, like a real client created during render
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ ...supabase }) }))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const { ExpensesList } = await import("@/components/expenses/expenses-list")

const groceries = { id: "cat-groceries", name: "Groceries", icon: "shopping-cart", color: "#000" }
const cash = { id: "pm-cash", name: "Cash" }
const expense = (id: string, amount: number, comment: string) => ({
  id, amount, comment, date: "2026-10-20", categories: groceries, payment_methods: cash,
})

// Gives a refetch loop time to show up before asserting on the query log
const settle = () => new Promise((resolve) => setTimeout(resolve, 50))

describe("ExpensesList", () => {
  setUpDeleteFlow()

  it("loads expenses once on mount and shows them", async () => {
    supabase = createFakeSupabase({ expenses: [expense("e-1", 12.5, "Milk"), expense("e-2", 30, "Bread")] })
    render(<ExpensesList />)

    expect(await screen.findByText("Milk")).toBeInTheDocument()
    expect(screen.getByText("Bread")).toBeInTheDocument()
    await settle()
    expect(supabase.selects).toEqual(["expenses"])
  })

  it("removes a deleted expense from the list without reloading", async () => {
    supabase = createFakeSupabase({ expenses: [expense("e-1", 12.5, "Milk"), expense("e-2", 30, "Bread")] })
    render(<ExpensesList />)
    await screen.findByText("Milk")

    await userEvent.click(screen.getAllByRole("button")[0])

    await vi.waitFor(() => expect(screen.queryByText("Milk")).not.toBeInTheDocument())
    expect(screen.getByText("Bread")).toBeInTheDocument()
    expect(supabase.deletes).toEqual([{ table: "expenses", id: "e-1" }])
    expect(supabase.selects).toEqual(["expenses"])
  })
})
