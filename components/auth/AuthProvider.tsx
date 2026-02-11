"use client"

import { createContext, useContext, useMemo, useState, useEffect } from "react"
import { useSession, signOut as nextAuthSignOut } from "next-auth/react"
import { useLocalStorageJsonState, useLocalStorageStringState } from "@/lib/storage"
import { LEGACY_DASHBOARD_KEYS, MM_AUTH_SESSION_KEY, MM_AUTH_USERS_KEY, mmUserKey } from "@/lib/mm-keys"

export type AuthUser = {
  id: string
  email: string
  name: string
  createdAt: string
  image?: string | null
  provider?: "local" | "google" | "microsoft"
}

type RecoveryCode = {
  code: string
  used: boolean
  createdAt: string
}

type StoredUser = AuthUser & {
  passwordHash: string
  salt: string
  recoveryCodes?: RecoveryCode[]
}

type AuthResult = { ok: true } | { ok: false; error: string }

type SignupResult = { ok: true; recoveryCodes: string[] } | { ok: false; error: string }

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  signup: (input: { email: string; password: string; name: string }) => Promise<SignupResult>
  login: (input: { email: string; password: string }) => Promise<AuthResult>
  logout: () => void
  initiatePasswordReset: (email: string) => Promise<{ ok: true; recoveryCode: string } | { ok: false; error: string }>
  resetPassword: (input: { email: string; recoveryCode: string; newPassword: string }) => Promise<AuthResult>
  generateNewRecoveryCodes: (email: string, password: string) => Promise<{ ok: true; recoveryCodes: string[] } | { ok: false; error: string }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2, 11)
}

function generateRecoveryCode(): string {
  // Generate a 8-character alphanumeric code
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed confusing characters
  let code = ""
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const arr = new Uint8Array(8)
    crypto.getRandomValues(arr)
    for (let i = 0; i < 8; i++) {
      code += chars[arr[i] % chars.length]
    }
  } else {
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
  }
  return code
}

function generateRecoveryCodes(count = 5): string[] {
  return Array.from({ length: count }, () => generateRecoveryCode())
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
  const { data: session, status } = useSession()
  const [users, setUsers] = useLocalStorageJsonState<StoredUser[]>(MM_AUTH_USERS_KEY, [])
  const [sessionUserId, setSessionUserId, clearSessionUserId] = useLocalStorageStringState(
    MM_AUTH_SESSION_KEY,
    ""
  )

  // Check if user is authenticated via NextAuth (Google, etc.)
  const nextAuthUser = useMemo(() => {
    if (status === "authenticated" && session?.user) {
      return {
        id: session.user.id || makeId(),
        email: session.user.email || "",
        name: session.user.name || "",
        image: session.user.image,
        createdAt: new Date().toISOString(),
        provider: "google" as const,
      }
    }
    return null
  }, [session, status])

  // Check if user is authenticated via local auth
  const localUser: AuthUser | null = useMemo(() => {
    const found = users.find((u) => u.id === sessionUserId)
    if (!found) return null
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, salt, recoveryCodes, ...publicUser } = found
    return { ...publicUser, provider: "local" as const }
  }, [sessionUserId, users])

  // Combine both auth methods - NextAuth takes precedence
  const user = nextAuthUser || localUser
  const isLoading = status === "loading"

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
      const recoveryCodes = generateRecoveryCodes(5).map(code => ({
        code,
        used: false,
        createdAt: new Date().toISOString()
      }))

      const newUser: StoredUser = {
        id: makeId(),
        email: normalizedEmail,
        name: normalizedName,
        createdAt: new Date().toISOString(),
        salt,
        passwordHash,
        recoveryCodes,
      }

      setUsers((prev) => [newUser, ...prev])
      migrateLegacyDashboardData(newUser.id)

      return { ok: true, recoveryCodes: recoveryCodes.map(r => r.code) }
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

  const initiatePasswordReset: AuthContextValue["initiatePasswordReset"] = async (email) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!isValidEmail(normalizedEmail)) return { ok: false, error: "Enter a valid email." }
    
    const found = users.find((u) => u.email === normalizedEmail)
    if (!found) return { ok: false, error: "No account found for that email." }

    // Find an unused recovery code
    const unusedCode = found.recoveryCodes?.find(r => !r.used)
    if (!unusedCode) {
      return { ok: false, error: "No recovery codes available. Please contact support." }
    }

    return { ok: true, recoveryCode: unusedCode.code }
  }

  const resetPassword: AuthContextValue["resetPassword"] = async ({ email, recoveryCode, newPassword }) => {
    if (isBusy) return { ok: false, error: "Please wait…" }
    setIsBusy(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      if (!isValidEmail(normalizedEmail)) return { ok: false, error: "Enter a valid email." }
      if (newPassword.length < 6) return { ok: false, error: "Password must be at least 6 characters." }

      const userIndex = users.findIndex((u) => u.email === normalizedEmail)
      if (userIndex === -1) return { ok: false, error: "No account found for that email." }

      const user = users[userIndex]
      
      // Find and validate recovery code
      const codeIndex = user.recoveryCodes?.findIndex(r => r.code === recoveryCode && !r.used)
      if (codeIndex === -1 || codeIndex === undefined) {
        return { ok: false, error: "Invalid or already used recovery code." }
      }

      // Generate new password hash
      const newSalt = randomSalt()
      const newPasswordHash = await hashPassword(newPassword, newSalt)

      // Update user with new password and mark code as used
      const updatedUser: StoredUser = {
        ...user,
        salt: newSalt,
        passwordHash: newPasswordHash,
        recoveryCodes: user.recoveryCodes?.map((r, idx) => 
          idx === codeIndex ? { ...r, used: true } : r
        )
      }

      setUsers(prev => {
        const newUsers = [...prev]
        newUsers[userIndex] = updatedUser
        return newUsers
      })

      return { ok: true }
    } finally {
      setIsBusy(false)
    }
  }

  const generateNewRecoveryCodes: AuthContextValue["generateNewRecoveryCodes"] = async (email, password) => {
    if (isBusy) return { ok: false, error: "Please wait…" }
    setIsBusy(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const userIndex = users.findIndex((u) => u.email === normalizedEmail)
      if (userIndex === -1) return { ok: false, error: "No account found for that email." }

      const user = users[userIndex]
      const passwordHash = await hashPassword(password, user.salt)
      if (passwordHash !== user.passwordHash) return { ok: false, error: "Incorrect password." }

      const newRecoveryCodes = generateRecoveryCodes(5).map(code => ({
        code,
        used: false,
        createdAt: new Date().toISOString()
      }))

      const updatedUser: StoredUser = {
        ...user,
        recoveryCodes: newRecoveryCodes
      }

      setUsers(prev => {
        const newUsers = [...prev]
        newUsers[userIndex] = updatedUser
        return newUsers
      })

      return { ok: true, recoveryCodes: newRecoveryCodes.map(r => r.code) }
    } finally {
      setIsBusy(false)
    }
  }

  const logout = () => {
    // Sign out from both local and NextAuth
    clearSessionUserId()
    if (status === "authenticated") {
      nextAuthSignOut({ callbackUrl: "/login" })
    }
  }

  const value: AuthContextValue = {
    user,
    isLoading,
    signup,
    login,
    logout,
    initiatePasswordReset,
    resetPassword,
    generateNewRecoveryCodes,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
