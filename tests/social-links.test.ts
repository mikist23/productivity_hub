import { afterEach, describe, expect, it, vi } from "vitest"

const originalGithub = process.env.NEXT_PUBLIC_SOCIAL_GITHUB_URL
const originalX = process.env.NEXT_PUBLIC_SOCIAL_X_URL
const originalLinkedIn = process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL

describe("social links config", () => {
  afterEach(() => {
    if (originalGithub === undefined) {
      delete process.env.NEXT_PUBLIC_SOCIAL_GITHUB_URL
    } else {
      process.env.NEXT_PUBLIC_SOCIAL_GITHUB_URL = originalGithub
    }

    if (originalX === undefined) {
      delete process.env.NEXT_PUBLIC_SOCIAL_X_URL
    } else {
      process.env.NEXT_PUBLIC_SOCIAL_X_URL = originalX
    }

    if (originalLinkedIn === undefined) {
      delete process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL
    } else {
      process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL = originalLinkedIn
    }

    vi.restoreAllMocks()
    vi.resetModules()
  })

  it("accepts valid social URLs and preserves ordering", async () => {
    process.env.NEXT_PUBLIC_SOCIAL_GITHUB_URL = "https://github.com/productivityhub"
    process.env.NEXT_PUBLIC_SOCIAL_X_URL = "https://x.com/productivityhub"
    process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL = "https://www.linkedin.com/in/productivityhub"

    const { getSocialLinks } = await import("../lib/social-links")
    const links = getSocialLinks()

    expect(links.map((link) => link.platform)).toEqual(["github", "x", "linkedin"])
  })

  it("normalizes URLs that omit protocol", async () => {
    process.env.NEXT_PUBLIC_SOCIAL_GITHUB_URL = "github.com/productivityhub"
    delete process.env.NEXT_PUBLIC_SOCIAL_X_URL
    delete process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL

    const { getSocialLinks } = await import("../lib/social-links")
    const links = getSocialLinks()

    expect(links).toEqual([{ platform: "github", href: "https://github.com/productivityhub" }])
  })

  it("rejects placeholder values with angle brackets", async () => {
    process.env.NEXT_PUBLIC_SOCIAL_GITHUB_URL = "https://github.com/<your-handle>"
    process.env.NEXT_PUBLIC_SOCIAL_X_URL = "https://x.com/<your-handle>"
    process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL = "https://www.linkedin.com/in/<your-handle>"
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    const { getSocialLinks } = await import("../lib/social-links")
    const links = getSocialLinks()

    expect(links).toHaveLength(0)
    expect(warnSpy).toHaveBeenCalled()
  })
})
