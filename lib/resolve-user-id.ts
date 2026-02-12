import { getServerSession } from "next-auth"
import type { NextRequest } from "next/server"
import { authOptions } from "@/lib/auth"

export async function resolveRequestUserId(req: NextRequest) {
  void req
  const session = await getServerSession(authOptions)
  const sessionUserId = session?.user?.id?.trim()
  if (sessionUserId) {
    return sessionUserId
  }

  return null
}
