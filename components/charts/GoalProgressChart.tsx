"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Target, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildGoalCategoryProgressData, buildGoalStatusData } from "@/lib/analytics-data"

interface Goal {
  id: string
  title: string
  status: "todo" | "inprogress" | "completed"
  progress: number
  category: string
}

interface GoalProgressChartProps {
  goals: Goal[]
}

export function GoalProgressChart({ goals }: GoalProgressChartProps) {
  const categoryData = useMemo(() => buildGoalCategoryProgressData(goals), [goals])
  const statusData = useMemo(() => buildGoalStatusData(goals), [goals])
  const hasGoals = goals.length > 0

  const CategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload as (typeof categoryData)[number]
      return (
        <div className="min-w-48 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-xl">
          <p className="text-sm font-semibold text-white">{data.category}</p>
          <p>Average progress: {data.avgProgress}%</p>
          <p>Total goals: {data.total}</p>
          <p className="text-slate-400">
            {data.completed} completed, {data.inProgress} in progress
          </p>
        </div>
      )
    }
    return null
  }

  const StatusTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const point = payload[0].payload as (typeof statusData)[number]
      return (
        <div className="min-w-40 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-xl">
          <p className="text-sm font-semibold text-white">{point.name}</p>
          <p>{point.value} goals</p>
          <p className="text-slate-400">{point.percent}% of total</p>
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
            <Target className="h-5 w-5 text-cyan-300" />
            Progress by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 pt-5">
          {hasGoals ? (
            <div className="h-72 rounded-xl border border-slate-800/70 bg-slate-950/40 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 8, right: 8, bottom: 28, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    minTickGap={18}
                    height={44}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    width={38}
                  />
                  <Tooltip cursor={{ fill: "rgba(56,189,248,0.12)" }} content={<CategoryTooltip />} />
                  <Bar dataKey="avgProgress" radius={[6, 6, 0, 0]} fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/35 p-6 text-sm text-slate-400">
              Add goals to unlock category-level progress analytics.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-700/70 bg-slate-900/70 text-slate-100 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <TrendingUp className="h-5 w-5 text-indigo-300" />
            Goal Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 pt-5">
          {hasGoals ? (
            <>
              <div className="relative h-72 rounded-xl border border-slate-800/70 bg-slate-950/40 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={92}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<StatusTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-white">{goals.length}</p>
                  <p className="text-xs text-slate-400">Total goals</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-200">
                      {item.value} ({item.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/35 p-6 text-sm text-slate-400">
              Goal status distribution appears after your first goal is created.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
