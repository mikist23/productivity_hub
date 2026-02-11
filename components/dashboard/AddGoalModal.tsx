"use client"

import { useState } from "react"
import { useDashboard, GoalStatus, Priority } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"

interface AddGoalModalProps {
  isOpen: boolean
  onClose: () => void
  defaultStatus?: GoalStatus
}

export function AddGoalModal({ isOpen, onClose, defaultStatus = 'todo' }: AddGoalModalProps) {
  const { addGoal } = useDashboard()
  const [title, setTitle] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [category, setCategory] = useState("Personal")
  const [priority, setPriority] = useState<Priority>("medium")
  const [targetHours, setTargetHours] = useState<string>("")
  const [roadmapText, setRoadmapText] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    const hours = Number(targetHours)
    const targetMinutes =
      targetHours.trim().length === 0 || !Number.isFinite(hours) || hours <= 0
        ? undefined
        : Math.round(hours * 60)

    const roadmap = roadmapText
      .split(/\r?\n/g)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((t) => ({ title: t, done: false }))
    
    addGoal({
        title: title.trim(),
        targetDate: targetDate || new Date().toISOString().split("T")[0],
        progress: 0,
        status: defaultStatus,
        category,
        priority,
        targetMinutes,
        roadmap,
        useDailyTargets: false,
        createdAt: new Date().toISOString()
    })
    
    setTitle("")
    setTargetDate("")
    setCategory("Personal")
    setPriority("medium")
    setTargetHours("")
    setRoadmapText("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set New Goal"
      description="Define a long-term objective."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Goal Title</Label>
          <Input 
            id="title" 
            placeholder="e.g. Launch SaaS MVP" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="Personal">Personal</option>
                    <option value="Dev">Dev</option>
                    <option value="Career">Career</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </Select>
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="date">Target Date (Optional)</Label>
            <Input 
                id="date" 
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="goal-hours">Target Hours (Optional)</Label>
                <Input
                    id="goal-hours"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.25"
                    value={targetHours}
                    onChange={(e) => setTargetHours(e.target.value)}
                    placeholder="e.g. 4"
                />
                <p className="text-xs text-muted-foreground">
                    If set, logging time can auto-complete this goal.
                </p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="goal-roadmap">Roadmap (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                    Add project steps to auto-calculate progress.
                </p>
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="goal-roadmap-text">Roadmap steps</Label>
            <Textarea
                id="goal-roadmap-text"
                value={roadmapText}
                onChange={(e) => setRoadmapText(e.target.value)}
                placeholder={"One per line.\nExample:\nLanding page\nAuth\nDashboard\nDeploy"}
                rows={5}
            />
        </div>

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Goal</Button>
        </div>
      </form>
    </Modal>
  )
}
