import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase, isMongoConfigured, isMongoConnectionError, MONGO_UNAVAILABLE_ERROR } from "@/lib/mongodb"
import { AppUser } from "@/lib/models/AppUser"
import { normalizeEmail } from "@/lib/server-auth"

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 })
  }

  try {
    await connectToDatabase()
    const email = normalizeEmail(parsed.data.email)
    const user = await AppUser.findOne({ email })

    if (!user || user.provider !== "local") {
      return NextResponse.json({ error: "No account found for that email." }, { status: 404 })
    }

    const hasUnused = user.recoveryCodes.some((record) => !record.used)
    if (!hasUnused) {
      return NextResponse.json(
        { error: "No recovery codes available. Please generate a new set after signing in." },
        { status: 409 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const isDbError = isMongoConnectionError(error)
    if (isDbError) {
      return NextResponse.json({ error: MONGO_UNAVAILABLE_ERROR }, { status: 503 })
    }
    return NextResponse.json({ error: "Unable to verify recovery setup right now. Please try again." }, { status: 500 })
  }
}
