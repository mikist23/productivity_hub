"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Clock,
  GraduationCap,
  MapPin,
  Newspaper,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/components/auth/AuthProvider"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Recipes",
    description: "Save your own recipes and pull ideas from free sources.",
    icon: BookOpen,
  },
  {
    title: "Goals",
    description: "Track multi-month goals with progress and priorities.",
    icon: Target,
  },
  {
    title: "Time",
    description: "Log focus sessions and keep your day on track.",
    icon: Clock,
  },
  {
    title: "Skills",
    description: "Track what you’re learning and improve consistently.",
    icon: GraduationCap,
  },
  {
    title: "Jobs",
    description: "Manage applications and build a daily apply habit.",
    icon: Briefcase,
  },
  {
    title: "Map",
    description: "Pin places related to goals, tasks, jobs, or life.",
    icon: MapPin,
  },
  {
    title: "Blog",
    description: "Write posts and keep notes on what you’re building.",
    icon: Newspaper,
  },
] as const

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold tracking-tight">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              M
            </div>
            <span>MapMonet</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/dashboard">
                <Button>
                  Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button>
                    Get started <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16 space-y-12">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-10 lg:grid-cols-2 items-center"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/30 px-3 py-1 text-xs text-muted-foreground">
              Free • Local-first • No subscriptions
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Your personal productivity hub — goals, time, skills, jobs, recipes, and more.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              MapMonet is built to stay free: your data is stored locally in your browser, with
              backup/export so you’re never locked in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full">
                    Open Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full">
                      Create account <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Note: current login is local-first (per-device). Add cloud sync later if you want.
            </div>
          </div>

          <Card className="border-border/60">
            <CardContent className="p-6 md:p-8 space-y-4">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                What you get
              </div>
              <div className="grid gap-3">
                {[
                  "Daily tasks + focus logging",
                  "Goal tracking with progress",
                  "Skills learning tracker",
                  "Job application pipeline",
                  "Recipes (personal + import)",
                  "Personal map pins",
                  "Backup/export + restore",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="text-sm">{item}</div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground">
                Everything uses free/open-source libraries. No paid APIs required for the core
                app.
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pages & features</h2>
            <p className="text-muted-foreground">
              Designed to be modular so you can evolve it over time.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
                    )}
                  >
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-sm text-muted-foreground">{f.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-accent/20 p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Ready to start?</h3>
              <p className="text-sm text-muted-foreground">
                Create a local account and begin building your routine.
              </p>
            </div>
            <div className="flex gap-2">
              {user ? (
                <Link href="/dashboard">
                  <Button>
                    Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>
                      Create account <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MapMonet • Built to stay free
          </div>
          <div className="text-xs text-muted-foreground">
            Tip: Use <span className="font-medium">Settings → Download Backup</span> regularly.
          </div>
        </div>
      </footer>
    </div>
  )
}

