"use client"

import { cn } from "@/lib/utils"
import { getStatusBadgeColor, formatVoteStatus } from "@/lib/governance"

interface VoteBadgeProps {
  status: string
  className?: string
}

export function VoteBadge({ status, className }: VoteBadgeProps) {
  const color = getStatusBadgeColor(status)

  const baseClasses =
    "inline-flex items-center px-3 py-1.5 rounded-full border font-mono text-xs uppercase tracking-wider"

  const colorClasses = {
    green: "text-green-700 bg-green-50 border-green-300",
    amber: "text-amber-700 bg-amber-50 border-amber-300",
    gray: "text-gray-600 bg-gray-100 border-gray-300",
  }

  return (
    <span className={cn(baseClasses, colorClasses[color], className)}>
      {formatVoteStatus(status)}
    </span>
  )
}
