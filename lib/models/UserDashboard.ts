import mongoose, { Schema } from "mongoose"

export interface UserDashboardDocument {
  userId: string
  userProfile: Record<string, unknown>
  skills: unknown[]
  jobs: unknown[]
  focus: string
  tasks: unknown[]
  focusSessions: unknown[]
  goals: unknown[]
  recentActivities: unknown[]
  mapPins: unknown[]
  mapView: Record<string, unknown>
  recipes: unknown[]
  posts: unknown[]
  updatedAt?: Date
  createdAt?: Date
}

const UserDashboardSchema = new Schema<UserDashboardDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    userProfile: { type: Schema.Types.Mixed, default: {} },
    skills: { type: [Schema.Types.Mixed], default: [] },
    jobs: { type: [Schema.Types.Mixed], default: [] },
    focus: { type: String, default: "" },
    tasks: { type: [Schema.Types.Mixed], default: [] },
    focusSessions: { type: [Schema.Types.Mixed], default: [] },
    goals: { type: [Schema.Types.Mixed], default: [] },
    recentActivities: { type: [Schema.Types.Mixed], default: [] },
    mapPins: { type: [Schema.Types.Mixed], default: [] },
    mapView: { type: Schema.Types.Mixed, default: { lat: 39.8283, lng: -98.5795, zoom: 4 } },
    recipes: { type: [Schema.Types.Mixed], default: [] },
    posts: { type: [Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: true,
    minimize: false,
  }
)

export const UserDashboard =
  (mongoose.models.UserDashboard as mongoose.Model<UserDashboardDocument>) ||
  mongoose.model<UserDashboardDocument>("UserDashboard", UserDashboardSchema)
