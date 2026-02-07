"use client"

import { useState } from "react"
import { useDashboard, GoalStatus, Priority } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    
    addGoal({
        title,
        targetDate: targetDate || new Date().toISOString(),
        progress: 0,
        status: defaultStatus,
        category,
        priority
    })
    
    setTitle("")
    setTargetDate("")
    setCategory("Personal")
    setPriority("medium")
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

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Goal</Button>
        </div>
      </form>
    </Modal>
  )
}
