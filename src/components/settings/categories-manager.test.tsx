import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createFakeSupabase, type FakeSupabase } from "@/test/fake-supabase"

let supabase: FakeSupabase
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }))

vi.mock("@/lib/supabase/client", () => ({ createClient: () => supabase }))
vi.mock("sonner", () => ({ toast }))

const { CategoriesManager } = await import("@/components/settings/categories-manager")

const groceries = { id: "cat-groceries", name: "Groceries", icon: "shopping-cart", color: "#000", is_default: false }

function expense(id: string, categoryId: string) {
  return { id, category_id: categoryId, payment_method_id: null, amount: 10 }
}

async function clickDelete(name: string) {
  render(<CategoriesManager />)
  await userEvent.click(await screen.findByRole("button", { name: `Delete ${name}` }))
}

describe("CategoriesManager delete", () => {
  let confirmSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    toast.error.mockReset()
    toast.success.mockReset()
    confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
  })

  afterEach(() => {
    confirmSpy.mockRestore()
  })

  it("refuses to delete a category used by expenses and says how many", async () => {
    supabase = createFakeSupabase({
      categories: [groceries],
      expenses: [expense("e1", groceries.id), expense("e2", groceries.id), expense("e3", groceries.id)],
      import_rules: [],
    })

    await clickDelete("Groceries")

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(toast.error.mock.calls[0][0]).toMatch(/can't delete "Groceries"/i)
    expect(toast.error.mock.calls[0][0]).toMatch(/3 expenses/)
    expect(confirmSpy).not.toHaveBeenCalled()
    expect(supabase.tables.categories).toHaveLength(1)
    expect(supabase.tables.expenses).toHaveLength(3)
  })

  it("refuses to delete a category used only by an import rule", async () => {
    supabase = createFakeSupabase({
      categories: [groceries],
      expenses: [],
      import_rules: [{ id: "r1", keyword: "walmart", category_id: groceries.id }],
    })

    await clickDelete("Groceries")

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(toast.error.mock.calls[0][0]).toMatch(/1 import rule\b/)
    expect(confirmSpy).not.toHaveBeenCalled()
    expect(supabase.tables.categories).toHaveLength(1)
    expect(supabase.tables.import_rules).toHaveLength(1)
  })

  it("asks to confirm and deletes an unused category", async () => {
    const other = { ...groceries, id: "cat-other", name: "Other" }
    supabase = createFakeSupabase({
      categories: [groceries, other],
      expenses: [expense("e1", other.id)],
      import_rules: [],
    })

    await clickDelete("Groceries")

    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith("Category deleted"))
    expect(confirmSpy).toHaveBeenCalledOnce()
    expect(confirmSpy.mock.calls[0][0]).not.toMatch(/affect expenses/i)
    expect(supabase.deletes).toEqual([{ table: "categories", id: groceries.id }])
    expect(supabase.tables.expenses).toEqual([expense("e1", other.id)])
    expect(toast.error).not.toHaveBeenCalled()
  })

  it("keeps an unused category when the user cancels the confirm", async () => {
    supabase = createFakeSupabase({ categories: [groceries], expenses: [], import_rules: [] })
    confirmSpy.mockReturnValue(false)

    await clickDelete("Groceries")

    await vi.waitFor(() => expect(confirmSpy).toHaveBeenCalled())
    expect(supabase.deletes).toEqual([])
  })
})
