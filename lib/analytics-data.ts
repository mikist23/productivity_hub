export type FocusSessionLike = {
  date: string
  minutes: number
  timestamp?: string
}

export type GoalLike = {
  id: string
  title: string
  status: "todo" | "inprogress" | "completed"
  progress: number
  category: string
}

export type StreakHistoryItem = {
  date: string
  hasActivity: boolean
}

export type StreakChartPoint = {
  dateLabel: string
  fullDate: string
  weekday: string
  hasActivity: boolean
  activityValue: number
  rollingAdherence: number
  streakEndingHere: number
}

export type WeeklyFocusPoint = {
  dateISO: string
  dateLabel: string
  minutes: number
  hours: number
  sessions: number
}

export type HourlyProductivityPoint = {
  hour24: number
  hourLabel: string
  minutes: number
  sessions: number
}

export type GoalCategoryProgressPoint = {
  category: string
  avgProgress: number
  completed: number
  inProgress: number
  total: number
}

export type GoalStatusPoint = {
  key: "completed" | "inprogress" | "todo"
  name: string
  value: number
  percent: number
  color: string
}

export type WeeklyPatternPoint = {
  day: string
  dayIndex: number
  minutes: number
  hours: number
  sessions: number
}

function parseDate(value: string) {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toDateISO(date: Date) {
  return date.toISOString().split("T")[0]
}

function clampNonNegative(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, value)
}

export function minutesToLabel(minutes: number) {
  const safe = Math.round(clampNonNegative(minutes))
  const hrs = Math.floor(safe / 60)
  const mins = safe % 60
  if (hrs <= 0) return `${mins}m`
  if (mins <= 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

export function hoursToLabel(hours: number) {
  const safe = clampNonNegative(hours)
  if (safe < 1) return `${Math.round(safe * 60)}m`
  return `${safe.toFixed(1)}h`
}

export function buildStreakChartData(streakHistory: StreakHistoryItem[]) {
  let activeSoFar = 0
  let runningStreak = 0

  return streakHistory.map((item, index) => {
    const parsed = parseDate(item.date)
    const fallback = new Date()
    const date = parsed ?? fallback
    if (item.hasActivity) {
      activeSoFar += 1
      runningStreak += 1
    } else {
      runningStreak = 0
    }

    return {
      dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: date.toLocaleDateString("en-CA"),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      hasActivity: item.hasActivity,
      activityValue: item.hasActivity ? 1 : 0.18,
      rollingAdherence: Math.round((activeSoFar / Math.max(1, index + 1)) * 100),
      streakEndingHere: runningStreak,
    } satisfies StreakChartPoint
  })
}

export function buildWeeklyFocusData(
  focusSessions: FocusSessionLike[],
  days = 7,
  now = new Date()
): WeeklyFocusPoint[] {
  const safeDays = Math.max(1, Math.floor(days))
  const result: WeeklyFocusPoint[] = []

  for (let i = safeDays - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateISO = toDateISO(date)
    const daySessions = focusSessions.filter((session) => session.date === dateISO)
    const totalMinutes = daySessions.reduce((sum, session) => sum + clampNonNegative(session.minutes), 0)
    result.push({
      dateISO,
      dateLabel: date.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }),
      minutes: totalMinutes,
      hours: totalMinutes / 60,
      sessions: daySessions.length,
    })
  }

  return result
}

export function buildHourlyProductivityData(focusSessions: FocusSessionLike[]) {
  const hourlyData: HourlyProductivityPoint[] = Array.from({ length: 24 }).map((_, hour) => ({
    hour24: hour,
    hourLabel: `${hour.toString().padStart(2, "0")}:00`,
    minutes: 0,
    sessions: 0,
  }))

  for (const session of focusSessions) {
    if (!session.timestamp) continue
    const parsed = parseDate(session.timestamp)
    if (!parsed) continue
    const hour = parsed.getHours()
    const target = hourlyData[hour]
    target.minutes += clampNonNegative(session.minutes)
    target.sessions += 1
  }

  return hourlyData
}

export function buildWeeklyPatternData(focusSessions: FocusSessionLike[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return days.map((day, dayIndex) => {
    const daySessions = focusSessions.filter((session) => {
      if (!session.timestamp) return false
      const parsed = parseDate(session.timestamp)
      return parsed ? parsed.getDay() === dayIndex : false
    })

    const minutes = daySessions.reduce((sum, session) => sum + clampNonNegative(session.minutes), 0)
    return {
      day,
      dayIndex,
      minutes,
      hours: minutes / 60,
      sessions: daySessions.length,
    } satisfies WeeklyPatternPoint
  })
}

export function buildGoalCategoryProgressData(goals: GoalLike[]) {
  const categoryMap = new Map<string, { total: number; completed: number; inProgress: number; count: number }>()

  for (const goal of goals) {
    const category = goal.category || "General"
    const existing = categoryMap.get(category) ?? { total: 0, completed: 0, inProgress: 0, count: 0 }
    categoryMap.set(category, {
      total: existing.total + clampNonNegative(goal.progress),
      completed: existing.completed + (goal.status === "completed" ? 1 : 0),
      inProgress: existing.inProgress + (goal.status === "inprogress" ? 1 : 0),
      count: existing.count + 1,
    })
  }

  return Array.from(categoryMap.entries()).map(([category, item]) => ({
    category,
    avgProgress: Math.round(item.total / Math.max(1, item.count)),
    completed: item.completed,
    inProgress: item.inProgress,
    total: item.count,
  })) satisfies GoalCategoryProgressPoint[]
}

export function buildGoalStatusData(goals: GoalLike[]) {
  const total = Math.max(1, goals.length)
  const counts = new Map<GoalStatusPoint["key"], number>([
    ["completed", 0],
    ["inprogress", 0],
    ["todo", 0],
  ])

  for (const goal of goals) {
    counts.set(goal.status, (counts.get(goal.status) ?? 0) + 1)
  }

  const entries: Array<Omit<GoalStatusPoint, "percent">> = [
    { key: "completed", name: "Completed", value: counts.get("completed") ?? 0, color: "#34d399" },
    { key: "inprogress", name: "In Progress", value: counts.get("inprogress") ?? 0, color: "#60a5fa" },
    { key: "todo", name: "Todo", value: counts.get("todo") ?? 0, color: "#64748b" },
  ]

  return entries.map((entry) => ({
    ...entry,
    percent: Math.round((entry.value / total) * 100),
  })) satisfies GoalStatusPoint[]
}
