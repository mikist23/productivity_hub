import crypto from "crypto"
import type { PaymentIntentRequest, PaymentIntentResult, PaymentProviderAdapter, WebhookVerificationResult } from "@/lib/payments/providers/types"

function createProviderRef(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function normalizePaypalStatus(status: unknown): PaymentIntentResult["status"] {
  if (status === "COMPLETED") return "paid"
  if (status === "PENDING") return "pending"
  if (status === "FAILED" || status === "VOIDED" || status === "DECLINED") return "failed"
  if (status === "REFUNDED") return "refunded"
  return "created"
}

export const paypalProvider: PaymentProviderAdapter = {
  provider: "paypal",
  async createPaymentIntent(input: PaymentIntentRequest) {
    const paypalMe = process.env.NEXT_PUBLIC_PAYPAL_ME_URL?.trim()
    if (!paypalMe) {
      return {
        providerRef: createProviderRef("paypal"),
        status: "created",
        message: "PayPal link is not configured.",
      }
    }

    return {
      providerRef: createProviderRef("paypal"),
      status: "created",
      checkoutUrl: paypalMe,
      message: `Hosted PayPal checkout initialized for ${input.currency.toUpperCase()} ${input.amount}.`,
    }
  },
  async verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult> {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim()
    const signature = headers.get("paypal-transmission-sig")?.trim()

    if (!webhookId || !signature || signature !== webhookId) {
      return { ok: false, message: "Invalid PayPal webhook signature" }
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>
    const eventId = typeof payload.id === "string" ? payload.id : `paypal_evt_${crypto.randomUUID()}`
    const resource = payload.resource && typeof payload.resource === "object"
      ? (payload.resource as Record<string, unknown>)
      : {}
    const providerRef = typeof resource.id === "string" ? resource.id : undefined
    const status = normalizePaypalStatus(resource.status)

    return {
      ok: true,
      eventId,
      providerRef,
      status,
      payload,
    }
  },
}
