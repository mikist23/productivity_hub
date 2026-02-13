export type SkillTrackDomain =
  | "AI"
  | "Backend"
  | "Cloud"
  | "Containers"
  | "Data"
  | "Security"
  | "DevOps"
  | "Frontend"
  | "Mobile"
  | "Architecture"
  | "Platform"

export type SkillDifficulty = "Beginner" | "Intermediate" | "Advanced"

export type RecommendationSort = "recommended" | "demand" | "beginner"

export type RecommendationReasonCode =
  | "builds_on_existing_skill"
  | "high_market_demand"
  | "fills_foundational_gap"
  | "adjacent_to_current_focus"

export interface SkillResourceLink {
  title: string
  url: string
  provider: string
}

export interface SkillTrackResources {
  officialDocs: SkillResourceLink[]
  youtubeChannels: SkillResourceLink[]
  labsHandsOn: SkillResourceLink[]
  roadmaps: SkillResourceLink[]
  blogsAndGuides: SkillResourceLink[]
  projectIdeas: string[]
}

export interface SkillTrackRecommendation {
  id: string
  title: string
  domain: SkillTrackDomain
  demandScore: number
  trendLabel: string
  difficulty: SkillDifficulty
  estimatedMonths: number
  summary: string
  whyNow: string
  tags: string[]
  roadmapMilestones: string[]
  resources: SkillTrackResources
}

export interface RankedSkillTrack extends SkillTrackRecommendation {
  score: number
  reasons: RecommendationReasonCode[]
}

export interface RecommendationRequestOptions {
  domain?: SkillTrackDomain | "All"
  sortBy?: RecommendationSort
}

export interface UserSkillSignal {
  name: string
  category: string
  status: "learning" | "inprogress" | "mastered"
}
