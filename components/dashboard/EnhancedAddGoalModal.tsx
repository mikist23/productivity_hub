"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Plus, 
  Target, 
  Clock, 
  Trophy, 
  Zap, 
  BookOpen, 
  Briefcase, 
  Heart, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Sparkles, 
  Lightbulb,
  Calendar,
  Repeat,
  CheckCircle2,
  ToggleLeft,
  ToggleRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LegacySelect } from "@/components/ui/legacy-select"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DailyTarget } from "@/app/dashboard/providers"
import { AuthPromptModal } from "@/components/dashboard/AuthPromptModal"
import { useGuardedAction } from "@/components/dashboard/useGuardedAction"
import {
  buildRoadmapSourceUrl,
  resolveSkillSlugFromGoalTitle,
  roadmapSkillCatalog,
  suggestRoadmapSkills,
  type RoadmapSkillCatalogItem,
} from "@/lib/roadmap-import/source-url"

interface EnhancedAddGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onAddGoal: (goal: any) => void
}

type ImportSourceOption = "auto" | "w3schools" | "roadmapsh" | "freecodecamp"

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

const repeatPatterns = [
  { label: "No repeat", value: "none" },
  { label: "Everyday", value: "daily" },
  { label: "Weekdays", value: "weekdays" },
  { label: "Weekends", value: "weekends" },
  { label: "Custom", value: "custom" }
]

export function EnhancedAddGoalModal({ isOpen, onClose, onAddGoal }: EnhancedAddGoalModalProps) {
  const { guard, authPrompt } = useGuardedAction("/dashboard/goals")
  const [selectedTemplate, setSelectedTemplate] = useState<typeof goalTemplates[0] | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [targetHours, setTargetHours] = useState(20)
  const [targetDate, setTargetDate] = useState("")
  const [roadmapSteps, setRoadmapSteps] = useState<{id: string; title: string}[]>([{id: '1', title: ''}])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [importUrl, setImportUrl] = useState("")
  const [selectedImportSource, setSelectedImportSource] = useState<ImportSourceOption>("auto")
  const [importSource, setImportSource] = useState<string | null>(null)
  const [autoMatchedSkill, setAutoMatchedSkill] = useState<string | null>(null)
  const [quickPickerOpen, setQuickPickerOpen] = useState(false)
  const [suggestedSkills, setSuggestedSkills] = useState<RoadmapSkillCatalogItem[]>(roadmapSkillCatalog.slice(0, 10))
  const [importError, setImportError] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [importedSteps, setImportedSteps] = useState<Array<{ externalId?: string; title: string; selected: boolean }>>([])
  
  // Daily targets state
  const [useDailyTargets, setUseDailyTargets] = useState(false)
  const [dailyTargets, setDailyTargets] = useState<Array<{date: string; targetMinutes: number}>>([])
  const [showDailyTargets, setShowDailyTargets] = useState(false)
  const [repeatPattern, setRepeatPattern] = useState("none")
  const [customDays, setCustomDays] = useState<string[]>([])
  const [defaultDailyMinutes, setDefaultDailyMinutes] = useState(60)
  
  // Week days
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
  useEffect(() => {
    if (selectedTemplate) {
      setTitle(selectedTemplate.defaultTitle)
      setCategory(selectedTemplate.category)
      setTargetHours(selectedTemplate.defaultHours)
      setRoadmapSteps([{id: '1', title: ''}])
    }
  }, [selectedTemplate])
  
  // Generate daily targets based on repeat pattern
  useEffect(() => {
    if (!useDailyTargets) {
      setDailyTargets([])
      return
    }
    
    const targets: Array<{date: string; targetMinutes: number}> = []
    const today = new Date()
    
    // Generate for next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      
      let shouldInclude = false
      
      switch (repeatPattern) {
        case "daily":
          shouldInclude = true
          break
        case "weekdays":
          shouldInclude = dayOfWeek >= 1 && dayOfWeek <= 5
          break
        case "weekends":
          shouldInclude = dayOfWeek === 0 || dayOfWeek === 6
          break
        case "custom":
          shouldInclude = customDays.includes(dayOfWeek.toString())
          break
        default:
          shouldInclude = i === 0 // Just today
      }
      
      if (shouldInclude) {
        targets.push({
          date: dateStr,
          targetMinutes: defaultDailyMinutes
        })
      }
    }
    
    setDailyTargets(targets)
  }, [useDailyTargets, repeatPattern, customDays, defaultDailyMinutes])
  
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
  
  const toggleCustomDay = (day: string) => {
    setCustomDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }
  
  const updateDailyTargetMinutes = (index: number, minutes: number) => {
    const updated = [...dailyTargets]
    updated[index] = { ...updated[index], targetMinutes: Math.max(1, minutes) }
    setDailyTargets(updated)
  }

  const fetchImportedSteps = async (sourceOverride?: ImportSourceOption, urlOverride?: string) => {
    const trimmed = (urlOverride ?? importUrl).trim()
    if (!trimmed) return

    if (urlOverride) {
      setImportUrl(trimmed)
    }
    setImportError("")
    setIsImporting(true)

    try {
      const sourceToUse = sourceOverride ?? selectedImportSource
      const response = await fetch("/api/roadmap/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmed, source: sourceToUse }),
      })

      const payload = await response.json().catch(() => null) as
        | { source?: string; steps?: Array<{ title: string; externalId?: string }>; error?: string }
        | null

      if (!response.ok || !payload?.steps) {
        setImportError(payload?.error || "Unable to import steps from this URL")
        setImportedSteps([])
        setImportSource(null)
        return
      }

      setImportSource(payload.source ?? null)
      setImportedSteps(payload.steps.map((step) => ({ ...step, selected: true })))
      setQuickPickerOpen(false)
    } catch {
      setImportError("Unable to import steps from this URL")
      setImportedSteps([])
      setImportSource(null)
    } finally {
      setIsImporting(false)
    }
  }

  const applySkillSelection = (source: Exclude<ImportSourceOption, "auto">, skill: RoadmapSkillCatalogItem) => {
    const generatedUrl = buildRoadmapSourceUrl(source, skill.slug)
    if (!generatedUrl) return
    setAutoMatchedSkill(skill.label)
    setImportError("")
    setQuickPickerOpen(false)
    void fetchImportedSteps(source, generatedUrl)
  }

  const selectImportSource = (source: ImportSourceOption) => {
    setSelectedImportSource(source)

    if (source === "auto") {
      if (importUrl.trim().length > 0 && !isImporting) {
        void fetchImportedSteps(source)
      }
      return
    }

    const candidateText = title.trim()
    const resolved = resolveSkillSlugFromGoalTitle(candidateText)
    if (resolved.slug) {
      const generatedUrl = buildRoadmapSourceUrl(source, resolved.slug)
      if (generatedUrl) {
        const matched = roadmapSkillCatalog.find((skill) => skill.slug === resolved.slug)
        setAutoMatchedSkill(matched?.label ?? resolved.slug)
        setImportError("")
        setQuickPickerOpen(false)
        void fetchImportedSteps(source, generatedUrl)
        return
      }
    }

    if (importUrl.trim().length > 0 && !isImporting) {
      void fetchImportedSteps(source)
      return
    }

    setAutoMatchedSkill(null)
    setSuggestedSkills(suggestRoadmapSkills(candidateText, 12))
    setQuickPickerOpen(true)
  }

  const toggleImportedStep = (index: number) => {
    setImportedSteps(prev => prev.map((step, idx) => idx === index ? { ...step, selected: !step.selected } : step))
  }

  const toggleAllImportedSteps = (checked: boolean) => {
    setImportedSteps(prev => prev.map((step) => ({ ...step, selected: checked })))
  }

  const addImportedStepsToRoadmap = () => {
    const selectedSteps = importedSteps
      .filter((step) => step.selected)
      .map((step) => step.title.trim())
      .filter(Boolean)

    if (selectedSteps.length === 0) return

    const existingTitles = new Set(
      roadmapSteps.map((step) => step.title.trim().toLowerCase()).filter(Boolean)
    )

    const additions = selectedSteps.filter((title) => !existingTitles.has(title.toLowerCase()))
    if (additions.length === 0) return

    setRoadmapSteps((prev) => [
      ...prev,
      ...additions.map((title, idx) => ({ id: `${Date.now()}-${idx}`, title })),
    ])
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
      targetMinutes: useDailyTargets ? undefined : targetHours * 60,
      dailyTargets: useDailyTargets ? dailyTargets : undefined,
      useDailyTargets,
      roadmap: validRoadmapSteps.length > 0 ? validRoadmapSteps : undefined,
      status: "todo" as const,
      progress: 0,
      createdAt: new Date().toISOString()
    }

    guard("add goals", () => {
      onAddGoal(newGoal)
      handleClose()
    })
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
    setUseDailyTargets(false)
    setDailyTargets([])
    setRepeatPattern("none")
    setCustomDays([])
    setDefaultDailyMinutes(60)
    setShowDailyTargets(false)
    setImportUrl("")
    setSelectedImportSource("auto")
    setImportSource(null)
    setAutoMatchedSkill(null)
    setQuickPickerOpen(false)
    setSuggestedSkills(roadmapSkillCatalog.slice(0, 10))
    setImportError("")
    setImportedSteps([])
    setIsImporting(false)
    onClose()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setTitle(suggestion)
    setSelectedTemplate(null)
  }

  const hasRoadmapSteps = roadmapSteps.some(step => step.title.trim())
  const allImportedSelected = importedSteps.length > 0 && importedSteps.every((step) => step.selected)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-background rounded-2xl shadow-2xl max-w-3xl w-full max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="shrink-0 p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
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

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </LegacySelect>
              </div>
            </div>
            
            {/* Daily Targets Toggle */}
            <div className="border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDailyTargets(!showDailyTargets)}
                className="w-full px-4 py-4 flex items-center justify-between bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Daily Targets</div>
                    <div className="text-xs text-muted-foreground">
                      {useDailyTargets 
                        ? `Set ${dailyTargets.length} daily targets` 
                        : "Track progress day by day instead of total hours"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setUseDailyTargets(!useDailyTargets)
                    }}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    style={{ backgroundColor: useDailyTargets ? '#8b5cf6' : '#64748b' }}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        useDailyTargets ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                  <ChevronDown className={cn("h-5 w-5 transition-transform", showDailyTargets && "rotate-180")} />
                </div>
              </button>
              
              <AnimatePresence>
                {showDailyTargets && useDailyTargets && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4 bg-muted/20">
                      {/* Repeat Pattern */}
                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Repeat className="h-4 w-4 text-violet-500" />
                          Repeat Pattern
                        </Label>
                        <LegacySelect value={repeatPattern} onValueChange={setRepeatPattern}>
                          {repeatPatterns.map(pattern => (
                            <option key={pattern.value} value={pattern.value}>{pattern.label}</option>
                          ))}
                        </LegacySelect>
                      </div>
                      
                      {/* Custom Days */}
                      {repeatPattern === "custom" && (
                        <div>
                          <Label className="text-sm font-medium mb-2">Select Days</Label>
                          <div className="flex gap-2">
                            {weekDays.map((day, index) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleCustomDay(index.toString())}
                                className={cn(
                                  "flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all",
                                  customDays.includes(index.toString())
                                    ? "bg-violet-500 text-white"
                                    : "bg-slate-700/30 text-slate-400 hover:bg-slate-700/50"
                                )}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Default Time */}
                      <div>
                        <Label className="text-sm font-medium mb-2">Default Daily Target</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min="1"
                            max="1440"
                            value={Math.floor(defaultDailyMinutes / 60)}
                            onChange={(e) => {
                              const hours = parseInt(e.target.value) || 0
                              const mins = defaultDailyMinutes % 60
                              setDefaultDailyMinutes(hours * 60 + mins)
                            }}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">hours</span>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={defaultDailyMinutes % 60}
                            onChange={(e) => {
                              const hours = Math.floor(defaultDailyMinutes / 60)
                              const mins = parseInt(e.target.value) || 0
                              setDefaultDailyMinutes(hours * 60 + mins)
                            }}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">minutes</span>
                        </div>
                      </div>
                      
                      {/* Preview */}
                      {dailyTargets.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium mb-2">Preview ({dailyTargets.length} days)</Label>
                          <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3 bg-background/50">
                            {dailyTargets.slice(0, 14).map((target, index) => (
                              <div key={target.date} className="flex items-center gap-3 text-sm">
                                <span className="text-muted-foreground w-24">
                                  {new Date(target.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <Input
                                  type="number"
                                  min="1"
                                  value={Math.floor(target.targetMinutes / 60)}
                                  onChange={(e) => {
                                    const hours = parseInt(e.target.value) || 0
                                    const currentMins = target.targetMinutes % 60
                                    updateDailyTargetMinutes(index, hours * 60 + currentMins)
                                  }}
                                  className="w-16 h-8 text-sm"
                                />
                                <span className="text-muted-foreground text-xs">h</span>
                                <Input
                                  type="number"
                                  min="0"
                                  max="59"
                                  value={target.targetMinutes % 60}
                                  onChange={(e) => {
                                    const hours = Math.floor(target.targetMinutes / 60)
                                    const mins = parseInt(e.target.value) || 0
                                    updateDailyTargetMinutes(index, hours * 60 + mins)
                                  }}
                                  className="w-16 h-8 text-sm"
                                />
                                <span className="text-muted-foreground text-xs">m</span>
                              </div>
                            ))}
                            {dailyTargets.length > 14 && (
                              <p className="text-xs text-center text-muted-foreground py-2">
                                ... and {dailyTargets.length - 14} more days
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Target Hours (only show if not using daily targets) */}
            {!useDailyTargets && (
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
            )}

            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="text-sm font-semibold">Import roadmap steps from URL</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={selectedImportSource === "w3schools" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => selectImportSource("w3schools")}
                >
                  Load from W3Schools
                </Button>
                <Button
                  type="button"
                  variant={selectedImportSource === "roadmapsh" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => selectImportSource("roadmapsh")}
                >
                  Load from roadmap.sh
                </Button>
                <Button
                  type="button"
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
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fetchImportedSteps()}
                  disabled={isImporting || importUrl.trim().length === 0}
                >
                  {isImporting ? "Loading..." : "Fetch"}
                </Button>
              </div>
              {autoMatchedSkill && (
                <div className="text-xs text-muted-foreground">Auto-matched skill: {autoMatchedSkill}</div>
              )}
              {quickPickerOpen && selectedImportSource !== "auto" && (
                <div className="space-y-2 rounded border border-border p-2">
                  <div className="text-xs text-muted-foreground">
                    Pick a skill to generate the {selectedImportSource === "w3schools"
                      ? "W3Schools"
                      : selectedImportSource === "roadmapsh"
                        ? "roadmap.sh"
                        : "freeCodeCamp"} URL.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.map((skill) => (
                      <Button
                        key={`${selectedImportSource}-${skill.slug}`}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applySkillSelection(selectedImportSource, skill)}
                      >
                        {skill.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {importSource && (
                <div className="text-xs text-muted-foreground">Detected source: {importSource}</div>
              )}
              {importError && (
                <div className="text-xs text-destructive">{importError}</div>
              )}
              {importedSteps.length > 0 && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={allImportedSelected}
                      onChange={(e) => toggleAllImportedSteps(e.target.checked)}
                    />
                    Select all
                  </label>
                  <div className="max-h-36 overflow-y-auto rounded border border-border p-2 space-y-1">
                    {importedSteps.map((step, index) => (
                      <label key={`${step.externalId ?? step.title}-${index}`} className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={step.selected}
                          onChange={() => toggleImportedStep(index)}
                        />
                        <span>{step.title}</span>
                      </label>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addImportedStepsToRoadmap}
                    disabled={importedSteps.every((step) => !step.selected)}
                  >
                    Add selected to roadmap
                  </Button>
                </div>
              )}
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

          </div>
          <div className="shrink-0 border-t border-border bg-background/95 p-4 backdrop-blur-sm [padding-bottom:max(env(safe-area-inset-bottom),1rem)]">
            <div className="flex gap-3">
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
        <AuthPromptModal
          isOpen={authPrompt.isOpen}
          onClose={authPrompt.closePrompt}
          action={authPrompt.action}
          nextPath={authPrompt.nextPath}
        />
      </motion.div>
    </AnimatePresence>
  )
}
