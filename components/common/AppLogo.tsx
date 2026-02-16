"use client"

import Image from "next/image"
import goalPilotLogo from "@/lib/images/Goal Pilot.png"
import { cn } from "@/lib/utils"

type AppLogoProps = {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  imageClassName?: string
  priority?: boolean
}

const sizeClasses: Record<NonNullable<AppLogoProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-14 w-14",
}

export function AppLogo({
  size = "md",
  className,
  imageClassName,
  priority = false,
}: AppLogoProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-cyan-400/40 bg-slate-900/95 p-1 shadow-lg shadow-cyan-500/15",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={goalPilotLogo}
        alt="GoalPilot logo"
        className={cn("h-full w-full object-contain", imageClassName)}
        priority={priority}
      />
    </div>
  )
}

