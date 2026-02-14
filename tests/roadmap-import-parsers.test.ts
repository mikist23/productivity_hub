import { describe, expect, it } from "vitest"
import { detectRoadmapSource, parseRoadmapSh, parseW3Schools } from "../lib/roadmap-import/parsers"

describe("roadmap import parsers", () => {
  it("detects supported source hosts", () => {
    expect(detectRoadmapSource(new URL("https://w3schools.io/dart-hello-world/"))).toBe("w3schools")
    expect(detectRoadmapSource(new URL("https://roadmap.sh/backend"))).toBe("roadmapsh")
    expect(detectRoadmapSource(new URL("https://example.com/course"))).toBeNull()
  })

  it("parses W3Schools sidebar-like links", () => {
    const html = `
      <html>
        <head><title>Dart Tutorials</title></head>
        <body>
          <a href="/dart-tutorials/">Dart - Tutorials</a>
          <a href="/dart-hello-world/">Dart - Hello World</a>
          <a href="/dart-variables/">Dart - Variables</a>
        </body>
      </html>
    `

    const result = parseW3Schools(html, "https://w3schools.io/dart-tutorials/")

    expect(result.source).toBe("w3schools")
    expect(result.steps.map((step) => step.title)).toEqual([
      "Dart - Tutorials",
      "Dart - Hello World",
      "Dart - Variables",
    ])
  })

  it("parses roadmap.sh headings and list items", () => {
    const html = `
      <html>
        <head><title>Backend Developer Roadmap</title></head>
        <body>
          <h1>Backend Developer</h1>
          <h2>Internet</h2>
          <ul>
            <li>HTTP Basics</li>
            <li>REST APIs</li>
            <li>Databases</li>
          </ul>
        </body>
      </html>
    `

    const result = parseRoadmapSh(html, "https://roadmap.sh/backend")

    expect(result.source).toBe("roadmapsh")
    expect(result.steps.length).toBeGreaterThanOrEqual(4)
    expect(result.steps.some((step) => step.title === "REST APIs")).toBe(true)
  })
})
