import { Sidebar } from "@/components/layout/Sidebar"
import { DashboardProvider } from "./providers"
import { MobileNav } from "@/components/layout/MobileNav"
import { DemoModeBanner } from "@/components/dashboard/DemoModeBanner"
import { AssistantWidget } from "@/components/assistant/AssistantWidget"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <MobileNav />
        <DemoModeBanner />
        <div className="mx-auto max-w-7xl p-6 md:p-8">
          <DashboardProvider>{children}</DashboardProvider>
        </div>
        <AssistantWidget />
      </main>
    </div>
  )
}
