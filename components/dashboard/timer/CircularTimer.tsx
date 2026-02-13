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

function AnimatedDigit({ value, fontSize }: { value: string; fontSize: number }) {
  const digitHeight = Math.max(32, Math.floor(fontSize * 0.94))
  const digitWidth = Math.max(22, Math.floor(fontSize * 0.58))

  return (
    <div
      className="relative overflow-hidden flex items-center justify-center leading-none"
      style={{ height: `${digitHeight}px`, width: `${digitWidth}px` }}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -4, opacity: 0.2 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 4, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 30,
            mass: 0.6,
          }}
          className="absolute inset-0 flex items-center justify-center text-current"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function TimeUnit({ value, fontSize }: { value: string; fontSize: number }) {
  const [tens, ones] = value.split("")

  return (
    <div className="flex items-center text-current">
      <AnimatedDigit value={tens} fontSize={fontSize} />
      <AnimatedDigit value={ones} fontSize={fontSize} />
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
  const timerFontSize = Math.max(30, Math.min(62, Math.floor(size * 0.16)))
  const separatorFontSize = Math.max(18, Math.floor(timerFontSize * 0.55))
  const centerInset = Math.max(24, Math.floor(size * 0.16))
  const centerSize = size - strokeWidth * 2 - centerInset
  const maxTimeRowWidth = Math.max(190, Math.floor(centerSize * 0.9))
  const gradientId = React.useId().replace(/:/g, "")

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return {
      hrs: hrs.toString().padStart(2, "0"),
      mins: mins.toString().padStart(2, "0"),
      secs: secs.toString().padStart(2, "0"),
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
      {isRunning && pulseOnRunning && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            opacity: [0.45, 0.78, 0.45],
            scale: [0.985, 1.015, 0.985],
          }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.16) 0%, rgba(20,184,166,0.08) 38%, rgba(2,6,23,0) 72%)",
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        className="absolute inset-0 transform -rotate-90"
        style={{ zIndex: 1 }}
      >
        <defs>
          <linearGradient id={`${gradientId}-timerGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
            {hasProgress ? (
              <>
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#14b8a6" />
              </>
            )}
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(51, 65, 85, 0.66)"
          strokeWidth={strokeWidth}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(15, 23, 42, 0.32)"
          strokeWidth={Math.max(2, strokeWidth - 4)}
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId}-timerGradient)`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      <div
        className="absolute z-10 flex flex-col items-center justify-center rounded-full border border-slate-700/50 text-center shadow-[inset_0_1px_0_rgba(148,163,184,0.12),inset_0_-18px_38px_rgba(2,6,23,0.45)]"
        style={{
          width: centerSize,
          height: centerSize,
          background:
            "radial-gradient(circle_at_30%_22%,rgba(16,185,129,0.10)_0%,rgba(15,23,42,0.56)_42%,rgba(2,6,23,0.95)_100%)",
        }}
      >
        <div
          className="w-full overflow-hidden px-4"
          style={{ maxWidth: `${maxTimeRowWidth}px` }}
        >
          <div
            className="flex items-center justify-center font-mono font-bold tabular-nums leading-none text-white"
            style={{ fontSize: `${timerFontSize}px`, letterSpacing: "0.02em" }}
          >
            <TimeUnit value={time.hrs} fontSize={timerFontSize} />
            <motion.span 
              className="mx-0.5 leading-none text-slate-400"
              style={{ fontSize: `${separatorFontSize}px` }}
              animate={isRunning ? { opacity: [1, 0.42, 1] } : { opacity: 0.9 }}
              transition={{ duration: 2.2, repeat: isRunning ? Infinity : 0, ease: "easeInOut" }}
            >
              :
            </motion.span>
            <TimeUnit value={time.mins} fontSize={timerFontSize} />
            <motion.span 
              className="mx-0.5 leading-none text-slate-400"
              style={{ fontSize: `${separatorFontSize}px` }}
              animate={isRunning ? { opacity: [1, 0.42, 1] } : { opacity: 0.9 }}
              transition={{
                duration: 2.2,
                repeat: isRunning ? Infinity : 0,
                delay: 1.1,
                ease: "easeInOut",
              }}
            >
              :
            </motion.span>
            <TimeUnit value={time.secs} fontSize={timerFontSize} />
          </div>
        </div>

        <motion.div
          className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300/85"
          animate={isRunning ? { opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          Session Time
        </motion.div>

        {showProgress && (
          <motion.div
            className="mt-3 rounded-full border border-slate-600/60 bg-slate-900/68 px-4 py-1.5 shadow-inner shadow-slate-950/45"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span className="text-xs text-slate-300/90">Today: </span>
            <span className="text-sm font-semibold text-white/95">
              {formatAccumulated(accumulatedMinutes)}
            </span>
          </motion.div>
        )}

        {showProgress && targetMinutes && targetMinutes > 0 && (
          <motion.div
            className="mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.25 }}
          >
            <span className={cn(
              "text-xs font-semibold",
              hasProgress ? "text-emerald-300" : "text-cyan-300"
            )}>
              {isComplete ? "100% complete" : `${Math.round(progress)}% complete`}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
