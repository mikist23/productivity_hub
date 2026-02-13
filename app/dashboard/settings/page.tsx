"use client"

import { useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Download, Upload, Trash2, CloudUpload } from "lucide-react"
import { useDashboard } from "@/app/dashboard/providers"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type BackupV1 = {
  version: 1
  exportedAt: string
  app: "MapMonet" | "Productivity Hub"
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
  const [migrating, setMigrating] = useState(false)
  const [cloudStatus, setCloudStatus] = useState<string | null>(null)

  const stats = useMemo(() => {
    const totalSkills = skills.reduce((acc, c) => acc + c.items.length, 0)
    const completedTasks = tasks.filter((t) => t.completed).length
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

  const buildLocalBackup = (): BackupV1 => ({
    version: 1,
    exportedAt: new Date().toISOString(),
    app: "Productivity Hub",
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
  })

  const pushBackupToCloud = async (backup: BackupV1) => {
    if (!user?.id) return
    const res = await fetch("/api/dashboard/migrate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backup),
      credentials: "same-origin",
    })

    if (!res.ok) {
      throw new Error("Cloud migration failed.")
    }
  }

  const downloadBackup = async () => {
    setCloudStatus(null)
    let payload = buildLocalBackup()

    if (user?.id) {
      try {
        const res = await fetch("/api/dashboard", {
          credentials: "same-origin",
        })

        if (res.ok) {
          const cloud = await res.json()
          payload = {
            ...payload,
            data: {
              profile: cloud.userProfile ?? payload.data.profile,
              skills: cloud.skills ?? payload.data.skills,
              jobs: cloud.jobs ?? payload.data.jobs,
              focus: cloud.focus ?? payload.data.focus,
              tasks: cloud.tasks ?? payload.data.tasks,
              focusSessions: cloud.focusSessions ?? payload.data.focusSessions,
              goals: cloud.goals ?? payload.data.goals,
              activities: cloud.recentActivities ?? payload.data.activities,
              mapPins: cloud.mapPins ?? payload.data.mapPins,
              mapView: cloud.mapView ?? payload.data.mapView,
              recipes: cloud.recipes ?? payload.data.recipes,
              posts: cloud.posts ?? payload.data.posts,
            },
          }
        }
      } catch {
        // Fallback to in-memory snapshot.
      }
    }

    const safeDate = new Date().toISOString().replace(/[:.]/g, "-")
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `productivity-hub-backup-${safeDate}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const applyBackup = async (backup: BackupV1) => {
    await pushBackupToCloud(backup)
    window.location.reload()
  }

  const handlePickFile = () => fileInputRef.current?.click()

  const handleFileSelected = async (file: File | null) => {
    if (!file) return
    setImportError(null)
    setCloudStatus(null)
    setImporting(true)

    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as BackupV1

      const isSupportedApp = parsed?.app === "MapMonet" || parsed?.app === "Productivity Hub"
      if (!parsed || !isSupportedApp || parsed.version !== 1 || !parsed.data) {
        throw new Error("Invalid backup file (expected Productivity Hub v1 backup).")
      }

      await applyBackup(parsed)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Failed to import backup.")
      setImporting(false)
    }
  }

  const migrateLocalDataToCloud = async () => {
    if (!user?.id) {
      setCloudStatus("Cloud migration requires a signed-in account.")
      return
    }

    setCloudStatus(null)
    setMigrating(true)

    try {
      await pushBackupToCloud(buildLocalBackup())
      setCloudStatus("Data migrated to MongoDB successfully.")
    } catch (e) {
      setCloudStatus(e instanceof Error ? e.message : "Cloud migration failed.")
    } finally {
      setMigrating(false)
    }
  }

  const clearAllData = () => {
    setCloudStatus(null)
    const ok = window.confirm(
      "This will permanently delete all Productivity Hub cloud data for this account. Continue?"
    )
    if (!ok) return

    const run = async () => {
      if (user?.id) {
        try {
          await fetch("/api/dashboard", {
            method: "DELETE",
            credentials: "same-origin",
          })
        } catch {
          // Continue with reload even if cloud delete fails.
        }
      }

      window.location.reload()
    }

    void run()
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
            Export and import backup files, or migrate in-memory data to MongoDB cloud storage.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => void downloadBackup()}>
              <Download className="h-4 w-4 mr-2" /> Download Backup
            </Button>
            <Button variant="outline" onClick={handlePickFile} disabled={importing}>
              <Upload className="h-4 w-4 mr-2" /> Import Backup
            </Button>
            <Button variant="outline" onClick={() => void migrateLocalDataToCloud()} disabled={migrating}>
              <CloudUpload className="h-4 w-4 mr-2" /> {migrating ? "Migrating..." : "Migrate To MongoDB"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => void handleFileSelected(e.target.files?.[0] ?? null)}
            />
          </div>
          {importError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {importError}
            </div>
          )}
          {cloudStatus && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              {cloudStatus}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Your profile name: <span className="font-medium">{userProfile.name}</span> | Top
            priority: <span className="font-medium">{focus || "-"}</span> | Activity items:{" "}
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
            Reset clears MongoDB data for this account.
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
