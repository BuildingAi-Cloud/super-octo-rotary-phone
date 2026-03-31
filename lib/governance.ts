// Governance helper functions for BuildSync

import { Vote } from "@/lib/governance-store"

export function isDeadlinePassed(deadline: string): boolean {
  return new Date(deadline) < new Date()
}

export function getRolePermissions(role: string) {
  const canCreate = ["building_owner", "property_manager", "admin"].includes(role)
  const canCast = ["resident", "tenant", "building_owner"].includes(role)
  const canManage = ["building_owner", "admin"].includes(role)
  const canView = true // all roles

  return { canCreate, canCast, canManage, canView }
}

export function formatVoteStatus(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    SCHEDULED: "Scheduled",
    COMPLETED: "Completed",
  }
  return labels[status] || status
}

export function formatVoteType(type: string): string {
  const labels: Record<string, string> = {
    "E-VOTE": "E-Vote",
    MEETING: "Meeting",
  }
  return labels[type] || type
}

export function getStatusBadgeColor(
  status: string
): "green" | "amber" | "gray" {
  switch (status) {
    case "ACTIVE":
      return "green"
    case "SCHEDULED":
      return "amber"
    case "COMPLETED":
      return "gray"
    default:
      return "gray"
  }
}

export function getTypeBadgeColor(type: string): "orange" | "blue" {
  return type === "E-VOTE" ? "orange" : "blue"
}

export function formatDeadline(deadline: string): string {
  const date = new Date(deadline)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getTimeRemaining(deadline: string): string {
  const now = new Date().getTime()
  const deadlineTime = new Date(deadline).getTime()
  const diffMs = deadlineTime - now

  if (diffMs < 0) return "Closed"

  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays > 0) return `${diffDays}d remaining`
  if (diffHours > 0) return `${diffHours}h remaining`
  if (diffMins > 0) return `${diffMins}m remaining`
  return "Closing soon"
}

export function canDeleteVote(vote: Vote, userRole: string, userId: string): boolean {
  const canManage = ["building_owner", "admin"].includes(userRole)
  const isCreator = vote.createdBy === userId
  const isNotClosed = vote.status !== "COMPLETED"
  return canManage && isCreator && isNotClosed
}

export function canModifyVote(vote: Vote, userRole: string, userId: string): boolean {
  const canManage = ["building_owner", "admin"].includes(userRole)
  const isCreator = vote.createdBy === userId
  const isNotStarted = vote.status === "SCHEDULED"
  return canManage && isCreator && isNotStarted
}

export function shouldShowResults(vote: Vote, userRole: string): boolean {
  // Results shown only after vote is COMPLETED, or to admin anytime
  if (userRole === "admin") return true
  return vote.status === "COMPLETED"
}
