import { NextResponse } from "next/server"
import { skillRecommendationsCatalog } from "../../../../lib/skills/recommendations-catalog"

function inferTrendLabel(baseLabel: string, mentionCount: number) {
  if (mentionCount >= 5) return "Surging"
  if (mentionCount >= 3) return "High Growth"
  if (mentionCount >= 2) return "Growing"
  return baseLabel
}

function countMentions(title: string, tags: string[]) {
  const normalizedTitle = title.toLowerCase()
  return tags.reduce((acc, tag) => {
    const needle = tag.toLowerCase()
    if (needle.length < 3) return acc
    return normalizedTitle.includes(needle) ? acc + 1 : acc
  }, 0)
}

async function loadTopTechTitles() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1500)

  try {
    const topRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
      next: { revalidate: 600 },
      signal: controller.signal,
    })

    if (!topRes.ok) return [] as string[]

    const ids = ((await topRes.json()) as number[]).slice(0, 30)

    const items = await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            next: { revalidate: 600 },
            signal: controller.signal,
          })
          if (!res.ok) return null
          const payload = (await res.json()) as { title?: string; type?: string } | null
          if (!payload || payload.type !== "story" || !payload.title) return null
          return payload.title
        } catch {
          return null
        }
      })
    )

    return items.filter((item): item is string => typeof item === "string")
  } catch {
    return [] as string[]
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  const titles = await loadTopTechTitles()

  const tracks = skillRecommendationsCatalog.map((track) => {
    if (titles.length === 0) return track

    const mentionCount = titles.reduce((acc, title) => acc + countMentions(title, track.tags), 0)

    return {
      ...track,
      trendLabel: inferTrendLabel(track.trendLabel, mentionCount),
    }
  })

  return NextResponse.json({
    source: "api",
    generatedAt: new Date().toISOString(),
    tracks,
  })
}

