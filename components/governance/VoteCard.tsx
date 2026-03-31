"use client"

import type { Vote } from "@/lib/governance-store"
import VoteBadge from "./VoteBadge"
import VoteTypeBadge from "./VoteTypeBadge"

interface VoteCardProps {
  vote: Vote
  onSelect: (vote: Vote) => void
}

export default function VoteCard({ vote, onSelect }: VoteCardProps) {
  const deadlineLabel =
    vote.status === "COMPLETED"
      ? "Closed"
      : new Date(vote.deadline).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })

  return (
    <button
      type="button"
      onClick={() => onSelect(vote)}
      className="w-full text-left flex items-center justify-between border border-border/30 p-4 hover:border-orange-500/40 transition-colors"
    >
      <div className="flex items-center gap-4">
        <VoteTypeBadge type={vote.type} />
        <div>
          <p className="font-mono text-xs text-foreground">{vote.title}</p>
          <p className="font-mono text-[10px] text-muted-foreground">
            {vote.participation > 0 && `${vote.participation}% participation · `}
            Deadline: {deadlineLabel}
          </p>
        </div>
      </div>
      <VoteBadge status={vote.status} />
    </button>
  )
}
