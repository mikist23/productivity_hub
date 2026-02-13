import { NextResponse } from "next/server"
import { buildFallbackFeedResponse, buildTechFeedResponseFromItems, fetchHnTopStories } from "../../../../lib/tech/feed"

export async function GET() {
  try {
    const items = await fetchHnTopStories(30)
    const payload = buildTechFeedResponseFromItems(items)
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json(buildFallbackFeedResponse())
  }
}
