"use client"

import { useState } from "react"
import { Vote, canUserVote } from "@/lib/governance-store"
import { VoteBadge } from "./VoteBadge"
import { VoteTypeBadge } from "./VoteTypeBadge"
import { ResultsView } from "./ResultsView"
import { MeetingView } from "./MeetingView"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { formatDeadline, isDeadlinePassed } from "@/lib/governance"

interface VoteDetailProps {
  vote: Vote
  userId?: string
  userRole?: string
  onClose?: () => void
}

export function VoteDetail({ vote, userId, userRole, onClose }: VoteDetailProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  const canVote = userRole && ["resident", "tenant", "building_owner"].includes(userRole)
  const canCast = vote.status === "ACTIVE" && !isDeadlinePassed(vote.deadline) && userId && canVote
  const alreadyVoted = userId ? !canUserVote(vote.id, userId) : false
  const showResults = vote.status === "COMPLETED" || userRole === "admin"

  const handleCastVote = async () => {
    if (!selectedOptionId || !userId) {
      toast.error("Please select an option")
      return
    }

    setIsVoting(true)
    try {
      const response = await fetch(`/api/governance/${vote.id}/cast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId: selectedOptionId,
          voterId: userId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || "Failed to cast vote")
        return
      }

      toast.success("Your vote has been recorded!")
      setSelectedOptionId(null)
      onClose?.()
    } catch {
      toast.error("Error casting vote")
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <VoteTypeBadge type={vote.type} />
              <VoteBadge status={vote.status} />
            </div>
            <CardTitle className="text-2xl">{vote.title}</CardTitle>
            <CardDescription className="text-base mt-2">{vote.description}</CardDescription>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Deadline & Participation */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-muted-foreground">Deadline</label>
            <p className="font-mono text-foreground">{formatDeadline(vote.deadline)}</p>
          </div>
          <div>
            <label className="text-muted-foreground">Participation</label>
            <p className="font-mono text-orange-600">{vote.participation}% / {vote.quorum}% quorum</p>
          </div>
        </div>

        {/* Ballot Voting Area (E-VOTE only) */}
        {vote.type === "E-VOTE" && canCast && !alreadyVoted && !showResults && (
          <div className="space-y-3 border-t pt-4 border-orange-200">
            <h4 className="font-semibold text-foreground">Cast Your Vote</h4>
            {vote.options?.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOptionId(option.id)}
                className={`w-full p-4 border rounded-lg text-left transition-colors ${
                  selectedOptionId === option.id
                    ? "bg-orange-50 border-orange-500 border-2"
                    : "border-border hover:border-orange-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-colors ${
                      selectedOptionId === option.id
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-400 bg-white"
                    }`}
                  />
                  <span className="font-medium text-foreground">{option.label}</span>
                </div>
              </button>
            ))}
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              disabled={!selectedOptionId || isVoting}
              onClick={handleCastVote}
            >
              {isVoting ? "Recording..." : "Submit Vote"}
            </Button>
          </div>
        )}

        {/* Already Voted Notice */}
        {alreadyVoted && vote.type === "E-VOTE" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900">✓ You have already voted on this proposal.</p>
          </div>
        )}

        {/* Results Display */}
        {vote.type === "E-VOTE" && showResults && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-foreground mb-4">Results</h4>
            <ResultsView vote={vote} />
          </div>
        )}

        {/* Meeting Agenda Display */}
        {vote.type === "MEETING" && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-foreground mb-4">Agenda</h4>
            <MeetingView vote={vote} />
          </div>
        )}

        {/* Status Messages */}
        {vote.status === "SCHEDULED" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              ◯ Voting has not started yet. Deadline is {formatDeadline(vote.deadline)}.
            </p>
          </div>
        )}

        {vote.status === "COMPLETED" && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-900">
              ✓ Voting has closed. Results shown above.
            </p>
          </div>
        )}

        {isDeadlinePassed(vote.deadline) && vote.status === "ACTIVE" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-900">
              ✕ Voting deadline has passed.
            </p>
          </div>
        )}

        {/* No Permission */}
        {!canVote && vote.status === "ACTIVE" && !showResults && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-900">
              You do not have permission to vote on this proposal.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
