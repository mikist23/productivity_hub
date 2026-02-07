import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMinutes(minutes: number) {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs <= 0) return `${mins}m`
  if (mins <= 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}
