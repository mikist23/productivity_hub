import { describe, expect, it } from "vitest"
import { resolveDashboardWrite } from "../lib/dashboard-merge"

describe("dashboard conflict merge", () => {
  it("increments revision when base revision matches", () => {
    const current = {
      focus: "old",
      goals: [],
    }

    const incoming = {
      focus: "new",
      goals: [{ id: "g1", title: "Goal", roadmap: [] }],
    }

    const result = resolveDashboardWrite({
      current,
      incoming,
      currentRevision: 3,
      baseRevision: 3,
    })

    expect(result.mergeApplied).toBe(false)
    expect(result.revision).toBe(4)
    expect(result.payload.focus).toBe("new")
    expect(Array.isArray(result.payload.goals)).toBe(true)
    expect(result.payload.goals).toHaveLength(1)
  })

  it("merges stale writes and preserves roadmap steps", () => {
    const current = {
      goals: [
        {
          id: "goal-1",
          title: "Learn Dart",
          roadmap: [
            { id: "a", title: "Dart - Tutorials", done: true },
            { id: "b", title: "Dart - Variables", done: false },
          ],
        },
      ],
    }

    const incoming = {
      goals: [
        {
          id: "goal-1",
          title: "Learn Dart",
          roadmap: [
            { id: "a", title: "Dart Tutorials", done: true },
            { id: "c", title: "Dart - Create Package", done: false },
          ],
        },
      ],
    }

    const result = resolveDashboardWrite({
      current,
      incoming,
      currentRevision: 10,
      baseRevision: 8,
    })

    expect(result.mergeApplied).toBe(true)
    expect(result.revision).toBe(11)

    const goals = result.payload.goals as Array<{ id: string; roadmap: Array<{ id: string; title: string }> }>
    const mergedGoal = goals.find((g) => g.id === "goal-1")

    expect(mergedGoal).toBeTruthy()
    expect(mergedGoal?.roadmap.map((step) => step.id).sort()).toEqual(["a", "b", "c"])
  })
})
