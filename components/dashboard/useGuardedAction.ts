"use client"

import { useCallback } from "react"
import { useAuthPrompt } from "@/components/dashboard/AuthPromptModal"

export function useGuardedAction(defaultNextPath?: string) {
  const { isOpen, action, nextPath, promptAuth, closePrompt } = useAuthPrompt()

  const guard = useCallback(
    (actionLabel: string, callback: () => void, nextPathOverride?: string) => {
      if (promptAuth(actionLabel, nextPathOverride ?? defaultNextPath)) {
        callback()
      }
    },
    [defaultNextPath, promptAuth]
  )

  return {
    guard,
    authPrompt: {
      isOpen,
      action,
      nextPath,
      closePrompt,
    },
  }
}

