import { beforeEach, describe, expect, it, vi } from "vitest"

const exchangeCodeForSession = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession } }),
}))

const { GET } = await import("@/app/auth/callback/route")

const origin = "https://expenses.example.com"

function callback(query: string, headers: Record<string, string> = {}) {
  return GET(new Request(`${origin}/auth/callback?${query}`, { headers }))
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset()
    exchangeCodeForSession.mockResolvedValue({ error: null })
  })

  it("sends a normal login to the dashboard", async () => {
    const res = await callback("code=abc")
    expect(res.headers.get("location")).toBe(`${origin}/dashboard`)
  })

  it("sends the forgot-password flow to the reset page", async () => {
    const res = await callback("code=abc&next=/reset-password")
    expect(res.headers.get("location")).toBe(`${origin}/reset-password`)
  })

  it("keeps the query string of a same-site next", async () => {
    const res = await callback(`code=abc&next=${encodeURIComponent("/expenses?month=2026-10")}`)
    expect(res.headers.get("location")).toBe(`${origin}/expenses?month=2026-10`)
  })

  it.each([
    "@evil.com",
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/.//evil.com",
    "/a/..//evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "evil.com",
    "",
  ])("falls back to the dashboard for next=%j", async (next) => {
    const res = await callback(`code=abc&next=${encodeURIComponent(next)}`)
    expect(res.headers.get("location")).toBe(`${origin}/dashboard`)
  })

  it("keeps percent-encoded slashes on this site", async () => {
    const res = await callback(`code=abc&next=${encodeURIComponent("/%2F/evil.com")}`)
    expect(res.headers.get("location")).toBe(`${origin}/%2F/evil.com`)
  })

  it("ignores x-forwarded-host", async () => {
    const res = await callback("code=abc&next=/reset-password", { "x-forwarded-host": "evil.com" })
    expect(res.headers.get("location")).toBe(`${origin}/reset-password`)
  })

  it("sends a failed code exchange to the error page", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: "bad code" } })
    const res = await callback("code=abc")
    expect(res.headers.get("location")).toBe(`${origin}/auth/auth-code-error`)
  })
})
