"use client"

import { motion, useReducedMotion } from "framer-motion"
import { BarChart3, TrendingUp, Flame, Target, Clock, Award, Calendar, Brain, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard } from "@/app/dashboard/providers"
import { StreakChart } from "@/components/charts/StreakChart"
import { TimeChart } from "@/components/charts/TimeChart"
import { GoalProgressChart } from "@/components/charts/GoalProgressChart"
import { ProductivityChart } from "@/components/charts/ProductivityChart"
import { minutesToLabel } from "@/lib/analytics-data"

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="text-sm text-slate-400">{subtitle}</p>
    </div>
  )
}

function MetricCard({
  title,
  value,
  note,
  icon: Icon,
  accent,
}: {
  title: string
  value: string
  note: string
  icon: typeof Clock
  accent: string
}) {
  return (
    <Card className="group border-slate-700/70 bg-slate-900/70 text-slate-100 backdrop-blur-sm transition-colors hover:border-slate-600">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-white">{value}</p>
            <p className="mt-2 text-xs text-slate-400">{note}</p>
          </div>
          <div className={`rounded-xl border border-slate-700 p-2 ${accent}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const reduceMotion = useReducedMotion()
  const {
    focusSessions,
    goals,
    focusStreaks,
    goalStreaks,
    productivityInsights,
    streakHistory,
    todayFocusMinutes
  } = useDashboard()

  const completionRate = goals.length > 0
    ? Math.round((goals.filter((g) => g.status === "completed").length / goals.length) * 100)
    : 0

  const activeGoals = goals.filter((g) => g.status === "inprogress").length
  const completedGoals = goals.filter((g) => g.status === "completed").length
  const totalTrackedTime = focusSessions.reduce((sum, s) => sum + s.minutes, 0)
  const avgSessionLength = focusSessions.length > 0
    ? Math.round(totalTrackedTime / focusSessions.length)
    : 0
  const averagePerActiveDay = focusStreaks.monthlyGoalDays > 0
    ? Math.round(totalTrackedTime / focusStreaks.monthlyGoalDays)
    : 0

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-7"
      >
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-28 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-2 text-sm text-cyan-300">
            <Sparkles className="h-4 w-4" />
            <span>Performance Hub</span>
          </div>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-2 text-white">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Analytics & Insights</h1>
              </div>
              <p className="max-w-2xl text-slate-300">
                Explore your 30-day momentum, weekly focus consistency, and goal performance with interactive charts.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-slate-200">
                Today: {minutesToLabel(todayFocusMinutes)}
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-slate-200">
                Sessions: {focusSessions.length}
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-slate-200">
                Active Goals: {activeGoals}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.08 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <MetricCard
          title="Current Streak"
          value={`${focusStreaks.currentStreak}d`}
          note={`Longest run: ${focusStreaks.longestStreak} days`}
          icon={Flame}
          accent="text-orange-300"
        />
        <MetricCard
          title="Total Focus Time"
          value={minutesToLabel(totalTrackedTime)}
          note={`Avg per active day: ${minutesToLabel(averagePerActiveDay)}`}
          icon={Clock}
          accent="text-sky-300"
        />
        <MetricCard
          title="Goal Completion"
          value={`${completionRate}%`}
          note={`${completedGoals} completed out of ${goals.length}`}
          icon={Target}
          accent="text-emerald-300"
        />
        <MetricCard
          title="Average Session"
          value={minutesToLabel(avgSessionLength)}
          note={avgSessionLength >= 60 ? "Strong deep-work rhythm" : "Try one longer session today"}
          icon={TrendingUp}
          accent="text-violet-300"
        />
      </motion.div>

      <div className="space-y-8">
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.14 }}
          className="space-y-5"
        >
          <SectionHeading
            title="Core Charts"
            subtitle="30-day activity consistency and short-horizon focus trends."
          />
          <StreakChart streakHistory={streakHistory} />
          <TimeChart focusSessions={focusSessions} />
        </motion.section>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.2 }}
          className="space-y-5"
        >
          <SectionHeading
            title="Goal Analytics"
            subtitle="Track progress quality across categories and status distribution."
          />
          <GoalProgressChart goals={goals} />
        </motion.section>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.26 }}
          className="space-y-5"
        >
          <SectionHeading
            title="Pattern Analytics"
            subtitle="Understand your most productive hours and day-of-week rhythm."
          />
          <ProductivityChart focusSessions={focusSessions} />
        </motion.section>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.32 }}
        className="space-y-4"
      >
        <SectionHeading
          title="Insights Summary"
          subtitle="Quick recommendations from your current focus and streak data."
        />
        <div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <Card className="border-slate-700/70 bg-slate-900/70 text-slate-100">
            <CardHeader className="border-b border-slate-800/80 pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5 text-cyan-300" />
                Productivity Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              {productivityInsights.peakProductivityHour !== null ? (
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
                  <div className="text-sm text-cyan-100">Peak Hour</div>
                  <div className="text-lg font-bold text-white">
                    {String(productivityInsights.peakProductivityHour).padStart(2, "0")}:00
                  </div>
                  <div className="text-xs text-slate-300">Schedule demanding tasks in this window.</div>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-400">
                  No peak hour detected yet. Log more sessions with timestamps.
                </div>
              )}
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                <div className="text-sm text-emerald-100">Average Session</div>
                <div className="text-lg font-bold text-white">
                  {minutesToLabel(productivityInsights.averageSessionLength)}
                </div>
                <div className="text-xs text-slate-300">
                  {productivityInsights.averageSessionLength >= 60 ? "Consistent deep work quality." : "Consider extending one session each day."}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/70 bg-slate-900/70 text-slate-100">
            <CardHeader className="border-b border-slate-800/80 pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Award className="h-5 w-5 text-amber-300" />
                Streak Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
                <div className="text-sm text-orange-100">Current Streak</div>
                <div className="text-lg font-bold text-white">{focusStreaks.currentStreak} days</div>
                <div className="text-xs text-slate-300">Protect your momentum </div>
              </div>
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-3">
                <div className="text-sm text-violet-100">Longest Streak</div>
                <div className="text-lg font-bold text-white">{focusStreaks.longestStreak} days</div>
                <div className="text-xs text-slate-300">Your all-time best consistency run.</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/70 bg-slate-900/70 text-slate-100">
            <CardHeader className="border-b border-slate-800/80 pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-indigo-300" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3">
                <div className="text-sm text-indigo-100">Active Days</div>
                <div className="text-lg font-bold text-white">{focusStreaks.weeklyGoalDays}/7</div>
                <div className="text-xs text-slate-300">Days with recorded focus this week.</div>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                <div className="text-sm text-emerald-100">Goals Completed</div>
                <div className="text-lg font-bold text-white">{goalStreaks.completedThisWeek}</div>
                <div className="text-xs text-slate-300">Completed in the current week.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
