import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  detectRoadmapSource,
  parseRoadmapSh,
  parseW3Schools,
  type RoadmapImportSource,
} from "@/lib/roadmap-import/parsers"

const importSchema = z.object({
  url: z.string().url(),
  source: z.enum(["auto", "w3schools", "roadmapsh"]).optional().default("auto"),
})

const MAX_HTML_BYTES = 1_200_000
const FETCH_TIMEOUT_MS = 10_000

function resolveSource(url: URL, source: "auto" | RoadmapImportSource) {
  if (source !== "auto") {
    return source
  }
  return detectRoadmapSource(url)
}

async function fetchHtml(url: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "MapMonetRoadmapImporter/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch page (${response.status})`)
    }

    const html = await response.text()
    if (html.length > MAX_HTML_BYTES) {
      throw new Error("Page is too large to import")
    }

    return html
  } finally {
    clearTimeout(timeout)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = importSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid import payload" }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(parsed.data.url)
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  const source = resolveSource(parsedUrl, parsed.data.source)
  if (!source) {
    return NextResponse.json(
      { error: "Unsupported source. Please use W3Schools or roadmap.sh URLs." },
      { status: 400 }
    )
  }

  try {
    const html = await fetchHtml(parsedUrl.toString())
    const result = source === "w3schools"
      ? parseW3Schools(html, parsedUrl.toString())
      : parseRoadmapSh(html, parsedUrl.toString())

    if (result.steps.length === 0) {
      return NextResponse.json(
        { error: "No roadmap steps found on this page." },
        { status: 422 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to import roadmap from this URL"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
