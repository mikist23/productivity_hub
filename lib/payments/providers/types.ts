import type { DonationMethod } from "@/lib/donations"
import type { DonationStatus } from "@/lib/models/DonationTransaction"

export type PaymentIntentRequest = {
  amount: number
  currency: string
  donorEmail?: string
  donorName?: string
  metadata?: Record<string, unknown>
}

export type PaymentIntentResult = {
  providerRef: string
  status: DonationStatus
  checkoutUrl?: string | null
  message?: string
}

export type WebhookVerificationResult = {
  ok: boolean
  eventId?: string
  providerRef?: string
  status?: DonationStatus
  payload?: Record<string, unknown>
  message?: string
}

export type PaymentProviderAdapter = {
  provider: DonationMethod
  createPaymentIntent(input: PaymentIntentRequest): Promise<PaymentIntentResult>
  verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult>
}
