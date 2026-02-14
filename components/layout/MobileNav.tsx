"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { navItems } from "@/components/layout/nav-items"
import { useAuth } from "@/components/auth/AuthProvider"
import { BuyMeCoffeeButton } from "@/components/common/BuyMeCoffeeButton"
import { AppLogo } from "@/components/common/AppLogo"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <AppLogo size="sm" />
            <span>Productivity Hub</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.aside
              className="fixed inset-y-0 left-0 z-[100] w-[280px] border-r border-border bg-background shadow-xl flex flex-col"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-border/50">
                <div className="font-bold tracking-tight">Menu</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="space-y-1 p-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-auto p-3 border-t border-border/50">
                <div className="text-xs text-muted-foreground">Signed in as</div>
                <div className="text-sm font-semibold truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                <BuyMeCoffeeButton
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setOpen(false)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
