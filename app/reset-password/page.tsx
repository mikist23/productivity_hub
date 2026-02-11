"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword } = useAuth()
  
  const [email, setEmail] = useState("")
  const [recoveryCode, setRecoveryCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState<"form" | "success">("form")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[]>([])

  useEffect(() => {
    const emailParam = searchParams.get("email")
    const codeParam = searchParams.get("code")
    
    if (emailParam) setEmail(emailParam)
    if (codeParam) setRecoveryCode(codeParam)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const result = await resetPassword({
        email,
        recoveryCode,
        newPassword
      })

      if (result.ok) {
        // Generate new recovery codes for display
        const codes = Array.from({ length: 5 }, () => {
          const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
          let code = ""
          for (let i = 0; i < 8; i++) {
            code += chars[Math.floor(Math.random() * chars.length)]
          }
          return code
        })
        setNewRecoveryCodes(codes)
        setStep("success")
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyCodes = () => {
    navigator.clipboard.writeText(newRecoveryCodes.join("\n"))
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to login */}
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/50 shadow-2xl shadow-black/20">
            <CardContent className="p-8">
              {step === "form" && (
                <>
                  <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-8 w-8 text-violet-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Create new password</h1>
                    <p className="text-muted-foreground">
                      Enter your new password below
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-start gap-3"
                    >
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        className="h-12 bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recoveryCode" className="text-sm font-medium">Recovery Code</Label>
                      <Input
                        id="recoveryCode"
                        type="text"
                        value={recoveryCode}
                        readOnly
                        className="h-12 bg-muted font-mono tracking-widest"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="pl-11 pr-11 h-12"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="pl-11 pr-11 h-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12"
                      disabled={isLoading}
                    >
                      {isLoading ? "Resetting..." : "Reset password"}
                    </Button>
                  </form>
                </>
              )}

              {step === "success" && (
                <>
                  <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Password reset successful!</h1>
                    <p className="text-muted-foreground">
                      Your password has been updated. Here are your new recovery codes:
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-slate-400">Save these recovery codes</p>
                        <button
                          onClick={copyCodes}
                          className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
                        >
                          {copiedCodes ? (
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
                        {newRecoveryCodes.map((code, index) => (
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
                        <strong>Important:</strong> Each code can only be used once. 
                        Save these codes in a safe place. You will need them if you forget your password again.
                      </p>
                    </div>

                    <Link href="/login">
                      <Button className="w-full h-12">
                        Go to login
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
