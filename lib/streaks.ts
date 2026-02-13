import { format, subDays, isToday, isYesterday, startOfDay, differenceInDays } from 'date-fns'

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  streakHistory: { date: string; hasActivity: boolean }[]
  weeklyGoalDays: number
  monthlyGoalDays: number
}

export interface FocusSession {
  id: string
  date: string
  minutes: number
  goalId?: string
  label?: string
  timestamp: string
}

export interface Goal {
  id: string
  title: string
  status: 'todo' | 'inprogress' | 'completed'
  priority: 'high' | 'medium' | 'low'
  targetDate?: string
  targetMinutes?: number
  roadmap?: { id: string; title: string; done: boolean }[]
  progress: number
  createdAt: string
  completedAt?: string
  category?: string
}

function toDateKey(input?: string, fallback?: string): string | null {
  const parse = (value?: string) => {
    if (!value || value.trim().length === 0) return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return format(date, 'yyyy-MM-dd')
  }

  return parse(input) ?? parse(fallback)
}

/**
 * Calculate focus streaks based on focus sessions
 */
export function calculateFocusStreaks(sessions: FocusSession[]): Omit<StreakData, 'streakHistory'> {
  if (!sessions.length) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      weeklyGoalDays: 0,
      monthlyGoalDays: 0
    }
  }

  // Group sessions by date
  const sessionsByDate = new Map<string, FocusSession[]>()
  sessions.forEach(session => {
    const date = toDateKey(session.date, session.timestamp)
    if (!date) return
    if (!sessionsByDate.has(date)) {
      sessionsByDate.set(date, [])
    }
    sessionsByDate.get(date)!.push(session)
  })

  // Sort dates in descending order
  const sortedDates = Array.from(sessionsByDate.keys()).sort((a, b) => b.localeCompare(a))
  
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let lastActiveDate = sortedDates[0] || null

  // Check if there's activity today or yesterday to maintain streak
  const hasActivityToday = sessionsByDate.has(today)
  const hasActivityYesterday = sessionsByDate.has(yesterday)
  
  if (!hasActivityToday && !hasActivityYesterday) {
    // Streak is broken
    currentStreak = 0
  } else {
    // Calculate current streak
    const startDate = hasActivityToday ? new Date() : subDays(new Date(), 1)
    let checkDate = startDate
    
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd')
      if (sessionsByDate.has(dateStr)) {
        currentStreak++
        checkDate = subDays(checkDate, 1)
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  const allDates = Array.from(sessionsByDate.keys()).sort()
  tempStreak = 0
  
  for (let i = 0; i < allDates.length; i++) {
    const currentDate = new Date(allDates[i])
    const expectedDate = i === 0 ? currentDate : new Date(allDates[i - 1])
    expectedDate.setDate(expectedDate.getDate() + 1)
    
    if (i === 0 || format(currentDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  // Calculate weekly and monthly goal days
  const now = new Date()
  const weekStart = subDays(now, 6)
  const monthStart = subDays(now, 29)
  
  const weeklyGoalDays = sortedDates.filter(dateStr => {
    const date = new Date(dateStr)
    return date >= weekStart && date <= now
  }).length

  const monthlyGoalDays = sortedDates.filter(dateStr => {
    const date = new Date(dateStr)
    return date >= monthStart && date <= now
  }).length

  return {
    currentStreak,
    longestStreak,
    lastActiveDate,
    weeklyGoalDays,
    monthlyGoalDays
  }
}

/**
 * Get streak history for the last 30 days
 */
export function getStreakHistory(sessions: FocusSession[]): { date: string; hasActivity: boolean }[] {
  const history: { date: string; hasActivity: boolean }[] = []
  const sessionsByDate = new Map<string, FocusSession[]>()
  
  sessions.forEach(session => {
    const normalizedDate = toDateKey(session.date, session.timestamp)
    if (!normalizedDate) return
    if (!sessionsByDate.has(normalizedDate)) {
      sessionsByDate.set(normalizedDate, [])
    }
    sessionsByDate.get(normalizedDate)!.push(session)
  })

  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
    history.push({
      date,
      hasActivity: sessionsByDate.has(date)
    })
  }

  return history
}

/**
 * Calculate goal completion streaks
 */
export function calculateGoalStreaks(goals: Goal[]): {
  currentCompletionStreak: number
  longestCompletionStreak: number
  completedThisWeek: number
  completedThisMonth: number
} {
  const completedGoals = goals.filter(g => g.status === 'completed' && g.completedAt)
  
  if (!completedGoals.length) {
    return {
      currentCompletionStreak: 0,
      longestCompletionStreak: 0,
      completedThisWeek: 0,
      completedThisMonth: 0
    }
  }

  // Sort completed goals by completion date
  const sortedGoals = completedGoals.sort((a, b) => 
    new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  )

  // Calculate weekly and monthly completions
  const now = new Date()
  const weekStart = subDays(now, 6)
  const monthStart = subDays(now, 29)
  
  const completedThisWeek = sortedGoals.filter(g => 
    g.completedAt && new Date(g.completedAt) >= weekStart
  ).length

  const completedThisMonth = sortedGoals.filter(g => 
    g.completedAt && new Date(g.completedAt) >= monthStart
  ).length

  // For goal streaks, we consider consecutive days with at least one goal completion
  const completionDates = new Set<string>()
  sortedGoals.forEach(goal => {
    if (goal.completedAt) {
      completionDates.add(format(new Date(goal.completedAt), 'yyyy-MM-dd'))
    }
  })

  const sortedDates = Array.from(completionDates).sort((a, b) => b.localeCompare(a))
  
  let currentCompletionStreak = 0
  let longestCompletionStreak = 0
  let tempStreak = 0

  // Calculate current streak
  const today = format(now, 'yyyy-MM-dd')
  const yesterday = format(subDays(now, 1), 'yyyy-MM-dd')
  
  if (completionDates.has(today) || completionDates.has(yesterday)) {
    const startDate = completionDates.has(today) ? now : subDays(now, 1)
    let checkDate = startDate
    
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd')
      if (completionDates.has(dateStr)) {
        currentCompletionStreak++
        checkDate = subDays(checkDate, 1)
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  const allDates = Array.from(completionDates).sort()
  tempStreak = 0
  
  for (let i = 0; i < allDates.length; i++) {
    const currentDate = new Date(allDates[i])
    const expectedDate = i === 0 ? currentDate : new Date(allDates[i - 1])
    expectedDate.setDate(expectedDate.getDate() + 1)
    
    if (i === 0 || format(currentDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')) {
      tempStreak++
    } else {
      longestCompletionStreak = Math.max(longestCompletionStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestCompletionStreak = Math.max(longestCompletionStreak, tempStreak)

  return {
    currentCompletionStreak,
    longestCompletionStreak,
    completedThisWeek,
    completedThisMonth
  }
}

/**
 * Get productivity insights and patterns
 */
export function getProductivityInsights(sessions: FocusSession[], goals: Goal[]) {
  if (!sessions.length) {
    return {
      peakProductivityHour: null,
      averageSessionLength: 0,
      totalFocusTime: 0,
      goalsInProgress: 0,
      completionRate: 0
    }
  }

  // Find peak productivity hour
  const hourCounts = new Map<number, number>()
  sessions.forEach(session => {
    const hour = new Date(session.timestamp).getHours()
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + session.minutes)
  })

  let peakProductivityHour = null
  let maxMinutes = 0
  hourCounts.forEach((minutes, hour) => {
    if (minutes > maxMinutes) {
      maxMinutes = minutes
      peakProductivityHour = hour
    }
  })

  // Calculate average session length
  const averageSessionLength = sessions.reduce((sum, s) => sum + s.minutes, 0) / sessions.length

  // Calculate total focus time
  const totalFocusTime = sessions.reduce((sum, s) => sum + s.minutes, 0)

  // Calculate goal statistics
  const goalsInProgress = goals.filter(g => g.status === 'inprogress').length
  const completedGoals = goals.filter(g => g.status === 'completed').length
  const completionRate = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0

  return {
    peakProductivityHour,
    averageSessionLength,
    totalFocusTime,
    goalsInProgress,
    completionRate
  }
}
