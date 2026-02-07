"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Lock, Mail, User } from "lucide-react"
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

export function SignupClient({ nextPath }: { nextPath?: string }) {
  const router = useRouter()
  const { user, signup } = useAuth()

  const safeNext = useMemo(() => sanitizeNextPath(nextPath) ?? "/dashboard", [nextPath])

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [didSucceed, setDidSucceed] = useState(false)

  useEffect(() => {
    if (user) router.replace(safeNext)
  }, [router, safeNext, user])

  const loginHref = useMemo(() => {
    if (!safeNext || safeNext === "/dashboard") return "/login"
    return `/login?next=${encodeURIComponent(safeNext)}`
  }, [safeNext])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDidSucceed(false)
    setIsSubmitting(true)
    try {
      const res = await signup({ name, email, password })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setDidSucceed(true)
      const nextLogin = `${loginHref}${loginHref.includes("?") ? "&" : "?"}email=${encodeURIComponent(
        email.trim().toLowerCase()
      )}`
      router.replace(nextLogin)
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
          <p className="text-sm text-muted-foreground mt-2">Create a free local account.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Get started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="pl-9"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

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
                    placeholder="At least 6 characters"
                    className="pl-9"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || didSucceed}>
                {didSucceed ? "Redirecting..." : isSubmitting ? "Creating..." : "Create account"}{" "}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href={loginHref} className="text-foreground underline underline-offset-4">
                Log in
              </Link>
              .
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          This is a local-first account (per device). Use Settings backups to move data.
        </div>
      </motion.div>
    </div>
  )
}
