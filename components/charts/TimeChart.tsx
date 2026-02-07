"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMinutes } from '@/lib/utils'

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
  // Process data for the last 7 days
  const processData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const daySessions = focusSessions.filter(s => s.date === dateStr)
      const totalMinutes = daySessions.reduce((sum, s) => sum + s.minutes, 0)
      
      data.push({
        date: date.toLocaleDateString('en', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        hours: totalMinutes / 60,
        minutes: totalMinutes,
        sessions: daySessions.length
      })
    }
    
    return data
  }

  const data = processData()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <p className="text-xs text-muted-foreground">
            Total: {formatMinutes(data.minutes)}
          </p>
          <p className="text-xs text-muted-foreground">
            Sessions: {data.sessions}
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
          <Clock className="h-5 w-5" />
          Weekly Focus Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 40, left: 10 }}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorHours)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}