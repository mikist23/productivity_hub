export type FocusSessionLike = {
  date: string
  minutes: number
  timestamp?: string
}

export type Focus14Point = {
  dateISO: string
  label: string
  minutes: number
  sessions: number
  isToday: boolean
}

export type Timeline24Point = {
  hour: number
  label: string
  minutes: number
  sessions: number
}

export type InsightsData = {
  focus14Data: Focus14Point[]
  timeline24Data: Timeline24Point[]
  todayMinutes: number
  todaySessions: number
  streakDays: number
  last14TotalMinutes: number
  last14AvgMinutes: number
  bestDayMinutes: number
  mostActiveHour: Timeline24Point
}

function isoDate(d: Date) {
  return d.toISOString().split("T")[0]
}

function addDays(date: Date, delta: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  return d
}

function shortDayLabel(dateISO: string) {
  const parsed = new Date(`${dateISO}T00:00:00`)
  return parsed.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })
}

export function minutesToText(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0m"
  const hrs = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hrs <= 0) return `${mins}m`
  if (mins <= 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

export function buildInsightsData(focusSessions: FocusSessionLike[], now = new Date()): InsightsData {
  const byDayMinutes = new Map<string, number>()
  const byDaySessions = new Map<string, number>()

  for (const session of focusSessions) {
    const minutes = Number.isFinite(session.minutes) ? Math.max(0, session.minutes) : 0
    const day = session.date
    byDayMinutes.set(day, (byDayMinutes.get(day) ?? 0) + minutes)
    byDaySessions.set(day, (byDaySessions.get(day) ?? 0) + 1)
  }

  const todayISO = isoDate(now)
  const dayList = Array.from({ length: 14 }).map((_, idx) => isoDate(addDays(now, -(13 - idx))))

  const focus14Data: Focus14Point[] = dayList.map((dateISO) => ({
    dateISO,
    label: shortDayLabel(dateISO),
    minutes: byDayMinutes.get(dateISO) ?? 0,
    sessions: byDaySessions.get(dateISO) ?? 0,
    isToday: dateISO === todayISO,
  }))

  let streakDays = 0
  for (let i = 0; i < 365; i++) {
    const dateISO = isoDate(addDays(now, -i))
    const minutes = byDayMinutes.get(dateISO) ?? 0
    if (minutes <= 0) break
    streakDays += 1
  }

  const timeline24Data: Timeline24Point[] = Array.from({ length: 24 }).map((_, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, "0")}:00`,
    minutes: 0,
    sessions: 0,
  }))

  for (const session of focusSessions) {
    if (session.date !== todayISO || !session.timestamp) continue
    const timestamp = new Date(session.timestamp)
    if (Number.isNaN(timestamp.getTime())) continue
    const hour = timestamp.getHours()
    const item = timeline24Data[hour]
    const minutes = Number.isFinite(session.minutes) ? Math.max(0, session.minutes) : 0
    item.minutes += minutes
    item.sessions += 1
  }

  const todayPoint = focus14Data[focus14Data.length - 1]
  const last14TotalMinutes = focus14Data.reduce((acc, item) => acc + item.minutes, 0)
  const bestDayMinutes = focus14Data.reduce((max, item) => Math.max(max, item.minutes), 0)
  const last14AvgMinutes = Math.round(last14TotalMinutes / 14)

  const mostActiveHour = timeline24Data.reduce((max, item) => {
    if (item.minutes > max.minutes) return item
    return max
  }, timeline24Data[0])

  return {
    focus14Data,
    timeline24Data,
    todayMinutes: todayPoint?.minutes ?? 0,
    todaySessions: todayPoint?.sessions ?? 0,
    streakDays,
    last14TotalMinutes,
    last14AvgMinutes,
    bestDayMinutes,
    mostActiveHour,
  }
}
