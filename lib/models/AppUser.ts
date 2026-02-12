import mongoose, { Schema } from "mongoose"
import type { RecoveryCodeRecord } from "@/lib/server-auth"

export interface AppUserDocument {
  userId: string
  email: string
  name: string
  image?: string | null
  provider: "local" | "google"
  passwordHash?: string
  salt?: string
  recoveryCodes: RecoveryCodeRecord[]
  createdAt?: Date
  updatedAt?: Date
}

const RecoveryCodeSchema = new Schema<RecoveryCodeRecord>(
  {
    codeHash: { type: String, required: true },
    used: { type: Boolean, default: false },
    createdAt: { type: String, required: true },
  },
  { _id: false }
)

const AppUserSchema = new Schema<AppUserDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    passwordHash: { type: String, default: undefined },
    salt: { type: String, default: undefined },
    recoveryCodes: { type: [RecoveryCodeSchema], default: [] },
  },
  {
    timestamps: true,
  }
)

export const AppUser =
  (mongoose.models.AppUser as mongoose.Model<AppUserDocument>) ||
  mongoose.model<AppUserDocument>("AppUser", AppUserSchema)
