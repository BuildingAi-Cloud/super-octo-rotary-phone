// Supabase REST API wrapper for governance module
// Following the exact pattern from app/api/amenities/_storage.ts

import {
  Vote,
  VoteCast,
  VoteOption,
  MeetingAgendaItem,
  voteStore,
  castedVoteStore,
  addVote,
  updateVote as updateVoteInStore,
  softDeleteVote as softDeleteVoteStore,
  logGovernanceAudit,
} from "@/lib/governance-store"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

interface SupabaseConfig {
  url: string
  key: string
}

function getSupabaseConfig(): SupabaseConfig | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null
  return { url: SUPABASE_URL, key: SUPABASE_KEY }
}

async function supabaseRequest(path: string, init?: RequestInit) {
  const config = getSupabaseConfig()
  if (!config) return null

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase request failed (${response.status}): ${errorText}`)
  }

  return response.json()
}

// ============================================================================
// VOTES
// ============================================================================

export async function getAllVotes(filters?: { status?: string; type?: string }): Promise<Vote[]> {
  try {
    let query = "governance_votes?select=*&is_deleted=is.false"

    if (filters?.status) {
      query += `&status=eq.${filters.status}`
    }
    if (filters?.type) {
      query += `&type=eq.${filters.type}`
    }

    const votes = await supabaseRequest(query)
    if (!votes) {
      // Fallback to in-memory store
      return voteStore.filter(v => {
        if (!v.deletedAt) {
          if (filters?.status && v.status !== filters.status) return false
          if (filters?.type && v.type !== filters.type) return false
          return true
        }
        return false
      })
    }
    return votes
  } catch {
    // Fallback to in-memory store
    return voteStore.filter(v => {
      if (!v.deletedAt) {
        if (filters?.status && v.status !== filters.status) return false
        if (filters?.type && v.type !== filters.type) return false
        return true
      }
      return false
    })
  }
}

export async function getVoteById(id: string): Promise<Vote | null> {
  try {
    const vote = await supabaseRequest(`governance_votes?id=eq.${id}&is_deleted=is.false&select=*`)
    if (vote && Array.isArray(vote) && vote.length > 0) {
      return vote[0]
    }
    // Fallback
    const local = voteStore.find(v => v.id === id && !v.deletedAt)
    return local || null
  } catch {
    const local = voteStore.find(v => v.id === id && !v.deletedAt)
    return local || null
  }
}

export interface CreateVoteInput {
  type: "E-VOTE" | "MEETING"
  title: string
  description: string
  deadline: string
  quorum: number
  createdBy: string
  buildingId?: string
  options?: VoteOption[]
  agenda?: MeetingAgendaItem[]
}

export async function createVote(input: CreateVoteInput): Promise<Vote> {
  try {
    const voteId = crypto.randomUUID()
    const vote: Vote = {
      id: voteId,
      type: input.type,
      title: input.title,
      description: input.description,
      status: "SCHEDULED",
      deadline: input.deadline,
      quorum: input.quorum,
      participation: 0,
      options: input.type === "E-VOTE" ? input.options || [] : undefined,
      agenda: input.type === "MEETING" ? input.agenda || [] : undefined,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      buildingId: input.buildingId,
    }

    // Try Supabase first
    try {
      await supabaseRequest("governance_votes", {
        method: "POST",
        body: JSON.stringify({
          id: vote.id,
          type: vote.type,
          title: vote.title,
          description: vote.description,
          status: vote.status,
          deadline: vote.deadline,
          quorum: vote.quorum,
          participation: vote.participation,
          created_by: vote.createdBy,
          created_at: vote.createdAt,
          building_id: vote.buildingId,
        }),
      })

      // Create options/agenda if E-VOTE
      if (input.type === "E-VOTE" && input.options) {
        for (const opt of input.options) {
          await supabaseRequest("governance_vote_options", {
            method: "POST",
            body: JSON.stringify({
              id: opt.id,
              vote_id: voteId,
              label: opt.label,
              count: 0,
            }),
          })
        }
      }

      // Create agenda items if MEETING
      if (input.type === "MEETING" && input.agenda) {
        for (const item of input.agenda) {
          await supabaseRequest("governance_meeting_agenda", {
            method: "POST",
            body: JSON.stringify({
              id: item.id,
              vote_id: voteId,
              item: item.item,
              order_index: item.order,
            }),
          })
        }
      }

      // Log audit
      await supabaseRequest("governance_audit_log", {
        method: "POST",
        body: JSON.stringify({
          vote_id: voteId,
          action: "vote_created",
          performed_by: input.createdBy,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch {
      // Fallback to in-memory
    }

    // Always update in-memory store
    addVote(vote)
    logGovernanceAudit("vote_created", input.createdBy, voteId)

    return vote
  } catch {
    throw new Error("Failed to create vote")
  }
}

export interface UpdateVoteInput {
  status?: Vote["status"]
  participation?: number
  quorum?: number
}

export async function updateVote(id: string, input: UpdateVoteInput): Promise<Vote | null> {
  try {
    const vote = await getVoteById(id)
    if (!vote) return null

    // Try Supabase first
    try {
      const updates: Record<string, unknown> = {}
      if (input.status !== undefined) updates.status = input.status
      if (input.participation !== undefined) updates.participation = input.participation
      if (input.quorum !== undefined) updates.quorum = input.quorum

      await supabaseRequest(`governance_votes?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      })
    } catch {
      // Fallback to in-memory
    }

    // Update in-memory - cast status to proper type
    const updated = updateVoteInStore(id, {
      status: input.status,
      participation: input.participation,
      quorum: input.quorum,
    })
    return updated
  } catch {
    return null
  }
}

export async function softDeleteVote(id: string): Promise<boolean> {
  try {
    // Try Supabase first
    try {
      await supabaseRequest(`governance_votes?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({ deleted_at: new Date().toISOString() }),
      })
    } catch {
      // Fallback
    }

    // Update in-memory
    return softDeleteVoteStore(id)
  } catch {
    return false
  }
}

// ============================================================================
// VOTES CAST
// ============================================================================

export async function castVote(
  voteId: string,
  optionId: string,
  voterId: string
): Promise<VoteCast | null> {
  try {
    // Check if vote exists
    const vote = await getVoteById(voteId)
    if (!vote) return null

    // Check if already voted
    const existingCast = await supabaseRequest(
      `governance_casts?vote_id=eq.${voteId}&voter_id=eq.${voterId}&select=*`
    )
    if (existingCast && Array.isArray(existingCast) && existingCast.length > 0) {
      return null // Already voted
    }

    // Check deadline
    if (new Date(vote.deadline) < new Date()) {
      return null // Deadline passed
    }

    const castId = crypto.randomUUID()
    const cast: VoteCast = {
      id: castId,
      voteId,
      optionId,
      voterId,
      castedAt: new Date().toISOString(),
    }

    // Try Supabase first
    try {
      await supabaseRequest("governance_casts", {
        method: "POST",
        body: JSON.stringify({
          id: cast.id,
          vote_id: cast.voteId,
          option_id: cast.optionId,
          voter_id: cast.voterId,
          casted_at: cast.castedAt,
        }),
      })

      // Update vote participation
      await supabaseRequest(`governance_votes?id=eq.${voteId}`, {
        method: "PATCH",
        body: JSON.stringify({
          participation: vote.participation + 1,
        }),
      })

      // Increment option count
      await supabaseRequest(`governance_vote_options?id=eq.${optionId}`, {
        method: "PATCH",
        body: JSON.stringify({
          count: (vote.options?.find(o => o.id === optionId)?.count || 0) + 1,
        }),
      })

      // Log audit
      await supabaseRequest("governance_audit_log", {
        method: "POST",
        body: JSON.stringify({
          vote_id: voteId,
          action: "vote_cast",
          performed_by: voterId,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch {
      // Fallback
    }

    // Update in-memory
    castedVoteStore.push(cast)
    logGovernanceAudit("vote_cast", voterId, voteId)

    return cast
  } catch {
    return null
  }
}

// ============================================================================
// RESULTS
// ============================================================================

export async function getVoteResults(voteId: string) {
  try {
    const casts = await supabaseRequest(
      `governance_casts?vote_id=eq.${voteId}&select=option_id`
    )

    if (!casts || !Array.isArray(casts)) {
      // Fallback
      const localCasts = castedVoteStore.filter(c => c.voteId === voteId)
      return localCasts
    }

    return casts
  } catch {
    // Fallback to in-memory
    const localCasts = castedVoteStore.filter(c => c.voteId === voteId)
    return localCasts
  }
}
