import { afterEach, describe, expect, it, vi } from "vitest"

const originalCoffeeUrl = process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL

describe("buy me a coffee support config", () => {
  afterEach(() => {
    if (originalCoffeeUrl === undefined) {
      delete process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL
    } else {
      process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL = originalCoffeeUrl
    }
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it("accepts valid buymeacoffee https urls", async () => {
    process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/productivityhub"
    const { isValidBuyMeCoffeeUrl, getBuyMeCoffeeUrl } = await import("../lib/support")

    expect(isValidBuyMeCoffeeUrl("https://www.buymeacoffee.com/team")).toBe(true)
    expect(getBuyMeCoffeeUrl()).toBe("https://buymeacoffee.com/productivityhub")
  })

  it("rejects invalid protocol and non-buymeacoffee domains", async () => {
    process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL = "http://buymeacoffee.com/productivityhub"
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const { isValidBuyMeCoffeeUrl, getBuyMeCoffeeUrl } = await import("../lib/support")

    expect(isValidBuyMeCoffeeUrl("http://buymeacoffee.com/productivityhub")).toBe(false)
    expect(isValidBuyMeCoffeeUrl("https://example.com/support")).toBe(false)
    expect(getBuyMeCoffeeUrl()).toBeNull()
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it("returns null when env var is missing or empty", async () => {
    delete process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL
    const { getBuyMeCoffeeUrl } = await import("../lib/support")

    expect(getBuyMeCoffeeUrl()).toBeNull()

    process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL = "   "
    expect(getBuyMeCoffeeUrl()).toBeNull()
  })
})
