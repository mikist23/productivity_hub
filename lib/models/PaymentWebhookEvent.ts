import mongoose, { Schema } from "mongoose"
import type { DonationMethod } from "@/lib/donations"

export interface PaymentWebhookEventDocument {
  provider: DonationMethod
  eventId: string
  processedAt?: Date
}

const PaymentWebhookEventSchema = new Schema<PaymentWebhookEventDocument>(
  {
    provider: {
      type: String,
      required: true,
      enum: ["buymeacoffee", "paypal", "stripe", "mpesa", "airtm", "bank"],
      index: true,
    },
    eventId: { type: String, required: true, index: true },
    processedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
)

PaymentWebhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true })

export const PaymentWebhookEvent =
  (mongoose.models.PaymentWebhookEvent as mongoose.Model<PaymentWebhookEventDocument>) ||
  mongoose.model<PaymentWebhookEventDocument>("PaymentWebhookEvent", PaymentWebhookEventSchema)
