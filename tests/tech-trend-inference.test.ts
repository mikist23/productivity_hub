import { describe, expect, it } from "vitest"
import { computeTrendLabel } from "../lib/tech/discovery-config"

describe("tech trend inference", () => {
  it("returns In Demand for high mentions", () => {
    expect(computeTrendLabel(8, 0)).toBe("In Demand")
    expect(computeTrendLabel(4, 3)).toBe("In Demand")
  })

  it("returns Growing for moderate mentions", () => {
    expect(computeTrendLabel(3, 0)).toBe("Growing")
  })

  it("returns Emerging for lower mentions with recency", () => {
    expect(computeTrendLabel(1, 1)).toBe("Emerging")
  })

  it("returns Cooling when no signal", () => {
    expect(computeTrendLabel(0, 0)).toBe("Cooling")
  })
})

