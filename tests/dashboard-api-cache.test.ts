import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { GET, PUT } from "../app/api/dashboard/route"

const {
  connectToDatabase,
  isMongoConfigured,
  isMongoConnectionError,
  resolveRequestUserId,
  findOne,
  findOneAndUpdate,
} = vi.hoisted(() => ({
  connectToDatabase: vi.fn(),
  isMongoConfigured: vi.fn(),
  isMongoConnectionError: vi.fn(),
  resolveRequestUserId: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
}))

vi.mock("@/lib/mongodb", () => ({
  connectToDatabase,
  isMongoConfigured,
  isMongoConnectionError,
  MONGO_UNAVAILABLE_ERROR: "MongoDB is currently unavailable. Please try again shortly.",
}))

vi.mock("@/lib/resolve-user-id", () => ({
  resolveRequestUserId,
}))

vi.mock("@/lib/models/UserDashboard", () => ({
  UserDashboard: {
    findOne,
    findOneAndUpdate,
  },
}))

describe("dashboard api cache headers", () => {
  beforeEach(() => {
    connectToDatabase.mockResolvedValue(undefined)
    isMongoConfigured.mockReturnValue(true)
    isMongoConnectionError.mockReturnValue(false)
    resolveRequestUserId.mockResolvedValue("user-1")
    findOne.mockReset()
    findOneAndUpdate.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("returns no-store headers on unauthorized GET", async () => {
    resolveRequestUserId.mockResolvedValueOnce(null)

    const response = await GET(new Request("http://localhost/api/dashboard") as any)

    expect(response.status).toBe(401)
    expect(response.headers.get("Cache-Control")).toBe("no-store, no-cache, must-revalidate")
    expect(response.headers.get("Pragma")).toBe("no-cache")
    expect(response.headers.get("Vary")).toContain("Cookie")
  })

  it("returns no-store headers on authorized GET", async () => {
    findOne.mockReturnValueOnce({
      lean: async () => null,
    })

    const response = await GET(new Request("http://localhost/api/dashboard") as any)

    expect(response.status).toBe(200)
    expect(response.headers.get("Cache-Control")).toBe("no-store, no-cache, must-revalidate")
    expect(response.headers.get("Pragma")).toBe("no-cache")
    expect(response.headers.get("Vary")).toContain("Cookie")
  })

  it("returns no-store headers on authorized PUT", async () => {
    findOne.mockReturnValueOnce({
      lean: async () => null,
    })
    findOneAndUpdate.mockReturnValueOnce({
      lean: async () => ({ updatedAt: new Date("2026-02-14T00:00:00.000Z") }),
    })

    const response = await PUT(
      new Request("http://localhost/api/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }) as any
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("Cache-Control")).toBe("no-store, no-cache, must-revalidate")
    expect(response.headers.get("Pragma")).toBe("no-cache")
    expect(response.headers.get("Vary")).toContain("Cookie")
  })
})
