import { computeTrendLabel, scoreStoryForCategory, techCategories } from "./discovery-config"
import type {
  TechCategoryHighlight,
  TechCategoryId,
  TechFeedResponse,
  TechStory,
  TechTrendSummary,
} from "./types"

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

function toTechStory(item: HnItem): TechStory | null {
  if (!item.title || item.type !== "story") return null
  const categoryScores = techCategories
    .map((category) => ({ categoryId: category.id, score: scoreStoryForCategory(item.title!, category.keywords) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  const categories = categoryScores.slice(0, 3).map((entry) => entry.categoryId)
  const mentionCount = categoryScores.reduce((acc, entry) => acc + entry.score, 0)
  const recentHits =
    item.time && Date.now() - item.time * 1000 <= 24 * 60 * 60 * 1000 ? Math.max(1, categories.length) : 0
  const trendLabel = computeTrendLabel(mentionCount, recentHits)

  return {
    id: item.id,
    title: item.title,
    url: item.url ?? null,
    by: item.by ?? null,
    time: item.time ?? null,
    score: item.score ?? null,
    comments: item.descendants ?? null,
    categories: categories.length > 0 ? categories : ["startups-industry"],
    trendLabel,
  }
}

export function inferCategoriesForTitle(title: string): TechCategoryId[] {
  return techCategories
    .map((category) => ({ id: category.id, score: scoreStoryForCategory(title, category.keywords) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.id)
}

function buildTrendSummary(mentions: Map<TechCategoryId, number>, recency: Map<TechCategoryId, number>): TechTrendSummary {
  const entries = techCategories.map((category) => {
    const mentionCount = mentions.get(category.id) ?? 0
    const recentHits = recency.get(category.id) ?? 0
    return {
      categoryId: category.id,
      mentionCount,
      recentHits,
      trend: computeTrendLabel(mentionCount, recentHits),
    }
  })

  const demanded = [...entries]
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 4)
    .map((entry) => entry.categoryId)

  return {
    evolving: entries
      .filter((entry) => entry.trend === "Growing" || entry.trend === "In Demand")
      .map((entry) => entry.categoryId)
      .slice(0, 5),
    fading: entries
      .filter((entry) => entry.trend === "Cooling")
      .map((entry) => entry.categoryId)
      .slice(0, 5),
    emerging: entries
      .filter((entry) => entry.trend === "Emerging")
      .map((entry) => entry.categoryId)
      .slice(0, 5),
    demanded,
  }
}

function buildCategoryHighlights(topStories: TechStory[], mentions: Map<TechCategoryId, number>, recency: Map<TechCategoryId, number>) {
  return techCategories.map<TechCategoryHighlight>((category) => {
    const stories = topStories
      .filter((story) => story.categories.includes(category.id))
      .slice(0, 5)
    const mentionCount = mentions.get(category.id) ?? 0
    const recentHits = recency.get(category.id) ?? 0
    return {
      categoryId: category.id,
      trendLabel: computeTrendLabel(mentionCount, recentHits),
      storyCount: stories.length,
      stories,
    }
  })
}

export function buildFallbackFeedResponse(): TechFeedResponse {
  return {
    topStories: [],
    categoryHighlights: techCategories.map((category) => ({
      categoryId: category.id,
      trendLabel: "Cooling",
      storyCount: 0,
      stories: [],
    })),
    trendSummary: {
      evolving: [],
      fading: techCategories.map((category) => category.id).slice(0, 5),
      emerging: [],
      demanded: techCategories.map((category) => category.id).slice(0, 4),
    },
    generatedAt: new Date().toISOString(),
  }
}

export async function fetchHnTopStories(limit = 24) {
  const topRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
    next: { revalidate: 300 },
  })

  if (!topRes.ok) {
    throw new Error("Failed to fetch top stories")
  }

  const ids = (await topRes.json()) as number[]
  const topIds = (ids ?? []).slice(0, limit)

  const items = await Promise.all(
    topIds.map(async (id) => {
      const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        next: { revalidate: 300 },
      })
      if (!res.ok) return null
      const item = (await res.json()) as HnItem | null
      return item && item.type === "story" ? item : null
    })
  )

  return items.filter((item): item is HnItem => Boolean(item?.title))
}

export function buildTechFeedResponseFromItems(items: HnItem[]): TechFeedResponse {
  const stories = items
    .map((item) => toTechStory(item))
    .filter((item): item is TechStory => Boolean(item))
    .slice(0, 30)

  const mentions = new Map<TechCategoryId, number>()
  const recency = new Map<TechCategoryId, number>()

  for (const story of stories) {
    for (const categoryId of story.categories) {
      mentions.set(categoryId, (mentions.get(categoryId) ?? 0) + 1)
      const isRecent = story.time != null && Date.now() - story.time * 1000 <= 24 * 60 * 60 * 1000
      if (isRecent) {
        recency.set(categoryId, (recency.get(categoryId) ?? 0) + 1)
      }
    }
  }

  return {
    topStories: stories,
    categoryHighlights: buildCategoryHighlights(stories, mentions, recency),
    trendSummary: buildTrendSummary(mentions, recency),
    generatedAt: new Date().toISOString(),
  }
}
