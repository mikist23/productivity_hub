"use client"

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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard } from "@/app/dashboard/providers"
import { TasksModal } from "@/components/dashboard/TasksModal"
import { FocusModal } from "@/components/dashboard/FocusModal"
import { AddGoalModal } from "@/components/dashboard/AddGoalModal"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { userProfile, focus, setFocus, jobs, skills, tasks, todayFocusMinutes, recentActivities, goals, updateGoalProgress, deleteGoal } = useDashboard()
  const [isTasksOpen, setIsTasksOpen] = useState(false)
  const [isFocusOpen, setIsFocusOpen] = useState(false)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)

  // Calculate stats
  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const remainingTasks = totalTasks - completedTasks
  const activeSkills = skills.reduce((acc, cat) => acc + cat.items.filter(s => s.status === 'learning').length, 0)
  const activeApplications = jobs.filter(j => ['interview', 'applied', 'offer'].includes(j.status)).length
  const focusHours = (todayFocusMinutes / 60).toFixed(1)

  return (
    <div className="space-y-8">
      <TasksModal isOpen={isTasksOpen} onClose={() => setIsTasksOpen(false)} />
      <FocusModal isOpen={isFocusOpen} onClose={() => setIsFocusOpen(false)} />
      <AddGoalModal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-4xl font-bold tracking-tight">Good Morning, {userProfile.name}.</h1>
        <p className="text-muted-foreground text-lg">Here’s what’s happening with your goals today.</p>
      </motion.div>

      {/* Main Focus Input */}
      <Card className="border-none bg-accent/30 shadow-none">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Priority</label>
                <input 
                  type="text" 
                  placeholder="What is your main focus today?"
                  className="w-full bg-transparent text-3xl md:text-4xl font-bold placeholder:text-muted-foreground/40 focus:outline-none border-b border-transparent focus:border-primary transition-colors py-2"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                />
            </div>
            <Button
              size="lg"
              className="shrink-0 rounded-full h-14 w-14 p-0"
              onClick={() => setIsTasksOpen(true)}
              aria-label="Open tasks"
            >
                <Plus className="h-6 w-6" />
            </Button>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{completedTasks}</div>
                <p className="text-xs text-muted-foreground mb-3">{remainingTasks} remaining</p>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsTasksOpen(true)}
                >
                    Manage Tasks
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Hours Focused</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{focusHours}</div>
                <p className="text-xs text-muted-foreground mb-3">Daily average: 2.5h</p>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsFocusOpen(true)}
                >
                    Log Focus
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Skills</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{activeSkills}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
                <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{activeApplications}</div>
                <p className="text-xs text-muted-foreground">Active processes</p>
            </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity / Goals Placeholder */}
       <div className="grid gap-6 md:grid-cols-7">
         <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Goal Progress</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setIsGoalModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Goal
                </Button>
            </CardHeader>
            <CardContent>
                 {goals.length === 0 ? (
                    <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
                        <p>No active goals.</p>
                        <p className="text-xs">Set a long-term goal to track progress.</p>
                    </div>
                 ) : (
                     <div className="space-y-6">
                         {goals.map(goal => (
                             <div key={goal.id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{goal.title}</span>
                                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", 
                                            goal.priority === 'high' ? "bg-red-50 text-red-600 border-red-100" :
                                            goal.priority === 'medium' ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                                            "bg-blue-50 text-blue-600 border-blue-100"
                                        )}>{goal.priority}</span>
                                    </div>
                                    <span className="text-muted-foreground">{goal.progress}%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden cursor-pointer group relative">
                                    <div 
                                        className="h-full bg-primary transition-all duration-500" 
                                        style={{ width: `${goal.progress}%` }} 
                                    />
                                    {/* Invisible slider for interaction */}
                                    <input 
                                        type="range" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        min="0" max="100"
                                        value={goal.progress}
                                        onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                                    <button onClick={() => deleteGoal(goal.id)} className="hover:text-destructive">Remove</button>
                                </div>
                             </div>
                         ))}
                     </div>
                 )}
            </CardContent>
         </Card>
         <Card className="col-span-3">
             <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
             </CardHeader>
             <CardContent>
                 {recentActivities.length === 0 ? (
                     <div className="text-center text-sm text-muted-foreground py-8">
                         No activity yet.
                     </div>
                 ) : (
                    <ul className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {recentActivities.map((activity) => (
                            <li key={activity.id} className="flex items-center gap-4">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    {activity.type === "task" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                    {activity.type === "focus" && <Clock className="h-4 w-4 text-primary" />}
                                    {activity.type === "job" && <Briefcase className="h-4 w-4 text-primary" />}
                                    {activity.type === "skill" && <GraduationCap className="h-4 w-4 text-primary" />}
                                    {activity.type === "goal" && <Target className="h-4 w-4 text-primary" />}
                                    {activity.type === "map" && <MapPin className="h-4 w-4 text-primary" />}
                                    {activity.type === "recipe" && <BookOpen className="h-4 w-4 text-primary" />}
                                    {activity.type === "post" && <FileText className="h-4 w-4 text-primary" />}
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <p className="text-sm font-medium leading-none truncate">{activity.text}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                 )}
             </CardContent>
         </Card>
       </div>
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
