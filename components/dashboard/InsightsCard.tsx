"use client"

import { useMemo } from "react"
import { BarChart3, Flame, Timer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FocusSession } from "@/app/dashboard/providers"
import { cn } from "@/lib/utils"

function isoDate(d: Date) {
  return d.toISOString().split("T")[0]
}

function addDays(date: Date, delta: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  return d
}

function minutesToText(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0m"
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs <= 0) return `${mins}m`
  if (mins <= 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

export function InsightsCard({ focusSessions }: { focusSessions: FocusSession[] }) {
  const { days, minutesByDay, streak, minutesByHour } = useMemo(() => {
    const byDay = new Map<string, number>()
    for (const s of focusSessions) {
      const key = s.date
      byDay.set(key, (byDay.get(key) ?? 0) + (Number.isFinite(s.minutes) ? s.minutes : 0))
    }

    const today = new Date()
    const daysList = Array.from({ length: 14 }).map((_, idx) => isoDate(addDays(today, -(13 - idx))))
    const minutesList = daysList.map((d) => byDay.get(d) ?? 0)

    let st = 0
    for (let i = 0; i < 365; i++) {
      const d = isoDate(addDays(today, -i))
      const mins = byDay.get(d) ?? 0
      if (mins <= 0) break
      st++
    }

    const hours = Array.from({ length: 24 }).map(() => 0)
    const todayKey = isoDate(today)
    for (const s of focusSessions) {
      if (s.date !== todayKey) continue
      if (!s.timestamp) continue
      const hour = new Date(s.timestamp).getHours()
      hours[hour] += Number.isFinite(s.minutes) ? s.minutes : 0
    }

    return { days: daysList, minutesByDay: minutesList, streak: st, minutesByHour: hours }
  }, [focusSessions])

  const maxDay = Math.max(1, ...minutesByDay)
  const maxHour = Math.max(1, ...minutesByHour)

  const todayMinutes = minutesByDay[minutesByDay.length - 1] ?? 0

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" /> Productivity Insights
        </CardTitle>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-accent/20 p-3">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Timer className="h-4 w-4" /> Today
            </div>
            <div className="mt-1 text-xl font-bold">{minutesToText(todayMinutes)}</div>
          </div>
          <div className="rounded-xl border border-border bg-accent/20 p-3">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4" /> Streak
            </div>
            <div className="mt-1 text-xl font-bold">{streak}d</div>
          </div>
          <div className="rounded-xl border border-border bg-accent/20 p-3">
            <div className="text-xs text-muted-foreground">Last 14 days</div>
            <div className="mt-1 text-xl font-bold">{minutesToText(minutesByDay.reduce((a, b) => a + b, 0))}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm font-semibold">Focus (14 days)</div>
          <div className="h-24 grid grid-cols-14 gap-1 items-end">
            {minutesByDay.map((mins, idx) => {
              const h = Math.round((mins / maxDay) * 100)
              const isToday = idx === minutesByDay.length - 1
              return (
                <div key={days[idx]} className="h-full flex items-end">
                  <div
                    className={cn(
                      "w-full rounded-sm bg-primary/20",
                      isToday && "bg-primary/30 outline outline-1 outline-primary/30"
                    )}
                    title={`${days[idx]} â€” ${minutesToText(mins)}`}
                    style={{ height: `${Math.max(6, h)}%` }}
                  />
                </div>
              )
            })}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Each bar is total minutes focused per day.
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Today timeline (24h)</div>
          <div className="h-16 grid grid-cols-24 gap-[2px] items-end">
            {minutesByHour.map((mins, idx) => {
              const h = Math.round((mins / maxHour) * 100)
              return (
                <div key={idx} className="h-full flex items-end">
                  <div
                    className="w-full rounded-[2px] bg-primary/20"
                    title={`${idx}:00 â€” ${minutesToText(mins)}`}
                    style={{ height: `${Math.max(4, h)}%` }}
                  />
                </div>
              )
            })}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Timeline uses session timestamps (logged sessions without timestamps wonâ€™t appear here).
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

