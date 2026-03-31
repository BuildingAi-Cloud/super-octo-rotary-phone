"use client"

import { cn } from "@/lib/utils"
import type { VoteType } from "@/lib/governance-store"

const typeStyles: Record<VoteType, string> = {
  "E-VOTE": "text-orange-700 bg-orange-50 border-orange-300",
  MEETING: "text-blue-700 bg-blue-50 border-blue-300",
}

export default function VoteTypeBadge({ type }: { type: VoteType }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 border font-mono text-[10px] uppercase tracking-widest",
        typeStyles[type] || typeStyles["E-VOTE"],
      )}
    >
      {type}
    </span>
  )
}
