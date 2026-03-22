// Simple audit logging service for client-side or hybrid apps
export interface AuditEntry {
  timestamp: string
  user: string | null
  action: string
  details?: any
  ip?: string
}

const AUDIT_KEY = "buildsync_audit_log"

export function logAudit(action: string, details?: any, user: string | null = null) {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    user,
    action,
    details,
  }
  const logs = JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]")
  logs.push(entry)
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs))
}

export function getAuditLog(): AuditEntry[] {
  return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]")
}

export function clearAuditLog() {
  localStorage.removeItem(AUDIT_KEY)
}
