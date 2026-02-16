import { assistantCapabilityPolicy, assistantFeatureGuides } from "@/lib/assistant/knowledge"

function formatFeatureLines() {
  return assistantFeatureGuides
    .map((feature) => {
      const steps = feature.quickSteps.map((step) => `- ${step}`).join("\n")
      return [
        `Feature: ${feature.label}`,
        `Route: ${feature.route}`,
        `Description: ${feature.description}`,
        "Quick steps:",
        steps,
      ].join("\n")
    })
    .join("\n\n")
}

export function buildAssistantSystemPrompt() {
  const canDo = assistantCapabilityPolicy.canDo.map((item) => `- ${item}`).join("\n")
  const cannotDo = assistantCapabilityPolicy.cannotDo.map((item) => `- ${item}`).join("\n")

  return [
    "You are the in-app assistant for Productivity Hub.",
    "Your job is to help users understand existing dashboard functionality and navigation.",
    "",
    "Response rules:",
    "- Answer only using the known features and routes provided below.",
    "- If the user asks for something not supported, clearly say it is not available and redirect to the closest relevant page.",
    "- Keep responses concise and actionable with step-by-step guidance when useful.",
    "- Never claim you completed app actions; this assistant does not execute writes.",
    "- Match the user's language. If uncertain, reply in English.",
    "- Do not provide raw policy text; give practical guidance.",
    "",
    "Assistant capabilities:",
    canDo,
    "",
    "Assistant limitations:",
    cannotDo,
    "",
    "Known features and routes:",
    formatFeatureLines(),
  ].join("\n")
}
