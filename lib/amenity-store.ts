// Simple in-memory amenity and booking store for demo
export type AmenityStatus = "available" | "maintenance" | "booked"
export type AmenityPolicy = "auto_approve" | "manager_approval"
export type AmenityApprover = "facility_manager" | "concierge" | "property_manager"

export interface AmenityDetails {
  amenityName: string
  type: string
  capacity: number
  description: string
  openingTime: string
  closingTime: string
  active: boolean
}

export interface AmenityRules {
  minSlotDuration: "15m" | "30m" | "1h"
  maxBookingDuration: "30m" | "1h" | "2h" | "4h"
  advanceBookingWindowDays: number
  capacityOverride?: number
  allowOverlappingBookings: boolean
  bookingApprovalRequired: boolean
}

export interface Amenity {
  id: string
  name: string
  status: AmenityStatus
  policy: AmenityPolicy
  approver?: AmenityApprover
  details?: AmenityDetails
  rules?: AmenityRules
}
export interface Booking {
  id: string
  amenityId: string
  userId: string
  date: string
  time: string
  status: "pending" | "approved" | "rejected"
}

export const amenityStore: Amenity[] = [
  { id: "1", name: "Rooftop Lounge", status: "available", policy: "auto_approve" },
  { id: "2", name: "Fitness Center", status: "available", policy: "manager_approval", approver: "facility_manager" },
  { id: "3", name: "Pool & Spa", status: "maintenance", policy: "manager_approval", approver: "concierge" },
]

export const bookingStore: Booking[] = []

export function addBooking(booking: Booking) {
  // Find amenity and check policy
  const amenity = amenityStore.find(a => a.id === booking.amenityId)
  if (!amenity) return

  if (amenity.policy === "auto_approve" && amenity.status === "available") {
    booking.status = "approved"
  } else {
    booking.status = "pending"
  }

  bookingStore.push(booking)
}

export function updateBookingStatus(id: string, status: "approved" | "rejected") {
  const booking = bookingStore.find(b => b.id === id)
  if (booking) booking.status = status
}

export function getBookingsForAmenity(amenityId: string) {
  return bookingStore.filter(b => b.amenityId === amenityId)
}

export function getBookingsForUser(userId: string) {
  return bookingStore.filter(b => b.userId === userId)
}

export function listAmenities() {
  return [...amenityStore]
}

export function createAmenity(amenity: Amenity) {
  amenityStore.push(amenity)
  return amenity
}

export function updateAmenity(id: string, updates: Partial<Amenity>) {
  const index = amenityStore.findIndex(a => a.id === id)
  if (index === -1) return null
  amenityStore[index] = { ...amenityStore[index], ...updates }
  return amenityStore[index]
}

export function deleteAmenityById(id: string) {
  const index = amenityStore.findIndex(a => a.id === id)
  if (index === -1) return false
  amenityStore.splice(index, 1)
  return true
}
