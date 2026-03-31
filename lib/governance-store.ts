// Governance & E-Voting types and in-memory store for BuildSync

export type VoteType = "E-VOTE" | "MEETING"
export type VoteStatus = "ACTIVE" | "SCHEDULED" | "COMPLETED"

export interface VoteOption {
  id: string
  label: string
  count: number
}

export interface MeetingAgendaItem {
  id: string
  order: number
  item: string
}

export interface Vote {
  id: string
  type: VoteType
  title: string
  description: string
  status: VoteStatus
  deadline: string
  quorum: number // percentage required e.g. 50
  participation: number // current participation %
  options?: VoteOption[] // E-VOTE only
  agenda?: MeetingAgendaItem[] // MEETING only
  createdBy: string // user.id
  createdAt: string // ISO date string
  buildingId?: string
  deletedAt?: string // soft delete
}

export interface VoteCast {
  id: string
  voteId: string
  optionId: string
  voterId: string // user.id (stored but never exposed in results)
  castedAt: string
}

export interface VoteResult {
  optionId: string
  label: string
  count: number
  percentage: number
}

export interface GovernanceAuditEntry {
  id: string
  voteId?: string
  action: string // 'vote_created' | 'vote_cast' | 'vote_closed' | 'vote_deleted'
  performedBy: string // user.id
  timestamp: string
}

export interface GovernanceState {
  votes: Vote[]
  castedVotes: VoteCast[]
  auditLog: GovernanceAuditEntry[]
}

// In-memory fallback stores (for demo mode)
export const voteStore: Vote[] = []
export const castedVoteStore: VoteCast[] = []
export const governanceAuditStore: GovernanceAuditEntry[] = []

// Helper functions

export function calculateParticipation(voteId: string, totalEligible: number): number {
  if (totalEligible === 0) return 0
  const casts = castedVoteStore.filter(c => c.voteId === voteId)
  return Math.round((casts.length / totalEligible) * 100)
}

export function canUserVote(voteId: string, userId: string): boolean {
  return !castedVoteStore.some(c => c.voteId === voteId && c.voterId === userId)
}

export function hasQuorumReached(vote: Vote): boolean {
  return vote.participation >= vote.quorum
}

export function getVoteResults(vote: Vote): VoteResult[] {
  if (!vote.options) return []
  const casts = castedVoteStore.filter(c => c.voteId === vote.id)
  const total = casts.length || 1

  return vote.options.map(opt => ({
    optionId: opt.id,
    label: opt.label,
    count: casts.filter(c => c.optionId === opt.id).length,
    percentage: Math.round((casts.filter(c => c.optionId === opt.id).length / total) * 100),
  }))
}

export function listVotes(filters?: { status?: VoteStatus; type?: VoteType }): Vote[] {
  return voteStore.filter(v => {
    if (filters?.status && v.status !== filters.status) return false
    if (filters?.type && v.type !== filters.type) return false
    if (v.deletedAt) return false // exclude soft-deleted
    return true
  })
}

export function getVoteById(id: string): Vote | undefined {
  return voteStore.find(v => v.id === id && !v.deletedAt)
}

export function addVote(vote: Vote): Vote {
  voteStore.push(vote)
  return vote
}

export function updateVote(id: string, updates: Partial<Vote>): Vote | null {
  const vote = getVoteById(id)
  if (!vote) return null
  const updated = { ...vote, ...updates }
  const index = voteStore.findIndex(v => v.id === id)
  if (index >= 0) voteStore[index] = updated
  return updated
}

export function softDeleteVote(id: string): boolean {
  const vote = getVoteById(id)
  if (!vote) return false
  vote.deletedAt = new Date().toISOString()
  return true
}

export function castVote(voteId: string, optionId: string, voterId: string): VoteCast | null {
  const vote = getVoteById(voteId)
  if (!vote) return null
  if (vote.status !== "ACTIVE") return null
  if (new Date(vote.deadline) < new Date()) return null
  if (!canUserVote(voteId, voterId)) return null

  const cast: VoteCast = {
    id: crypto.randomUUID(),
    voteId,
    optionId,
    voterId,
    castedAt: new Date().toISOString(),
  }

  castedVoteStore.push(cast)

  // Update option count in vote
  if (vote.options) {
    const option = vote.options.find(o => o.id === optionId)
    if (option) option.count++
  }

  // Update participation
  vote.participation = calculateParticipation(voteId, 100) // TODO: pass actual eligible count

  return cast
}

export function logGovernanceAudit(
  action: string,
  performedBy: string,
  voteId?: string
): GovernanceAuditEntry {
  const entry: GovernanceAuditEntry = {
    id: crypto.randomUUID(),
    action,
    performedBy,
    voteId,
    timestamp: new Date().toISOString(),
  }
  governanceAuditStore.push(entry)
  return entry
}
