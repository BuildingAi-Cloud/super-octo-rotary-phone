"use client"

import { useState } from "react"
import { bookingStore, updateBookingStatus, getBookingsForAmenity } from "@/lib/amenity-store"

import type { AmenityPolicy, AmenityApprover } from "@/lib/amenity-store"

interface AmenityDetails {
  amenityName: string
  type: string
  capacity: number
  description: string
  openingTime: string
  closingTime: string
  active: boolean
}

interface AmenityRules {
  minSlotDuration: "15m" | "30m" | "1h"
  maxBookingDuration: "30m" | "1h" | "2h" | "4h"
  advanceBookingWindowDays: number
  capacityOverride?: number
  allowOverlappingBookings: boolean
  bookingApprovalRequired: boolean
}

interface Amenity {
  id: string
  name: string
  status: "available" | "maintenance" | "booked"
  policy: AmenityPolicy
  approver?: AmenityApprover
  nextSlot?: string
  capacity?: string
  reopens?: string
  details?: AmenityDetails
  rules?: AmenityRules
}

import { useAuth } from "@/lib/auth-context"

function createDefaultDetails(amenityName: string): AmenityDetails {
  return {
    amenityName,
    type: "Other",
    capacity: 0,
    description: "",
    openingTime: "09:00",
    closingTime: "18:00",
    active: true,
  }
}

function createDefaultRules(): AmenityRules {
  return {
    minSlotDuration: "30m",
    maxBookingDuration: "2h",
    advanceBookingWindowDays: 30,
    capacityOverride: undefined,
    allowOverlappingBookings: false,
    bookingApprovalRequired: false,
  }
}

export function AmenityManagement({ initialAmenities }: { initialAmenities: Amenity[] }) {
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities)
  const [newAmenity, setNewAmenity] = useState("")
  const [activeEditAmenityId, setActiveEditAmenityId] = useState<string | null>(null)
  const [activeRulesAmenityId, setActiveRulesAmenityId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<AmenityDetails>(createDefaultDetails(""))
  const [rulesForm, setRulesForm] = useState<AmenityRules>(createDefaultRules())
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

  function openEditModal(amenity: Amenity) {
    setActiveEditAmenityId(amenity.id)
    setEditForm(amenity.details || createDefaultDetails(amenity.name))
  }

  function saveEditDetails() {
    if (!activeEditAmenityId) return
    setAmenities(amenities.map(amenity => {
      if (amenity.id !== activeEditAmenityId) return amenity
      return {
        ...amenity,
        name: editForm.amenityName,
        details: editForm,
      }
    }))
    setActiveEditAmenityId(null)
  }

  function openRulesModal(amenity: Amenity) {
    setActiveRulesAmenityId(amenity.id)
    setRulesForm(amenity.rules || createDefaultRules())
  }

  function saveRules() {
    if (!activeRulesAmenityId) return
    setAmenities(amenities.map(amenity => {
      if (amenity.id !== activeRulesAmenityId) return amenity
      return {
        ...amenity,
        rules: rulesForm,
      }
    }))
    setActiveRulesAmenityId(null)
  }

  const activeRulesAmenity = amenities.find(amenity => amenity.id === activeRulesAmenityId)

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
            <button
              onClick={() => openEditModal(amenity)}
              className="border border-border px-3 py-1 font-mono text-xs uppercase"
            >
              Edit
            </button>
            <button
              onClick={() => openRulesModal(amenity)}
              className="border border-border px-3 py-1 font-mono text-xs uppercase"
            >
              Rules
            </button>
            <button onClick={() => deleteAmenity(amenity.id)} className="text-destructive font-mono text-xs uppercase ml-auto">Delete</button>
          </div>
        ))}
      </div>

      {activeEditAmenityId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg border border-border bg-background p-6">
            <h3 className="font-mono text-sm uppercase tracking-widest mb-4">Edit Amenity</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-mono text-xs uppercase mb-1">Amenity Name</label>
                <input
                  value={editForm.amenityName}
                  onChange={e => setEditForm({ ...editForm, amenityName: e.target.value })}
                  className="w-full border border-border px-3 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase mb-1">Type</label>
                <input
                  value={editForm.type}
                  onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                  placeholder="Gym, Pool, Conference Room, Party Room, BBQ, Other"
                  className="w-full border border-border px-3 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase mb-1">Capacity</label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={e => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                  className="w-full border border-border px-3 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full border border-border px-3 py-2 font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Opening Time</label>
                  <input
                    type="time"
                    value={editForm.openingTime}
                    onChange={e => setEditForm({ ...editForm, openingTime: e.target.value })}
                    className="w-full border border-border px-3 py-2 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase mb-1">Closing Time</label>
                  <input
                    type="time"
                    value={editForm.closingTime}
                    onChange={e => setEditForm({ ...editForm, closingTime: e.target.value })}
                    className="w-full border border-border px-3 py-2 font-mono text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 font-mono text-xs uppercase">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={e => setEditForm({ ...editForm, active: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setActiveEditAmenityId(null)}
                className="border border-border px-4 py-2 font-mono text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={saveEditDetails}
                className="bg-accent px-4 py-2 text-accent-foreground font-mono text-xs uppercase"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {activeRulesAmenityId && activeRulesAmenity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg border border-border bg-background p-6">
            <h3 className="font-mono text-sm uppercase tracking-widest mb-4">Manage Rules - {activeRulesAmenity.name}</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-mono text-xs uppercase mb-1">Min Slot Duration</label>
                <select
                  value={rulesForm.minSlotDuration}
                  onChange={e => setRulesForm({ ...rulesForm, minSlotDuration: e.target.value as AmenityRules["minSlotDuration"] })}
                  className="w-full border border-border px-3 py-2 font-mono text-sm"
                >
                  <option value="15m">15 min</option>
                  <option value="30m">30 min</option>
                  <option value="1h">1 hour</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase mb-1">Max Booking Duration</label>
                <select
                  value={rulesForm.maxBookingDuration}
                  onChange={e => setRulesForm({ ...rulesForm, maxBookingDuration: e.target.value as AmenityRules["maxBookingDuration"] })}
                  className="w-full border border-border px-3 py-2 font-mono text-sm"
                >
                  <option value="30m">30 min</option>
                  <option value="1h">1 hour</option>
                  <option value="2h">2 hours</option>
                  <option value="4h">4 hours</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase mb-1">Advance Booking Window in days</label>
                <input
                  type="number"
                  value={rulesForm.advanceBookingWindowDays}
                  onChange={e => setRulesForm({ ...rulesForm, advanceBookingWindowDays: Number(e.target.value) })}
                  className="w-full border border-border px-3 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase mb-1">Capacity Override (optional)</label>
                <input
                  type="number"
                  value={rulesForm.capacityOverride ?? ""}
                  onChange={e => {
                    const nextValue = e.target.value
                    setRulesForm({
                      ...rulesForm,
                      capacityOverride: nextValue === "" ? undefined : Number(nextValue),
                    })
                  }}
                  className="w-full border border-border px-3 py-2 font-mono text-sm"
                />
              </div>
              <label className="flex items-center gap-2 font-mono text-xs uppercase">
                <input
                  type="checkbox"
                  checked={rulesForm.allowOverlappingBookings}
                  onChange={e => setRulesForm({ ...rulesForm, allowOverlappingBookings: e.target.checked })}
                />
                Allow Overlapping Bookings
              </label>
              <label className="flex items-center gap-2 font-mono text-xs uppercase">
                <input
                  type="checkbox"
                  checked={rulesForm.bookingApprovalRequired}
                  onChange={e => setRulesForm({ ...rulesForm, bookingApprovalRequired: e.target.checked })}
                />
                Booking Approval Required
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setActiveRulesAmenityId(null)}
                className="border border-border px-4 py-2 font-mono text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={saveRules}
                className="bg-accent px-4 py-2 text-accent-foreground font-mono text-xs uppercase"
              >
                Save Rules
              </button>
            </div>
          </div>
        </div>
      )}

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
  );
}
