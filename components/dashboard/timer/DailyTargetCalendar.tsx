"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { DailyTarget } from "@/app/dashboard/providers"

interface DailyTargetCalendarProps {
  dailyTargets: DailyTarget[]
  onUpdateTarget: (date: string, targetMinutes: number) => void
  onAddTarget: (date: string, targetMinutes: number) => void
  className?: string
}

export function DailyTargetCalendar({
  dailyTargets,
  onUpdateTarget,
  onAddTarget,
  className
}: DailyTargetCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingTarget, setEditingTarget] = useState<{ hours: string; minutes: string }>({ hours: "1", minutes: "0" })
  
  // Get week dates
  const getWeekDates = (weekOffset: number) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7)
    
    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }
  
  const weekDates = getWeekDates(currentWeek)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
  // Get target for a specific date
  const getTargetForDate = (dateStr: string): DailyTarget | undefined => {
    return dailyTargets.find(dt => dt.date === dateStr)
  }
  
  // Get status color
  const getStatusColor = (target?: DailyTarget) => {
    if (!target) return "bg-slate-700/30 text-slate-500 border-slate-600/30"
    if (target.isComplete) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
    if (target.actualMinutes > 0) return "bg-amber-500/20 text-amber-400 border-amber-500/50"
    return "bg-violet-500/20 text-violet-400 border-violet-500/50"
  }
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }
  
  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date)
    setSelectedDate(dateStr)
    
    const existingTarget = getTargetForDate(dateStr)
    if (existingTarget) {
      const hrs = Math.floor(existingTarget.targetMinutes / 60)
      const mins = existingTarget.targetMinutes % 60
      setEditingTarget({ hours: hrs.toString(), minutes: mins.toString() })
    } else {
      setEditingTarget({ hours: "1", minutes: "0" })
    }
  }
  
  const handleSaveTarget = () => {
    if (!selectedDate) return
    
    const hrs = parseInt(editingTarget.hours) || 0
    const mins = parseInt(editingTarget.minutes) || 0
    const totalMinutes = hrs * 60 + mins
    
    const existingTarget = getTargetForDate(selectedDate)
    if (existingTarget) {
      onUpdateTarget(selectedDate, totalMinutes)
    } else {
      onAddTarget(selectedDate, totalMinutes)
    }
    
    setSelectedDate(null)
  }
  
  const navigateWeek = (direction: number) => {
    setCurrentWeek(prev => prev + direction)
    setSelectedDate(null)
  }
  
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-violet-400" />
          Weekly Targets
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={() => navigateWeek(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-slate-400 px-2">
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={() => navigateWeek(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day, index) => (
          <div key={day} className="text-center">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              {day}
            </div>
            
            {(() => {
              const date = weekDates[index]
              const dateStr = formatDate(date)
              const target = getTargetForDate(dateStr)
              const isSelected = selectedDate === dateStr
              
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "w-full aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all duration-200",
                    getStatusColor(target),
                    isToday(date) && "ring-1 ring-white/50",
                    isSelected && "ring-2 ring-violet-500"
                  )}
                >
                  <span className="text-xs font-semibold">
                    {date.getDate()}
                  </span>
                  
                  {target && (
                    <span className="text-[8px] opacity-80">
                      {formatDuration(target.targetMinutes)}
                    </span>
                  )}
                  
                  {!target && (
                    <Plus className="h-3 w-3 opacity-50" />
                  )}
                </motion.button>
              )
            })()}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-700/50" />
          <span>No target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-violet-500/50" />
          <span>Set</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500/50" />
          <span>In progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
          <span>Complete</span>
        </div>
      </div>
      
      {/* Edit Modal */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400 hover:text-white"
                onClick={() => setSelectedDate(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Hours</label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={editingTarget.hours}
                  onChange={(e) => setEditingTarget(prev => ({ ...prev, hours: e.target.value }))}
                  className="h-9 bg-slate-900/50 border-slate-700 text-center text-white"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Minutes</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={editingTarget.minutes}
                  onChange={(e) => setEditingTarget(prev => ({ ...prev, minutes: e.target.value }))}
                  className="h-9 bg-slate-900/50 border-slate-700 text-center text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => setSelectedDate(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handleSaveTarget}
              >
                Save Target
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper function
function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`
  if (hrs > 0) return `${hrs}h`
  return `${mins}m`
}
