import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ChartTooltip } from "@/components/reports/reports-dashboard"

describe("ChartTooltip", () => {
  it("renders nothing when the chart isn't hovered", () => {
    const { container } = render(
      <ChartTooltip active={false} label="Oct" payload={[{ name: "Food", value: 12, color: "red" }]} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("renders nothing when there are no series under the cursor", () => {
    const { container } = render(<ChartTooltip active label="Oct" payload={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the label and each series as dollars to two decimals", () => {
    const { container } = render(
      <ChartTooltip
        active
        label="Oct 2026"
        payload={[
          { name: "This month", value: 1234.5, color: "green" },
          { name: "Last month", value: 7, color: "gray" },
        ]}
      />
    )
    expect(container).toHaveTextContent("Oct 2026")
    expect(container).toHaveTextContent("This month:$1234.50")
    expect(container).toHaveTextContent("Last month:$7.00")
  })
})
