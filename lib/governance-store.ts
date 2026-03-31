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
  quorum: number
  participation: number
  options?: VoteOption[]
  agenda?: MeetingAgendaItem[]
  createdBy: string
  createdAt: string
  buildingId?: string
  deletedAt?: string | null
}

export interface VoteCast {
  id: string
  voteId: string
  optionId: string
  voterId: string
  castedAt: string
}

export interface VoteResult {
  optionId: string
  label: string
  count: number
  percentage: number
}

export interface GovernanceState {
  votes: Vote[]
  castedVotes: VoteCast[]
}

const governanceState: GovernanceState = {
  votes: [],
  castedVotes: [],
}

const GOVERNANCE_STORAGE_KEY = "buildsync_governance_store"

function cloneState(state: GovernanceState): GovernanceState {
  return {
    votes: state.votes.map(vote => ({
      ...vote,
      options: vote.options ? vote.options.map(option => ({ ...option })) : undefined,
      agenda: vote.agenda ? vote.agenda.map(item => ({ ...item })) : undefined,
    })),
    castedVotes: state.castedVotes.map(cast => ({ ...cast })),
  }
}

function persistState(state: GovernanceState) {
  if (typeof window === "undefined") return
  localStorage.setItem(GOVERNANCE_STORAGE_KEY, JSON.stringify(state))
}

function hydrateStateFromLocalStorage() {
  if (typeof window === "undefined") return

  const raw = localStorage.getItem(GOVERNANCE_STORAGE_KEY)
  if (!raw) return

  try {
    const parsed = JSON.parse(raw) as Partial<GovernanceState>
    governanceState.votes = Array.isArray(parsed.votes) ? parsed.votes : []
    governanceState.castedVotes = Array.isArray(parsed.castedVotes) ? parsed.castedVotes : []
  } catch {
    governanceState.votes = []
    governanceState.castedVotes = []
  }
}

export function listGovernanceVotes() {
  return cloneState(governanceState).votes.filter(vote => !vote.deletedAt)
}

export function listGovernanceCasts() {
  return cloneState(governanceState).castedVotes
}

export function getGovernanceVoteById(id: string) {
  const vote = governanceState.votes.find(entry => entry.id === id && !entry.deletedAt)
  if (!vote) return null
  return {
    ...vote,
    options: vote.options ? vote.options.map(option => ({ ...option })) : undefined,
    agenda: vote.agenda ? vote.agenda.map(item => ({ ...item })) : undefined,
  }
}

export function createGovernanceVote(vote: Vote) {
  governanceState.votes.push(vote)
  persistState(governanceState)
  return vote
}

export function updateGovernanceVote(id: string, updates: Partial<Vote>) {
  const index = governanceState.votes.findIndex(vote => vote.id === id && !vote.deletedAt)
  if (index === -1) return null

  governanceState.votes[index] = {
    ...governanceState.votes[index],
    ...updates,
  }
  persistState(governanceState)
  return governanceState.votes[index]
}

export function softDeleteGovernanceVote(id: string) {
  const vote = governanceState.votes.find(entry => entry.id === id && !entry.deletedAt)
  if (!vote) return false

  vote.deletedAt = new Date().toISOString()
  persistState(governanceState)
  return true
}

export function createGovernanceCast(cast: VoteCast) {
  const alreadyVoted = governanceState.castedVotes.some(
    existing => existing.voteId === cast.voteId && existing.voterId === cast.voterId,
  )

  if (alreadyVoted) {
    return { cast: null, conflict: true }
  }

  governanceState.castedVotes.push(cast)

  // Increment option count on the vote in-memory
  const vote = governanceState.votes.find(v => v.id === cast.voteId)
  if (vote && vote.options) {
    const option = vote.options.find(o => o.id === cast.optionId)
    if (option) {
      option.count += 1
    }
    // Update participation based on casts for this vote
    const totalCasts = governanceState.castedVotes.filter(c => c.voteId === cast.voteId).length
    const totalEligible = 100 // placeholder — same as _storage.ts
    vote.participation = Math.min(100, Math.round((totalCasts / totalEligible) * 100))
  }

  persistState(governanceState)
  return { cast, conflict: false }
}

export function resetGovernanceStore() {
  governanceState.votes = []
  governanceState.castedVotes = []
  persistState(governanceState)
}

hydrateStateFromLocalStorage()
