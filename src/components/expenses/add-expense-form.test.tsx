import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createFakeSupabase, type FakeSupabase } from "@/test/fake-supabase"
import { toast } from "@/test/delete-flow"

let supabase: FakeSupabase

// A fresh client object per call, like a real client created during render
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ ...supabase }) }))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }))

const { AddExpenseForm } = await import("@/components/expenses/add-expense-form")

const groceries = { id: "cat-groceries", name: "Groceries", icon: "shopping-cart", color: "#000", is_default: false }
const rent = { id: "cat-rent", name: "Rent", icon: "home", color: "#000", is_default: false }
const cash = { id: "pm-cash", name: "Cash", type: "Cash" }
const card = { id: "pm-card", name: "Visa", type: "Credit" }

// Gives a refetch loop time to show up before asserting on the query log
const settle = () => new Promise((resolve) => setTimeout(resolve, 50))

afterEach(() => localStorage.clear())

describe("AddExpenseForm with an expired session", () => {
  it("shows a login error and returns the Save Expense button to idle", async () => {
    supabase = createFakeSupabase({ categories: [groceries], payment_methods: [cash] })
    localStorage.setItem("last_category_id", groceries.id)
    render(<AddExpenseForm />)

    await userEvent.type(await screen.findByPlaceholderText("0"), "12.5")
    supabase.expireSession()

    const save = screen.getByRole("button", { name: /save expense/i })
    await userEvent.click(save)

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith("You must be logged in"))
    expect(save).toBeEnabled()
  })
})

describe("AddExpenseForm loading", () => {
  it("loads categories and payment methods once and restores the last-used ones", async () => {
    supabase = createFakeSupabase({ categories: [groceries, rent], payment_methods: [cash, card] })
    localStorage.setItem("last_category_id", rent.id)
    localStorage.setItem("last_payment_method_id", card.id)
    render(<AddExpenseForm />)

    await screen.findByPlaceholderText("0")
    const [category, method] = screen.getAllByRole("combobox")
    await vi.waitFor(() => expect(category).toHaveTextContent("Rent"))
    expect(method).toHaveTextContent("Visa")
    await settle()
    expect(supabase.selects.sort()).toEqual(["categories", "payment_methods"])
  })

  it("defaults to the first payment method when none was used before", async () => {
    supabase = createFakeSupabase({ categories: [groceries], payment_methods: [cash, card] })
    render(<AddExpenseForm />)

    await screen.findByPlaceholderText("0")
    const [category, method] = screen.getAllByRole("combobox")
    await vi.waitFor(() => expect(method).toHaveTextContent("Cash"))
    expect(category).toHaveTextContent("Select Category")
  })
})
