"use client"

import * as React from "react"
import { Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getBuyMeCoffeeUrl } from "@/lib/support"

type BuyMeCoffeeButtonProps = {
  variant?: "primary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg" | "icon"
  className?: string
  showIcon?: boolean
  label?: string
  onClick?: () => void
}

export function BuyMeCoffeeButton({
  variant = "outline",
  size = "md",
  className,
  showIcon = true,
  label = "Buy me a coffee",
  onClick,
}: BuyMeCoffeeButtonProps) {
  const coffeeUrl = getBuyMeCoffeeUrl()
  if (!coffeeUrl) return null

  const isIconOnly = size === "icon"
  const buttonLabel = isIconOnly ? "Support GoalPilot on Buy Me a Coffee" : label

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      aria-label={buttonLabel}
      title={buttonLabel}
      onClick={() => {
        onClick?.()
        window.open(coffeeUrl, "_blank", "noopener,noreferrer")
      }}
    >
      {showIcon ? <Coffee className={isIconOnly ? "h-4 w-4" : "h-4 w-4 mr-2"} /> : null}
      {isIconOnly ? null : label}
    </Button>
  )
}

