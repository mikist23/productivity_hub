"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Activity, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildHourlyProductivityData, buildWeeklyPatternData, minutesToLabel } from "@/lib/analytics-data"

interface FocusSession {
  id: string
  date: string
  minutes: number
  timestamp: string
}

interface ProductivityChartProps {
  focusSessions: FocusSession[]
}

export function ProductivityChart({ focusSessions }: ProductivityChartProps) {
  const hourlyData = useMemo(() => buildHourlyProductivityData(focusSessions), [focusSessions])
  const weeklyData = useMemo(() => buildWeeklyPatternData(focusSessions), [focusSessions])
  const totalWeeklyMinutes = weeklyData.reduce((sum, item) => sum + item.minutes, 0)
  const peakHour = hourlyData.reduce((max, item) => (item.minutes > max.minutes ? item : max), hourlyData[0])
  const maxWeeklyHours = Math.max(1, ...weeklyData.map((item) => item.hours))
  const maxHourlyMinutes = Math.max(1, ...hourlyData.map((item) => item.minutes))

  const HourlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload as (typeof hourlyData)[number]
      const nextHour = (data.hour24 + 1) % 24
      return (
        <div className="min-w-52 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-xl">
          <p className="text-sm font-semibold text-white">
            {label} - {nextHour.toString().padStart(2, "0")}:00
          </p>
          <p>Focused: {minutesToLabel(data.minutes)}</p>
          <p>Sessions: {data.sessions}</p>
          <p className="text-slate-400">
            {data.hour24 === peakHour.hour24 && peakHour.minutes > 0 ? "Peak hour today" : "Hourly activity"}
          </p>
        </div>
      )
    }
    return null
  }

  const WeeklyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload as (typeof weeklyData)[number]
      const sorted = [...weeklyData].sort((a, b) => b.minutes - a.minutes)
      const rank = sorted.findIndex((item) => item.day === data.day) + 1
      const share = totalWeeklyMinutes > 0 ? Math.round((data.minutes / totalWeeklyMinutes) * 100) : 0
      return (
        <div className="min-w-52 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-xl">
          <p className="text-sm font-semibold text-white">{label}</p>
          <p>Total: {data.hours.toFixed(1)}h</p>
          <p>Sessions: {data.sessions}</p>
          <p className="text-slate-400">
            Rank #{rank} this week • {share}% share
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 min-w-0">
      <Card className="border-slate-700/70 bg-slate-900/70 text-slate-100 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <Calendar className="h-5 w-5 text-violet-300" />
            24-Hour Productivity
          </CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 pt-5">
          <div className="h-72 rounded-xl border border-slate-800/70 bg-slate-950/40 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}>
                <defs>
                  <linearGradient id="hourlyProductivityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="hourLabel"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, maxHourlyMinutes]}
                  tickFormatter={(value) => `${value}m`}
                  width={46}
                />
                <Tooltip
                  cursor={{ stroke: "#a78bfa", strokeWidth: 1, strokeDasharray: "4 4" }}
                  content={<HourlyTooltip />}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#a78bfa"
                  fillOpacity={1}
                  fill="url(#hourlyProductivityFill)"
                  strokeWidth={2}
                  activeDot={{ r: 5, fill: "#c4b5fd", stroke: "#ddd6fe", strokeWidth: 1 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Peak hour: {peakHour.hourLabel} ({minutesToLabel(peakHour.minutes)}).
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-700/70 bg-slate-900/70 text-slate-100 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <Activity className="h-5 w-5 text-emerald-300" />
            Weekly Pattern
          </CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 pt-5">
          <div className="h-72 rounded-xl border border-slate-800/70 bg-slate-950/40 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 8, right: 8, bottom: 12, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, maxWeeklyHours]}
                  tickFormatter={(value) => `${value}h`}
                  width={40}
                />
                <Tooltip
                  cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }}
                  content={<WeeklyTooltip />}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={{ fill: "#34d399", r: 5, stroke: "#052e2b", strokeWidth: 1 }}
                  activeDot={{ r: 7, fill: "#6ee7b7", stroke: "#022c22", strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
