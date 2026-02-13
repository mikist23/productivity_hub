import type {
  RecommendationRequestOptions,
  RecommendationReasonCode,
  RankedSkillTrack,
  SkillDifficulty,
  SkillTrackRecommendation,
  UserSkillSignal,
} from "@/lib/skills/types"

const beginnerWeight: Record<SkillDifficulty, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

function hasTokenIntersection(a: Set<string>, b: Set<string>) {
  for (const token of a) {
    if (b.has(token)) return true
  }
  return false
}

export function extractUserSkillSignals(skills: UserSkillSignal[]) {
  const allTokens = new Set<string>()
  const activeTokens = new Set<string>()

  for (const skill of skills) {
    const parts = [...tokenize(skill.name), ...tokenize(skill.category)]
    for (const token of parts) {
      allTokens.add(token)
      if (skill.status === "learning" || skill.status === "inprogress") {
        activeTokens.add(token)
      }
    }
  }

  return { allTokens, activeTokens }
}

function scoreTrack(
  track: SkillTrackRecommendation,
  signal: ReturnType<typeof extractUserSkillSignals>,
  hasAnySkill: boolean
) {
  const reasons: RecommendationReasonCode[] = []
  let score = track.demandScore * 0.55

  if (track.demandScore >= 86) {
    reasons.push("high_market_demand")
  }

  const trackTokens = new Set<string>([
    ...track.tags.flatMap((tag) => tokenize(tag)),
    ...tokenize(track.title),
    ...tokenize(track.domain),
  ])

  let overlapCount = 0
  for (const token of trackTokens) {
    if (signal.allTokens.has(token)) overlapCount += 1
  }

  if (overlapCount > 0) {
    score += Math.min(24, overlapCount * 4.5)
    reasons.push("builds_on_existing_skill")
  }

  if (hasTokenIntersection(trackTokens, signal.activeTokens)) {
    score += 12
    reasons.push("adjacent_to_current_focus")
  }

  if (!hasAnySkill && track.difficulty === "Beginner") {
    score += 18
    reasons.push("fills_foundational_gap")
  }

  if (track.tags.includes("fundamentals") && track.difficulty === "Beginner") {
    score += 6
    if (!reasons.includes("fills_foundational_gap")) {
      reasons.push("fills_foundational_gap")
    }
  }

  if (reasons.length === 0) {
    reasons.push("high_market_demand")
  }

  return { score, reasons }
}

export function rankSkillRecommendations(
  tracks: SkillTrackRecommendation[],
  userSkills: UserSkillSignal[],
  options: RecommendationRequestOptions = {}
): RankedSkillTrack[] {
  const { domain = "All", sortBy = "recommended" } = options
  const signal = extractUserSkillSignals(userSkills)
  const hasAnySkill = userSkills.length > 0

  const ranked = tracks
    .filter((track) => (domain === "All" ? true : track.domain === domain))
    .map((track) => {
      const { score, reasons } = scoreTrack(track, signal, hasAnySkill)
      return { ...track, score, reasons }
    })

  if (sortBy === "demand") {
    return ranked.sort((a, b) => {
      if (b.demandScore !== a.demandScore) return b.demandScore - a.demandScore
      return a.title.localeCompare(b.title)
    })
  }

  if (sortBy === "beginner") {
    return ranked.sort((a, b) => {
      if (beginnerWeight[a.difficulty] !== beginnerWeight[b.difficulty]) {
        return beginnerWeight[a.difficulty] - beginnerWeight[b.difficulty]
      }
      if (b.demandScore !== a.demandScore) return b.demandScore - a.demandScore
      return a.title.localeCompare(b.title)
    })
  }

  return ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.demandScore !== a.demandScore) return b.demandScore - a.demandScore
    return a.title.localeCompare(b.title)
  })
}

function inferCategory(domain: SkillTrackRecommendation["domain"]) {
  switch (domain) {
    case "AI":
    case "Data":
      return "AI & Data"
    case "Cloud":
    case "Containers":
    case "Platform":
    case "DevOps":
      return "Cloud & Platform"
    case "Frontend":
    case "Mobile":
      return "Application Development"
    case "Security":
      return "Security"
    default:
      return "Architecture"
  }
}

function inferLevel(difficulty: SkillDifficulty) {
  switch (difficulty) {
    case "Beginner":
      return "Beginner"
    case "Intermediate":
      return "Intermediate"
    case "Advanced":
      return "Advanced"
    default:
      return "Beginner"
  }
}

export function recommendationToSkillPrefill(track: SkillTrackRecommendation) {
  return {
    initialCategory: inferCategory(track.domain),
    initialName: track.title,
    initialLevel: inferLevel(track.difficulty),
    initialStatus: "learning" as const,
    initialProgress: 0,
  }
}
