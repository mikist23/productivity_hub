export type RoadmapImportSource = "w3schools" | "roadmapsh" | "freecodecamp"

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
  if (host === "freecodecamp.org" || host.endsWith(".freecodecamp.org")) return "freecodecamp"

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

function anchorStepsFromHtml(html: string, options?: { preferSidebar?: boolean }) {
  const raw: ImportedRoadmapStep[] = []
  const patterns = options?.preferSidebar
    ? [
        /<(nav|aside|div)[^>]*(class|id)=["'][^"']*(sidenav|sidebar|leftmenu|menu)[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi,
      ]
    : []

  const sourceBlocks: string[] = []
  for (const pattern of patterns) {
    let blockMatch: RegExpExecArray | null
    while ((blockMatch = pattern.exec(html)) != null) {
      sourceBlocks.push(blockMatch[4] || "")
    }
  }
  if (sourceBlocks.length === 0) sourceBlocks.push(html)

  const anchorRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  for (const block of sourceBlocks) {
    let anchorMatch: RegExpExecArray | null
    while ((anchorMatch = anchorRegex.exec(block)) != null) {
      const href = anchorMatch[1] || ""
      const text = stripTags(anchorMatch[2] || "")
      if (!text) continue
      if (
        /next|prev|home|contact|privacy|terms|cookie|donate|forum|sign in|log in|register|curriculum/i.test(text)
      ) {
        continue
      }
      raw.push({ externalId: href, title: text })
    }
  }

  return cleanAndDedupe(raw)
}

export function parseW3Schools(html: string, pageUrl: string) {
  const preferred = anchorStepsFromHtml(html, { preferSidebar: true })
  const fallback = preferred.length > 0 ? preferred : anchorStepsFromHtml(html)

  return {
    source: "w3schools" as const,
    title: extractTitle(html, pageUrl),
    steps: fallback,
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

export function parseFreeCodeCamp(html: string, pageUrl: string) {
  const steps: ImportedRoadmapStep[] = []

  const contentBlocks: string[] = []
  const blockRegex =
    /<(article|main|section|div)[^>]*(class|id)=["'][^"']*(article|tutorial|content|post-body|markdown)[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi

  let blockMatch: RegExpExecArray | null
  while ((blockMatch = blockRegex.exec(html)) != null) {
    contentBlocks.push(blockMatch[4] || "")
  }
  if (contentBlocks.length === 0) contentBlocks.push(html)

  for (const block of contentBlocks) {
    const headingRegex = /<(h1|h2|h3|h4)[^>]*>([\s\S]*?)<\/\1>/gi
    let headingMatch: RegExpExecArray | null
    while ((headingMatch = headingRegex.exec(block)) != null) {
      const title = stripTags(headingMatch[2] || "")
      if (!title) continue
      if (/privacy|cookie|forum|donate|curriculum|sign in/i.test(title)) continue
      steps.push({ title })
    }

    const listRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
    let listMatch: RegExpExecArray | null
    while ((listMatch = listRegex.exec(block)) != null) {
      const text = stripTags(listMatch[1] || "")
      if (!text || text.length < 3) continue
      if (/privacy|cookie|forum|donate|curriculum|sign in/i.test(text)) continue
      steps.push({ title: text })
    }
  }

  return {
    source: "freecodecamp" as const,
    title: extractTitle(html, pageUrl),
    steps: cleanAndDedupe(steps),
  }
}
