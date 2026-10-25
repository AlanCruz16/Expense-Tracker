// Shared setup for the settings managers' delete tests. The test file must mock
// "sonner" (vi.mock is only hoisted inside test files); `toast` here is then that
// mock, so tests can assert on it.

import type { ReactElement } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, vi, type MockInstance } from "vitest"
import { toast as sonnerToast } from "sonner"

export const toast = vi.mocked(sonnerToast)

export function expense(
  id: string,
  refs: { category_id?: string | null; payment_method_id?: string | null },
) {
  return { id, category_id: null, payment_method_id: null, amount: 10, ...refs }
}

export async function clickDelete(manager: ReactElement, name: string) {
  render(manager)
  await userEvent.click(await screen.findByRole("button", { name: `Delete ${name}` }))
}

// Resets the toast mock and stubs window.confirm to accept before each test.
// Returns the confirm spy; set a different answer with `confirm().mockReturnValue(false)`.
export function setUpDeleteFlow() {
  let confirmSpy: MockInstance<typeof window.confirm>

  beforeEach(() => {
    toast.error.mockReset()
    toast.success.mockReset()
    confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
  })

  afterEach(() => {
    confirmSpy.mockRestore()
  })

  return () => confirmSpy
}
