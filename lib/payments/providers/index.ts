import crypto from "crypto"
import type { DonationMethod } from "@/lib/donations"
import type { PaymentProviderAdapter } from "@/lib/payments/providers/types"
import { stripeProvider } from "@/lib/payments/providers/stripe"
import { paypalProvider } from "@/lib/payments/providers/paypal"
import { mpesaProvider } from "@/lib/payments/providers/mpesa"
import { airtmProvider } from "@/lib/payments/providers/airtm"
import { bankProvider } from "@/lib/payments/providers/bank"

const providerMap: Record<DonationMethod, PaymentProviderAdapter> = {
  buymeacoffee: {
    provider: "buymeacoffee",
    async createPaymentIntent() {
      return {
        providerRef: `buymeacoffee_${crypto.randomUUID()}`,
        status: "created",
        checkoutUrl: process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL?.trim() || null,
      }
    },
    async verifyWebhook() {
      return { ok: false, message: "Buy Me a Coffee webhook not configured in this app." }
    },
  },
  paypal: paypalProvider,
  stripe: stripeProvider,
  mpesa: mpesaProvider,
  airtm: airtmProvider,
  bank: bankProvider,
}

export function getPaymentProviderAdapter(provider: DonationMethod) {
  return providerMap[provider]
}
