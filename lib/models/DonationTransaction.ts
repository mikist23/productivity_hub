import mongoose, { Schema } from "mongoose"
import type { DonationMethod } from "@/lib/donations"

export type DonationStatus = "created" | "pending" | "paid" | "failed" | "refunded" | "disputed"

export interface DonationTransactionDocument {
  userId?: string | null
  amount: number
  currency: string
  provider: DonationMethod
  status: DonationStatus
  providerRef: string
  donorEmail?: string
  donorName?: string
  metadata?: Record<string, unknown>
  webhookEvents?: string[]
  updatedAt?: Date
  createdAt?: Date
}

const DonationTransactionSchema = new Schema<DonationTransactionDocument>(
  {
    userId: { type: String, default: null, index: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: "USD" },
    provider: {
      type: String,
      required: true,
      enum: ["buymeacoffee", "paypal", "stripe", "mpesa", "airtm", "bank"],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["created", "pending", "paid", "failed", "refunded", "disputed"],
      default: "created",
      index: true,
    },
    providerRef: { type: String, required: true, index: true },
    donorEmail: { type: String, default: "" },
    donorName: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
    webhookEvents: { type: [String], default: [] },
  },
  {
    timestamps: true,
    minimize: false,
  }
)

DonationTransactionSchema.index({ provider: 1, providerRef: 1 }, { unique: true })

export const DonationTransaction =
  (mongoose.models.DonationTransaction as mongoose.Model<DonationTransactionDocument>) ||
  mongoose.model<DonationTransactionDocument>("DonationTransaction", DonationTransactionSchema)
