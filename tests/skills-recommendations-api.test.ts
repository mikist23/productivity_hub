import { afterEach, describe, expect, it, vi } from "vitest"
import { GET } from "../app/api/skills/recommendations/route"

describe("skills recommendations API", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns api source and tracks", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([1, 2]), { status: 200 })
    )
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ type: "story", title: "AI cloud platform update" }), { status: 200 })
    )
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ type: "story", title: "Kubernetes security guide" }), { status: 200 })
    )

    const response = await GET()
    const payload = (await response.json()) as { source: string; tracks: Array<{ id: string; trendLabel: string }> }

    expect(response.status).toBe(200)
    expect(payload.source).toBe("api")
    expect(Array.isArray(payload.tracks)).toBe(true)
    expect(payload.tracks.length).toBeGreaterThanOrEqual(20)
  })

  it("still returns catalog when enrichment fetch fails", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("network failure"))

    const response = await GET()
    const payload = (await response.json()) as { source: string; tracks: Array<{ id: string; trendLabel: string }> }

    expect(response.status).toBe(200)
    expect(payload.source).toBe("api")
    expect(payload.tracks.length).toBeGreaterThanOrEqual(20)
  })
})

