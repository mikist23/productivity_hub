"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Lock, Mail, User, Sparkles, Target, Clock, Zap, CheckCircle2, Copy, Check } from "lucide-react"
import { signIn } from "next-auth/react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AppLogo } from "@/components/common/AppLogo"

function sanitizeNextPath(nextPath: string | undefined) {
  if (!nextPath) return null
  if (!nextPath.startsWith("/")) return null
  if (nextPath.startsWith("//")) return null
  return nextPath
}

const features = [
  { icon: Target, text: "Track goals & milestones" },
  { icon: Clock, text: "Log focus time" },
  { icon: Zap, text: "Build productive habits" },
  { icon: CheckCircle2, text: "Sync your progress across sessions" },
]

export function SignupClient({ nextPath }: { nextPath?: string }) {
  const router = useRouter()
  const { user, signup, isLoading } = useAuth()

  const safeNext = useMemo(() => sanitizeNextPath(nextPath) ?? "/dashboard", [nextPath])

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<"form" | "recovery">("form")
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [copiedAll, setCopiedAll] = useState(false)

  useEffect(() => {
    if (user && step === "form") router.replace(safeNext)
  }, [router, safeNext, user, step])

  const loginHref = useMemo(() => {
    if (!safeNext || safeNext === "/dashboard") return "/login"
    return `/login?next=${encodeURIComponent(safeNext)}`
  }, [safeNext])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await signup({ name, email, password })
      if (!res.ok) {
        setError(res.error)
        return
      }
      // Show recovery codes
      setRecoveryCodes(res.recoveryCodes)
      setStep("recovery")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: safeNext })
  }

  const copyAllCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <AppLogo size="lg" priority />
              <span className="text-3xl font-bold text-white">Productivity Hub</span>
            </div>
            
            {/* Tagline */}
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Start Your Journey to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400"> Better Productivity</span>
            </h1>
            
            <p className="text-lg text-slate-400 mb-10 max-w-lg">
              Create your workspace to plan goals, track focus, and execute consistently each day.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 text-slate-300"
                >
                  <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Badge */}
        <div className="absolute bottom-8 left-16 xl:left-24 flex items-center gap-2 text-sm text-slate-500">
          <Sparkles className="h-4 w-4" />
          <span>Focused workflows | Practical execution | Private account</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <AppLogo size="md" priority />
            <span className="text-2xl font-bold">Productivity Hub</span>
          </div>

          <Card className="border-border/50 shadow-2xl shadow-black/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              {step === "form" ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Create your account</h2>
                    <p className="text-muted-foreground">
                      Start tracking your goals today
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Google Sign Up */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="w-full h-12 mb-4 relative bg-background hover:bg-accent"
                  >
                    <svg className="absolute left-4 h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-4 text-muted-foreground">or sign up with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="pl-11 h-12 bg-background"
                          autoComplete="name"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="pl-11 h-12 bg-background"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a strong password"
                          className="pl-11 h-12 bg-background"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-medium" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating account..." : "Create account"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </form>

                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href={loginHref} className="text-primary font-medium hover:underline">
                      Sign in
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Account created!</h2>
                    <p className="text-muted-foreground">
                      Save these recovery codes in a safe place
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-slate-400">Recovery codes</p>
                        <button
                          onClick={copyAllCodes}
                          className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
                        >
                          {copiedAll ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy all
                            </>
                          )}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recoveryCodes.map((code, index) => (
                          <div 
                            key={index}
                            className="font-mono text-lg tracking-widest text-white text-center py-2 bg-slate-800 rounded"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        <strong>Important:</strong> These codes are your only way to recover your account if you forget your password. 
                        Each code can only be used once. Save them somewhere safe!
                      </p>
                    </div>

                    <Link href={loginHref}>
                      <Button className="w-full h-12">
                        Continue to login
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {step === "form" && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}


