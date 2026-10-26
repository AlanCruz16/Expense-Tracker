import { describe, expect, it } from "vitest"
import { createFakeSupabase } from "@/test/fake-supabase"

describe("createFakeSupabase selects log", () => {
  it("records data selects but not count-only selects", async () => {
    const supabase = createFakeSupabase({ categories: [{ id: "c-1" }], expenses: [{ id: "e-1", category_id: "c-1" }] })

    await supabase.from("expenses").select("id", { count: "exact", head: true }).eq("category_id", "c-1")
    await supabase.from("categories").select("*")

    expect(supabase.selects).toEqual(["categories"])
  })
})
