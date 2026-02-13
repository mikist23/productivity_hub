export type TechCategoryId =
  | "ai"
  | "frontend"
  | "backend"
  | "mobile"
  | "cloud-devops"
  | "cybersecurity"
  | "data"
  | "space-nasa"
  | "startups-industry"

export type TechTrendLabel = "Emerging" | "Growing" | "Cooling" | "In Demand"

export interface TechStory {
  id: number
  title: string
  url: string | null
  by: string | null
  time: number | null
  score: number | null
  comments: number | null
  categories: TechCategoryId[]
  trendLabel: TechTrendLabel
}

export interface TechCategoryHighlight {
  categoryId: TechCategoryId
  trendLabel: TechTrendLabel
  storyCount: number
  stories: TechStory[]
}

export interface TechTrendSummary {
  evolving: TechCategoryId[]
  fading: TechCategoryId[]
  emerging: TechCategoryId[]
  demanded: TechCategoryId[]
}

export interface TechFeedResponse {
  topStories: TechStory[]
  categoryHighlights: TechCategoryHighlight[]
  trendSummary: TechTrendSummary
  generatedAt: string
}

export interface TechFilterState {
  query: string
  category: "all" | TechCategoryId
  sourceType: "all" | "stories" | "docs" | "opportunities"
}
