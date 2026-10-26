import { NextRequest } from "next/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
  }),
}))

const { proxy } = await import("@/proxy")

describe("proxy", () => {
  it("lets a signed-out visitor reach the auth code error page", async () => {
    const res = await proxy(new NextRequest("https://expenses.example.com/auth/auth-code-error"))
    expect(res.headers.get("location")).toBeNull()
    expect(res.status).toBe(200)
  })
})
