// Simple in-memory amenity and booking store for demo
export type AmenityStatus = "available" | "maintenance" | "booked"
export type AmenityPolicy = "auto_approve" | "manager_approval"
export type AmenityApprover = "facility_manager" | "concierge" | "property_manager"
export interface Amenity {
  id: string
  name: string
  status: AmenityStatus
  policy: AmenityPolicy
  approver?: AmenityApprover
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
