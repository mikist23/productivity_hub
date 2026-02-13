"use client"

import { useEffect, useMemo, useState } from "react"
import { Clock, Plus, Trash2 } from "lucide-react"
import { useDashboard, type Goal, type GoalRoadmapItem, type GoalStatus } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { AuthPromptModal } from "@/components/dashboard/AuthPromptModal"
import { useGuardedAction } from "@/components/dashboard/useGuardedAction"

function minutesToText(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0m"
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs <= 0) return `${mins}m`
  if (mins <= 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

function computeRoadmapProgress(goal: Goal) {
  const items = goal.roadmap ?? []
  if (items.length === 0) return null
  const done = items.filter((i) => i.done).length
  return Math.round((done / items.length) * 100)
}

function computeTimeProgress(goal: Goal, trackedMinutes: number) {
  if (goal.targetMinutes == null || goal.targetMinutes <= 0) return null
  return Math.max(0, Math.min(100, Math.round((trackedMinutes / goal.targetMinutes) * 100)))
}

function statusLabel(status: GoalStatus) {
  if (status === "todo") return "To do"
  if (status === "inprogress") return "In progress"
  return "Completed"
}

export function GoalDetailsModal({
  isOpen,
  onClose,
  goalId,
}: {
  isOpen: boolean
  onClose: () => void
  goalId: string
}) {
  const {
    goals,
    focusSessions,
    addGoalRoadmapItem,
    toggleGoalRoadmapItem,
    removeGoalRoadmapItem,
    setGoalTargetMinutes,
    deleteGoal,
  } = useDashboard()
  const { guard, authPrompt } = useGuardedAction("/dashboard/goals")

  const goal = useMemo(() => goals.find((g) => g.id === goalId) ?? null, [goalId, goals])

  const trackedMinutes = useMemo(() => {
    if (!goal) return 0
    return focusSessions
      .filter((s) => s.goalId === goal.id)
      .reduce((acc, s) => acc + (Number.isFinite(s.minutes) ? s.minutes : 0), 0)
  }, [focusSessions, goal])

  const roadmapProgress = useMemo(() => (goal ? computeRoadmapProgress(goal) : null), [goal])
  const timeProgress = useMemo(() => (goal ? computeTimeProgress(goal, trackedMinutes) : null), [goal, trackedMinutes])

  const [newStep, setNewStep] = useState("")
  const [targetHours, setTargetHours] = useState("")

  useEffect(() => {
    setNewStep("")
    if (!goal?.targetMinutes) {
      setTargetHours("")
      return
    }
    setTargetHours(String(Math.round((goal.targetMinutes / 60) * 100) / 100))
  }, [goalId, goal?.targetMinutes])

  const applyTargetHours = () => {
    if (!goal) return
    const raw = targetHours.trim()
    if (!raw) {
      guard("update goals", () => setGoalTargetMinutes(goal.id, null))
      return
    }
    const hours = Number(raw)
    if (!Number.isFinite(hours) || hours <= 0) return
    guard("update goals", () => setGoalTargetMinutes(goal.id, Math.round(hours * 60)))
  }

  const handleAddStep = () => {
    if (!goal) return
    const trimmed = newStep.trim()
    if (!trimmed) return
    guard("update goals", () => {
      addGoalRoadmapItem(goal.id, trimmed)
      setNewStep("")
    })
  }

  const handleDeleteGoal = () => {
    if (!goal) return
    const ok = window.confirm(`Delete goal: "${goal.title}"?`)
    if (!ok) return
    guard("delete goals", () => {
      deleteGoal(goal.id)
      onClose()
    })
  }

  if (!goal) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Goal details">
        <div className="text-sm text-muted-foreground">Goal not found.</div>
      </Modal>
    )
  }

  const roadmap = goal.roadmap ?? []
  const doneCount = roadmap.filter((s) => s.done).length

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal.title}
      description={`${statusLabel(goal.status)} - ${goal.category} - ${goal.priority} priority`}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="text-muted-foreground">Overall progress</div>
            <div className="font-medium">{goal.progress}%</div>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${goal.progress}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="rounded-xl border border-border bg-accent/20 p-3">
              <div className="text-xs text-muted-foreground">Roadmap</div>
              <div className="mt-1 font-semibold">
                {roadmap.length === 0 ? "-" : `${doneCount}/${roadmap.length}`}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {roadmapProgress == null ? "Add steps to auto-calc." : `${roadmapProgress}% complete`}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-accent/20 p-3">
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="mt-1 font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {minutesToText(trackedMinutes)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {goal.targetMinutes
                  ? `Target ${minutesToText(goal.targetMinutes)} - ${timeProgress ?? 0}%`
                  : "Set a target to auto-complete."}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-semibold">Target hours</div>
              <div className="text-xs text-muted-foreground">
                Optional: when logged time reaches the target, the goal completes.
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              value={targetHours}
              onChange={(e) => setTargetHours(e.target.value)}
              onBlur={applyTargetHours}
              inputMode="decimal"
              placeholder="e.g. 4"
            />
            <Button variant="secondary" onClick={applyTargetHours}>
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">Roadmap</div>
            <div className="text-xs text-muted-foreground">{roadmap.length} steps</div>
          </div>

          <div className="space-y-2">
            {roadmap.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-accent/10 p-4 text-sm text-muted-foreground">
                Add steps to create a roadmap and auto-calculate progress.
              </div>
            ) : (
              <div className="max-h-[240px] overflow-y-auto pr-2 space-y-2">
                {roadmap.map((item: GoalRoadmapItem) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border border-border bg-card p-3",
                      item.done && "bg-accent/20"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={item.done}
                      onChange={() => guard("update goals", () => toggleGoalRoadmapItem(goal.id, item.id))}
                      aria-label={`Mark ${item.title} done`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-sm font-medium", item.done && "line-through text-muted-foreground")}>
                        {item.title}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => guard("update goals", () => removeGoalRoadmapItem(goal.id, item.id))}
                      aria-label="Delete step"
                      title="Delete step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Add a roadmap step..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddStep()
                }
              }}
            />
            <Button onClick={handleAddStep}>
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={handleDeleteGoal}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete goal
          </Button>
        </div>
      </div>
      <AuthPromptModal
        isOpen={authPrompt.isOpen}
        onClose={authPrompt.closePrompt}
        action={authPrompt.action}
        nextPath={authPrompt.nextPath}
      />
    </Modal>
  )
}
