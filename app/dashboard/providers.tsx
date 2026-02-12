"use client"

import React, { createContext, useContext } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { calculateFocusStreaks, getStreakHistory, calculateGoalStreaks, getProductivityInsights } from "@/lib/streaks"
import { defaultCloudDashboardPayload, type CloudDashboardPayload } from "@/lib/dashboard-defaults"

export type SkillStatus = "mastered" | "learning" | "inprogress"
export type JobStatus = "applied" | "interview" | "offer" | "rejected"
export type GoalStatus = "todo" | "inprogress" | "completed"
export type Priority = "high" | "medium" | "low"
export type PinCategory = "personal" | "task" | "job" | "goal"

export interface SkillItem {
  id: string
  name: string
  level: string
  progress: number
  status: SkillStatus
}

export interface SkillCategory {
  id: string
  category: string
  items: SkillItem[]
}

export interface JobApplication {
  id: string
  role: string
  company: string
  location: string
  date: string
  status: JobStatus
  logo: string
}

export interface UserProfile {
  name: string
  role: string
  bio: string
}

export interface Task {
    id: string
    title: string
    completed: boolean
}

export interface FocusSession {
    id: string
    date: string // ISO Date string YYYY-MM-DD
    minutes: number
    label?: string
    goalId?: string
    timestamp: string // ISO string
}

export interface GoalRoadmapItem {
    id: string
    title: string
    done: boolean
}

// Phase 4: Daily Targets
export interface DailyTarget {
    date: string        // YYYY-MM-DD
    targetMinutes: number
    actualMinutes: number  // Track actual time spent
    isComplete: boolean
}

export type NewGoalInput = Omit<Goal, "id" | "roadmap" | "dailyTargets"> & {
    roadmap?: Array<Omit<GoalRoadmapItem, "id">>
    dailyTargets?: Array<Omit<DailyTarget, "actualMinutes" | "isComplete">>
}

// Phase 3: Goals (Enhanced for Kanban)
export interface Goal {
    id: string
    title: string
    targetDate: string
    progress: number // 0-100
    status: GoalStatus
    priority: Priority
    category: string
    targetMinutes?: number
    roadmap?: GoalRoadmapItem[]
    createdAt: string
    completedAt?: string
    dailyTargets?: DailyTarget[]  // Array of daily targets
    useDailyTargets: boolean      // Toggle between total vs daily mode
}

export interface ActivityLog {
    id: string
    text: string
    timestamp: string // ISO string
    type: "skill" | "job" | "task" | "focus" | "goal" | "map" | "recipe" | "post"
}

export interface MapPin {
    id: string
    title: string
    note?: string
    lat: number
    lng: number
    category: PinCategory
    createdAt: string // ISO string
    updatedAt: string // ISO string
}

export interface MapViewState {
    lat: number
    lng: number
    zoom: number
}

export interface RecipeIngredient {
    item: string
    amount?: string
}

export interface Recipe {
    id: string
    title: string
    description?: string
    category: string
    tags: string[]
    ingredients: RecipeIngredient[]
    steps: string[]
    sourceUrl?: string
    imageUrl?: string
    createdAt: string // ISO string
    updatedAt: string // ISO string
}

export type PostKind = "blog" | "story"

export interface Post {
    id: string
    kind: PostKind
    title: string
    content: string
    tags: string[]
    createdAt: string // ISO string
    updatedAt: string // ISO string
}

export interface DashboardContextType {
  userProfile: UserProfile
  updateUserProfile: (profile: UserProfile) => void
  
  skills: SkillCategory[]
  addSkill: (category: string, skill: Omit<SkillItem, "id">) => void
  updateSkill: (categoryId: string, skillId: string, updates: Partial<Omit<SkillItem, "id">>) => void
  removeSkill: (categoryId: string, skillId: string) => void
  
  jobs: JobApplication[]
  addJob: (job: Omit<JobApplication, "id" | "date">) => void
  updateJobStatus: (id: string, status: JobStatus) => void
  removeJob: (id: string) => void
  
  focus: string
  setFocus: (focus: string) => void

  tasks: Task[]
  addTask: (title: string) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void

  focusSessions: FocusSession[]
  addFocusSession: (minutes: number, label?: string, goalId?: string) => void
  todayFocusMinutes: number

  // Phase 3
  goals: Goal[]
  addGoal: (goal: NewGoalInput) => void
  updateGoalStatus: (id: string, status: GoalStatus) => void
  updateGoalProgress: (id: string, progress: number) => void
  addGoalRoadmapItem: (goalId: string, title: string) => void
  toggleGoalRoadmapItem: (goalId: string, itemId: string) => void
  removeGoalRoadmapItem: (goalId: string, itemId: string) => void
  setGoalTargetMinutes: (goalId: string, targetMinutes: number | null) => void
  deleteGoal: (id: string) => void

  // Phase 4: Daily Targets
  getTodayTarget: (goalId: string) => DailyTarget | null
  getGoalProgressForDate: (goalId: string, date: string) => number
  updateDailyTarget: (goalId: string, date: string, minutes: number) => void
  setGoalDailyTargets: (goalId: string, dailyTargets: Omit<DailyTarget, "actualMinutes" | "isComplete">[]) => void
  toggleGoalUseDailyTargets: (goalId: string, useDailyTargets: boolean) => void

  recentActivities: ActivityLog[]
  logActivity: (text: string, type: ActivityLog["type"]) => void

  mapPins: MapPin[]
  addMapPin: (pin: Omit<MapPin, "id" | "createdAt" | "updatedAt">) => void
  updateMapPin: (id: string, updates: Partial<Omit<MapPin, "id" | "createdAt">>) => void
  deleteMapPin: (id: string) => void

  mapView: MapViewState
  setMapView: (view: MapViewState) => void

  recipes: Recipe[]
  addRecipe: (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => void
  updateRecipe: (id: string, updates: Partial<Omit<Recipe, "id" | "createdAt">>) => void
  deleteRecipe: (id: string) => void

  posts: Post[]
  addPost: (post: Omit<Post, "id" | "createdAt" | "updatedAt">) => void
  updatePost: (id: string, updates: Partial<Omit<Post, "id" | "createdAt">>) => void
  deletePost: (id: string) => void

  // Streaks and Analytics
  focusStreaks: ReturnType<typeof calculateFocusStreaks>
  goalStreaks: ReturnType<typeof calculateGoalStreaks>
  streakHistory: ReturnType<typeof getStreakHistory>
  productivityInsights: ReturnType<typeof getProductivityInsights>
}

const defaultProfile: UserProfile = {
  name: "",
  role: "",
  bio: ""
}

const emptySkillCategories: SkillCategory[] = []
const emptyJobs: JobApplication[] = []
const emptyTasks: Task[] = []
const emptyFocusSessions: FocusSession[] = []
const emptyGoals: Goal[] = []
const emptyActivities: ActivityLog[] = []
const emptyMapPins: MapPin[] = []
const emptyRecipes: Recipe[] = []
const emptyPosts: Post[] = []

const defaultMapView: MapViewState = {
  // Roughly center of the contiguous US
  lat: 39.8283,
  lng: -98.5795,
  zoom: 4,
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 11)
}

function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) return 0
  return Math.max(0, Math.min(100, Math.round(progress)))
}

function goalRoadmapItems(goal: Goal) {
  return Array.isArray(goal.roadmap) ? goal.roadmap : []
}

function goalRoadmapProgress(goal: Goal) {
  const items = goalRoadmapItems(goal)
  if (items.length === 0) return null
  const done = items.filter((i) => i.done).length
  return clampProgress((done / items.length) * 100)
}

function goalTrackedMinutes(goalId: string, sessions: FocusSession[]) {
  return sessions
    .filter((s) => s.goalId === goalId)
    .reduce((acc, s) => acc + (Number.isFinite(s.minutes) ? s.minutes : 0), 0)
}

function goalTrackedMinutesForDate(goalId: string, date: string, sessions: FocusSession[]) {
  return sessions
    .filter((s) => s.goalId === goalId && s.date === date)
    .reduce((acc, s) => acc + (Number.isFinite(s.minutes) ? s.minutes : 0), 0)
}

function goalTimeProgress(goal: Goal, sessions: FocusSession[]) {
  if (goal.targetMinutes == null) return null
  const target = Number(goal.targetMinutes)
  if (!Number.isFinite(target) || target <= 0) return null
  const tracked = goalTrackedMinutes(goal.id, sessions)
  return clampProgress((tracked / target) * 100)
}

function goalDailyProgress(goal: Goal, sessions: FocusSession[]) {
  if (!goal.useDailyTargets || !goal.dailyTargets || goal.dailyTargets.length === 0) return null
  
  const today = new Date().toISOString().split('T')[0]
  const todayTarget = goal.dailyTargets.find(dt => dt.date === today)
  
  if (!todayTarget) return null
  
  const tracked = goalTrackedMinutesForDate(goal.id, today, sessions)
  const target = Number(todayTarget.targetMinutes)
  
  if (!Number.isFinite(target) || target <= 0) return null
  return clampProgress((tracked / target) * 100)
}

function computeGoalDerived(goal: Goal, sessions: FocusSession[]) {
  const roadmap = goalRoadmapProgress(goal)
  const time = goalTimeProgress(goal, sessions)
  const daily = goalDailyProgress(goal, sessions)

  let progress = clampProgress(goal.progress ?? 0)
  if (roadmap != null) progress = roadmap
  if (time != null) progress = Math.max(progress, time)
  if (daily != null) progress = Math.max(progress, daily)

  const status: GoalStatus =
    progress >= 100 ? "completed" : goal.status === "completed" ? "inprogress" : goal.status
  return { ...goal, progress, status }
}

function asArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback
}

function asMapView(value: unknown): MapViewState {
  if (!value || typeof value !== "object") return defaultMapView
  const candidate = value as Partial<MapViewState>
  if (
    typeof candidate.lat !== "number" ||
    typeof candidate.lng !== "number" ||
    typeof candidate.zoom !== "number"
  ) {
    return defaultMapView
  }
  return { lat: candidate.lat, lng: candidate.lng, zoom: candidate.zoom }
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = React.useState<UserProfile>(defaultProfile)

  React.useEffect(() => {
    if (!user) return
    setUserProfile((prev) => {
      const prevName = (prev?.name ?? "").trim()
      if (prevName.length > 0 && prevName.toLowerCase() !== "alex") return prev
      return { ...prev, name: user.name }
    })
  }, [setUserProfile, user])
  const [skills, setSkills] = React.useState<SkillCategory[]>(emptySkillCategories)
  const [jobs, setJobs] = React.useState<JobApplication[]>(emptyJobs)
  const [focus, setFocusState] = React.useState("")
  const [tasks, setTasks] = React.useState<Task[]>(emptyTasks)
  const [focusSessions, setFocusSessions] = React.useState<FocusSession[]>(emptyFocusSessions)
  const [goals, setGoals] = React.useState<Goal[]>(emptyGoals)
  const [recentActivities, setRecentActivities] = React.useState<ActivityLog[]>(emptyActivities)
  const [mapPins, setMapPins] = React.useState<MapPin[]>(emptyMapPins)
  const [mapView, setMapViewState] = React.useState<MapViewState>(defaultMapView)
  const [recipes, setRecipes] = React.useState<Recipe[]>(emptyRecipes)
  const [posts, setPosts] = React.useState<Post[]>(emptyPosts)
  const cloudSyncRef = React.useRef({ loaded: false, skipNextSave: false })

  const cloudPayload = React.useMemo<CloudDashboardPayload>(
    () => ({
      userProfile: userProfile as unknown as Record<string, unknown>,
      skills: skills as unknown[],
      jobs: jobs as unknown[],
      focus,
      tasks: tasks as unknown[],
      focusSessions: focusSessions as unknown[],
      goals: goals as unknown[],
      recentActivities: recentActivities as unknown[],
      mapPins: mapPins as unknown[],
      mapView: mapView ?? defaultMapView,
      recipes: recipes as unknown[],
      posts: posts as unknown[],
    }),
    [focus, focusSessions, goals, jobs, mapPins, mapView, posts, recipes, recentActivities, skills, tasks, userProfile]
  )

  React.useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    cloudSyncRef.current.loaded = false

    const hydrateFromCloud = async () => {
      try {
        const res = await fetch("/api/dashboard", {
          headers: {
            "x-mapmonet-user-id": user.id,
          },
        })
        if (!res.ok) return

        const data = (await res.json()) as Partial<CloudDashboardPayload>
        if (cancelled) return

        cloudSyncRef.current.skipNextSave = true
        setUserProfile(
          ((data.userProfile as unknown as UserProfile) ?? defaultCloudDashboardPayload.userProfile) as UserProfile
        )
        setSkills(asArray<SkillCategory>(data.skills, emptySkillCategories))
        setJobs(asArray<JobApplication>(data.jobs, emptyJobs))
        setFocusState(typeof data.focus === "string" ? data.focus : defaultCloudDashboardPayload.focus)
        setTasks(asArray<Task>(data.tasks, emptyTasks))
        setFocusSessions(asArray<FocusSession>(data.focusSessions, emptyFocusSessions))
        setGoals(asArray<Goal>(data.goals, emptyGoals))
        setRecentActivities(asArray<ActivityLog>(data.recentActivities, emptyActivities))
        setMapPins(asArray<MapPin>(data.mapPins, emptyMapPins))
        setMapViewState(asMapView(data.mapView))
        setRecipes(asArray<Recipe>(data.recipes, emptyRecipes))
        setPosts(asArray<Post>(data.posts, emptyPosts))
      } catch {
        // Keep local data when cloud read fails.
      } finally {
        if (!cancelled) {
          cloudSyncRef.current.loaded = true
        }
      }
    }

    hydrateFromCloud()

    return () => {
      cancelled = true
    }
  }, [
    setFocusSessions,
    setFocusState,
    setGoals,
    setJobs,
    setMapPins,
    setMapViewState,
    setPosts,
    setRecentActivities,
    setRecipes,
    setSkills,
    setTasks,
    setUserProfile,
    user?.id,
  ])

  React.useEffect(() => {
    if (!user?.id || !cloudSyncRef.current.loaded) return
    if (cloudSyncRef.current.skipNextSave) {
      cloudSyncRef.current.skipNextSave = false
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        await fetch("/api/dashboard", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-mapmonet-user-id": user.id,
          },
          body: JSON.stringify(cloudPayload),
          signal: controller.signal,
        })
      } catch {
        // Keep local updates even if cloud write fails.
      }
    }, 1200)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [cloudPayload, user?.id])

  // --- Helper to Log Activity ---
  const logActivity = (text: string, type: ActivityLog["type"]) => {
      const newActivity: ActivityLog = {
          id: makeId(),
          text,
          timestamp: new Date().toISOString(),
          type
      }
      setRecentActivities(prev => [newActivity, ...prev].slice(0, 20)) // Keep last 20
  }

  const updateUserProfile = (profile: UserProfile) => setUserProfile(profile)

  const addSkill = (categoryName: string, skill: Omit<SkillItem, "id">) => {
    setSkills(prev => {
      const newSkills = [...prev]
      const categoryIndex = newSkills.findIndex(c => c.category === categoryName)
      const newSkillItem = { ...skill, id: makeId() }

      if (categoryIndex >= 0) {
        newSkills[categoryIndex].items.push(newSkillItem)
      } else {
        newSkills.push({
          id: makeId(),
          category: categoryName,
          items: [newSkillItem]
        })
      }
      return newSkills
    })
    logActivity(`Started learning ${skill.name}`, "skill")
  }

  const removeSkill = (categoryId: string, skillId: string) => {
    setSkills(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return { ...cat, items: cat.items.filter(item => item.id !== skillId) }
    }).filter(cat => cat.items.length > 0))
  }

  const updateSkill = (
    categoryId: string,
    skillId: string,
    updates: Partial<Omit<SkillItem, "id">>
  ) => {
    setSkills(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== skillId) return item
          return { ...item, ...updates }
        })
      }
    }))
  }

  const addJob = (job: Omit<JobApplication, "id" | "date">) => {
    const newJob: JobApplication = {
      ...job,
      id: makeId(),
      date: "Just now"
    }
    setJobs(prev => [newJob, ...prev])
    logActivity(`Applied to ${job.company} as ${job.role}`, "job")
  }

  const updateJobStatus = (id: string, status: JobStatus) => {
    setJobs(prev => prev.map(job => {
        if (job.id === id) {
             if (job.status !== status) {
                 logActivity(`Application for ${job.company} moved to ${status}`, "job")
             }
             return { ...job, status }
        }
        return job
    }))
  }

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id))
  }

  const setFocus = (val: string) => {
      setFocusState(val)
      if (val) logActivity(`Set focus: ${val}`, "goal")
  }

  const addTask = (title: string) => {
      const newTask: Task = {
          id: makeId(),
          title,
          completed: false
      }
      setTasks(prev => [newTask, ...prev])
      logActivity(`Added task: ${title}`, "task")
  }

  const toggleTask = (id: string) => {
      setTasks(prev => prev.map(t => {
          if (t.id === id) {
              const newStatus = !t.completed
              if (newStatus) logActivity(`Completed task: ${t.title}`, "task")
              return { ...t, completed: newStatus }
          }
          return t
      }))
  }

  const deleteTask = (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id))
  }

  const addFocusSession = (minutes: number, label?: string, goalId?: string) => {
      const session: FocusSession = {
          id: makeId(),
          date: new Date().toISOString().split('T')[0],
          minutes,
          label: label?.trim() || undefined,
          goalId: goalId || undefined,
          timestamp: new Date().toISOString(),
      }

      const nextSessionsForCalc = [session, ...focusSessions]
      let completedTitle: string | null = null

      setFocusSessions(prev => [session, ...prev])

      if (goalId) {
          setGoals(prev => prev.map(g => {
              if (g.id !== goalId) return g
              const next = computeGoalDerived(g, nextSessionsForCalc)
              
              // Update daily target if applicable
              if (g.useDailyTargets && g.dailyTargets) {
                  const today = new Date().toISOString().split('T')[0]
                  const todayTargetIndex = g.dailyTargets.findIndex(dt => dt.date === today)
                  if (todayTargetIndex >= 0) {
                      const updatedTargets = [...g.dailyTargets]
                      const currentActual = updatedTargets[todayTargetIndex].actualMinutes
                      const newActual = currentActual + minutes
                      updatedTargets[todayTargetIndex] = {
                          ...updatedTargets[todayTargetIndex],
                          actualMinutes: newActual,
                          isComplete: newActual >= updatedTargets[todayTargetIndex].targetMinutes
                      }
                      return { ...next, dailyTargets: updatedTargets }
                  }
              }
              
              if (next.progress >= 100 && g.progress < 100) completedTitle = g.title
              return next
          }))
      }

      const goalTitle = goalId ? goals.find((g) => g.id === goalId)?.title : null
      logActivity(
        goalTitle
          ? `Logged ${minutes} minutes: ${goalTitle}`
          : label?.trim()
            ? `Logged ${minutes} minutes of focus: ${label.trim()}`
            : `Logged ${minutes} minutes of focus`,
        "focus"
      )

      if (completedTitle) logActivity(`Goal Reached: ${completedTitle}!`, "goal")
  }
  
  // --- Goal Methods ---
  const addGoal = (goal: NewGoalInput) => {
      const roadmap = (goal.roadmap ?? [])
        .map((i) => ({ id: makeId(), title: i.title.trim(), done: Boolean(i.done) }))
        .filter((i) => i.title.length > 0)
      
      const dailyTargets = (goal.dailyTargets ?? [])
        .map((dt) => ({ 
          ...dt, 
          actualMinutes: 0, 
          isComplete: false 
        }))

      const newGoal: Goal = computeGoalDerived(
        {
          ...goal,
          id: makeId(),
          title: goal.title.trim(),
          progress: clampProgress(goal.progress ?? 0),
          roadmap,
          dailyTargets,
          useDailyTargets: goal.useDailyTargets ?? false,
          createdAt: new Date().toISOString()
        },
        focusSessions
      )
      setGoals(prev => [newGoal, ...prev])
      logActivity(`New Goal: ${newGoal.title}`, "goal")
  }

  const updateGoalStatus = (id: string, status: GoalStatus) => {
      setGoals(prev => prev.map(g => {
          if (g.id === id) {
              if (g.status !== status) {
                  logActivity(`Moved goal ${g.title} to ${status}`, "goal")
              }
              const next = computeGoalDerived(
                { ...g, status, progress: status === "completed" ? 100 : g.progress },
                focusSessions
              )
              return next
          }
          return g
      }))
  }

  const updateGoalProgress = (id: string, progress: number) => {
      setGoals(prev => prev.map(g => {
          if (g.id === id) {
             const next = computeGoalDerived(
               { ...g, progress: clampProgress(progress) },
               focusSessions
             )
             if (next.progress >= 100 && g.progress < 100) logActivity(`Goal Reached: ${g.title}!`, "goal")
             return next
          }
          return g
      }))
  }

  const addGoalRoadmapItem = (goalId: string, title: string) => {
      const trimmed = title.trim()
      if (!trimmed) return
      setGoals(prev => prev.map(g => {
          if (g.id !== goalId) return g
          const roadmap = [...goalRoadmapItems(g), { id: makeId(), title: trimmed, done: false }]
          const next = computeGoalDerived({ ...g, roadmap }, focusSessions)
          return next
      }))
  }

  const toggleGoalRoadmapItem = (goalId: string, itemId: string) => {
      let completedTitle: string | null = null
      setGoals(prev => prev.map(g => {
          if (g.id !== goalId) return g
          const roadmap = goalRoadmapItems(g).map(i => i.id === itemId ? { ...i, done: !i.done } : i)
          const next = computeGoalDerived({ ...g, roadmap }, focusSessions)
          if (next.progress >= 100 && g.progress < 100) completedTitle = g.title
          return next
      }))
      if (completedTitle) logActivity(`Goal Reached: ${completedTitle}!`, "goal")
  }

  const removeGoalRoadmapItem = (goalId: string, itemId: string) => {
      setGoals(prev => prev.map(g => {
          if (g.id !== goalId) return g
          const roadmap = goalRoadmapItems(g).filter(i => i.id !== itemId)
          const next = computeGoalDerived({ ...g, roadmap }, focusSessions)
          return next
      }))
  }

  const setGoalTargetMinutes = (goalId: string, targetMinutes: number | null) => {
      const nextTarget = targetMinutes == null ? undefined : Math.max(0, Math.round(targetMinutes))
      let completedTitle: string | null = null
      setGoals(prev => prev.map(g => {
          if (g.id !== goalId) return g
          const next = computeGoalDerived({ ...g, targetMinutes: nextTarget }, focusSessions)
          if (next.progress >= 100 && g.progress < 100) completedTitle = g.title
          return next
      }))
      if (completedTitle) logActivity(`Goal Reached: ${completedTitle}!`, "goal")
  }

  const deleteGoal = (id: string) => {
      setGoals(prev => prev.filter(g => g.id !== id))
  }

  // --- Daily Targets Methods ---
  const getTodayTarget = (goalId: string): DailyTarget | null => {
      const goal = goals.find(g => g.id === goalId)
      if (!goal || !goal.useDailyTargets || !goal.dailyTargets) return null
      
      const today = new Date().toISOString().split('T')[0]
      return goal.dailyTargets.find(dt => dt.date === today) || null
  }

  const getGoalProgressForDate = (goalId: string, date: string): number => {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) return 0
      
      if (goal.useDailyTargets && goal.dailyTargets) {
          const dateTarget = goal.dailyTargets.find(dt => dt.date === date)
          if (!dateTarget) return 0
          const tracked = goalTrackedMinutesForDate(goalId, date, focusSessions)
          return clampProgress((tracked / dateTarget.targetMinutes) * 100)
      } else if (goal.targetMinutes) {
          const tracked = goalTrackedMinutesForDate(goalId, date, focusSessions)
          return clampProgress((tracked / goal.targetMinutes) * 100)
      }
      
      return 0
  }

  const updateDailyTarget = (goalId: string, date: string, minutes: number) => {
      setGoals(prev => prev.map(g => {
          if (g.id !== goalId) return g
          
          const updatedTargets = [...(g.dailyTargets || [])]
          const targetIndex = updatedTargets.findIndex(dt => dt.date === date)
          
          if (targetIndex >= 0) {
              updatedTargets[targetIndex] = {
                  ...updatedTargets[targetIndex],
                  actualMinutes: Math.max(0, minutes)
              }
          } else {
              updatedTargets.push({
                  date,
                  targetMinutes: 60, // Default target
                  actualMinutes: Math.max(0, minutes),
                  isComplete: false
              })
          }
          
          return { ...g, dailyTargets: updatedTargets }
      }))
  }

  const setGoalDailyTargets = (goalId: string, dailyTargets: Omit<DailyTarget, "actualMinutes" | "isComplete">[]) => {
      setGoals(prev => prev.map(g => {
          if (g.id !== goalId) return g
          const targetsWithProgress = dailyTargets.map(dt => ({
              ...dt,
              actualMinutes: goalTrackedMinutesForDate(goalId, dt.date, focusSessions),
              isComplete: goalTrackedMinutesForDate(goalId, dt.date, focusSessions) >= dt.targetMinutes
          }))
          return { ...g, dailyTargets: targetsWithProgress }
      }))
  }

  const toggleGoalUseDailyTargets = (goalId: string, useDailyTargets: boolean) => {
      setGoals(prev => prev.map(g => {
          if (g.id !== goalId) return g
          const next = computeGoalDerived({ ...g, useDailyTargets }, focusSessions)
          return next
      }))
  }

  const todayFocusMinutes = focusSessions
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((acc, s) => acc + s.minutes, 0)

  // --- Streaks and Analytics ---
  const focusStreaks = calculateFocusStreaks(focusSessions)
  const goalStreaks = calculateGoalStreaks(goals)
  const streakHistory = getStreakHistory(focusSessions)
  const productivityInsights = getProductivityInsights(focusSessions, goals)

  // --- Map Pin Methods ---
  const addMapPin = (pin: Omit<MapPin, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString()
      const newPin: MapPin = {
          ...pin,
          id: makeId(),
          createdAt: now,
          updatedAt: now,
      }
      setMapPins(prev => [newPin, ...prev])
      logActivity(`Pinned: ${pin.title}`, "map")
  }

  const updateMapPin = (id: string, updates: Partial<Omit<MapPin, "id" | "createdAt">>) => {
      setMapPins(prev => prev.map(p => {
          if (p.id !== id) return p
          return { ...p, ...updates, updatedAt: new Date().toISOString() }
      }))
  }

  const deleteMapPin = (id: string) => {
      setMapPins(prev => {
          const pin = prev.find(p => p.id === id)
          if (pin) logActivity(`Removed pin: ${pin.title}`, "map")
          return prev.filter(p => p.id !== id)
      })
  }

  const setMapView = (view: MapViewState) => {
      setMapViewState(view)
  }

  // --- Recipe Methods ---
  const addRecipe = (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString()
      const newRecipe: Recipe = {
          ...recipe,
          id: makeId(),
          createdAt: now,
          updatedAt: now,
      }
      setRecipes(prev => [newRecipe, ...prev])
      logActivity(`Saved recipe: ${recipe.title}`, "recipe")
  }

  const updateRecipe = (id: string, updates: Partial<Omit<Recipe, "id" | "createdAt">>) => {
      setRecipes(prev => prev.map(r => {
          if (r.id !== id) return r
          return { ...r, ...updates, updatedAt: new Date().toISOString() }
      }))
  }

  const deleteRecipe = (id: string) => {
      setRecipes(prev => {
          const recipe = prev.find(r => r.id === id)
          if (recipe) logActivity(`Removed recipe: ${recipe.title}`, "recipe")
          return prev.filter(r => r.id !== id)
      })
  }

  // --- Post Methods (Blog / Stories) ---
  const addPost = (post: Omit<Post, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString()
      const newPost: Post = {
          ...post,
          id: makeId(),
          createdAt: now,
          updatedAt: now,
      }
      setPosts(prev => [newPost, ...prev])
      logActivity(`New ${post.kind}: ${post.title}`, "post")
  }

  const updatePost = (id: string, updates: Partial<Omit<Post, "id" | "createdAt">>) => {
      setPosts(prev => prev.map(p => {
          if (p.id !== id) return p
          return { ...p, ...updates, updatedAt: new Date().toISOString() }
      }))
  }

  const deletePost = (id: string) => {
      setPosts(prev => {
          const post = prev.find(p => p.id === id)
          if (post) logActivity(`Removed ${post.kind}: ${post.title}`, "post")
          return prev.filter(p => p.id !== id)
      })
  }

    return (
    <DashboardContext.Provider value={{
      userProfile,
      updateUserProfile,
      skills,
      addSkill,
      updateSkill,
      removeSkill,
      jobs,
      addJob,
      updateJobStatus,
      removeJob,
      focus,
      setFocus,
      tasks,
      addTask,
      toggleTask,
      deleteTask,
      focusSessions,
      addFocusSession,
      todayFocusMinutes,
      goals,
      addGoal,
      updateGoalStatus,
      updateGoalProgress,
      addGoalRoadmapItem,
      toggleGoalRoadmapItem,
      removeGoalRoadmapItem,
      setGoalTargetMinutes,
      deleteGoal,
      getTodayTarget,
      getGoalProgressForDate,
      updateDailyTarget,
      setGoalDailyTargets,
      toggleGoalUseDailyTargets,
      recentActivities,
      logActivity,
      mapPins,
      addMapPin,
      updateMapPin,
      deleteMapPin,
      mapView,
      setMapView,
      recipes,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      posts,
      addPost,
      updatePost,
      deletePost,
      focusStreaks,
      goalStreaks,
      streakHistory,
      productivityInsights
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
