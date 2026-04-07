import { NextResponse } from "next/server"
import { amenityStore, bookingStore, type Booking } from "@/lib/amenity-store"

type BookingChallenge = {
  amenityId: string
  ip: string
  expiresAt: number
  used: boolean
}

const bookingChallengeStore = new Map<string, BookingChallenge>()
const bookingRateStore = new Map<string, number[]>()

const CHALLENGE_TTL_MS = 2 * 60 * 1000
const FORM_MIN_FILL_MS = 2 * 1000
const FORM_MAX_AGE_MS = 15 * 60 * 1000
const RATE_WINDOW_MS = 5 * 60 * 1000
const RATE_LIMIT_MAX = 3

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") || ""
  const primary = forwarded.split(",")[0]?.trim()
  if (primary) return primary
  return "unknown"
}

function consumeRateLimit(key: string): boolean {
  const now = Date.now()
  const history = (bookingRateStore.get(key) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS)
  if (history.length >= RATE_LIMIT_MAX) {
    bookingRateStore.set(key, history)
    return false
  }
  history.push(now)
  bookingRateStore.set(key, history)
  return true
}

function cleanupChallenges() {
  const now = Date.now()
  for (const [nonce, challenge] of bookingChallengeStore.entries()) {
    if (challenge.expiresAt <= now || challenge.used) {
      bookingChallengeStore.delete(nonce)
    }
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get("mode")

  if (mode === "challenge") {
    const amenityId = (url.searchParams.get("amenityId") || "").trim()
    if (!amenityId) {
      return NextResponse.json({ error: "Amenity id is required" }, { status: 400 })
    }

    cleanupChallenges()
    const nonce = crypto.randomUUID()
    const challenge: BookingChallenge = {
      amenityId,
      ip: getClientIp(request),
      expiresAt: Date.now() + CHALLENGE_TTL_MS,
      used: false,
    }
    bookingChallengeStore.set(nonce, challenge)

    return NextResponse.json({ nonce, expiresAt: challenge.expiresAt })
  }

  const userId = (url.searchParams.get("userId") || "").trim()
  if (!userId) {
    return NextResponse.json({ bookings: [] })
  }

  const bookings = bookingStore.filter((booking) => booking.userId === userId)
  return NextResponse.json({ bookings })
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  cleanupChallenges()

  let body: {
    amenityId?: string
    userId?: string
    date?: string
    time?: string
    nonce?: string
    submittedAt?: number
    website?: string
  }

  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const amenityId = (body.amenityId || "").trim()
  const userId = (body.userId || "").trim()
  const date = (body.date || "").trim()
  const time = (body.time || "").trim()
  const nonce = (body.nonce || "").trim()
  const website = (body.website || "").trim()
  const submittedAt = Number(body.submittedAt)

  if (!amenityId || !userId || !date || !time || !nonce || !Number.isFinite(submittedAt)) {
    return NextResponse.json({ error: "Missing booking fields" }, { status: 400 })
  }

  if (website) {
    return NextResponse.json({ error: "Automation rejected" }, { status: 400 })
  }

  if (amenityId.length > 64 || userId.length > 128 || time.length > 120) {
    return NextResponse.json({ error: "Invalid booking payload" }, { status: 400 })
  }

  const elapsed = Date.now() - submittedAt
  if (elapsed < FORM_MIN_FILL_MS || elapsed > FORM_MAX_AGE_MS) {
    return NextResponse.json({ error: "Form timing validation failed" }, { status: 429 })
  }

  const challenge = bookingChallengeStore.get(nonce)
  if (!challenge || challenge.used || challenge.expiresAt < Date.now()) {
    return NextResponse.json({ error: "Invalid or expired booking challenge" }, { status: 429 })
  }

  if (challenge.amenityId !== amenityId) {
    return NextResponse.json({ error: "Challenge mismatch" }, { status: 429 })
  }

  if (challenge.ip !== ip) {
    return NextResponse.json({ error: "Challenge source mismatch" }, { status: 429 })
  }

  const limitKey = `${ip}:${userId}`
  if (!consumeRateLimit(limitKey)) {
    return NextResponse.json({ error: "Too many booking attempts. Please wait and retry." }, { status: 429 })
  }

  const amenity = amenityStore.find((item) => item.id === amenityId)
  if (!amenity) {
    return NextResponse.json({ error: "Amenity not found" }, { status: 404 })
  }

  if (amenity.status !== "available") {
    return NextResponse.json({ error: "Amenity is not currently available" }, { status: 409 })
  }

  const hasDuplicateSlot = bookingStore.some(
    (entry) =>
      entry.amenityId === amenityId &&
      entry.date === date &&
      entry.time.toLowerCase() === time.toLowerCase() &&
      (entry.status === "approved" || entry.status === "pending"),
  )

  if (hasDuplicateSlot) {
    return NextResponse.json({ error: "This amenity slot is already reserved" }, { status: 409 })
  }

  challenge.used = true
  bookingChallengeStore.set(nonce, challenge)

  const booking: Booking = {
    id: crypto.randomUUID(),
    amenityId,
    userId,
    date,
    time,
    status: amenity.policy === "auto_approve" ? "approved" : "pending",
  }

  bookingStore.push(booking)
  return NextResponse.json({ booking }, { status: 201 })
}
