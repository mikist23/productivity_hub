import { NextResponse } from "next/server"

type HnItem = {
  id: number
  title?: string
  url?: string
  by?: string
  time?: number
  score?: number
  descendants?: number
  type?: string
}

export async function GET() {
  const topRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
    next: { revalidate: 300 },
  })

  if (!topRes.ok) {
    return NextResponse.json({ error: "Failed to fetch top stories" }, { status: 502 })
  }

  const ids = (await topRes.json()) as number[]
  const topIds = (ids ?? []).slice(0, 24)

  const items = await Promise.all(
    topIds.map(async (id) => {
      const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        next: { revalidate: 300 },
      })
      if (!res.ok) return null
      const item = (await res.json()) as HnItem | null
      if (!item || item.type !== "story") return null
      if (!item.title) return null
      return item
    })
  )

  return NextResponse.json(
    items
      .filter(Boolean)
      .slice(0, 20)
      .map((item) => ({
        id: item!.id,
        title: item!.title,
        url: item!.url ?? null,
        by: item!.by ?? null,
        time: item!.time ?? null,
        score: item!.score ?? null,
        comments: item!.descendants ?? null,
      }))
  )
}

