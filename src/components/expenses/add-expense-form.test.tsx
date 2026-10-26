import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createFakeSupabase, type FakeSupabase } from "@/test/fake-supabase"
import { toast } from "@/test/delete-flow"

let supabase: FakeSupabase

vi.mock("@/lib/supabase/client", () => ({ createClient: () => supabase }))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }))

const { AddExpenseForm } = await import("@/components/expenses/add-expense-form")

const groceries = { id: "cat-groceries", name: "Groceries", icon: "shopping-cart", color: "#000", is_default: false }
const cash = { id: "pm-cash", name: "Cash", type: "Cash" }

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
