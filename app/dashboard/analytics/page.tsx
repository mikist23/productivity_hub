"use client"

import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Flame, Target, Clock, Award, Calendar, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard } from "@/app/dashboard/providers"
import { StreakChart } from "@/components/charts/StreakChart"
import { TimeChart } from "@/components/charts/TimeChart"
import { GoalProgressChart } from "@/components/charts/GoalProgressChart"
import { ProductivityChart } from "@/components/charts/ProductivityChart"

export default function AnalyticsPage() {
  const {
    focusSessions,
    goals,
    focusStreaks,
    goalStreaks,
    productivityInsights,
    streakHistory,
    todayFocusMinutes
  } = useDashboard()

  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs <= 0) return `${mins}m`
    if (mins <= 0) return `${hrs}h`
    return `${hrs}h ${mins}m`
  }

  const completionRate = goals.length > 0 
    ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100)
    : 0

  const activeGoals = goals.filter(g => g.status === 'inprogress').length
  const totalTrackedTime = focusSessions.reduce((sum, s) => sum + s.minutes, 0)
  const avgSessionLength = focusSessions.length > 0 
    ? Math.round(totalTrackedTime / focusSessions.length)
    : 0

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
            <p className="text-muted-foreground">Track your productivity patterns and progress</p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="border-none bg-gradient-to-br from-orange-50 to-red-50 border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Current Streak</p>
                <p className="text-3xl font-bold text-orange-700 mt-1">{focusStreaks.currentStreak}</p>
                <p className="text-xs text-orange-600 mt-1">days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Focus Time</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{formatMinutes(totalTrackedTime)}</p>
                <p className="text-xs text-blue-600 mt-1">all time</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Goal Completion</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{completionRate}%</p>
                <p className="text-xs text-green-600 mt-1">{goals.filter(g => g.status === 'completed').length} completed</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Session</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">{formatMinutes(avgSessionLength)}</p>
                <p className="text-xs text-purple-600 mt-1">per session</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StreakChart streakHistory={streakHistory} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TimeChart focusSessions={focusSessions} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GoalProgressChart goals={goals} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ProductivityChart focusSessions={focusSessions} />
        </motion.div>
      </div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Productivity Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {productivityInsights.peakProductivityHour !== null && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="text-sm font-medium text-blue-700">Peak Hour</div>
                <div className="text-lg font-bold text-blue-800">
                  {productivityInsights.peakProductivityHour}:00
                </div>
                <div className="text-xs text-blue-600">
                  Schedule important tasks around this time
                </div>
              </div>
            )}
            
            <div className="p-3 rounded-lg bg-green-50 border border-green-100">
              <div className="text-sm font-medium text-green-700">Average Session</div>
              <div className="text-lg font-bold text-green-800">
                {formatMinutes(productivityInsights.averageSessionLength)}
              </div>
              <div className="text-xs text-green-600">
                {productivityInsights.averageSessionLength >= 60 ? 'Great focus!' : 'Try longer sessions'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Streak Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
              <div className="text-sm font-medium text-orange-700">Current Streak</div>
              <div className="text-lg font-bold text-orange-800">
                {focusStreaks.currentStreak} days
              </div>
              <div className="text-xs text-orange-600">
                Keep it going! 🔥
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
              <div className="text-sm font-medium text-purple-700">Longest Streak</div>
              <div className="text-lg font-bold text-purple-800">
                {focusStreaks.longestStreak} days
              </div>
              <div className="text-xs text-purple-600">
                Personal best record
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
              <div className="text-sm font-medium text-indigo-700">Active Days</div>
              <div className="text-lg font-bold text-indigo-800">
                {focusStreaks.weeklyGoalDays}/7
              </div>
              <div className="text-xs text-indigo-600">
                Days with focus this week
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="text-sm font-medium text-emerald-700">Goals Completed</div>
              <div className="text-lg font-bold text-emerald-800">
                {goalStreaks.completedThisWeek}
              </div>
              <div className="text-xs text-emerald-600">
                This week's achievements
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}