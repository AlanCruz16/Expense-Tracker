import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("joins class names and drops falsy ones", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c")
  })

  it("lets later Tailwind classes win over conflicting earlier ones", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
  })
})
