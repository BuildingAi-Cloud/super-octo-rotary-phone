"use client"

import { cn } from "@/lib/utils"
import type { VoteStatus } from "@/lib/governance-store"

const statusStyles: Record<VoteStatus, string> = {
  ACTIVE: "text-green-700 bg-green-50 border-green-300",
  SCHEDULED: "text-amber-700 bg-amber-50 border-amber-300",
  COMPLETED: "text-gray-500 bg-gray-100 border-gray-300",
}

export default function VoteBadge({ status }: { status: VoteStatus }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 border font-mono text-[10px] uppercase tracking-widest",
        statusStyles[status] || statusStyles.SCHEDULED,
      )}
    >
      {status}
    </span>
  )
}
