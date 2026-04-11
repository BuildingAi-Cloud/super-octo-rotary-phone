import type { User, UserRole } from "@/lib/auth-context"

const COMMUNICATION_SETTINGS_KEY = "buildsync_communication_settings"
const BASIC_MESSAGES_KEY = "buildsync_basic_messages"
const USERS_KEY = "buildsync_users"

type IntegrationProvider = "slack" | "discord"

export interface ExternalIntegrationSettings {
  provider: IntegrationProvider
  connected: boolean
  ownerType: "customer_licensed"
  workspaceOrServer: string
  channel: string
  credentialHint: string
  updatedAt: string | null
}

export interface BasicCommunicationSettings {
  enabled: boolean
  allowCrossRoleForManagers: boolean
}

export interface CommunicationSettings {
  slack: ExternalIntegrationSettings
  discord: ExternalIntegrationSettings
  basic: BasicCommunicationSettings
}

export interface BasicMessage {
  id: string
  senderEmail: string
  recipientEmail: string
  body: string
  sentAt: string
}

const DEFAULT_SETTINGS: CommunicationSettings = {
  slack: {
    provider: "slack",
    connected: false,
    ownerType: "customer_licensed",
    workspaceOrServer: "",
    channel: "",
    credentialHint: "",
    updatedAt: null,
  },
  discord: {
    provider: "discord",
    connected: false,
    ownerType: "customer_licensed",
    workspaceOrServer: "",
    channel: "",
    credentialHint: "",
    updatedAt: null,
  },
  basic: {
    enabled: true,
    allowCrossRoleForManagers: true,
  },
}

const MANAGER_ROLES: UserRole[] = [
  "admin",
  "building_owner",
  "building_manager",
  "property_manager",
  "facility_manager",
  "concierge",
]

function hasWindow(): boolean {
  return typeof window !== "undefined"
}

function normalizeAccessRoles(user: Partial<User> | null | undefined): UserRole[] {
  const merged = [user?.role, ...(Array.isArray(user?.accessRoles) ? user.accessRoles : [])]
  const unique = new Set<UserRole>()

  merged.forEach((candidate) => {
    if (typeof candidate === "string") {
      unique.add(candidate as UserRole)
    }
  })

  return Array.from(unique)
}

export function loadCommunicationSettings(): CommunicationSettings {
  if (!hasWindow()) return DEFAULT_SETTINGS

  try {
    const parsed = JSON.parse(localStorage.getItem(COMMUNICATION_SETTINGS_KEY) || "null") as Partial<CommunicationSettings> | null
    if (!parsed) return DEFAULT_SETTINGS

    return {
      slack: { ...DEFAULT_SETTINGS.slack, ...(parsed.slack || {}) },
      discord: { ...DEFAULT_SETTINGS.discord, ...(parsed.discord || {}) },
      basic: { ...DEFAULT_SETTINGS.basic, ...(parsed.basic || {}) },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveCommunicationSettings(settings: CommunicationSettings): void {
  if (!hasWindow()) return
  localStorage.setItem(COMMUNICATION_SETTINGS_KEY, JSON.stringify(settings))
}

export function listPlatformUsers(): Array<Pick<User, "email" | "name" | "role" | "accessRoles">> {
  if (!hasWindow()) return []

  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as User[]
    return users
      .filter((entry) => entry.email && entry.role)
      .map((entry) => ({
        email: entry.email,
        name: entry.name || entry.email,
        role: entry.role,
        accessRoles: normalizeAccessRoles(entry),
      }))
  } catch {
    return []
  }
}

export function listReachableUsers(currentUser: User, allowCrossRoleForManagers: boolean): Array<Pick<User, "email" | "name" | "role">> {
  const allUsers = listPlatformUsers()
  const currentAccessRoles = normalizeAccessRoles(currentUser)
  const canCrossRole = allowCrossRoleForManagers && MANAGER_ROLES.includes(currentUser.role)

  return allUsers.filter((candidate) => {
    if (candidate.email === currentUser.email) return false
    if (canCrossRole) return candidate.role !== "guest"
    if (currentAccessRoles.includes(candidate.role)) return true

    const candidateAccess = normalizeAccessRoles(candidate)
    return candidateAccess.includes(currentUser.role)
  })
}

export function listBasicMessagesForUser(email: string): BasicMessage[] {
  if (!hasWindow()) return []

  try {
    const messages = JSON.parse(localStorage.getItem(BASIC_MESSAGES_KEY) || "[]") as BasicMessage[]
    return messages
      .filter((entry) => entry.senderEmail === email || entry.recipientEmail === email)
      .sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1))
  } catch {
    return []
  }
}

export function sendBasicMessage(senderEmail: string, recipientEmail: string, body: string): BasicMessage {
  if (!hasWindow()) {
    return {
      id: "",
      senderEmail,
      recipientEmail,
      body,
      sentAt: new Date().toISOString(),
    }
  }

  const messages = JSON.parse(localStorage.getItem(BASIC_MESSAGES_KEY) || "[]") as BasicMessage[]
  const message: BasicMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    senderEmail,
    recipientEmail,
    body,
    sentAt: new Date().toISOString(),
  }

  messages.unshift(message)
  if (messages.length > 200) {
    messages.length = 200
  }

  localStorage.setItem(BASIC_MESSAGES_KEY, JSON.stringify(messages))
  return message
}
