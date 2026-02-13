"use client"

import React from "react"
import { motion } from "framer-motion"
import { Play, Clock, Target, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Goal } from "@/app/dashboard/providers"

interface GoalCardProps {
  goal: Goal
  isSelected?: boolean
  isRunning?: boolean
  accumulatedMinutes?: number
  onSelect?: () => void
  onStartTimer?: () => void
  className?: string
}

export function GoalCard({
  goal,
  isSelected = false,
  isRunning = false,
  accumulatedMinutes = 0,
  onSelect,
  onStartTimer,
  className
}: GoalCardProps) {
  // Calculate progress
  let progress = 0
  let targetDisplay = ""
  let progressDisplay = ""
  
  if (goal.useDailyTargets && goal.dailyTargets) {
    const today = new Date().toISOString().split('T')[0]
    const todayTarget = goal.dailyTargets.find(dt => dt.date === today)
    
    if (todayTarget) {
      const actual = accumulatedMinutes
      progress = todayTarget.targetMinutes > 0
        ? Math.min(100, Math.round((actual / todayTarget.targetMinutes) * 100))
        : 0
      targetDisplay = formatDuration(todayTarget.targetMinutes)
      progressDisplay = `${formatDuration(actual)} / ${targetDisplay}`
    }
  } else if (goal.targetMinutes) {
    const totalTracked = accumulatedMinutes // This would be passed from parent
    progress = Math.min(100, Math.round((totalTracked / goal.targetMinutes) * 100))
    targetDisplay = formatDuration(goal.targetMinutes)
    progressDisplay = `${formatDuration(totalTracked)} / ${targetDisplay}`
  } else {
    progress = goal.progress || 0
    progressDisplay = `${progress}%`
  }
  
  const isComplete = progress >= 100
  const hasProgress = progress > 0
  
  // Category colors
  const categoryColors: Record<string, string> = {
    skill: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    career: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    health: "bg-green-500/20 text-green-400 border-green-500/30",
    personal: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    finance: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    general: "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "relative p-4 rounded-xl border cursor-pointer transition-all duration-300",
        "bg-slate-800/50 backdrop-blur-sm",
        isSelected 
          ? "border-teal-500/50 bg-teal-500/10 shadow-lg shadow-teal-500/10" 
          : "border-slate-700/50 hover:border-slate-600",
        isRunning && "ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-slate-900",
        className
      )}
      onClick={onSelect}
    >
      {/* Running indicator */}
      {isRunning && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate text-sm">
            {goal.title}
          </h3>
          
          {/* Category Badge */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn(
              "px-2 py-0.5 text-[10px] font-medium rounded-full border uppercase tracking-wider",
              categoryColors[goal.category] || categoryColors.general
            )}>
              {goal.category}
            </span>
            
            {goal.priority === "high" && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="High priority" />
            )}
          </div>
        </div>
        
        {/* Start Button */}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-8 w-8 rounded-full shrink-0",
            isRunning 
              ? "bg-emerald-500 text-white hover:bg-emerald-600" 
              : "bg-slate-700/50 text-slate-400 hover:bg-teal-500/20 hover:text-teal-200"
          )}
          onClick={(e) => {
            e.stopPropagation()
            onStartTimer?.()
          }}
        >
          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
        </Button>
      </div>
      
      {/* Progress Section */}
      <div className="mt-4 space-y-2">
        {/* Progress Bar */}
        <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
              isComplete
                  ? "bg-emerald-500"
                  : hasProgress
                    ? "bg-gradient-to-r from-emerald-500 to-lime-400"
                    : "bg-gradient-to-r from-cyan-500 to-teal-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Shimmer effect */}
          {isRunning && (
            <motion.div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>
        
        {/* Progress Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{progressDisplay}</span>
          </div>
          
          <div className="flex items-center gap-1">
            {isComplete ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Complete
              </span>
            ) : (
              <span className={cn(
                "font-medium",
                progress >= 75 ? "text-amber-300" : "text-cyan-300"
              )}>
                {Math.round(progress)}%
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Target indicator */}
      {(goal.targetMinutes || (goal.useDailyTargets && goal.dailyTargets)) && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500">
          <Target className="h-3 w-3" />
          <span>
            {goal.useDailyTargets ? "Daily target" : "Target"}: {targetDisplay}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// Helper function to format duration
function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`
  if (hrs > 0) return `${hrs}h`
  return `${mins}m`
}
