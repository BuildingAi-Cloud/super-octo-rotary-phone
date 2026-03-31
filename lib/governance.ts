import type { UserRole } from "@/lib/auth-context"
import type { MeetingAgendaItem, Vote, VoteCast, VoteOption, VoteResult } from "@/lib/governance-store"

const CREATE_ROLES: UserRole[] = ["building_owner", "property_manager", "admin"]
const MANAGE_ROLES: UserRole[] = ["building_owner", "admin"]
const VIEW_MEETING_ROLES: UserRole[] = [
  "facility_manager",
  "building_owner",
  "property_manager",
  "resident",
  "tenant",
  "concierge",
  "staff",
  "security",
  "vendor",
  "admin",
  "guest",
]

const CAST_ROLES = new Set<string>(["resident", "tenant", "building_owner", "board_member"])

export function canCreateVote(role?: string | null) {
  if (!role) return false
  return CREATE_ROLES.includes(role as UserRole)
}

export function canManageVote(role?: string | null) {
  if (!role) return false
  return MANAGE_ROLES.includes(role as UserRole)
}

export function canCastVote(role?: string | null) {
  if (!role) return false
  return CAST_ROLES.has(role)
}

export function canViewMeetings(role?: string | null) {
  if (!role) return false
  return VIEW_MEETING_ROLES.includes(role as UserRole)
}

export function isVoteExpired(deadline: string) {
  return new Date(deadline).getTime() <= Date.now()
}

export function canViewResults(vote: Vote) {
  return vote.status === "COMPLETED"
}

export function parseVoteOptions(input?: string | null): VoteOption[] {
  if (!input) return []

  return input
    .split(",")
    .map(label => label.trim())
    .filter(Boolean)
    .map(label => ({
      id: crypto.randomUUID(),
      label,
      count: 0,
    }))
}

export function parseMeetingAgenda(input?: string | null): MeetingAgendaItem[] {
  if (!input) return []

  return input
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean)
    .map((item, index) => ({
      id: crypto.randomUUID(),
      order: index + 1,
      item,
    }))
}

export function computeVoteResults(vote: Vote, casts: VoteCast[]): VoteResult[] {
  const options = vote.options || []
  if (options.length === 0) return []

  const castCounts = new Map<string, number>()
  for (const cast of casts) {
    castCounts.set(cast.optionId, (castCounts.get(cast.optionId) || 0) + 1)
  }

  const total = options.reduce((sum, option) => {
    return sum + (castCounts.get(option.id) || option.count || 0)
  }, 0)

  return options.map(option => {
    const count = castCounts.get(option.id) || option.count || 0
    return {
      optionId: option.id,
      label: option.label,
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
    }
  })
}

export function isNonBinding(vote: Vote) {
  return vote.participation < vote.quorum
}
