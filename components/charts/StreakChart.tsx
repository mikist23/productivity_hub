"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StreakChartProps {
  streakHistory: { date: string; hasActivity: boolean }[]
}

export function StreakChart({ streakHistory }: StreakChartProps) {
  const asDate = (value: string) => {
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
    const parsed = new Date(normalized)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  }

  const data = streakHistory.map(item => ({
    date: asDate(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    fullDate: asDate(item.date).toLocaleDateString('en-CA'),
    weekday: asDate(item.date).toLocaleDateString('en', { weekday: 'short' }),
    hasActivity: item.hasActivity,
    activityValue: item.hasActivity ? 1 : 0.18,
  }))

  const activeDays = data.filter((item) => item.hasActivity).length
  const adherence = Math.round((activeDays / Math.max(data.length, 1)) * 100)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-background border border-border p-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.fullDate}</p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.weekday} • {payload[0].payload.hasActivity ? '✅ Active' : '❌ Inactive'}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            30-Day Activity
          </CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">Active days: <span className="font-semibold text-foreground">{activeDays}/30</span></span>
            <span className="text-muted-foreground">Adherence: <span className="font-semibold text-foreground">{adherence}%</span></span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="opacity-25" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                interval={4}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                domain={[0, 1]}
                ticks={[0.18, 1]}
                tickFormatter={(value) => value === 1 ? 'Active' : 'Idle'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="activityValue" barSize={14} radius={[5, 5, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.hasActivity ? '#22c55e' : '#64748b'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
