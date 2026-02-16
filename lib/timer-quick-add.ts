export type TimerDraftLike = {
  seconds: number
  sessionLabel?: string
}

export type TimerStateLike = {
  selectedGoalId: string
  runningGoalId: string | null
  startedAtMs: number | null
  drafts: Record<string, TimerDraftLike>
}

function timerKey(goalId?: string) {
  return goalId && goalId.length > 0 ? goalId : "no-goal"
}

function resolveTargetGoalId(state: TimerStateLike, goalId?: string) {
  if (state.runningGoalId != null) return state.runningGoalId
  if (typeof goalId === "string") return goalId
  return state.selectedGoalId || ""
}

export function applyQuickAddToTimerState(state: TimerStateLike, deltaSeconds: number, goalId?: string): TimerStateLike {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return state

  const normalizedDelta = Math.floor(deltaSeconds)
  if (normalizedDelta <= 0) return state

  const targetGoalId = resolveTargetGoalId(state, goalId)
  const key = timerKey(targetGoalId)
  const existingDraft = state.drafts[key]
  const existingSeconds = existingDraft?.seconds ?? 0

  return {
    ...state,
    drafts: {
      ...state.drafts,
      [key]: {
        ...(existingDraft ?? { seconds: 0 }),
        seconds: existingSeconds + normalizedDelta,
      },
    },
  }
}
