import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase, isMongoConfigured, isMongoConnectionError, MONGO_UNAVAILABLE_ERROR } from "@/lib/mongodb"
import { AppUser } from "@/lib/models/AppUser"
import {
  buildRecoveryCodeRecords,
  hashPassword,
  isValidEmail,
  makeUserId,
  normalizeEmail,
  randomSalt,
} from "@/lib/server-auth"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
})

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup payload" }, { status: 400 })
  }

  const email = normalizeEmail(parsed.data.email)
  const name = parsed.data.name.trim()
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 })
  }

  try {
    await connectToDatabase()

    const existing = await AppUser.findOne({ email }).lean()
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 })
    }

    const salt = randomSalt()
    const passwordHash = await hashPassword(parsed.data.password, salt)
    const { plainCodes, records } = await buildRecoveryCodeRecords(5)

    await AppUser.create({
      userId: makeUserId(),
      email,
      name,
      provider: "local",
      salt,
      passwordHash,
      recoveryCodes: records,
    })

    return NextResponse.json({ ok: true, recoveryCodes: plainCodes })
  } catch (error) {
    const isDbError = isMongoConnectionError(error)
    if (isDbError) {
      return NextResponse.json({ error: MONGO_UNAVAILABLE_ERROR }, { status: 503 })
    }
    return NextResponse.json({ error: "Unable to create account right now. Please try again." }, { status: 500 })
  }
}
