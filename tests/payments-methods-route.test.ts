import { describe, expect, it } from "vitest"
import { GET } from "../app/api/payments/methods/route"

describe("payments methods route", () => {
  it("returns donation mode and methods payload", async () => {
    const response = await GET(new Request("http://localhost/api/payments/methods") as any)
    const payload = (await response.json()) as {
      mode: string
      methods: Array<{ method: string }>
      bank: { referenceNote: string }
    }

    expect(response.status).toBe(200)
    expect(["hosted", "api"]).toContain(payload.mode)
    expect(payload.methods.some((method) => method.method === "buymeacoffee")).toBe(true)
    expect(typeof payload.bank.referenceNote).toBe("string")
  })
})
