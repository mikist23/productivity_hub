import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb"
import { UserDashboard } from "@/lib/models/UserDashboard"
import { defaultCloudDashboardPayload } from "@/lib/dashboard-defaults"
import { resolveRequestUserId } from "@/lib/resolve-user-id"

const payloadSchema = z.object({
  version: z.number().optional(),
  app: z.string().optional(),
  data: z.object({
    profile: z.unknown().optional(),
    skills: z.array(z.unknown()).optional(),
    jobs: z.array(z.unknown()).optional(),
    focus: z.string().optional(),
    tasks: z.array(z.unknown()).optional(),
    focusSessions: z.array(z.unknown()).optional(),
    goals: z.array(z.unknown()).optional(),
    activities: z.array(z.unknown()).optional(),
    mapPins: z.array(z.unknown()).optional(),
    mapView: z
      .object({ lat: z.number().finite(), lng: z.number().finite(), zoom: z.number().finite() })
      .optional(),
    recipes: z.array(z.unknown()).optional(),
    posts: z.array(z.unknown()).optional(),
  }),
})

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const userId = await resolveRequestUserId(req)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = payloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid migration payload" }, { status: 400 })
  }

  const data = parsed.data.data
  const nextPayload = {
    userProfile:
      typeof data.profile === "object" && data.profile !== null
        ? (data.profile as Record<string, unknown>)
        : defaultCloudDashboardPayload.userProfile,
    skills: data.skills ?? defaultCloudDashboardPayload.skills,
    jobs: data.jobs ?? defaultCloudDashboardPayload.jobs,
    focus: data.focus ?? defaultCloudDashboardPayload.focus,
    tasks: data.tasks ?? defaultCloudDashboardPayload.tasks,
    focusSessions: data.focusSessions ?? defaultCloudDashboardPayload.focusSessions,
    goals: data.goals ?? defaultCloudDashboardPayload.goals,
    recentActivities: data.activities ?? defaultCloudDashboardPayload.recentActivities,
    mapPins: data.mapPins ?? defaultCloudDashboardPayload.mapPins,
    mapView: data.mapView ?? defaultCloudDashboardPayload.mapView,
    recipes: data.recipes ?? defaultCloudDashboardPayload.recipes,
    posts: data.posts ?? defaultCloudDashboardPayload.posts,
  }

  await connectToDatabase()
  await UserDashboard.findOneAndUpdate(
    { userId },
    { userId, ...nextPayload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  return NextResponse.json({ ok: true })
}
