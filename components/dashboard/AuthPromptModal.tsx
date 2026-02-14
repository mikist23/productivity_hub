"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Lock, ArrowRight, UserPlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider"
import { useState, useCallback } from "react"

interface AuthPromptModalProps {
  isOpen: boolean
  onClose: () => void
  action?: string
  nextPath?: string
}

export function AuthPromptModal({ isOpen, onClose, action = "perform this action", nextPath = "/dashboard" }: AuthPromptModalProps) {
  const { user } = useAuth()
  const encodedNext = encodeURIComponent(nextPath)

  // Don't show if user is already authenticated
  if (user) {
    if (isOpen) onClose()
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-hidden bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex-1 overflow-y-auto p-8">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Lock className="h-8 w-8 text-primary" />
                </div>

                {/* Content */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Sign in Required</h3>
                  <p className="text-muted-foreground">
                    You need to sign in to {action}. Create a free account to save your progress and access all features.
                  </p>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                  Your data is securely stored in MongoDB for this account
                </p>
              </div>

              <div className="shrink-0 border-t border-border p-4 backdrop-blur-sm [padding-bottom:max(env(safe-area-inset-bottom),1rem)]">
                <div className="space-y-3">
                  <Link href={`/login?next=${encodedNext}`} className="block">
                    <Button className="w-full h-12 text-base gap-2">
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Link href={`/signup?next=${encodedNext}`} className="block">
                    <Button variant="outline" className="w-full h-12 text-base gap-2">
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </Button>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={onClose}
                  >
                    Continue browsing
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook to easily use auth prompt
export function useAuthPrompt() {
  const [isOpen, setIsOpen] = useState(false)
  const [action, setAction] = useState("perform this action")
  const [nextPath, setNextPath] = useState("/dashboard")
  const { user } = useAuth()

  const promptAuth = useCallback((actionDescription: string, returnPath?: string) => {
    if (user) return true // User is authenticated, allow action
    
    setAction(actionDescription)
    setNextPath(returnPath || window.location.pathname)
    setIsOpen(true)
    return false // Block action, show prompt
  }, [user])

  const closePrompt = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    action,
    nextPath,
    promptAuth,
    closePrompt
  }
}
