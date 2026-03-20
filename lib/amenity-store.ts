// Simple in-memory amenity and booking store for demo
export type AmenityStatus = "available" | "maintenance" | "booked"
export interface Amenity {
  id: string
  name: string
  status: AmenityStatus
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
  { id: "1", name: "Rooftop Lounge", status: "available" },
  { id: "2", name: "Fitness Center", status: "available" },
  { id: "3", name: "Pool & Spa", status: "maintenance" },
]

export const bookingStore: Booking[] = []

export function addBooking(booking: Booking) {
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
