import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createFakeSupabase, type FakeSupabase } from "@/test/fake-supabase"
import { toast } from "@/test/delete-flow"

let supabase: FakeSupabase

vi.mock("@/lib/supabase/client", () => ({ createClient: () => supabase }))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const { IncomeForm } = await import("@/components/settings/income-form")

describe("IncomeForm with an expired session", () => {
  it("shows a login error and returns the Save button to idle", async () => {
    supabase = createFakeSupabase({ profiles: [] })
    supabase.expireSession()
    render(<IncomeForm initialIncome={1000} />)

    const save = screen.getByRole("button", { name: "Save" })
    await userEvent.click(save)

    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith("You must be logged in"))
    expect(save).toBeEnabled()
  })
})
