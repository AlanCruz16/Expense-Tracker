import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createFakeSupabase, type FakeSupabase } from "@/test/fake-supabase"

let supabase: FakeSupabase
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }))

vi.mock("@/lib/supabase/client", () => ({ createClient: () => supabase }))
vi.mock("sonner", () => ({ toast }))

const { PaymentMethodsManager } = await import("@/components/settings/payment-methods-manager")

const amex = { id: "pm-amex", name: "Amex Gold", type: "Credit" }
const cash = { id: "pm-cash", name: "Cash", type: "Cash" }

function expense(id: string, paymentMethodId: string) {
  return { id, category_id: null, payment_method_id: paymentMethodId, amount: 10 }
}

async function clickDelete(name: string) {
  render(<PaymentMethodsManager />)
  await userEvent.click(await screen.findByRole("button", { name: `Delete ${name}` }))
}

describe("PaymentMethodsManager delete", () => {
  let confirmSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    toast.error.mockReset()
    toast.success.mockReset()
    confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
  })

  afterEach(() => {
    confirmSpy.mockRestore()
  })

  it("refuses to delete a payment method used by an expense and says how many", async () => {
    supabase = createFakeSupabase({ payment_methods: [amex], expenses: [expense("e1", amex.id)] })

    await clickDelete("Amex Gold")

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(toast.error.mock.calls[0][0]).toMatch(/can't delete "Amex Gold"/i)
    expect(toast.error.mock.calls[0][0]).toMatch(/1 expense\b/)
    expect(confirmSpy).not.toHaveBeenCalled()
    expect(supabase.tables.payment_methods).toHaveLength(1)
    expect(supabase.tables.expenses).toEqual([expense("e1", amex.id)])
  })

  it("asks to confirm and deletes an unused payment method", async () => {
    supabase = createFakeSupabase({ payment_methods: [amex, cash], expenses: [expense("e1", cash.id)] })

    await clickDelete("Amex Gold")

    await vi.waitFor(() => expect(toast.success).toHaveBeenCalledWith("Payment method deleted"))
    expect(confirmSpy).toHaveBeenCalledOnce()
    expect(confirmSpy.mock.calls[0][0]).not.toMatch(/affect expenses/i)
    expect(supabase.deletes).toEqual([{ table: "payment_methods", id: amex.id }])
    expect(supabase.tables.expenses).toEqual([expense("e1", cash.id)])
  })
})
