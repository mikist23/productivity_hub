import { afterAll, describe, expect, it } from "vitest"
import mongoose from "mongoose"
import { connectToDatabase, isMongoConfigured } from "../lib/mongodb"
import { AppUser } from "../lib/models/AppUser"
import { buildRecoveryCodeRecords, hashPassword, makeUserId, randomSalt, verifyPassword } from "../lib/server-auth"

describe("MongoDB auth user persistence", () => {
  const email = `vitest-${Date.now()}@example.com`
  const password = "test-password-123"

  afterAll(async () => {
    try {
      if (isMongoConfigured()) {
        await AppUser.deleteMany({ email: new RegExp("^vitest-") })
      }
      await mongoose.disconnect()
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).mongooseCache
    }
  })

  it.runIf(isMongoConfigured())("creates and validates local users", async () => {
    await connectToDatabase()

    const salt = randomSalt()
    const passwordHash = await hashPassword(password, salt)
    const recovery = await buildRecoveryCodeRecords(2)

    const created = await AppUser.create({
      userId: makeUserId(),
      email,
      name: "Vitest User",
      provider: "local",
      salt,
      passwordHash,
      recoveryCodes: recovery.records,
    })

    const found = await AppUser.findOne({ userId: created.userId }).lean()
    expect(found).toBeTruthy()
    expect(found?.email).toBe(email)
    expect(found?.recoveryCodes).toHaveLength(2)

    await expect(verifyPassword(password, salt, passwordHash)).resolves.toBe(true)
  })

  it.runIf(!isMongoConfigured())("skips Mongo auth test when MONGODB_URI is missing", () => {
    expect(isMongoConfigured()).toBe(false)
  })
})
