export type DonationMode = "hosted" | "api"

export type DonationMethod = "buymeacoffee" | "paypal" | "stripe" | "mpesa" | "airtm" | "bank"

export type DonationMethodConfig = {
  method: DonationMethod
  label: string
  enabled: boolean
  hostedUrl: string | null
  description: string
}

const URL_HOST_ALLOWLIST: Record<DonationMethod, Set<string>> = {
  buymeacoffee: new Set(["buymeacoffee.com", "www.buymeacoffee.com"]),
  paypal: new Set(["paypal.com", "www.paypal.com", "paypal.me", "www.paypal.me"]),
  stripe: new Set(["buy.stripe.com", "checkout.stripe.com"]),
  mpesa: new Set(),
  airtm: new Set(["airtm.com", "www.airtm.com"]),
  bank: new Set(),
}

let hasWarnedInvalid = false

export function getDonationMode(): DonationMode {
  const raw = process.env.NEXT_PUBLIC_DONATION_MODE?.trim().toLowerCase()
  return raw === "api" ? "api" : "hosted"
}

export function isValidDonationUrl(method: DonationMethod, value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false

  if (method === "mpesa" || method === "bank") return false

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== "https:") return false
    const host = parsed.hostname.toLowerCase()
    return URL_HOST_ALLOWLIST[method].has(host)
  } catch {
    return false
  }
}

function getValidatedUrl(method: DonationMethod, envValue: string | undefined): string | null {
  const raw = envValue?.trim()
  if (!raw) return null
  if (!isValidDonationUrl(method, raw)) {
    if (process.env.NODE_ENV !== "production" && !hasWarnedInvalid) {
      hasWarnedInvalid = true
      console.warn(`Invalid donation URL for ${method}. The method will be hidden.`)
    }
    return null
  }
  return raw
}

export function getDonationMethodConfigs(): DonationMethodConfig[] {
  const buyMeCoffee = getValidatedUrl("buymeacoffee", process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_URL)
  const paypal = getValidatedUrl("paypal", process.env.NEXT_PUBLIC_PAYPAL_ME_URL)
  const stripe = getValidatedUrl("stripe", process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK)

  return [
    {
      method: "buymeacoffee",
      label: "Buy Me a Coffee",
      enabled: Boolean(buyMeCoffee),
      hostedUrl: buyMeCoffee,
      description: "Fast support checkout with card and wallet options.",
    },
    {
      method: "paypal",
      label: "PayPal",
      enabled: Boolean(paypal),
      hostedUrl: paypal,
      description: "Pay using PayPal balance or linked cards.",
    },
    {
      method: "stripe",
      label: "Stripe",
      enabled: Boolean(stripe),
      hostedUrl: stripe,
      description: "Secure hosted card checkout via Stripe Payment Link.",
    },
    {
      method: "mpesa",
      label: "M-Pesa",
      enabled: false,
      hostedUrl: null,
      description: "Planned API checkout for Kenya mobile payments.",
    },
    {
      method: "airtm",
      label: "Airtm",
      enabled: false,
      hostedUrl: null,
      description: "Planned integration pending account/API approval.",
    },
    {
      method: "bank",
      label: "Local Bank Transfer",
      enabled: true,
      hostedUrl: null,
      description: "Manual transfer with payment proof submission.",
    },
  ]
}

export function hasAnyDonationMethodEnabled() {
  return getDonationMethodConfigs().some((m) => m.enabled)
}

export function getLocalBankInstructions() {
  return {
    bankName: process.env.NEXT_PUBLIC_BANK_NAME?.trim() ?? "",
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME?.trim() ?? "",
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER?.trim() ?? "",
    swiftCode: process.env.NEXT_PUBLIC_BANK_SWIFT?.trim() ?? "",
    referenceNote: process.env.NEXT_PUBLIC_BANK_REFERENCE_NOTE?.trim() ?? "Use your email as transfer reference.",
  }
}
