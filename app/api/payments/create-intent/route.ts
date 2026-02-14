import crypto from "crypto"
import { NextRequest } from "next/server"
import { z } from "zod"
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb"
import { DonationTransaction } from "@/lib/models/DonationTransaction"
import { resolveRequestUserId } from "@/lib/resolve-user-id"
import { getDonationMethodConfigs, getDonationMode, type DonationMethod } from "@/lib/donations"
import { getPaymentProviderAdapter } from "@/lib/payments/providers"
import { jsonNoStore } from "@/lib/payments/http"

const createIntentSchema = z.object({
  provider: z.enum(["buymeacoffee", "paypal", "stripe", "mpesa", "airtm", "bank"]),
  amount: z.number().int().positive().default(5),
  currency: z.string().trim().min(3).max(6).default("USD"),
  donorName: z.string().trim().max(120).optional(),
  donorEmail: z.string().trim().email().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

function getHostedUrl(method: DonationMethod) {
  const map = new Map(getDonationMethodConfigs().map((m) => [m.method, m.hostedUrl]))
  return map.get(method) ?? null
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = createIntentSchema.safeParse(body)
  if (!parsed.success) {
    return jsonNoStore({ error: "Invalid payment intent payload." }, { status: 400 })
  }

  const mode = getDonationMode()
  const methodConfig = getDonationMethodConfigs().find((m) => m.method === parsed.data.provider)
  if (!methodConfig) {
    return jsonNoStore({ error: "Unsupported payment provider." }, { status: 400 })
  }

  const userId = await resolveRequestUserId(req)
  const provider = parsed.data.provider
  let providerRef = `${provider}_${crypto.randomUUID()}`
  let checkoutUrl: string | null = null
  let status: "created" | "pending" | "paid" | "failed" | "refunded" | "disputed" = "created"
  let message = ""

  if (mode === "hosted") {
    checkoutUrl = getHostedUrl(provider)
    if (!checkoutUrl && provider !== "bank") {
      return jsonNoStore({ error: `${methodConfig.label} is not configured yet.` }, { status: 400 })
    }
    if (provider === "bank") {
      status = "pending"
      message = "Manual bank transfer initialized."
    }
  } else {
    const adapter = getPaymentProviderAdapter(provider)
    const adapterResult = await adapter.createPaymentIntent({
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      donorEmail: parsed.data.donorEmail,
      donorName: parsed.data.donorName,
      metadata: parsed.data.metadata,
    })
    providerRef = adapterResult.providerRef || providerRef
    checkoutUrl = adapterResult.checkoutUrl ?? null
    status = adapterResult.status
    message = adapterResult.message ?? ""
  }

  let trackingSaved = false
  if (isMongoConfigured()) {
    try {
      await connectToDatabase()
      await DonationTransaction.create({
        userId: userId ?? null,
        amount: parsed.data.amount,
        currency: parsed.data.currency.toUpperCase(),
        provider,
        status,
        providerRef,
        donorEmail: parsed.data.donorEmail ?? "",
        donorName: parsed.data.donorName ?? "",
        metadata: parsed.data.metadata ?? {},
      })
      trackingSaved = true
    } catch {
      trackingSaved = false
    }
  }

  return jsonNoStore({
    ok: true,
    mode,
    provider,
    providerRef,
    status,
    checkoutUrl,
    trackingSaved,
    message,
  })
}
