import type { RoadmapImportSource } from "@/lib/roadmap-import/parsers"

type KeywordSource = Exclude<RoadmapImportSource, "">

export type RoadmapSkillCatalogItem = {
  slug: string
  label: string
  aliases: string[]
  sourceSlugs?: Partial<Record<KeywordSource, string>>
}

export const roadmapSkillCatalog: RoadmapSkillCatalogItem[] = [
  { slug: "python", label: "Python", aliases: ["python", "py"] },
  {
    slug: "kotlin",
    label: "Kotlin",
    aliases: ["kotlin", "coddling"],
  },
  { slug: "swift", label: "Swift", aliases: ["swift"] },
  { slug: "flutter", label: "Flutter", aliases: ["flutter"] },
  { slug: "git", label: "Git", aliases: ["git"], sourceSlugs: { roadmapsh: "git-github" } },
  { slug: "javascript", label: "JavaScript", aliases: ["javascript", "js"] },
  { slug: "typescript", label: "TypeScript", aliases: ["typescript", "ts"] },
  { slug: "java", label: "Java", aliases: ["java"] },
  { slug: "cs", label: "C#", aliases: ["c#", "csharp", "dotnet"], sourceSlugs: { roadmapsh: "aspnet-core" } },
  { slug: "go", label: "Go", aliases: ["go", "golang"] },
  { slug: "rust", label: "Rust", aliases: ["rust"] },
  { slug: "php", label: "PHP", aliases: ["php"] },
  { slug: "ruby", label: "Ruby", aliases: ["ruby"] },
  { slug: "react", label: "React", aliases: ["react"] },
  { slug: "nodejs", label: "Node.js", aliases: ["node", "nodejs", "node.js"], sourceSlugs: { roadmapsh: "nodejs" } },
  { slug: "docker", label: "Docker", aliases: ["docker"] },
  { slug: "kubernetes", label: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { slug: "aws", label: "AWS", aliases: ["aws"] },
  { slug: "sql", label: "SQL", aliases: ["sql", "postgres", "mysql"], sourceSlugs: { roadmapsh: "sql" } },
]

const intentWords = new Set([
  "master",
  "learn",
  "learning",
  "become",
  "study",
  "start",
  "intro",
  "introduction",
  "to",
  "want",
  "i",
  "im",
  "i'm",
  "the",
  "a",
  "an",
])

function normalizeInput(value: string) {
  return value
    .toLowerCase()
    .replace(/[_/\\.-]+/g, " ")
    .replace(/[^a-z0-9+#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function tokenize(value: string) {
  return normalizeInput(value)
    .split(" ")
    .filter(Boolean)
    .filter((token) => !intentWords.has(token))
}

export function resolveSkillSlugFromGoalTitle(title: string): { slug: string | null; matchedFrom: string | null } {
  const normalized = normalizeInput(title)
  if (!normalized) return { slug: null, matchedFrom: null }

  const aliases = roadmapSkillCatalog.flatMap((item) =>
    item.aliases.map((alias) => ({ alias: normalizeInput(alias), slug: item.slug }))
  )
  aliases.sort((a, b) => b.alias.length - a.alias.length)

  for (const { alias, slug } of aliases) {
    if (!alias) continue
    const pattern = new RegExp(`(^|\\s)${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`, "i")
    if (pattern.test(normalized)) {
      return { slug, matchedFrom: alias }
    }
  }

  return { slug: null, matchedFrom: null }
}

export function extractSkillKeyword(input: string): string | null {
  return resolveSkillSlugFromGoalTitle(input).slug
}

export function suggestRoadmapSkills(input: string, limit = 10): RoadmapSkillCatalogItem[] {
  const tokens = tokenize(input)
  if (tokens.length === 0) {
    return roadmapSkillCatalog.slice(0, limit)
  }

  const scored = roadmapSkillCatalog
    .map((item) => {
      const aliasSet = item.aliases.map((alias) => normalizeInput(alias))
      const score = tokens.reduce((acc, token) => {
        const exact = aliasSet.some((alias) => alias === token)
        if (exact) return acc + 3
        const partial = aliasSet.some((alias) => alias.includes(token) || token.includes(alias))
        if (partial) return acc + 1
        return acc
      }, 0)
      return { item, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item)

  if (scored.length === 0) {
    return roadmapSkillCatalog.slice(0, limit)
  }

  return scored.slice(0, limit)
}

export function buildRoadmapSourceUrl(
  source: "w3schools" | "roadmapsh" | "freecodecamp",
  skillSlug: string
): string | null {
  const normalizedSlug = normalizeInput(skillSlug).replace(/\s+/g, "-")
  if (!normalizedSlug) return null

  const catalogItem = roadmapSkillCatalog.find((item) => item.slug === normalizedSlug)
  const finalSlug = catalogItem?.sourceSlugs?.[source] ?? catalogItem?.slug ?? normalizedSlug

  if (!finalSlug) return null

  if (source === "w3schools") {
    return `https://www.w3schools.com/${finalSlug}/`
  }
  if (source === "roadmapsh") {
    return `https://roadmap.sh/${finalSlug}`
  }
  return `https://www.freecodecamp.org/news/tag/${finalSlug}/`
}
