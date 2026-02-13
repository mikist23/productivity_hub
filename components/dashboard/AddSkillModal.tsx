"use client"

import { useState } from "react"
import { useDashboard, type SkillStatus } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface AddSkillModalProps {
  isOpen: boolean
  onClose: () => void
  initialCategory?: string
  initialName?: string
  initialLevel?: string
  initialStatus?: SkillStatus
  initialProgress?: number
}

export function AddSkillModal({
  isOpen,
  onClose,
  initialCategory,
  initialName,
  initialLevel,
  initialStatus,
  initialProgress,
}: AddSkillModalProps) {
  const { addSkill, skills } = useDashboard()
  const [category, setCategory] = useState(initialCategory ?? "Language")
  const [name, setName] = useState(initialName ?? "")
  const [level, setLevel] = useState(initialLevel ?? "Beginner")
  const [progress, setProgress] = useState(initialProgress ?? 0)
  const [status, setStatus] = useState<SkillStatus>(initialStatus ?? "learning")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addSkill(category, {
      name,
      level,
      progress: Number(progress),
      status
    })
    // Reset form
    setName(initialName ?? "")
    setProgress(initialProgress ?? 0)
    onClose()
  }

  // Get unique categories and allow adding new ones
  const existingCategories = skills.map(s => s.category)
  const allCategories = Array.from(new Set([...existingCategories, "Language", "Framework", "Tool", "Soft Skill"]))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Skill"
      description="Track what you are learning and mastering."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="flex gap-2">
                <Select 
                    id="category" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {allCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </Select>
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Skill Name</Label>
          <Input 
            id="name" 
            placeholder="e.g. React Patterns, System Design" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="level">Proficiency</Label>
                <Select 
                    id="level" 
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
                <Label htmlFor="status">Status</Label>
                 <Select 
                    id="status" 
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
            <Label htmlFor="progress">Progress ({progress}%)</Label>
            <input
                type="range"
                min="0"
                max="100"
                step="5"
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
            />
        </div>

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Skill</Button>
        </div>
      </form>
    </Modal>
  )
}
