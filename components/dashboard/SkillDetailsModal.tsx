"use client"

import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import type { SkillItem, SkillStatus } from "@/app/dashboard/providers"
import { useDashboard } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AuthPromptModal } from "@/components/dashboard/AuthPromptModal"
import { useGuardedAction } from "@/components/dashboard/useGuardedAction"

interface SkillDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  categoryName: string
  skill: SkillItem
}

export function SkillDetailsModal({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  skill,
}: SkillDetailsModalProps) {
  const { updateSkill, removeSkill } = useDashboard()
  const { guard, authPrompt } = useGuardedAction("/dashboard/skills")

  const [name, setName] = useState(skill.name)
  const [level, setLevel] = useState(skill.level)
  const [status, setStatus] = useState<SkillStatus>(skill.status)
  const [progress, setProgress] = useState(skill.progress)

  const canSave = useMemo(() => name.trim().length > 0, [name])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return

    guard("update skills", () => {
      updateSkill(categoryId, skill.id, {
        name: name.trim(),
        level,
        status,
        progress: Math.max(0, Math.min(100, Number(progress))),
      })
      onClose()
    })
  }

  const handleDelete = () => {
    const ok = window.confirm(`Remove skill: "${skill.name}"?`)
    if (!ok) return
    guard("remove skills", () => {
      removeSkill(categoryId, skill.id)
      onClose()
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={skill.name}
      description={`Category: ${categoryName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="skill-name">Skill Name</Label>
          <Input
            id="skill-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. React Patterns"
            autoFocus
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="skill-level">Proficiency</Label>
            <Select
              id="skill-level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill-status">Status</Label>
            <Select
              id="skill-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as SkillStatus)}
            >
              <option value="learning">Learning</option>
              <option value="inprogress">In Progress</option>
              <option value="mastered">Mastered</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skill-progress">Progress ({progress}%)</Label>
          <input
            id="skill-progress"
            type="range"
            min="0"
            max="100"
            step="5"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Remove
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              Save
            </Button>
          </div>
        </div>
      </form>
      <AuthPromptModal
        isOpen={authPrompt.isOpen}
        onClose={authPrompt.closePrompt}
        action={authPrompt.action}
        nextPath={authPrompt.nextPath}
      />
    </Modal>
  )
}
