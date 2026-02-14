import { NextRequest } from "next/server"
import { z } from "zod"
import { jsonNoStore } from "@/lib/payments/http"

const eventSchema = z.object({
  event: z.string().trim().min(1).max(80),
  payload: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return jsonNoStore({ error: "Invalid event payload." }, { status: 400 })
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", parsed.data.event, parsed.data.payload ?? {})
  }

  return jsonNoStore({ ok: true })
}
