import crypto from "crypto"
import type { PaymentIntentRequest, PaymentProviderAdapter, WebhookVerificationResult } from "@/lib/payments/providers/types"

function createProviderRef(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

export const airtmProvider: PaymentProviderAdapter = {
  provider: "airtm",
  async createPaymentIntent(input: PaymentIntentRequest) {
    void input
    return {
      providerRef: createProviderRef("airtm"),
      status: "created",
      message: "Airtm API flow is not configured yet. Enable after Airtm API approval.",
    }
  },
  async verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult> {
    const sharedSecret = process.env.AIRTM_WEBHOOK_SECRET?.trim()
    const signature = headers.get("x-provider-signature")?.trim()
    if (!sharedSecret || !signature || signature !== sharedSecret) {
      return { ok: false, message: "Invalid Airtm webhook signature" }
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>
    const eventId = typeof payload.eventId === "string" ? payload.eventId : `airtm_evt_${crypto.randomUUID()}`
    const providerRef = typeof payload.providerRef === "string" ? payload.providerRef : undefined
    const statusRaw = typeof payload.status === "string" ? payload.status.toLowerCase() : ""
    const status = statusRaw === "paid" ? "paid" : statusRaw === "pending" ? "pending" : "failed"

    return { ok: true, eventId, providerRef, status, payload }
  },
}
