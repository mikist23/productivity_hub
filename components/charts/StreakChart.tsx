"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StreakChartProps {
  streakHistory: { date: string; hasActivity: boolean }[]
}

export function StreakChart({ streakHistory }: StreakChartProps) {
  const data = streakHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('en', { weekday: 'short' }),
    hasActivity: item.hasActivity,
    fullDate: item.date
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-background border border-border p-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.fullDate}</p>
          <p className="text-xs text-muted-foreground">
            {payload[0].value ? '✅ Active' : '❌ Inactive'}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          30-Day Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                interval={4}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={(value) => value === 1 ? 'Active' : 'Inactive'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hasActivity" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.hasActivity ? '#22c55e' : '#e2e8f0'} 
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