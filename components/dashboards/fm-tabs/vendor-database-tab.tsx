"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/auth-context";
import { addableRoles, ROLE_TEMPLATES } from "@/lib/rbac";
import {
  listUsers,
  addUser,
  removeUser,
  createInvite,
  listInvites,
  revokeInvite,
  type StoredUser,
  type Invite,
} from "@/lib/user-management-store";

// ── Icons ────────────────────────────────────────────────────────────────────

const VIcons = {
  plus: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>,
  search: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  truck: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /></svg>,
  wrench: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>,
  mail: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>,
};

type SubView = "list" | "add" | "invite";

export function VendorDatabaseTab() {
  const { user } = useAuth();
  const [view, setView] = useState<SubView>("list");
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "vendor" | "staff">("all");

  // Add form
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<UserRole>("vendor");
  const [addCompany, setAddCompany] = useState("");
  const [addMsg, setAddMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Invite form
  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState<UserRole>("vendor");
  const [invMsg, setInvMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allowedRoles = user ? addableRoles(user.role) : [];

  function refresh() {
    setUsers(listUsers(["vendor", "staff"]));
    setInvites(listInvites("pending").filter((i) => ["vendor", "staff"].includes(i.role)));
  }

  useEffect(() => { refresh(); }, []);

  if (!user) return null;
  const currentUser = user;

  const filtered = users.filter((u) => {
    const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || (u.company || "").toLowerCase().includes(search.toLowerCase());
    const mr = roleFilter === "all" || u.role === roleFilter;
    return ms && mr;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = addUser({ email: addEmail, name: addName, role: addRole, company: addCompany || undefined }, currentUser);
    if (!res.success) { setAddMsg({ type: "err", text: res.error || "Failed" }); return; }
    setAddMsg({ type: "ok", text: `Added ${addName} as ${ROLE_TEMPLATES[addRole].label}` });
    setAddName(""); setAddEmail(""); setAddCompany("");
    refresh();
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const res = createInvite({ email: invEmail, role: invRole }, currentUser);
    if (!res.success) { setInvMsg({ type: "err", text: res.error || "Failed" }); return; }
    setInvMsg({ type: "ok", text: `Invite sent! Code: ${res.invite?.code}` });
    setInvEmail("");
    refresh();
  }

  function handleRemove(id: string) {
    if (!window.confirm("Remove this service provider?")) return;
    removeUser(id, currentUser);
    refresh();
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleRevoke(id: string) {
    revokeInvite(id, currentUser);
    refresh();
  }

  const vendorCount = users.filter((u) => u.role === "vendor").length;
  const staffCount = users.filter((u) => u.role === "staff").length;

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Vendors", value: vendorCount, color: "text-yellow-400", icon: VIcons.truck },
          { label: "Maintenance Staff", value: staffCount, color: "text-blue-400", icon: VIcons.wrench },
          { label: "Pending Invites", value: invites.length, color: "text-orange-400", icon: VIcons.mail },
          { label: "Total Providers", value: users.length, color: "text-accent", icon: VIcons.search },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30 flex items-center gap-3">
            <div className="text-muted-foreground">{kpi.icon}</div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
              <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sub-tab bar */}
      <div className="flex gap-1 border-b border-border/40">
        {([
          { id: "list" as SubView, label: "Provider List" },
          { id: "add" as SubView, label: "Add Provider" },
          { id: "invite" as SubView, label: "Send Invite" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => { setView(t.id); setAddMsg(null); setInvMsg(null); }}
            className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors ${
              view === t.id
                ? "text-accent border-b-2 border-accent -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Provider List ───────────────────────────────────────────────── */}
      {view === "list" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search name, email, company..."
              className="flex-1 bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent/60"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "all" | "vendor" | "staff")}
            >
              <option value="all">All Types</option>
              <option value="vendor">Vendors</option>
              <option value="staff">Maintenance Staff</option>
            </select>
          </div>

          <div className="border border-border/20 rounded-md p-2 bg-card/10">
            <p className="px-2 py-1 font-mono text-[10px] text-muted-foreground">
              Vendors receive <span className="text-yellow-400">Work-Order Only</span> access — they can only see assigned tickets, not resident data.
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="font-mono text-xs text-muted-foreground py-8 text-center">No service providers found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-left py-2 px-2">Company</th>
                    <th className="text-left py-2 px-2">Access</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-border/10 hover:bg-card/20 transition-colors">
                      <td className="py-2 px-2">{u.name}</td>
                      <td className="py-2 px-2 text-muted-foreground">{u.email}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 border rounded text-[10px] ${
                          u.role === "vendor" ? "border-yellow-500/40 text-yellow-400" : "border-blue-500/40 text-blue-400"
                        }`}>
                          {u.role === "vendor" ? "Vendor" : "Maintenance"}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">{u.company || "-"}</td>
                      <td className="py-2 px-2">
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {ROLE_TEMPLATES[u.role].level.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={() => handleRemove(u.id)}
                          className="text-red-500/60 hover:text-red-500 transition-colors text-[10px] font-mono uppercase"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Add Provider ─────────────────────────────────────────────────── */}
      {view === "add" && (
        <div className="max-w-lg space-y-4">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Provider Name</label>
              <input required type="text" className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. John (Plumber)" />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Email</label>
              <input required type="email" className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Type</label>
              <select required className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={addRole} onChange={(e) => setAddRole(e.target.value as UserRole)}>
                {allowedRoles.map((r) => (
                  <option key={r} value={r}>{ROLE_TEMPLATES[r].label} — {ROLE_TEMPLATES[r].description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Company (optional)</label>
              <input type="text" className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={addCompany} onChange={(e) => setAddCompany(e.target.value)} placeholder="e.g. ABC Plumbing LLC" />
            </div>

            {/* Permission preview */}
            <div className="border border-border/20 rounded-md p-3 bg-card/10">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Access Level: {ROLE_TEMPLATES[addRole].level.replace(/_/g, " ").toUpperCase()}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{ROLE_TEMPLATES[addRole].description}</p>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] font-mono">
                {(["canViewFinancials", "canViewResidentData", "canManageWorkOrders"] as const).map((p) => (
                  <div key={p} className="flex items-center gap-1.5">
                    <span className={ROLE_TEMPLATES[addRole][p] ? "text-green-400" : "text-red-500/50"}>
                      {ROLE_TEMPLATES[addRole][p] ? "✓" : "✗"}
                    </span>
                    <span className="text-muted-foreground">{p.replace(/^can/, "").replace(/([A-Z])/g, " $1").trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {addMsg && <p className={`font-mono text-xs ${addMsg.type === "ok" ? "text-green-400" : "text-red-500"}`}>{addMsg.text}</p>}
            <button type="submit" className="w-full px-4 py-2.5 border border-accent bg-accent/10 rounded-md font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors">
              Add Service Provider
            </button>
          </form>
        </div>
      )}

      {/* ── Send Invite ──────────────────────────────────────────────────── */}
      {view === "invite" && (
        <div className="max-w-lg space-y-4">
          <p className="font-mono text-xs text-muted-foreground">
            Send an invite code to a vendor or contractor. They can only access their assigned work orders.
          </p>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Email</label>
              <input required type="email" className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Access Type</label>
              <select required className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={invRole} onChange={(e) => setInvRole(e.target.value as UserRole)}>
                {allowedRoles.map((r) => (
                  <option key={r} value={r}>{ROLE_TEMPLATES[r].label}</option>
                ))}
              </select>
            </div>
            {invMsg && <p className={`font-mono text-xs ${invMsg.type === "ok" ? "text-green-400" : "text-red-500"}`}>{invMsg.text}</p>}
            <button type="submit" className="w-full px-4 py-2.5 border border-accent bg-accent/10 rounded-md font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors">
              Send Invite
            </button>
          </form>

          {/* Pending invites */}
          {invites.length > 0 && (
            <div className="space-y-2 border-t border-border/20 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Pending Invites</p>
              {invites.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 border border-border/20 rounded-md p-3 bg-card/20">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs truncate">{inv.email}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Code: <span className="text-foreground font-bold">{inv.code}</span> · {ROLE_TEMPLATES[inv.role].label}
                    </p>
                  </div>
                  <button onClick={() => handleCopy(inv.code, inv.id)} className="p-1 text-muted-foreground hover:text-accent text-[10px] font-mono">
                    {copiedId === inv.id ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={() => handleRevoke(inv.id)} className="p-1 text-red-500/60 hover:text-red-500 text-[10px] font-mono">
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
