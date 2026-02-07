import { Sidebar } from "@/components/layout/Sidebar"
import { DashboardProvider } from "./providers"
import { MobileNav } from "@/components/layout/MobileNav"
import { AuthGate } from "@/components/auth/AuthGate"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGate>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <MobileNav />
          <div className="mx-auto max-w-7xl p-6 md:p-8">
            <DashboardProvider>{children}</DashboardProvider>
          </div>
        </main>
      </div>
    </AuthGate>
  )
}
