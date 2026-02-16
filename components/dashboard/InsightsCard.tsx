"use client"

import { useMemo } from "react"
import { Activity, CalendarDays, Clock3, Flame } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { FocusSession } from "@/app/dashboard/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  buildInsightsData,
  minutesToText,
  type Focus14Point,
  type Timeline24Point,
} from "@/lib/insights-data"
import { cn } from "@/lib/utils"

type InsightsCardProps = {
  focusSessions: FocusSession[]
}

type RechartsTooltipProps<T> = {
  active?: boolean
  payload?: Array<{ payload: T }>
}

function FocusChartTooltip({
  active,
  payload,
  totalMinutes,
}: RechartsTooltipProps<Focus14Point> & { totalMinutes: number }) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload
  const dateLabel = new Date(`${point.dateISO}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
  const share = totalMinutes > 0 ? Math.round((point.minutes / totalMinutes) * 100) : 0

  return (
    <div className="min-w-56 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-xl">
      <p className="mb-1 font-semibold text-white">{dateLabel}</p>
      <p>Focused: {minutesToText(point.minutes)}</p>
      <p>Sessions: {point.sessions}</p>
      <p>Share of 14 days: {share}%</p>
    </div>
  )
}

function TimelineChartTooltip({
  active,
  payload,
  peakHour,
}: RechartsTooltipProps<Timeline24Point> & { peakHour: number }) {
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload
  const nextHour = (point.hour + 1) % 24
  const hourRange = `${point.label} - ${nextHour.toString().padStart(2, "0")}:00`

  return (
    <div className="min-w-56 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-xl">
      <p className="mb-1 font-semibold text-white">{hourRange}</p>
      <p>Focused: {minutesToText(point.minutes)}</p>
      <p>Sessions: {point.sessions}</p>
      <p>{point.hour === peakHour ? "Peak hour today" : "Hourly focus activity"}</p>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  title,
  value,
  context,
  tint,
}: {
  icon: typeof Clock3
  title: string
  value: string
  context: string
  tint: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4 backdrop-blur",
        "transition-colors hover:border-slate-600",
        tint
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-slate-300">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{context}</p>
    </div>
  )
}

export function InsightsCard({ focusSessions }: InsightsCardProps) {
  const insights = useMemo(() => buildInsightsData(focusSessions), [focusSessions])

  const focusMax = Math.max(60, ...insights.focus14Data.map((item) => item.minutes))
  const timelineMax = Math.max(30, ...insights.timeline24Data.map((item) => item.minutes))

  return (
    <Card className="overflow-hidden border-slate-700/70 bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 text-white shadow-2xl">
      <CardHeader className="space-y-4 border-b border-slate-800/80 pb-5">
        <CardTitle className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <span className="rounded-xl border border-slate-700/80 bg-slate-800/60 p-2">
            <Activity className="h-5 w-5 text-cyan-300" />
          </span>
          Productivity Insights
        </CardTitle>

        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard
            icon={Clock3}
            title="Today"
            value={minutesToText(insights.todayMinutes)}
            context={`${insights.todaySessions} sessions logged today`}
            tint="hover:bg-sky-950/25"
          />
          <MetricCard
            icon={Flame}
            title="Streak"
            value={`${insights.streakDays}d`}
            context={insights.streakDays > 0 ? "Consecutive active days" : "Start a streak today"}
            tint="hover:bg-orange-950/25"
          />
          <MetricCard
            icon={CalendarDays}
            title="Last 14 days"
            value={minutesToText(insights.last14TotalMinutes)}
            context={`Avg/day ${minutesToText(insights.last14AvgMinutes)} | Best ${minutesToText(insights.bestDayMinutes)}`}
            tint="hover:bg-violet-950/25"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Focus (14 days)</h3>
            <p className="text-xs text-slate-400">Hover each day for detailed totals and share.</p>
          </div>

          <div className="h-64 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.focus14Data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  width={36}
                  domain={[0, focusMax]}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59,130,246,0.12)" }}
                  content={<FocusChartTooltip totalMinutes={insights.last14TotalMinutes} />}
                />
                <Bar dataKey="minutes" radius={[8, 8, 0, 0]} maxBarSize={34}>
                  {insights.focus14Data.map((entry) => (
                    <Cell
                      key={entry.dateISO}
                      fill={entry.isToday ? "#60a5fa" : "#334155"}
                      fillOpacity={entry.isToday ? 0.95 : 0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Today timeline (24h)</h3>
            <p className="text-xs text-slate-400">
              Peak hour: {insights.mostActiveHour.label} ({minutesToText(insights.mostActiveHour.minutes)})
            </p>
          </div>

          <div className="h-64 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={insights.timeline24Data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="timelineFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  interval={2}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  width={36}
                  domain={[0, timelineMax]}
                />
                <Tooltip
                  cursor={{ stroke: "#38bdf8", strokeWidth: 1, strokeDasharray: "4 4" }}
                  content={<TimelineChartTooltip peakHour={insights.mostActiveHour.hour} />}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#timelineFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Timeline uses session timestamps. Sessions without valid timestamps do not appear in hourly bins.
          </p>
        </section>
      </CardContent>
    </Card>
  )
}
