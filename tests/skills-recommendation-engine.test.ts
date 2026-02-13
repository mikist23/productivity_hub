import { describe, expect, it } from "vitest"
import { rankSkillRecommendations } from "../lib/skills/recommendation-engine"
import { skillRecommendationsCatalog } from "../lib/skills/recommendations-catalog"
import type { UserSkillSignal } from "../lib/skills/types"

describe("skills recommendation engine", () => {
  it("handles empty user skills with deterministic order", () => {
    const ranked = rankSkillRecommendations(skillRecommendationsCatalog, [], {
      sortBy: "recommended",
      domain: "All",
    })

    expect(ranked.length).toBeGreaterThanOrEqual(20)
    expect(ranked[0].id).toBe("ai-engineering-fundamentals")

    const secondRun = rankSkillRecommendations(skillRecommendationsCatalog, [], {
      sortBy: "recommended",
      domain: "All",
    })

    expect(secondRun.map((item) => item.id)).toEqual(ranked.map((item) => item.id))
  })

  it("ranks backend-adjacent tracks higher for backend learners", () => {
    const userSkills: UserSkillSignal[] = [
      { name: "Node.js", category: "Backend", status: "learning" },
      { name: "API Design", category: "Backend", status: "inprogress" },
    ]

    const ranked = rankSkillRecommendations(skillRecommendationsCatalog, userSkills, {
      sortBy: "recommended",
      domain: "All",
    })

    const backendTrack = ranked.find((track) => track.id === "backend-api-engineering")
    expect(backendTrack).toBeTruthy()
    expect(backendTrack?.reasons).toContain("builds_on_existing_skill")
  })

  it("supports demand sorting and domain filtering", () => {
    const ranked = rankSkillRecommendations(skillRecommendationsCatalog, [], {
      sortBy: "demand",
      domain: "AI",
    })

    expect(ranked.length).toBeGreaterThan(0)
    expect(ranked.every((item) => item.domain === "AI")).toBe(true)

    for (let index = 1; index < ranked.length; index += 1) {
      expect(ranked[index - 1].demandScore).toBeGreaterThanOrEqual(ranked[index].demandScore)
    }
  })
})

