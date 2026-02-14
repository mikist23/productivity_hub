import { NextRequest } from "next/server"
import { z } from "zod"
import { connectToDatabase, isMongoConfigured, isMongoConnectionError, MONGO_UNAVAILABLE_ERROR } from "@/lib/mongodb"
import { DonationTransaction } from "@/lib/models/DonationTransaction"
import { resolveRequestUserId } from "@/lib/resolve-user-id"
import { jsonNoStore } from "@/lib/payments/http"

const bankProofSchema = z.object({
  providerRef: z.string().trim().min(3),
  transferReference: z.string().trim().min(3).max(120),
  amount: z.number().int().positive().optional(),
  currency: z.string().trim().min(3).max(6).optional(),
  proofUrl: z.string().trim().url().optional(),
  notes: z.string().trim().max(500).optional(),
})

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return jsonNoStore({ error: "MongoDB is not configured" }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  const parsed = bankProofSchema.safeParse(body)
  if (!parsed.success) {
    return jsonNoStore({ error: "Invalid bank proof payload." }, { status: 400 })
  }

  const userId = await resolveRequestUserId(req)

  try {
    await connectToDatabase()
    const result = await DonationTransaction.findOneAndUpdate(
      { provider: "bank", providerRef: parsed.data.providerRef },
      {
        $set: {
          status: "pending",
          metadata: {
            transferReference: parsed.data.transferReference,
            proofUrl: parsed.data.proofUrl ?? "",
            notes: parsed.data.notes ?? "",
            submittedAt: new Date().toISOString(),
            amount: parsed.data.amount,
            currency: parsed.data.currency?.toUpperCase(),
            submittedByUserId: userId ?? null,
          },
        },
      },
      { new: true }
    ).lean()

    if (!result) {
      return jsonNoStore({ error: "Bank transaction was not found." }, { status: 404 })
    }

    return jsonNoStore({
      ok: true,
      providerRef: result.providerRef,
      status: result.status,
    })
  } catch (error) {
    if (isMongoConnectionError(error)) {
      return jsonNoStore({ error: MONGO_UNAVAILABLE_ERROR }, { status: 503 })
    }
    return jsonNoStore({ error: "Unable to submit proof right now." }, { status: 500 })
  }
}
