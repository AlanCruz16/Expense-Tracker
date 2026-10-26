import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createFakeSupabase, type FakeSupabase } from "@/test/fake-supabase"
import { clickDelete, expense, setUpDeleteFlow, toast } from "@/test/delete-flow"

let supabase: FakeSupabase

vi.mock("@/lib/supabase/client", () => ({ createClient: () => supabase }))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const { PaymentMethodsManager } = await import("@/components/settings/payment-methods-manager")

const amex = { id: "pm-amex", name: "Amex Gold", type: "Credit" }
const cash = { id: "pm-cash", name: "Cash", type: "Cash" }

function methodExpense(id: string, paymentMethodId: string) {
  return expense(id, { payment_method_id: paymentMethodId })
}

describe("PaymentMethodsManager delete", () => {
  const confirmSpy = setUpDeleteFlow()

  it("refuses to delete a payment method used by an expense and says how many", async () => {
    supabase = createFakeSupabase({ payment_methods: [amex], expenses: [methodExpense("e1", amex.id)] })

    await clickDelete(<PaymentMethodsManager />, "Amex Gold")

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(toast.error.mock.calls[0][0]).toMatch(/can't delete "Amex Gold"/i)
    expect(toast.error.mock.calls[0][0]).toMatch(/1 expense\b/)
    expect(toast.error.mock.calls[0][0]).toMatch(/another payment method/)
    expect(confirmSpy()).not.toHaveBeenCalled()
    expect(supabase.tables.payment_methods).toHaveLength(1)
    expect(supabase.tables.expenses).toEqual([methodExpense("e1", amex.id)])
  })

  it("asks to confirm and deletes an unused payment method", async () => {
    supabase = createFakeSupabase({ payment_methods: [amex, cash], expenses: [methodExpense("e1", cash.id)] })

    await clickDelete(<PaymentMethodsManager />, "Amex Gold")

    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith("Payment method deleted"))
    expect(confirmSpy()).toHaveBeenCalledOnce()
    expect(confirmSpy().mock.calls[0][0]).not.toMatch(/affect expenses/i)
    expect(supabase.deletes).toEqual([{ table: "payment_methods", id: amex.id }])
    expect(supabase.tables.expenses).toEqual([methodExpense("e1", cash.id)])
    // The list reloads once after the delete and drops the deleted method
    await vi.waitFor(() => expect(screen.queryByText("Amex Gold")).not.toBeInTheDocument())
    expect(supabase.selects).toEqual(["payment_methods", "payment_methods"])
  })
})

describe("PaymentMethodsManager add with an expired session", () => {
  setUpDeleteFlow()

  it("shows a login error and returns the Save button to idle", async () => {
    supabase = createFakeSupabase({ payment_methods: [] })
    render(<PaymentMethodsManager />)
    await userEvent.click(screen.getByRole("button", { name: /add method/i }))
    await userEvent.type(screen.getByLabelText("Name"), "Visa")
    supabase.expireSession()

    const save = screen.getByRole("button", { name: "Save" })
    await userEvent.click(save)

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith("You must be logged in"))
    expect(save).toBeEnabled()
  })
})
