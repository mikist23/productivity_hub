import { describe, expect, it } from "vitest"
import {
  buildRecoveryCodeRecords,
  generateRecoveryCode,
  hashPassword,
  matchesRecoveryCode,
  randomSalt,
  verifyPassword,
} from "../lib/server-auth"

describe("server auth utilities", () => {
  it("hashes and verifies passwords", async () => {
    const salt = randomSalt()
    const hash = await hashPassword("my-secure-pass", salt)

    await expect(verifyPassword("my-secure-pass", salt, hash)).resolves.toBe(true)
    await expect(verifyPassword("wrong-pass", salt, hash)).resolves.toBe(false)
  })

  it("generates uppercase recovery codes", () => {
    const code = generateRecoveryCode()
    expect(code).toMatch(/^[A-Z2-9]{8}$/)
  })

  it("matches recovery code records", async () => {
    const { plainCodes, records } = await buildRecoveryCodeRecords(1)
    expect(plainCodes).toHaveLength(1)
    expect(records).toHaveLength(1)

    await expect(matchesRecoveryCode(plainCodes[0], records[0].codeHash)).resolves.toBe(true)
    await expect(matchesRecoveryCode("ABCDEFGH", records[0].codeHash)).resolves.toBe(false)
  })
})
