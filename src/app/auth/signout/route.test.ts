import { beforeEach, describe, expect, it, vi } from "vitest"

const signOut = vi.fn()
const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`)
})

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { signOut } }),
}))
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirect(url) }))

const { POST } = await import("@/app/auth/signout/route")

describe("POST /auth/signout", () => {
  beforeEach(() => {
    signOut.mockReset()
    redirect.mockClear()
    signOut.mockResolvedValue({ error: null })
  })

  it("clears the session and sends the user to the login page", async () => {
    await expect(POST(new Request("http://localhost/auth/signout", { method: "POST" }))).rejects.toThrow(
      "NEXT_REDIRECT /login"
    )

    expect(signOut).toHaveBeenCalledOnce()
    expect(signOut.mock.invocationCallOrder[0]).toBeLessThan(redirect.mock.invocationCallOrder[0])
  })
})
