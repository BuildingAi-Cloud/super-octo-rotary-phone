import { getSupabaseServerConfig } from "@/lib/runtime-server"

export type ListingCategory = "For Sale" | "Free / Giveaway" | "Services" | "Lost & Found" | "Housing Swap"
export type ContactPreference = "in_app" | "show_email" | "show_phone"
export type ListingStatus = "active" | "archived"

export interface MarketplaceListing {
  id: string
  category: ListingCategory
  title: string
  description: string
  suite: string
  postedByUserId: string
  postedByName: string
  price: string | null
  isFree: boolean
  interests: number
  contactPreference: ContactPreference
  status: ListingStatus
  createdAt: string
  updatedAt: string
  posted: string
}

interface SupabaseConfig {
  url: string
  key: string
  table: string
}

function getSupabaseConfig(): SupabaseConfig | null {
  const supabase = getSupabaseServerConfig()
  if (!supabase) return null

  return {
    url: supabase.url,
    key: supabase.key,
    table: process.env.SUPABASE_MARKETPLACE_LISTINGS_TABLE || "marketplace_listings",
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

function isoFromHoursAgo(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
}

function relativePosted(isoDate: string): string {
  const delta = Date.now() - new Date(isoDate).getTime()
  const minuteMs = 60 * 1000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs

  if (delta < minuteMs) return "just now"
  if (delta < hourMs) return `${Math.max(1, Math.floor(delta / minuteMs))}m ago`
  if (delta < dayMs) return `${Math.max(1, Math.floor(delta / hourMs))}h ago`
  return `${Math.max(1, Math.floor(delta / dayMs))}d ago`
}

function normalizeCategory(input: unknown): ListingCategory {
  const value = String(input || "").trim()
  const allowed: ListingCategory[] = ["For Sale", "Free / Giveaway", "Services", "Lost & Found", "Housing Swap"]
  return allowed.includes(value as ListingCategory) ? (value as ListingCategory) : "For Sale"
}

function normalizeContactPreference(input: unknown): ContactPreference {
  const value = String(input || "").trim()
  if (value === "show_email" || value === "show_phone") return value
  return "in_app"
}

function normalizeListing(row: Record<string, unknown>): MarketplaceListing {
  const createdAt = String(row.createdAt || row.created_at || new Date().toISOString())
  const updatedAt = String(row.updatedAt || row.updated_at || createdAt)
  const category = normalizeCategory(row.category)

  return {
    id: String(row.id || crypto.randomUUID()),
    category,
    title: String(row.title || ""),
    description: String(row.description || ""),
    suite: String(row.suite || "Unassigned"),
    postedByUserId: String(row.postedByUserId || row.posted_by_user_id || ""),
    postedByName: String(row.postedByName || row.posted_by_name || "Resident"),
    price: row.price === null || row.price === undefined || String(row.price).trim() === "" ? null : String(row.price),
    isFree: Boolean(row.isFree ?? row.is_free ?? false),
    interests: Number(row.interests ?? 0) || 0,
    contactPreference: normalizeContactPreference(row.contactPreference || row.contact_preference),
    status: String(row.status || "active") === "archived" ? "archived" : "active",
    createdAt,
    updatedAt,
    posted: relativePosted(createdAt),
  }
}

const memListings: MarketplaceListing[] = [
  {
    id: crypto.randomUUID(),
    category: "For Sale",
    title: "IKEA KALLAX shelf unit - white, 4x2",
    description: "Good condition, pickup from lobby after 6pm.",
    suite: "Suite 204",
    postedByUserId: "seed-tenant-1",
    postedByName: "Suite 204",
    price: "$45",
    isFree: false,
    interests: 3,
    contactPreference: "in_app",
    status: "active",
    createdAt: isoFromHoursAgo(2),
    updatedAt: isoFromHoursAgo(2),
    posted: "2h ago",
  },
  {
    id: crypto.randomUUID(),
    category: "Free / Giveaway",
    title: "Box of moving supplies - bubble wrap and tape rolls",
    description: "Free to pick up this evening.",
    suite: "Suite 512",
    postedByUserId: "seed-tenant-2",
    postedByName: "Suite 512",
    price: null,
    isFree: true,
    interests: 7,
    contactPreference: "in_app",
    status: "active",
    createdAt: isoFromHoursAgo(5),
    updatedAt: isoFromHoursAgo(5),
    posted: "5h ago",
  },
  {
    id: crypto.randomUUID(),
    category: "Services",
    title: "Dog walking - mornings, $20/walk",
    description: "Weekday morning slots available.",
    suite: "Suite 318",
    postedByUserId: "seed-tenant-3",
    postedByName: "Suite 318",
    price: "$20/walk",
    isFree: false,
    interests: 2,
    contactPreference: "in_app",
    status: "active",
    createdAt: isoFromHoursAgo(24),
    updatedAt: isoFromHoursAgo(24),
    posted: "1d ago",
  },
]

export interface ListMarketplaceOptions {
  category?: ListingCategory
  limit?: number
}

export async function listMarketplaceListings(options: ListMarketplaceOptions = {}): Promise<MarketplaceListing[]> {
  const category = options.category
  const limit = Math.min(Math.max(options.limit || 100, 1), 200)
  const config = getSupabaseConfig()

  if (config) {
    try {
      const query = [
        "select=*",
        "status=eq.active",
        category ? `category=eq.${encodeURIComponent(category)}` : "",
        `order=created_at.desc`,
        `limit=${limit}`,
      ]
        .filter(Boolean)
        .join("&")

      const raw = await supabaseRequest(`${config.table}?${query}`)
      if (Array.isArray(raw)) {
        return raw.map((row) => normalizeListing(row as Record<string, unknown>))
      }
    } catch {
      // Fallback to in-memory store.
    }
  }

  const filtered = memListings
    .filter((listing) => listing.status === "active")
    .filter((listing) => !category || listing.category === category)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)

  return filtered.map((listing) => ({
    ...listing,
    posted: relativePosted(listing.createdAt),
  }))
}

export interface CreateMarketplaceListingInput {
  category: ListingCategory
  title: string
  description: string
  suite: string
  postedByUserId: string
  postedByName: string
  price: string | null
  isFree: boolean
  contactPreference: ContactPreference
}

export async function createMarketplaceListing(input: CreateMarketplaceListingInput): Promise<MarketplaceListing> {
  const now = new Date().toISOString()
  const listing: MarketplaceListing = {
    id: crypto.randomUUID(),
    category: input.category,
    title: input.title,
    description: input.description,
    suite: input.suite,
    postedByUserId: input.postedByUserId,
    postedByName: input.postedByName,
    price: input.isFree ? null : input.price,
    isFree: input.isFree,
    interests: 0,
    contactPreference: input.contactPreference,
    status: "active",
    createdAt: now,
    updatedAt: now,
    posted: "just now",
  }

  const config = getSupabaseConfig()
  if (config) {
    try {
      const raw = await supabaseRequest(config.table, {
        method: "POST",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          id: listing.id,
          category: listing.category,
          title: listing.title,
          description: listing.description,
          suite: listing.suite,
          posted_by_user_id: listing.postedByUserId,
          posted_by_name: listing.postedByName,
          price: listing.price,
          is_free: listing.isFree,
          interests: listing.interests,
          contact_preference: listing.contactPreference,
          status: listing.status,
          created_at: listing.createdAt,
          updated_at: listing.updatedAt,
        }),
      })

      if (Array.isArray(raw) && raw[0]) {
        return normalizeListing(raw[0] as Record<string, unknown>)
      }
    } catch {
      // Fallback to in-memory store.
    }
  }

  memListings.unshift(listing)
  return listing
}
