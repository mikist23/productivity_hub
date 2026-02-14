import { describe, expect, it } from "vitest"
import {
  buildRoadmapSourceUrl,
  extractSkillKeyword,
  resolveSkillSlugFromGoalTitle,
  suggestRoadmapSkills,
} from "../lib/roadmap-import/source-url"

describe("roadmap source url resolver", () => {
  it("extracts known skill slugs from goal titles", () => {
    expect(extractSkillKeyword("Master Python")).toBe("python")
    expect(extractSkillKeyword("Learn Swift basics")).toBe("swift")
    expect(resolveSkillSlugFromGoalTitle("Master Coddling").slug).toBe("kotlin")
  })

  it("returns null when no known keyword exists", () => {
    expect(extractSkillKeyword("Become unstoppable this year")).toBeNull()
  })

  it("builds source-specific URLs", () => {
    expect(buildRoadmapSourceUrl("w3schools", "python")).toBe("https://www.w3schools.com/python/")
    expect(buildRoadmapSourceUrl("roadmapsh", "python")).toBe("https://roadmap.sh/python")
    expect(buildRoadmapSourceUrl("freecodecamp", "python")).toBe(
      "https://www.freecodecamp.org/news/tag/python/"
    )
  })

  it("uses source-specific slug overrides when defined", () => {
    expect(buildRoadmapSourceUrl("roadmapsh", "git")).toBe("https://roadmap.sh/git-github")
  })

  it("suggests fallback skills for unknown text", () => {
    const suggestions = suggestRoadmapSkills("I want to build amazing things", 5)
    expect(suggestions.length).toBeGreaterThan(0)
  })
})
