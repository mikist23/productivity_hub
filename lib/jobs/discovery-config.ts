export type JobWorkMode = "remote" | "hybrid" | "onsite"
export type JobEmploymentType = "full-time" | "part-time" | "contract" | "internship"

export interface JobCategory {
  id: string
  label: string
  query: string
}

export interface JobSearchCriteria {
  query?: string
  category?: string
  location?: string
  workMode?: JobWorkMode
  employmentType?: JobEmploymentType
}

export interface JobSourceProvider {
  id: string
  label: string
  baseUrl: string
}

export interface JobDiscoveryProvider extends JobSourceProvider {
  buildUrl: (criteria: JobSearchCriteria) => string
}

function buildSearchText(criteria: JobSearchCriteria) {
  const parts = [
    criteria.category,
    criteria.query,
    criteria.workMode === "remote" ? "remote" : criteria.workMode,
    criteria.employmentType,
    "jobs",
  ].filter(Boolean)

  return parts.join(" ").trim() || "tech jobs"
}

function cleanLocation(location?: string) {
  const val = (location ?? "").trim()
  if (val.length > 0) return val
  return "Worldwide"
}

export function buildJobSearchUrl(provider: JobDiscoveryProvider, criteria: JobSearchCriteria) {
  return provider.buildUrl(criteria)
}

export const jobCategories: JobCategory[] = [
  { id: "ai", label: "AI Jobs", query: "AI engineer machine learning" },
  { id: "software", label: "Software Engineering", query: "software engineer developer" },
  { id: "data", label: "Data Jobs", query: "data analyst data engineer" },
  { id: "devops", label: "DevOps", query: "devops sre cloud engineer" },
  { id: "product", label: "Product", query: "product manager product owner" },
  { id: "ux", label: "UX / Design", query: "ux designer product designer" },
  { id: "cybersecurity", label: "Cybersecurity", query: "security analyst cybersecurity" },
  { id: "accounting", label: "Accounting", query: "accountant finance analyst" },
  { id: "architecture", label: "Architecture", query: "architect designer" },
  { id: "marketing", label: "Marketing", query: "digital marketing specialist" },
  { id: "operations", label: "Operations", query: "operations analyst coordinator" },
]

export const jobSourceProviders: JobDiscoveryProvider[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    baseUrl: "https://www.linkedin.com/jobs/search/",
    buildUrl: (criteria) => {
      const keywords = encodeURIComponent(buildSearchText(criteria))
      const location = encodeURIComponent(cleanLocation(criteria.location))
      return `https://www.linkedin.com/jobs/search/?keywords=${keywords}&location=${location}`
    },
  },
  {
    id: "indeed",
    label: "Indeed",
    baseUrl: "https://www.indeed.com/jobs",
    buildUrl: (criteria) => {
      const query = encodeURIComponent(buildSearchText(criteria))
      const location = encodeURIComponent(cleanLocation(criteria.location))
      return `https://www.indeed.com/jobs?q=${query}&l=${location}`
    },
  },
  {
    id: "glassdoor",
    label: "Glassdoor",
    baseUrl: "https://www.glassdoor.com/Job/jobs.htm",
    buildUrl: (criteria) => {
      const query = encodeURIComponent(buildSearchText(criteria))
      const location = encodeURIComponent(cleanLocation(criteria.location))
      return `https://www.glassdoor.com/Job/jobs.htm?keyword=${query}&locKeyword=${location}`
    },
  },
  {
    id: "wellfound",
    label: "Wellfound",
    baseUrl: "https://wellfound.com/jobs",
    buildUrl: (criteria) => {
      const query = encodeURIComponent(buildSearchText(criteria))
      const location = encodeURIComponent(cleanLocation(criteria.location))
      return `https://wellfound.com/jobs?query=${query}&location=${location}`
    },
  },
  {
    id: "google-jobs",
    label: "Google Jobs",
    baseUrl: "https://www.google.com/search",
    buildUrl: (criteria) => {
      const query = encodeURIComponent(`${buildSearchText(criteria)} in ${cleanLocation(criteria.location)}`)
      return `https://www.google.com/search?q=${query}`
    },
  },
]
