import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb"
import { UserDashboard } from "@/lib/models/UserDashboard"
import { defaultCloudDashboardPayload } from "@/lib/dashboard-defaults"
import { resolveRequestUserId } from "@/lib/resolve-user-id"

const mapViewSchema = z.object({
  lat: z.number().finite().default(defaultCloudDashboardPayload.mapView.lat),
  lng: z.number().finite().default(defaultCloudDashboardPayload.mapView.lng),
  zoom: z.number().finite().default(defaultCloudDashboardPayload.mapView.zoom),
})

const dashboardSchema = z.object({
  userProfile: z.record(z.string(), z.unknown()).default(defaultCloudDashboardPayload.userProfile),
  skills: z.array(z.unknown()).default(defaultCloudDashboardPayload.skills),
  jobs: z.array(z.unknown()).default(defaultCloudDashboardPayload.jobs),
  focus: z.string().default(defaultCloudDashboardPayload.focus),
  tasks: z.array(z.unknown()).default(defaultCloudDashboardPayload.tasks),
  focusSessions: z.array(z.unknown()).default(defaultCloudDashboardPayload.focusSessions),
  goals: z.array(z.unknown()).default(defaultCloudDashboardPayload.goals),
  recentActivities: z.array(z.unknown()).default(defaultCloudDashboardPayload.recentActivities),
  mapPins: z.array(z.unknown()).default(defaultCloudDashboardPayload.mapPins),
  mapView: mapViewSchema.default(defaultCloudDashboardPayload.mapView),
  recipes: z.array(z.unknown()).default(defaultCloudDashboardPayload.recipes),
  posts: z.array(z.unknown()).default(defaultCloudDashboardPayload.posts),
  timerState: z.record(z.string(), z.unknown()).default(defaultCloudDashboardPayload.timerState),
})

export async function GET(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const userId = await resolveRequestUserId(req)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectToDatabase()

  const existing = await UserDashboard.findOne({ userId }).lean()
  if (!existing) {
    return NextResponse.json(defaultCloudDashboardPayload)
  }

  const parsed = dashboardSchema.safeParse(existing)
  if (!parsed.success) {
    return NextResponse.json(defaultCloudDashboardPayload)
  }

  return NextResponse.json(parsed.data)
}

export async function PUT(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const userId = await resolveRequestUserId(req)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = dashboardSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid dashboard payload" }, { status: 400 })
  }

  await connectToDatabase()

  const updated = await UserDashboard.findOneAndUpdate(
    { userId },
    { userId, ...parsed.data },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean()

  return NextResponse.json({ ok: true, updatedAt: updated?.updatedAt ?? new Date().toISOString() })
}

export async function DELETE(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const userId = await resolveRequestUserId(req)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectToDatabase()
  await UserDashboard.deleteOne({ userId })

  return NextResponse.json({ ok: true })
}
