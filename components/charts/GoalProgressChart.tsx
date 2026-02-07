"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import type { BarProps } from 'recharts'
import { Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Goal {
  id: string
  title: string
  status: 'todo' | 'inprogress' | 'completed'
  progress: number
  category: string
}

interface GoalProgressChartProps {
  goals: Goal[]
}

export function GoalProgressChart({ goals }: GoalProgressChartProps) {
  // Process data for progress by category
  const getCategoryData = () => {
    const categoryMap = new Map<string, { total: number; completed: number; inProgress: number; count: number }>()
    
    goals.forEach(goal => {
      const category = goal.category || 'General'
      const current = categoryMap.get(category) || { total: 0, completed: 0, inProgress: 0, count: 0 }
      
      categoryMap.set(category, {
        total: current.total + goal.progress,
        completed: current.completed + (goal.status === 'completed' ? 1 : 0),
        inProgress: current.inProgress + (goal.status === 'inprogress' ? 1 : 0),
        count: current.count + 1
      })
    })
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      avgProgress: Math.round(data.total / data.count),
      completed: data.completed,
      inProgress: data.inProgress,
      total: data.count
    }))
  }

  // Process data for goal status distribution
  const getStatusData = () => {
    const statusMap = new Map<string, number>()
    
    goals.forEach(goal => {
      statusMap.set(goal.status, (statusMap.get(goal.status) || 0) + 1)
    })
    
    return [
      { name: 'Completed', value: statusMap.get('completed') || 0, color: '#22c55e' },
      { name: 'In Progress', value: statusMap.get('inprogress') || 0, color: '#3b82f6' },
      { name: 'Todo', value: statusMap.get('todo') || 0, color: '#64748b' }
    ]
  }

  const categoryData = getCategoryData()
  const statusData = getStatusData()

  const CategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{data.category}</p>
          <p className="text-xs text-muted-foreground">
            Avg Progress: {data.avgProgress}%
          </p>
          <p className="text-xs text-muted-foreground">
            Total Goals: {data.total}
          </p>
        </div>
      )
    }
    return null
  }

  const StatusTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-xs text-muted-foreground">
            {payload[0].value} goals
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
            <Target className="h-5 w-5" />
            Progress by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, bottom: 40, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CategoryTooltip />} />
                <Bar dataKey="avgProgress" radius={[4, 4, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Goal Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<StatusTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}