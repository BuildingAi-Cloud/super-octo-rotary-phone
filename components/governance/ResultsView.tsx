"use client"

import { Vote } from "@/lib/governance-store"
import { getVoteResults as getVoteResultsHelper } from "@/lib/governance-store"

interface ResultsViewProps {
  vote: Vote
}

export function ResultsView({ vote }: ResultsViewProps) {
  const results = getVoteResultsHelper(vote)
  const totalVotes = results.reduce((sum, r) => sum + r.count, 0)
  const quorumReached = vote.participation >= vote.quorum

  if (!results.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No votes have been cast yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-background">
          <div className="text-3xl font-bold text-orange-600">{totalVotes}</div>
          <div className="text-sm text-muted-foreground">Total Votes</div>
        </div>
        <div className="border rounded-lg p-4 bg-background">
          <div className={`text-3xl font-bold ${quorumReached ? "text-green-600" : "text-amber-600"}`}>
            {vote.participation}%
          </div>
          <div className="text-sm text-muted-foreground">Participation</div>
        </div>
      </div>

      {/* Quorum Status */}
      <div className={`border rounded-lg p-4 ${quorumReached ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
        <div className={`text-sm font-semibold ${quorumReached ? "text-green-900" : "text-amber-900"}`}>
          {quorumReached ? "✓ Quorum Reached" : "◯ Quorum Not Reached"}
        </div>
        <div className={`text-xs mt-1 ${quorumReached ? "text-green-700" : "text-amber-700"}`}>
          {vote.participation}% of {vote.quorum}% required
        </div>
      </div>

      {/* Results Bars */}
      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.optionId}>
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-foreground">{result.label}</label>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-orange-600">{result.count}</span>
                <span className="text-sm text-muted-foreground">({result.percentage}%)</span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{
                  width: `${Math.max(result.percentage, 3)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <p className="text-xs text-muted-foreground border-t pt-4">
        Individual voter information is not displayed to protect privacy.
      </p>
    </div>
  )
}
