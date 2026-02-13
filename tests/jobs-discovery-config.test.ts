import { describe, expect, it } from "vitest"
import { buildJobSearchUrl, jobSourceProviders } from "../lib/jobs/discovery-config"

describe("jobs discovery url builder", () => {
  it("builds remote global search links", () => {
    const provider = jobSourceProviders.find((p) => p.id === "linkedin")
    expect(provider).toBeTruthy()

    const url = buildJobSearchUrl(provider!, {
      query: "frontend engineer",
      category: "Software Engineering",
      workMode: "remote",
      employmentType: "full-time",
    })

    expect(url).toContain("linkedin.com/jobs/search")
    expect(url).toContain("Software%20Engineering")
    expect(url).toContain("frontend%20engineer")
    expect(url).toContain("location=Worldwide")
  })

  it("builds location-specific links", () => {
    const provider = jobSourceProviders.find((p) => p.id === "indeed")
    expect(provider).toBeTruthy()

    const url = buildJobSearchUrl(provider!, {
      category: "AI Jobs",
      location: "San Francisco, CA",
      workMode: "hybrid",
    })

    expect(url).toContain("indeed.com/jobs")
    expect(url).toContain("AI%20Jobs")
    expect(url).toContain("hybrid")
    expect(url).toContain("l=San%20Francisco%2C%20CA")
  })

  it("includes category and query together for source providers", () => {
    const provider = jobSourceProviders.find((p) => p.id === "wellfound")
    expect(provider).toBeTruthy()

    const url = buildJobSearchUrl(provider!, {
      category: "Data Jobs",
      query: "python sql",
      employmentType: "contract",
      location: "Remote",
    })

    expect(url).toContain("wellfound.com/jobs")
    expect(url).toContain("Data%20Jobs")
    expect(url).toContain("python%20sql")
    expect(url).toContain("contract")
  })
})
