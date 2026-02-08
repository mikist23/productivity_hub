import {
  BarChart3,
  Briefcase,
  BookOpen,
  BookText,
  CheckSquare,
  Clock,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Map,
  Newspaper,
  Settings,
  Sparkles,
  User,
} from "lucide-react"

export const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: CheckSquare, label: "Goals", href: "/dashboard/goals" },
  { icon: Clock, label: "Time Tracking", href: "/dashboard/time" },
  { icon: GraduationCap, label: "Skills", href: "/dashboard/skills" },
  { icon: Briefcase, label: "Jobs", href: "/dashboard/jobs" },
  { icon: BookOpen, label: "Recipes", href: "/dashboard/recipes" },
  { icon: Map, label: "Map", href: "/dashboard/map" },
  { icon: Newspaper, label: "Blog", href: "/dashboard/blog" },
  { icon: BookText, label: "Stories", href: "/dashboard/stories" },
  { icon: Sparkles, label: "Tech", href: "/dashboard/tech" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
] as const

export const authNavItem = { 
  icon: LogOut, 
  label: "Sign out", 
  href: "#signout",
  isSignOut: true 
} as const
