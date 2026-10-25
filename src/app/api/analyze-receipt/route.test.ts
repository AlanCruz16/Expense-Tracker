import { beforeEach, describe, expect, it, vi } from "vitest"
import { MAX_IMAGE_BYTES } from "@/lib/receipt-image"

const getUser = vi.fn()
const generateObject = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser } }),
}))
vi.mock("ai", () => ({ generateObject: (...args: unknown[]) => generateObject(...args) }))
vi.mock("@ai-sdk/google", () => ({ google: (model: string) => model }))

const { POST } = await import("@/app/api/analyze-receipt/route")

function dataUrl(bytes: number) {
  return `data:image/png;base64,${Buffer.alloc(bytes).toString("base64")}`
}

function request(body: unknown) {
  return new Request("http://localhost/api/analyze-receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const expenses = [{ date: "2026-10-01", description: "Coffee", amount: 3.5 }]
const signedIn = { data: { user: { id: "user-1" } }, error: null }
const signedOut = { data: { user: null }, error: { message: "Auth session missing!" } }

describe("POST /api/analyze-receipt", () => {
  beforeEach(() => {
    getUser.mockReset()
    generateObject.mockReset()
    getUser.mockResolvedValue(signedIn)
    generateObject.mockResolvedValue({ object: { expenses } })
  })

  it("rejects a request without a session with 401 and never calls Gemini", async () => {
    getUser.mockResolvedValue(signedOut)

    const res = await POST(request({ image: dataUrl(10) }))

    expect(res.status).toBe(401)
    expect(generateObject).not.toHaveBeenCalled()
  })

  it("rejects an image over the size cap with 413 and never calls Gemini", async () => {
    const res = await POST(request({ image: dataUrl(MAX_IMAGE_BYTES + 1) }))

    expect(res.status).toBe(413)
    expect(generateObject).not.toHaveBeenCalled()
  })

  it("accepts an image exactly at the size cap", async () => {
    const res = await POST(request({ image: dataUrl(MAX_IMAGE_BYTES) }))

    expect(res.status).toBe(200)
  })

  it("rejects a missing image with 400", async () => {
    const res = await POST(request({}))

    expect(res.status).toBe(400)
    expect(generateObject).not.toHaveBeenCalled()
  })

  it("returns extracted expenses for a signed-in user", async () => {
    const image = dataUrl(1024)

    const res = await POST(request({ image }))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ expenses })
    expect(generateObject).toHaveBeenCalledOnce()
    const { messages } = generateObject.mock.calls[0][0]
    expect(messages[0].content).toContainEqual({ type: "image", image })
  })
})
