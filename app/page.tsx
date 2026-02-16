"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Github,
  GraduationCap,
  Linkedin,
  MapPin,
  Newspaper,
  Play,
  Sparkles,
  Target,
  Twitter,
  X,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/components/auth/AuthProvider"
import { SupportButton } from "@/components/common/SupportButton"
import { AppLogo } from "@/components/common/AppLogo"
import { getSocialLinks } from "@/lib/social-links"

const features = [
  {
    title: "Goals",
    description: "Track multi-month goals with daily targets and progress tracking.",
    icon: Target,
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "Time Tracking",
    description: "Log focus sessions with a beautiful timer and auto-completion.",
    icon: Clock,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Skills",
    description: "Track what you're learning and improve consistently.",
    icon: GraduationCap,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Jobs",
    description: "Manage applications and build a daily apply habit.",
    icon: Briefcase,
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "Recipes",
    description: "Save your own recipes and pull ideas from free sources.",
    icon: BookOpen,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Map",
    description: "Pin places related to goals, tasks, jobs, or life.",
    icon: MapPin,
    color: "from-indigo-500 to-blue-500",
  },
  {
    title: "Blog",
    description: "Write posts and keep notes on what you're building.",
    icon: Newspaper,
    color: "from-slate-500 to-zinc-500",
  },
] as const

export default function LandingPage() {
  const { user } = useAuth()
  const shouldReduceMotion = useReducedMotion()
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [isLoadingDemo, setIsLoadingDemo] = useState(false)
  const socialLinks = getSocialLinks()

  const handleTryDemo = async () => {
    setIsLoadingDemo(true)
    // Demo data will be loaded by the dashboard
    await new Promise(resolve => setTimeout(resolve, 500))
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-800/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <AppLogo size="md" priority />
            <span className="font-bold text-xl tracking-tight">Productivity Hub</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0">
                  Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDemoModal(true)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Try Demo
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0">
                    Get started <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-16 md:py-24 space-y-24">
        {/* Hero Section */}
        <section className="grid gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
              <Sparkles className="h-4 w-4" />
              <span>Goal planning, focus tracking, and execution in one workspace</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Your personal{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400">
                productivity hub
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
              Track goals, time, skills, jobs, and more. Your data stays in your browser -
              you&apos;re never locked in. Try the demo first, sign up when you&apos;re ready.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0 text-lg px-8">
                    Open Dashboard <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    onClick={() => setShowDemoModal(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0 text-lg px-8"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Try Demo
                  </Button>
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-lg px-8">
                      Create account
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Start with the demo in one click</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Works on desktop and mobile</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-pink-600/20 rounded-3xl blur-3xl" />
            <motion.div
              className="relative"
              animate={
                shouldReduceMotion
                  ? undefined
                  : { x: [0, -14, 14, 0], rotateZ: [0, -0.45, 0.45, 0] }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: 9,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                    }
              }
            >
              <Card className="relative bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                {!shouldReduceMotion && (
                  <>
                    <motion.div
                      className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-violet-400/20 to-transparent blur-2xl"
                      animate={{ x: ["-55%", "180%"] }}
                      transition={{ duration: 7.2, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
                    />
                    <motion.div
                      className="pointer-events-none absolute -right-1/3 top-0 h-full w-1/2 bg-gradient-to-l from-transparent via-pink-400/15 to-transparent blur-2xl"
                      animate={{ x: ["40%", "-175%"] }}
                      transition={{ duration: 8.8, delay: 0.8, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
                    />
                  </>
                )}

                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center"
                        animate={shouldReduceMotion ? undefined : { rotate: [0, -6, 6, 0], scale: [1, 1.04, 1] }}
                        transition={
                          shouldReduceMotion
                            ? undefined
                            : {
                                duration: 4.8,
                                ease: "easeInOut",
                                repeat: Number.POSITIVE_INFINITY,
                              }
                        }
                      >
                        <Target className="h-5 w-5 text-white" />
                      </motion.div>
                      <div>
                        <div className="font-semibold">Learn Flutter</div>
                        <div className="text-sm text-slate-400">Daily Goal</div>
                      </div>
                    </div>
                    <motion.div
                      className="text-right"
                      animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                      transition={
                        shouldReduceMotion
                          ? undefined
                          : {
                              duration: 3.8,
                              ease: "easeInOut",
                              repeat: Number.POSITIVE_INFINITY,
                            }
                      }
                    >
                      <div className="text-2xl font-bold text-violet-400">3h 30m</div>
                      <div className="text-sm text-slate-400">of 4h 30m</div>
                    </motion.div>
                  </div>

                  <div className="relative h-3 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-600 to-pink-600"
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                    {!shouldReduceMotion && (
                      <motion.div
                        className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                        animate={{ x: ["-60%", "310%"] }}
                        transition={{ duration: 2.8, ease: "linear", repeat: Number.POSITIVE_INFINITY, delay: 1.2 }}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Focus Time", value: "3.5h", icon: Clock },
                      { label: "Streak", value: "12 days", icon: Zap },
                      { label: "Goals", value: "4 active", icon: Target },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        className="text-center p-3 rounded-xl bg-slate-800/50"
                        animate={shouldReduceMotion ? undefined : { y: [0, -4, 0], scale: [1, 1.02, 1] }}
                        transition={
                          shouldReduceMotion
                            ? undefined
                            : {
                                duration: 4,
                                ease: "easeInOut",
                                repeat: Number.POSITIVE_INFINITY,
                                delay: 0.25 + i * 0.2,
                              }
                        }
                      >
                        <stat.icon className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                        <div className="font-semibold">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-slate-400 text-lg">
              All the tools to track your productivity in one place
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Card className="group h-full bg-slate-900/50 border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <CardContent className="p-6 space-y-4 relative">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg`}>
                      <f.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-white transition-colors">{f.title}</h3>
                      <p className="text-sm text-slate-400">{f.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Demo CTA Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/50 via-slate-900 to-slate-950 border border-violet-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
          <div className="relative p-12 md:p-16 text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
                Try the demo with sample data, then create an account to save your progress
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => setShowDemoModal(true)}
                  className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0 text-lg px-8"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Try Demo
                </Button>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="border-slate-600 hover:bg-slate-800 text-lg px-8">
                    Create Account
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-800/60 bg-slate-950/95">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_82%_82%,rgba(99,102,241,0.18),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <div className="overflow-hidden rounded-[32px] border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(15,23,42,0.92)_0%,rgba(10,17,35,0.94)_45%,rgba(2,6,23,0.97)_100%)] shadow-[0_40px_120px_-55px_rgba(14,165,233,0.6)]">
            <div className="grid gap-10 border-b border-slate-700/60 px-6 py-8 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-2 shadow-[0_0_25px_-12px_rgba(56,189,248,0.8)]">
                    <AppLogo size="lg" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-white">Productivity Hub</p>
                    <p className="text-sm text-cyan-100/80">Plan clearly. Execute consistently.</p>
                  </div>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-slate-300">
                  A focused workspace for goals, time tracking, skills, and career momentum with a practical workflow you can run every day.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-600 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-300">Goal Planning</span>
                  <span className="rounded-full border border-slate-600 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-300">Focus Tracking</span>
                  <span className="rounded-full border border-slate-600 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-300">Career Pipeline</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">Product</p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Goals and Roadmaps</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Time and Focus Tracking</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Skills and Job Pipeline</li>
                </ul>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">Connect</p>
                {socialLinks.length > 0 ? (
                  <div className="grid gap-2">
                    {socialLinks.map((social) => {
                      const icon =
                        social.platform === "github"
                          ? <Github className="h-4 w-4" />
                          : social.platform === "x"
                            ? <Twitter className="h-4 w-4" />
                            : <Linkedin className="h-4 w-4" />
                      const label =
                        social.platform === "github"
                          ? "GitHub"
                          : social.platform === "x"
                            ? "X"
                            : "LinkedIn"

                      return (
                        <a
                          key={social.platform}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition-all hover:border-cyan-400/60 hover:bg-slate-800"
                          aria-label={`Open ${label}`}
                        >
                          <span className="inline-flex items-center gap-2">
                            {icon}
                            <span>{label}</span>
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                        </a>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    No social links detected. Set `NEXT_PUBLIC_SOCIAL_*` URLs and restart/redeploy to refresh client env values.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-10">
              <div className="space-y-1">
                <p className="text-sm text-slate-400">Copyright {new Date().getFullYear()} Productivity Hub. All rights reserved.</p>
                <p className="text-xs text-slate-500">Built for practical, everyday execution.</p>
              </div>
              <SupportButton
                variant="outline"
                size="sm"
                className="border-cyan-400/40 bg-cyan-500/5 text-cyan-100 hover:bg-cyan-500/10"
                label="Support"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDemoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Try the Demo</h3>
                    <p className="text-sm text-slate-400">Experience Productivity Hub with sample data</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowDemoModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Sample Goals</div>
                    <div className="text-sm text-slate-400">Pre-populated with realistic goals like &ldquo;Learn Flutter&rdquo; and &ldquo;Exercise Daily&rdquo;</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Time Tracking</div>
                    <div className="text-sm text-slate-400">Try the timer with daily targets and progress tracking</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">No Signup Required</div>
                    <div className="text-sm text-slate-400">Jump right in and explore all features</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0 h-12"
                  onClick={handleTryDemo}
                  disabled={isLoadingDemo}
                >
                  {isLoadingDemo ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Loading Demo...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Demo
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-700 hover:bg-slate-800"
                  onClick={() => setShowDemoModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


