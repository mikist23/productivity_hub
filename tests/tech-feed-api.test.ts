import { afterEach, describe, expect, it, vi } from "vitest"
import { GET } from "../app/api/tech/feed/route"

describe("tech feed API", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns normalized feed payload", async () => {
    const fetchMock = vi.spyOn(global, "fetch")
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([101, 102, 103]), { status: 200 }))
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 101,
          type: "story",
          title: "OpenAI launches model update for agents",
          by: "alice",
          time: Math.floor(Date.now() / 1000),
          score: 100,
          descendants: 42,
          url: "https://example.com/a",
        }),
        { status: 200 }
      )
    )
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 102,
          type: "story",
          title: "Kubernetes and cloud platform engineering trends",
          by: "bob",
          time: Math.floor(Date.now() / 1000),
          score: 80,
          descendants: 12,
          url: "https://example.com/b",
        }),
        { status: 200 }
      )
    )
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 103,
          type: "story",
          title: "NASA mission milestone update",
          by: "carol",
          time: Math.floor(Date.now() / 1000),
          score: 77,
          descendants: 8,
          url: "https://example.com/c",
        }),
        { status: 200 }
      )
    )

    const response = await GET()
    const payload = (await response.json()) as {
      topStories: Array<{ id: number; title: string }>
      categoryHighlights: Array<{ categoryId: string; trendLabel: string }>
      trendSummary: { evolving: string[]; fading: string[]; emerging: string[]; demanded: string[] }
      generatedAt: string
    }

    expect(response.status).toBe(200)
    expect(payload.topStories.length).toBeGreaterThan(0)
    expect(payload.categoryHighlights.length).toBe(9)
    expect(Array.isArray(payload.trendSummary.demanded)).toBe(true)
    expect(typeof payload.generatedAt).toBe("string")
  })

  it("returns fallback payload when upstream fetch fails", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("network down"))

    const response = await GET()
    const payload = (await response.json()) as {
      topStories: unknown[]
      categoryHighlights: unknown[]
      trendSummary: unknown
    }

    expect(response.status).toBe(200)
    expect(payload.topStories).toHaveLength(0)
    expect(payload.categoryHighlights).toHaveLength(9)
    expect(payload.trendSummary).toBeTruthy()
  })
})

