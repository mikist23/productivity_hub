import { describe, expect, it } from "vitest"
import { applyQuickAddToTimerState, type TimerStateLike } from "../lib/timer-quick-add"

function createState(overrides?: Partial<TimerStateLike>): TimerStateLike {
  return {
    selectedGoalId: "",
    runningGoalId: null,
    startedAtMs: null,
    drafts: {},
    ...overrides,
  }
}

describe("dashboard timer quick add", () => {
  it("adds seconds to running session even if selected goal is different", () => {
    const initial = createState({
      selectedGoalId: "goal-b",
      runningGoalId: "goal-a",
      startedAtMs: 1700000000000,
      drafts: {
        "goal-a": { seconds: 5400 },
        "goal-b": { seconds: 1200 },
      },
    })

    const updated = applyQuickAddToTimerState(initial, 900, "goal-b")

    expect(updated.drafts["goal-a"]?.seconds).toBe(6300)
    expect(updated.drafts["goal-b"]?.seconds).toBe(1200)
  })

  it("adds seconds to selected goal when no timer is running", () => {
    const initial = createState({
      selectedGoalId: "goal-a",
      drafts: {
        "goal-a": { seconds: 600 },
      },
    })

    const updated = applyQuickAddToTimerState(initial, 1800, "goal-a")

    expect(updated.drafts["goal-a"]?.seconds).toBe(2400)
  })

  it("falls back to no-goal draft when nothing is selected and no goalId is provided", () => {
    const initial = createState({
      selectedGoalId: "",
      drafts: {
        "no-goal": { seconds: 300 },
      },
    })

    const updated = applyQuickAddToTimerState(initial, 900)
    expect(updated.drafts["no-goal"]?.seconds).toBe(1200)
  })

  it("creates a draft entry if target draft does not exist", () => {
    const initial = createState({
      selectedGoalId: "goal-new",
      drafts: {},
    })

    const updated = applyQuickAddToTimerState(initial, 600)
    expect(updated.drafts["goal-new"]?.seconds).toBe(600)
  })

  it("ignores invalid or non-positive deltas", () => {
    const initial = createState({
      selectedGoalId: "goal-a",
      drafts: {
        "goal-a": { seconds: 900 },
      },
    })

    expect(applyQuickAddToTimerState(initial, 0)).toBe(initial)
    expect(applyQuickAddToTimerState(initial, -1)).toBe(initial)
    expect(applyQuickAddToTimerState(initial, Number.NaN)).toBe(initial)
  })
})
