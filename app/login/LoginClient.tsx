"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Lock, Mail } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function sanitizeNextPath(nextPath: string | undefined) {
  if (!nextPath) return null
  if (!nextPath.startsWith("/")) return null
  if (nextPath.startsWith("//")) return null
  return nextPath
}

export function LoginClient({
  nextPath,
  initialEmail,
}: {
  nextPath?: string
  initialEmail?: string
}) {
  const router = useRouter()
  const { user, login } = useAuth()

  const safeNext = useMemo(() => sanitizeNextPath(nextPath) ?? "/dashboard", [nextPath])

  const [email, setEmail] = useState((initialEmail ?? "").trim().toLowerCase())
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [didSucceed, setDidSucceed] = useState(false)

  useEffect(() => {
    if (!initialEmail) return
    setEmail((prev) => (prev.trim().length > 0 ? prev : initialEmail.trim().toLowerCase()))
  }, [initialEmail])

  useEffect(() => {
    if (user) router.replace(safeNext)
  }, [router, safeNext, user])

  const signupHref = useMemo(() => {
    if (!safeNext || safeNext === "/dashboard") return "/signup"
    return `/signup?next=${encodeURIComponent(safeNext)}`
  }, [safeNext])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDidSucceed(false)
    setIsSubmitting(true)
    try {
      const res = await login({ email, password })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setDidSucceed(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              M
            </div>
            <span>MapMonet</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Log in to your local account.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-9"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="pl-9"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || didSucceed}>
                {didSucceed ? "Redirecting..." : isSubmitting ? "Logging in..." : "Log in"}{" "}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="text-xs text-muted-foreground">
              New here?{" "}
              <Link href={signupHref} className="text-foreground underline underline-offset-4">
                Create an account
              </Link>
              .
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          No subscriptions. Data is stored locally in your browser.
        </div>
      </motion.div>
    </div>
  )
}
