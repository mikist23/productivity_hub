"use client"

import { useRouter } from "next/navigation"
import { HeartHandshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { hasAnyDonationMethodEnabled } from "@/lib/donations"

type SupportButtonProps = {
  variant?: "primary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg" | "icon"
  className?: string
  label?: string
  onClick?: () => void
}

export function SupportButton({
  variant = "outline",
  size = "md",
  className,
  label = "Support",
  onClick,
}: SupportButtonProps) {
  const router = useRouter()
  if (!hasAnyDonationMethodEnabled()) return null

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        onClick?.()
        router.push("/support")
      }}
    >
      <HeartHandshake className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
