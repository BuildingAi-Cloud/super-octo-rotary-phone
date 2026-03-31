// Simple audit logging service for client-side or hybrid apps
export interface AuditEntry {
  timestamp: string
  user: string | null
  action: string
<<<<<<< HEAD
  details?: unknown
=======
  details?: Record<string, unknown> | string | number | null
>>>>>>> feature/ui-updates
  ip?: string
}

const AUDIT_KEY = "buildsync_audit_log"

<<<<<<< HEAD
export function logAudit(action: string, details?: unknown, user: string | null = null) {
=======
export function logAudit(action: string, details?: Record<string, unknown> | string | number | null, user: string | null = null) {
>>>>>>> feature/ui-updates
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    user,
    action,
    details,
  }
<<<<<<< HEAD
  const logs = JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]")
=======
  const logs: AuditEntry[] = JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]")
>>>>>>> feature/ui-updates
  logs.push(entry)
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs))
}

export function getAuditLog(): AuditEntry[] {
  return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]")
}

export function clearAuditLog() {
  localStorage.removeItem(AUDIT_KEY)
}
