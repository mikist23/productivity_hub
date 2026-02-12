"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Square, CheckCircle2, Clock, Target, Flame, TrendingUp, Plus, ChevronDown, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatMinutes } from "@/lib/utils"
import { useDashboard, type Goal } from "@/app/dashboard/providers"
import { 
  CircularTimer, 
  GoalCard, 
  DailyTargetCalendar, 
  TimerStats,
  Celebration 
} from "@/components/dashboard/timer"

// Container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
}

export default function TimePage() {
  const { 
    focusSessions, 
    addFocusSession, 
    goals,
    focusStreaks,
    goalStreaks,
    updateDailyTarget,
    setGoalDailyTargets
  } = useDashboard()
  
  type TimerDraft = {
    seconds: number
    sessionLabel?: string
  }

  const [selectedGoalId, setSelectedGoalId] = useState<string>("")
  const [runningGoalKey, setRunningGoalKey] = useState<string | null>(null)
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null)
  const [drafts, setDrafts] = useState<Record<string, TimerDraft>>({})
  const [tick, setTick] = useState(() => Date.now())
  const [sessionLabel, setSessionLabel] = useState("")
  const [showGoalSelector, setShowGoalSelector] = useState(false)
  
  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationGoal, setCelebrationGoal] = useState<Goal | null>(null)
  const [hasCelebrated, setHasCelebrated] = useState(false)
  
  const goalKey = useCallback((goalId?: string) => (goalId && goalId.length > 0 ? goalId : "no-goal"), [])
  const today = new Date().toISOString().split("T")[0]
  const todaySessions = useMemo(() => focusSessions.filter(s => s.date === today), [focusSessions, today])

  useEffect(() => {
    if (!runningGoalKey) return
    const interval = setInterval(() => {
      setTick(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [runningGoalKey])

  // Derived state
  const selectedGoal = useMemo(() => 
    goals.find(g => g.id === selectedGoalId),
    [goals, selectedGoalId]
  )
  
  const activeGoals = useMemo(() => 
    goals.filter(g => g.status !== "completed"),
    [goals]
  )
  
  const selectedGoalKey = goalKey(selectedGoalId)
  const isRunning = runningGoalKey === selectedGoalKey

  const getElapsedSecondsForGoal = useCallback((goalId?: string) => {
    const key = goalKey(goalId)
    const base = drafts[key]?.seconds ?? 0
    if (runningGoalKey !== key || !startedAtMs) return base
    const live = Math.max(0, Math.floor((tick - startedAtMs) / 1000))
    return base + live
  }, [drafts, goalKey, runningGoalKey, startedAtMs, tick])

  const currentElapsedSeconds = useMemo(() => {
    return getElapsedSecondsForGoal(selectedGoalId)
  }, [getElapsedSecondsForGoal, selectedGoalId])

  // Calculate accumulated minutes for selected goal (all-time and today)
  const accumulatedTotalMinutes = useMemo(() => {
    if (!selectedGoal) return 0
    return focusSessions
      .filter(s => s.goalId === selectedGoal.id)
      .reduce((acc, s) => acc + s.minutes, 0)
  }, [selectedGoal, focusSessions])

  const accumulatedTodayMinutes = useMemo(() => {
    if (!selectedGoal) return 0
    return todaySessions
      .filter(s => s.goalId === selectedGoal.id)
      .reduce((acc, s) => acc + s.minutes, 0)
  }, [selectedGoal, todaySessions])

  const accumulatedMinutesForTarget = useMemo(() => {
    if (!selectedGoal) return 0
    return selectedGoal.useDailyTargets ? accumulatedTodayMinutes : accumulatedTotalMinutes
  }, [accumulatedTodayMinutes, accumulatedTotalMinutes, selectedGoal])
  
  // Calculate progress for selected goal
  const progress = useMemo(() => {
    if (!selectedGoal) return 0
    
    const sessionMinutes = Math.floor(currentElapsedSeconds / 60)
    
    if (selectedGoal.useDailyTargets && selectedGoal.dailyTargets) {
      const todayTarget = selectedGoal.dailyTargets.find(dt => dt.date === today)
      if (todayTarget) {
        const total = accumulatedMinutesForTarget + sessionMinutes
        return Math.min(100, Math.round((total / todayTarget.targetMinutes) * 100))
      }
    } else if (selectedGoal.targetMinutes) {
      const total = accumulatedMinutesForTarget + sessionMinutes
      return Math.min(100, Math.round((total / selectedGoal.targetMinutes) * 100))
    }
    
    return selectedGoal.progress || 0
  }, [accumulatedMinutesForTarget, currentElapsedSeconds, selectedGoal, today])
  
  // Get target minutes
  const targetMinutes = useMemo(() => {
    if (!selectedGoal) return undefined
    
    if (selectedGoal.useDailyTargets && selectedGoal.dailyTargets) {
      const todayTarget = selectedGoal.dailyTargets.find(dt => dt.date === today)
      return todayTarget?.targetMinutes
    }
    
    return selectedGoal.targetMinutes
  }, [selectedGoal, today])
  
  // Auto-celebrate when goal reached
  useEffect(() => {
    if (progress >= 100 && isRunning && !hasCelebrated && selectedGoal) {
      setCelebrationGoal(selectedGoal)
      setShowCelebration(true)
      setHasCelebrated(true)
      setDrafts(prev => {
        const live = startedAtMs ? Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)) : 0
        const existing = prev[selectedGoalKey]?.seconds ?? 0
        return {
          ...prev,
          [selectedGoalKey]: {
            ...(prev[selectedGoalKey] ?? { seconds: 0 }),
            seconds: existing + live,
          },
        }
      })
      setRunningGoalKey(null)
      setStartedAtMs(null)
    }
  }, [hasCelebrated, isRunning, progress, selectedGoal, selectedGoalKey, startedAtMs])
  
  // Reset celebration state when goal changes
  useEffect(() => {
    setHasCelebrated(false)
  }, [selectedGoalId])
  
  // Handlers
  const pauseGoal = useCallback((goalId?: string) => {
    const key = goalKey(goalId)
    if (runningGoalKey !== key || !startedAtMs) return
    const live = Math.max(0, Math.floor((tick - startedAtMs) / 1000))
    setDrafts(prev => {
      const existing = prev[key]?.seconds ?? 0
      return {
        ...prev,
        [key]: {
          ...(prev[key] ?? { seconds: 0 }),
          seconds: existing + live,
        },
      }
    })
    setRunningGoalKey(null)
    setStartedAtMs(null)
  }, [goalKey, runningGoalKey, startedAtMs])

  const startGoal = useCallback((goalId?: string) => {
    const nextKey = goalKey(goalId)
    if (runningGoalKey && runningGoalKey !== nextKey) {
      const runningGoalId = runningGoalKey === "no-goal" ? "" : runningGoalKey
      pauseGoal(runningGoalId)
    }
    setRunningGoalKey(nextKey)
    setStartedAtMs(Date.now())
  }, [goalKey, pauseGoal, runningGoalKey])

  const toggleTimer = () => {
    if (isRunning) {
      pauseGoal(selectedGoalId)
      return
    }
    startGoal(selectedGoalId)
  }
  
  const resetTimer = () => {
    pauseGoal(selectedGoalId)
    setDrafts(prev => ({
      ...prev,
      [selectedGoalKey]: {
        ...(prev[selectedGoalKey] ?? { seconds: 0 }),
        seconds: 0,
      },
    }))
  }
  
  const logSession = () => {
    const time = currentElapsedSeconds
    if (time <= 0) return
    
    const minutes = Math.max(1, Math.round(time / 60))
    addFocusSession(minutes, sessionLabel || undefined, selectedGoalId || undefined)
    
    pauseGoal(selectedGoalId)
    setDrafts(prev => ({
      ...prev,
      [selectedGoalKey]: {
        ...(prev[selectedGoalKey] ?? { seconds: 0 }),
        seconds: 0,
      },
    }))
    setSessionLabel("")
  }
  
  const quickAddTime = (minutes: number) => {
    if (selectedGoalId) {
      addFocusSession(minutes, `Quick add ${minutes}min`, selectedGoalId)
    } else {
      addFocusSession(minutes, `Quick add ${minutes}min`)
    }
  }
  
  const selectGoal = (goalId: string) => {
    setSelectedGoalId(goalId)
    setShowGoalSelector(false)
    setSessionLabel(drafts[goalKey(goalId)]?.sessionLabel ?? "")
  }
  
  const startGoalTimer = (goal: Goal) => {
    setSelectedGoalId(goal.id)
    setShowGoalSelector(false)
    setSessionLabel(drafts[goalKey(goal.id)]?.sessionLabel ?? goal.title)
    startGoal(goal.id)
  }

  useEffect(() => {
    setDrafts(prev => ({
      ...prev,
      [selectedGoalKey]: {
        ...(prev[selectedGoalKey] ?? { seconds: 0 }),
        sessionLabel: sessionLabel.trim() || undefined,
      },
    }))
  }, [selectedGoalKey, sessionLabel])

  useEffect(() => {
    if (selectedGoalId && !goals.some(goal => goal.id === selectedGoalId)) {
      setSelectedGoalId("")
      setSessionLabel(drafts[goalKey("")]?.sessionLabel ?? "")
    }
  }, [drafts, goalKey, goals, selectedGoalId])
  
  // Handle calendar target updates
  const handleUpdateTarget = (date: string, targetMinutes: number) => {
    if (selectedGoal) {
      updateDailyTarget(selectedGoal.id, date, 0) // This updates the existing target structure
      // We also need to update the target minutes
      const existingTargets = selectedGoal.dailyTargets || []
      const updatedTargets = existingTargets.map(dt => 
        dt.date === date ? { ...dt, targetMinutes } : dt
      )
      setGoalDailyTargets(selectedGoal.id, updatedTargets.map(({ actualMinutes, isComplete, ...rest }) => rest))
    }
  }
  
  const handleAddTarget = (date: string, targetMinutes: number) => {
    if (selectedGoal) {
      const newTarget = { date, targetMinutes }
      const existingTargets = (selectedGoal.dailyTargets || []).map(({ actualMinutes, isComplete, ...rest }) => rest)
      setGoalDailyTargets(selectedGoal.id, [...existingTargets, newTarget])
    }
  }
  
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Time Tracking
            </h1>
            <p className="text-slate-400 mt-1">Track your focus sessions and daily targets</p>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">{focusStreaks.currentStreak} day streak</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">{goalStreaks.completedThisWeek} goals this week</span>
            </div>
          </div>
        </motion.div>
        
        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column - Timer */}
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
            {/* Timer Card */}
            <Card className="border-none bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
              <CardContent className="p-6 md:p-8">
                {/* Goal Selector Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-500/20">
                      <Target className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {selectedGoal ? selectedGoal.title : "Select a Goal"}
                      </h2>
                      {selectedGoal && (
                        <p className="text-sm text-slate-400">
                          {selectedGoal.useDailyTargets ? "Daily target mode" : "Total target mode"}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => setShowGoalSelector(!showGoalSelector)}
                  >
                    {showGoalSelector ? "Close" : "Change Goal"}
                    <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", showGoalSelector && "rotate-180")} />
                  </Button>
                </div>
                
                {/* Goal Selector Dropdown */}
                <AnimatePresence>
                  {showGoalSelector && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-6"
                    >
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-3">
                        <div className="text-sm text-slate-400 mb-2">Select a goal to track:</div>
                        <div className="grid gap-2 max-h-64 overflow-y-auto">
                          {activeGoals.map((goal) => (
                            <button
                              key={goal.id}
                              onClick={() => selectGoal(goal.id)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                                selectedGoalId === goal.id
                                  ? "bg-violet-500/20 border border-violet-500/50"
                                  : "bg-slate-700/30 border border-transparent hover:bg-slate-700/50"
                              )}
                            >
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                goal.priority === "high" ? "bg-red-500" :
                                goal.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                              )} />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white truncate">{goal.title}</div>
                                <div className="text-xs text-slate-400">{goal.category}</div>
                              </div>
                              {selectedGoalId === goal.id && (
                                <CheckCircle2 className="h-4 w-4 text-violet-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Circular Timer */}
                <div className="flex justify-center py-6">
                  <CircularTimer
                    seconds={currentElapsedSeconds}
                    isRunning={isRunning}
                    progress={progress}
                    accumulatedMinutes={accumulatedMinutesForTarget}
                    targetMinutes={targetMinutes}
                    size={300}
                    strokeWidth={10}
                  />
                </div>
                
                {/* Timer Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  {/* Reset */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 rounded-2xl border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white"
                      onClick={resetTimer}
                      disabled={currentElapsedSeconds === 0}
                    >
                      <Square className="h-5 w-5 fill-current" />
                    </Button>
                  </motion.div>
                  
                  {/* Play/Pause */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="icon"
                      className={cn(
                        "h-20 w-20 rounded-full shadow-2xl shadow-violet-500/30",
                        isRunning 
                          ? "bg-amber-500 hover:bg-amber-600" 
                          : "bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                      )}
                      onClick={toggleTimer}
                    >
                      {isRunning ? (
                        <Pause className="h-8 w-8 fill-current" />
                      ) : (
                        <Play className="h-8 w-8 fill-current ml-1" />
                      )}
                    </Button>
                  </motion.div>
                  
                  {/* Log Session */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 rounded-2xl border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
                      onClick={logSession}
                      disabled={currentElapsedSeconds === 0}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
                
                {/* Quick Add Buttons */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  <span className="text-xs text-slate-500 mr-2">Quick add:</span>
                  {[15, 30, 60].map((mins) => (
                    <Button
                      key={mins}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-400 hover:bg-violet-500/20 hover:text-violet-300 hover:border-violet-500/50"
                      onClick={() => quickAddTime(mins)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Stats Card */}
            <TimerStats
              sessionMinutes={Math.floor(currentElapsedSeconds / 60)}
              accumulatedMinutes={accumulatedMinutesForTarget}
              targetMinutes={targetMinutes}
              progress={progress}
              sessionsToday={todaySessions.length}
              streakDays={focusStreaks.currentStreak}
            />
          </motion.div>
          
          {/* Right Column - Goals & Calendar */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
            {/* Today's Goals */}
            <Card className="border-none bg-slate-800/30 backdrop-blur-xl border border-slate-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Target className="h-5 w-5 text-violet-400" />
                  Today's Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeGoals.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No active goals</p>
                    <p className="text-sm mt-1">Create goals to start tracking time</p>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {activeGoals.slice(0, 6).map((goal, index) => {
                      const goalAccumulatedTotal = focusSessions
                        .filter(s => s.goalId === goal.id)
                        .reduce((acc, s) => acc + s.minutes, 0)
                      const goalAccumulatedToday = todaySessions
                        .filter(s => s.goalId === goal.id)
                        .reduce((acc, s) => acc + s.minutes, 0)
                      const goalSessionMinutes = Math.floor(getElapsedSecondsForGoal(goal.id) / 60)
                      const goalTrackedMinutes = (goal.useDailyTargets ? goalAccumulatedToday : goalAccumulatedTotal) + goalSessionMinutes
                      
                      return (
                        <motion.div
                          key={goal.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <GoalCard
                            goal={goal}
                            isSelected={selectedGoalId === goal.id}
                            isRunning={runningGoalKey === goal.id}
                            accumulatedMinutes={goalTrackedMinutes}
                            onSelect={() => selectGoal(goal.id)}
                            onStartTimer={() => startGoalTimer(goal)}
                          />
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Daily Target Calendar */}
            {selectedGoal && (
              <Card className="border-none bg-slate-800/30 backdrop-blur-xl border border-slate-700/30">
                <CardContent className="p-4">
                  <DailyTargetCalendar
                    dailyTargets={selectedGoal.dailyTargets || []}
                    onUpdateTarget={handleUpdateTarget}
                    onAddTarget={handleAddTarget}
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Recent Sessions */}
            <Card className="border-none bg-slate-800/30 backdrop-blur-xl border border-slate-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <History className="h-5 w-5 text-violet-400" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {todaySessions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No sessions today</p>
                  </div>
                ) : (
                  <div className="space-y-0 max-h-64 overflow-y-auto">
                    {todaySessions.slice(0, 8).map((session, index) => {
                      const sessionGoal = session.goalId ? goals.find(g => g.id === session.goalId) : null
                      
                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {session.label || "Focus session"}
                            </p>
                            {sessionGoal && (
                              <p className="text-xs text-violet-400">{sessionGoal.title}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono font-medium text-white">
                              {formatMinutes(session.minutes)}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Celebration Modal */}
      <Celebration
        isOpen={showCelebration}
        goalTitle={celebrationGoal?.title || "Goal"}
        message="You've reached your target for today! Great job staying focused."
        onClose={() => {
          setShowCelebration(false)
          resetTimer()
        }}
        onContinue={() => {
          startGoal(selectedGoalId)
        }}
      />
    </motion.div>
  )
}
