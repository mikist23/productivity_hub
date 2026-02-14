import crypto from "crypto"
import type { PaymentIntentRequest, PaymentIntentResult, PaymentProviderAdapter, WebhookVerificationResult } from "@/lib/payments/providers/types"

function createProviderRef(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function normalizeStripeStatus(status: unknown): PaymentIntentResult["status"] {
  if (status === "succeeded") return "paid"
  if (status === "processing" || status === "requires_action") return "pending"
  if (status === "canceled" || status === "requires_payment_method") return "failed"
  return "created"
}

export const stripeProvider: PaymentProviderAdapter = {
  provider: "stripe",
  async createPaymentIntent(input: PaymentIntentRequest) {
    const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim()
    if (!paymentLink) {
      return {
        providerRef: createProviderRef("stripe"),
        status: "created",
        message: "Stripe payment link is not configured.",
      }
    }

    return {
      providerRef: createProviderRef("stripe"),
      status: "created",
      checkoutUrl: paymentLink,
      message: `Hosted Stripe checkout initialized for ${input.currency.toUpperCase()} ${input.amount}.`,
    }
  },
  async verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
    if (!secret) {
      return { ok: false, message: "Missing STRIPE_WEBHOOK_SECRET" }
    }

    const signature = headers.get("x-provider-signature")?.trim()
    if (!signature || signature !== secret) {
      return { ok: false, message: "Invalid webhook signature" }
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>
    const eventId = typeof payload.id === "string" ? payload.id : `stripe_evt_${crypto.randomUUID()}`
    const objectPayload = payload.data && typeof payload.data === "object"
      ? (payload.data as { object?: Record<string, unknown> }).object
      : undefined
    const providerRef = typeof objectPayload?.id === "string" ? objectPayload.id : undefined
    const status = normalizeStripeStatus(objectPayload?.status)

    return {
      ok: true,
      eventId,
      providerRef,
      status,
      payload,
    }
  },
}
