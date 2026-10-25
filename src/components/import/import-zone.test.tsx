import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { toast } from "sonner"
import { ImportZone } from "@/components/import/import-zone"

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

// The review table talks to Supabase; stand in for it so we only see what the zone hands over
vi.mock("@/components/import/review-table", () => ({
  ReviewTable: ({ initialData }: { initialData: { description: string }[] }) => (
    <ul aria-label="review">
      {initialData.map((e) => (
        <li key={e.description}>{e.description}</li>
      ))}
    </ul>
  ),
}))

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
  vi.mocked(toast.error).mockReset()
  vi.spyOn(console, "error").mockRestore()
})

function receipt() {
  return new File(["fake image bytes"], "statement.png", { type: "image/png" })
}

function fileInput(container: HTMLElement) {
  return container.querySelector('input[type="file"]') as HTMLInputElement
}

async function uploadReceipt() {
  const user = userEvent.setup()
  const { container } = render(<ImportZone />)
  await user.upload(fileInput(container), receipt())
  return { container }
}

async function expectIdle(container: HTMLElement) {
  const button = await screen.findByRole("button", { name: "Select Image" })
  expect(button).toBeEnabled()
  expect(fileInput(container)).toBeEnabled()
}

describe("ImportZone", () => {
  it("shows the server's message and returns to idle when analysis is rejected", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    fetchMock.mockResolvedValue(new Response("Image too large", { status: 413 }))

    const { container } = await uploadReceipt()

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Image too large"))
    await expectIdle(container)
  })

  it("falls back to a generic message when the server gives no reason", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    fetchMock.mockResolvedValue(new Response("", { status: 500 }))

    const { container } = await uploadReceipt()

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Failed to analyze statement"))
    await expectIdle(container)
  })

  it("shows an error and returns to idle when the network drops", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))

    const { container } = await uploadReceipt()

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Failed to analyze statement"))
    await expectIdle(container)
  })

  it("lets the user retry the same file after a failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    fetchMock
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(
        Response.json({ expenses: [{ date: "2026-10-01", description: "Coffee", amount: 4.5 }] }),
      )
    const user = userEvent.setup()
    const { container } = render(<ImportZone />)
    const file = receipt()

    await user.upload(fileInput(container), file)
    await expectIdle(container)
    await user.upload(fileInput(container), file)

    expect(await screen.findByText("Coffee")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("hands the extracted expenses to the review table on success", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        expenses: [
          { date: "2026-10-01", description: "Coffee", amount: 4.5 },
          { date: "2026-10-02", description: "Groceries", amount: 62.1 },
        ],
      }),
    )

    await uploadReceipt()

    expect(await screen.findByText("Coffee")).toBeInTheDocument()
    expect(screen.getByText("Groceries")).toBeInTheDocument()
    expect(toast.error).not.toHaveBeenCalled()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("/api/analyze-receipt")
    expect(JSON.parse(init.body).image).toMatch(/^data:image\/png;base64,/)
  })
})
