import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn(() => ({})) }))
vi.mock("@/lib/supabase/client", () => ({ createClient }))

const { useSupabaseClient } = await import("@/lib/supabase/use-supabase-client")

describe("useSupabaseClient", () => {
  it("returns the same client on every render", () => {
    const { result, rerender } = renderHook(() => useSupabaseClient())
    const first = result.current

    rerender()
    rerender()

    expect(result.current).toBe(first)
    expect(createClient).toHaveBeenCalledTimes(1)
  })
})
