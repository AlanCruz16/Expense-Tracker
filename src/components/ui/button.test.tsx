import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders its label and calls onClick when clicked", async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>
    )

    const button = screen.getByRole("button", { name: "Save" })
    await userEvent.click(button)

    expect(button).toBeDisabled()
    expect(onClick).not.toHaveBeenCalled()
  })
})
