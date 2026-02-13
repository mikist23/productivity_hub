import { describe, expect, it } from "vitest"
import { buildCategorySearchUrl, techCategories } from "../lib/tech/discovery-config"

describe("tech discovery config", () => {
  it("contains balanced category definitions with sources", () => {
    expect(techCategories.length).toBe(9)
    for (const category of techCategories) {
      expect(category.label.length).toBeGreaterThan(0)
      expect(category.keywords.length).toBeGreaterThanOrEqual(4)
      expect(category.sources.length).toBeGreaterThanOrEqual(2)
    }
  })

  it("builds category search urls with encoded topic and query", () => {
    const source = techCategories[0].sources[0]
    const url = buildCategorySearchUrl(source, {
      topic: "AI",
      query: "agent workflow",
      dateRange: "week",
    })

    expect(url).toContain(encodeURIComponent("AI agent workflow"))
    expect(url).toContain("tbs=qdr:w")
  })
})

