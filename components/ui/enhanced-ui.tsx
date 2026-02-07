"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
  onClick?: () => void
}

export function AnimatedCard({ children, className = "", delay = 0, hover = true, onClick }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({ children, className = "", staggerDelay = 0.1 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface FloatingButtonProps {
  children: ReactNode
  onClick: () => void
  className?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}

export function FloatingButton({ 
  children, 
  onClick, 
  className = "", 
  position = "bottom-right" 
}: FloatingButtonProps) {
  const positions = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6", 
    "top-right": "fixed top-6 right-6",
    "top-left": "fixed top-6 left-6"
  }

  return (
    <motion.button
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      whileHover={{ scale: 1.1, rotate: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${positions[position]} z-50 ${className}`}
    >
      {children}
    </motion.button>
  )
}

interface PulseIndicatorProps {
  children: ReactNode
  className?: string
  isActive?: boolean
}

export function PulseIndicator({ children, className = "", isActive = true }: PulseIndicatorProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {isActive && (
        <motion.span
          initial={{ scale: 0.8, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-green-500"
        />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}

interface SlideInFromBottomProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function SlideInFromBottom({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.3 
}: SlideInFromBottomProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
  backgroundColor?: string
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  className = "",
  color = "#3b82f6",
  backgroundColor = "#e2e8f0"
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}