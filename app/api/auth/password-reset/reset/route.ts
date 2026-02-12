import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb"
import { AppUser } from "@/lib/models/AppUser"
import {
  buildRecoveryCodeRecords,
  hashPassword,
  isValidEmail,
  matchesRecoveryCode,
  normalizeEmail,
  randomSalt,
} from "@/lib/server-auth"

const schema = z.object({
  email: z.string().email(),
  recoveryCode: z.string().min(6),
  newPassword: z.string().min(6),
})

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reset payload." }, { status: 400 })
  }

  const email = normalizeEmail(parsed.data.email)
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 })
  }

  await connectToDatabase()
  const user = await AppUser.findOne({ email })
  if (!user || user.provider !== "local") {
    return NextResponse.json({ error: "No account found for that email." }, { status: 404 })
  }

  const normalizedCode = parsed.data.recoveryCode.trim().toUpperCase()
  let matchingIndex = -1
  for (let i = 0; i < user.recoveryCodes.length; i++) {
    const record = user.recoveryCodes[i]
    if (record.used) continue
    const isMatch = await matchesRecoveryCode(normalizedCode, record.codeHash)
    if (isMatch) {
      matchingIndex = i
      break
    }
  }

  if (matchingIndex < 0) {
    return NextResponse.json({ error: "Invalid or already used recovery code." }, { status: 400 })
  }

  user.recoveryCodes[matchingIndex].used = true

  const newSalt = randomSalt(16)
  const newPasswordHash = await hashPassword(parsed.data.newPassword, newSalt)
  const { plainCodes, records } = await buildRecoveryCodeRecords(5)

  user.salt = newSalt
  user.passwordHash = newPasswordHash
  user.recoveryCodes = records
  await user.save()

  return NextResponse.json({ ok: true, recoveryCodes: plainCodes })
}
