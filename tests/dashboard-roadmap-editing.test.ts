import { describe, expect, it } from "vitest"
import { mergeDashboardPayload } from "../lib/dashboard-merge"

describe("dashboard roadmap editing behavior", () => {
  it("keeps edited roadmap step title when incoming payload updates the same step", () => {
    const current = {
      goals: [
        {
          id: "goal-1",
          roadmap: [{ id: "step-1", title: "Dart - Tutorials", done: false }],
        },
      ],
    }

    const incoming = {
      goals: [
        {
          id: "goal-1",
          roadmap: [{ id: "step-1", title: "Dart Tutorials", done: false }],
        },
      ],
    }

    const merged = mergeDashboardPayload(current, incoming)
    const goals = merged.goals as Array<{ id: string; roadmap: Array<{ id: string; title: string }> }>
    const goal = goals.find((g) => g.id === "goal-1")

    expect(goal?.roadmap).toHaveLength(1)
    expect(goal?.roadmap[0].title).toBe("Dart Tutorials")
  })

  it("preserves existing steps when imported steps are appended", () => {
    const current = {
      goals: [
        {
          id: "goal-1",
          roadmap: [
            { id: "step-1", title: "Dart - Tutorials", done: true },
            { id: "step-2", title: "Dart - Hello World", done: false },
          ],
        },
      ],
    }

    const incoming = {
      goals: [
        {
          id: "goal-1",
          roadmap: [
            { id: "step-1", title: "Dart - Tutorials", done: true },
            { id: "step-3", title: "Dart - Variables", done: false },
          ],
        },
      ],
    }

    const merged = mergeDashboardPayload(current, incoming)
    const goals = merged.goals as Array<{ id: string; roadmap: Array<{ id: string }> }>
    const goal = goals.find((g) => g.id === "goal-1")

    expect(goal?.roadmap.map((step) => step.id).sort()).toEqual(["step-1", "step-2", "step-3"])
  })
})
