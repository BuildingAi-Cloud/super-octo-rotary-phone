"use client"

import { useState } from "react"
import { bookingStore, updateBookingStatus, getBookingsForAmenity } from "@/lib/amenity-store"

import type { AmenityPolicy, AmenityApprover } from "@/lib/amenity-store"
interface Amenity {
  id: string
  name: string
  status: "available" | "maintenance" | "booked"
  policy: AmenityPolicy
  approver?: AmenityApprover
  nextSlot?: string
  capacity?: string
  reopens?: string
}

import { useAuth } from "@/lib/auth-context"

export function AmenityManagement({ initialAmenities }: { initialAmenities: Amenity[] }) {
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities)
  const [newAmenity, setNewAmenity] = useState("")
  const { user } = useAuth();

  function addAmenity() {
    if (!newAmenity.trim()) return
    setAmenities([
      ...amenities,
      { id: crypto.randomUUID(), name: newAmenity, status: "available", policy: "auto_approve" }
    ])
    setNewAmenity("")
  }

  function updateAmenityPolicy(id: string, policy: AmenityPolicy) {
    setAmenities(amenities.map(a => a.id === id ? { ...a, policy } : a))
  }
  function updateAmenityApprover(id: string, approver: AmenityApprover) {
    setAmenities(amenities.map(a => a.id === id ? { ...a, approver } : a))
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
          <div key={amenity.id} className="flex flex-wrap items-center gap-4 border border-border/40 bg-card/30 p-4">
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
            <select
              value={amenity.policy}
              onChange={e => updateAmenityPolicy(amenity.id, e.target.value as AmenityPolicy)}
              className="font-mono text-xs border border-border px-2 py-1"
            >
              <option value="auto_approve">Auto-Approve</option>
              <option value="manager_approval">Manager Approval</option>
            </select>
            {amenity.policy === "manager_approval" && (
              <select
                value={amenity.approver || "facility_manager"}
                onChange={e => updateAmenityApprover(amenity.id, e.target.value as AmenityApprover)}
                className="font-mono text-xs border border-border px-2 py-1"
              >
                <option value="facility_manager">Facility Manager</option>
                <option value="concierge">Concierge</option>
                <option value="property_manager">Property Manager</option>
              </select>
            )}
            <button onClick={() => deleteAmenity(amenity.id)} className="text-destructive font-mono text-xs uppercase ml-auto">Delete</button>
          </div>
        ))}
      </div>
      {/* Booking approval section */}
      {user && ["facility_manager", "concierge", "property_manager"].includes(user.role) && (
        <div className="mt-8">
          <h3 className="font-mono text-xs uppercase tracking-widest mb-2">Pending Amenity Bookings</h3>
          {amenities
            .filter(amenity => amenity.policy === "manager_approval" && amenity.approver === user.role)
            .map(amenity => {
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
      )}
    </section>
  )
}
