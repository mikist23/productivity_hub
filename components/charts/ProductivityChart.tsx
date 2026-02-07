"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Activity, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  // Process data for hourly productivity (24-hour view)
  const getHourlyData = () => {
    const hourlyData = []
    
    for (let hour = 0; hour < 24; hour++) {
      const hourSessions = focusSessions.filter(session => {
        const sessionHour = new Date(session.timestamp).getHours()
        return sessionHour === hour
      })
      
      const totalMinutes = hourSessions.reduce((sum, session) => sum + session.minutes, 0)
      
      hourlyData.push({
        hour: hour.toString().padStart(2, '0') + ':00',
        hour24: hour,
        minutes: totalMinutes,
        sessions: hourSessions.length
      })
    }
    
    return hourlyData
  }

  // Process data for weekly productivity
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weeklyData = days.map((day, index) => {
      const daySessions = focusSessions.filter(session => {
        const sessionDay = new Date(session.timestamp).getDay()
        return sessionDay === index
      })
      
      const totalMinutes = daySessions.reduce((sum, session) => sum + session.minutes, 0)
      
      return {
        day,
        minutes: totalMinutes,
        hours: totalMinutes / 60,
        sessions: daySessions.length
      }
    })
    
    return weeklyData
  }

  const hourlyData = getHourlyData()
  const weeklyData = getWeeklyData()

  const HourlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <p className="text-xs text-muted-foreground">
            Focus Time: {Math.round(data.minutes)} minutes
          </p>
          <p className="text-xs text-muted-foreground">
            Sessions: {data.sessions}
          </p>
        </div>
      )
    }
    return null
  }

  const WeeklyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <p className="text-xs text-muted-foreground">
            Total: {data.hours.toFixed(1)} hours
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
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            24-Hour Productivity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, bottom: 40, left: 10 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 11 }}
                  interval={2}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `${value}m`}
                />
                <Tooltip content={<HourlyTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorMinutes)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Weekly Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip content={<WeeklyTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}