import mongoose from "mongoose"

function getMongoUri() {
  return process.env.MONGODB_URI?.trim() || ""
}

export function isMongoConfigured() {
  return getMongoUri().length > 0
}

export const MONGO_UNAVAILABLE_ERROR = "Database connection failed. Please try again in a moment."

export function isMongoConnectionError(error: unknown) {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    message.includes("server selection timed out") ||
    message.includes("timed out") ||
    message.includes("failed to connect") ||
    message.includes("econnrefused") ||
    message.includes("enotfound") ||
    message.includes("querysrv") ||
    message.includes("authentication failed") ||
    message.includes("bad auth")
  )
}

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | undefined
}

const cache = global.mongooseCache ?? { conn: null, promise: null }
global.mongooseCache = cache

export async function connectToDatabase() {
  const mongoUri = getMongoUri()
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI environment variable")
  }

  if (cache.conn) {
    return cache.conn
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(mongoUri, {
        dbName: process.env.MONGODB_DB || undefined,
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      })
      .catch((error) => {
        cache.promise = null
        throw error
      })
  }

  try {
    cache.conn = await cache.promise
    return cache.conn
  } catch (error) {
    cache.promise = null
    throw error
  }
}
