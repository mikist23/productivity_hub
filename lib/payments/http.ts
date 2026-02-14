import { NextResponse } from "next/server"

export function withNoStoreHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  return response
}

export function jsonNoStore(body: unknown, init?: Parameters<typeof NextResponse.json>[1]) {
  return withNoStoreHeaders(NextResponse.json(body, init))
}
