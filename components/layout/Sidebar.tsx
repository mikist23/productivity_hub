"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { navItems } from "@/components/layout/nav-items"
import { useAuth } from "@/components/auth/AuthProvider"
import { BuyMeCoffeeButton } from "@/components/common/BuyMeCoffeeButton"
import { AppLogo } from "@/components/common/AppLogo"

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden w-64 border-r border-border/50 bg-background/80 backdrop-blur-xl lg:flex flex-col h-screen sticky top-0"
    >
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <AppLogo size="sm" />
          <span>Productivity Hub</span>
        </div>
      </div>
      <nav className="space-y-1 p-4 overflow-y-auto">
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
      </nav>

      <div className="mt-auto p-4 border-t border-border/50 space-y-2">
        <BuyMeCoffeeButton
          variant="outline"
          size="sm"
          className="w-full justify-start"
        />
        <button
          onClick={logout}
          className="relative group block w-full"
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
      </div>
    </motion.aside>
  )
}
