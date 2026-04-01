"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, EmptyState, SimpleBarChart } from "./bm-shared";

type AmenityFilter = "all" | "available" | "booked" | "maintenance";

interface Amenity {
  id: string;
  name: string;
  type: string;
  status: "available" | "booked" | "maintenance";
  nextAvailable: string;
  depositRequired: number;
  hourlyRate: number;
  bookingsThisMonth: number;
}

interface Booking {
  id: string;
  amenity: string;
  resident: string;
  unit: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  deposit: number;
  depositPaid: boolean;
}

const AMENITIES: Amenity[] = [
  { id: "am1", name: "Party Room A", type: "Event Space", status: "booked", nextAvailable: "2025-01-16", depositRequired: 200, hourlyRate: 50, bookingsThisMonth: 8 },
  { id: "am2", name: "Party Room B", type: "Event Space", status: "available", nextAvailable: "Now", depositRequired: 200, hourlyRate: 50, bookingsThisMonth: 5 },
  { id: "am3", name: "Guest Suite 1", type: "Guest Suite", status: "booked", nextAvailable: "2025-01-17", depositRequired: 150, hourlyRate: 0, bookingsThisMonth: 12 },
  { id: "am4", name: "Guest Suite 2", type: "Guest Suite", status: "maintenance", nextAvailable: "2025-01-25", depositRequired: 150, hourlyRate: 0, bookingsThisMonth: 3 },
  { id: "am5", name: "Rooftop BBQ Area", type: "Outdoor", status: "available", nextAvailable: "Now", depositRequired: 100, hourlyRate: 25, bookingsThisMonth: 15 },
  { id: "am6", name: "Theater Room", type: "Entertainment", status: "available", nextAvailable: "Now", depositRequired: 0, hourlyRate: 30, bookingsThisMonth: 10 },
  { id: "am7", name: "Gym (Private Session)", type: "Fitness", status: "booked", nextAvailable: "2025-01-15 18:00", depositRequired: 0, hourlyRate: 0, bookingsThisMonth: 22 },
  { id: "am8", name: "Pool Deck", type: "Outdoor", status: "maintenance", nextAvailable: "2025-02-01", depositRequired: 0, hourlyRate: 0, bookingsThisMonth: 0 },
];

const BOOKINGS: Booking[] = [
  { id: "b1", amenity: "Party Room A", resident: "Sarah Chen", unit: "14B", date: "2025-01-15", time: "18:00-22:00", status: "confirmed", deposit: 200, depositPaid: true },
  { id: "b2", amenity: "Guest Suite 1", resident: "Marcus Johnson", unit: "8A", date: "2025-01-15", time: "Check-in 15:00", status: "confirmed", deposit: 150, depositPaid: true },
  { id: "b3", amenity: "Rooftop BBQ Area", resident: "Emily Park", unit: "22C", date: "2025-01-16", time: "12:00-16:00", status: "pending", deposit: 100, depositPaid: false },
  { id: "b4", amenity: "Theater Room", resident: "David Kim", unit: "3D", date: "2025-01-17", time: "19:00-21:00", status: "confirmed", deposit: 0, depositPaid: true },
  { id: "b5", amenity: "Party Room B", resident: "Lisa Wang", unit: "22D", date: "2025-01-18", time: "10:00-14:00", status: "pending", deposit: 200, depositPaid: false },
];

export default function AmenitiesTab() {
  const [filter, setFilter] = useState<AmenityFilter>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"amenities" | "bookings">("amenities");

  const filteredAmenities = AMENITIES.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    return a.name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
  });

  const filteredBookings = BOOKINGS.filter((b) =>
    b.resident.toLowerCase().includes(search.toLowerCase()) || b.amenity.toLowerCase().includes(search.toLowerCase()) || b.unit.toLowerCase().includes(search.toLowerCase())
  );

  const usageData = [
    { label: "Party A", value: 8 },
    { label: "Party B", value: 5 },
    { label: "Guest 1", value: 12 },
    { label: "Guest 2", value: 3 },
    { label: "BBQ", value: 15 },
    { label: "Theater", value: 10 },
    { label: "Gym", value: 22 },
  ];

  return (
    <div className="space-y-6">
      {/* Usage chart */}
      <SectionCard title="Monthly Usage">
        <div className="h-24">
          <SimpleBarChart data={usageData} />
        </div>
      </SectionCard>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setView("amenities")} className={`px-4 py-1.5 text-xs font-mono rounded-md border transition-colors ${view === "amenities" ? "border-accent bg-accent/10 text-accent" : "border-border/40 text-muted-foreground hover:text-accent"}`}>
          Amenities
        </button>
        <button type="button" onClick={() => setView("bookings")} className={`px-4 py-1.5 text-xs font-mono rounded-md border transition-colors ${view === "bookings" ? "border-accent bg-accent/10 text-accent" : "border-border/40 text-muted-foreground hover:text-accent"}`}>
          Bookings
        </button>
      </div>

      <FilterBar>
        {view === "amenities" && (["all", "available", "booked", "maintenance"] as AmenityFilter[]).map((f) => (
          <FilterChip key={f} label={f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
        ))}
        <SearchInput value={search} onChange={setSearch} placeholder={view === "amenities" ? "Search amenities..." : "Search bookings..."} />
      </FilterBar>

      {view === "amenities" ? (
        <SectionCard title="Amenity Inventory">
          {filteredAmenities.length === 0 ? (
            <EmptyState message="No amenities found" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredAmenities.map((a) => (
                <div key={a.id} className="border border-border/20 rounded-md p-4 hover:bg-card/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium">{a.name}</span>
                    <Badge className={a.status === "available" ? "border-green-500/40 text-green-500" : a.status === "booked" ? "border-blue-500/40 text-blue-500" : "border-red-500/40 text-red-500"}>
                      {a.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="text-[10px] font-mono text-muted-foreground">
                      <span className="uppercase">Type</span>
                      <p className="text-foreground mt-0.5">{a.type}</p>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      <span className="uppercase">Next Available</span>
                      <p className="text-foreground mt-0.5">{a.nextAvailable}</p>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      <span className="uppercase">Deposit</span>
                      <p className="text-foreground mt-0.5">{a.depositRequired > 0 ? `$${a.depositRequired}` : "None"}</p>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      <span className="uppercase">Bookings (Month)</span>
                      <p className="text-accent mt-0.5">{a.bookingsThisMonth}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ) : (
        <SectionCard title="Upcoming Bookings">
          {filteredBookings.length === 0 ? (
            <EmptyState message="No bookings found" />
          ) : (
            <div className="space-y-2">
              {filteredBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-4 p-3 border border-border/20 rounded-md hover:bg-card/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{b.amenity}</span>
                      <Badge className={b.status === "confirmed" ? "border-green-500/40 text-green-500" : b.status === "pending" ? "border-yellow-500/40 text-yellow-500" : "border-red-500/40 text-red-500"}>
                        {b.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{b.resident} · Unit {b.unit}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{b.date}</span>
                  <span className="text-xs font-mono text-muted-foreground">{b.time}</span>
                  {b.deposit > 0 && (
                    <Badge className={b.depositPaid ? "border-green-500/40 text-green-500" : "border-yellow-500/40 text-yellow-500"}>
                      ${b.deposit} {b.depositPaid ? "paid" : "pending"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
