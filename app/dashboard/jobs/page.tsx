"use client"

import { useState, type SVGProps } from "react"
import { motion } from "framer-motion"
import { MapPin, Building2, Calendar, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useDashboard, type JobStatus } from "@/app/dashboard/providers"
import { AddJobModal } from "@/components/dashboard/AddJobModal"
import { Select } from "@/components/ui/select"



export default function JobsPage() {
  const { jobs, updateJobStatus, removeJob } = useDashboard()
  const [filter, setFilter] = useState("all")
  const [query, setQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filter === "all" ? true : job.status === filter
    const q = query.trim().toLowerCase()
    const matchesQuery = !q
      ? true
      : `${job.role} ${job.company} ${job.location}`.toLowerCase().includes(q)
    return matchesStatus && matchesQuery
  })

  // Calculate stats
  const stats = {
      applied: jobs.filter(j => j.status === 'applied').length,
      interview: jobs.filter(j => j.status === 'interview').length,
      offer: jobs.filter(j => j.status === 'offer').length,
      rejected: jobs.filter(j => j.status === 'rejected').length,
      total: jobs.length
  }

  return (
    <div className="space-y-8">
       <AddJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

       <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
            <p className="text-muted-foreground">Track and manage your career opportunities</p>
        </div>
        <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" /> Add New
            </Button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
            { label: "Total Applied", value: stats.total, color: "text-foreground" },
            { label: "Interviews", value: stats.interview, color: "text-blue-500" },
            { label: "Offers", value: stats.offer, color: "text-green-500" },
            { label: "Rejected", value: stats.rejected, color: "text-red-500" },
        ].map((stat, i) => (
            <Card key={i}>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                     <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-accent/30 flex items-center gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Search applications..." 
                    className="w-full bg-background rounded-md pl-9 pr-4 py-2 text-sm border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
             </div>
             <select 
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
             >
                <option value="all">All Status</option>
                <option value="interview">Interviewing</option>
                <option value="applied">Applied</option>
                <option value="offer">Has Offer</option>
                <option value="rejected">Rejected</option>
             </select>
        </div>

        <div className="divide-y divide-border">
            {filteredJobs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    No applications found. Start applying!
                </div>
            ) : (
                filteredJobs.map((app, index) => (
                <motion.div 
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-accent/30 transition-colors group"
                >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {app.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex md:items-center flex-col md:flex-row gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{app.role}</h3>
                            <StatusBadge status={app.status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" /> {app.company}
                            </span>
                             <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> {app.location}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-3 mt-4 md:mt-0">
                        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-accent/50 px-2 py-1 rounded-md">
                            <Calendar className="h-3 w-3" /> {app.date}
                        </span>
                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <Select
                            className="h-9 w-[140px]"
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
                            className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
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
            )))}
        </div>
      </div>
    </div>
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
        rejected: "Rejected"
    }

    const style = styles[status]
    const label = labels[status]

    return (
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide", style)}>
            {label}
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
