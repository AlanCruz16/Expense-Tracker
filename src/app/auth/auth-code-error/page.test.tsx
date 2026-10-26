import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import AuthCodeErrorPage from "@/app/auth/auth-code-error/page"

describe("auth code error page", () => {
  it("explains that the link is invalid or expired", () => {
    render(<AuthCodeErrorPage />)
    expect(screen.getByText(/link is invalid or has expired/i)).toBeInTheDocument()
  })

  it("tells the user to open the link in the browser they requested it from", () => {
    render(<AuthCodeErrorPage />)
    expect(screen.getByText(/same browser/i)).toBeInTheDocument()
  })

  it("links back to login", () => {
    render(<AuthCodeErrorPage />)
    expect(screen.getByRole("link", { name: /back to login/i })).toHaveAttribute("href", "/login")
  })

  it("links to forgot-password for a new reset link", () => {
    render(<AuthCodeErrorPage />)
    expect(screen.getByRole("link", { name: /new reset link/i })).toHaveAttribute("href", "/login")
  })
})
