import { NextResponse } from "next/server"
import {
  createMarketplaceListing,
  listMarketplaceListings,
  type ContactPreference,
  type CreateMarketplaceListingInput,
  type ListingCategory,
} from "./_storage"

const LISTING_CATEGORIES: ListingCategory[] = ["For Sale", "Free / Giveaway", "Services", "Lost & Found", "Housing Swap"]
const CONTACT_PREFERENCES: ContactPreference[] = ["in_app", "show_email", "show_phone"]

function isListingCategory(value: string): value is ListingCategory {
  return LISTING_CATEGORIES.includes(value as ListingCategory)
}

function isContactPreference(value: string): value is ContactPreference {
  return CONTACT_PREFERENCES.includes(value as ContactPreference)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const categoryRaw = (url.searchParams.get("category") || "").trim()
  const limitRaw = Number(url.searchParams.get("limit") || "100")

  if (categoryRaw && !isListingCategory(categoryRaw)) {
    return NextResponse.json({ error: "Invalid marketplace category" }, { status: 400 })
  }

  const category: ListingCategory | undefined = categoryRaw && isListingCategory(categoryRaw) ? categoryRaw : undefined
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.floor(limitRaw), 1), 200) : 100
  const listings = await listMarketplaceListings({
    category,
    limit,
  })

  return NextResponse.json({ listings })
}

export async function POST(request: Request) {
  let body: Partial<CreateMarketplaceListingInput>

  try {
    body = (await request.json()) as Partial<CreateMarketplaceListingInput>
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const category = String(body.category || "").trim()
  const title = String(body.title || "").trim()
  const description = String(body.description || "").trim()
  const suite = String(body.suite || "").trim()
  const postedByUserId = String(body.postedByUserId || "").trim()
  const postedByName = String(body.postedByName || "").trim()
  const price = body.price === null || body.price === undefined ? null : String(body.price).trim()
  const isFree = Boolean(body.isFree)
  const contactPreferenceRaw = String(body.contactPreference || "in_app").trim()

  if (!isListingCategory(category)) {
    return NextResponse.json({ error: "Valid category is required" }, { status: 400 })
  }

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
  }

  if (!suite || !postedByUserId || !postedByName) {
    return NextResponse.json({ error: "Suite and user details are required" }, { status: 400 })
  }

  if (title.length > 120 || description.length > 1000 || suite.length > 80 || postedByName.length > 120) {
    return NextResponse.json({ error: "Marketplace payload exceeds field limits" }, { status: 400 })
  }

  if (!isFree && (!price || price.length === 0)) {
    return NextResponse.json({ error: "Enter a price or mark listing as free" }, { status: 400 })
  }

  if (price && price.length > 40) {
    return NextResponse.json({ error: "Price value is too long" }, { status: 400 })
  }

  if (!isContactPreference(contactPreferenceRaw)) {
    return NextResponse.json({ error: "Invalid contact preference" }, { status: 400 })
  }

  const listing = await createMarketplaceListing({
    category,
    title,
    description,
    suite,
    postedByUserId,
    postedByName,
    price,
    isFree,
    contactPreference: contactPreferenceRaw,
  })

  return NextResponse.json({ listing }, { status: 201 })
}
