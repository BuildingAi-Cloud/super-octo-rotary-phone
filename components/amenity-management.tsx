"use client"

import { useState } from "react"
import { bookingStore, updateBookingStatus, getBookingsForAmenity } from "@/lib/amenity-store"

interface Amenity {
  id: string
  name: string
  status: "available" | "maintenance" | "booked"
  nextSlot?: string
  capacity?: string
  reopens?: string
}

export function AmenityManagement({ initialAmenities }: { initialAmenities: Amenity[] }) {
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities)
  const [newAmenity, setNewAmenity] = useState("")

  function addAmenity() {
    if (!newAmenity.trim()) return
    setAmenities([
      ...amenities,
      { id: crypto.randomUUID(), name: newAmenity, status: "available" }
    ])
    setNewAmenity("")
  }

  function updateAmenityStatus(id: string, status: Amenity["status"]) {
    setAmenities(amenities.map(a => a.id === id ? { ...a, status } : a))
  }

  function deleteAmenity(id: string) {
    setAmenities(amenities.filter(a => a.id !== id))
  }

  return (
    <section className="mb-8">
      <h2 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">AMENITY MANAGEMENT</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={newAmenity}
          onChange={e => setNewAmenity(e.target.value)}
          placeholder="Amenity name"
          className="border border-border px-3 py-2 font-mono text-sm"
        />
        <button onClick={addAmenity} className="bg-accent px-4 py-2 text-accent-foreground font-mono text-xs uppercase tracking-widest">Add</button>
      </div>
      <div className="space-y-3">
        {amenities.map(amenity => (
          <div key={amenity.id} className="flex items-center gap-4 border border-border/40 bg-card/30 p-4">
            <span className="font-mono text-xs">{amenity.name}</span>
            <select
              value={amenity.status}
              onChange={e => updateAmenityStatus(amenity.id, e.target.value as Amenity["status"])}
              className="font-mono text-xs border border-border px-2 py-1"
            >
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
              <option value="booked">Booked</option>
            </select>
            <button onClick={() => deleteAmenity(amenity.id)} className="text-destructive font-mono text-xs uppercase ml-auto">Delete</button>
          </div>
        ))}
      </div>
      {/* Booking approval section */}
      <div className="mt-8">
        <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Pending Amenity Bookings</h3>
        {amenities.map(amenity => {
          const bookings = getBookingsForAmenity(amenity.id).filter(b => b.status === "pending")
          if (!bookings.length) return null
          return (
            <div key={amenity.id} className="mb-4">
              <span className="font-mono text-xs">{amenity.name}</span>
              <div className="space-y-2 mt-2">
                {bookings.map(booking => (
                  <div key={booking.id} className="flex items-center gap-4 border border-accent/30 bg-accent/5 p-2">
                    <span className="font-mono text-xs">{booking.date} {booking.time}</span>
                    <span className="font-mono text-xs">User: {booking.userId}</span>
                    <button onClick={() => updateBookingStatus(booking.id, "approved")} className="bg-green-500/20 text-green-700 px-2 py-1 font-mono text-xs uppercase">Approve</button>
                    <button onClick={() => updateBookingStatus(booking.id, "rejected")} className="bg-red-500/20 text-red-700 px-2 py-1 font-mono text-xs uppercase">Reject</button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
