"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Target, Clock, Trophy, Zap, BookOpen, Briefcase, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface QuickGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onAddGoal: (goal: any) => void
}

const goalTemplates = [
  {
    name: "Learn New Skill",
    icon: BookOpen,
    category: "skill",
    defaultTitle: "Master [Skill Name]",
    defaultHours: 20,
    color: "bg-blue-50 text-blue-600 border-blue-100"
  },
  {
    name: "Career Project",
    icon: Briefcase,
    category: "career",
    defaultTitle: "Complete [Project Name]",
    defaultHours: 40,
    color: "bg-purple-50 text-purple-600 border-purple-100"
  },
  {
    name: "Health & Fitness",
    icon: Heart,
    category: "health",
    defaultTitle: "Achieve [Fitness Goal]",
    defaultHours: 15,
    color: "bg-green-50 text-green-600 border-green-100"
  },
  {
    name: "Personal Growth",
    icon: Trophy,
    category: "personal",
    defaultTitle: "Develop [Personal Goal]",
    defaultHours: 25,
    color: "bg-yellow-50 text-yellow-600 border-yellow-100"
  }
]

const suggestedGoals = [
  "Learn React Next.js",
  "Build a portfolio website", 
  "Complete online course",
  "Read 10 books this month",
  "Exercise 3x per week",
  "Learn a new language",
  "Start a side project",
  "Master TypeScript"
]

export function QuickGoalModal({ isOpen, onClose, onAddGoal }: QuickGoalModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof goalTemplates[0] | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [targetHours, setTargetHours] = useState(20)
  const [roadmapSteps, setRoadmapSteps] = useState([""])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (selectedTemplate) {
      setTitle(selectedTemplate.defaultTitle)
      setCategory(selectedTemplate.category)
      setTargetHours(selectedTemplate.defaultHours)
      setRoadmapSteps([""])
    }
  }, [selectedTemplate])

  const handleAddStep = () => {
    setRoadmapSteps([...roadmapSteps, ""])
  }

  const handleUpdateStep = (index: number, value: string) => {
    const updated = [...roadmapSteps]
    updated[index] = value
    setRoadmapSteps(updated)
  }

  const handleRemoveStep = (index: number) => {
    if (roadmapSteps.length > 1) {
      setRoadmapSteps(roadmapSteps.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = () => {
    if (!title.trim()) return

    const validRoadmapSteps = roadmapSteps
      .filter(step => step.trim())
      .map((step, index) => ({
        id: `step-${index}`,
        title: step.trim(),
        done: false
      }))

    const newGoal = {
      title: title.trim(),
      category: category || "general",
      priority,
      targetMinutes: targetHours * 60,
      roadmap: validRoadmapSteps.length > 0 ? validRoadmapSteps : undefined,
      status: "todo" as const,
      progress: 0,
      createdAt: new Date().toISOString()
    }

    onAddGoal(newGoal)
    handleClose()
  }

  const handleClose = () => {
    setSelectedTemplate(null)
    setTitle("")
    setCategory("")
    setPriority("medium")
    setTargetHours(20)
    setRoadmapSteps([""])
    setShowSuggestions(false)
    onClose()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setTitle(suggestion)
    setShowSuggestions(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.2 }}
          className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Create New Goal</h2>
                  <p className="text-sm text-muted-foreground">Set a new objective and track your progress</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Goal Templates */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Quick Start Templates</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {goalTemplates.map((template) => {
                  const Icon = template.icon
                  return (
                    <motion.button
                      key={template.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTemplate(template)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all text-left",
                        selectedTemplate?.name === template.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                        template.color
                      )}
                    >
                      <Icon className="h-5 w-5 mb-2" />
                      <div className="text-sm font-medium">{template.name}</div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Goal Title */}
            <div className="relative">
              <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                Goal Title
              </Label>
              <Input
                id="title"
                placeholder="What do you want to achieve?"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setShowSuggestions(e.target.value.length > 0 && e.target.value.length < 10)
                }}
                className="text-base"
              />
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10"
                >
                  <div className="p-2">
                    <div className="text-xs text-muted-foreground mb-2 px-2">Suggestions:</div>
                    {suggestedGoals.slice(0, 4).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skill">Skill Development</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="health">Health & Fitness</SelectItem>
                    <SelectItem value="personal">Personal Growth</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority" className="text-sm font-medium mb-2 block">
                  Priority
                </Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 High Priority</SelectItem>
                    <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                    <SelectItem value="low">🟢 Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Hours */}
            <div>
              <Label htmlFor="hours" className="text-sm font-medium mb-2 block">
                Target Hours
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="hours"
                  type="number"
                  min="1"
                  max="1000"
                  value={targetHours}
                  onChange={(e) => setTargetHours(Number(e.target.value))}
                  className="flex-1"
                />
                <div className="text-sm text-muted-foreground">hours</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated time to complete this goal
              </p>
            </div>

            {/* Roadmap Steps */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Roadmap Steps (Optional)
              </Label>
              <div className="space-y-2">
                {roadmapSteps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Step ${index + 1}: Describe the milestone...`}
                      value={step}
                      onChange={(e) => handleUpdateStep(index, e.target.value)}
                      className="flex-1"
                    />
                    {roadmapSteps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStep(index)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddStep}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={!title.trim()}
              >
                <Zap className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}