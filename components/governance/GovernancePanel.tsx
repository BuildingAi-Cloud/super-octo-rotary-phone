"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Vote } from "@/lib/governance-store"
import { VoteCard } from "./VoteCard"
import { VoteDetail } from "./VoteDetail"
import { VoteForm } from "./VoteForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { getRolePermissions } from "@/lib/governance"

type ViewMode = "list" | "detail" | "create"

export default function GovernancePanel() {
  const { user } = useAuth()
  const [votes, setVotes] = useState<Vote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  const permissions = user ? getRolePermissions(user.role) : { canCreate: false, canCast: false, canManage: false, canView: false }

  useEffect(() => {
    async function loadVotes() {
      try {
        const response = await fetch("/api/governance", { cache: "no-store" })
        if (!response.ok) {
          setVotes([])
          return
        }
        const data = await response.json()
        setVotes(Array.isArray(data.votes) ? data.votes : [])
      } catch {
        setVotes([]) // Fallback to empty
      } finally {
        setIsLoading(false)
      }
    }

    void loadVotes()
  }, [])

  const filteredVotes = votes.filter((vote) => {
    if (filterStatus !== "ALL" && vote.status !== filterStatus) return false
    if (searchQuery && !vote.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleVoteSelect = (vote: Vote) => {
    setSelectedVote(vote)
    setViewMode("detail")
  }

  const handleCreateClick = () => {
    if (!permissions.canCreate) {
      toast.error("You do not have permission to create votes")
      return
    }
    setViewMode("create")
  }

  const handleFormSuccess = async () => {
    // Reload votes
    try {
      const response = await fetch("/api/governance", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        setVotes(Array.isArray(data.votes) ? data.votes : [])
      }
    } catch {
      // Silent fail
    }
    setViewMode("list")
  }

  if (viewMode === "create") {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setViewMode("list")}>
          ← Back to Votes
        </Button>
        <VoteForm userId={user?.id || ""} onSuccess={handleFormSuccess} onCancel={() => setViewMode("list")} />
      </div>
    )
  }

  if (viewMode === "detail" && selectedVote) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setViewMode("list")}>
          ← Back to Votes
        </Button>
        <VoteDetail
          vote={selectedVote}
          userId={user?.id}
          userRole={user?.role}
          onClose={() => setViewMode("list")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Governance & Voting</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage proposals and meetings</p>
        </div>
        {permissions.canCreate && (
          <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleCreateClick}>
            + New Vote
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search votes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading votes...</p>
        </Card>
      ) : filteredVotes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No votes found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredVotes.map((vote) => (
            <VoteCard
              key={vote.id}
              vote={vote}
              onClick={handleVoteSelect}
              isSelected={selectedVote?.id === vote.id}
            />
          ))}
        </div>
      )}

      {/* Info */}
      {votes.length === 0 && !isLoading && (
        <Card className="bg-blue-50 border-blue-200 p-6">
          <p className="text-sm text-blue-900">
            {permissions.canCreate
              ? "No votes yet. Create one to get started!"
              : "Check back soon for voting opportunities."}
          </p>
        </Card>
      )}
    </div>
  )
}
