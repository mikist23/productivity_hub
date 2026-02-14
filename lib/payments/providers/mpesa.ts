import crypto from "crypto"
import type { PaymentIntentRequest, PaymentProviderAdapter, WebhookVerificationResult } from "@/lib/payments/providers/types"

function createProviderRef(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

export const mpesaProvider: PaymentProviderAdapter = {
  provider: "mpesa",
  async createPaymentIntent(input: PaymentIntentRequest) {
    void input
    return {
      providerRef: createProviderRef("mpesa"),
      status: "created",
      message: "M-Pesa API flow is not configured yet. Set MPESA_* server env vars to enable.",
    }
  },
  async verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult> {
    const sharedSecret = process.env.MPESA_WEBHOOK_SECRET?.trim()
    const signature = headers.get("x-provider-signature")?.trim()
    if (!sharedSecret || !signature || signature !== sharedSecret) {
      return { ok: false, message: "Invalid M-Pesa webhook signature" }
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>
    const eventId = typeof payload.eventId === "string" ? payload.eventId : `mpesa_evt_${crypto.randomUUID()}`
    const providerRef = typeof payload.providerRef === "string" ? payload.providerRef : undefined
    const statusRaw = typeof payload.status === "string" ? payload.status.toLowerCase() : ""
    const status = statusRaw === "paid" ? "paid" : statusRaw === "pending" ? "pending" : "failed"

    return { ok: true, eventId, providerRef, status, payload }
  },
}
