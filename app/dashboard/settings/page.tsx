"use client"

import { useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Download, Upload, Trash2 } from "lucide-react"
import { defaultMapView, defaultProfile, useDashboard } from "@/app/dashboard/providers"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type BackupV1 = {
  version: 1
  exportedAt: string
  app: "MapMonet"
  data: {
    profile: unknown
    skills: unknown
    jobs: unknown
    focus: unknown
    tasks: unknown
    focusSessions: unknown
    goals: unknown
    activities: unknown
    mapPins: unknown
    mapView: unknown
    recipes: unknown
    posts: unknown
  }
}

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { user } = useAuth()
  const userId = user?.id ?? "anon"

  const {
    userProfile,
    skills,
    jobs,
    focus,
    tasks,
    focusSessions,
    goals,
    recentActivities,
    mapPins,
    mapView,
    recipes,
    posts,
  } = useDashboard()

  const [importError, setImportError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const stats = useMemo(() => {
    const totalSkills = skills.reduce((acc, c) => acc + c.items.length, 0)
    const completedTasks = tasks.filter(t => t.completed).length
    return {
      tasks: tasks.length,
      completedTasks,
      goals: goals.length,
      jobs: jobs.length,
      skills: totalSkills,
      sessions: focusSessions.length,
      pins: mapPins.length,
      recipes: recipes.length,
      posts: posts.length,
      activities: recentActivities.length,
    }
  }, [
    focusSessions.length,
    goals.length,
    jobs.length,
    mapPins.length,
    recentActivities.length,
    recipes.length,
    posts.length,
    skills,
    tasks,
  ])

  const downloadBackup = () => {
    const payload: BackupV1 = {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: "MapMonet",
      data: {
        profile: userProfile,
        skills,
        jobs,
        focus,
        tasks,
        focusSessions,
        goals,
        activities: recentActivities,
        mapPins,
        mapView,
        recipes,
        posts,
      },
    }

    const safeDate = new Date().toISOString().replace(/[:.]/g, "-")
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mapmonet-backup-${safeDate}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const applyBackup = async (backup: BackupV1) => {
    const response = await fetch("/api/dashboard", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-mm-user-id": userId,
      },
      body: JSON.stringify({
        data: {
          userProfile: backup.data.profile ?? {},
          skills: backup.data.skills ?? [],
          jobs: backup.data.jobs ?? [],
          focus: String(backup.data.focus ?? ""),
          tasks: backup.data.tasks ?? [],
          focusSessions: backup.data.focusSessions ?? [],
          goals: backup.data.goals ?? [],
          recentActivities: backup.data.activities ?? [],
          mapPins: backup.data.mapPins ?? [],
          mapView: backup.data.mapView ?? {},
          recipes: backup.data.recipes ?? [],
          posts: backup.data.posts ?? [],
        },
      }),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(payload.error ?? "Failed to save backup to MongoDB")
    }

    window.location.reload()
  }

  const handlePickFile = () => fileInputRef.current?.click()

  const handleFileSelected = async (file: File | null) => {
    if (!file) return
    setImportError(null)
    setImporting(true)

    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as BackupV1

      if (!parsed || parsed.app !== "MapMonet" || parsed.version !== 1 || !parsed.data) {
        throw new Error("Invalid backup file (expected MapMonet v1 backup).")
      }

      await applyBackup(parsed)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Failed to import backup.")
      setImporting(false)
    }
  }

  const clearAllData = async () => {
    const ok = window.confirm(
      "This will permanently delete ALL your cloud MapMonet data for this account. Continue?"
    )
    if (!ok) return

    try {
      await applyBackup({
        version: 1,
        exportedAt: new Date().toISOString(),
        app: "MapMonet",
        data: {
          profile: defaultProfile,
          skills: [],
          jobs: [],
          focus: "",
          tasks: [],
          focusSessions: [],
          goals: [],
          activities: [],
          mapPins: [],
          mapView: defaultMapView,
          recipes: [],
          posts: [],
        },
      })
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Failed to clear cloud data.")
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Back up your data, restore it on another device, or reset everything.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Tasks", value: `${stats.completedTasks}/${stats.tasks}` },
          { label: "Goals", value: stats.goals },
          { label: "Jobs", value: stats.jobs },
          { label: "Skills", value: stats.skills },
          { label: "Sessions", value: stats.sessions },
          { label: "Pins", value: stats.pins },
          { label: "Recipes", value: stats.recipes },
          { label: "Posts", value: stats.posts },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {s.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            MapMonet stores dashboard data in MongoDB cloud sync. Use backup files for migration and recovery.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={downloadBackup}>
              <Download className="h-4 w-4 mr-2" /> Download Backup
            </Button>
            <Button variant="outline" onClick={handlePickFile} disabled={importing}>
              <Upload className="h-4 w-4 mr-2" /> Import Backup
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
            />
          </div>
          {importError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {importError}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Your profile name: <span className="font-medium">{userProfile.name}</span> • Top
            priority: <span className="font-medium">{focus || "—"}</span> • Activity items:{" "}
            <span className="font-medium">{stats.activities}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Reset clears all cloud data for this account.
          </p>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            onClick={clearAllData}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
