"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, EmptyState } from "./bm-shared";

type Channel = "all" | "announcement" | "direct" | "alert";
type AnnStatus = "sent" | "draft" | "scheduled";

interface Announcement {
  id: string;
  title: string;
  body: string;
  channel: "email" | "sms" | "push" | "in-app";
  audience: string;
  status: AnnStatus;
  sentAt: string | null;
  opens: number;
}

interface DirectMessage {
  id: string;
  resident: string;
  unit: string;
  lastMessage: string;
  unread: number;
  timestamp: string;
}

interface AutoAlert {
  id: string;
  trigger: string;
  template: string;
  channels: string[];
  active: boolean;
  lastFired: string | null;
}

const ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", title: "Fire Drill - Saturday 10 AM", body: "Mandatory building-wide fire drill.", channel: "email", audience: "All Residents", status: "sent", sentAt: "2025-01-14 09:00", opens: 187 },
  { id: "a2", title: "Lobby Renovation Notice", body: "Lobby will be closed Jan 20-25.", channel: "push", audience: "Floors 1-5", status: "scheduled", sentAt: null, opens: 0 },
  { id: "a3", title: "Holiday Hours Update", body: "Office closed Dec 25-Jan 1.", channel: "sms", audience: "All Residents", status: "sent", sentAt: "2024-12-20 14:00", opens: 234 },
  { id: "a4", title: "Parking Garage Maintenance", body: "Level B2 closed for repairs.", channel: "in-app", audience: "Parking Holders", status: "draft", sentAt: null, opens: 0 },
];

const DM_THREADS: DirectMessage[] = [
  { id: "d1", resident: "Sarah Chen", unit: "14B", lastMessage: "Thanks for fixing the leak!", unread: 0, timestamp: "2025-01-14 11:30" },
  { id: "d2", resident: "Marcus Johnson", unit: "8A", lastMessage: "When will the elevator be repaired?", unread: 2, timestamp: "2025-01-14 10:15" },
  { id: "d3", resident: "Emily Park", unit: "22C", lastMessage: "I need to reschedule my move-out", unread: 1, timestamp: "2025-01-13 16:45" },
  { id: "d4", resident: "David Kim", unit: "3D", lastMessage: "Package was delivered to wrong unit", unread: 1, timestamp: "2025-01-13 09:20" },
];

const AUTO_ALERTS: AutoAlert[] = [
  { id: "al1", trigger: "Package Arrived", template: "Your package has arrived at the front desk.", channels: ["push", "sms"], active: true, lastFired: "2025-01-14 11:45" },
  { id: "al2", trigger: "Maintenance Scheduled", template: "Maintenance visit confirmed for {{date}}.", channels: ["email", "push"], active: true, lastFired: "2025-01-14 08:00" },
  { id: "al3", trigger: "Lease Expiry (60 days)", template: "Your lease expires in 60 days. Contact us to renew.", channels: ["email"], active: true, lastFired: "2025-01-10 09:00" },
  { id: "al4", trigger: "Guest Check-in", template: "Your guest {{name}} has checked in.", channels: ["push"], active: false, lastFired: null },
];

export default function CommunicationsTab() {
  const [channel, setChannel] = useState<Channel>("all");
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", body: "", channel: "email", audience: "All Residents" });

  const filteredAnn = ANNOUNCEMENTS.filter((a) => {
    if (channel === "announcement") return true;
    if (channel === "direct" || channel === "alert") return false;
    return true;
  }).filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const filteredDM = DM_THREADS.filter((d) => {
    if (channel === "direct" || channel === "all") return true;
    return false;
  }).filter((d) => d.resident.toLowerCase().includes(search.toLowerCase()) || d.unit.toLowerCase().includes(search.toLowerCase()));

  const filteredAlerts = AUTO_ALERTS.filter((a) => {
    if (channel === "alert" || channel === "all") return true;
    return false;
  });

  return (
    <div className="space-y-6">
      <FilterBar>
        {(["all", "announcement", "direct", "alert"] as Channel[]).map((c) => (
          <FilterChip key={c} label={c === "all" ? "All" : c === "announcement" ? "Announcements" : c === "direct" ? "Direct Messages" : "Auto-Alerts"} active={channel === c} onClick={() => setChannel(c)} />
        ))}
        <SearchInput value={search} onChange={setSearch} placeholder="Search communications..." />
      </FilterBar>

      {(channel === "all" || channel === "announcement") && (
        <SectionCard
          title="Announcements"
          actions={
            <button type="button" onClick={() => setComposeOpen(!composeOpen)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-accent/40 text-accent hover:bg-accent/10 rounded-md transition-colors">
              {Icons.plus} Compose
            </button>
          }
        >
          {composeOpen && (
            <div className="mb-4 p-4 border border-border/30 rounded-md bg-background/50 space-y-3">
              <input type="text" className="w-full px-3 py-2 text-sm font-mono bg-background border border-border/40 rounded-md" placeholder="Subject line..." value={newAnn.title} onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })} />
              <textarea className="w-full px-3 py-2 text-sm font-mono bg-background border border-border/40 rounded-md resize-none" rows={3} placeholder="Message body..." value={newAnn.body} onChange={(e) => setNewAnn({ ...newAnn, body: e.target.value })} />
              <div className="flex items-center gap-3">
                <select className="px-3 py-1.5 text-xs font-mono bg-background border border-border/40 rounded-md" value={newAnn.channel} onChange={(e) => setNewAnn({ ...newAnn, channel: e.target.value })}>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push</option>
                  <option value="in-app">In-App</option>
                </select>
                <select className="px-3 py-1.5 text-xs font-mono bg-background border border-border/40 rounded-md" value={newAnn.audience} onChange={(e) => setNewAnn({ ...newAnn, audience: e.target.value })}>
                  <option>All Residents</option>
                  <option>Floors 1-5</option>
                  <option>Floors 6-10</option>
                  <option>Parking Holders</option>
                </select>
                <button type="button" className="ml-auto flex items-center gap-1 px-4 py-1.5 text-xs font-mono bg-accent text-background rounded-md hover:bg-accent/80 transition-colors">
                  {Icons.send} Send
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {filteredAnn.length === 0 ? (
              <EmptyState message="No announcements found" />
            ) : (
              filteredAnn.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-3 border border-border/20 rounded-md hover:bg-card/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium truncate">{a.title}</span>
                      <Badge className={a.status === "sent" ? "border-green-500/40 text-green-500" : a.status === "scheduled" ? "border-blue-500/40 text-blue-500" : "border-yellow-500/40 text-yellow-500"}>
                        {a.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{a.body}</p>
                  </div>
                  <Badge className="border-border/40 text-muted-foreground">{a.channel}</Badge>
                  <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{a.audience}</span>
                  {a.opens > 0 && <span className="text-xs font-mono text-accent">{a.opens} opens</span>}
                </div>
              ))
            )}
          </div>
        </SectionCard>
      )}

      {(channel === "all" || channel === "direct") && (
        <SectionCard title="Direct Messages">
          {filteredDM.length === 0 ? (
            <EmptyState message="No conversations found" />
          ) : (
            <div className="space-y-2">
              {filteredDM.map((d) => (
                <div key={d.id} className="flex items-center gap-4 p-3 border border-border/20 rounded-md hover:bg-card/50 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-xs font-mono text-accent">
                    {d.resident.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{d.resident}</span>
                      <span className="text-xs text-muted-foreground font-mono">Unit {d.unit}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{d.lastMessage}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-muted-foreground font-mono">{d.timestamp.split(" ")[1]}</span>
                    {d.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-accent text-background text-[10px] font-mono flex items-center justify-center">{d.unread}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {(channel === "all" || channel === "alert") && (
        <SectionCard title="Automated Alerts">
          <div className="space-y-2">
            {filteredAlerts.map((a) => (
              <div key={a.id} className="flex items-center gap-4 p-3 border border-border/20 rounded-md">
                <div className={`w-2 h-2 rounded-full ${a.active ? "bg-green-500" : "bg-gray-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{a.trigger}</span>
                    <Badge className={a.active ? "border-green-500/40 text-green-500" : "border-gray-400/40 text-gray-400"}>
                      {a.active ? "active" : "paused"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{a.template}</p>
                </div>
                <div className="flex gap-1">
                  {a.channels.map((ch) => (
                    <Badge key={ch} className="border-border/40 text-muted-foreground">{ch}</Badge>
                  ))}
                </div>
                {a.lastFired && <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">{a.lastFired}</span>}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
