import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const insert = vi.fn()
const getUser = vi.fn()
const push = vi.fn()
const toastError = vi.fn()

const tables: Record<string, unknown[]> = {
  categories: [{ id: "cat-1", name: "Food" }],
  payment_methods: [{ id: "pm-1", name: "Card" }],
  import_rules: [{ id: "rule-1", keyword: "coffee", category_id: "cat-1" }],
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser },
    from: (table: string) => ({
      select: async () => ({ data: tables[table], error: null }),
      insert,
    }),
  }),
}))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }))
vi.mock("sonner", () => ({ toast: { error: toastError, success: vi.fn() } }))

const { ReviewTable } = await import("@/components/import/review-table")

// Every row matches the "coffee" rule, so category and payment method are preset
const extracted = [
  { date: "2026-10-01", description: "Coffee shop", amount: -45 },
  { date: "2026-10-02", description: "Coffee beans", amount: 12.5 },
]

async function renderTable(initialData: unknown[] = extracted) {
  render(<ReviewTable initialData={initialData} onCancel={() => {}} />)
  return screen.findAllByRole("row")
}

function amountInput(row: HTMLElement) {
  return within(row).getByRole("spinbutton") as HTMLInputElement
}

function importButton() {
  return screen.getByRole("button", { name: /import/i })
}

describe("ReviewTable amounts", () => {
  beforeEach(() => {
    insert.mockReset()
    getUser.mockReset()
    push.mockReset()
    toastError.mockReset()
    insert.mockResolvedValue({ error: null })
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } })
  })

  it("shows negative extracted amounts as positive values", async () => {
    const [, debit] = await renderTable()

    expect(amountInput(debit).value).toBe("45")
  })

  it("flags a cleared amount and disables import until it is fixed", async () => {
    const [, first] = await renderTable()

    await userEvent.clear(amountInput(first))

    expect(amountInput(first)).toHaveAttribute("aria-invalid", "true")
    expect(within(first).getByText(/enter an amount/i)).toBeInTheDocument()
    expect(importButton()).toBeDisabled()

    await userEvent.type(amountInput(first), "20")

    expect(amountInput(first)).not.toHaveAttribute("aria-invalid", "true")
    expect(importButton()).toBeEnabled()
  })

  it("flags zero and non-numeric amounts", async () => {
    const [, zero, garbage] = await renderTable([
      { date: "2026-10-01", description: "Coffee refund", amount: 0 },
      { date: "2026-10-02", description: "Coffee ???", amount: "abc" },
    ])

    expect(amountInput(zero)).toHaveAttribute("aria-invalid", "true")
    expect(amountInput(garbage)).toHaveAttribute("aria-invalid", "true")
    expect(importButton()).toBeDisabled()
  })

  it("lets the user import once an invalid row is deselected", async () => {
    const [, first] = await renderTable()

    await userEvent.clear(amountInput(first))
    await userEvent.click(within(first).getByRole("checkbox"))

    expect(importButton()).toBeEnabled()
  })

  it("inserts the selected rows with positive amounts once all are valid", async () => {
    const [, first] = await renderTable()

    await userEvent.clear(amountInput(first))
    await userEvent.type(amountInput(first), "45.5")
    await userEvent.click(importButton())

    expect(insert).toHaveBeenCalledOnce()
    expect(insert.mock.calls[0][0]).toEqual([
      expect.objectContaining({ comment: "Coffee shop", amount: 45.5, user_id: "user-1" }),
      expect.objectContaining({ comment: "Coffee beans", amount: 12.5, user_id: "user-1" }),
    ])
    expect(toastError).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith("/expenses")
  })
})
