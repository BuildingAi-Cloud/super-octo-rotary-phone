import { getSupabaseServerConfig } from "@/lib/runtime-server"

// ─── Types ──────────────────────────────────────────────────────────────────────

export type Priority = "high" | "medium" | "low"
export type RequestStatus = "new" | "in_progress" | "completed"

export interface ServiceRequest {
  id: string
  building: string
  issue: string
  priority: Priority
  status: RequestStatus
  date: string
  assignedVendorId: string
}

export interface VendorInvoice {
  id: string
  vendorId: string
  invoiceNumber: string
  amount: number
  serviceDate: string | null
  notes: string
  requestId: string | null
  status: "pending" | "approved" | "paid"
  createdAt: string
}

export interface Appointment {
  id: string
  vendorId: string
  date: string
  time: string
  building: string
  contact: string
  description: string
}

export interface VendorStats {
  openRequests: number
  upcomingAppointments: number
  pendingInvoices: number
  completedThisMonth: number
}

// ─── Supabase helpers ───────────────────────────────────────────────────────────

interface SupabaseConfig {
  url: string
  key: string
}

function getConfig(): SupabaseConfig | null {
  const supabase = getSupabaseServerConfig()
  if (!supabase) return null
  return { url: supabase.url, key: supabase.key }
}

async function supabaseRequest(path: string, init?: RequestInit) {
  const config = getConfig()
  if (!config) return null

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
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

// ─── In-memory fallback data ────────────────────────────────────────────────────

const memoryRequests: ServiceRequest[] = [
  { id: "REQ-081", building: "Harlow Tower A", issue: "HVAC not cooling", priority: "high", status: "new", date: "2026-04-07", assignedVendorId: "vendor-1" },
  { id: "REQ-079", building: "Meridian Block 3", issue: "Elevator maintenance", priority: "medium", status: "in_progress", date: "2026-04-05", assignedVendorId: "vendor-1" },
  { id: "REQ-074", building: "Oakfield Centre", issue: "Plumbing leak — floor 2", priority: "high", status: "new", date: "2026-04-03", assignedVendorId: "vendor-1" },
  { id: "REQ-068", building: "Harlow Tower B", issue: "Fire alarm inspection", priority: "low", status: "in_progress", date: "2026-03-29", assignedVendorId: "vendor-1" },
  { id: "REQ-061", building: "Nexus Office Park", issue: "Electrical panel check", priority: "medium", status: "completed", date: "2026-03-24", assignedVendorId: "vendor-1" },
]

const memoryInvoices: VendorInvoice[] = [
  { id: "inv-1", vendorId: "vendor-1", invoiceNumber: "INV-1042", amount: 1250.00, serviceDate: "2026-03-24", notes: "Electrical panel inspection and repair", requestId: "REQ-061", status: "pending", createdAt: "2026-04-09T10:14:00Z" },
]

const memoryAppointments: Appointment[] = [
  { id: "apt-1", vendorId: "vendor-1", date: "2026-04-12", time: "9:00 AM", building: "Harlow Tower A", contact: "Sarah Chen", description: "HVAC Inspection" },
  { id: "apt-2", vendorId: "vendor-1", date: "2026-04-15", time: "2:30 PM", building: "Oakfield Centre", contact: "James Patel", description: "Plumbing Assessment" },
]

// ─── Service Requests ───────────────────────────────────────────────────────────

export async function listServiceRequests(vendorId: string): Promise<ServiceRequest[]> {
  try {
    const data = await supabaseRequest(
      `vendor_service_requests?assigned_vendor_id=eq.${encodeURIComponent(vendorId)}&order=date.desc`
    )
    if (data && Array.isArray(data)) {
      return data.map(mapDbRequest)
    }
  } catch {
    // fall through to memory
  }
  return memoryRequests.filter((r) => r.assignedVendorId === vendorId || vendorId === "vendor-1")
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
): Promise<ServiceRequest | null> {
  try {
    const data = await supabaseRequest(
      `vendor_service_requests?id=eq.${encodeURIComponent(requestId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    )
    if (data && Array.isArray(data) && data.length > 0) {
      return mapDbRequest(data[0])
    }
  } catch {
    // fall through to memory
  }
  const req = memoryRequests.find((r) => r.id === requestId)
  if (req) {
    req.status = status
    return { ...req }
  }
  return null
}

// ─── Invoices ───────────────────────────────────────────────────────────────────

export async function listInvoices(vendorId: string): Promise<VendorInvoice[]> {
  try {
    const data = await supabaseRequest(
      `vendor_invoices?vendor_id=eq.${encodeURIComponent(vendorId)}&order=created_at.desc`
    )
    if (data && Array.isArray(data)) {
      return data.map(mapDbInvoice)
    }
  } catch {
    // fall through to memory
  }
  return memoryInvoices.filter((inv) => inv.vendorId === vendorId || vendorId === "vendor-1")
}

export interface CreateInvoiceInput {
  vendorId: string
  invoiceNumber: string
  amount: number
  serviceDate: string | null
  notes: string
  requestId: string | null
}

export async function createInvoice(input: CreateInvoiceInput): Promise<VendorInvoice> {
  const now = new Date().toISOString()
  const id = `inv-${Date.now()}`

  try {
    const data = await supabaseRequest("vendor_invoices", {
      method: "POST",
      body: JSON.stringify({
        id,
        vendor_id: input.vendorId,
        invoice_number: input.invoiceNumber,
        amount: input.amount,
        service_date: input.serviceDate,
        notes: input.notes,
        request_id: input.requestId,
        status: "pending",
        created_at: now,
      }),
    })
    if (data && Array.isArray(data) && data.length > 0) {
      return mapDbInvoice(data[0])
    }
  } catch {
    // fall through to memory
  }

  const invoice: VendorInvoice = {
    id,
    vendorId: input.vendorId,
    invoiceNumber: input.invoiceNumber,
    amount: input.amount,
    serviceDate: input.serviceDate,
    notes: input.notes,
    requestId: input.requestId,
    status: "pending",
    createdAt: now,
  }
  memoryInvoices.unshift(invoice)
  return invoice
}

// ─── Appointments ───────────────────────────────────────────────────────────────

export async function listAppointments(vendorId: string): Promise<Appointment[]> {
  try {
    const data = await supabaseRequest(
      `vendor_appointments?vendor_id=eq.${encodeURIComponent(vendorId)}&order=date.asc`
    )
    if (data && Array.isArray(data)) {
      return data.map(mapDbAppointment)
    }
  } catch {
    // fall through to memory
  }
  return memoryAppointments.filter((a) => a.vendorId === vendorId || vendorId === "vendor-1")
}

// ─── Stats ──────────────────────────────────────────────────────────────────────

export async function getVendorStats(vendorId: string): Promise<VendorStats> {
  const [requests, invoices, appointments] = await Promise.all([
    listServiceRequests(vendorId),
    listInvoices(vendorId),
    listAppointments(vendorId),
  ])

  const openRequests = requests.filter((r) => r.status === "new" || r.status === "in_progress").length
  const pendingInvoices = invoices.filter((inv) => inv.status === "pending").length
  const completedThisMonth = requests.filter((r) => {
    if (r.status !== "completed") return false
    const d = new Date(r.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return {
    openRequests,
    upcomingAppointments: appointments.length,
    pendingInvoices,
    completedThisMonth,
  }
}

// ─── DB Health Check ────────────────────────────────────────────────────────────

export interface DbHealthResult {
  status: "healthy" | "degraded" | "unavailable"
  supabase: {
    configured: boolean
    reachable: boolean
    latencyMs: number | null
    error: string | null
  }
  tables: {
    name: string
    accessible: boolean
    error: string | null
  }[]
  timestamp: string
}

export async function checkDatabaseHealth(): Promise<DbHealthResult> {
  const config = getConfig()
  const result: DbHealthResult = {
    status: "unavailable",
    supabase: {
      configured: !!config,
      reachable: false,
      latencyMs: null,
      error: null,
    },
    tables: [],
    timestamp: new Date().toISOString(),
  }

  if (!config) {
    result.supabase.error = "Supabase configuration not found (using in-memory fallback)"
    result.status = "degraded"
    return result
  }

  // Ping Supabase
  const start = Date.now()
  try {
    const resp = await fetch(`${config.url}/rest/v1/`, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
      cache: "no-store",
    })
    result.supabase.latencyMs = Date.now() - start
    result.supabase.reachable = resp.ok
    if (!resp.ok) {
      result.supabase.error = `HTTP ${resp.status}`
    }
  } catch (err) {
    result.supabase.latencyMs = Date.now() - start
    result.supabase.error = err instanceof Error ? err.message : "Unknown error"
  }

  // Probe vendor tables
  const tablesToCheck = [
    "vendor_service_requests",
    "vendor_invoices",
    "vendor_appointments",
    "marketplace_listings",
  ]

  for (const table of tablesToCheck) {
    try {
      const resp = await fetch(`${config.url}/rest/v1/${table}?select=id&limit=1`, {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
        },
        cache: "no-store",
      })
      result.tables.push({
        name: table,
        accessible: resp.ok,
        error: resp.ok ? null : `HTTP ${resp.status}`,
      })
    } catch (err) {
      result.tables.push({
        name: table,
        accessible: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  const allReachable = result.supabase.reachable && result.tables.every((t) => t.accessible)
  const someReachable = result.supabase.reachable || result.tables.some((t) => t.accessible)

  result.status = allReachable ? "healthy" : someReachable ? "degraded" : "unavailable"
  return result
}

// ─── DB row mappers ─────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapDbRequest(row: any): ServiceRequest {
  return {
    id: row.id,
    building: row.building,
    issue: row.issue,
    priority: row.priority,
    status: row.status,
    date: row.date,
    assignedVendorId: row.assigned_vendor_id,
  }
}

function mapDbInvoice(row: any): VendorInvoice {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    invoiceNumber: row.invoice_number,
    amount: Number(row.amount),
    serviceDate: row.service_date,
    notes: row.notes || "",
    requestId: row.request_id,
    status: row.status,
    createdAt: row.created_at,
  }
}

function mapDbAppointment(row: any): Appointment {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    date: row.date,
    time: row.time,
    building: row.building,
    contact: row.contact,
    description: row.description,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
