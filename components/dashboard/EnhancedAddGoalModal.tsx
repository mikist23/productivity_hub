"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Target, Clock, Trophy, Zap, BookOpen, Briefcase, Heart, ChevronDown, ChevronUp, Trash2, Sparkles, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LegacySelect } from "@/components/ui/legacy-select"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EnhancedAddGoalModalProps {
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
    color: "bg-blue-50 text-blue-600 border-blue-100",
    description: "Develop a new technical or creative ability"
  },
  {
    name: "Career Project",
    icon: Briefcase,
    category: "career",
    defaultTitle: "Complete [Project Name]",
    defaultHours: 40,
    color: "bg-purple-50 text-purple-600 border-purple-100",
    description: "Work on professional development"
  },
  {
    name: "Health & Fitness",
    icon: Heart,
    category: "health",
    defaultTitle: "Achieve [Fitness Goal]",
    defaultHours: 15,
    color: "bg-green-50 text-green-600 border-green-100",
    description: "Improve physical and mental wellbeing"
  },
  {
    name: "Personal Growth",
    icon: Trophy,
    category: "personal",
    defaultTitle: "Develop [Personal Goal]",
    defaultHours: 25,
    color: "bg-yellow-50 text-yellow-600 border-yellow-100",
    description: "Focus on self-improvement and habits"
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
  "Master TypeScript",
  "Get AWS certified",
  "Launch a SaaS product"
]

export function EnhancedAddGoalModal({ isOpen, onClose, onAddGoal }: EnhancedAddGoalModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof goalTemplates[0] | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [targetHours, setTargetHours] = useState(20)
  const [targetDate, setTargetDate] = useState("")
  const [roadmapSteps, setRoadmapSteps] = useState<{id: string; title: string}[]>([{id: '1', title: ''}])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showRoadmap, setShowRoadmap] = useState(false)

  useEffect(() => {
    if (selectedTemplate) {
      setTitle(selectedTemplate.defaultTitle)
      setCategory(selectedTemplate.category)
      setTargetHours(selectedTemplate.defaultHours)
      setRoadmapSteps([{id: '1', title: ''}])
    }
  }, [selectedTemplate])

  const handleAddStep = () => {
    const newId = (roadmapSteps.length + 1).toString()
    setRoadmapSteps([...roadmapSteps, {id: newId, title: ''}])
  }

  const handleUpdateStep = (id: string, value: string) => {
    const updated = roadmapSteps.map(step => 
      step.id === id ? { ...step, title: value } : step
    )
    setRoadmapSteps(updated)
  }

  const handleRemoveStep = (id: string) => {
    if (roadmapSteps.length > 1) {
      setRoadmapSteps(roadmapSteps.filter(step => step.id !== id))
    }
  }

  const handleSubmit = () => {
    if (!title.trim()) return

    const validRoadmapSteps = roadmapSteps
      .filter(step => step.title.trim())
      .map((step, index) => ({
        id: `step-${index}`,
        title: step.title.trim(),
        done: false
      }))

    const newGoal = {
      title: title.trim(),
      category: category || "general",
      priority,
      targetDate: targetDate || new Date().toISOString().split('T')[0],
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
    setTargetDate("")
    setRoadmapSteps([{id: '1', title: ''}])
    setShowAdvanced(false)
    setShowRoadmap(false)
    onClose()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setTitle(suggestion)
    setSelectedTemplate(null)
  }

  const hasRoadmapSteps = roadmapSteps.some(step => step.title.trim())

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
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Create New Goal</h2>
                  <p className="text-sm text-muted-foreground">Set an objective and break it down into steps</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Goal Templates */}
            <div>
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Quick Start Templates
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {goalTemplates.map((template) => {
                  const Icon = template.icon
                  return (
                    <motion.button
                      key={template.name}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTemplate(template)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left",
                        selectedTemplate?.name === template.name
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/30 hover:shadow-sm",
                        template.color
                      )}
                    >
                      <Icon className="h-5 w-5 mb-2" />
                      <div className="text-sm font-medium">{template.name}</div>
                      <div className="text-xs opacity-70 mt-1">{template.description}</div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Goal Title */}
            <div className="relative">
              <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                Goal Title *
              </Label>
              <Input
                id="title"
                placeholder="What do you want to achieve?"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (selectedTemplate && e.target.value !== selectedTemplate.defaultTitle) {
                    setSelectedTemplate(null)
                  }
                }}
                className="text-base h-12"
              />
            </div>

            {/* Suggested Goals */}
            <div>
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Need inspiration?
              </Label>
              <div className="flex flex-wrap gap-2">
                {suggestedGoals.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-secondary-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                  Category
                </Label>
                <LegacySelect value={category} onValueChange={setCategory}>
                  <option value="">Choose category</option>
                  <option value="skill">Skill Development</option>
                  <option value="career">Career</option>
                  <option value="health">Health & Fitness</option>
                  <option value="personal">Personal Growth</option>
                  <option value="finance">Finance</option>
                  <option value="general">General</option>
                </LegacySelect>
              </div>

              <div>
                <Label htmlFor="priority" className="text-sm font-medium mb-2 block">
                  Priority
                </Label>
                <LegacySelect value={priority} onValueChange={(value: string) => setPriority(value as 'high' | 'medium' | 'low')}>
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </LegacySelect>
              </div>
            </div>

            {/* Target Hours */}
            <div className="grid grid-cols-2 gap-4">
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
                  Estimated time to complete
                </p>
              </div>

              <div>
                <Label htmlFor="targetDate" className="text-sm font-medium mb-2 block">
                  Target Date
                </Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  When do you want to finish?
                </p>
              </div>
            </div>

            {/* Roadmap Section */}
            <div className="border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowRoadmap(!showRoadmap)}
                className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">Add Roadmap Steps</div>
                    <div className="text-xs text-muted-foreground">
                      {hasRoadmapSteps 
                        ? `${roadmapSteps.filter(s => s.title.trim()).length} steps added` 
                        : "Break your goal into manageable steps"}
                    </div>
                  </div>
                </div>
                <ChevronDown className={cn("h-5 w-5 transition-transform", showRoadmap && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showRoadmap && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3 bg-muted/20">
                      {roadmapSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {index + 1}
                          </div>
                          <Input
                            placeholder={`Step ${index + 1}: What needs to be done?`}
                            value={step.title}
                            onChange={(e) => handleUpdateStep(step.id, e.target.value)}
                            className="flex-1"
                          />
                          {roadmapSteps.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveStep(step.id)}
                              className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddStep}
                        className="w-full mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Step
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        Roadmap steps help track your progress and keep you motivated
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                className="flex-1 h-12 text-base"
                disabled={!title.trim()}
              >
                <Zap className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
              <Button variant="outline" onClick={handleClose} className="h-12 px-6">
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
