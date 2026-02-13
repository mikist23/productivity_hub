"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { FileText, Pencil, Plus, Search, Sparkles, Trash2 } from "lucide-react"
import { useDashboard, type Post, type PostKind } from "@/app/dashboard/providers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { PostModal } from "@/components/dashboard/PostModal"

function kindTitle(kind: PostKind) {
  return kind === "blog" ? "Blog" : "Stories"
}

type PostDraft = Omit<Post, "id" | "createdAt" | "updatedAt">

const starterBlogPosts: PostDraft[] = [
  {
    kind: "blog",
    title: "Weekly Planning System That Actually Sticks",
    tags: ["planning", "systems", "weekly-review"],
    content:
      "Use this flow every Sunday:\n1) Review completed goals and tasks.\n2) Pick top 3 outcomes for the week.\n3) Time-block deep work first, meetings second.\n4) Define one fallback task per day for low-energy moments.\n\nAction block:\n- Schedule 30 minutes for weekly review today.\n- Write your top 3 outcomes.\n- Block the first 90-minute focus session for tomorrow.",
  },
  {
    kind: "blog",
    title: "Skill Growth Playbook: Learn, Build, Ship",
    tags: ["skills", "career", "learning"],
    content:
      "A practical loop for skill development:\n- Learn: 45 minutes from one high-quality resource.\n- Build: apply it in a mini project the same day.\n- Ship: publish notes or code to close the loop.\n\nAction block:\n- Select one skill goal from your dashboard.\n- Define one mini project with a 7-day deadline.\n- Publish one short progress note in Stories.",
  },
  {
    kind: "blog",
    title: "Energy Management for Deep Work Days",
    tags: ["focus", "health", "energy"],
    content:
      "Protect focus by managing energy, not just time.\n- Morning: light planning + hardest task first.\n- Midday: quick refuel and short walk.\n- Afternoon: admin tasks and communication.\n\nAction block:\n- Add one workday recipe for tomorrow.\n- Save one recharge location on the map.\n- Schedule two 90-minute focus blocks.",
  },
]

const starterStories: PostDraft[] = [
  {
    kind: "story",
    title: "Daily Win Template",
    tags: ["win", "accountability"],
    content:
      "Today I completed:\n- [Task/Goal]\nWhat helped me succeed:\n- [Habit/Tool/Location]\nWhat I will do next:\n- [Next action for tomorrow]",
  },
  {
    kind: "story",
    title: "Challenge and Fix Template",
    tags: ["lesson", "problem-solving"],
    content:
      "Challenge I faced:\n- [Describe blocker]\nHow I solved it:\n- [What changed]\nWhat I will repeat next time:\n- [New rule/process]",
  },
  {
    kind: "story",
    title: "Weekly Reflection Template",
    tags: ["weekly", "reflection", "growth"],
    content:
      "Biggest progress this week:\n- [Result]\nOne thing that slowed me down:\n- [Issue]\nPriority for next week:\n- [Top objective]",
  },
]

export function PostsPage({ kind }: { kind: PostKind }) {
  const { posts, addPost, updatePost, deletePost } = useDashboard()

  const [query, setQuery] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts
      .filter((p) => p.kind === kind)
      .filter((p) => {
        if (!q) return true
        const haystack = `${p.title} ${p.content} ${p.tags.join(" ")}`.toLowerCase()
        return haystack.includes(q)
      })
  }, [kind, posts, query])

  const active = useMemo(
    () => filtered.find((p) => p.id === activeId) ?? null,
    [activeId, filtered]
  )

  const editing = useMemo(() => {
    if (!editingId) return null
    const p = posts.find((x) => x.id === editingId && x.kind === kind)
    if (!p) return null
    return {
      title: p.title,
      content: p.content,
      tags: p.tags,
    }
  }, [editingId, kind, posts])

  const addInitial = useMemo(
    () => ({
      title: "",
      tags: [],
      content: "",
    }),
    []
  )

  const handleDelete = (id: string) => {
    const p = posts.find((x) => x.id === id)
    const ok = window.confirm(`Delete ${kind}${p ? `: "${p.title}"` : ""}?`)
    if (!ok) return
    deletePost(id)
    if (activeId === id) setActiveId(null)
  }

  const addStarterPack = () => {
    const existingTitles = new Set(
      posts
        .filter((p) => p.kind === kind)
        .map((p) => p.title.trim().toLowerCase())
    )

    const templates = kind === "blog" ? starterBlogPosts : starterStories
    templates.forEach((template) => {
      if (!existingTitles.has(template.title.trim().toLowerCase())) {
        addPost(template)
      }
    })
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{kindTitle(kind)}</h1>
        <p className="text-muted-foreground">
          {kind === "blog"
            ? "Write notes and posts about what you’re learning and building."
            : "Capture human stories, reflections, and lessons."}
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" /> {kindTitle(kind)}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={addStarterPack}>
                  <Sparkles className="h-4 w-4 mr-2" /> Templates
                </Button>
                <Button size="sm" onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> New
                </Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${kindTitle(kind).toLowerCase()}…`}
              />
            </div>
          </CardHeader>

          <CardContent>
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No {kindTitle(kind).toLowerCase()} yet. Use templates to bootstrap content.
              </div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-2">
                {filtered.map((p) => {
                  const isActive = p.id === activeId
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "rounded-lg border border-border p-3 bg-card hover:bg-accent/30 transition-colors cursor-pointer",
                        isActive && "border-primary/60 bg-accent/40"
                      )}
                      onClick={() => setActiveId(p.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setActiveId(p.id)
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{p.title}</div>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            Updated {new Date(p.updatedAt).toLocaleString()}
                          </div>
                          {p.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {p.tags.slice(0, 4).map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingId(p.id)
                            }}
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(p.id)
                            }}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!active ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Select an item to view it.
              </div>
            ) : (
              <PostDetails post={active} onEdit={() => setEditingId(active.id)} />
            )}
          </CardContent>
        </Card>
      </div>

      {isAddOpen && (
        <PostModal
          isOpen
          onClose={() => setIsAddOpen(false)}
          mode="add"
          kind={kind}
          initial={addInitial}
          onSave={(draft) => addPost(draft)}
        />
      )}

      {editingId && editing && (
        <PostModal
          isOpen
          onClose={() => setEditingId(null)}
          mode="edit"
          kind={kind}
          initial={editing}
          onSave={(draft) => updatePost(editingId, draft)}
        />
      )}
    </div>
  )
}

function PostDetails({ post, onEdit }: { post: Post; onEdit: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-2xl font-bold tracking-tight">{post.title}</div>
          <div className="text-sm text-muted-foreground">
            Created {new Date(post.createdAt).toLocaleString()} • Updated{" "}
            {new Date(post.updatedAt).toLocaleString()}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" /> Edit
        </Button>
      </div>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full border border-border">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-accent/10 p-4">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{post.content}</pre>
      </div>
    </div>
  )
}
