"use client"

import { Vote } from "@/lib/governance-store"
import { VoteBadge } from "./VoteBadge"
import { VoteTypeBadge } from "./VoteTypeBadge"
import { formatDeadline, getTimeRemaining } from "@/lib/governance"
import { cn } from "@/lib/utils"

interface VoteCardProps {
  vote: Vote
  onClick?: (vote: Vote) => void
  isSelected?: boolean
}

export function VoteCard({ vote, onClick, isSelected }: VoteCardProps) {
  return (
    <button
      onClick={() => onClick?.(vote)}
      className={cn(
        "w-full px-4 py-4 border rounded-lg text-left transition-colors duration-150",
        "hover:bg-accent/5 hover:border-accent",
        isSelected && "bg-accent/10 border-accent",
        !isSelected && "border-border bg-background"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <VoteTypeBadge type={vote.type} />
            <VoteBadge status={vote.status} />
          </div>

          <h3 className="font-semibold text-foreground truncate">{vote.title}</h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {vote.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>Deadline: {formatDeadline(vote.deadline)}</span>
            <span className="font-mono text-orange-600">{getTimeRemaining(vote.deadline)}</span>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="text-2xl font-bold text-orange-600">{vote.participation}%</div>
          <div className="text-xs text-muted-foreground">participation</div>
          <div className="mt-2 text-xs">
            <span className={vote.participation >= vote.quorum ? "text-green-600" : "text-amber-600"}>
              {vote.participation >= vote.quorum ? "✓" : "◯"} {vote.quorum}% quorum
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
