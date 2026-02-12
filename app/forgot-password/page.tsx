"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const { initiatePasswordReset } = useAuth()
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"email" | "success" | "error">("email")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await initiatePasswordReset(email)
      
      if (result.ok) {
        setStep("success")
      } else {
        setError(result.error)
        setStep("error")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setStep("error")
    } finally {
      setIsLoading(false)
    }
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
              {step === "email" && (
                <>
                  <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                      <KeyRound className="h-8 w-8 text-violet-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
                    <p className="text-muted-foreground">
                      Enter your email to receive a recovery code
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-start gap-3"
                    >
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Unable to reset password</p>
                        <p className="text-destructive/80">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
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
                          className="pl-11 h-12"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12"
                      disabled={isLoading}
                    >
                      {isLoading ? "Checking..." : "Send recovery code"}
                    </Button>
                  </form>

                  <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      <strong>Important:</strong> This app uses recovery codes for password reset. 
                      Make sure you have your recovery codes saved from when you created your account.
                    </p>
                  </div>
                </>
              )}

              {step === "success" && (
                <>
                  <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Reset request accepted</h1>
                    <p className="text-muted-foreground">
                      Enter one of your saved recovery codes on the next screen
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        <strong>Important:</strong> Recovery codes are only shown when you create or regenerate them.
                        Use one saved code now. After resetting your password, you will receive new codes.
                      </p>
                    </div>

                    <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
                      <Button className="w-full h-12">
                        Continue to reset password
                      </Button>
                    </Link>

                    <p className="text-center text-sm text-muted-foreground">
                      Didn't receive it?{" "}
                      <button 
                        onClick={() => setStep("email")}
                        className="text-primary hover:underline"
                      >
                        Try again
                      </button>
                    </p>
                  </div>
                </>
              )}

              {step === "error" && (
                <>
                  <div className="text-center mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Unable to reset</h1>
                    <p className="text-muted-foreground">
                      {error || "We couldn't find an account with that email"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      onClick={() => setStep("email")}
                      variant="outline"
                      className="w-full h-12"
                    >
                      Try again
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link href="/signup" className="text-primary hover:underline">
                        Sign up
                      </Link>
                    </p>
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
