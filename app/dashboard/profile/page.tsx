"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Save, User, Mail, Phone, MapPin, Globe, Link2, Github, FileText, Printer, CalendarDays, Flame, Target } from "lucide-react"
import { useDashboard } from "@/app/dashboard/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { AuthPromptModal } from "@/components/dashboard/AuthPromptModal"
import { useGuardedAction } from "@/components/dashboard/useGuardedAction"

type ReportPeriod = "week" | "month"

function formatMinutes(totalMinutes: number) {
  const hrs = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (hrs <= 0) return `${mins}m`
  if (mins <= 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

export default function ProfilePage() {
  const {
    userProfile,
    updateUserProfile,
    tasks,
    focusSessions,
    goals,
    focusStreaks,
    goalStreaks,
    productivityInsights,
  } = useDashboard()
  const { guard, authPrompt } = useGuardedAction("/dashboard/profile")

  const [formData, setFormData] = useState(userProfile)
  const [isSaved, setIsSaved] = useState(false)
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("week")
  const [reportGeneratedAt, setReportGeneratedAt] = useState(new Date())

  useEffect(() => {
    setFormData(userProfile)
  }, [userProfile])

  const profileCompleteness = useMemo(() => {
    const checks = [
      formData.name,
      formData.role,
      formData.bio,
      formData.email,
      formData.location,
      formData.timezone,
      formData.topFocusArea,
    ]
    const completed = checks.filter((value) => value.trim().length > 0).length
    return Math.round((completed / checks.length) * 100)
  }, [formData])

  const reportMetrics = useMemo(() => {
    const days = reportPeriod === "week" ? 7 : 30
    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    start.setDate(now.getDate() - (days - 1))

    const sessionsInPeriod = focusSessions.filter((session) => {
      const sessionDate = new Date(`${session.date}T00:00:00`)
      return !Number.isNaN(sessionDate.getTime()) && sessionDate >= start && sessionDate <= now
    })

    const goalsCompletedInPeriod = goals.filter((goal) => {
      if (goal.status !== "completed" || !goal.completedAt) return false
      const completedDate = new Date(goal.completedAt)
      return !Number.isNaN(completedDate.getTime()) && completedDate >= start && completedDate <= now
    }).length

    const totalFocusMinutes = sessionsInPeriod.reduce((sum, session) => sum + session.minutes, 0)
    const activeDays = new Set(sessionsInPeriod.map((session) => session.date)).size
    const averageSessionMinutes = sessionsInPeriod.length > 0 ? Math.round(totalFocusMinutes / sessionsInPeriod.length) : 0
    const completedTasks = tasks.filter((task) => task.completed).length
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

    return {
      days,
      totalFocusMinutes,
      sessionsCount: sessionsInPeriod.length,
      activeDays,
      averageSessionMinutes,
      goalsCompletedInPeriod,
      completedTasks,
      totalTasks: tasks.length,
      taskCompletionRate,
    }
  }, [focusSessions, goals, reportPeriod, tasks])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setIsSaved(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    guard("save profile changes", () => {
      updateUserProfile(formData)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    })
  }

  const refreshReport = () => setReportGeneratedAt(new Date())

  const handlePrintReport = () => {
    setReportGeneratedAt(new Date())
    window.requestAnimationFrame(() => window.print())
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .profile-report-print,
          .profile-report-print * {
            visibility: visible;
          }

          .profile-report-print {
            position: absolute;
            inset: 0;
            width: 100%;
            background: white;
            color: #111827;
            padding: 24px;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 border-b border-border pb-6"
        >
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal details and generate printable progress documents.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile Completeness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold">{profileCompleteness}%</p>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${profileCompleteness}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">A richer profile improves your weekly and monthly reporting context.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                {reportPeriod === "week" ? "Weekly" : "Monthly"} Pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Focus tracked: <span className="font-semibold">{formatMinutes(reportMetrics.totalFocusMinutes)}</span>
              </p>
              <p>
                Active days: <span className="font-semibold">{reportMetrics.activeDays}/{reportMetrics.days}</span>
              </p>
              <p>
                Sessions logged: <span className="font-semibold">{reportMetrics.sessionsCount}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Momentum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Focus streak: <span className="font-semibold">{focusStreaks.currentStreak} days</span>
              </p>
              <p className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-500" /> Goals this week: <span className="font-semibold">{goalStreaks.completedThisWeek}</span>
              </p>
              <p>
                Avg session: <span className="font-semibold">{formatMinutes(Math.round(productivityInsights.averageSessionLength))}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>User-Centered Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Current Role / Title</Label>
                    <Input id="role" name="role" value={formData.role} onChange={handleChange} placeholder="e.g. Product Designer" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / Goal Statement</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="What are you building and where are you headed?"
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</Label>
                    <Input id="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 555 123 4567" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</Label>
                    <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Timezone</Label>
                    <Input id="timezone" name="timezone" value={formData.timezone} onChange={handleChange} placeholder="UTC+03:00" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Website</Label>
                    <Input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://your-site.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2"><Link2 className="h-4 w-4" /> LinkedIn</Label>
                    <Input id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="linkedin.com/in/username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github" className="flex items-center gap-2"><Github className="h-4 w-4" /> GitHub</Label>
                    <Input id="github" name="github" value={formData.github} onChange={handleChange} placeholder="github.com/username" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topFocusArea">Top Focus Area</Label>
                  <Input
                    id="topFocusArea"
                    name="topFocusArea"
                    value={formData.topFocusArea}
                    onChange={handleChange}
                    placeholder="e.g. Product Strategy, Fullstack Shipping, Interview Prep"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" className="min-w-[140px]">
                    {isSaved ? (
                      <span className="flex items-center gap-2">Saved!</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" /> Save Changes
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Progress Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a clean report for weekly or monthly progress, then print or save it as PDF.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full sm:w-56 space-y-2">
                <Label htmlFor="reportPeriod">Report Period</Label>
                <Select
                  id="reportPeriod"
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value as ReportPeriod)}
                >
                  <option value="week">Weekly (last 7 days)</option>
                  <option value="month">Monthly (last 30 days)</option>
                </Select>
              </div>
              <Button variant="outline" onClick={refreshReport}>Refresh Snapshot</Button>
              <Button onClick={handlePrintReport}>
                <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="profile-report-print border-border/80">
        <CardHeader>
          <CardTitle className="text-xl">Productivity Progress Report</CardTitle>
          <p className="text-sm text-muted-foreground">
            {reportPeriod === "week" ? "Weekly" : "Monthly"} report generated on {reportGeneratedAt.toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
              <p className="font-semibold">{formData.name || "Not provided"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
              <p className="font-semibold">{formData.role || "Not provided"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Top Focus Area</p>
              <p className="font-semibold">{formData.topFocusArea || "Not provided"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Timezone</p>
              <p className="font-semibold">{formData.timezone || "Not provided"}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Focus Time</p>
              <p className="text-2xl font-bold mt-1">{formatMinutes(reportMetrics.totalFocusMinutes)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Sessions Logged</p>
              <p className="text-2xl font-bold mt-1">{reportMetrics.sessionsCount}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Days</p>
              <p className="text-2xl font-bold mt-1">{reportMetrics.activeDays}/{reportMetrics.days}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Average Session</p>
              <p className="text-2xl font-bold mt-1">{formatMinutes(reportMetrics.averageSessionMinutes)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Goals Completed</p>
              <p className="text-2xl font-bold mt-1">{reportMetrics.goalsCompletedInPeriod}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Task Completion</p>
              <p className="text-2xl font-bold mt-1">{reportMetrics.completedTasks}/{reportMetrics.totalTasks} ({reportMetrics.taskCompletionRate}%)</p>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Performance Highlights</p>
            <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
              <p>Current focus streak: <span className="font-semibold">{focusStreaks.currentStreak} days</span></p>
              <p>Longest focus streak: <span className="font-semibold">{focusStreaks.longestStreak} days</span></p>
              <p>Goals completed this week: <span className="font-semibold">{goalStreaks.completedThisWeek}</span></p>
              <p>Goals completed this month: <span className="font-semibold">{goalStreaks.completedThisMonth}</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
      <AuthPromptModal
        isOpen={authPrompt.isOpen}
        onClose={authPrompt.closePrompt}
        action={authPrompt.action}
        nextPath={authPrompt.nextPath}
      />
    </div>
  )
}
