import { afterAll, describe, expect, it } from "vitest"
import mongoose from "mongoose"
import { connectToDatabase, isMongoConfigured } from "../lib/mongodb"

describe("MongoDB connectivity", () => {
  afterAll(async () => {
    // Avoid hanging handles in watch/CI.
    try {
      await mongoose.disconnect()
    } finally {
      // Clear cached connection across test files/runs.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).mongooseCache
    }
  })

  it("reports whether Mongo is configured", () => {
    expect(typeof isMongoConfigured()).toBe("boolean")
  })

  it.runIf(isMongoConfigured())("connects and can ping the database", async () => {
    const conn = await connectToDatabase()
    expect(conn.connection.readyState).toBe(1)

    const db = conn.connection.db
    expect(db).toBeTruthy()

    const result = await db!.admin().ping()
    expect(result).toHaveProperty("ok")
    expect(result.ok).toBe(1)
  })

  it.runIf(!isMongoConfigured())("skips ping test when MONGODB_URI is missing", () => {
    expect(isMongoConfigured()).toBe(false)
  })
})
