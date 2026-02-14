import { NextRequest } from "next/server"
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb"
import { DonationTransaction } from "@/lib/models/DonationTransaction"
import { PaymentWebhookEvent } from "@/lib/models/PaymentWebhookEvent"
import { type DonationMethod } from "@/lib/donations"
import { getPaymentProviderAdapter } from "@/lib/payments/providers"
import { jsonNoStore } from "@/lib/payments/http"

const SUPPORTED_PROVIDERS = new Set<DonationMethod>(["paypal", "stripe", "mpesa", "airtm", "bank"])

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  if (!SUPPORTED_PROVIDERS.has(provider as DonationMethod)) {
    return jsonNoStore({ error: "Unsupported webhook provider." }, { status: 400 })
  }

  if (!isMongoConfigured()) {
    return jsonNoStore({ error: "MongoDB is not configured." }, { status: 503 })
  }

  const rawBody = await req.text()
  const adapter = getPaymentProviderAdapter(provider as DonationMethod)

  let verified
  try {
    verified = await adapter.verifyWebhook(rawBody, req.headers)
  } catch {
    return jsonNoStore({ error: "Webhook payload could not be verified." }, { status: 400 })
  }

  if (!verified.ok || !verified.eventId) {
    return jsonNoStore({ error: verified.message ?? "Invalid webhook payload." }, { status: 400 })
  }

  await connectToDatabase()

  const existing = await PaymentWebhookEvent.findOne({
    provider,
    eventId: verified.eventId,
  }).lean()

  if (existing) {
    return jsonNoStore({ ok: true, duplicate: true })
  }

  await PaymentWebhookEvent.create({
    provider,
    eventId: verified.eventId,
  })

  if (verified.providerRef && verified.status) {
    await DonationTransaction.findOneAndUpdate(
      { provider, providerRef: verified.providerRef },
      {
        $set: {
          status: verified.status,
          metadata: {
            webhookPayload: verified.payload ?? {},
            lastWebhookAt: new Date().toISOString(),
          },
        },
        $addToSet: { webhookEvents: verified.eventId },
      },
      { new: true }
    )
  }

  return jsonNoStore({ ok: true, processed: true })
}
