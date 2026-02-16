"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildStreakChartData } from "@/lib/analytics-data"

interface StreakChartProps {
  streakHistory: { date: string; hasActivity: boolean }[]
}

export function StreakChart({ streakHistory }: StreakChartProps) {
  const data = useMemo(() => buildStreakChartData(streakHistory), [streakHistory])

  const activeDays = data.filter((item) => item.hasActivity).length
  const adherence = Math.round((activeDays / Math.max(data.length, 1)) * 100)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const point = payload[0].payload
      return (
        <div className="min-w-52 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-xl">
          <p className="text-sm font-semibold text-white">{point.fullDate}</p>
          <p className="text-slate-300">
            {point.weekday} • {point.hasActivity ? "Active day" : "Inactive day"}
          </p>
          <p className="mt-1 text-slate-400">Rolling adherence: {point.rollingAdherence}%</p>
          <p className="text-slate-400">
            {point.streakEndingHere > 0 ? `Part of a ${point.streakEndingHere}-day streak` : "Streak paused"}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-slate-700/70 bg-slate-900/70 text-slate-100 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-800/80 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <Flame className="h-5 w-5 text-orange-300" />
            30-Day Activity
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>
              Active days: <span className="font-semibold text-slate-100">{activeDays}/{Math.max(data.length, 0)}</span>
            </span>
            <span>
              Adherence: <span className="font-semibold text-slate-100">{adherence}%</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 pt-5">
        <div className="h-56 rounded-xl border border-slate-800/70 bg-slate-950/40 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 12, left: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                domain={[0, 1]}
                ticks={[0.18, 1]}
                tickFormatter={(value) => (value === 1 ? "Active" : "Idle")}
                width={52}
              />
              <Tooltip cursor={{ fill: "rgba(59,130,246,0.12)" }} content={<CustomTooltip />} />
              <Bar dataKey="activityValue" barSize={14} radius={[5, 5, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.hasActivity ? "#34d399" : "#475569"}
                    fillOpacity={entry.hasActivity ? 1 : 0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Hover bars to see date-level streak detail and rolling adherence.
        </p>
      </CardContent>
    </Card>
  )
}
