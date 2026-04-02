"use client";

import React, { useState, useEffect } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, SectionCard, EmptyState, SimpleBarChart } from "./bm-shared";

type AmenityFilter = "all" | "available" | "booked" | "maintenance";
type AmenityView = "amenities" | "bookings" | "policies";

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

interface AmenityPolicy {
  amenityId: string;
  openTime: string;       // e.g. "08:00"
  closeTime: string;      // e.g. "22:00"
  maxGuests: number;
  advanceNoticeDays: number;
  cleanupMinutes: number;
  rules: string[];        // free-text rules list
}

const POLICY_STORAGE_KEY = "buildsync_amenity_policies";

const DEFAULT_POLICIES: AmenityPolicy[] = [
  { amenityId: "am1", openTime: "09:00", closeTime: "23:00", maxGuests: 50, advanceNoticeDays: 7, cleanupMinutes: 30, rules: ["No amplified music after 22:00", "Access card required for entry", "Deposit forfeited if room not cleaned", "No open flames"] },
  { amenityId: "am2", openTime: "09:00", closeTime: "23:00", maxGuests: 50, advanceNoticeDays: 7, cleanupMinutes: 30, rules: ["No amplified music after 22:00", "Deposit forfeited if room not cleaned"] },
  { amenityId: "am3", openTime: "15:00", closeTime: "11:00", maxGuests: 4, advanceNoticeDays: 14, cleanupMinutes: 60, rules: ["Max 4 guests", "No parties or events", "Quiet hours after 22:00", "Pets must be approved"] },
  { amenityId: "am4", openTime: "15:00", closeTime: "11:00", maxGuests: 4, advanceNoticeDays: 14, cleanupMinutes: 60, rules: ["Max 4 guests", "No parties or events"] },
  { amenityId: "am5", openTime: "07:00", closeTime: "22:00", maxGuests: 30, advanceNoticeDays: 3, cleanupMinutes: 20, rules: ["No glass containers near the BBQ", "Leave grill clean after use", "Quiet hours after 21:00"] },
  { amenityId: "am6", openTime: "08:00", closeTime: "23:00", maxGuests: 20, advanceNoticeDays: 2, cleanupMinutes: 15, rules: ["Bookings max 3 hours", "No outside food or drinks", "Keep volume at reasonable levels"] },
  { amenityId: "am7", openTime: "06:00", closeTime: "22:00", maxGuests: 1, advanceNoticeDays: 1, cleanupMinutes: 15, rules: ["Private sessions limited to 60 min", "Wipe down equipment after use", "No outside trainers without approval"] },
  { amenityId: "am8", openTime: "08:00", closeTime: "21:00", maxGuests: 40, advanceNoticeDays: 2, cleanupMinutes: 20, rules: ["Towels required on all surfaces", "No glass near pool", "Children under 14 must be supervised"] },
];

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

// ── Policy editor helpers ──────────────────────────────────────────────────

function loadPolicies(): Record<string, AmenityPolicy> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(POLICY_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, AmenityPolicy>;
  } catch { /* ignore */ }
  return {};
}

function buildPolicyMap(): Record<string, AmenityPolicy> {
  const stored = loadPolicies();
  const map: Record<string, AmenityPolicy> = {};
  for (const p of DEFAULT_POLICIES) {
    map[p.amenityId] = stored[p.amenityId] ?? p;
  }
  return map;
}

function savePolicies(map: Record<string, AmenityPolicy>) {
  try {
    localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(map));
  } catch { /* non-blocking */ }
}

// ── PolicyEditor – inline per-amenity form ─────────────────────────────────

function PolicyEditor({
  amenity,
  policy,
  onSave,
}: {
  amenity: Amenity;
  policy: AmenityPolicy;
  onSave: (updated: AmenityPolicy) => void;
}) {
  const [draft, setDraft] = useState<AmenityPolicy>({ ...policy, rules: [...policy.rules] });
  const [newRule, setNewRule] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addRule() {
    const r = newRule.trim();
    if (!r) return;
    setDraft((d) => ({ ...d, rules: [...d.rules, r] }));
    setNewRule("");
  }

  function removeRule(idx: number) {
    setDraft((d) => ({ ...d, rules: d.rules.filter((_, i) => i !== idx) }));
  }

  function updateRule(idx: number, value: string) {
    setDraft((d) => {
      const rules = [...d.rules];
      rules[idx] = value;
      return { ...d, rules };
    });
  }

  return (
    <div className="border border-border/30 rounded-md p-4 bg-card/20 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-[var(--font-bebas)] text-lg tracking-wide">{amenity.name}</h3>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{amenity.type}</p>
        </div>
        <Badge className={amenity.status === "available" ? "border-green-500/40 text-green-500" : amenity.status === "booked" ? "border-blue-500/40 text-blue-500" : "border-red-500/40 text-red-500"}>
          {amenity.status}
        </Badge>
      </div>

      {/* Scheduling settings */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Hours & Limits</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Open</label>
            <input
              type="time"
              value={draft.openTime}
              onChange={(e) => setDraft((d) => ({ ...d, openTime: e.target.value }))}
              className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Close</label>
            <input
              type="time"
              value={draft.closeTime}
              onChange={(e) => setDraft((d) => ({ ...d, closeTime: e.target.value }))}
              className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Max Guests</label>
            <input
              type="number"
              min={1}
              value={draft.maxGuests}
              onChange={(e) => setDraft((d) => ({ ...d, maxGuests: Number(e.target.value) }))}
              className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Advance Notice (days)</label>
            <input
              type="number"
              min={0}
              value={draft.advanceNoticeDays}
              onChange={(e) => setDraft((d) => ({ ...d, advanceNoticeDays: Number(e.target.value) }))}
              className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Cleanup Buffer (min)</label>
            <input
              type="number"
              min={0}
              step={5}
              value={draft.cleanupMinutes}
              onChange={(e) => setDraft((d) => ({ ...d, cleanupMinutes: Number(e.target.value) }))}
              className="w-full bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
            />
          </div>
        </div>
      </div>

      {/* Rules list */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Rules & Policies</p>
        <div className="space-y-2 mb-3">
          {draft.rules.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground italic">No rules set. Add one below.</p>
          )}
          {draft.rules.map((rule, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground w-5 text-right flex-shrink-0">{idx + 1}.</span>
              <input
                type="text"
                value={rule}
                onChange={(e) => updateRule(idx, e.target.value)}
                className="flex-1 bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60"
              />
              <button
                type="button"
                onClick={() => removeRule(idx)}
                className="flex-shrink-0 px-2 py-1.5 text-[10px] font-mono border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add new rule */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRule(); } }}
            placeholder="Type a new rule and press Enter or Add…"
            className="flex-1 bg-background border border-border/40 rounded px-2 py-1.5 font-mono text-xs focus:outline-none focus:border-accent/60 placeholder:text-muted-foreground/50"
          />
          <button
            type="button"
            onClick={addRule}
            className="px-3 py-1.5 text-[10px] font-mono border border-accent/40 text-accent rounded hover:bg-accent/10 transition-colors"
          >
            + Add Rule
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2 border-t border-border/20">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-accent/40 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
        >
          {saved ? "Saved ✓" : "Save Policy"}
        </button>
        <span className="font-mono text-[10px] text-muted-foreground">Changes saved per amenity to local storage</span>
      </div>
    </div>
  );
}

// ── Main tab component ─────────────────────────────────────────────────────

export default function AmenitiesTab() {
  const [filter, setFilter] = useState<AmenityFilter>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<AmenityView>("amenities");
  const [policies, setPolicies] = useState<Record<string, AmenityPolicy>>(buildPolicyMap);

  useEffect(() => {
    setPolicies(buildPolicyMap());
  }, []);

  function handleSavePolicy(updated: AmenityPolicy) {
    const next = { ...policies, [updated.amenityId]: updated };
    setPolicies(next);
    savePolicies(next);
  }

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
      <div className="flex items-center gap-2 flex-wrap">
        {(["amenities", "bookings", "policies"] as AmenityView[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`px-4 py-1.5 text-xs font-mono rounded-md border transition-colors ${view === v ? "border-accent bg-accent/10 text-accent" : "border-border/40 text-muted-foreground hover:text-accent"}`}
          >
            {v === "amenities" ? "Amenities" : v === "bookings" ? "Bookings" : "Policies & Rules"}
          </button>
        ))}
      </div>

      {view !== "policies" && (
        <FilterBar>
          {view === "amenities" && (["all", "available", "booked", "maintenance"] as AmenityFilter[]).map((f) => (
            <FilterChip key={f} label={f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
          ))}
          <SearchInput value={search} onChange={setSearch} placeholder={view === "amenities" ? "Search amenities..." : "Search bookings..."} />
        </FilterBar>
      )}

      {view === "amenities" && (
        <SectionCard title="Amenity Inventory">
          {filteredAmenities.length === 0 ? (
            <EmptyState message="No amenities found" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredAmenities.map((a) => {
                const policy = policies[a.id];
                return (
                  <div key={a.id} className="border border-border/20 rounded-md p-4 hover:bg-card/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-medium">{a.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={a.status === "available" ? "border-green-500/40 text-green-500" : a.status === "booked" ? "border-blue-500/40 text-blue-500" : "border-red-500/40 text-red-500"}>
                          {a.status}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => setView("policies")}
                          title="Edit policy"
                          className="text-[10px] font-mono text-muted-foreground hover:text-accent border border-border/30 rounded px-2 py-0.5 transition-colors"
                        >
                          Policy
                        </button>
                      </div>
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
                      {policy && (
                        <div className="col-span-2 text-[10px] font-mono text-muted-foreground border-t border-border/10 pt-2 mt-1">
                          <span className="uppercase">Hours</span>
                          <p className="text-foreground mt-0.5">{policy.openTime} – {policy.closeTime} · Max {policy.maxGuests} guests</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      {view === "bookings" && (
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

      {view === "policies" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">AMENITY POLICIES & RULES</h2>
            <span className="font-mono text-[10px] text-muted-foreground">{AMENITIES.length} amenities</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Set hours of operation, guest limits, advance notice requirements, cleanup buffers, and custom rules for each amenity. Changes take effect immediately and are visible to residents on the booking portal.
          </p>
          <div className="space-y-4">
            {AMENITIES.map((a) => (
              <PolicyEditor
                key={a.id}
                amenity={a}
                policy={policies[a.id] ?? DEFAULT_POLICIES.find((p) => p.amenityId === a.id)!}
                onSave={handleSavePolicy}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
