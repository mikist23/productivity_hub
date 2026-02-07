"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, RefreshCcw, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type TechStory = {
  id: number
  title: string
  url: string | null
  by: string | null
  time: number | null
  score: number | null
  comments: number | null
}

export default function TechPage() {
  const [stories, setStories] = useState<TechStory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const fetchStories = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/tech/top")
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const json = (await res.json()) as TechStory[]
      setStories(Array.isArray(json) ? json : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch tech updates.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return stories
    return stories.filter((s) => s.title.toLowerCase().includes(q))
  }, [query, stories])

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tech Updates</h1>
        <p className="text-muted-foreground">
          A free feed of top Hacker News stories to keep your knowledge fresh.
        </p>
      </motion.div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Top stories
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchStories} disabled={loading}>
              <RefreshCcw className="h-4 w-4 mr-2" /> {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>

          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles…"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {error && (
            <div className="rounded-lg border border-border bg-accent/20 p-3 text-sm text-muted-foreground">
              {error}
            </div>
          )}

          {filtered.length === 0 && !loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No stories.</div>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {filtered.map((s) => {
                const link = s.url ?? `https://news.ycombinator.com/item?id=${s.id}`
                const timeText =
                  s.time != null ? new Date(s.time * 1000).toLocaleString() : "—"
                return (
                  <div key={s.id} className="p-4 bg-card hover:bg-accent/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold leading-tight underline-offset-4 hover:underline"
                        >
                          {s.title}
                        </a>
                        <div className="text-xs text-muted-foreground">
                          {timeText}
                          {s.by ? ` • by ${s.by}` : ""}
                          {s.score != null ? ` • ${s.score} points` : ""}
                          {s.comments != null ? ` • ${s.comments} comments` : ""}
                        </div>
                      </div>
                      <a href={link} target="_blank" rel="noreferrer" className="shrink-0">
                        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Open link">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
