import { afterEach, describe, expect, it, vi } from "vitest"
import { POST } from "../app/api/roadmap/import/route"

describe("roadmap import route", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("accepts explicit freecodecamp source", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        `
          <html>
            <head><title>FCC React Guide</title></head>
            <body>
              <article class="post-body">
                <h1>Learn React</h1>
                <ul><li>Build Components</li></ul>
              </article>
            </body>
          </html>
        `,
        { status: 200 }
      )
    )

    const response = await POST(
      new Request("http://localhost/api/roadmap/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://www.freecodecamp.org/news/react-guide/",
          source: "freecodecamp",
        }),
      }) as any
    )

    const payload = (await response.json()) as { source: string; steps: Array<{ title: string }> }
    expect(response.status).toBe(200)
    expect(payload.source).toBe("freecodecamp")
    expect(payload.steps.some((step) => step.title === "Build Components")).toBe(true)
  })

  it("auto-corrects source mismatch based on URL host", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        `
          <html>
            <head><title>Backend Roadmap</title></head>
            <body>
              <h1>Backend Developer</h1>
              <ul><li>REST APIs</li></ul>
            </body>
          </html>
        `,
        { status: 200 }
      )
    )

    const response = await POST(
      new Request("http://localhost/api/roadmap/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://roadmap.sh/backend",
          source: "w3schools",
        }),
      }) as any
    )

    const payload = (await response.json()) as { source: string; steps: Array<{ title: string }> }
    expect(response.status).toBe(200)
    expect(payload.source).toBe("roadmapsh")
    expect(payload.steps.some((step) => step.title === "REST APIs")).toBe(true)
  })

  it("rejects unsupported domains with friendly error", async () => {
    const response = await POST(
      new Request("http://localhost/api/roadmap/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com/some-roadmap",
          source: "w3schools",
        }),
      }) as any
    )

    const payload = (await response.json()) as { error: string }
    expect(response.status).toBe(400)
    expect(payload.error).toContain("W3Schools")
    expect(payload.error).toContain("roadmap.sh")
    expect(payload.error).toContain("freeCodeCamp")
  })
})
