"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { useLocalStorageJsonState, useLocalStorageStringState } from "@/lib/storage"
import { LEGACY_DASHBOARD_KEYS, MM_AUTH_SESSION_KEY, MM_AUTH_USERS_KEY, mmUserKey } from "@/lib/mm-keys"

export type AuthUser = {
  id: string
  email: string
  name: string
  createdAt: string
}

type StoredUser = AuthUser & {
  passwordHash: string
  salt: string
}

type AuthResult = { ok: true } | { ok: false; error: string }

type AuthContextValue = {
  user: AuthUser | null
  signup: (input: { email: string; password: string; name: string }) => Promise<AuthResult>
  login: (input: { email: string; password: string }) => Promise<AuthResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2, 11)
}

function randomSalt(bytes = 16) {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const arr = new Uint8Array(bytes)
    crypto.getRandomValues(arr)
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }
  return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2)
}

async function sha256Hex(input: string) {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(input)
    const hash = await crypto.subtle.digest("SHA-256", data)
    const bytes = Array.from(new Uint8Array(hash))
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Fallback (non-cryptographic): keep it deterministic to avoid breaking logins.
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return `fnv-${(h >>> 0).toString(16)}`
}

async function hashPassword(password: string, salt: string) {
  return sha256Hex(`${salt}:${password}`)
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function safeLocalStorageGet(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeLocalStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

function migrateLegacyDashboardData(userId: string) {
  for (const legacyKey of Object.values(LEGACY_DASHBOARD_KEYS)) {
    const legacyVal = safeLocalStorageGet(legacyKey)
    if (legacyVal == null) continue

    const scopedKey = mmUserKey(userId, legacyKey)
    const existingScoped = safeLocalStorageGet(scopedKey)
    if (existingScoped != null) continue

    safeLocalStorageSet(scopedKey, legacyVal)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useLocalStorageJsonState<StoredUser[]>(MM_AUTH_USERS_KEY, [])
  const [sessionUserId, setSessionUserId, clearSessionUserId] = useLocalStorageStringState(
    MM_AUTH_SESSION_KEY,
    ""
  )

  const user: AuthUser | null = useMemo(() => {
    const found = users.find((u) => u.id === sessionUserId)
    if (!found) return null
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, salt, ...publicUser } = found
    return publicUser
  }, [sessionUserId, users])

  const [isBusy, setIsBusy] = useState(false)

  const signup: AuthContextValue["signup"] = async ({ email, password, name }) => {
    if (isBusy) return { ok: false, error: "Please wait…" }
    setIsBusy(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const normalizedName = name.trim()
      if (!isValidEmail(normalizedEmail)) return { ok: false, error: "Enter a valid email." }
      if (normalizedName.length < 2) return { ok: false, error: "Enter your name." }
      if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." }

      const exists = users.some((u) => u.email === normalizedEmail)
      if (exists) return { ok: false, error: "An account with that email already exists." }

      const salt = randomSalt()
      const passwordHash = await hashPassword(password, salt)

      const newUser: StoredUser = {
        id: makeId(),
        email: normalizedEmail,
        name: normalizedName,
        createdAt: new Date().toISOString(),
        salt,
        passwordHash,
      }

      setUsers((prev) => [newUser, ...prev])
      migrateLegacyDashboardData(newUser.id)

      return { ok: true }
    } finally {
      setIsBusy(false)
    }
  }

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    if (isBusy) return { ok: false, error: "Please wait…" }
    setIsBusy(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      if (!isValidEmail(normalizedEmail)) return { ok: false, error: "Enter a valid email." }
      const found = users.find((u) => u.email === normalizedEmail)
      if (!found) return { ok: false, error: "No account found for that email." }

      const passwordHash = await hashPassword(password, found.salt)
      if (passwordHash !== found.passwordHash) return { ok: false, error: "Incorrect password." }

      setSessionUserId(found.id)
      migrateLegacyDashboardData(found.id)
      return { ok: true }
    } finally {
      setIsBusy(false)
    }
  }

  const logout = () => {
    clearSessionUserId()
  }

  const value: AuthContextValue = {
    user,
    signup,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
