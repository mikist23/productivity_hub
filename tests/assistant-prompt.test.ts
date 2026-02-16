import { describe, expect, it } from "vitest"
import { buildAssistantSystemPrompt } from "../lib/assistant/prompt"

describe("assistant prompt", () => {
  it("includes core routes and features", () => {
    const prompt = buildAssistantSystemPrompt()

    expect(prompt).toContain("/dashboard/goals")
    expect(prompt).toContain("/dashboard/time")
    expect(prompt).toContain("/dashboard/skills")
    expect(prompt).toContain("/dashboard/settings")
    expect(prompt).toContain("/support")
  })

  it("includes fallback guidance for unknown requests", () => {
    const prompt = buildAssistantSystemPrompt()
    expect(prompt).toContain("If the user asks for something not supported")
    expect(prompt).toContain("closest relevant page")
  })

  it("includes language matching instruction", () => {
    const prompt = buildAssistantSystemPrompt()
    expect(prompt).toContain("Match the user's language")
  })
})
