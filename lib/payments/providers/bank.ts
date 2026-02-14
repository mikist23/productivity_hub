import crypto from "crypto"
import type { PaymentIntentRequest, PaymentProviderAdapter, WebhookVerificationResult } from "@/lib/payments/providers/types"

function createProviderRef(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

export const bankProvider: PaymentProviderAdapter = {
  provider: "bank",
  async createPaymentIntent(input: PaymentIntentRequest) {
    return {
      providerRef: createProviderRef("bank"),
      status: "pending",
      message: `Manual bank transfer flow initialized for ${input.currency.toUpperCase()} ${input.amount}.`,
    }
  },
  async verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult> {
    const secret = process.env.BANK_TRANSFER_REFERENCE_SECRET?.trim()
    const signature = headers.get("x-provider-signature")?.trim()
    if (!secret || !signature || signature !== secret) {
      return { ok: false, message: "Invalid bank webhook signature" }
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>
    const eventId = typeof payload.eventId === "string" ? payload.eventId : `bank_evt_${crypto.randomUUID()}`
    const providerRef = typeof payload.providerRef === "string" ? payload.providerRef : undefined
    const statusRaw = typeof payload.status === "string" ? payload.status.toLowerCase() : ""
    const status = statusRaw === "paid" ? "paid" : statusRaw === "failed" ? "failed" : "pending"

    return { ok: true, eventId, providerRef, status, payload }
  },
}
