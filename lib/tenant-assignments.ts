export interface TenantAssignment {
  id: string
  tenantEmail: string
  unit: string
  buildingId?: string
  leaseId?: string
  assignedBy?: string
  assignedAt: string
}

const STORAGE_KEY = "buildsync_tenant_assignments"

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function readTenantAssignments(): TenantAssignment[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((assignment): assignment is TenantAssignment => {
      return Boolean(
        assignment &&
          typeof assignment.id === "string" &&
          typeof assignment.tenantEmail === "string" &&
          typeof assignment.unit === "string" &&
          typeof assignment.assignedAt === "string",
      )
    })
  } catch {
    return []
  }
}

export function writeTenantAssignments(assignments: TenantAssignment[]): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments))
}

export function upsertTenantAssignment(input: {
  tenantEmail: string
  unit: string
  buildingId?: string
  leaseId?: string
  assignedBy?: string
}): TenantAssignment {
  const tenantEmail = normalizeEmail(input.tenantEmail)
  const assignments = readTenantAssignments()
  const existing = assignments.find((assignment) => normalizeEmail(assignment.tenantEmail) === tenantEmail)

  if (existing) {
    const updated: TenantAssignment = {
      ...existing,
      unit: input.unit.trim(),
      buildingId: input.buildingId?.trim() || undefined,
      leaseId: input.leaseId?.trim() || undefined,
      assignedBy: input.assignedBy?.trim() || undefined,
      assignedAt: new Date().toISOString(),
    }

    writeTenantAssignments(assignments.map((assignment) => (assignment.id === existing.id ? updated : assignment)))
    return updated
  }

  const created: TenantAssignment = {
    id: crypto.randomUUID(),
    tenantEmail,
    unit: input.unit.trim(),
    buildingId: input.buildingId?.trim() || undefined,
    leaseId: input.leaseId?.trim() || undefined,
    assignedBy: input.assignedBy?.trim() || undefined,
    assignedAt: new Date().toISOString(),
  }

  writeTenantAssignments([created, ...assignments])
  return created
}

export function removeTenantAssignment(id: string): void {
  const assignments = readTenantAssignments()
  writeTenantAssignments(assignments.filter((assignment) => assignment.id !== id))
}

export function getTenantAssignmentByEmail(email: string | null | undefined): TenantAssignment | null {
  if (!email) {
    return null
  }

  const normalized = normalizeEmail(email)
  const assignment = readTenantAssignments().find(
    (entry) => normalizeEmail(entry.tenantEmail) === normalized,
  )

  return assignment || null
}
