"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { logAudit } from "@/lib/audit"
import { canCreateVote } from "@/lib/governance"
import type { Vote } from "@/lib/governance-store"
import VoteCard from "./VoteCard"
import VoteForm from "./VoteForm"
import VoteDetail from "./VoteDetail"

export default function GovernancePanel() {
  const { user } = useAuth()
  const [votes, setVotes] = useState<Vote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/governance", { cache: "no-store" })
        const data = (await res.json()) as Vote[]
        setVotes(Array.isArray(data) ? data : [])
      } catch {
        setVotes([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  function handleCreated(vote: Vote) {
    setVotes((prev) => [vote, ...prev])
    setShowForm(false)
    logAudit("vote_created", { voteId: vote.id, title: vote.title }, user?.id || null)
  }

  function handleUpdated(updated: Vote) {
    setVotes((prev) =>
      prev.map((v) => (v.id === updated.id ? { ...v, ...updated } : v)),
    )
    setSelectedVote(updated)
    logAudit("vote_updated", { voteId: updated.id, status: updated.status }, user?.id || null)
  }

  if (!user) return null

  // Detail view
  if (selectedVote) {
    return (
      <div className="border border-border/40 bg-card/30 p-6">
        <VoteDetail
          vote={selectedVote}
          userId={user.id}
          userRole={user.role}
          onBack={() => setSelectedVote(null)}
          onUpdated={handleUpdated}
        />
      </div>
    )
  }

  return (
    <div className="border border-border/40 bg-card/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">GOVERNANCE & E-VOTING</h2>
        {canCreateVote(user.role) && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-3 py-1 border border-orange-500 bg-orange-500/10 font-mono text-[10px] uppercase tracking-widest text-orange-600 hover:bg-orange-500/20 transition-colors"
          >
            + New Vote
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-6">
          <VoteForm
            userId={user.id}
            userRole={user.role}
            onCreated={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <p className="font-mono text-xs text-muted-foreground">Loading votes…</p>
      )}

      {/* Vote list */}
      {!isLoading && votes.length === 0 && !showForm && (
        <p className="font-mono text-xs text-muted-foreground">No governance items yet.</p>
      )}

      {!isLoading && votes.length > 0 && (
        <div className="space-y-3">
          {votes.map((vote) => (
            <VoteCard
              key={vote.id}
              vote={vote}
              onSelect={(v) => setSelectedVote(v)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
