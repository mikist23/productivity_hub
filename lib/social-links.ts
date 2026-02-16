export type SocialPlatform = "github" | "x" | "linkedin"

type SocialLink = {
  platform: SocialPlatform
  href: string
}

const PLATFORM_HOSTS: Record<SocialPlatform, Set<string>> = {
  github: new Set(["github.com", "www.github.com"]),
  x: new Set(["x.com", "www.x.com", "twitter.com", "www.twitter.com"]),
  linkedin: new Set(["linkedin.com", "www.linkedin.com"]),
}

const PLATFORM_ENV_KEYS: Record<SocialPlatform, string> = {
  github: "NEXT_PUBLIC_SOCIAL_GITHUB_URL",
  x: "NEXT_PUBLIC_SOCIAL_X_URL",
  linkedin: "NEXT_PUBLIC_SOCIAL_LINKEDIN_URL",
}

const warnedInvalid = new Set<string>()

function normalizeSocialUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim()
  if (!trimmed) return null
  if (trimmed.includes("<") || trimmed.includes(">")) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function isValidSocialUrl(platform: SocialPlatform, rawUrl: string): boolean {
  const normalized = normalizeSocialUrl(rawUrl)
  if (!normalized) return false

  try {
    const parsed = new URL(normalized)
    if (parsed.protocol !== "https:") return false
    const host = parsed.hostname.toLowerCase()
    return PLATFORM_HOSTS[platform].has(host)
  } catch {
    return false
  }
}

function getPlatformUrl(platform: SocialPlatform): string | null {
  const envKey = PLATFORM_ENV_KEYS[platform]
  const raw = process.env[envKey]
  if (!raw || raw.trim().length === 0) return null

  const normalized = normalizeSocialUrl(raw)
  if (!normalized || !isValidSocialUrl(platform, normalized)) {
    if (process.env.NODE_ENV !== "production" && !warnedInvalid.has(envKey)) {
      warnedInvalid.add(envKey)
      console.warn(`Invalid ${envKey}. Expected an https URL for ${platform}.`)
    }
    return null
  }

  return normalized
}

export function getSocialLinks(): SocialLink[] {
  const order: SocialPlatform[] = ["github", "x", "linkedin"]
  const links: SocialLink[] = []

  for (const platform of order) {
    const href = getPlatformUrl(platform)
    if (href) links.push({ platform, href })
  }

  return links
}
