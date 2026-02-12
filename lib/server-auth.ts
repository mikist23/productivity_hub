import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scrypt = promisify(scryptCallback)

export type RecoveryCodeRecord = {
  codeHash: string
  used: boolean
  createdAt: string
}

function makeId() {
  try {
    return randomUUID()
  } catch {
    return randomBytes(16).toString("hex")
  }
}

export function makeUserId() {
  return makeId()
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function randomSalt(bytes = 16) {
  return randomBytes(bytes).toString("hex")
}

export async function hashSecret(secret: string, salt: string) {
  const key = (await scrypt(secret, salt, 64)) as Buffer
  return key.toString("hex")
}

export async function hashPassword(password: string, salt: string) {
  return hashSecret(password, salt)
}

export async function verifyPassword(inputPassword: string, salt: string, expectedHash: string) {
  const actual = await hashPassword(inputPassword, salt)
  const actualBuf = Buffer.from(actual, "hex")
  const expectedBuf = Buffer.from(expectedHash, "hex")
  if (actualBuf.length !== expectedBuf.length) return false
  return timingSafeEqual(actualBuf, expectedBuf)
}

export function generateRecoveryCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(8)
  let code = ""
  for (let i = 0; i < bytes.length; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return code
}

export async function buildRecoveryCodeRecords(count = 5) {
  const plainCodes: string[] = []
  const records: RecoveryCodeRecord[] = []

  for (let i = 0; i < count; i++) {
    const code = generateRecoveryCode()
    const salt = randomSalt(16)
    const codeHash = await hashSecret(code, salt)
    plainCodes.push(code)
    records.push({
      codeHash: `${salt}:${codeHash}`,
      used: false,
      createdAt: new Date().toISOString(),
    })
  }

  return { plainCodes, records }
}

export async function matchesRecoveryCode(inputCode: string, codeHash: string) {
  const [salt, expectedHash] = codeHash.split(":")
  if (!salt || !expectedHash) return false
  const actualHash = await hashSecret(inputCode.trim().toUpperCase(), salt)
  const actualBuf = Buffer.from(actualHash, "hex")
  const expectedBuf = Buffer.from(expectedHash, "hex")
  if (actualBuf.length !== expectedBuf.length) return false
  return timingSafeEqual(actualBuf, expectedBuf)
}
