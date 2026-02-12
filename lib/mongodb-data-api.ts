export interface DashboardCloudDocument {
  userId: string
  data: Record<string, unknown>
  updatedAt: string
}

const DATA_API_URL = process.env.MONGODB_DATA_API_URL
const DATA_API_KEY = process.env.MONGODB_DATA_API_KEY
const DATABASE = process.env.MONGODB_DATABASE ?? "productivity_hub"
const COLLECTION = process.env.MONGODB_COLLECTION ?? "dashboard_state"
const DATA_SOURCE = process.env.MONGODB_DATA_SOURCE ?? "Cluster0"

export function isMongoDataApiConfigured() {
  return Boolean(DATA_API_URL && DATA_API_KEY)
}

async function dataApiRequest<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  if (!DATA_API_URL || !DATA_API_KEY) {
    throw new Error("MongoDB Data API is not configured")
  }

  const response = await fetch(`${DATA_API_URL.replace(/\/$/, "")}/action/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": DATA_API_KEY,
    },
    body: JSON.stringify({
      dataSource: DATA_SOURCE,
      database: DATABASE,
      collection: COLLECTION,
      ...payload,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Mongo Data API ${action} failed: ${response.status} ${text}`)
  }

  return response.json() as Promise<T>
}

export async function loadDashboardDocument(userId: string): Promise<DashboardCloudDocument | null> {
  const result = await dataApiRequest<{ document?: DashboardCloudDocument | null }>("findOne", {
    filter: { userId },
  })

  return result.document ?? null
}

export async function saveDashboardDocument(userId: string, data: Record<string, unknown>) {
  const now = new Date().toISOString()
  await dataApiRequest("updateOne", {
    filter: { userId },
    update: {
      $set: {
        userId,
        data,
        updatedAt: now,
      },
    },
    upsert: true,
  })

  return { userId, data, updatedAt: now }
}
