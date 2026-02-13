"use client"

import React from "react"
import { motion } from "framer-motion"
import { Clock, Target, TrendingUp, Zap, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimerStatsProps {
  sessionMinutes: number
  accumulatedMinutes: number
  targetMinutes?: number
  progress: number
  sessionsToday: number
  streakDays?: number
  className?: string
}

export function TimerStats({
  sessionMinutes,
  accumulatedMinutes,
  targetMinutes,
  progress,
  sessionsToday,
  streakDays = 0,
  className
}: TimerStatsProps) {
  const totalMinutes = accumulatedMinutes + sessionMinutes
  const isComplete = progress >= 100
  
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`
    if (hrs > 0) return `${hrs}h`
    return `${mins}m`
  }
  
  const stats = [
    {
      icon: Clock,
      label: "Session",
      value: formatTime(sessionMinutes),
      color: "text-cyan-300",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: Target,
      label: "Today",
      value: formatTime(totalMinutes),
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Zap,
      label: "Sessions",
      value: sessionsToday.toString(),
      color: "text-amber-400",
      bgColor: "bg-amber-500/10"
    },
    {
      icon: TrendingUp,
      label: "Streak",
      value: `${streakDays} days`,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    }
  ]
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("p-1.5 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
              </div>
              <span className="text-xs text-slate-400">{stat.label}</span>
            </div>
            <div className="text-xl font-bold text-white tabular-nums">
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Progress Card */}
      {targetMinutes && targetMinutes > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "p-4 rounded-xl border backdrop-blur-sm",
            isComplete 
              ? "bg-emerald-500/10 border-emerald-500/30" 
              : "bg-slate-800/50 border-slate-700/50"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  isComplete ? "bg-emerald-500/20" : "bg-cyan-500/10"
                )}>
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Target className="h-4 w-4 text-cyan-300" />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                isComplete ? "text-emerald-400" : "text-white"
              )}>
                {isComplete ? "Target Reached!" : "Progress to Target"}
              </span>
            </div>
            <span className={cn(
              "text-lg font-bold tabular-nums",
              isComplete ? "text-emerald-400" : "text-cyan-300"
            )}>
              {Math.round(progress)}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                isComplete 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400" 
                  : "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            
            {/* Shimmer effect */}
            {!isComplete && (
              <motion.div
                className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "500%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
          
          {/* Target Info */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Current: {formatTime(totalMinutes)}</span>
            <span>Target: {formatTime(targetMinutes)}</span>
          </div>
          
          {/* Milestone indicators */}
          <div className="mt-3 flex items-center justify-between">
            {[25, 50, 75, 100].map((milestone) => (
              <div key={milestone} className="flex flex-col items-center gap-1">
                <motion.div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                      progress >= milestone
                        ? milestone === 100
                          ? "bg-emerald-400 scale-125"
                        : "bg-cyan-300"
                      : "bg-slate-700"
                  )}
                  animate={progress >= milestone ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                />
                <span className="text-[9px] text-slate-500">{milestone}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Quick insights */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-500/5 border border-teal-500/20">
        <Zap className="h-4 w-4 text-teal-300" />
        <span className="text-xs text-teal-100">
          {isComplete 
            ? "Great job! You've reached your target for today." 
            : progress >= 75 
              ? "Almost there! Keep pushing to reach your goal."
              : progress >= 50
                ? "Halfway there! You're making great progress."
                : progress >= 25
                  ? "Good start! Stay focused and keep going."
                  : "Let's get started! Every minute counts."
          }
        </span>
      </div>
    </div>
  )
}
