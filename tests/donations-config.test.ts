import { afterEach, describe, expect, it, vi } from "vitest"

const originalEnv = {
  mode: process.env.NEXT_PUBLIC_DONATION_MODE,
  coffee: process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL,
  paypal: process.env.NEXT_PUBLIC_PAYPAL_ME_URL,
  stripe: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK,
}

describe("donations config", () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_DONATION_MODE = originalEnv.mode
    process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL = originalEnv.coffee
    process.env.NEXT_PUBLIC_PAYPAL_ME_URL = originalEnv.paypal
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK = originalEnv.stripe
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it("defaults to hosted donation mode", async () => {
    delete process.env.NEXT_PUBLIC_DONATION_MODE
    const { getDonationMode } = await import("../lib/donations")
    expect(getDonationMode()).toBe("hosted")
  })

  it("accepts api donation mode when configured", async () => {
    process.env.NEXT_PUBLIC_DONATION_MODE = "api"
    const { getDonationMode } = await import("../lib/donations")
    expect(getDonationMode()).toBe("api")
  })

  it("accepts valid hosted URLs and hides invalid ones", async () => {
    process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/productivityhub"
    process.env.NEXT_PUBLIC_PAYPAL_ME_URL = "https://paypal.me/productivityhub"
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_123"

    const { getDonationMethodConfigs } = await import("../lib/donations")
    const methods = getDonationMethodConfigs()

    expect(methods.find((m) => m.method === "buymeacoffee")?.enabled).toBe(true)
    expect(methods.find((m) => m.method === "paypal")?.enabled).toBe(true)
    expect(methods.find((m) => m.method === "stripe")?.enabled).toBe(true)

    process.env.NEXT_PUBLIC_PAYPAL_ME_URL = "http://example.com/paypal"
    vi.resetModules()
    const { getDonationMethodConfigs: refreshed } = await import("../lib/donations")
    const nextMethods = refreshed()
    expect(nextMethods.find((m) => m.method === "paypal")?.enabled).toBe(false)
  })
})
