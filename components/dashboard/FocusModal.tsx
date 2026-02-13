"use client"

import { useState } from "react"
import { useDashboard } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { AuthPromptModal } from "@/components/dashboard/AuthPromptModal"
import { useGuardedAction } from "@/components/dashboard/useGuardedAction"

interface FocusModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FocusModal({ isOpen, onClose }: FocusModalProps) {
  const { addFocusSession, todayFocusMinutes } = useDashboard()
  const [minutes, setMinutes] = useState<string>("")
  const { guard, authPrompt } = useGuardedAction("/dashboard")

  const handleLog = (vals: number) => {
    guard("log focus sessions", () => {
      addFocusSession(vals)
      onClose()
    })
  }

  const handleCustomLog = (e: React.FormEvent) => {
      e.preventDefault()
      const val = parseInt(minutes)
      if (val && !isNaN(val)) {
          guard("log focus sessions", () => {
            addFocusSession(val)
            setMinutes("")
            onClose()
          })
      }
  }

  const hours = (todayFocusMinutes / 60).toFixed(1)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Focus Timer"
      description="Log your deep work sessions."
    >
      <div className="space-y-6 text-center">
        <div className="py-6 bg-accent/30 rounded-full w-32 h-32 mx-auto flex flex-col items-center justify-center border-4 border-primary/20">
            <span className="text-4xl font-bold">{hours}h</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Today</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
             {[15, 30, 60].map(m => (
                 <Button key={m} variant="outline" onClick={() => handleLog(m)} className="h-auto py-4 flex flex-col gap-1">
                     <span className="text-xl font-bold">{m}</span>
                     <span className="text-xs text-muted-foreground">min</span>
                 </Button>
             ))}
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or custom amount</span>
            </div>
        </div>

        <form onSubmit={handleCustomLog} className="flex gap-2">
             <div className="relative flex-1">
                 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <input 
                    type="number"
                    className="w-full bg-background rounded-md pl-9 pr-4 py-2 text-sm border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter minutes..."
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                 />
             </div>
             <Button type="submit">Log</Button>
        </form>
        <AuthPromptModal
          isOpen={authPrompt.isOpen}
          onClose={authPrompt.closePrompt}
          action={authPrompt.action}
          nextPath={authPrompt.nextPath}
        />
      </div>
    </Modal>
  )
}
