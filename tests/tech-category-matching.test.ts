import { describe, expect, it } from "vitest"
import { inferCategoriesForTitle } from "../lib/tech/feed"

describe("tech category matching", () => {
  it("classifies AI stories", () => {
    const categories = inferCategoriesForTitle("OpenAI launches new model for agent workflows")
    expect(categories).toContain("ai")
  })

  it("classifies mobile and frontend overlap", () => {
    const categories = inferCategoriesForTitle("React Native and Android tooling update")
    expect(categories.length).toBeGreaterThan(0)
    expect(categories).toEqual(expect.arrayContaining(["mobile"]))
  })

  it("classifies space stories", () => {
    const categories = inferCategoriesForTitle("NASA confirms new moon mission launch window")
    expect(categories).toContain("space-nasa")
  })
})

