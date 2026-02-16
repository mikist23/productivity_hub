import { describe, expect, it } from "vitest"
import { buildInsightsData, minutesToText } from "../lib/insights-data"

describe("dashboard insights data", () => {
  it("aggregates 14-day focus minutes per day", () => {
    const now = new Date("2026-02-16T10:00:00.000Z")
    const data = buildInsightsData(
      [
        { date: "2026-02-16", minutes: 30, timestamp: "2026-02-16T08:00:00.000Z" },
        { date: "2026-02-16", minutes: 45, timestamp: "2026-02-16T09:00:00.000Z" },
        { date: "2026-02-15", minutes: 60, timestamp: "2026-02-15T11:00:00.000Z" },
      ],
      now
    )

    const today = data.focus14Data.find((point) => point.dateISO === "2026-02-16")
    const yesterday = data.focus14Data.find((point) => point.dateISO === "2026-02-15")

    expect(today?.minutes).toBe(75)
    expect(today?.sessions).toBe(2)
    expect(yesterday?.minutes).toBe(60)
    expect(data.last14TotalMinutes).toBe(135)
  })

  it("streak stops at first day with zero minutes", () => {
    const now = new Date("2026-02-16T12:00:00.000Z")
    const data = buildInsightsData(
      [
        { date: "2026-02-16", minutes: 20, timestamp: "2026-02-16T08:00:00.000Z" },
        { date: "2026-02-15", minutes: 25, timestamp: "2026-02-15T08:00:00.000Z" },
        { date: "2026-02-13", minutes: 40, timestamp: "2026-02-13T08:00:00.000Z" },
      ],
      now
    )

    expect(data.streakDays).toBe(2)
  })

  it("bins today timeline by session timestamp hour", () => {
    const now = new Date("2026-02-16T23:00:00")
    const data = buildInsightsData(
      [
        { date: "2026-02-16", minutes: 20, timestamp: "2026-02-16T07:10:00" },
        { date: "2026-02-16", minutes: 40, timestamp: "2026-02-16T07:50:00" },
        { date: "2026-02-16", minutes: 30, timestamp: "2026-02-16T19:20:00" },
      ],
      now
    )

    const hour7 = data.timeline24Data[7]
    const hour19 = data.timeline24Data[19]

    expect(hour7.minutes).toBe(60)
    expect(hour7.sessions).toBe(2)
    expect(hour19.minutes).toBe(30)
    expect(hour19.sessions).toBe(1)
    expect(data.mostActiveHour.hour).toBe(7)
  })

  it("excludes missing or invalid timestamp sessions from timeline but keeps day totals", () => {
    const now = new Date("2026-02-16T12:00:00")
    const data = buildInsightsData(
      [
        { date: "2026-02-16", minutes: 25 },
        { date: "2026-02-16", minutes: 35, timestamp: "bad-timestamp" },
        { date: "2026-02-16", minutes: 40, timestamp: "2026-02-16T10:00:00" },
      ],
      now
    )

    const today = data.focus14Data.find((point) => point.dateISO === "2026-02-16")
    expect(today?.minutes).toBe(100)
    expect(data.timeline24Data[10].minutes).toBe(40)
    expect(data.timeline24Data.reduce((acc, point) => acc + point.minutes, 0)).toBe(40)
  })

  it("returns clean zero-state values for empty input", () => {
    const now = new Date("2026-02-16T12:00:00.000Z")
    const data = buildInsightsData([], now)

    expect(data.todayMinutes).toBe(0)
    expect(data.streakDays).toBe(0)
    expect(data.last14TotalMinutes).toBe(0)
    expect(data.last14AvgMinutes).toBe(0)
    expect(data.bestDayMinutes).toBe(0)
    expect(data.focus14Data).toHaveLength(14)
    expect(data.timeline24Data).toHaveLength(24)
    expect(minutesToText(data.todayMinutes)).toBe("0m")
  })
})
