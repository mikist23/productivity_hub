import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import {
  isMongoDataApiConfigured,
  loadDashboardDocument,
  saveDashboardDocument,
} from "@/lib/mongodb-data-api"

function getUserIdFromHeader(request: Request) {
  const headerValue = request.headers.get("x-mm-user-id")
  return headerValue?.trim() || null
}

async function resolveUserId(request: Request) {
  const headerUserId = getUserIdFromHeader(request)
  if (headerUserId) return headerUserId

  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

export async function GET(request: Request) {
  if (!isMongoDataApiConfigured()) {
    return NextResponse.json(
      { error: "MongoDB Data API environment variables are not configured." },
      { status: 503 }
    )
  }

  const userId = await resolveUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const document = await loadDashboardDocument(userId)
    return NextResponse.json({ ok: true, document })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load dashboard"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!isMongoDataApiConfigured()) {
    return NextResponse.json(
      { error: "MongoDB Data API environment variables are not configured." },
      { status: 503 }
    )
  }

  const userId = await resolveUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = (await request.json()) as { data?: Record<string, unknown> }
    if (!payload?.data || typeof payload.data !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const saved = await saveDashboardDocument(userId, payload.data)
    return NextResponse.json({ ok: true, document: saved })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save dashboard"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
