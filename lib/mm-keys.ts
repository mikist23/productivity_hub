export const MM_APP_NAME = "MapMonet" as const

export const MM_AUTH_USERS_KEY = "mm:users"
export const MM_AUTH_SESSION_KEY = "mm:session"

export function mmUserKey(userId: string, key: string) {
  return `mm:${userId}:${key}`
}

export const LEGACY_DASHBOARD_KEYS = {
  profile: "dashboard_profile",
  skills: "dashboard_skills",
  jobs: "dashboard_jobs",
  focus: "dashboard_focus",
  tasks: "dashboard_tasks",
  focusSessions: "dashboard_focus_sessions",
  goals: "dashboard_goals",
  activities: "dashboard_activities",
  mapPins: "dashboard_map_pins",
  mapView: "dashboard_map_view",
} as const

