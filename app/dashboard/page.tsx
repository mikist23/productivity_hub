"use client"

import Link from "next/link"
import { useState, type SVGProps } from "react"
import { motion } from "framer-motion"
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  MapPin,
  Plus,
  Target,
  Trash2,
  Play,
  Sparkles,
  TrendingUp,
  Zap,
  Calendar,
  Award,
  Flame,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard } from "@/app/dashboard/providers"
import { TasksModal } from "@/components/dashboard/TasksModal"
import { FocusModal } from "@/components/dashboard/FocusModal"
import { GoalDetailsModal } from "@/components/dashboard/GoalDetailsModal"
import { InsightsCard } from "@/components/dashboard/InsightsCard"
import { EnhancedAddGoalModal } from "@/components/dashboard/EnhancedAddGoalModal"
import { AuthPromptModal, useAuthPrompt } from "@/components/dashboard/AuthPromptModal"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const {
    userProfile,
    focus,
    setFocus,
    jobs,
    skills,
    tasks,
    focusSessions,
    todayFocusMinutes,
    recentActivities,
    goals,
    deleteGoal,
    addGoal,
    focusStreaks,
    goalStreaks,
  } = useDashboard()
  const [isTasksOpen, setIsTasksOpen] = useState(false)
  const [isFocusOpen, setIsFocusOpen] = useState(false)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null)
  
  const { isOpen: isAuthPromptOpen, action: authAction, nextPath: authNextPath, promptAuth, closePrompt } = useAuthPrompt()

  // Calculate stats
  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const remainingTasks = totalTasks - completedTasks
  const activeSkills = skills.reduce((acc, cat) => acc + cat.items.filter(s => s.status === 'learning').length, 0)
  const activeApplications = jobs.filter(j => ['interview', 'applied', 'offer'].includes(j.status)).length
  const focusHours = (todayFocusMinutes / 60).toFixed(1)

  const goalTrackedMinutes = (id: string) =>
    focusSessions.filter((s) => s.goalId === id).reduce((acc, s) => acc + (s.minutes || 0), 0)

  const getTodayTarget = (goal: any) => {
    if (!goal.useDailyTargets || !goal.dailyTargets) return goal.targetMinutes
    const today = new Date().toISOString().split('T')[0]
    const todayTarget = goal.dailyTargets.find((t: any) => t.date === today)
    return todayTarget?.targetMinutes || 0
  }

  const last7DaysAvgHours = (() => {
    const today = new Date()
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(today)
      d.setDate(d.getDate() - idx)
      return d.toISOString().split("T")[0]
    })
    const byDay = new Map<string, number>()
    for (const s of focusSessions) byDay.set(s.date, (byDay.get(s.date) ?? 0) + (s.minutes || 0))
    const total = days.reduce((acc, d) => acc + (byDay.get(d) ?? 0), 0)
    return (total / 7 / 60).toFixed(1)
  })()

  // Get active goals with daily targets
  const activeGoals = goals.filter(g => g.status !== "completed").slice(0, 4)

  return (
    <div className="min-h-screen space-y-8 pb-8">
      <TasksModal isOpen={isTasksOpen} onClose={() => setIsTasksOpen(false)} />
      <FocusModal isOpen={isFocusOpen} onClose={() => setIsFocusOpen(false)} />
      <EnhancedAddGoalModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)} 
        onAddGoal={addGoal}
      />
      {activeGoalId && (
        <GoalDetailsModal
          isOpen
          onClose={() => setActiveGoalId(null)}
          goalId={activeGoalId}
        />
      )}

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
        
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 text-violet-400"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Dashboard</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold tracking-tight text-white"
              >
                Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">{userProfile.name || 'Alex'}</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 text-lg"
              >
                Here's your daily overview and progress
              </motion.p>
            </div>

            {/* Quick Stats Row */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{focusStreaks.currentStreak}</div>
                  <div className="text-xs text-slate-400">Day Streak</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{focusHours}h</div>
                  <div className="text-xs text-slate-400">Today</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Focus Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              <div className="relative flex items-center gap-4 p-6 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-violet-500/30 transition-colors">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                    Today's Focus
                  </label>
                  <input 
                    type="text" 
                    placeholder="What is your main priority today?"
                    className="w-full bg-transparent text-2xl md:text-3xl font-bold text-white placeholder:text-slate-600 focus:outline-none"
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                  />
                </div>
                <Button
                  size="lg"
                  className="shrink-0 rounded-xl h-14 w-14 bg-gradient-to-br from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 border-0"
                  onClick={() => setIsTasksOpen(true)}
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { 
            title: "Tasks", 
            value: `${completedTasks}/${totalTasks}`, 
            subtext: `${remainingTasks} remaining`,
            icon: CheckCircle2, 
            color: "from-emerald-500 to-teal-500",
            onClick: () => setIsTasksOpen(true)
          },
          { 
            title: "Focus Time", 
            value: `${focusHours}h`, 
            subtext: `Avg: ${last7DaysAvgHours}h/day`,
            icon: Clock, 
            color: "from-violet-500 to-purple-500",
            onClick: () => setIsFocusOpen(true)
          },
          { 
            title: "Active Skills", 
            value: activeSkills.toString(), 
            subtext: "In progress",
            icon: GraduationCap, 
            color: "from-blue-500 to-cyan-500",
            href: "/dashboard/skills"
          },
          { 
            title: "Applications", 
            value: activeApplications.toString(), 
            subtext: "Active processes",
            icon: BriefcaseIcon, 
            color: "from-amber-500 to-orange-500",
            href: "/dashboard/jobs"
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            <Card 
              className="group relative overflow-hidden bg-slate-900/50 border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer"
              onClick={stat.onClick}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Active Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Active Goals</h2>
            <p className="text-slate-400">Track your daily progress</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/time">
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            </Link>
            <Button 
              onClick={() => {
                if (promptAuth("add goals", "/dashboard")) {
                  setIsGoalModalOpen(true)
                }
              }}
              className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>
        </div>

        {activeGoals.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700/50 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No active goals</h3>
              <p className="text-slate-400 mb-4">Create a goal to start tracking your progress</p>
              <Button 
                onClick={() => {
                  if (promptAuth("add goals", "/dashboard")) {
                    setIsGoalModalOpen(true)
                  }
                }}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoals.map((goal, index) => {
              const tracked = goalTrackedMinutes(goal.id)
              const todayTarget = getTodayTarget(goal)
              const progress = todayTarget > 0 
                ? Math.min(100, Math.round((tracked / todayTarget) * 100))
                : goal.progress
              const isComplete = progress >= 100

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <Card 
                    className="group relative overflow-hidden bg-slate-900/50 border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer"
                    onClick={() => setActiveGoalId(goal.id)}
                  >
                    {/* Progress Bar Background */}
                    <div 
                      className={cn(
                        "absolute bottom-0 left-0 h-1 transition-all duration-500",
                        isComplete ? "bg-emerald-500" : "bg-gradient-to-r from-violet-600 to-pink-600"
                      )}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                    
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full border",
                              goal.category === "skill" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                              goal.category === "career" && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                              goal.category === "health" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                              goal.category === "personal" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                            )}>
                              {goal.category}
                            </span>
                            {isComplete && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                ✓ Complete
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-white truncate">{goal.title}</h3>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation()
                            const ok = window.confirm(`Delete goal: "${goal.title}"?`)
                            if (!ok) return
                            deleteGoal(goal.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Progress Info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">
                            {goal.useDailyTargets ? "Today's Progress" : "Progress"}
                          </span>
                          <span className="font-medium text-white">{Math.round(progress)}%</span>
                        </div>
                        
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <motion.div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isComplete 
                                ? "bg-emerald-500" 
                                : "bg-gradient-to-r from-violet-600 to-pink-600"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {Math.round((tracked / 60) * 10) / 10}h tracked
                          </span>
                          {todayTarget > 0 && (
                            <span>
                              Target: {Math.round((todayTarget / 60) * 10) / 10}h
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <InsightsCard focusSessions={focusSessions} />
      </motion.div>

      {/* Quick Actions Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Link href="/dashboard/time">
          <Card className="group bg-gradient-to-br from-violet-600/10 to-pink-600/10 border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Start Focus Session</h3>
                <p className="text-sm text-slate-400">Track time for your goals</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/goals">
          <Card className="group bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">View All Goals</h3>
                <p className="text-sm text-slate-400">Manage your objectives</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="group bg-gradient-to-br from-amber-600/10 to-orange-600/10 border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Analytics</h3>
                <p className="text-sm text-slate-400">View detailed insights</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
      
      {/* Auth Prompt Modal */}
      <AuthPromptModal 
        isOpen={isAuthPromptOpen} 
        onClose={closePrompt}
        action={authAction}
        nextPath={authNextPath}
      />
    </div>
  )
}

function BriefcaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}
