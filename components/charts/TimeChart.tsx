"use client"

import { useMemo } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildWeeklyFocusData, minutesToLabel } from "@/lib/analytics-data"

interface FocusSession {
  id: string
  date: string
  minutes: number
  timestamp: string
}

interface TimeChartProps {
  focusSessions: FocusSession[]
}

export function TimeChart({ focusSessions }: TimeChartProps) {
  const data = useMemo(() => buildWeeklyFocusData(focusSessions), [focusSessions])
  const averageMinutes = Math.round(data.reduce((sum, day) => sum + day.minutes, 0) / Math.max(data.length, 1))
  const hasData = data.some((item) => item.minutes > 0)
  const yMax = Math.max(1, ...data.map((item) => item.hours))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const point = payload[0].payload
      const deltaPercent = averageMinutes > 0 ? Math.round((point.minutes / averageMinutes) * 100) : 0
      return (
        <div className="min-w-52 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-xl">
          <p className="text-sm font-semibold text-white">{label}</p>
          <p>Total: {minutesToLabel(point.minutes)}</p>
          <p>Sessions: {point.sessions}</p>
          <p className="text-slate-400">
            {averageMinutes > 0 ? `${deltaPercent}% of 7-day average` : "No baseline yet"}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-slate-700/70 bg-slate-900/70 text-slate-100 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-800/80 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <Clock className="h-5 w-5 text-sky-300" />
          Weekly Focus Time
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 pt-5">
        <div className="h-72 rounded-xl border border-slate-800/70 bg-slate-950/40 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 32, left: 0 }}>
              <defs>
                <linearGradient id="weeklyFocusAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval={0}
                minTickGap={14}
                height={46}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                domain={[0, yMax]}
                tickFormatter={(value) => `${value}h`}
                width={46}
              />
              <Tooltip
                cursor={{ stroke: "#38bdf8", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={<CustomTooltip />}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#38bdf8"
                fillOpacity={1}
                fill="url(#weeklyFocusAreaFill)"
                strokeWidth={2}
                activeDot={{ r: 6, strokeWidth: 1, fill: "#0ea5e9", stroke: "#e0f2fe" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {!hasData && (
          <p className="mt-2 text-xs text-slate-400">
            No focus sessions in the last 7 days yet. Start a timer to see weekly trends.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
