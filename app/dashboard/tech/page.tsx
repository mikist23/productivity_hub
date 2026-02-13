"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, RefreshCcw, Search, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/app/dashboard/providers"
import { buildCategorySearchUrl, opportunityPlatforms, techCategories } from "@/lib/tech/discovery-config"
import type {
  TechCategoryHighlight,
  TechCategoryId,
  TechFeedResponse,
  TechFilterState,
  TechStory,
} from "@/lib/tech/types"

const categoryLabelMap = new Map(techCategories.map((category) => [category.id, category.label]))

function toTimeText(unixTs: number | null) {
  if (unixTs == null) return "-"
  return new Date(unixTs * 1000).toLocaleString()
}

function getStoryLink(story: TechStory) {
  return story.url ?? `https://news.ycombinator.com/item?id=${story.id}`
}

function extractSkillText(skills: ReturnType<typeof useDashboard>["skills"]) {
  return skills
    .flatMap((category) =>
      category.items
        .filter((item) => item.status === "learning" || item.status === "inprogress")
        .map((item) => `${item.name} ${category.category}`.toLowerCase())
    )
    .join(" ")
}

function calculateCategoryBoost(skillText: string, categoryKeywords: string[]) {
  if (!skillText) return 0
  return categoryKeywords.reduce((acc, keyword) => {
    return skillText.includes(keyword.toLowerCase()) ? acc + 1 : acc
  }, 0)
}

export default function TechPage() {
  const { skills } = useDashboard()
  const [feed, setFeed] = useState<TechFeedResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TechFilterState>({
    query: "",
    category: "all",
    sourceType: "all",
  })

  const fetchFeed = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/tech/feed")
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const json = (await res.json()) as TechFeedResponse
      setFeed(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch tech feed.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed()
  }, [])

  const skillText = useMemo(() => extractSkillText(skills), [skills])

  const personalizationBoosts = useMemo(() => {
    const boosts = new Map<TechCategoryId, number>()
    for (const category of techCategories) {
      boosts.set(category.id, calculateCategoryBoost(skillText, category.keywords))
    }
    return boosts
  }, [skillText])

  const filteredTopStories = useMemo(() => {
    const allStories = feed?.topStories ?? []
    const q = filters.query.trim().toLowerCase()
    return allStories.filter((story) => {
      const matchesQuery = q.length === 0 ? true : story.title.toLowerCase().includes(q)
      const matchesCategory =
        filters.category === "all" ? true : story.categories.includes(filters.category)
      return matchesQuery && matchesCategory
    })
  }, [feed, filters.category, filters.query])

  const orderedCategoryHighlights = useMemo(() => {
    const highlightsById = new Map<TechCategoryId, TechCategoryHighlight>(
      (feed?.categoryHighlights ?? []).map((highlight) => [highlight.categoryId, highlight])
    )

    const ranked = techCategories.map((category) => {
      const base = highlightsById.get(category.id)
      const storyCount = base?.storyCount ?? 0
      const boost = personalizationBoosts.get(category.id) ?? 0
      return {
        category,
        highlight:
          base ??
          ({
            categoryId: category.id,
            trendLabel: "Cooling",
            storyCount: 0,
            stories: [],
          } satisfies TechCategoryHighlight),
        score: storyCount * 2 + boost,
        boost,
      }
    })

    const filtered = ranked.filter((entry) =>
      filters.category === "all" ? true : entry.category.id === filters.category
    )

    return filtered.sort((a, b) => b.score - a.score)
  }, [feed, filters.category, personalizationBoosts])

  const trendSummaryLabels = useMemo(() => {
    const summary = feed?.trendSummary
    const toLabels = (ids: TechCategoryId[]) => ids.map((id) => categoryLabelMap.get(id) ?? id)
    return {
      evolving: toLabels(summary?.evolving ?? []),
      fading: toLabels(summary?.fading ?? []),
      emerging: toLabels(summary?.emerging ?? []),
      demanded: toLabels(summary?.demanded ?? []),
    }
  }, [feed])

  const generatedAtText = feed?.generatedAt ? new Date(feed.generatedAt).toLocaleString() : "-"
  const showStories = filters.sourceType === "all" || filters.sourceType === "stories"
  const showDocs = filters.sourceType === "all" || filters.sourceType === "docs"
  const showOpportunities = filters.sourceType === "all" || filters.sourceType === "opportunities"

  return (
    <div className="space-y-8 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tech Intelligence</h1>
        <p className="text-muted-foreground">
          Stay current with what is evolving, emerging, and in demand across the tech landscape.
        </p>
      </motion.div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">Last updated: {generatedAtText}</div>
            <Button variant="outline" size="sm" onClick={fetchFeed} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" /> {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={filters.query}
                onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
                placeholder="Search stories, topics, releases..."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All" },
                { id: "stories", label: "Stories" },
                { id: "docs", label: "Docs" },
                { id: "opportunities", label: "Opportunities" },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      sourceType: type.id as TechFilterState["sourceType"],
                    }))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    filters.sourceType === type.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, category: "all" }))}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                filters.category === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              All Categories
            </button>
            {techCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, category: category.id }))}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  filters.category === category.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-border bg-accent/20 p-3 text-sm text-muted-foreground">
          {error}. Showing curated categories and links.
        </div>
      )}

      {showStories && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" /> Top Trending Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTopStories.length === 0 ? (
              <div className="py-8 text-sm text-muted-foreground">No stories match your filters.</div>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border">
                {filteredTopStories.slice(0, 18).map((story) => (
                  <div key={story.id} className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={getStoryLink(story)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="min-w-0 font-semibold leading-tight underline-offset-4 hover:underline"
                      >
                        {story.title}
                      </a>
                      <a href={getStoryLink(story)} target="_blank" rel="noreferrer noopener" className="shrink-0">
                        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open link">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{toTimeText(story.time)}</span>
                      {story.by && <span>| by {story.by}</span>}
                      {story.score != null && <span>| {story.score} points</span>}
                      {story.comments != null && <span>| {story.comments} comments</span>}
                      <TrendChip label={story.trendLabel} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(showStories || showDocs) && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderedCategoryHighlights.map((entry) => (
            <Card key={entry.category.id} className="overflow-hidden">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{entry.category.label}</CardTitle>
                    <p className="text-xs text-muted-foreground">{entry.category.description}</p>
                  </div>
                  {entry.boost > 0 && (
                    <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
                      Recommended for you
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <TrendChip label={entry.highlight.trendLabel} />
                  <span className="text-muted-foreground">{entry.highlight.storyCount} highlights</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {showStories && (
                  <div className="space-y-2">
                    {entry.highlight.stories.slice(0, 4).map((story) => (
                      <a
                        key={story.id}
                        href={getStoryLink(story)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="block rounded-md border border-border/80 p-2 text-sm hover:bg-accent/30"
                      >
                        {story.title}
                      </a>
                    ))}
                    {entry.highlight.stories.length === 0 && (
                      <div className="rounded-md border border-dashed border-border p-2 text-xs text-muted-foreground">
                        No live stories right now. Use source links below.
                      </div>
                    )}
                  </div>
                )}
                {showDocs && (
                  <div className="space-y-2">
                    {entry.category.sources.map((source) => (
                      <div key={source.id} className="flex items-center justify-between gap-2 rounded-md border border-border/80 p-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{source.label}</p>
                          <p className="text-xs text-muted-foreground">{source.provider}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <a href={source.href} target="_blank" rel="noreferrer noopener">
                            <Button variant="outline" size="sm">
                              Open
                            </Button>
                          </a>
                          <a
                            href={buildCategorySearchUrl(source, {
                              topic: entry.category.label,
                              query: filters.query,
                              dateRange: "week",
                            })}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open search">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showOpportunities && (
        <Card>
          <CardHeader>
            <CardTitle>Where to Execute</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {opportunityPlatforms.map((platform) => (
              <div key={platform.id} className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">{platform.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{platform.description}</p>
                <a href={platform.href} target="_blank" rel="noreferrer noopener" className="mt-3 inline-block">
                  <Button variant="outline" size="sm">
                    Open Platform <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TrendChip({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        label === "In Demand" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
        label === "Growing" && "bg-blue-500/15 text-blue-600 dark:text-blue-300",
        label === "Emerging" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        label === "Cooling" && "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300"
      )}
    >
      {label}
    </span>
  )
}

function TrendList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-xs text-muted-foreground">No strong signal right now.</span>
        ) : (
          items.map((item) => (
            <span
              key={`${title}-${item}`}
              className="rounded-full border border-border/80 bg-accent/40 px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  )
}
