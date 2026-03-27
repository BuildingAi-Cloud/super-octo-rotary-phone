import {
  createAmenity,
  deleteAmenityById,
  listAmenities,
  updateAmenity,
  type Amenity,
  type AmenityApprover,
  type AmenityDetails,
  type AmenityPolicy,
  type AmenityRules,
  type AmenityStatus,
} from "@/lib/amenity-store"

const DEFAULT_POLICY: AmenityPolicy = "auto_approve"
const DEFAULT_STATUS: AmenityStatus = "available"

interface SupabaseConfig {
  url: string
  key: string
  table: string
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  return {
    url,
    key,
    table: process.env.SUPABASE_AMENITIES_TABLE || "amenities",
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

function normalizeAmenity(input: Partial<Amenity>): Amenity {
  return {
    id: input.id || crypto.randomUUID(),
    name: input.name || "Unnamed Amenity",
    status: input.status || DEFAULT_STATUS,
    policy: input.policy || DEFAULT_POLICY,
    approver: input.approver,
    details: input.details,
    rules: input.rules,
  }
}

export interface AmenityCreateInput {
  name: string
  status?: AmenityStatus
  policy?: AmenityPolicy
  approver?: AmenityApprover
  details?: AmenityDetails
  rules?: AmenityRules
}

export interface AmenityUpdateInput {
  name?: string
  status?: AmenityStatus
  policy?: AmenityPolicy
  approver?: AmenityApprover
  details?: AmenityDetails
  rules?: AmenityRules
}

export async function getAllAmenities(): Promise<Amenity[]> {
  const config = getSupabaseConfig()
  if (!config) return listAmenities()

  try {
    const data = await supabaseRequest(`${config.table}?select=*`)
    if (!Array.isArray(data)) return listAmenities()
    return data.map(row => normalizeAmenity(row as Partial<Amenity>))
  } catch {
    return listAmenities()
  }
}

export async function createAmenityRecord(input: AmenityCreateInput): Promise<Amenity> {
  const payload = normalizeAmenity(input)
  const config = getSupabaseConfig()

  if (config) {
    try {
      const data = await supabaseRequest(config.table, {
        method: "POST",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      })

      if (Array.isArray(data) && data[0]) {
        return normalizeAmenity(data[0] as Partial<Amenity>)
      }
    } catch {
      // Fallback to in-memory store.
    }
  }

  return createAmenity(payload)
}

export async function updateAmenityRecord(id: string, updates: AmenityUpdateInput): Promise<Amenity | null> {
  const config = getSupabaseConfig()

  if (config) {
    try {
      const data = await supabaseRequest(`${config.table}?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify(updates),
      })

      if (Array.isArray(data) && data[0]) {
        return normalizeAmenity(data[0] as Partial<Amenity>)
      }
    } catch {
      // Fallback to in-memory store.
    }
  }

  return updateAmenity(id, updates)
}

export async function deleteAmenityRecord(id: string): Promise<boolean> {
  const config = getSupabaseConfig()

  if (config) {
    try {
      await supabaseRequest(`${config.table}?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      return true
    } catch {
      // Fallback to in-memory store.
    }
  }

  return deleteAmenityById(id)
}
