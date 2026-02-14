export type RoadmapImportSource = "w3schools" | "roadmapsh"

export interface ImportedRoadmapStep {
  externalId?: string
  title: string
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
}

function stripTags(text: string) {
  return decodeHtmlEntities(text.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeTitle(value: string) {
  return value
    .replace(/[\u0000-\u001F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function cleanAndDedupe(raw: ImportedRoadmapStep[]) {
  const seen = new Set<string>()
  const cleaned: ImportedRoadmapStep[] = []

  for (const step of raw) {
    const title = normalizeTitle(step.title)
    if (title.length < 3) continue
    const key = title.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    cleaned.push({
      externalId: step.externalId,
      title,
    })
  }

  return cleaned
}

function extractTitle(html: string, fallback: string) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!titleMatch) return fallback
  const title = stripTags(titleMatch[1] || "")
  return title.length > 0 ? title : fallback
}

export function detectRoadmapSource(url: URL): RoadmapImportSource | null {
  const host = url.hostname.toLowerCase()
  if (host === "roadmap.sh" || host.endsWith(".roadmap.sh")) return "roadmapsh"

  if (
    host === "w3schools.com" ||
    host.endsWith(".w3schools.com") ||
    host === "w3schools.io" ||
    host.endsWith(".w3schools.io")
  ) {
    return "w3schools"
  }

  return null
}

export function parseW3Schools(html: string, pageUrl: string) {
  const sidebarSteps: ImportedRoadmapStep[] = []

  const anchorRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let anchorMatch: RegExpExecArray | null

  while ((anchorMatch = anchorRegex.exec(html)) != null) {
    const href = anchorMatch[1] || ""
    const text = stripTags(anchorMatch[2] || "")

    if (!text) continue
    if (/next|prev|home|contact|privacy|terms/i.test(text)) continue

    if (/dart\s*-|tutorial|hello world|variables|operators|class|collections|package/i.test(text)) {
      sidebarSteps.push({ externalId: href, title: text })
    }
  }

  const steps = cleanAndDedupe(sidebarSteps)

  return {
    source: "w3schools" as const,
    title: extractTitle(html, pageUrl),
    steps,
  }
}

export function parseRoadmapSh(html: string, pageUrl: string) {
  const steps: ImportedRoadmapStep[] = []

  const headingRegex = /<(h1|h2|h3|h4)[^>]*>([\s\S]*?)<\/\1>/gi
  let headingMatch: RegExpExecArray | null
  while ((headingMatch = headingRegex.exec(html)) != null) {
    const title = stripTags(headingMatch[2] || "")
    if (!title) continue
    steps.push({ title })
  }

  const listRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let listMatch: RegExpExecArray | null
  while ((listMatch = listRegex.exec(html)) != null) {
    const text = stripTags(listMatch[1] || "")
    if (!text) continue
    if (text.length < 3) continue
    if (/cookie|privacy|terms|sign in|github/i.test(text)) continue
    steps.push({ title: text })
  }

  return {
    source: "roadmapsh" as const,
    title: extractTitle(html, pageUrl),
    steps: cleanAndDedupe(steps),
  }
}
