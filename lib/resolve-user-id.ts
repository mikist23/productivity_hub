import { getServerSession } from "next-auth"
import type { NextRequest } from "next/server"
import { authOptions } from "@/lib/auth"

export async function resolveRequestUserId(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionUserId = session?.user?.id?.trim()
  if (sessionUserId) {
    return sessionUserId
  }

  // Fallback for local auth mode (client-managed auth users).
  const headerUserId = req.headers.get("x-mapmonet-user-id")?.trim()
  if (headerUserId) {
    return headerUserId
  }

  return null
}
