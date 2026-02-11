"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Trophy, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CelebrationProps {
  isOpen: boolean
  goalTitle: string
  message?: string
  onClose: () => void
  onContinue?: () => void
  className?: string
}

export function Celebration({
  isOpen,
  goalTitle,
  message = "You've reached your daily target!",
  onClose,
  onContinue,
  className
}: CelebrationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm",
            className
          )}
          onClick={onClose}
        >
          {/* Background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  y: [0, -100, -200],
                  x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-emerald-500/20 to-violet-500/20 blur-3xl" />
            
            <div className="relative p-8 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
              {/* Top decoration */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-emerald-500 to-violet-500" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Icon */}
              <motion.div
                className="relative mx-auto w-20 h-20 mb-6"
                animate={{
                  rotate: [0, 10, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-emerald-500/30 rounded-full blur-xl" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                
                {/* Sparkles */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <motion.div
                    key={angle}
                    className="absolute w-2 h-2"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${angle}deg) translateX(45px)`
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-full h-full text-yellow-400" />
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Content */}
              <div className="text-center space-y-3">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white"
                >
                  Goal Complete! 🎉
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-violet-300 font-medium"
                >
                  {goalTitle}
                </motion.p>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400 text-sm"
                >
                  {message}
                </motion.p>
              </div>
              
              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 mt-8"
              >
                <Button
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  onClick={onClose}
                >
                  Stop Timer
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700 text-white"
                  onClick={() => {
                    onContinue?.()
                    onClose()
                  }}
                >
                  Continue
                </Button>
              </motion.div>
              
              {/* Achievement badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
              >
                <div className="p-2 rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-emerald-300">Achievement Unlocked</div>
                  <div className="text-xs text-emerald-400/70">Daily target completed</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
