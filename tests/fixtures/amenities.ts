// Amenity test fixtures
import type { Amenity, Booking } from '@/lib/amenity-store'

export const sampleAmenity: Amenity = {
  id: 'amenity-1',
  name: 'Rooftop Lounge',
  status: 'available',
  policy: 'auto_approve',
}

export const sampleAmenityWithApproval: Amenity = {
  id: 'amenity-2',
  name: 'Fitness Center',
  status: 'available',
  policy: 'manager_approval',
  approver: 'facility_manager',
}

export const sampleBooking: Booking = {
  id: 'booking-1',
  amenityId: 'amenity-1',
  userId: 'user-resident-1',
  date: '2026-04-10',
  time: '14:00',
  status: 'pending',
}
