"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (user) return
    router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [pathname, router, user])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
        Redirecting…
      </div>
    )
  }

  return <>{children}</>
}

