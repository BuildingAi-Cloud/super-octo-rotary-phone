import {
  createGovernanceVote,
  createGovernanceCast,
  getGovernanceVoteById,
  listGovernanceVotes,
  listGovernanceCasts,
  softDeleteGovernanceVote,
  updateGovernanceVote,
  type Vote,
  type VoteCast,
  type VoteOption,
  type MeetingAgendaItem,
} from "@/lib/governance-store"

// ---------------------------------------------------------------------------
// Supabase REST helpers (mirrors app/api/amenities/_storage.ts)
// ---------------------------------------------------------------------------

interface SupabaseConfig {
  url: string
  key: string
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return { url, key }
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

  if (response.status === 204) return null
  return response.json()
}

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

function normalizeVote(row: Record<string, unknown>): Vote {
  return {
    id: (row.id as string) || crypto.randomUUID(),
    type: (row.type as Vote["type"]) || "E-VOTE",
    title: (row.title as string) || "",
    description: (row.description as string) || "",
    status: (row.status as Vote["status"]) || "SCHEDULED",
    deadline: (row.deadline as string) || "",
    quorum: (row.quorum as number) ?? 50,
    participation: (row.participation as number) ?? 0,
    options: (row.options as VoteOption[] | undefined) ?? undefined,
    agenda: (row.agenda as MeetingAgendaItem[] | undefined) ?? undefined,
    createdBy: (row.created_by as string) || (row.createdBy as string) || "",
    createdAt: (row.created_at as string) || (row.createdAt as string) || new Date().toISOString(),
    buildingId: (row.building_id as string) || (row.buildingId as string) || undefined,
    deletedAt: (row.deleted_at as string) || (row.deletedAt as string) || null,
  }
}

function normalizeCast(row: Record<string, unknown>): VoteCast {
  return {
    id: (row.id as string) || crypto.randomUUID(),
    voteId: (row.vote_id as string) || (row.voteId as string) || "",
    optionId: (row.option_id as string) || (row.optionId as string) || "",
    voterId: (row.voter_id as string) || (row.voterId as string) || "",
    castedAt: (row.casted_at as string) || (row.castedAt as string) || new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Audit helper
// ---------------------------------------------------------------------------

export async function logGovernanceAudit(
  voteId: string,
  action: string,
  performedBy: string,
) {
  try {
    await supabaseRequest("governance_audit_log", {
      method: "POST",
      body: JSON.stringify({
        vote_id: voteId,
        action,
        performed_by: performedBy,
      }),
    })
  } catch {
    // Audit logging is best-effort; don't fail the main operation.
  }
}

// ---------------------------------------------------------------------------
// VOTES
// ---------------------------------------------------------------------------

export async function getAllVotes(): Promise<Vote[]> {
  try {
    const data = await supabaseRequest(
      "governance_votes?select=*,governance_vote_options(*),governance_meeting_agenda(*)&deleted_at=is.null&order=created_at.desc",
    )
    if (!Array.isArray(data)) return listGovernanceVotes()

    return data.map((row: Record<string, unknown>) => {
      const vote = normalizeVote(row)
      const rawOptions = row.governance_vote_options as Record<string, unknown>[] | undefined
      const rawAgenda = row.governance_meeting_agenda as Record<string, unknown>[] | undefined

      if (rawOptions && Array.isArray(rawOptions)) {
        vote.options = rawOptions.map((o) => ({
          id: o.id as string,
          label: o.label as string,
          count: (o.count as number) ?? 0,
        }))
      }
      if (rawAgenda && Array.isArray(rawAgenda)) {
        vote.agenda = rawAgenda
          .sort((a, b) => ((a.order_index as number) ?? 0) - ((b.order_index as number) ?? 0))
          .map((a) => ({
            id: a.id as string,
            order: (a.order_index as number) ?? 0,
            item: a.item as string,
          }))
      }
      return vote
    })
  } catch {
    return listGovernanceVotes()
  }
}

export async function getVoteById(id: string): Promise<Vote | null> {
  try {
    const data = await supabaseRequest(
      `governance_votes?select=*,governance_vote_options(*),governance_meeting_agenda(*)&id=eq.${encodeURIComponent(id)}&deleted_at=is.null`,
    )
    if (!Array.isArray(data) || data.length === 0) return getGovernanceVoteById(id)

    const row = data[0] as Record<string, unknown>
    const vote = normalizeVote(row)
    const rawOptions = row.governance_vote_options as Record<string, unknown>[] | undefined
    const rawAgenda = row.governance_meeting_agenda as Record<string, unknown>[] | undefined

    if (rawOptions && Array.isArray(rawOptions)) {
      vote.options = rawOptions.map((o) => ({
        id: o.id as string,
        label: o.label as string,
        count: (o.count as number) ?? 0,
      }))
    }
    if (rawAgenda && Array.isArray(rawAgenda)) {
      vote.agenda = rawAgenda
        .sort((a, b) => ((a.order_index as number) ?? 0) - ((b.order_index as number) ?? 0))
        .map((a) => ({
          id: a.id as string,
          order: (a.order_index as number) ?? 0,
          item: a.item as string,
        }))
    }
    return vote
  } catch {
    return getGovernanceVoteById(id)
  }
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export interface VoteCreateInput {
  type: Vote["type"]
  title: string
  description: string
  deadline: string
  quorum?: number
  options?: VoteOption[]
  agenda?: MeetingAgendaItem[]
  createdBy: string
  buildingId?: string
}

export async function createVoteRecord(input: VoteCreateInput): Promise<Vote> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const payload: Vote = {
    id,
    type: input.type,
    title: input.title,
    description: input.description,
    status: "SCHEDULED",
    deadline: input.deadline,
    quorum: input.quorum ?? 50,
    participation: 0,
    options: input.type === "E-VOTE" ? input.options : undefined,
    agenda: input.type === "MEETING" ? input.agenda : undefined,
    createdBy: input.createdBy,
    createdAt: now,
    buildingId: input.buildingId,
  }

  try {
    await supabaseRequest("governance_votes", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        id,
        type: payload.type,
        title: payload.title,
        description: payload.description,
        status: payload.status,
        deadline: payload.deadline,
        quorum: payload.quorum,
        participation: 0,
        created_by: payload.createdBy,
        created_at: now,
        building_id: payload.buildingId || null,
      }),
    })

    // Insert options
    if (payload.type === "E-VOTE" && payload.options && payload.options.length > 0) {
      const optionRows = payload.options.map((o) => ({
        id: o.id,
        vote_id: id,
        label: o.label,
        count: 0,
      }))
      await supabaseRequest("governance_vote_options", {
        method: "POST",
        body: JSON.stringify(optionRows),
      })
    }

    // Insert agenda items
    if (payload.type === "MEETING" && payload.agenda && payload.agenda.length > 0) {
      const agendaRows = payload.agenda.map((a) => ({
        id: a.id,
        vote_id: id,
        item: a.item,
        order_index: a.order,
      }))
      await supabaseRequest("governance_meeting_agenda", {
        method: "POST",
        body: JSON.stringify(agendaRows),
      })
    }

    await logGovernanceAudit(id, "created", input.createdBy)
  } catch {
    // Fallback to in-memory store
  }

  return createGovernanceVote(payload)
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export interface VoteUpdateInput {
  title?: string
  description?: string
  status?: Vote["status"]
  deadline?: string
  quorum?: number
}

export async function updateVoteRecord(
  id: string,
  updates: VoteUpdateInput,
  performedBy: string,
): Promise<Vote | null> {
  // Don't allow updates on completed votes
  const existing = await getVoteById(id)
  if (!existing) return null
  if (existing.status === "COMPLETED") return null

  try {
    const supabaseUpdates: Record<string, unknown> = {}
    if (updates.title !== undefined) supabaseUpdates.title = updates.title
    if (updates.description !== undefined) supabaseUpdates.description = updates.description
    if (updates.status !== undefined) supabaseUpdates.status = updates.status
    if (updates.deadline !== undefined) supabaseUpdates.deadline = updates.deadline
    if (updates.quorum !== undefined) supabaseUpdates.quorum = updates.quorum

    const data = await supabaseRequest(
      `governance_votes?id=eq.${encodeURIComponent(id)}&deleted_at=is.null`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(supabaseUpdates),
      },
    )

    if (updates.status === "COMPLETED") {
      await logGovernanceAudit(id, "closed", performedBy)
    }

    if (Array.isArray(data) && data[0]) {
      return normalizeVote(data[0] as Record<string, unknown>)
    }
  } catch {
    // Fallback to in-memory store
  }

  return updateGovernanceVote(id, updates)
}

// ---------------------------------------------------------------------------
// SOFT DELETE
// ---------------------------------------------------------------------------

export async function deleteVoteRecord(id: string, performedBy: string): Promise<boolean> {
  try {
    await supabaseRequest(
      `governance_votes?id=eq.${encodeURIComponent(id)}&deleted_at=is.null`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ deleted_at: new Date().toISOString() }),
      },
    )
    await logGovernanceAudit(id, "deleted", performedBy)
    return true
  } catch {
    // Fallback to in-memory store
  }

  return softDeleteGovernanceVote(id)
}

// ---------------------------------------------------------------------------
// CAST VOTE
// ---------------------------------------------------------------------------

export interface CastVoteInput {
  voteId: string
  optionId: string
  voterId: string
}

export async function castVoteRecord(
  input: CastVoteInput,
): Promise<{ cast: VoteCast | null; error?: string }> {
  const vote = await getVoteById(input.voteId)
  if (!vote) return { cast: null, error: "VOTE_NOT_FOUND" }
  if (vote.type !== "E-VOTE") return { cast: null, error: "NOT_AN_EVOTE" }
  if (vote.status === "COMPLETED") return { cast: null, error: "VOTE_CLOSED" }
  if (new Date(vote.deadline).getTime() <= Date.now()) return { cast: null, error: "VOTE_EXPIRED" }

  // Validate optionId exists
  if (!vote.options?.some((o) => o.id === input.optionId)) {
    return { cast: null, error: "INVALID_OPTION" }
  }

  const castId = crypto.randomUUID()
  const now = new Date().toISOString()

  // Try Supabase first
  try {
    // Check duplicate via unique constraint + explicit check
    const existing = await supabaseRequest(
      `governance_casts?vote_id=eq.${encodeURIComponent(input.voteId)}&voter_id=eq.${encodeURIComponent(input.voterId)}&select=id`,
    )
    if (Array.isArray(existing) && existing.length > 0) {
      return { cast: null, error: "VOTE_ALREADY_CAST" }
    }

    await supabaseRequest("governance_casts", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        id: castId,
        vote_id: input.voteId,
        option_id: input.optionId,
        voter_id: input.voterId,
        casted_at: now,
      }),
    })

    // Increment option count
    await supabaseRequest("rpc/increment_vote_option_count", {
      method: "POST",
      body: JSON.stringify({ p_option_id: input.optionId }),
    }).catch(() => {
      // If RPC not available, do a manual update
      return supabaseRequest(
        `governance_vote_options?id=eq.${encodeURIComponent(input.optionId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            count: (vote.options?.find((o) => o.id === input.optionId)?.count ?? 0) + 1,
          }),
        },
      )
    })

    // Update participation on the vote
    const allCasts = await supabaseRequest(
      `governance_casts?vote_id=eq.${encodeURIComponent(input.voteId)}&select=id`,
    )
    if (Array.isArray(allCasts)) {
      const totalEligible = 100 // In a real system this would be the count of eligible voters
      const participation = Math.min(
        100,
        Math.round((allCasts.length / totalEligible) * 100),
      )
      await supabaseRequest(
        `governance_votes?id=eq.${encodeURIComponent(input.voteId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ participation }),
        },
      )
    }

    await logGovernanceAudit(input.voteId, "cast", input.voterId)
  } catch {
    // Fallback to in-memory
  }

  const castRecord: VoteCast = {
    id: castId,
    voteId: input.voteId,
    optionId: input.optionId,
    voterId: input.voterId,
    castedAt: now,
  }

  const result = createGovernanceCast(castRecord)
  if (result.conflict) {
    return { cast: null, error: "VOTE_ALREADY_CAST" }
  }

  return { cast: result.cast }
}

// ---------------------------------------------------------------------------
// RESULTS
// ---------------------------------------------------------------------------

export interface VoteResultRow {
  optionId: string
  label: string
  count: number
  percentage: number
}

export async function getVoteResults(
  id: string,
): Promise<{ results: VoteResultRow[]; nonBinding: boolean } | null> {
  const vote = await getVoteById(id)
  if (!vote) return null
  if (vote.status !== "COMPLETED") return null

  const options = vote.options || []

  // Use option counts first; if all zero, compute from in-memory casts
  let total = options.reduce((sum, o) => sum + o.count, 0)

  let results: VoteResultRow[]

  if (total === 0) {
    // Compute from in-memory casts (fallback when Supabase is unavailable)
    const casts = listGovernanceCasts().filter((c) => c.voteId === id)
    const castCounts = new Map<string, number>()
    for (const cast of casts) {
      castCounts.set(cast.optionId, (castCounts.get(cast.optionId) || 0) + 1)
    }
    total = casts.length

    results = options.map((o) => {
      const count = castCounts.get(o.id) || 0
      return {
        optionId: o.id,
        label: o.label,
        count,
        percentage: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
      }
    })
  } else {
    results = options.map((o) => ({
      optionId: o.id,
      label: o.label,
      count: o.count,
      percentage: total > 0 ? Number(((o.count / total) * 100).toFixed(2)) : 0,
    }))
  }

  return {
    results,
    nonBinding: vote.participation < vote.quorum,
  }
}
