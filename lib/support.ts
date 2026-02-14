const BUY_ME_COFFEE_HOSTS = new Set(["buymeacoffee.com", "www.buymeacoffee.com"])

let hasWarnedInvalidCoffeeUrl = false

export function isValidBuyMeCoffeeUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== "https:") return false
    const host = parsed.hostname.toLowerCase()
    return BUY_ME_COFFEE_HOSTS.has(host)
  } catch {
    return false
  }
}

export function getBuyMeCoffeeUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL
  if (!raw || raw.trim().length === 0) return null

  const trimmed = raw.trim()
  if (!isValidBuyMeCoffeeUrl(trimmed)) {
    if (process.env.NODE_ENV !== "production" && !hasWarnedInvalidCoffeeUrl) {
      hasWarnedInvalidCoffeeUrl = true
      console.warn(
        "Invalid NEXT_PUBLIC_BUY_ME_A_COFFEE_URL. Expected an https://buymeacoffee.com/... URL."
      )
    }
    return null
  }

  return trimmed
}
