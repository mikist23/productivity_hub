import { beforeEach, describe, expect, it } from "vitest"
import { assistantProviderDefaults, resolveAssistantProviderConfig } from "../lib/assistant/provider"

describe("assistant provider config", () => {
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY
    delete process.env.GEMINI_MODEL
    delete process.env.GEMINI_BASE_URL
  })

  it("returns null when GEMINI_API_KEY is missing", () => {
    expect(resolveAssistantProviderConfig()).toBeNull()
  })

  it("resolves defaults when optional vars are missing", () => {
    process.env.GEMINI_API_KEY = "demo-key"

    const config = resolveAssistantProviderConfig()
    expect(config).toEqual({
      apiKey: "demo-key",
      model: assistantProviderDefaults.model,
      baseURL: assistantProviderDefaults.baseURL,
    })
  })

  it("uses explicit model and base URL when provided", () => {
    process.env.GEMINI_API_KEY = "demo-key"
    process.env.GEMINI_MODEL = "gemini-custom"
    process.env.GEMINI_BASE_URL = "https://example.com/openai/"

    const config = resolveAssistantProviderConfig()
    expect(config).toEqual({
      apiKey: "demo-key",
      model: "gemini-custom",
      baseURL: "https://example.com/openai/",
    })
  })
})
