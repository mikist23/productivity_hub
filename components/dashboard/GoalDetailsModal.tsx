"use client"

import { useEffect, useMemo, useState } from "react"
import { Clock, Pencil, Plus, Save, Trash2, X } from "lucide-react"
import { useDashboard, type Goal, type GoalRoadmapItem, type GoalStatus } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { AuthPromptModal } from "@/components/dashboard/AuthPromptModal"
import { useGuardedAction } from "@/components/dashboard/useGuardedAction"

type ImportStep = {
  externalId?: string
  title: string
  selected: boolean
}

type ImportSourceOption = "auto" | "w3schools" | "roadmapsh" | "freecodecamp"

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
    updateGoalRoadmapItem,
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
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const [importUrl, setImportUrl] = useState("")
  const [selectedImportSource, setSelectedImportSource] = useState<ImportSourceOption>("auto")
  const [importSource, setImportSource] = useState<string | null>(null)
  const [importSteps, setImportSteps] = useState<ImportStep[]>([])
  const [importError, setImportError] = useState("")
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    setNewStep("")
    setEditingItemId(null)
    setEditingTitle("")
    setImportUrl("")
    setSelectedImportSource("auto")
    setImportSource(null)
    setImportSteps([])
    setImportError("")
    setIsImporting(false)
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

  const beginEdit = (item: GoalRoadmapItem) => {
    setEditingItemId(item.id)
    setEditingTitle(item.title)
  }

  const saveEdit = () => {
    if (!goal || !editingItemId) return
    const trimmed = editingTitle.trim()
    if (!trimmed) return
    guard("update goals", () => {
      updateGoalRoadmapItem(goal.id, editingItemId, trimmed)
      setEditingItemId(null)
      setEditingTitle("")
    })
  }

  const cancelEdit = () => {
    setEditingItemId(null)
    setEditingTitle("")
  }

  const fetchImportedSteps = async (sourceOverride?: ImportSourceOption) => {
    const trimmed = importUrl.trim()
    if (!trimmed) return

    setImportError("")
    setIsImporting(true)

    try {
      const sourceToUse = sourceOverride ?? selectedImportSource
      const response = await fetch("/api/roadmap/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, source: sourceToUse }),
      })

      const payload = await response.json().catch(() => null) as
        | { source?: string; steps?: Array<{ title: string; externalId?: string }>; error?: string }
        | null

      if (!response.ok || !payload?.steps) {
        setImportError(payload?.error || "Unable to import steps from this URL")
        setImportSteps([])
        setImportSource(null)
        return
      }

      setImportSource(payload.source ?? null)
      setImportSteps(payload.steps.map((step) => ({ ...step, selected: true })))
    } catch {
      setImportError("Unable to import steps from this URL")
      setImportSteps([])
      setImportSource(null)
    } finally {
      setIsImporting(false)
    }
  }

  const selectImportSource = (source: ImportSourceOption) => {
    setSelectedImportSource(source)
    if (importUrl.trim().length > 0 && !isImporting) {
      void fetchImportedSteps(source)
    }
  }

  const toggleImportedStep = (index: number) => {
    setImportSteps((prev) => prev.map((step, idx) => idx === index ? { ...step, selected: !step.selected } : step))
  }

  const toggleAllImportedSteps = (checked: boolean) => {
    setImportSteps((prev) => prev.map((step) => ({ ...step, selected: checked })))
  }

  const addImportedSteps = () => {
    if (!goal) return
    const selected = importSteps.filter((step) => step.selected)
    if (selected.length === 0) return

      guard("update goals", () => {
        for (const step of selected) {
          addGoalRoadmapItem(goal.id, step.title)
        }
        setImportSteps([])
        setImportUrl("")
        setSelectedImportSource("auto")
        setImportSource(null)
        setImportError("")
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
  const allSelected = importSteps.length > 0 && importSteps.every((step) => step.selected)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal.title}
      description={`${statusLabel(goal.status)} - ${goal.category} - ${goal.priority} priority`}
      footer={
        <div className="flex items-center justify-between">
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
      }
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
          <div className="space-y-1">
            <div className="text-sm font-semibold">Target hours</div>
            <div className="text-xs text-muted-foreground">
              Optional: when logged time reaches the target, the goal completes.
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

        <div className="space-y-3 rounded-xl border border-border p-3">
          <div className="text-sm font-semibold">Import from URL</div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedImportSource === "w3schools" ? "primary" : "outline"}
              size="sm"
              onClick={() => selectImportSource("w3schools")}
            >
              Load from W3Schools
            </Button>
            <Button
              variant={selectedImportSource === "roadmapsh" ? "primary" : "outline"}
              size="sm"
              onClick={() => selectImportSource("roadmapsh")}
            >
              Load from roadmap.sh
            </Button>
            <Button
              variant={selectedImportSource === "freecodecamp" ? "primary" : "outline"}
              size="sm"
              onClick={() => selectImportSource("freecodecamp")}
            >
              Load from freeCodeCamp
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://w3schools.io/... or https://roadmap.sh/... or https://freecodecamp.org/..."
            />
            <Button variant="secondary" onClick={() => fetchImportedSteps()} disabled={isImporting || importUrl.trim().length === 0}>
              {isImporting ? "Loading..." : "Fetch"}
            </Button>
          </div>
          {importSource && <div className="text-xs text-muted-foreground">Detected source: {importSource}</div>}
          {importError && <div className="text-xs text-destructive">{importError}</div>}

          {importSteps.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={allSelected} onChange={(e) => toggleAllImportedSteps(e.target.checked)} />
                Select all
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1 rounded border border-border p-2">
                {importSteps.map((step, index) => (
                  <label key={`${step.externalId ?? step.title}-${index}`} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={step.selected}
                      onChange={() => toggleImportedStep(index)}
                      className="mt-1"
                    />
                    <span>{step.title}</span>
                  </label>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={addImportedSteps}
                disabled={importSteps.every((step) => !step.selected)}
              >
                Add selected steps
              </Button>
            </div>
          )}
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
                    <div className="flex-1 min-w-0 space-y-2">
                      {editingItemId === item.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                saveEdit()
                              }
                              if (e.key === "Escape") {
                                e.preventDefault()
                                cancelEdit()
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={saveEdit}>
                              <Save className="h-3 w-3 mr-1" /> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="h-3 w-3 mr-1" /> Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className={cn("text-sm font-medium", item.done && "line-through text-muted-foreground")}>
                          {item.title}
                        </div>
                      )}
                    </div>
                    {editingItemId !== item.id && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => beginEdit(item)}
                        aria-label="Edit step"
                        title="Edit step"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
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
