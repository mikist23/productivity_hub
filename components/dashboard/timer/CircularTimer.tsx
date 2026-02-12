"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CircularTimerProps {
  seconds: number
  isRunning: boolean
  size?: number
  strokeWidth?: number
  progress?: number
  accumulatedMinutes?: number
  targetMinutes?: number
  showProgress?: boolean
  pulseOnRunning?: boolean
}

// Animated digit component with flip effect
function AnimatedDigit({ value }: { value: string }) {
  return (
    <div className="relative overflow-hidden h-[1em] w-[0.65em] flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -30, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: 30, opacity: 0, filter: "blur(4px)" }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            mass: 0.5
          }}
          className="absolute inset-0 flex items-center justify-center text-current"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

// Time unit display
function TimeUnit({ value }: { value: string }) {
  const [tens, ones] = value.split('')
  
  return (
    <div className="flex items-center text-current">
      <AnimatedDigit value={tens} />
      <AnimatedDigit value={ones} />
    </div>
  )
}

export function CircularTimer({
  seconds,
  isRunning,
  size = 540,
  strokeWidth = 10,
  progress = 0,
  accumulatedMinutes = 0,
  targetMinutes,
  showProgress = true,
  pulseOnRunning = true
}: CircularTimerProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return {
      hrs: hrs.toString().padStart(2, '0'),
      mins: mins.toString().padStart(2, '0'),
      secs: secs.toString().padStart(2, '0')
    }
  }
   
  const time = formatTime(seconds)
  const isComplete = progress >= 100
  const hasProgress = progress > 0
  
  const formatAccumulated = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) return `${hrs}h ${mins}m`
    return `${mins}m`
  }
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow effect when running */}
      {isRunning && pulseOnRunning && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 30px 10px rgba(139, 92, 246, 0.1)",
              "0 0 50px 20px rgba(139, 92, 246, 0.2)",
              "0 0 30px 10px rgba(139, 92, 246, 0.1)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* SVG Circle */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0 transform -rotate-90"
        style={{ zIndex: 1 }}
      >
        <defs>
          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            {hasProgress ? (
              <>
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#c084fc" />
              </>
            )}
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(30, 41, 59, 0.8)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#timerGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          filter={isRunning ? "url(#glow)" : undefined}
        />
      </svg>
      
      {/* Center Content - Inside the Circle */}
      <div 
        className="absolute flex flex-col items-center justify-center text-center z-10"
        style={{
          width: size - strokeWidth * 2 - 40,
          height: size - strokeWidth * 2 - 40,
        }}
      >
        {/* Timer Display */}
        <div className="flex items-baseline justify-center font-mono font-bold text-white">
          {/* Hours */}
          <TimeUnit value={time.hrs} />
          
          {/* Separator */}
          <motion.span 
            className="text-slate-500 mx-0.5 text-4xl md:text-5xl"
            animate={isRunning ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            :
          </motion.span>
          
          {/* Minutes */}
          <TimeUnit value={time.mins} />
          
          {/* Separator */}
          <motion.span 
            className="text-slate-500 mx-0.5 text-4xl md:text-5xl"
            animate={isRunning ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          >
            :
          </motion.span>
          
          {/* Seconds */}
          <TimeUnit value={time.secs} />
        </div>
        
        {/* Label */}
        <motion.div 
          className="mt-2 text-xs font-medium text-slate-500 uppercase tracking-widest"
          animate={isRunning ? { opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Session Time
        </motion.div>
        
        {/* Today Badge */}
        {showProgress && (
          <motion.div 
            className="mt-3 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/50"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-xs text-slate-400">Today: </span>
            <span className="text-sm font-semibold text-white">
              {formatAccumulated(accumulatedMinutes)}
            </span>
          </motion.div>
        )}
        
        {/* Progress */}
        {showProgress && targetMinutes && targetMinutes > 0 && (
          <motion.div 
            className="mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className={cn(
              "text-xs font-semibold",
              hasProgress ? "text-emerald-400" : "text-violet-400"
            )}>
              {isComplete ? "✓ 100% complete" : `${Math.round(progress)}% complete`}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
