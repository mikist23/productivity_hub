export type AssistantFeatureGuide = {
  id: string
  label: string
  route: string
  description: string
  quickSteps: string[]
}

export const assistantFeatureGuides: AssistantFeatureGuide[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/dashboard",
    description: "Daily overview with focus, active goals, and quick actions.",
    quickSteps: [
      "Open Dashboard from the sidebar.",
      "Set Today's Focus in the hero input.",
      "Use quick action cards to jump into tasks, timer, goals, and analytics.",
    ],
  },
  {
    id: "goals",
    label: "Goals",
    route: "/dashboard/goals",
    description: "Create, organize, and track goal progress with roadmap steps and statuses.",
    quickSteps: [
      "Open Goals from the sidebar.",
      "Create a goal with title, category, and target date.",
      "Update progress, status, roadmap items, and daily targets.",
    ],
  },
  {
    id: "time",
    label: "Time Tracking",
    route: "/dashboard/time",
    description: "Run focus sessions, log minutes, and link sessions to goals.",
    quickSteps: [
      "Open Time Tracking.",
      "Select a goal and start the timer.",
      "Log session minutes to update analytics and goal progress.",
    ],
  },
  {
    id: "skills",
    label: "Skills",
    route: "/dashboard/skills",
    description: "Track learning progress by category and skill status.",
    quickSteps: [
      "Open Skills.",
      "Add a skill under a category.",
      "Update level, progress, or status as you improve.",
    ],
  },
  {
    id: "jobs",
    label: "Jobs",
    route: "/dashboard/jobs",
    description: "Manage job applications and status through your pipeline.",
    quickSteps: [
      "Open Jobs.",
      "Add application details (role, company, status, dates).",
      "Update status as applications move from applied to interview/offer.",
    ],
  },
  {
    id: "tech",
    label: "Tech Intelligence",
    route: "/dashboard/tech",
    description: "Review curated trends, stories, and opportunity links.",
    quickSteps: [
      "Open Tech.",
      "Filter by category, source type, or search query.",
      "Open stories, docs, and opportunity platforms.",
    ],
  },
  {
    id: "recipes",
    label: "Recipes",
    route: "/dashboard/recipes",
    description: "Save and manage recipe content for your personal library.",
    quickSteps: [
      "Open Recipes.",
      "Create a recipe with ingredients and steps.",
      "Edit or remove entries as needed.",
    ],
  },
  {
    id: "map",
    label: "Map",
    route: "/dashboard/map",
    description: "Pin important locations related to goals, tasks, and work.",
    quickSteps: [
      "Open Map.",
      "Add a pin with title, note, and category.",
      "Update or remove pins from the map.",
    ],
  },
  {
    id: "blog",
    label: "Blog",
    route: "/dashboard/blog",
    description: "Write and manage long-form posts.",
    quickSteps: [
      "Open Blog.",
      "Create a post with title and content.",
      "Edit or delete posts over time.",
    ],
  },
  {
    id: "stories",
    label: "Stories",
    route: "/dashboard/stories",
    description: "Capture short-form story entries.",
    quickSteps: [
      "Open Stories.",
      "Create a story entry.",
      "Review and manage your existing stories.",
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    route: "/dashboard/analytics",
    description: "Review streaks, progress metrics, and productivity trends.",
    quickSteps: [
      "Open Analytics.",
      "Inspect streak and time charts.",
      "Use metrics to adjust your weekly plan.",
    ],
  },
  {
    id: "profile",
    label: "Profile",
    route: "/dashboard/profile",
    description: "Manage personal and professional profile details.",
    quickSteps: [
      "Open Profile.",
      "Update identity and contact details.",
      "Keep links and focus areas current.",
    ],
  },
  {
    id: "settings",
    label: "Settings",
    route: "/dashboard/settings",
    description: "Backup/import dashboard data and manage local configuration tasks.",
    quickSteps: [
      "Open Settings.",
      "Export dashboard data for backup.",
      "Import backup data when needed.",
    ],
  },
  {
    id: "support",
    label: "Support",
    route: "/support",
    description: "Access donation and support options when configured.",
    quickSteps: [
      "Open Support.",
      "Choose an available payment method.",
      "Complete donation using hosted links or configured flows.",
    ],
  },
]

export const assistantCapabilityPolicy = {
  canDo: [
    "Explain existing app features and where to find them.",
    "Give concise step-by-step navigation guidance.",
    "Suggest the closest valid page when a request is unclear.",
  ],
  cannotDo: [
    "Perform actions in the app on behalf of the user.",
    "Invent features, routes, or settings that do not exist.",
    "Provide private account data that was not shared in chat.",
  ],
}
