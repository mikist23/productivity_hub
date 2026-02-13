import type { TechCategoryId, TechTrendLabel } from "./types"

export interface TechSourceLink {
  id: string
  label: string
  provider: string
  href: string
  searchBase: string
}

export interface TechOpportunityLink {
  id: string
  label: string
  description: string
  href: string
}

export interface TechCategory {
  id: TechCategoryId
  label: string
  description: string
  keywords: string[]
  sources: TechSourceLink[]
}

export function buildCategorySearchUrl(
  source: Pick<TechSourceLink, "searchBase">,
  params: { query?: string; topic?: string; dateRange?: "day" | "week" | "month" }
) {
  const q = [params.topic, params.query].filter(Boolean).join(" ").trim()
  if (!q) return source.searchBase
  const encoded = encodeURIComponent(q)
  const suffix =
    params.dateRange === "day"
      ? "&tbs=qdr:d"
      : params.dateRange === "week"
      ? "&tbs=qdr:w"
      : params.dateRange === "month"
      ? "&tbs=qdr:m"
      : ""
  return `${source.searchBase}${encoded}${suffix}`
}

export function scoreStoryForCategory(title: string, categoryKeywords: string[]) {
  const normalized = title.toLowerCase()
  return categoryKeywords.reduce((acc, keyword) => {
    const needle = keyword.toLowerCase().trim()
    if (needle.length < 2) return acc
    return normalized.includes(needle) ? acc + 1 : acc
  }, 0)
}

export function computeTrendLabel(storyMentions: number, recentWindow: number): TechTrendLabel {
  if (storyMentions >= 7 || (storyMentions >= 4 && recentWindow >= 3)) return "In Demand"
  if (storyMentions >= 3) return "Growing"
  if (storyMentions >= 1 && recentWindow >= 1) return "Emerging"
  return "Cooling"
}

export const techCategories: TechCategory[] = [
  {
    id: "ai",
    label: "AI",
    description: "Model releases, AI apps, tooling, and practical adoption.",
    keywords: ["ai", "llm", "model", "openai", "anthropic", "inference", "agent", "ml"],
    sources: [
      {
        id: "openai-news",
        label: "OpenAI News",
        provider: "OpenAI",
        href: "https://openai.com/news/",
        searchBase: "https://www.google.com/search?q=",
      },
      {
        id: "huggingface-blog",
        label: "Hugging Face Blog",
        provider: "Hugging Face",
        href: "https://huggingface.co/blog",
        searchBase: "https://www.google.com/search?q=site:huggingface.co%2Fblog+",
      },
      {
        id: "google-ai-blog",
        label: "Google AI Blog",
        provider: "Google",
        href: "https://blog.google/technology/ai/",
        searchBase: "https://www.google.com/search?q=site:blog.google+ai+",
      },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    description: "Web UI frameworks, browser APIs, and frontend performance.",
    keywords: ["frontend", "react", "next.js", "vue", "svelte", "css", "web", "ui"],
    sources: [
      {
        id: "web-dev-blog",
        label: "web.dev",
        provider: "Google",
        href: "https://web.dev/blog/",
        searchBase: "https://www.google.com/search?q=site:web.dev+",
      },
      {
        id: "react-blog",
        label: "React Blog",
        provider: "Meta",
        href: "https://react.dev/blog",
        searchBase: "https://www.google.com/search?q=site:react.dev%2Fblog+",
      },
      {
        id: "chromium-blog",
        label: "Chromium Blog",
        provider: "Google",
        href: "https://blog.chromium.org/",
        searchBase: "https://www.google.com/search?q=site:blog.chromium.org+",
      },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    description: "APIs, systems architecture, server runtimes, and distributed systems.",
    keywords: ["backend", "api", "server", "database", "postgres", "rust", "go", "node"],
    sources: [
      {
        id: "infoq-architecture",
        label: "InfoQ Architecture",
        provider: "InfoQ",
        href: "https://www.infoq.com/architecture-design/",
        searchBase: "https://www.google.com/search?q=site:infoq.com+architecture+",
      },
      {
        id: "martin-fowler",
        label: "Martin Fowler",
        provider: "Thoughtworks",
        href: "https://martinfowler.com/",
        searchBase: "https://www.google.com/search?q=site:martinfowler.com+",
      },
      {
        id: "cloudflare-blog",
        label: "Cloudflare Blog",
        provider: "Cloudflare",
        href: "https://blog.cloudflare.com/",
        searchBase: "https://www.google.com/search?q=site:blog.cloudflare.com+",
      },
    ],
  },
  {
    id: "mobile",
    label: "Mobile / App Dev",
    description: "iOS, Android, Flutter, React Native, and mobile app tooling.",
    keywords: ["android", "ios", "swift", "kotlin", "flutter", "react native", "mobile", "app"],
    sources: [
      {
        id: "android-dev-blog",
        label: "Android Developers",
        provider: "Google",
        href: "https://android-developers.googleblog.com/",
        searchBase: "https://www.google.com/search?q=site:android-developers.googleblog.com+",
      },
      {
        id: "apple-dev-news",
        label: "Apple Developer News",
        provider: "Apple",
        href: "https://developer.apple.com/news/",
        searchBase: "https://www.google.com/search?q=site:developer.apple.com%2Fnews+",
      },
      {
        id: "flutter-news",
        label: "Flutter News",
        provider: "Google",
        href: "https://medium.com/flutter",
        searchBase: "https://www.google.com/search?q=site:medium.com%2Fflutter+",
      },
    ],
  },
  {
    id: "cloud-devops",
    label: "Cloud / DevOps",
    description: "Kubernetes, CI/CD, SRE, platform engineering, and cloud releases.",
    keywords: ["kubernetes", "docker", "devops", "sre", "cloud", "aws", "azure", "gcp"],
    sources: [
      {
        id: "aws-whats-new",
        label: "AWS What's New",
        provider: "AWS",
        href: "https://aws.amazon.com/new/",
        searchBase: "https://www.google.com/search?q=site:aws.amazon.com%2Fnew+",
      },
      {
        id: "google-cloud-blog",
        label: "Google Cloud Blog",
        provider: "Google",
        href: "https://cloud.google.com/blog",
        searchBase: "https://www.google.com/search?q=site:cloud.google.com%2Fblog+",
      },
      {
        id: "kubernetes-blog",
        label: "Kubernetes Blog",
        provider: "CNCF",
        href: "https://kubernetes.io/blog/",
        searchBase: "https://www.google.com/search?q=site:kubernetes.io%2Fblog+",
      },
    ],
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity",
    description: "Threat intel, security engineering, and vulnerability response.",
    keywords: ["security", "vulnerability", "cve", "breach", "malware", "zero-day", "auth"],
    sources: [
      {
        id: "cisa-news",
        label: "CISA Alerts",
        provider: "CISA",
        href: "https://www.cisa.gov/news-events",
        searchBase: "https://www.google.com/search?q=site:cisa.gov+",
      },
      {
        id: "the-hacker-news",
        label: "The Hacker News",
        provider: "The Hacker News",
        href: "https://thehackernews.com/",
        searchBase: "https://www.google.com/search?q=site:thehackernews.com+",
      },
      {
        id: "cloudflare-security",
        label: "Cloudflare Security",
        provider: "Cloudflare",
        href: "https://blog.cloudflare.com/tag/security/",
        searchBase: "https://www.google.com/search?q=site:blog.cloudflare.com+security+",
      },
    ],
  },
  {
    id: "data",
    label: "Data",
    description: "Data engineering, analytics, ML data pipelines, and warehouse trends.",
    keywords: ["data", "analytics", "warehouse", "spark", "airflow", "dbt", "etl", "bi"],
    sources: [
      {
        id: "databricks-blog",
        label: "Databricks Blog",
        provider: "Databricks",
        href: "https://www.databricks.com/blog",
        searchBase: "https://www.google.com/search?q=site:databricks.com%2Fblog+",
      },
      {
        id: "snowflake-blog",
        label: "Snowflake Blog",
        provider: "Snowflake",
        href: "https://www.snowflake.com/en/blog/",
        searchBase: "https://www.google.com/search?q=site:snowflake.com+",
      },
      {
        id: "kaggle-blog",
        label: "Kaggle Blog",
        provider: "Kaggle",
        href: "https://medium.com/kaggle-blog",
        searchBase: "https://www.google.com/search?q=site:medium.com%2Fkaggle-blog+",
      },
    ],
  },
  {
    id: "space-nasa",
    label: "Space / NASA",
    description: "Space technology, exploration missions, and aerospace engineering news.",
    keywords: ["nasa", "space", "rocket", "spacex", "satellite", "moon", "mars", "launch"],
    sources: [
      {
        id: "nasa-news",
        label: "NASA News",
        provider: "NASA",
        href: "https://www.nasa.gov/news/all-nasa-news/",
        searchBase: "https://www.google.com/search?q=site:nasa.gov+",
      },
      {
        id: "space-com-news",
        label: "Space.com",
        provider: "Space.com",
        href: "https://www.space.com/news",
        searchBase: "https://www.google.com/search?q=site:space.com+",
      },
      {
        id: "esa-news",
        label: "ESA News",
        provider: "ESA",
        href: "https://www.esa.int/Newsroom",
        searchBase: "https://www.google.com/search?q=site:esa.int+",
      },
    ],
  },
  {
    id: "startups-industry",
    label: "Startups / Industry",
    description: "Funding, products, launches, and strategic tech shifts.",
    keywords: ["startup", "founder", "funding", "acquisition", "launch", "product", "industry"],
    sources: [
      {
        id: "techcrunch",
        label: "TechCrunch",
        provider: "TechCrunch",
        href: "https://techcrunch.com/",
        searchBase: "https://www.google.com/search?q=site:techcrunch.com+",
      },
      {
        id: "the-verge-tech",
        label: "The Verge Tech",
        provider: "The Verge",
        href: "https://www.theverge.com/tech",
        searchBase: "https://www.google.com/search?q=site:theverge.com+tech+",
      },
      {
        id: "product-hunt-news",
        label: "Product Hunt",
        provider: "Product Hunt",
        href: "https://www.producthunt.com/",
        searchBase: "https://www.google.com/search?q=site:producthunt.com+",
      },
    ],
  },
]

export const opportunityPlatforms: TechOpportunityLink[] = [
  {
    id: "github",
    label: "GitHub",
    description: "Build in public, contribute, and ship projects.",
    href: "https://github.com/explore",
  },
  {
    id: "devpost",
    label: "Devpost",
    description: "Join hackathons and build challenge projects.",
    href: "https://devpost.com/hackathons",
  },
  {
    id: "kaggle",
    label: "Kaggle",
    description: "Practice data and ML with competitions and datasets.",
    href: "https://www.kaggle.com/competitions",
  },
  {
    id: "product-hunt",
    label: "Product Hunt",
    description: "Track launches and share what you are building.",
    href: "https://www.producthunt.com/",
  },
  {
    id: "hacker-news",
    label: "Hacker News",
    description: "Follow engineering discussion and startup signals.",
    href: "https://news.ycombinator.com/",
  },
  {
    id: "mdn-docs",
    label: "MDN Docs",
    description: "Reference core web platform docs and APIs.",
    href: "https://developer.mozilla.org/",
  },
]
