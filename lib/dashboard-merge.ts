import { defaultCloudDashboardPayload, type CloudDashboardPayload } from "./dashboard-defaults"

type AnyRecord = Record<string, unknown>

type MergeResult = {
  payload: CloudDashboardPayload
  mergeApplied: boolean
  revision: number
}

function isObjectLike(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function keyForItem(item: unknown): string | null {
  if (!isObjectLike(item)) return null

  if (typeof item.id === "string" && item.id.trim().length > 0) {
    return `id:${item.id}`
  }

  const date = typeof item.date === "string" ? item.date : ""
  const timestamp = typeof item.timestamp === "string" ? item.timestamp : ""
  if (date && timestamp) {
    return `dt:${date}|${timestamp}`
  }

  const title = typeof item.title === "string" ? item.title : ""
  if (date && title) {
    return `date-title:${date}|${title}`
  }

  return null
}

function toTimestamp(value: unknown) {
  if (typeof value !== "string") return Number.NaN
  const time = Date.parse(value)
  return Number.isFinite(time) ? time : Number.NaN
}

function resolveItemConflict(currentItem: unknown, incomingItem: unknown): unknown {
  if (!isObjectLike(currentItem) || !isObjectLike(incomingItem)) {
    return incomingItem
  }

  const currentUpdatedAt = toTimestamp(currentItem.updatedAt)
  const incomingUpdatedAt = toTimestamp(incomingItem.updatedAt)

  if (Number.isFinite(currentUpdatedAt) && Number.isFinite(incomingUpdatedAt)) {
    return currentUpdatedAt >= incomingUpdatedAt ? currentItem : incomingItem
  }

  return incomingItem
}

function mergeArrayPreserveMissing(currentValue: unknown, incomingValue: unknown): unknown[] {
  const current = asArray(currentValue)
  const incoming = asArray(incomingValue)

  const merged = new Map<string, unknown>()
  const order: string[] = []
  const incomingUnkeyed: unknown[] = []
  const currentUnkeyed: unknown[] = []

  for (const item of incoming) {
    const key = keyForItem(item)
    if (!key) {
      incomingUnkeyed.push(item)
      continue
    }

    if (!merged.has(key)) {
      order.push(key)
      merged.set(key, item)
      continue
    }

    merged.set(key, resolveItemConflict(merged.get(key), item))
  }

  for (const item of current) {
    const key = keyForItem(item)
    if (!key) {
      currentUnkeyed.push(item)
      continue
    }

    if (!merged.has(key)) {
      order.push(key)
      merged.set(key, item)
      continue
    }

    merged.set(key, resolveItemConflict(item, merged.get(key)))
  }

  const mergedItems = order.map((key) => merged.get(key)).filter((item): item is unknown => item !== undefined)

  const incomingFingerprint = new Set(
    incomingUnkeyed.map((item) => {
      try {
        return JSON.stringify(item)
      } catch {
        return String(item)
      }
    })
  )

  const dedupedCurrentUnkeyed = currentUnkeyed.filter((item) => {
    try {
      return !incomingFingerprint.has(JSON.stringify(item))
    } catch {
      return true
    }
  })

  return [...incomingUnkeyed, ...mergedItems, ...dedupedCurrentUnkeyed]
}

function mergeRoadmap(currentRoadmap: unknown, incomingRoadmap: unknown) {
  return mergeArrayPreserveMissing(currentRoadmap, incomingRoadmap)
}

function mergeGoal(currentGoal: unknown, incomingGoal: unknown) {
  if (!isObjectLike(currentGoal) || !isObjectLike(incomingGoal)) {
    return incomingGoal
  }

  const merged = {
    ...currentGoal,
    ...incomingGoal,
  }

  if ("roadmap" in currentGoal || "roadmap" in incomingGoal) {
    merged.roadmap = mergeRoadmap(currentGoal.roadmap, incomingGoal.roadmap)
  }

  if ("dailyTargets" in currentGoal || "dailyTargets" in incomingGoal) {
    merged.dailyTargets = mergeArrayPreserveMissing(currentGoal.dailyTargets, incomingGoal.dailyTargets)
  }

  return merged
}

function mergeGoals(currentGoals: unknown, incomingGoals: unknown) {
  const current = asArray(currentGoals)
  const incoming = asArray(incomingGoals)

  const currentById = new Map<string, unknown>()
  for (const goal of current) {
    if (!isObjectLike(goal) || typeof goal.id !== "string" || goal.id.trim().length === 0) continue
    currentById.set(goal.id, goal)
  }

  const mergedIds = new Set<string>()
  const merged: unknown[] = []

  for (const goal of incoming) {
    if (!isObjectLike(goal) || typeof goal.id !== "string" || goal.id.trim().length === 0) {
      merged.push(goal)
      continue
    }

    const currentGoal = currentById.get(goal.id)
    merged.push(currentGoal ? mergeGoal(currentGoal, goal) : goal)
    mergedIds.add(goal.id)
  }

  for (const goal of current) {
    if (!isObjectLike(goal) || typeof goal.id !== "string" || goal.id.trim().length === 0) {
      continue
    }
    if (!mergedIds.has(goal.id)) {
      merged.push(goal)
    }
  }

  return merged
}

function asDashboardPayload(input: Partial<CloudDashboardPayload>): CloudDashboardPayload {
  return {
    userProfile: isObjectLike(input.userProfile) ? input.userProfile : defaultCloudDashboardPayload.userProfile,
    skills: asArray(input.skills),
    jobs: asArray(input.jobs),
    focus: typeof input.focus === "string" ? input.focus : defaultCloudDashboardPayload.focus,
    tasks: asArray(input.tasks),
    focusSessions: asArray(input.focusSessions),
    goals: asArray(input.goals),
    recentActivities: asArray(input.recentActivities),
    mapPins: asArray(input.mapPins),
    mapView: isObjectLike(input.mapView)
      ? {
          lat: typeof input.mapView.lat === "number" ? input.mapView.lat : defaultCloudDashboardPayload.mapView.lat,
          lng: typeof input.mapView.lng === "number" ? input.mapView.lng : defaultCloudDashboardPayload.mapView.lng,
          zoom: typeof input.mapView.zoom === "number" ? input.mapView.zoom : defaultCloudDashboardPayload.mapView.zoom,
        }
      : defaultCloudDashboardPayload.mapView,
    recipes: asArray(input.recipes),
    posts: asArray(input.posts),
    timerState: isObjectLike(input.timerState) ? input.timerState : defaultCloudDashboardPayload.timerState,
  }
}

export function mergeDashboardPayload(currentRaw: Partial<CloudDashboardPayload>, incomingRaw: Partial<CloudDashboardPayload>) {
  const current = asDashboardPayload(currentRaw)
  const incoming = asDashboardPayload(incomingRaw)

  return {
    ...current,
    ...incoming,
    skills: mergeArrayPreserveMissing(current.skills, incoming.skills),
    jobs: mergeArrayPreserveMissing(current.jobs, incoming.jobs),
    tasks: mergeArrayPreserveMissing(current.tasks, incoming.tasks),
    focusSessions: mergeArrayPreserveMissing(current.focusSessions, incoming.focusSessions),
    goals: mergeGoals(current.goals, incoming.goals),
    recentActivities: mergeArrayPreserveMissing(current.recentActivities, incoming.recentActivities),
    mapPins: mergeArrayPreserveMissing(current.mapPins, incoming.mapPins),
    recipes: mergeArrayPreserveMissing(current.recipes, incoming.recipes),
    posts: mergeArrayPreserveMissing(current.posts, incoming.posts),
  }
}

export function resolveDashboardWrite({
  current,
  incoming,
  currentRevision,
  baseRevision,
}: {
  current: Partial<CloudDashboardPayload>
  incoming: Partial<CloudDashboardPayload>
  currentRevision: number
  baseRevision?: number
}): MergeResult {
  const normalizedCurrent = asDashboardPayload(current)
  const normalizedIncoming = asDashboardPayload(incoming)

  if (baseRevision == null || baseRevision === currentRevision) {
    return {
      payload: normalizedIncoming,
      mergeApplied: false,
      revision: currentRevision + 1,
    }
  }

  return {
    payload: mergeDashboardPayload(normalizedCurrent, normalizedIncoming),
    mergeApplied: true,
    revision: currentRevision + 1,
  }
}
