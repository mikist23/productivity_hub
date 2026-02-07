"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Square, CheckCircle2, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/app/dashboard/providers"

export default function TimePage() {
  const { focusSessions, addFocusSession, todayFocusMinutes, focus } = useDashboard()
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0) // in seconds
  const [label, setLabel] = useState("")

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (!label && focus) setLabel(focus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => setIsRunning(!isRunning)

  const logCurrentSession = () => {
    if (time <= 0) return
    const minutes = Math.max(1, Math.round(time / 60))
    addFocusSession(minutes, label)
    setTime(0)
    setIsRunning(false)
  }

  const today = new Date().toISOString().split("T")[0]
  const todaySessions = focusSessions.filter(s => s.date === today)
  const totalHours = (todayFocusMinutes / 60).toFixed(1)

  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs <= 0) return `${mins}m`
    if (mins <= 0) return `${hrs}h`
    return `${hrs}h ${mins}m`
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
        <p className="text-muted-foreground">Track your focus sessions and productivity</p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Timer Section */}
        <Card className="md:col-span-1 border-none shadow-none bg-transparent">
             <div className="relative aspect-square rounded-full border-8 border-accent flex flex-col items-center justify-center bg-card shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/20 pointer-events-none" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Timer className="h-4 w-4" /> Focus Timer
                </span>
                <div className="text-6xl md:text-7xl font-mono font-bold tracking-tighter tabular-nums">
                    {formatTime(time)}
                </div>
                <div className="flex gap-4 mt-8 flex-wrap justify-center">
                    <Button 
                        size="lg" 
                        className={cn("rounded-full h-16 w-16 p-0 transition-all", isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-primary")}
                        onClick={toggleTimer}
                    >
                        {isRunning ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                    </Button>
                    {time > 0 && !isRunning && (
                        <>
                          <Button
                            size="lg"
                            variant="secondary"
                            className="rounded-full h-16 w-16 p-0"
                            onClick={logCurrentSession}
                            title="Log this session"
                          >
                            <CheckCircle2 className="h-5 w-5 fill-current" />
                          </Button>
                          <Button 
                              size="lg" 
                              variant="secondary"
                              className="rounded-full h-16 w-16 p-0"
                              onClick={() => setTime(0)}
                              title="Reset timer"
                          >
                              <Square className="h-5 w-5 fill-current" />
                          </Button>
                        </>
                    )}
                </div>
             </div>

             <div className="mt-6 space-y-2">
                <Label htmlFor="session-label">Session label (optional)</Label>
                <Input
                  id="session-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Deep work: landing page"
                />
                <p className="text-xs text-muted-foreground">
                  This is saved with your focus session when you log it.
                </p>
             </div>
        </Card>

        {/* Recent Logs & Stats */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Today’s Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-accent/50 text-center">
                        <div className="text-3xl font-bold">{totalHours}h</div>
                        <div className="text-xs text-muted-foreground uppercase mt-1">Total Focus</div>
                    </div>
                    <div className="p-4 rounded-xl bg-accent/50 text-center">
                        <div className="text-3xl font-bold">{todaySessions.length}</div>
                        <div className="text-xs text-muted-foreground uppercase mt-1">Sessions</div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 p-0">
                    {focusSessions.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        No focus sessions yet. Log one from the dashboard or timer.
                      </div>
                    ) : (
                      focusSessions.slice(0, 12).map((session) => (
                        <div key={session.id} className="flex items-center p-4 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 text-primary">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {session.label?.trim() ? session.label : "Focus session"}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>
                                      {session.timestamp
                                        ? new Date(session.timestamp).toLocaleString()
                                        : session.date}
                                    </span>
                                </div>
                            </div>
                            <div className="font-mono font-medium text-sm">
                                {formatMinutes(session.minutes)}
                            </div>
                        </div>
                      ))
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
