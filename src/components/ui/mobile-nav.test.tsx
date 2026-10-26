import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const pathname = vi.fn(() => "/dashboard")

vi.mock("next/navigation", () => ({ usePathname: () => pathname() }))

const { MobileNav } = await import("@/components/ui/mobile-nav")

async function openMore() {
  await userEvent.click(screen.getByRole("button", { name: "More" }))
  return screen.getByRole("dialog")
}

describe("MobileNav", () => {
  beforeEach(() => {
    pathname.mockReturnValue("/dashboard")
  })

  it("lets the user reach Smart Import", async () => {
    render(<MobileNav />)

    const menu = await openMore()

    expect(within(menu).getByRole("link", { name: /smart import/i })).toHaveAttribute("href", "/import")
  })

  it("lets the user reach Settings", async () => {
    render(<MobileNav />)

    const menu = await openMore()

    expect(within(menu).getByRole("link", { name: /settings/i })).toHaveAttribute("href", "/settings")
  })

  it("signs out by posting to the sign-out route", async () => {
    render(<MobileNav />)

    const menu = await openMore()
    const signOut = within(menu).getByRole("button", { name: /sign out/i })
    const form = signOut.closest("form")

    expect(signOut).toHaveAttribute("type", "submit")
    expect(form).toHaveAttribute("action", "/auth/signout")
    expect(form).toHaveAttribute("method", "post")
  })
})
