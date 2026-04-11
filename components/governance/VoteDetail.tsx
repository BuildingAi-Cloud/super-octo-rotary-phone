"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Vote } from "@/lib/governance-store"
import { canCastVote, canManageVote, canViewResults, isVoteExpired } from "@/lib/governance"
import VoteBadge from "./VoteBadge"
import VoteTypeBadge from "./VoteTypeBadge"
import ResultsView from "./ResultsView"
import MeetingView from "./MeetingView"

interface VoteResultRow {
  optionId: string
  label: string
  count: number
  percentage: number
}

interface VoteDetailProps {
  vote: Vote
  userId: string
  userRole: string
  onBack: () => void
  onUpdated: (vote: Vote) => void
}

export default function VoteDetail({ vote, userId, userRole, onBack, onUpdated }: VoteDetailProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCasting, setIsCasting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [results, setResults] = useState<VoteResultRow[] | null>(null)
  const [nonBinding, setNonBinding] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const showBallot =
    vote.type === "E-VOTE" &&
    vote.status === "ACTIVE" &&
    !isVoteExpired(vote.deadline) &&
    canCastVote(userRole) &&
    !hasVoted

  const showResults = vote.status === "COMPLETED" && canViewResults(vote)
  const showMeeting = vote.type === "MEETING"
  const showManage = canManageVote(userRole) && vote.status !== "COMPLETED"

  // Fetch results for completed votes
  useEffect(() => {
    if (!showResults) return

    async function loadResults() {
      try {
        const res = await fetch(`/api/governance/${vote.id}/results`, { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { results: VoteResultRow[]; nonBinding: boolean }
        setResults(data.results)
        setNonBinding(data.nonBinding)
      } catch {
        // Silent fallback
      }
    }
    loadResults()
  }, [vote.id, showResults])

  // Check if user has already voted
  useEffect(() => {
    if (vote.type !== "E-VOTE" || vote.status !== "ACTIVE" || !canCastVote(userRole)) return

    async function checkVoted() {
      try {
        const res = await fetch(`/api/governance/${vote.id}/cast?voterId=${encodeURIComponent(userId)}`, { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { voted: boolean }
        if (data.voted) setHasVoted(true)
      } catch {
        // Silent fallback
      }
    }
    checkVoted()
  }, [vote.id, vote.type, vote.status, userId, userRole])

  async function handleCast() {
    if (!selectedOption) {
      toast.error("Please select an option.")
      return
    }
    setIsCasting(true)
    try {
      const res = await fetch(`/api/governance/${vote.id}/cast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId: selectedOption,
          voterId: userId,
          role: userRole,
        }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { message?: string }
        toast.error(err.message || "Failed to cast vote.")
        return
      }

      toast.success("Your vote has been recorded.")
      setHasVoted(true)
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsCasting(false)
    }
  }

  async function handleClose() {
    setIsClosing(true)
    try {
      const res = await fetch(`/api/governance/${vote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          role: userRole,
          performedBy: userId,
        }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { message?: string }
        toast.error(err.message || "Failed to close vote.")
        return
      }

      const updated = (await res.json()) as Vote
      toast.success("Vote has been closed.")
      onUpdated({ ...vote, ...updated, status: "COMPLETED" })
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-[10px] uppercase tracking-widest text-orange-600 hover:underline mb-4 inline-block"
        >
          ← Back to list
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-[var(--font-bebas)] text-2xl tracking-wide">{vote.title}</h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{vote.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <VoteTypeBadge type={vote.type} />
            <VoteBadge status={vote.status} />
          </div>
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap gap-4">
          <span className="font-mono text-[10px] text-muted-foreground">
            Deadline: {new Date(vote.deadline).toLocaleDateString()}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            Quorum: {vote.quorum}%
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            Participation: {vote.participation}%
          </span>
        </div>
      </div>

      {/* MEETING agenda */}
      {showMeeting && vote.agenda && vote.agenda.length > 0 && (
        <MeetingView agenda={vote.agenda} deadline={vote.deadline} title={vote.title} />
      )}

      {/* E-VOTE ballot */}
      {showBallot && vote.options && (
        <div className="space-y-4">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Cast your vote
          </h4>

          {/* Vote option buttons — Yes / Abstain / No */}
          <div className="grid grid-cols-3 gap-3">
            {vote.options.map((option) => {
              const label = option.label.trim().toUpperCase()
              const isYes = label === "YES"
              const isNo = label === "NO"
              const isAbstain = label === "ABSTAIN"
              const isSelected = selectedOption === option.id

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOption(option.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 border-2 p-4 font-mono text-sm uppercase tracking-widest transition-all",
                    "cursor-pointer hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    // Selected states
                    isSelected && isYes && "border-green-600 bg-green-100 text-green-800 shadow-md ring-2 ring-green-400/30",
                    isSelected && isNo && "border-red-600 bg-red-100 text-red-800 shadow-md ring-2 ring-red-400/30",
                    isSelected && isAbstain && "border-gray-600 bg-gray-200 text-gray-800 shadow-md ring-2 ring-gray-400/30",
                    isSelected && !isYes && !isNo && !isAbstain && "border-orange-600 bg-orange-100 text-orange-800 shadow-md ring-2 ring-orange-400/30",
                    // Default (unselected) states
                    !isSelected && isYes && "border-green-300 bg-green-50/50 text-green-700 hover:border-green-500 hover:bg-green-50",
                    !isSelected && isNo && "border-red-300 bg-red-50/50 text-red-700 hover:border-red-500 hover:bg-red-50",
                    !isSelected && isAbstain && "border-gray-300 bg-gray-50/50 text-gray-600 hover:border-gray-500 hover:bg-gray-100",
                    !isSelected && !isYes && !isNo && !isAbstain && "border-orange-300 bg-orange-50/50 text-orange-700 hover:border-orange-500 hover:bg-orange-50",
                  )}
                >
                  {/* Icon */}
                  <span className="text-2xl leading-none">
                    {isYes && "✓"}
                    {isNo && "✗"}
                    {isAbstain && "—"}
                    {!isYes && !isNo && !isAbstain && "●"}
                  </span>
                  <span className="text-xs font-bold">{option.label}</span>
                  {isSelected && (
                    <span className="text-[9px] font-normal normal-case tracking-normal opacity-70">
                      Selected
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Confirm submit */}
          <Button
            onClick={handleCast}
            disabled={!selectedOption || isCasting}
            className={cn(
              "w-full text-white font-mono text-xs uppercase tracking-widest",
              selectedOption
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-gray-400 cursor-not-allowed",
            )}
          >
            {isCasting ? "Submitting…" : selectedOption ? "Confirm & Submit Vote" : "Select an option above"}
          </Button>
        </div>
      )}

      {/* Already voted notice */}
      {hasVoted && (
        <div className="border border-green-300 bg-green-50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-green-700">
            Your vote has been recorded. Thank you for participating.
          </p>
        </div>
      )}

      {/* Results */}
      {showResults && results && (
        <ResultsView
          results={results}
          nonBinding={nonBinding}
          participation={vote.participation}
          quorum={vote.quorum}
        />
      )}

      {/* Manage actions */}
      {showManage && (
        <div className="flex gap-3 pt-4 border-t border-border/20">
          {vote.status === "SCHEDULED" && (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/governance/${vote.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      status: "ACTIVE",
                      role: userRole,
                      performedBy: userId,
                    }),
                  })
                  if (res.ok) {
                    const updated = (await res.json()) as Vote
                    toast.success("Vote is now active.")
                    onUpdated({ ...vote, ...updated, status: "ACTIVE" })
                  }
                } catch {
                  toast.error("Failed to activate vote.")
                }
              }}
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              Activate
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isClosing}
            className="border-gray-500 text-gray-700 hover:bg-gray-50"
          >
            {isClosing ? "Closing…" : "Close Vote"}
          </Button>
        </div>
      )}
    </div>
  )
}
