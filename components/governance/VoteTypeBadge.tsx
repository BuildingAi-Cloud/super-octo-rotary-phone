"use client"

import { cn } from "@/lib/utils"
import { getTypeBadgeColor, formatVoteType } from "@/lib/governance"

interface VoteTypeBadgeProps {
  type: string
  className?: string
}

export function VoteTypeBadge({ type, className }: VoteTypeBadgeProps) {
  const color = getTypeBadgeColor(type)

  const baseClasses =
    "inline-flex items-center px-3 py-1.5 rounded-full border font-mono text-xs uppercase tracking-wider"

  const colorClasses = {
    orange: "text-orange-700 bg-orange-50 border-orange-300",
    blue: "text-blue-700 bg-blue-50 border-blue-300",
  }

  return (
    <span className={cn(baseClasses, colorClasses[color], className)}>
      {formatVoteType(type)}
    </span>
  )
}
