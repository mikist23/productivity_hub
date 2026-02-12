import mongoose from "mongoose"

function getMongoUri() {
  return process.env.MONGODB_URI?.trim() || ""
}

export function isMongoConfigured() {
  return getMongoUri().length > 0
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
    cache.promise = mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB || undefined,
      bufferCommands: false,
    })
  }

  cache.conn = await cache.promise
  return cache.conn
}
