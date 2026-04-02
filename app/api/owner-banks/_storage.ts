import { getSupabaseServerConfig } from "@/lib/runtime-server"

export type BankAccountType = "checking" | "savings"
export type BankAccountStatus = "active" | "pending_verification" | "archived"

export interface OwnerBankAccount {
  id: string
  ownerId: string
  bankName: string
  accountHolder: string
  accountType: BankAccountType
  routingLast4: string
  accountLast4: string
  nickname: string
  status: BankAccountStatus
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface BankEvent {
  id: string
  ownerId: string
  bankId: string
  message: string
  at: string
}

interface SupabaseConfig {
  url: string
  key: string
  banksTable: string
  eventsTable: string
}

function getSupabaseConfig(): SupabaseConfig | null {
  const supabase = getSupabaseServerConfig()
  if (!supabase) return null

  return {
    url: supabase.url,
    key: supabase.key,
    banksTable: process.env.SUPABASE_OWNER_BANKS_TABLE || "owner_banks",
    eventsTable: process.env.SUPABASE_OWNER_BANK_EVENTS_TABLE || "owner_bank_events",
  }
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

function normalizeBank(row: Partial<OwnerBankAccount> & Record<string, unknown>): OwnerBankAccount {
  return {
    id: String(row.id || crypto.randomUUID()),
    ownerId: String(row.ownerId || row.owner_id || ""),
    bankName: String(row.bankName || row.bank_name || ""),
    accountHolder: String(row.accountHolder || row.account_holder || ""),
    accountType: (row.accountType || row.account_type || "checking") as BankAccountType,
    routingLast4: String(row.routingLast4 || row.routing_last4 || ""),
    accountLast4: String(row.accountLast4 || row.account_last4 || ""),
    nickname: String(row.nickname || ""),
    status: (row.status || "pending_verification") as BankAccountStatus,
    isDefault: Boolean(row.isDefault ?? row.is_default ?? false),
    createdAt: String(row.createdAt || row.created_at || new Date().toISOString()),
    updatedAt: String(row.updatedAt || row.updated_at || new Date().toISOString()),
  }
}

function normalizeEvent(row: Partial<BankEvent> & Record<string, unknown>): BankEvent {
  return {
    id: String(row.id || crypto.randomUUID()),
    ownerId: String(row.ownerId || row.owner_id || ""),
    bankId: String(row.bankId || row.bank_id || ""),
    message: String(row.message || ""),
    at: String(row.at || new Date().toISOString()),
  }
}

const memBanks = new Map<string, OwnerBankAccount[]>()
const memEvents = new Map<string, BankEvent[]>()

function roleAllowed(role?: string | null) {
  return role === "building_owner" || role === "admin"
}

export function canManageOwnerBanks(role?: string | null) {
  return roleAllowed(role)
}

export async function listOwnerBanks(ownerId: string): Promise<{ banks: OwnerBankAccount[]; events: BankEvent[] }> {
  const config = getSupabaseConfig()
  if (config) {
    try {
      const [banksRaw, eventsRaw] = await Promise.all([
        supabaseRequest(`${config.banksTable}?owner_id=eq.${encodeURIComponent(ownerId)}&select=*&order=created_at.desc`),
        supabaseRequest(`${config.eventsTable}?owner_id=eq.${encodeURIComponent(ownerId)}&select=*&order=at.desc&limit=50`),
      ])
      const banks = Array.isArray(banksRaw) ? banksRaw.map((row) => normalizeBank(row as Record<string, unknown>)) : []
      const events = Array.isArray(eventsRaw) ? eventsRaw.map((row) => normalizeEvent(row as Record<string, unknown>)) : []
      return { banks, events }
    } catch {
      // Fallback to memory store
    }
  }

  return {
    banks: memBanks.get(ownerId) || [],
    events: memEvents.get(ownerId) || [],
  }
}

interface CreateOwnerBankInput {
  ownerId: string
  bankName: string
  accountHolder: string
  accountType: BankAccountType
  routingLast4: string
  accountLast4: string
  nickname: string
}

export async function createOwnerBank(input: CreateOwnerBankInput): Promise<{ bank: OwnerBankAccount; events: BankEvent[] }> {
  const now = new Date().toISOString()
  const current = (await listOwnerBanks(input.ownerId)).banks
  const bank: OwnerBankAccount = {
    id: crypto.randomUUID(),
    ownerId: input.ownerId,
    bankName: input.bankName,
    accountHolder: input.accountHolder,
    accountType: input.accountType,
    routingLast4: input.routingLast4,
    accountLast4: input.accountLast4,
    nickname: input.nickname,
    status: "pending_verification",
    isDefault: current.length === 0,
    createdAt: now,
    updatedAt: now,
  }

  const event = createEvent(input.ownerId, bank.id, "Bank account added and pending verification")

  const config = getSupabaseConfig()
  if (config) {
    try {
      await supabaseRequest(config.banksTable, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          id: bank.id,
          owner_id: bank.ownerId,
          bank_name: bank.bankName,
          account_holder: bank.accountHolder,
          account_type: bank.accountType,
          routing_last4: bank.routingLast4,
          account_last4: bank.accountLast4,
          nickname: bank.nickname,
          status: bank.status,
          is_default: bank.isDefault,
          created_at: bank.createdAt,
          updated_at: bank.updatedAt,
        }),
      })
      await supabaseRequest(config.eventsTable, {
        method: "POST",
        body: JSON.stringify({
          id: event.id,
          owner_id: event.ownerId,
          bank_id: event.bankId,
          message: event.message,
          at: event.at,
        }),
      })
      const { events } = await listOwnerBanks(input.ownerId)
      return { bank, events }
    } catch {
      // Fallback to memory store
    }
  }

  const nextBanks = [bank, ...(memBanks.get(input.ownerId) || [])]
  memBanks.set(input.ownerId, nextBanks)
  const nextEvents = [event, ...(memEvents.get(input.ownerId) || [])].slice(0, 50)
  memEvents.set(input.ownerId, nextEvents)
  return { bank, events: nextEvents }
}

interface UpdateOwnerBankInput {
  ownerId: string
  bankId: string
  bankName?: string
  accountHolder?: string
  accountType?: BankAccountType
  routingLast4?: string
  accountLast4?: string
  nickname?: string
  status?: BankAccountStatus
  isDefault?: boolean
}

function createEvent(ownerId: string, bankId: string, message: string): BankEvent {
  return {
    id: crypto.randomUUID(),
    ownerId,
    bankId,
    message,
    at: new Date().toISOString(),
  }
}

function ensureDefaultActive(banks: OwnerBankAccount[]): OwnerBankAccount[] {
  if (banks.length === 0) return banks
  if (banks.some((b) => b.isDefault && b.status === "active")) return banks

  const firstActive = banks.find((b) => b.status === "active")
  if (!firstActive) return banks.map((b) => ({ ...b, isDefault: false }))
  return banks.map((b) => ({ ...b, isDefault: b.id === firstActive.id }))
}

export async function updateOwnerBank(input: UpdateOwnerBankInput): Promise<{ bank: OwnerBankAccount | null; banks: OwnerBankAccount[]; events: BankEvent[] }> {
  const { banks } = await listOwnerBanks(input.ownerId)
  const existing = banks.find((b) => b.id === input.bankId)
  if (!existing) {
    return { bank: null, banks, events: (await listOwnerBanks(input.ownerId)).events }
  }

  const now = new Date().toISOString()
  let next = banks.map((b) => {
    if (b.id !== input.bankId) {
      if (input.isDefault === true) return { ...b, isDefault: false }
      return b
    }

    return {
      ...b,
      bankName: input.bankName ?? b.bankName,
      accountHolder: input.accountHolder ?? b.accountHolder,
      accountType: input.accountType ?? b.accountType,
      routingLast4: input.routingLast4 ?? b.routingLast4,
      accountLast4: input.accountLast4 ?? b.accountLast4,
      nickname: input.nickname ?? b.nickname,
      status: input.status ?? b.status,
      isDefault: input.isDefault ?? b.isDefault,
      updatedAt: now,
    }
  })

  next = ensureDefaultActive(next)
  const updated = next.find((b) => b.id === input.bankId) || null

  let eventMessage = "Bank details updated"
  if (input.isDefault === true) eventMessage = "Set as default payout bank"
  if (input.status === "active") eventMessage = "Bank verified and active"
  if (input.status === "pending_verification") eventMessage = "Bank moved to pending verification"
  if (input.status === "archived") eventMessage = "Bank archived"
  const event = createEvent(input.ownerId, input.bankId, eventMessage)

  const config = getSupabaseConfig()
  if (config) {
    try {
      if (input.isDefault === true) {
        await supabaseRequest(`${config.banksTable}?owner_id=eq.${encodeURIComponent(input.ownerId)}`, {
          method: "PATCH",
          body: JSON.stringify({ is_default: false }),
        })
      }

      await supabaseRequest(`${config.banksTable}?id=eq.${encodeURIComponent(input.bankId)}&owner_id=eq.${encodeURIComponent(input.ownerId)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          ...(input.bankName !== undefined ? { bank_name: input.bankName } : {}),
          ...(input.accountHolder !== undefined ? { account_holder: input.accountHolder } : {}),
          ...(input.accountType !== undefined ? { account_type: input.accountType } : {}),
          ...(input.routingLast4 !== undefined ? { routing_last4: input.routingLast4 } : {}),
          ...(input.accountLast4 !== undefined ? { account_last4: input.accountLast4 } : {}),
          ...(input.nickname !== undefined ? { nickname: input.nickname } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.isDefault !== undefined ? { is_default: input.isDefault } : {}),
          updated_at: now,
        }),
      })

      await supabaseRequest(config.eventsTable, {
        method: "POST",
        body: JSON.stringify({
          id: event.id,
          owner_id: event.ownerId,
          bank_id: event.bankId,
          message: event.message,
          at: event.at,
        }),
      })

      const fresh = await listOwnerBanks(input.ownerId)
      return { bank: fresh.banks.find((b) => b.id === input.bankId) || null, banks: fresh.banks, events: fresh.events }
    } catch {
      // Fallback to memory store
    }
  }

  memBanks.set(input.ownerId, next)
  const nextEvents = [event, ...(memEvents.get(input.ownerId) || [])].slice(0, 50)
  memEvents.set(input.ownerId, nextEvents)
  return { bank: updated, banks: next, events: nextEvents }
}
