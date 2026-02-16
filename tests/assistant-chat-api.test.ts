import { beforeEach, describe, expect, it, vi } from "vitest"

const mockCreate = vi.fn()
const resolveRequestUserIdMock = vi.fn()

vi.mock("openai", () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        create: mockCreate,
      },
    }
  },
}))

vi.mock("@/lib/resolve-user-id", () => ({
  resolveRequestUserId: (request: unknown) => resolveRequestUserIdMock(request),
}))

import { POST } from "../app/api/assistant/chat/route"

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/assistant/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("assistant chat API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OPENAI_API_KEY = "test-key"
    process.env.OPENAI_MODEL = "gpt-4.1-mini"
  })

  it("rejects unauthenticated users", async () => {
    resolveRequestUserIdMock.mockResolvedValueOnce(null)

    const response = await POST(makeRequest({ messages: [{ role: "user", content: "Hi" }] }) as any)

    expect(response.status).toBe(401)
  })

  it("rejects invalid payload", async () => {
    resolveRequestUserIdMock.mockResolvedValueOnce("user-invalid")

    const response = await POST(makeRequest({ messages: [{ role: "system", content: "bad" }] }) as any)

    expect(response.status).toBe(400)
  })

  it("returns 503 when OpenAI key is missing", async () => {
    resolveRequestUserIdMock.mockResolvedValueOnce("user-no-key")
    delete process.env.OPENAI_API_KEY

    const response = await POST(makeRequest({ messages: [{ role: "user", content: "Hi" }] }) as any)

    expect(response.status).toBe(503)
  })

  it("returns assistant reply for valid requests", async () => {
    resolveRequestUserIdMock.mockResolvedValueOnce("user-ok")
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "Open Time Tracking at /dashboard/time and start a timer." } }],
      usage: { prompt_tokens: 12, completion_tokens: 11, total_tokens: 23 },
    })

    const response = await POST(makeRequest({ messages: [{ role: "user", content: "How to track time?" }] }) as any)
    const payload = (await response.json()) as { reply: string; model: string; usage: { total_tokens: number } }

    expect(response.status).toBe(200)
    expect(payload.reply).toContain("/dashboard/time")
    expect(payload.model).toBe("gpt-4.1-mini")
    expect(payload.usage.total_tokens).toBe(23)
  })

  it("enforces message limits", async () => {
    resolveRequestUserIdMock.mockResolvedValueOnce("user-limits")

    const response = await POST(
      makeRequest({
        messages: Array.from({ length: 21 }).map((_, index) => ({ role: "user" as const, content: `m-${index}` })),
      }) as any
    )

    expect(response.status).toBe(400)
  })

  it("returns 429 when local rate limit is exceeded", async () => {
    resolveRequestUserIdMock.mockResolvedValue("user-rate")
    mockCreate.mockResolvedValue({ choices: [{ message: { content: "ok" } }] })

    for (let i = 0; i < 12; i++) {
      const response = await POST(makeRequest({ messages: [{ role: "user", content: `hello-${i}` }] }) as any)
      expect(response.status).toBe(200)
    }

    const rateLimited = await POST(makeRequest({ messages: [{ role: "user", content: "hello-13" }] }) as any)
    expect(rateLimited.status).toBe(429)
  })
})
