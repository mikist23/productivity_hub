"use client"

import { useMemo, useState, type ReactNode, type SVGProps } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  useDashboard,
  type JobEmploymentType,
  type JobStatus,
  type JobWorkMode,
} from "@/app/dashboard/providers"
import { AddJobModal } from "@/components/dashboard/AddJobModal"
import {
  buildJobSearchUrl,
  jobCategories,
  jobSourceProviders,
  type JobDiscoveryProvider,
} from "@/lib/jobs/discovery-config"

type StatusFilter = "all" | JobStatus

function isRecentISODate(isoDate: string | undefined, days: number) {
  if (!isoDate) return false
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return false
  const now = Date.now()
  const delta = now - date.getTime()
  return delta >= 0 && delta <= days * 24 * 60 * 60 * 1000
}

function isTodayISODate(isoDate: string | undefined) {
  if (!isoDate) return false
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return false
  const now = new Date()
  return date.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
}

export default function JobsPage() {
  const { jobs, updateJobStatus, removeJob } = useDashboard()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [applicationsQuery, setApplicationsQuery] = useState("")

  const [selectedCategory, setSelectedCategory] = useState(jobCategories[0]?.label ?? "")
  const [discoveryQuery, setDiscoveryQuery] = useState("")
  const [discoveryLocation, setDiscoveryLocation] = useState("Worldwide")
  const [discoveryWorkMode, setDiscoveryWorkMode] = useState<JobWorkMode>("remote")
  const [discoveryEmploymentType, setDiscoveryEmploymentType] =
    useState<JobEmploymentType>("full-time")
  const [selectedProviderId, setSelectedProviderId] = useState(jobSourceProviders[0]?.id ?? "")

  const providerById = useMemo(() => {
    const map = new Map<string, JobDiscoveryProvider>()
    for (const provider of jobSourceProviders) {
      map.set(provider.id, provider)
    }
    return map
  }, [])

  const selectedProvider = providerById.get(selectedProviderId) ?? jobSourceProviders[0]

  const filteredJobs = useMemo(() => {
    const q = applicationsQuery.trim().toLowerCase()
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === "all" ? true : job.status === statusFilter
      const matchesQuery = !q
        ? true
        : `${job.role} ${job.company} ${job.location} ${job.category ?? ""} ${job.source ?? ""} ${job.notes ?? ""}`
            .toLowerCase()
            .includes(q)
      return matchesStatus && matchesQuery
    })
  }, [applicationsQuery, jobs, statusFilter])

  const stats = useMemo(() => {
    const applied = jobs.filter((j) => j.status === "applied").length
    const interview = jobs.filter((j) => j.status === "interview").length
    const offer = jobs.filter((j) => j.status === "offer").length
    const rejected = jobs.filter((j) => j.status === "rejected").length
    const total = jobs.length
    return {
      applied,
      interview,
      offer,
      rejected,
      total,
      interviewRate: total === 0 ? 0 : Math.round((interview / total) * 100),
      offerRate: total === 0 ? 0 : Math.round((offer / total) * 100),
    }
  }, [jobs])

  const quickTargets = useMemo(() => {
    const todayApplications = jobs.filter((j) => isTodayISODate(j.appliedAt)).length
    const weeklyInterviews = jobs.filter(
      (j) => j.status === "interview" && isRecentISODate(j.appliedAt, 7)
    ).length
    const pendingFollowUps = jobs.filter(
      (j) => Boolean(j.nextActionDate) && j.status !== "rejected"
    ).length
    return { todayApplications, weeklyInterviews, pendingFollowUps }
  }, [jobs])

  const discoveryCriteria = useMemo(
    () => ({
      query: discoveryQuery,
      category: selectedCategory,
      location: discoveryLocation,
      workMode: discoveryWorkMode,
      employmentType: discoveryEmploymentType,
    }),
    [discoveryEmploymentType, discoveryLocation, discoveryQuery, discoveryWorkMode, selectedCategory]
  )

  const recommendedSearches = useMemo(() => {
    const shortlist = [
      `${selectedCategory} ${discoveryQuery}`.trim(),
      `${discoveryWorkMode} ${selectedCategory}`.trim(),
      `${discoveryEmploymentType} ${selectedCategory}`.trim(),
      `entry level ${selectedCategory}`.trim(),
    ]
    return Array.from(new Set(shortlist.filter(Boolean))).slice(0, 4)
  }, [discoveryEmploymentType, discoveryQuery, discoveryWorkMode, selectedCategory])

  const openSearch = (provider: JobDiscoveryProvider, queryOverride?: string) => {
    const criteria = queryOverride
      ? {
          ...discoveryCriteria,
          query: queryOverride,
        }
      : discoveryCriteria
    const url = buildJobSearchUrl(provider, criteria)
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-8 pb-8">
      <AddJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
          <p className="text-muted-foreground">
            Discover opportunities, narrow your search, and track your job pipeline.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add New
        </Button>
      </motion.div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Discover Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {jobCategories.map((category) => {
              const selected = selectedCategory === category.label
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.label)
                    setDiscoveryQuery(category.query)
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {category.label}
                </button>
              )
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 lg:col-span-2">
              <label htmlFor="discovery-query" className="text-sm font-medium">
                Skills and Keywords
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="discovery-query"
                  placeholder="AI engineer, frontend React, accounting analyst..."
                  className="pl-9"
                  value={discoveryQuery}
                  onChange={(e) => setDiscoveryQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="discovery-location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="discovery-location"
                value={discoveryLocation}
                onChange={(e) => setDiscoveryLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="discovery-work-mode" className="text-sm font-medium">
                Work Mode
              </label>
              <Select
                id="discovery-work-mode"
                value={discoveryWorkMode}
                onChange={(e) => setDiscoveryWorkMode(e.target.value as JobWorkMode)}
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="discovery-employment" className="text-sm font-medium">
                Job Type
              </label>
              <Select
                id="discovery-employment"
                value={discoveryEmploymentType}
                onChange={(e) => setDiscoveryEmploymentType(e.target.value as JobEmploymentType)}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="discovery-source" className="text-sm font-medium">
                Preferred Source
              </label>
              <Select
                id="discovery-source"
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
              >
                {jobSourceProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => selectedProvider && openSearch(selectedProvider)}>
              Open {selectedProvider?.label ?? "Source"} Search
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                for (const provider of jobSourceProviders) {
                  openSearch(provider)
                }
              }}
            >
              Open All Sources
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Recommended Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recommendedSearches.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => selectedProvider && openSearch(selectedProvider, entry)}
                >
                  {entry}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        {[
          { label: "Total", value: stats.total, color: "text-foreground", col: "lg:col-span-1" },
          { label: "Applied", value: stats.applied, color: "text-zinc-500", col: "lg:col-span-1" },
          { label: "Interviews", value: stats.interview, color: "text-blue-500", col: "lg:col-span-1" },
          { label: "Offers", value: stats.offer, color: "text-green-500", col: "lg:col-span-1" },
          { label: "Rejected", value: stats.rejected, color: "text-red-500", col: "lg:col-span-1" },
          {
            label: "Interview Rate",
            value: `${stats.interviewRate}%`,
            color: "text-blue-500",
            col: "lg:col-span-1",
          },
          { label: "Offer Rate", value: `${stats.offerRate}%`, color: "text-green-500", col: "lg:col-span-1" },
        ].map((item) => (
          <Card key={item.label} className={item.col}>
            <CardContent className="flex h-full flex-col items-center justify-center p-4 text-center">
              <div className={cn("text-2xl font-bold", item.color)}>{item.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{item.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Your Pipeline</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-background p-4">
            <div className="text-sm text-muted-foreground">Today Applications</div>
            <div className="mt-1 text-2xl font-bold">{quickTargets.todayApplications}</div>
          </div>
          <div className="rounded-xl border border-border/70 bg-background p-4">
            <div className="text-sm text-muted-foreground">Interviews This Week</div>
            <div className="mt-1 text-2xl font-bold">{quickTargets.weeklyInterviews}</div>
          </div>
          <div className="rounded-xl border border-border/70 bg-background p-4">
            <div className="text-sm text-muted-foreground">Pending Follow-ups</div>
            <div className="mt-1 text-2xl font-bold">{quickTargets.pendingFollowUps}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Applications List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                className="pl-9"
                value={applicationsQuery}
                onChange={(e) => setApplicationsQuery(e.target.value)}
              />
            </div>
            <Select
              className="h-10 md:w-56"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="interview">Interviewing</option>
              <option value="offer">Offer Received</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>

          <div className="divide-y divide-border">
            {filteredJobs.length === 0 ? (
              <div className="space-y-3 p-10 text-center">
                <p className="text-muted-foreground">No applications found for these filters.</p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setApplicationsQuery("")}>
                    Clear Search
                  </Button>
                  <Button size="sm" onClick={() => setIsModalOpen(true)}>
                    Add New Application
                  </Button>
                </div>
              </div>
            ) : (
              filteredJobs.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                      {app.logo}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <h3 className="truncate text-base font-semibold">{app.role}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" /> {app.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {app.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {app.date}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {app.category && <MetaChip>{app.category}</MetaChip>}
                        {app.workMode && <MetaChip>{app.workMode}</MetaChip>}
                        {app.employmentType && <MetaChip>{app.employmentType}</MetaChip>}
                        {app.source && <MetaChip>{app.source}</MetaChip>}
                        {app.nextAction && <MetaChip>Next: {app.nextAction}</MetaChip>}
                        {app.nextActionDate && <MetaChip>By {app.nextActionDate}</MetaChip>}
                      </div>

                      {app.notes && <p className="text-sm text-muted-foreground">{app.notes}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      {app.sourceUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(app.sourceUrl, "_blank", "noopener,noreferrer")}
                        >
                          Apply Link <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Select
                        className="h-9 w-[148px]"
                        value={app.status}
                        onChange={(e) => updateJobStatus(app.id, e.target.value as JobStatus)}
                        aria-label="Update status"
                      >
                        <option value="applied">Applied</option>
                        <option value="interview">Interviewing</option>
                        <option value="offer">Offer Received</option>
                        <option value="rejected">Rejected</option>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          const ok = window.confirm(`Delete application: "${app.company}"?`)
                          if (!ok) return
                          removeJob(app.id)
                        }}
                        aria-label="Delete application"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border/80 bg-accent/40 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  )
}

function StatusBadge({ status }: { status: JobStatus }) {
  const styles: Record<JobStatus, string> = {
    applied: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    interview: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    offer: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    rejected: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  }
  const labels: Record<JobStatus, string> = {
    applied: "Applied",
    interview: "Interviewing",
    offer: "Offer Received",
    rejected: "Rejected",
  }
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  )
}

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
