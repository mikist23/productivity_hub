"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { navItems } from "@/components/layout/nav-items"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden w-64 border-r border-border/50 bg-background/80 backdrop-blur-xl lg:block h-screen sticky top-0"
    >
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            P
          </div>
          <span>Productivity Hub</span>
        </div>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group block"
            >
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors z-10 relative",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              
              {isActive ? (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 bg-primary rounded-md"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              ) : (
                 <div className="absolute inset-0 bg-accent/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          )
        })}
        
        {/* Sign Out - Positioned after Settings */}
        <button
          onClick={logout}
          className="relative group block w-full mt-2"
        >
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors z-10 relative",
              "text-muted-foreground hover:text-destructive"
            )}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </div>
          <div className="absolute inset-0 bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </nav>
      
      {user && (
        <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-accent/50 border border-border/50">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Productivity Score</h4>
          <div className="flex items-end gap-2 text-2xl font-bold">
            87 <span className="text-sm font-normal text-muted-foreground pb-1">/ 100</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-background rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[87%]" />
          </div>
          <div className="mt-4 pt-4 border-t border-border/60 space-y-1">
            <div className="text-xs text-muted-foreground">Signed in as</div>
            <div className="text-sm font-semibold truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>
        </div>
      )}
    </motion.aside>
  )
}
