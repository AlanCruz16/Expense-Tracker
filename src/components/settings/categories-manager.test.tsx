import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createFakeSupabase, type FakeSupabase } from "@/test/fake-supabase"
import { clickDelete, expense, setUpDeleteFlow, toast } from "@/test/delete-flow"

let supabase: FakeSupabase

vi.mock("@/lib/supabase/client", () => ({ createClient: () => supabase }))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const { CategoriesManager } = await import("@/components/settings/categories-manager")

const groceries = { id: "cat-groceries", name: "Groceries", icon: "shopping-cart", color: "#000", is_default: false }

function categoryExpense(id: string, categoryId: string) {
  return expense(id, { category_id: categoryId })
}

describe("CategoriesManager delete", () => {
  const confirmSpy = setUpDeleteFlow()

  it("refuses to delete a category used by expenses and says how many", async () => {
    supabase = createFakeSupabase({
      categories: [groceries],
      expenses: [
        categoryExpense("e1", groceries.id),
        categoryExpense("e2", groceries.id),
        categoryExpense("e3", groceries.id),
      ],
      import_rules: [],
    })

    await clickDelete(<CategoriesManager />, "Groceries")

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(toast.error.mock.calls[0][0]).toMatch(/can't delete "Groceries"/i)
    expect(toast.error.mock.calls[0][0]).toMatch(/3 expenses/)
    expect(confirmSpy()).not.toHaveBeenCalled()
    expect(supabase.tables.categories).toHaveLength(1)
    expect(supabase.tables.expenses).toHaveLength(3)
  })

  it("refuses to delete a category used only by an import rule", async () => {
    supabase = createFakeSupabase({
      categories: [groceries],
      expenses: [],
      import_rules: [{ id: "r1", keyword: "walmart", category_id: groceries.id }],
    })

    await clickDelete(<CategoriesManager />, "Groceries")

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(toast.error.mock.calls[0][0]).toMatch(/1 import rule\b/)
    expect(confirmSpy()).not.toHaveBeenCalled()
    expect(supabase.tables.categories).toHaveLength(1)
    expect(supabase.tables.import_rules).toHaveLength(1)
  })

  it("asks to confirm and deletes an unused category", async () => {
    const other = { ...groceries, id: "cat-other", name: "Other" }
    supabase = createFakeSupabase({
      categories: [groceries, other],
      expenses: [categoryExpense("e1", other.id)],
      import_rules: [],
    })

    await clickDelete(<CategoriesManager />, "Groceries")

    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith("Category deleted"))
    expect(confirmSpy()).toHaveBeenCalledOnce()
    expect(confirmSpy().mock.calls[0][0]).not.toMatch(/affect expenses/i)
    expect(supabase.deletes).toEqual([{ table: "categories", id: groceries.id }])
    expect(supabase.tables.expenses).toEqual([categoryExpense("e1", other.id)])
    expect(toast.error).not.toHaveBeenCalled()
    // The list reloads once after the delete and drops the deleted category
    await vi.waitFor(() => expect(screen.queryByText("Groceries")).not.toBeInTheDocument())
    expect(supabase.selects).toEqual(["categories", "categories"])
  })

  it("keeps an unused category when the user cancels the confirm", async () => {
    supabase = createFakeSupabase({ categories: [groceries], expenses: [], import_rules: [] })
    confirmSpy().mockReturnValue(false)

    await clickDelete(<CategoriesManager />, "Groceries")

    await vi.waitFor(() => expect(confirmSpy()).toHaveBeenCalled())
    expect(supabase.deletes).toEqual([])
  })
})

describe("CategoriesManager add with an expired session", () => {
  setUpDeleteFlow()

  it("shows a login error and returns the Save button to idle", async () => {
    supabase = createFakeSupabase({ categories: [] })
    render(<CategoriesManager />)
    await userEvent.click(screen.getByRole("button", { name: /add category/i }))
    await userEvent.type(screen.getByLabelText("Name"), "Pets")
    supabase.expireSession()

    const save = screen.getByRole("button", { name: "Save" })
    await userEvent.click(save)

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith("You must be logged in"))
    expect(save).toBeEnabled()
  })
})
