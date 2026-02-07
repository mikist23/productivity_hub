"use client"

import { useState } from "react"
import { useDashboard } from "@/app/dashboard/providers"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, Plus, Trash2 } from "lucide-react"

interface TasksModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TasksModal({ isOpen, onClose }: TasksModalProps) {
  const { tasks, addTask, toggleTask, deleteTask } = useDashboard()
  const [newTask, setNewTask] = useState("")

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return
    addTask(newTask)
    setNewTask("")
  }

  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tasks & Priorities"
      description="Manage your daily todos."
    >
      <div className="space-y-6">
        <form onSubmit={handleAdd} className="flex gap-2">
            <Input 
                placeholder="Add a new task..." 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                autoFocus
            />
            <Button type="submit" size="icon">
                <Plus className="h-4 w-4" />
            </Button>
        </form>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {tasks.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                    No tasks yet. Add one above!
                </div>
            )}

            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Do</h3>
                    {pendingTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between group rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors">
                            <span className="text-sm font-medium">{task.title}</span>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full border-primary/50 hover:bg-primary hover:text-primary-foreground"
                                    onClick={() => toggleTask(task.id)}
                                >
                                    <Check className="h-3 w-3" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <div className="space-y-2 opactiy-80">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</h3>
                     {completedTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between group rounded-lg border border-border bg-accent/20 p-3">
                            <span className="text-sm font-medium line-through text-muted-foreground">{task.title}</span>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full bg-primary/10 text-primary"
                                    onClick={() => toggleTask(task.id)}
                                >
                                    <Check className="h-3 w-3" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </Modal>
  )
}
