export type CloudDashboardPayload = {
  userProfile: Record<string, unknown>
  skills: unknown[]
  jobs: unknown[]
  focus: string
  tasks: unknown[]
  focusSessions: unknown[]
  goals: unknown[]
  recentActivities: unknown[]
  mapPins: unknown[]
  mapView: {
    lat: number
    lng: number
    zoom: number
  }
  recipes: unknown[]
  posts: unknown[]
}

export const defaultCloudDashboardPayload: CloudDashboardPayload = {
  userProfile: { name: "", role: "", bio: "" },
  skills: [],
  jobs: [],
  focus: "",
  tasks: [],
  focusSessions: [],
  goals: [],
  recentActivities: [],
  mapPins: [],
  mapView: {
    lat: 39.8283,
    lng: -98.5795,
    zoom: 4,
  },
  recipes: [],
  posts: [],
}
