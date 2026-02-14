import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase, isMongoConfigured, isMongoConnectionError, MONGO_UNAVAILABLE_ERROR } from "@/lib/mongodb"
import { UserDashboard } from "@/lib/models/UserDashboard"
import { defaultCloudDashboardPayload } from "@/lib/dashboard-defaults"
import { resolveRequestUserId } from "@/lib/resolve-user-id"
import { resolveDashboardWrite } from "@/lib/dashboard-merge"

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

const dashboardWriteSchema = dashboardSchema.extend({
  baseRevision: z.number().int().nonnegative().optional(),
})

function withNoStoreHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  const existingVary = response.headers.get("Vary")
  if (!existingVary) {
    response.headers.set("Vary", "Cookie")
  } else if (!existingVary.toLowerCase().includes("cookie")) {
    response.headers.set("Vary", `${existingVary}, Cookie`)
  }
  return response
}

function jsonNoStore(body: unknown, init?: Parameters<typeof NextResponse.json>[1]) {
  return withNoStoreHeaders(NextResponse.json(body, init))
}

function revisionMetadata(input: { revision?: unknown; updatedAt?: unknown }) {
  const revision = typeof input.revision === "number" && Number.isFinite(input.revision)
    ? Math.max(0, Math.floor(input.revision))
    : 0
  const updatedAt = input.updatedAt instanceof Date
    ? input.updatedAt.toISOString()
    : typeof input.updatedAt === "string"
      ? input.updatedAt
      : null

  return { value: revision, updatedAt }
}

export async function GET(req: NextRequest) {
  if (!isMongoConfigured()) {
    return jsonNoStore({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const userId = await resolveRequestUserId(req)
  if (!userId) {
    return jsonNoStore({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectToDatabase()

    const existing = await UserDashboard.findOne({ userId }).lean()
    if (!existing) {
      return jsonNoStore({
        ...defaultCloudDashboardPayload,
        revision: { value: 0, updatedAt: null },
      })
    }

    const parsed = dashboardSchema.safeParse(existing)
    if (!parsed.success) {
      return jsonNoStore({
        ...defaultCloudDashboardPayload,
        revision: revisionMetadata(existing),
      })
    }

    return jsonNoStore({
      ...parsed.data,
      revision: revisionMetadata(existing),
    })
  } catch (error) {
    const isDbError = isMongoConnectionError(error)
    if (isDbError) {
      return jsonNoStore({ error: MONGO_UNAVAILABLE_ERROR }, { status: 503 })
    }
    return jsonNoStore({ error: "Unable to load dashboard right now. Please try again." }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!isMongoConfigured()) {
    return jsonNoStore({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const userId = await resolveRequestUserId(req)
  if (!userId) {
    return jsonNoStore({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = dashboardWriteSchema.safeParse(body)
  if (!parsed.success) {
    return jsonNoStore({ error: "Invalid dashboard payload" }, { status: 400 })
  }

  try {
    await connectToDatabase()

    const existing = await UserDashboard.findOne({ userId }).lean()
    const currentRevision = typeof existing?.revision === "number" && Number.isFinite(existing.revision)
      ? Math.max(0, Math.floor(existing.revision))
      : 0

    const { baseRevision, ...incomingPayload } = parsed.data
    const existingParsed = existing ? dashboardSchema.safeParse(existing) : null
    const currentPayload = existingParsed?.success ? existingParsed.data : defaultCloudDashboardPayload

    const merged = resolveDashboardWrite({
      current: currentPayload,
      incoming: incomingPayload,
      currentRevision,
      baseRevision,
    })

    const updated = await UserDashboard.findOneAndUpdate(
      { userId },
      { userId, revision: merged.revision, ...merged.payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean()

    return jsonNoStore({
      ok: true,
      mergeApplied: merged.mergeApplied,
      revision: revisionMetadata({ revision: merged.revision, updatedAt: updated?.updatedAt }),
      ...merged.payload,
    })
  } catch (error) {
    const isDbError = isMongoConnectionError(error)
    if (isDbError) {
      return jsonNoStore({ error: MONGO_UNAVAILABLE_ERROR }, { status: 503 })
    }
    return jsonNoStore({ error: "Unable to save dashboard right now. Please try again." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!isMongoConfigured()) {
    return jsonNoStore({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const userId = await resolveRequestUserId(req)
  if (!userId) {
    return jsonNoStore({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectToDatabase()
    await UserDashboard.deleteOne({ userId })

    return jsonNoStore({ ok: true })
  } catch (error) {
    const isDbError = isMongoConnectionError(error)
    if (isDbError) {
      return jsonNoStore({ error: MONGO_UNAVAILABLE_ERROR }, { status: 503 })
    }
    return jsonNoStore({ error: "Unable to reset cloud data right now. Please try again." }, { status: 500 })
  }
}
