"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Square, CheckCircle2, Clock, Target, Flame, TrendingUp, Plus, ChevronDown, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn, formatMinutes } from "@/lib/utils"
import { useDashboard, type Goal } from "@/app/dashboard/providers"
import { 
  CircularTimer, 
  GoalCard, 
  DailyTargetCalendar, 
  TimerStats,
  Celebration 
} from "@/components/dashboard/timer"
import { AuthPromptModal } from "@/components/dashboard/AuthPromptModal"
import { useGuardedAction } from "@/components/dashboard/useGuardedAction"

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
    isDashboardHydrating,
    focusSessions, 
    addFocusSession, 
    goals,
    focusStreaks,
    goalStreaks,
    updateDailyTarget,
    setGoalDailyTargets,
    timerState,
    selectTimerGoal,
    setTimerSessionLabel,
    startTimer,
    pauseTimer,
    resetTimer,
    getTimerElapsedSeconds,
    logTimerSession,
  } = useDashboard()
  const { guard, authPrompt } = useGuardedAction("/dashboard/time")

  const [tick, setTick] = useState(() => Date.now())
  const [showGoalSelector, setShowGoalSelector] = useState(false)
  
  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationGoal, setCelebrationGoal] = useState<Goal | null>(null)
  const [hasCelebrated, setHasCelebrated] = useState(false)
  
  const goalKey = useCallback((goalId?: string) => (goalId && goalId.length > 0 ? goalId : "no-goal"), [])
  const selectedGoalId = timerState.selectedGoalId
  const sessionLabel = timerState.drafts[goalKey(selectedGoalId)]?.sessionLabel ?? ""
  const today = new Date().toISOString().split("T")[0]
  const todaySessions = useMemo(() => focusSessions.filter(s => s.date === today), [focusSessions, today])

  useEffect(() => {
    if (timerState.runningGoalId == null) return
    const interval = setInterval(() => {
      setTick(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [timerState.runningGoalId])

  // Derived state
  const selectedGoal = useMemo(() => 
    goals.find(g => g.id === selectedGoalId),
    [goals, selectedGoalId]
  )
  
  const activeGoals = useMemo(() => 
    goals.filter(g => g.status !== "completed"),
    [goals]
  )
  
  const isRunning = timerState.runningGoalId === selectedGoalId

  const getElapsedSecondsForGoal = useCallback((goalId?: string) => {
    return getTimerElapsedSeconds(goalId, tick)
  }, [getTimerElapsedSeconds, tick])

  const currentElapsedSeconds = useMemo(() => {
    return getElapsedSecondsForGoal(selectedGoalId)
  }, [getElapsedSecondsForGoal, selectedGoalId])

  const runningGoalSessionMinutes = useMemo(() => {
    if (!timerState.runningGoalId) return 0
    return Math.floor(getElapsedSecondsForGoal(timerState.runningGoalId) / 60)
  }, [getElapsedSecondsForGoal, timerState.runningGoalId])

  const goalTrackedMinutesMap = useMemo(() => {
    const tracked = new Map<string, number>()
    activeGoals.forEach((goal) => {
      const accumulatedTotal = focusSessions
        .filter((s) => s.goalId === goal.id)
        .reduce((acc, s) => acc + s.minutes, 0)
      const accumulatedToday = todaySessions
        .filter((s) => s.goalId === goal.id)
        .reduce((acc, s) => acc + s.minutes, 0)
      const runningMinutes = timerState.runningGoalId === goal.id ? runningGoalSessionMinutes : 0
      tracked.set(goal.id, (goal.useDailyTargets ? accumulatedToday : accumulatedTotal) + runningMinutes)
    })
    return tracked
  }, [activeGoals, focusSessions, runningGoalSessionMinutes, timerState.runningGoalId, todaySessions])

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

  const remainingMinutes = useMemo(() => {
    if (!targetMinutes || targetMinutes <= 0) return null
    const activeMinutes = Math.floor(currentElapsedSeconds / 60)
    return Math.max(0, targetMinutes - (accumulatedMinutesForTarget + activeMinutes))
  }, [accumulatedMinutesForTarget, currentElapsedSeconds, targetMinutes])
  
  // Auto-celebrate when goal reached
  useEffect(() => {
    if (progress >= 100 && isRunning && !hasCelebrated && selectedGoal) {
      setCelebrationGoal(selectedGoal)
      setShowCelebration(true)
      setHasCelebrated(true)
      pauseTimer(selectedGoal.id)
    }
  }, [hasCelebrated, isRunning, pauseTimer, progress, selectedGoal])
  
  // Reset celebration state when goal changes
  useEffect(() => {
    setHasCelebrated(false)
  }, [selectedGoalId])
  
  // Handlers
  const toggleTimer = () => {
    guard("track time sessions", () => {
      if (isRunning) {
        pauseTimer(selectedGoalId)
        return
      }
      startTimer(selectedGoalId)
    })
  }
  
  const handleResetTimer = () => {
    guard("track time sessions", () => resetTimer(selectedGoalId))
  }
  
  const logSession = () => {
    const time = currentElapsedSeconds
    if (time <= 0) return

    guard("log focus sessions", () => {
      logTimerSession(selectedGoalId)
      setTimerSessionLabel(selectedGoalId, "")
    })
  }
  
  const quickAddTime = (minutes: number) => {
    guard("log focus sessions", () => {
      if (selectedGoalId) {
        addFocusSession(minutes, `Quick add ${minutes}min`, selectedGoalId)
      } else {
        addFocusSession(minutes, `Quick add ${minutes}min`)
      }
    })
  }
  
  const selectGoal = (goalId: string) => {
    guard("track time sessions", () => {
      selectTimerGoal(goalId)
      setShowGoalSelector(false)
    })
  }
  
  const startGoalTimer = (goal: Goal) => {
    guard("track time sessions", () => {
      selectTimerGoal(goal.id)
      setShowGoalSelector(false)
      setTimerSessionLabel(goal.id, timerState.drafts[goalKey(goal.id)]?.sessionLabel ?? goal.title)
      startTimer(goal.id)
    })
  }

  useEffect(() => {
    if (selectedGoalId && !goals.some(goal => goal.id === selectedGoalId)) {
      selectTimerGoal("")
    }
  }, [goals, selectTimerGoal, selectedGoalId])
  
  // Handle calendar target updates
  const handleUpdateTarget = (date: string, targetMinutes: number) => {
    if (selectedGoal) {
      guard("update daily targets", () => {
        updateDailyTarget(selectedGoal.id, date, 0) // This updates the existing target structure
        // We also need to update the target minutes
        const existingTargets = selectedGoal.dailyTargets || []
        const updatedTargets = existingTargets.map(dt =>
          dt.date === date ? { ...dt, targetMinutes } : dt
        )
        setGoalDailyTargets(selectedGoal.id, updatedTargets.map(({ actualMinutes, isComplete, ...rest }) => rest))
      })
    }
  }
  
  const handleAddTarget = (date: string, targetMinutes: number) => {
    if (selectedGoal) {
      guard("update daily targets", () => {
        const newTarget = { date, targetMinutes }
        const existingTargets = (selectedGoal.dailyTargets || []).map(({ actualMinutes, isComplete, ...rest }) => rest)
        setGoalDailyTargets(selectedGoal.id, [...existingTargets, newTarget])
      })
    }
  }

  if (isDashboardHydrating) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-20 rounded-2xl bg-slate-800/50 animate-pulse" />
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="h-96 rounded-2xl bg-slate-800/50 animate-pulse lg:col-span-7" />
            <div className="h-96 rounded-2xl bg-slate-800/50 animate-pulse lg:col-span-5" />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <motion.div 
      className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.20)_0%,rgba(2,6,23,0)_45%),radial-gradient(circle_at_100%_0%,rgba(14,165,233,0.18)_0%,rgba(2,6,23,0)_45%),linear-gradient(150deg,#020617_0%,#0b1220_55%,#0f172a_100%)] p-4 md:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
              Time Tracking
            </h1>
            <p className="text-slate-300 mt-1">Track deep work by goal, pause and resume anytime, and complete targets with momentum.</p>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">{focusStreaks.currentStreak} day streak</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30">
              <TrendingUp className="h-4 w-4 text-teal-300" />
              <span className="text-sm font-medium text-teal-200">{goalStreaks.completedThisWeek} goals this week</span>
            </div>
          </div>
        </motion.div>
        
        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column - Timer */}
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
            {/* Timer Card */}
            <Card className="border border-slate-700/60 bg-gradient-to-b from-slate-900/70 to-slate-900/50 backdrop-blur-xl overflow-hidden shadow-[0_20px_80px_-40px_rgba(16,185,129,0.45)]">
              <CardContent className="p-6 md:p-8">
                {/* Goal Selector Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30">
                      <Target className="h-5 w-5 text-teal-300" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {selectedGoal ? selectedGoal.title : "Select a Goal"}
                      </h2>
                      {selectedGoal && (
                          <p className="text-sm text-slate-300">
                            {selectedGoal.useDailyTargets ? "Daily target mode" : "Total target mode"}
                          </p>
                      )}
                    </div>
                  </div>
                  
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-200 hover:bg-slate-800"
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
                      <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                        <div className="text-sm text-slate-400 mb-2">Select a goal to track:</div>
                        <div className="grid gap-2 max-h-64 overflow-y-auto overflow-x-hidden scroll-y-premium pr-1">
                          {activeGoals.map((goal) => (
                            <button
                              key={goal.id}
                              onClick={() => selectGoal(goal.id)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                                  selectedGoalId === goal.id
                                    ? "bg-teal-500/15 border border-teal-500/50"
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
                                <CheckCircle2 className="h-4 w-4 text-teal-300" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mb-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-3 md:col-span-2">
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Session Label</div>
                    <Input
                      value={sessionLabel}
                      onChange={(e) => guard("track time sessions", () => setTimerSessionLabel(selectedGoalId, e.target.value))}
                      placeholder={selectedGoal ? `Working on ${selectedGoal.title}` : "What are you working on?"}
                      className="mt-2 border-slate-600 bg-slate-900/60 text-slate-100"
                    />
                  </div>
                  <motion.div
                    animate={isRunning ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                    transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
                    className={cn(
                      "rounded-xl border px-4 py-3",
                      isRunning
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-slate-700/60 bg-slate-800/40"
                    )}
                  >
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Session State</div>
                    <div className={cn("mt-2 text-sm font-semibold", isRunning ? "text-emerald-300" : "text-slate-200")}>
                      {isRunning ? "Running" : "Paused"}
                    </div>
                    {remainingMinutes != null && (
                      <div className="mt-1 text-xs text-slate-300">{remainingMinutes} min remaining</div>
                    )}
                  </motion.div>
                </div>
                 
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
                      className="h-14 w-14 rounded-2xl border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                      onClick={handleResetTimer}
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
                          ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30" 
                          : "bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30"
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
                      className="h-14 w-14 rounded-2xl border-teal-400/50 text-teal-300 hover:bg-teal-500/20"
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
                       className="border-slate-600 text-slate-300 hover:bg-teal-500/20 hover:text-teal-200 hover:border-teal-500/50"
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
            <Card className="border border-slate-700/40 bg-slate-800/30 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Target className="h-5 w-5 text-teal-300" />
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
                  <div className="grid gap-3 max-h-[400px] overflow-y-auto overflow-x-hidden scroll-y-premium pr-1">
                    {activeGoals.map((goal, index) => {
                      const goalTrackedMinutes = goalTrackedMinutesMap.get(goal.id) ?? 0
                      
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
                            isRunning={timerState.runningGoalId === goal.id}
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
            {selectedGoal?.useDailyTargets && (
              <Card className="border border-slate-700/40 bg-slate-800/30 backdrop-blur-xl">
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
            <Card className="border border-slate-700/40 bg-slate-800/30 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <History className="h-5 w-5 text-teal-300" />
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
                  <div className="space-y-0 max-h-64 overflow-y-auto overflow-x-hidden scroll-y-premium">
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
                            <div className="h-8 w-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-teal-300" />
                            </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {session.label || "Focus session"}
                            </p>
                              {sessionGoal && (
                                <p className="text-xs text-teal-300">{sessionGoal.title}</p>
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
          handleResetTimer()
        }}
        onContinue={() => {
          guard("track time sessions", () => startTimer(selectedGoalId))
        }}
      />
      <AuthPromptModal
        isOpen={authPrompt.isOpen}
        onClose={authPrompt.closePrompt}
        action={authPrompt.action}
        nextPath={authPrompt.nextPath}
      />
    </motion.div>
  )
}
