"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Square, CheckCircle2, Timer, Target, Flame, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LegacySelect } from "@/components/ui/legacy-select"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/app/dashboard/providers"

export default function TimePage() {
  const { 
    focusSessions, 
    addFocusSession, 
    todayFocusMinutes, 
    focus, 
    goals,
    focusStreaks,
    goalStreaks,
    productivityInsights,
    updateGoalStatus
  } = useDashboard()
  
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0) // in seconds
  const [label, setLabel] = useState("")
  const [goalId, setGoalId] = useState<string>("")
  const [showCompletion, setShowCompletion] = useState(false)
  const [completedGoal, setCompletedGoal] = useState<string | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (!label && focus) setLabel(focus)
  }, [focus])

  const selectedGoal = goals.find((g) => g.id === goalId) ?? null
  
  // Calculate current goal progress in real-time
  const currentGoalProgress = selectedGoal?.targetMinutes 
    ? Math.min(100, Math.round((goalTrackedMinutes(selectedGoal.id) / selectedGoal.targetMinutes) * 100))
    : selectedGoal?.progress || 0

  useEffect(() => {
    if (!selectedGoal) return
    setLabel((prev) => (prev.trim().length > 0 ? prev : selectedGoal.title))
  }, [selectedGoal])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => setIsRunning(!isRunning)

  const logCurrentSession = () => {
    if (time <= 0) return
    
    const minutes = Math.max(1, Math.round(time / 60))
    const goal = goals.find(g => g.id === goalId)
    
    // Add focus session first
    addFocusSession(minutes, label, goalId || undefined)
    
    // Check if goal should be completed
    if (goal && goal.targetMinutes) {
      const currentTracked = focusSessions
        .filter(s => s.goalId === goalId)
        .reduce((acc, s) => acc + s.minutes, 0) + minutes
      
      if (currentTracked >= goal.targetMinutes && goal.status !== 'completed') {
        setCompletedGoal(goal.title)
        setShowCompletion(true)
        setTimeout(() => setShowCompletion(false), 5000)
        
        // Auto-complete the goal
        updateGoalStatus(goal.id, 'completed')
      }
    }
    
    // Reset form
    setTime(0)
    setIsRunning(false)
    setLabel("")
    setGoalId("")
  }

  const today = new Date().toISOString().split("T")[0]
  const todaySessions = focusSessions.filter(s => s.date === today)
  const totalHours = (todayFocusMinutes / 60).toFixed(1)

  const normalizeTargetDate = (raw: string) => raw.split("T")[0]
  const todayGoals = goals.filter(
    (g) => g.status !== "completed" && normalizeTargetDate(g.targetDate) === today
  )

  const goalTrackedMinutes = (id: string) =>
    focusSessions.filter((s) => s.goalId === id).reduce((acc, s) => acc + (s.minutes || 0), 0)

  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs <= 0) return `${mins}m`
    if (mins <= 0) return `${hrs}h`
    return `${hrs}h ${mins}m`
  }

  const startGoalTimer = (goal: any) => {
    setGoalId(goal.id)
    setLabel(goal.title)
    setTime(0)
    setIsRunning(true)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header with Stats */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-4"
      >
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">Track your focus sessions and productivity</p>
        </div>
        
        <Card className="border-none bg-gradient-to-br from-orange-50 to-red-50 border-orange-100">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">{focusStreaks.currentStreak} days</div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Completed Goals</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{goalStreaks.completedThisWeek} this week</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goal Completion Animation */}
      {showCompletion && completedGoal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6" />
            <div>
              <div className="font-semibold">Goal Completed! 🎉</div>
              <div className="text-sm opacity-90">{completedGoal}</div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Timer Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <div className="relative aspect-square rounded-full border-8 border-accent flex flex-col items-center justify-center bg-card shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/20 pointer-events-none" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                <Timer className="h-4 w-4" /> Focus Timer
              </span>
              <div className="text-6xl md:text-7xl font-mono font-bold tracking-tighter tabular-nums">
                {formatTime(time)}
              </div>
              {selectedGoal && (
                <div className="mt-3 text-sm text-center max-w-xs">
                  <div className="text-muted-foreground">Working on:</div>
                  <div className="font-medium text-foreground truncate">{selectedGoal.title}</div>
                  {selectedGoal.targetMinutes && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Progress: {Math.round((goalTrackedMinutes(selectedGoal.id) / 60) * 10) / 10}h / {Math.round((selectedGoal.targetMinutes / 60) * 10) / 10}h
                    </div>
                  )}
                  
                  {/* Live progress bar */}
                  {selectedGoal && selectedGoal.targetMinutes && (
                    <div className="mt-3 w-full max-w-xs">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Live Progress</span>
                        <span>{currentGoalProgress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${currentGoalProgress}%` }}
                          initial={{ width: `${currentGoalProgress}%` }}
                        />
                      </div>
                      {currentGoalProgress >= 100 && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          ✓ Target reached!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-4 mt-8 flex-wrap justify-center">
                <Button 
                  size="lg" 
                  className={cn("rounded-full h-16 w-16 p-0 transition-all shadow-lg", 
                    isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-primary")}
                  onClick={toggleTimer}
                >
                  {isRunning ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                </Button>
                {time > 0 && !isRunning && (
                  <>
                    <Button
                      size="lg"
                      className="rounded-full h-16 w-16 p-0 shadow-lg bg-green-600 hover:bg-green-700"
                      onClick={logCurrentSession}
                      title="Log this session"
                    >
                      <CheckCircle2 className="h-5 w-5 fill-current" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="rounded-full h-16 w-16 p-0 shadow-lg"
                      onClick={() => setTime(0)}
                      title="Reset timer"
                    >
                      <Square className="h-5 w-5 fill-current" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Goal Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Select Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Link to a goal (optional)</Label>
                <LegacySelect value={goalId} onValueChange={setGoalId}>
                  <option value="">No goal</option>
                  {goals
                    .filter((g) => g.status !== "completed")
                    .slice(0, 50)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                </LegacySelect>
                {selectedGoal?.targetMinutes ? (
                  <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                    📊 Tracked: {Math.round((goalTrackedMinutes(selectedGoal.id) / 60) * 10) / 10}h /{" "}
                    {Math.round((selectedGoal.targetMinutes / 60) * 10) / 10}h
                    {goalTrackedMinutes(selectedGoal.id) >= selectedGoal.targetMinutes && (
                      <span className="text-green-600 font-medium"> ✓ Ready to complete!</span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    💡 Tip: Set target hours on Goals page to auto-complete.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-label">Session label (optional)</Label>
                <Input
                  id="session-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Deep work: landing page"
                />
                <p className="text-xs text-muted-foreground">
                  This is saved with your focus session when you log it.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today's Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayGoals.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No goals due today. Set one on Goals page.
                </div>
              ) : (
                todayGoals.slice(0, 4).map((g) => {
                  const tracked = goalTrackedMinutes(g.id)
                  const target = g.targetMinutes ?? 0
                  const progress = target > 0 ? (tracked / target) * 100 : g.progress
                  
                  return (
                    <motion.div 
                      key={g.id} 
                      className="rounded-xl border border-border bg-card p-4 space-y-3 hover:shadow-md transition-shadow cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => startGoalTimer(g)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">{g.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {target > 0
                              ? `Time: ${Math.round((tracked / 60) * 10) / 10}h / ${Math.round((target / 60) * 10) / 10}h`
                              : "Roadmap / manual progress"}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            startGoalTimer(g)
                          }}
                        >
                          {goalId === g.id && isRunning ? "Running" : "Start"}
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{Math.min(100, Math.round(progress))}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500",
                              progress >= 100 ? "bg-green-500" : "bg-primary"
                            )} 
                            style={{ width: `${Math.min(100, progress)}%` }} 
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-accent/50 text-center">
                  <div className="text-2xl font-bold">{totalHours}h</div>
                  <div className="text-xs text-muted-foreground uppercase mt-1">Total Focus</div>
                </div>
                <div className="p-3 rounded-xl bg-accent/50 text-center">
                  <div className="text-2xl font-bold">{todaySessions.length}</div>
                  <div className="text-xs text-muted-foreground uppercase mt-1">Sessions</div>
                </div>
              </div>
              
              {productivityInsights.peakProductivityHour !== null && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="text-sm font-medium text-blue-700">
                    Peak Productivity: {productivityInsights.peakProductivityHour}:00
                  </div>
                  <div className="text-xs text-blue-600">
                    Schedule important tasks around this time
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 p-0 max-h-80 overflow-y-auto">
              {focusSessions.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No focus sessions yet. Log one from the timer.
                </div>
              ) : (
                focusSessions.slice(0, 8).map((session) => (
                  <div key={session.id} className="flex items-center p-4 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {session.label?.trim() ? session.label : "Focus session"}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {session.timestamp
                          ? new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : session.date}
                      </div>
                    </div>
                    <div className="font-mono font-medium text-sm">
                      {formatMinutes(session.minutes)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}