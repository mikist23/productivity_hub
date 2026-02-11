"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, CheckCircle2, Circle, Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useDashboard, GoalStatus } from "@/app/dashboard/providers"
import { EnhancedAddGoalModal } from "@/components/dashboard/EnhancedAddGoalModal"
import { GoalDetailsModal } from "@/components/dashboard/GoalDetailsModal"
import { AuthPromptModal, useAuthPrompt } from "@/components/dashboard/AuthPromptModal"

export default function GoalsPage() {
  const { goals, deleteGoal, updateGoalStatus, addGoal } = useDashboard()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null)
  const { isOpen: isAuthPromptOpen, action: authAction, nextPath: authNextPath, promptAuth, closePrompt } = useAuthPrompt()

  const columns = [
    { id: "todo", label: "To Do", icon: Circle },
    { id: "inprogress", label: "In Progress", icon: Clock },
    { id: "completed", label: "Completed", icon: CheckCircle2 },
  ] as const

  return (
    <div className="space-y-8">
      <EnhancedAddGoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddGoal={addGoal}
      />
      {activeGoalId && (
        <GoalDetailsModal
          isOpen
          onClose={() => setActiveGoalId(null)}
          goalId={activeGoalId}
        />
      )}

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
           <p className="text-muted-foreground">Set and track your personal goals with roadmaps</p>
        </div>
        <Button onClick={() => {
          if (promptAuth("add goals", "/dashboard/goals")) {
            setIsModalOpen(true)
          }
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3 h-full items-start">
        {columns.map((col) => (
            <div key={col.id} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                         <div className={cn("p-2 rounded-lg bg-accent", 
                            col.id === "todo" && "bg-zinc-100 dark:bg-zinc-800",
                            col.id === "inprogress" && "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
                            col.id === "completed" && "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                         )}>
                            <col.icon className="h-4 w-4" />
                         </div>
                         <h3 className="font-semibold">{col.label}</h3>
                         <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
                            {goals.filter(g => g.status === col.id).length}
                         </span>
                    </div>
                </div>

                <div className="space-y-3">
                    {goals.filter(g => g.status === col.id).map((goal, index) => (
                        <motion.div
                          key={goal.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                            <Card
                              className="hover:shadow-md transition-shadow group relative border-accent/60 cursor-pointer"
                              onClick={() => setActiveGoalId(goal.id)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") setActiveGoalId(goal.id)
                              }}
                            >
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border",
                                            goal.category === "Dev" && "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900",
                                            goal.category === "Personal" && "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900",
                                            goal.category === "Health" && "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
                                            goal.category === "Career" && "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
                                            goal.category === "Finance" && "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900",
                                            goal.category === "skill" && "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
                                            goal.category === "general" && "bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-900",
                                        )}>
                                            {goal.category}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                             {/* Quick Status Move */}
                                             {col.id !== 'completed' && (
                                                 <Button 
                                                    variant="ghost" size="icon" className="h-6 w-6"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      updateGoalStatus(
                                                        goal.id,
                                                        col.id === "todo" ? "inprogress" : "completed"
                                                      )
                                                    }}
                                                 >
                                                     <CheckCircle2 className="h-3 w-3" />
                                                 </Button>
                                             )}
                                             <Button
                                               variant="ghost"
                                               size="icon"
                                               className="h-6 w-6 text-destructive hover:text-destructive"
                                               onClick={(e) => {
                                                 e.stopPropagation()
                                                 const ok = window.confirm(`Delete goal: "${goal.title}"?`)
                                                 if (!ok) return
                                                 deleteGoal(goal.id)
                                               }}
                                             >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="font-semibold leading-tight">{goal.title}</p>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-1.5 w-1.5 rounded-full", 
                                            goal.priority === "high" && "bg-red-500",
                                            goal.priority === "medium" && "bg-yellow-500",
                                            goal.priority === "low" && "bg-blue-500",
                                        )} />
                                        <span className="text-xs text-muted-foreground capitalize">{goal.priority} Priority</span>
                                    </div>

                                    <div className="space-y-1 pt-1">
                                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Progress</span>
                                        <span>{goal.progress}%</span>
                                      </div>
                                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                        <div
                                          className="h-full bg-primary transition-all"
                                          style={{ width: `${goal.progress}%` }}
                                        />
                                      </div>
                                      {(goal.roadmap?.length ?? 0) > 0 && (
                                        <div className="text-[11px] text-muted-foreground">
                                          {(goal.roadmap ?? []).filter((s) => s.done).length}/
                                          {(goal.roadmap ?? []).length} steps complete
                                        </div>
                                      )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                    <Button 
                        variant="ghost" 
                        className="w-full text-muted-foreground border border-dashed border-border hover:bg-accent/50 hover:text-foreground"
                        onClick={() => {
                          if (promptAuth("add goals", "/dashboard/goals")) {
                            setIsModalOpen(true)
                          }
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Goal
                    </Button>
                </div>
            </div>
        ))}
      </div>
      
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
