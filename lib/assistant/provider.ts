const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
const DEFAULT_GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

export type AssistantProviderConfig = {
  apiKey: string
  model: string
  baseURL: string
}

export function resolveAssistantProviderConfig(): AssistantProviderConfig | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
  const baseURL = process.env.GEMINI_BASE_URL?.trim() || DEFAULT_GEMINI_BASE_URL

  return { apiKey, model, baseURL }
}

export const assistantProviderDefaults = {
  model: DEFAULT_GEMINI_MODEL,
  baseURL: DEFAULT_GEMINI_BASE_URL,
}
