"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  ChevronRight,
  Code,
  ExternalLink,
  Filter,
  Flame,
  GraduationCap,
  Plus,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/app/dashboard/providers"
import { AddSkillModal } from "@/components/dashboard/AddSkillModal"
import { SkillDetailsModal } from "@/components/dashboard/SkillDetailsModal"
import { AuthPromptModal } from "@/components/dashboard/AuthPromptModal"
import { useGuardedAction } from "@/components/dashboard/useGuardedAction"
import { recommendationDomains, skillRecommendationsCatalog } from "@/lib/skills/recommendations-catalog"
import { rankSkillRecommendations, recommendationToSkillPrefill } from "@/lib/skills/recommendation-engine"
import type { RecommendationSort, SkillTrackRecommendation, UserSkillSignal } from "@/lib/skills/types"

type DomainFilter = (typeof recommendationDomains)[number]
type ResourceSection = "officialDocs" | "youtubeChannels" | "labsHandsOn" | "roadmaps" | "blogsAndGuides" | "projectIdeas"

const sortOptions: Array<{ value: RecommendationSort; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "demand", label: "Demand" },
  { value: "beginner", label: "Beginner-friendly" },
]

const resourceLabels: Record<ResourceSection, string> = {
  officialDocs: "Official Docs",
  youtubeChannels: "YouTube",
  labsHandsOn: "Labs",
  roadmaps: "Roadmaps",
  blogsAndGuides: "Guides",
  projectIdeas: "Projects",
}

interface RecommendationApiResponse {
  source: "api"
  generatedAt: string
  tracks: SkillTrackRecommendation[]
}

export default function SkillsPage() {
  const { skills, isDashboardHydrating } = useDashboard()
  const { guard, authPrompt } = useGuardedAction("/dashboard/skills")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeSkillRef, setActiveSkillRef] = useState<{ categoryId: string; skillId: string } | null>(null)
  const [modalPrefill, setModalPrefill] = useState<{
    initialCategory?: string
    initialName?: string
    initialLevel?: string
    initialStatus?: "learning" | "inprogress" | "mastered"
    initialProgress?: number
  }>({})

  const [tracks, setTracks] = useState<SkillTrackRecommendation[]>(skillRecommendationsCatalog)
  const [trackSource, setTrackSource] = useState<"api" | "local_fallback">("local_fallback")
  const [isLoadingTracks, setIsLoadingTracks] = useState(true)
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("All")
  const [sortBy, setSortBy] = useState<RecommendationSort>("recommended")
  const [selectedTrackId, setSelectedTrackId] = useState("")
  const [resourceSection, setResourceSection] = useState<ResourceSection>("officialDocs")

  useEffect(() => {
    const controller = new AbortController()

    const loadTracks = async () => {
      try {
        const res = await fetch("/api/skills/recommendations", {
          credentials: "same-origin",
          signal: controller.signal,
        })

        if (!res.ok) throw new Error("Failed to load track recommendations")

        const data = (await res.json()) as RecommendationApiResponse
        if (!Array.isArray(data.tracks) || data.tracks.length === 0) {
          throw new Error("No tracks returned")
        }

        setTracks(data.tracks)
        setTrackSource("api")
      } catch {
        setTracks(skillRecommendationsCatalog)
        setTrackSource("local_fallback")
      } finally {
        setIsLoadingTracks(false)
      }
    }

    loadTracks()

    return () => {
      controller.abort()
    }
  }, [])

  const userSkillSignals = useMemo<UserSkillSignal[]>(() => {
    return skills.flatMap((category) =>
      category.items.map((item) => ({
        name: item.name,
        category: category.category,
        status: item.status,
      }))
    )
  }, [skills])

  const rankedTracks = useMemo(() => {
    return rankSkillRecommendations(tracks, userSkillSignals, {
      domain: domainFilter,
      sortBy,
    })
  }, [domainFilter, sortBy, tracks, userSkillSignals])

  useEffect(() => {
    if (rankedTracks.length === 0) {
      setSelectedTrackId("")
      return
    }

    const exists = rankedTracks.some((track) => track.id === selectedTrackId)
    if (!exists) {
      setSelectedTrackId(rankedTracks[0].id)
    }
  }, [rankedTracks, selectedTrackId])

  const selectedTrack = useMemo(
    () => rankedTracks.find((track) => track.id === selectedTrackId) ?? rankedTracks[0] ?? null,
    [rankedTracks, selectedTrackId]
  )

  const currentSkillData = (() => {
    for (const category of skills) {
      const skill = category.items.find((s) => s.status === "learning")
      if (skill) return { category, skill }
    }
    return null
  })()

  const activeSkillData = (() => {
    if (!activeSkillRef) return null
    const category = skills.find((c) => c.id === activeSkillRef.categoryId)
    const skill = category?.items.find((s) => s.id === activeSkillRef.skillId)
    if (!category || !skill) return null
    return { category, skill }
  })()

  const currentSkill = currentSkillData?.skill ?? {
    name: "Nothing right now",
    progress: 0,
    level: "Start learning!",
  }

  const handleOpenAddSkill = () => {
    guard("add skills", () => {
      setModalPrefill({})
      setIsModalOpen(true)
    })
  }

  const handleAddTrackToSkills = () => {
    if (!selectedTrack) return
    guard("add skills", () => {
      setModalPrefill(recommendationToSkillPrefill(selectedTrack))
      setIsModalOpen(true)
    })
  }

  const openPrimaryRoadmap = () => {
    const url = selectedTrack?.resources.roadmaps[0]?.url
    if (url) window.open(url, "_blank", "noopener,noreferrer")
  }

  const openPrimaryLab = () => {
    const url = selectedTrack?.resources.labsHandsOn[0]?.url
    if (url) window.open(url, "_blank", "noopener,noreferrer")
  }

  if (isDashboardHydrating) {
    return (
      <div className="space-y-6">
        <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 rounded-xl bg-muted/40 animate-pulse" />
          <div className="h-80 rounded-xl bg-muted/40 animate-pulse" />
        </div>
        <div className="h-96 rounded-xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AddSkillModal
        key={`${isModalOpen ? "open" : "closed"}:${modalPrefill.initialCategory ?? ""}:${modalPrefill.initialName ?? ""}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCategory={modalPrefill.initialCategory}
        initialName={modalPrefill.initialName}
        initialLevel={modalPrefill.initialLevel}
        initialStatus={modalPrefill.initialStatus}
        initialProgress={modalPrefill.initialProgress}
      />
      {activeSkillData && (
        <SkillDetailsModal
          isOpen={activeSkillRef !== null}
          onClose={() => setActiveSkillRef(null)}
          categoryId={activeSkillData.category.id}
          categoryName={activeSkillData.category.category}
          skill={activeSkillData.skill}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills Development</h1>
          <p className="text-muted-foreground">Track your learning journey, discover in-demand tech paths, and start shipping faster.</p>
        </div>
        <Button onClick={handleOpenAddSkill}>
          <Plus className="mr-2 h-4 w-4" /> Add Skill
        </Button>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <BookOpen className="h-5 w-5" /> Current Focus
          </h2>
          <Card className="border-none bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Currently Learning</span>
                  <h3 className="mt-1 text-2xl font-bold">{currentSkill.name}</h3>
                </div>
                <Code className="h-8 w-8 opacity-50" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{currentSkill.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-primary-foreground/20">
                  <div className="h-full bg-primary-foreground transition-all duration-1000" style={{ width: `${currentSkill.progress}%` }} />
                </div>
              </div>
              <Button
                variant="secondary"
                className="mt-6 w-full"
                onClick={() => {
                  if (currentSkillData) {
                    setActiveSkillRef({ categoryId: currentSkillData.category.id, skillId: currentSkillData.skill.id })
                  } else {
                    handleOpenAddSkill()
                  }
                }}
              >
                Continue Learning <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Up Next</h3>
            {skills
              .flatMap((c) => c.items)
              .filter((s) => s.status === "learning" && s.id !== currentSkillData?.skill.id)
              .slice(0, 2)
              .map((skill) => {
                const category = skills.find((c) => c.items.some((item) => item.id === skill.id))
                return (
                  <Card
                    key={skill.id}
                    className="cursor-pointer transition-colors hover:bg-accent/50"
                    onClick={() => {
                      if (!category) return
                      setActiveSkillRef({ categoryId: category.id, skillId: skill.id })
                    }}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                        <Code className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{skill.name}</h4>
                        <p className="text-xs text-muted-foreground">{skill.level}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Trophy className="h-5 w-5" /> Mastery & Progress
          </h2>
          <div className="space-y-6">
            {skills.map((category, idx) => (
              <motion.div key={category.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">{category.category}</h3>
                <div className="grid gap-3">
                  {category.items.map((skill) => (
                    <div
                      key={skill.id}
                      className="cursor-pointer rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/30"
                      onClick={() => setActiveSkillRef({ categoryId: category.id, skillId: skill.id })}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-xs text-muted-foreground">{skill.level}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-accent">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            skill.status === "mastered" && "bg-green-500",
                            skill.status === "inprogress" && "bg-amber-500",
                            skill.status === "learning" && "bg-blue-500"
                          )}
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>
                      {skill.progress >= 90 && <Star className="mt-2 h-4 w-4 fill-yellow-500 text-yellow-500" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Card className="border border-slate-700/40 bg-gradient-to-br from-slate-900/80 via-slate-900/65 to-slate-950/80 text-slate-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-emerald-300" />
            In-Demand Tech Skills Hub
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-200">
              {trackSource === "api" ? "Live recommendations" : "Local fallback"}
            </span>
          </CardTitle>
          <p className="text-sm text-slate-300">
            Personalized tracks based on your current skills, with deep roadmaps and vetted learning resources.
          </p>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">
                <Filter className="h-4 w-4" /> Filters
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendationDomains.map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => setDomainFilter(domain)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition",
                      domainFilter === domain
                        ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200"
                        : "border-slate-600/80 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                    )}
                  >
                    {domain}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition",
                      sortBy === option.value
                        ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-200"
                        : "border-slate-600/80 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {isLoadingTracks && (
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3 text-sm text-slate-300">Loading recommendations...</div>
              )}
              {rankedTracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setSelectedTrackId(track.id)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition",
                    selectedTrack?.id === track.id
                      ? "border-emerald-400/70 bg-emerald-500/10"
                      : "border-slate-700/70 bg-slate-900/50 hover:border-slate-500"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{track.title}</div>
                      <div className="mt-1 text-xs text-slate-400">{track.domain} · {track.difficulty} · {track.estimatedMonths} months</div>
                    </div>
                    <span className="rounded-full border border-orange-400/50 bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-200">
                      {track.demandScore}/100
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-300">{track.whyNow}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {track.reasons.slice(0, 2).map((reason) => (
                      <span key={reason} className="rounded-full border border-slate-600/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                        {reason.replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-4 lg:col-span-7">
            {selectedTrack ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-emerald-300" />
                      <h3 className="text-xl font-semibold text-white">{selectedTrack.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{selectedTrack.summary}</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                    {selectedTrack.trendLabel}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 p-3">
                    <div className="text-xs text-slate-400">Demand</div>
                    <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-white">
                      <Flame className="h-4 w-4 text-orange-300" /> {selectedTrack.demandScore}/100
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 p-3">
                    <div className="text-xs text-slate-400">Difficulty</div>
                    <div className="mt-1 text-sm font-semibold text-white">{selectedTrack.difficulty}</div>
                  </div>
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/80 p-3">
                    <div className="text-xs text-slate-400">Time to Learn</div>
                    <div className="mt-1 text-sm font-semibold text-white">~{selectedTrack.estimatedMonths} months</div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <GraduationCap className="h-4 w-4 text-cyan-300" /> Roadmap Milestones
                  </h4>
                  <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                    {selectedTrack.roadmapMilestones.map((step, index) => (
                      <div key={step} className="flex items-start gap-2 rounded-lg border border-slate-700/70 bg-slate-950/70 p-2 text-sm text-slate-200">
                        <span className="mt-0.5 rounded-full border border-slate-500/80 px-2 text-[11px] text-slate-300">{index + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <Target className="h-4 w-4 text-emerald-300" /> Learning Resources
                  </h4>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(Object.keys(resourceLabels) as ResourceSection[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setResourceSection(key)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs transition",
                          resourceSection === key
                            ? "border-emerald-400/70 bg-emerald-500/15 text-emerald-200"
                            : "border-slate-600/70 bg-slate-800/60 text-slate-300 hover:border-slate-500"
                        )}
                      >
                        {resourceLabels[key]}
                      </button>
                    ))}
                  </div>

                  {resourceSection === "projectIdeas" ? (
                    <div className="space-y-2">
                      {selectedTrack.resources.projectIdeas.map((idea) => (
                        <div key={idea} className="rounded-lg border border-slate-700/70 bg-slate-950/70 p-3 text-sm text-slate-200">
                          {idea}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTrack.resources[resourceSection].map((resource) => (
                        <a
                          key={resource.url}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-950/70 p-3 text-sm text-slate-200 transition hover:border-slate-500"
                        >
                          <div>
                            <div className="font-medium">{resource.title}</div>
                            <div className="text-xs text-slate-400">{resource.provider}</div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-cyan-300" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button onClick={handleAddTrackToSkills} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-1 h-4 w-4" /> Add to My Skills
                  </Button>
                  <Button variant="outline" className="border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800" onClick={openPrimaryRoadmap}>
                    Open Roadmap <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800" onClick={openPrimaryLab}>
                    Open Learning Lab <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-700/70 bg-slate-950/70 p-6 text-sm text-slate-300">
                No recommendation matched this filter. Try another domain or sort option.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {skills.length === 0 && (
        <Card className="border border-slate-700/40 bg-slate-900/50 text-slate-200">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <Star className="mt-0.5 h-4 w-4 text-yellow-300" />
            <div>
              Start with foundation tracks like Backend API Engineering, AI Engineering Fundamentals, or Next.js Full-Stack Apps,
              then use <span className="font-semibold">Add to My Skills</span> to build your learning roadmap.
            </div>
          </CardContent>
        </Card>
      )}
      <AuthPromptModal
        isOpen={authPrompt.isOpen}
        onClose={authPrompt.closePrompt}
        action={authPrompt.action}
        nextPath={authPrompt.nextPath}
      />
    </div>
  )
}

