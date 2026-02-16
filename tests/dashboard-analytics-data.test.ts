import { describe, expect, it } from "vitest"
import {
  buildGoalCategoryProgressData,
  buildGoalStatusData,
  buildHourlyProductivityData,
  buildStreakChartData,
  buildWeeklyFocusData,
  buildWeeklyPatternData,
} from "../lib/analytics-data"

describe("dashboard analytics data", () => {
  it("builds streak chart points and rolling adherence", () => {
    const data = buildStreakChartData([
      { date: "2026-02-14", hasActivity: true },
      { date: "2026-02-15", hasActivity: false },
      { date: "2026-02-16", hasActivity: true },
    ])

    expect(data).toHaveLength(3)
    expect(data[0].activityValue).toBe(1)
    expect(data[1].activityValue).toBe(0.18)
    expect(data[2].rollingAdherence).toBe(67)
    expect(data[1].streakEndingHere).toBe(0)
  })

  it("aggregates weekly focus windows accurately", () => {
    const now = new Date("2026-02-16T10:00:00.000Z")
    const data = buildWeeklyFocusData(
      [
        { date: "2026-02-16", minutes: 30 },
        { date: "2026-02-16", minutes: 20 },
        { date: "2026-02-15", minutes: 45 },
      ],
      2,
      now
    )

    expect(data).toHaveLength(2)
    expect(data[0].dateISO).toBe("2026-02-15")
    expect(data[0].minutes).toBe(45)
    expect(data[1].dateISO).toBe("2026-02-16")
    expect(data[1].minutes).toBe(50)
    expect(data[1].sessions).toBe(2)
  })

  it("bins hourly productivity into 24 points", () => {
    const data = buildHourlyProductivityData([
      { date: "2026-02-16", minutes: 30, timestamp: "2026-02-16T07:05:00" },
      { date: "2026-02-16", minutes: 15, timestamp: "2026-02-16T07:55:00" },
      { date: "2026-02-16", minutes: 20, timestamp: "2026-02-16T12:00:00" },
      { date: "2026-02-16", minutes: 10, timestamp: "invalid" },
    ])

    const hour7 = data[7]
    const hour12 = data[12]
    expect(data).toHaveLength(24)
    expect(hour7.minutes).toBe(45)
    expect(hour7.sessions).toBe(2)
    expect(hour12.minutes).toBe(20)
    expect(hour12.sessions).toBe(1)
  })

  it("computes goal category averages and counts", () => {
    const data = buildGoalCategoryProgressData([
      { id: "1", title: "A", status: "completed", progress: 100, category: "skill" },
      { id: "2", title: "B", status: "inprogress", progress: 50, category: "skill" },
      { id: "3", title: "C", status: "todo", progress: 0, category: "career" },
    ])

    const skill = data.find((item) => item.category === "skill")
    const career = data.find((item) => item.category === "career")

    expect(skill?.avgProgress).toBe(75)
    expect(skill?.completed).toBe(1)
    expect(skill?.inProgress).toBe(1)
    expect(skill?.total).toBe(2)
    expect(career?.avgProgress).toBe(0)
  })

  it("builds goal status percentages", () => {
    const data = buildGoalStatusData([
      { id: "1", title: "A", status: "completed", progress: 100, category: "skill" },
      { id: "2", title: "B", status: "inprogress", progress: 20, category: "career" },
      { id: "3", title: "C", status: "todo", progress: 0, category: "career" },
      { id: "4", title: "D", status: "todo", progress: 0, category: "health" },
    ])

    expect(data.find((item) => item.key === "completed")?.percent).toBe(25)
    expect(data.find((item) => item.key === "inprogress")?.percent).toBe(25)
    expect(data.find((item) => item.key === "todo")?.percent).toBe(50)
  })

  it("returns safe zero-state outputs", () => {
    expect(buildStreakChartData([])).toEqual([])
    expect(buildWeeklyFocusData([], 7, new Date("2026-02-16T12:00:00.000Z"))).toHaveLength(7)
    expect(buildHourlyProductivityData([])).toHaveLength(24)
    expect(buildGoalCategoryProgressData([])).toEqual([])
    expect(buildGoalStatusData([]).reduce((sum, item) => sum + item.value, 0)).toBe(0)
    expect(buildWeeklyPatternData([]).reduce((sum, item) => sum + item.minutes, 0)).toBe(0)
  })
})
