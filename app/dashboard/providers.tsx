"use client"

import React, { createContext, useContext } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { LEGACY_DASHBOARD_KEYS, mmUserKey } from "@/lib/mm-keys"
import { useLocalStorageJsonState, useLocalStorageStringState } from "@/lib/storage"

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
    timestamp?: string // ISO string
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
  addFocusSession: (minutes: number, label?: string) => void
  todayFocusMinutes: number

  // Phase 3
  goals: Goal[]
  addGoal: (goal: Omit<Goal, "id">) => void
  updateGoalStatus: (id: string, status: GoalStatus) => void
  updateGoalProgress: (id: string, progress: number) => void
  deleteGoal: (id: string) => void

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
}

const defaultProfile: UserProfile = {
  name: "Alex",
  role: "Product Developer",
  bio: "Building digital products that matter."
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

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? "anon"
  const storageKey = (key: string) => mmUserKey(userId, key)

  const [userProfile, setUserProfile] = useLocalStorageJsonState<UserProfile>(
    storageKey(LEGACY_DASHBOARD_KEYS.profile),
    defaultProfile
  )
  const [skills, setSkills] = useLocalStorageJsonState<SkillCategory[]>(
    storageKey(LEGACY_DASHBOARD_KEYS.skills),
    emptySkillCategories
  )
  const [jobs, setJobs] = useLocalStorageJsonState<JobApplication[]>(
    storageKey(LEGACY_DASHBOARD_KEYS.jobs),
    emptyJobs
  )
  const [focus, setFocusState] = useLocalStorageStringState(
    storageKey(LEGACY_DASHBOARD_KEYS.focus),
    ""
  )

  const [tasks, setTasks] = useLocalStorageJsonState<Task[]>(
    storageKey(LEGACY_DASHBOARD_KEYS.tasks),
    emptyTasks
  )
  const [focusSessions, setFocusSessions] = useLocalStorageJsonState<FocusSession[]>(
    storageKey(LEGACY_DASHBOARD_KEYS.focusSessions),
    emptyFocusSessions
  )
  const [goals, setGoals] = useLocalStorageJsonState<Goal[]>(
    storageKey(LEGACY_DASHBOARD_KEYS.goals),
    emptyGoals
  )
  const [recentActivities, setRecentActivities] = useLocalStorageJsonState<ActivityLog[]>(
    storageKey(LEGACY_DASHBOARD_KEYS.activities),
    emptyActivities
  )
  const [mapPins, setMapPins] = useLocalStorageJsonState<MapPin[]>(
    storageKey(LEGACY_DASHBOARD_KEYS.mapPins),
    emptyMapPins
  )
  const [mapView, setMapViewState] = useLocalStorageJsonState<MapViewState>(
    storageKey(LEGACY_DASHBOARD_KEYS.mapView),
    defaultMapView
  )
  const [recipes, setRecipes] = useLocalStorageJsonState<Recipe[]>(storageKey("dashboard_recipes"), emptyRecipes)
  const [posts, setPosts] = useLocalStorageJsonState<Post[]>(storageKey("dashboard_posts"), emptyPosts)

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

  const addFocusSession = (minutes: number, label?: string) => {
      const session: FocusSession = {
          id: makeId(),
          date: new Date().toISOString().split('T')[0],
          minutes,
          label: label?.trim() || undefined,
          timestamp: new Date().toISOString(),
      }
      setFocusSessions(prev => [session, ...prev])
      logActivity(
        label?.trim()
          ? `Logged ${minutes} minutes of focus: ${label.trim()}`
          : `Logged ${minutes} minutes of focus`,
        "focus"
      )
  }
  
  // --- Goal Methods ---
  const addGoal = (goal: Omit<Goal, "id">) => {
      const newGoal: Goal = {
          ...goal,
          id: makeId()
      }
      setGoals(prev => [newGoal, ...prev])
      logActivity(`New Goal: ${goal.title}`, "goal")
  }

  const updateGoalStatus = (id: string, status: GoalStatus) => {
      setGoals(prev => prev.map(g => {
          if (g.id === id) {
              if (g.status !== status) {
                  logActivity(`Moved goal ${g.title} to ${status}`, "goal")
              }
              return { ...g, status }
          }
          return g
      }))
  }

  const updateGoalProgress = (id: string, progress: number) => {
      setGoals(prev => prev.map(g => {
          if (g.id === id) {
             if (progress === 100 && g.progress < 100) {
                 logActivity(`Goal Reached: ${g.title}!`, "goal")
                 return { ...g, progress, status: 'completed' }
             }
             return { ...g, progress }
          }
          return g
      }))
  }

  const deleteGoal = (id: string) => {
      setGoals(prev => prev.filter(g => g.id !== id))
  }

  const todayFocusMinutes = focusSessions
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((acc, s) => acc + s.minutes, 0)

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
      deleteGoal,
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
      deletePost
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
