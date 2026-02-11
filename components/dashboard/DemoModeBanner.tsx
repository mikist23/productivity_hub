"use client"

import { motion } from "framer-motion"
import { X, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function DemoModeBanner() {
  const { user } = useAuth()
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't show if user is authenticated or banner is dismissed
  if (user || isDismissed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="sticky top-0 z-50 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20"
    >
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-sm font-medium">
              Demo Mode
            </span>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              •
            </span>
            <span className="text-sm text-muted-foreground">
              You're browsing in preview mode. Sign in to save your data and unlock all features.
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button size="sm" className="gap-1">
              Sign In
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
