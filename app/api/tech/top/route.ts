import { NextResponse } from "next/server"
import { fetchHnTopStories } from "../../../../lib/tech/feed"

export async function GET() {
  try {
    const items = await fetchHnTopStories(24)

    return NextResponse.json(
      items.slice(0, 20).map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url ?? null,
        by: item.by ?? null,
        time: item.time ?? null,
        score: item.score ?? null,
        comments: item.descendants ?? null,
      }))
    )
  } catch {
    return NextResponse.json({ error: "Failed to fetch top stories" }, { status: 502 })
  }
}
