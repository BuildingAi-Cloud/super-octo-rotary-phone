"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, Icons } from "./fm-shared";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface InboxMessage {
  id: number;
  from: string;
  channel: "email" | "sms" | "portal" | "phone" | "work_order" | "system";
  subject: string;
  preview: string;
  timestamp: string;
  read: boolean;
  priority: "high" | "normal" | "low";
  relatedTo?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_MESSAGES: InboxMessage[] = [
  { id: 1, from: "Maria Lopez (Unit 302)", channel: "portal", subject: "Water pressure issue in bathroom", preview: "Hi, the water pressure in my master bathroom has been low for the past 2 days. Can someone take a look?", timestamp: "2026-04-01 09:15", read: false, priority: "normal", relatedTo: "WO-2026-0445" },
  { id: 2, from: "SafeGuard Security", channel: "system", subject: "After-hours access alert", preview: "Unauthorized access attempt detected at Loading Dock entrance at 02:15 AM. Review camera footage.", timestamp: "2026-04-01 02:15", read: false, priority: "high" },
  { id: 3, from: "CoolTech HVAC", channel: "email", subject: "Quarterly maintenance scheduled", preview: "Confirming HVAC maintenance for April 5th. Tech team will arrive at 8 AM. Please ensure roof access is available.", timestamp: "2026-03-31 16:30", read: true, priority: "normal" },
  { id: 4, from: "Building Owner", channel: "email", subject: "Budget review meeting", preview: "Please prepare the Q1 OpEx report for our meeting on April 10th. Include vendor performance metrics.", timestamp: "2026-03-31 14:00", read: true, priority: "normal" },
  { id: 5, from: "Fire Marshal Office", channel: "phone", subject: "Annual inspection follow-up", preview: "Voicemail: Calling to confirm fire alarm inspection date. Please call back at 555-0142.", timestamp: "2026-03-31 11:20", read: false, priority: "high" },
  { id: 6, from: "IoT System", channel: "system", subject: "Boiler temp above threshold", preview: "Boiler Room sensor reports temperature at 195°F (threshold: 180°F). Automated alert triggered.", timestamp: "2026-03-31 08:45", read: true, priority: "high", relatedTo: "ALERT-2026-0089" },
  { id: 7, from: "James Chen (Unit 401)", channel: "sms", subject: "Package not received", preview: "I got a notification my package was delivered to the mailroom but I can't find it. Can you check?", timestamp: "2026-03-30 17:30", read: true, priority: "low" },
  { id: 8, from: "Work Order System", channel: "work_order", subject: "WO-2026-0440 completed", preview: "Work order for elevator B annual inspection has been marked complete by Otis Service.", timestamp: "2026-03-30 15:00", read: true, priority: "low" },
];

const CHANNEL_ICONS: Record<string, string> = {
  email: "📧",
  sms: "💬",
  portal: "🌐",
  phone: "📞",
  work_order: "🔧",
  system: "⚡",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/10 text-red-500 border-red-500/30",
  normal: "bg-muted/20 text-muted-foreground border-border/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

const CHANNELS = ["all", "email", "sms", "portal", "phone", "work_order", "system"];

export function InboxTab() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [channelFilter, setChannelFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (channelFilter !== "all" && m.channel !== channelFilter) return false;
      if (readFilter === "unread" && m.read) return false;
      if (readFilter === "read" && !m.read) return false;
      if (search && !m.subject.toLowerCase().includes(search.toLowerCase()) && !m.from.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [messages, channelFilter, readFilter, search]);

  const unreadCount = messages.filter((m) => !m.read).length;
  const highPriorityUnread = messages.filter((m) => !m.read && m.priority === "high").length;

  const handleMarkRead = (id: number) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const handleMarkAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="border border-border/30 rounded-lg px-4 py-2 bg-card/30">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Total</span>
          <span className="ml-2 font-mono text-sm font-bold">{messages.length}</span>
        </div>
        <div className="border border-accent/30 rounded-lg px-4 py-2 bg-accent/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Unread</span>
          <span className="ml-2 font-mono text-sm font-bold text-accent">{unreadCount}</span>
        </div>
        {highPriorityUnread > 0 && (
          <div className="border border-red-500/30 rounded-lg px-4 py-2 bg-red-500/5">
            <span className="font-mono text-[10px] text-muted-foreground uppercase">High Priority</span>
            <span className="ml-2 font-mono text-sm font-bold text-red-500">{highPriorityUnread}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search messages..." />
        {unreadCount > 0 && (
          <Button variant="outline" className="text-xs" onClick={handleMarkAllRead}>Mark All Read</Button>
        )}
      </div>

      <FilterBar>
        {CHANNELS.map((c) => (
          <FilterChip key={c} label={c === "all" ? "All Channels" : `${CHANNEL_ICONS[c] ?? ""} ${c.replace(/_/g, " ")}`} active={channelFilter === c} onClick={() => setChannelFilter(c)} />
        ))}
      </FilterBar>
      <div className="flex flex-wrap items-center gap-2">
        {["all", "unread", "read"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All" : s} active={readFilter === s} onClick={() => setReadFilter(s)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No messages match your filters.</p></Empty>
      ) : (
        <div className="space-y-1">
          {filtered.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleMarkRead(msg.id)}
              className={`w-full text-left border rounded-lg p-3 transition-colors ${
                !msg.read ? "border-accent/30 bg-accent/5 hover:bg-accent/10" : "border-border/20 bg-card/20 hover:bg-card/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-sm shrink-0 mt-0.5">{CHANNEL_ICONS[msg.channel]}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-mono text-xs ${!msg.read ? "font-bold text-foreground" : "text-foreground"}`}>{msg.subject}</span>
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                      <Badge className={PRIORITY_COLORS[msg.priority]}>{msg.priority}</Badge>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground block">{msg.from}</span>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{msg.preview}</p>
                    {msg.relatedTo && <span className="font-mono text-[9px] text-accent mt-0.5 block">Related: {msg.relatedTo}</span>}
                  </div>
                </div>
                <span className="font-mono text-[9px] text-muted-foreground whitespace-nowrap shrink-0">{msg.timestamp}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {messages.length} messages</div>
    </div>
  );
}
