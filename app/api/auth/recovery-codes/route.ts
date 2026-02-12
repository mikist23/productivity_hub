import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb"
import { AppUser } from "@/lib/models/AppUser"
import { buildRecoveryCodeRecords, normalizeEmail, verifyPassword } from "@/lib/server-auth"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 })
  }

  await connectToDatabase()
  const email = normalizeEmail(parsed.data.email)
  const user = await AppUser.findOne({ userId: session.user.id })

  if (!user || user.provider !== "local" || normalizeEmail(user.email) !== email) {
    return NextResponse.json({ error: "No account found for that email." }, { status: 404 })
  }

  if (!user.salt || !user.passwordHash) {
    return NextResponse.json({ error: "Password login is not enabled for this account." }, { status: 400 })
  }

  const validPassword = await verifyPassword(parsed.data.password, user.salt, user.passwordHash)
  if (!validPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 })
  }

  const { plainCodes, records } = await buildRecoveryCodeRecords(5)
  user.recoveryCodes = records
  await user.save()

  return NextResponse.json({ ok: true, recoveryCodes: plainCodes })
}
