"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { signIn, signOut as nextAuthSignOut, useSession } from "next-auth/react"

export type AuthUser = {
  id: string
  email: string
  name: string
  createdAt: string
  image?: string | null
  provider?: "local" | "google"
}

type AuthResult = { ok: true } | { ok: false; error: string }

type SignupResult = { ok: true; recoveryCodes: string[] } | { ok: false; error: string }

type ResetPasswordResult =
  | { ok: true; recoveryCodes: string[] }
  | { ok: false; error: string }

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  signup: (input: { email: string; password: string; name: string }) => Promise<SignupResult>
  login: (input: { email: string; password: string }) => Promise<AuthResult>
  logout: () => void
  initiatePasswordReset: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>
  resetPassword: (input: { email: string; recoveryCode: string; newPassword: string }) => Promise<ResetPasswordResult>
  generateNewRecoveryCodes: (email: string, password: string) => Promise<{ ok: true; recoveryCodes: string[] } | { ok: false; error: string }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function normalizeError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isBusy, setIsBusy] = useState(false)

  const user = useMemo<AuthUser | null>(() => {
    const sessionUser = session?.user
    if (!sessionUser?.id || !sessionUser.email) return null
    return {
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name || sessionUser.email,
      image: sessionUser.image,
      provider: "google",
      createdAt: new Date(0).toISOString(),
    }
  }, [session?.user])

  const isLoading = status === "loading" || isBusy

  const signup: AuthContextValue["signup"] = async ({ email, password, name }) => {
    if (isBusy) return { ok: false, error: "Please wait..." }
    setIsBusy(true)
    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const registerData = (await registerRes.json().catch(() => null)) as
        | { ok?: boolean; recoveryCodes?: string[]; error?: string }
        | null

      const registerErrorByStatus: Record<number, string> = {
        400: "Please check your signup details and try again.",
        409: "An account with that email already exists.",
        503: "Database connection failed. Please try again in a moment.",
      }

      if (!registerRes.ok || !registerData?.ok || !Array.isArray(registerData.recoveryCodes)) {
        const fallbackError = registerErrorByStatus[registerRes.status] || "Unable to create account."
        return { ok: false, error: registerData?.error || fallbackError }
      }

      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (loginRes?.error) {
        return { ok: false, error: "Account created, but automatic sign in failed. Please sign in manually." }
      }

      return { ok: true, recoveryCodes: registerData.recoveryCodes }
    } catch (error) {
      return { ok: false, error: normalizeError(error, "Unable to create account.") }
    } finally {
      setIsBusy(false)
    }
  }

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    if (isBusy) return { ok: false, error: "Please wait..." }
    setIsBusy(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (!result || result.error) {
        return { ok: false, error: "Invalid email or password." }
      }

      return { ok: true }
    } catch (error) {
      return { ok: false, error: normalizeError(error, "Unable to sign in.") }
    } finally {
      setIsBusy(false)
    }
  }

  const initiatePasswordReset: AuthContextValue["initiatePasswordReset"] = async (email) => {
    if (isBusy) return { ok: false, error: "Please wait..." }
    setIsBusy(true)
    try {
      const res = await fetch("/api/auth/password-reset/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (!res.ok || !data?.ok) {
        return { ok: false, error: data?.error || "Unable to initiate password reset." }
      }

      return { ok: true }
    } catch (error) {
      return { ok: false, error: normalizeError(error, "Unable to initiate password reset.") }
    } finally {
      setIsBusy(false)
    }
  }

  const resetPassword: AuthContextValue["resetPassword"] = async ({ email, recoveryCode, newPassword }) => {
    if (isBusy) return { ok: false, error: "Please wait..." }
    setIsBusy(true)
    try {
      const res = await fetch("/api/auth/password-reset/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, recoveryCode, newPassword }),
      })

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; recoveryCodes?: string[]; error?: string }
        | null

      if (!res.ok || !data?.ok || !Array.isArray(data.recoveryCodes)) {
        return { ok: false, error: data?.error || "Unable to reset password." }
      }

      return { ok: true, recoveryCodes: data.recoveryCodes }
    } catch (error) {
      return { ok: false, error: normalizeError(error, "Unable to reset password.") }
    } finally {
      setIsBusy(false)
    }
  }

  const generateNewRecoveryCodes: AuthContextValue["generateNewRecoveryCodes"] = async (email, password) => {
    if (isBusy) return { ok: false, error: "Please wait..." }
    setIsBusy(true)
    try {
      const res = await fetch("/api/auth/recovery-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; recoveryCodes?: string[]; error?: string }
        | null

      if (!res.ok || !data?.ok || !Array.isArray(data.recoveryCodes)) {
        return { ok: false, error: data?.error || "Unable to generate new recovery codes." }
      }

      return { ok: true, recoveryCodes: data.recoveryCodes }
    } catch (error) {
      return { ok: false, error: normalizeError(error, "Unable to generate new recovery codes.") }
    } finally {
      setIsBusy(false)
    }
  }

  const logout = () => {
    void nextAuthSignOut({ callbackUrl: "/login" })
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
