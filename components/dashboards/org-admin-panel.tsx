"use client";

import React, { useState, useEffect } from "react";
import type { User, UserRole } from "@/lib/auth-context";
import { addableRoles, ROLE_TEMPLATES, ORG_ADMIN_ROLES } from "@/lib/rbac";
import {
  listUsers,
  addUser,
  removeUser,
  updateUserRole,
  createInvite,
  listInvites,
  revokeInvite,
  type StoredUser,
  type Invite,
} from "@/lib/user-management-store";
import { logAudit } from "@/lib/audit";

// ── Inline Icons ─────────────────────────────────────────────────────────────

const Icons = {
  plus: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>,
  trash: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" /></svg>,
  mail: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>,
  users: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
  shield: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  x: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>,
  copy: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>,
  check: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>,
  building: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22V12h6v10M9 6h.01M15 6h.01M9 10h.01M15 10h.01" /></svg>,
};

// ── Sub-tabs ─────────────────────────────────────────────────────────────────

type SubTab = "team" | "invites" | "add";

// ── Component ────────────────────────────────────────────────────────────────

export default function OrgAdminPanel({ user }: { user: User }) {
  const [subtab, setSubtab] = useState<SubTab>("team");
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [copyId, setCopyId] = useState<string | null>(null);

  // Add-user form
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<UserRole | "">("");
  const [addCompany, setAddCompany] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [addMode, setAddMode] = useState<"direct" | "invite">("direct");

  const allowedRoles = addableRoles(user.role);

  function refresh() {
    setUsers(listUsers());
    setInvites(listInvites());
  }

  useEffect(() => { refresh(); }, []);

  // ── Team list ──────────────────────────────────────────────────────────────

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  function handleRemove(id: string) {
    if (!window.confirm("Remove this user? This cannot be undone.")) return;
    const res = removeUser(id, user);
    if (!res.success) alert(res.error);
    refresh();
  }

  function handleRoleChange(id: string, newRole: UserRole) {
    const res = updateUserRole(id, newRole, user);
    if (!res.success) alert(res.error);
    refresh();
  }

  // ── Add / Invite ──────────────────────────────────────────────────────────

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    if (!addRole) { setAddError("Select a role"); return; }

    if (addMode === "direct") {
      const res = addUser({ email: addEmail, name: addName, role: addRole as UserRole, company: addCompany }, user);
      if (!res.success) { setAddError(res.error || "Failed"); return; }
      setAddSuccess(`${addName} added as ${ROLE_TEMPLATES[addRole as UserRole].label}`);
    } else {
      const res = createInvite({ email: addEmail, role: addRole as UserRole }, user);
      if (!res.success) { setAddError(res.error || "Failed"); return; }
      setAddSuccess(`Invite sent! Code: ${res.invite?.code}`);
    }
    setAddName(""); setAddEmail(""); setAddRole(""); setAddCompany("");
    refresh();
  }

  function handleRevoke(id: string) {
    revokeInvite(id, user);
    refresh();
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopyId(id);
    setTimeout(() => setCopyId(null), 2000);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const roleColor: Record<string, string> = {
    building_manager: "border-blue-500/40 text-blue-400",
    facility_manager: "border-orange-500/40 text-orange-400",
    property_manager: "border-purple-500/40 text-purple-400",
    building_owner: "border-green-500/40 text-green-400",
    admin: "border-red-500/40 text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md border border-accent/40 bg-accent/10 flex items-center justify-center text-accent">{Icons.building}</div>
        <div>
          <h2 className="font-[var(--font-bebas)] text-xl tracking-wide">GLOBAL ADMIN PANEL</h2>
          <p className="font-mono text-[10px] text-muted-foreground">Onboard properties, add managers, manage the leadership team</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: users.length, color: "text-accent" },
          { label: "Managers", value: users.filter((u) => ["building_manager", "facility_manager"].includes(u.role)).length, color: "text-blue-400" },
          { label: "Staff + Vendors", value: users.filter((u) => ["concierge", "security", "staff", "vendor"].includes(u.role)).length, color: "text-orange-400" },
          { label: "Pending Invites", value: invites.filter((i) => i.status === "pending").length, color: "text-yellow-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Sub-tab bar */}
      <div className="flex gap-1 border-b border-border/40">
        {([
          { id: "team" as SubTab, label: "Team Directory", icon: Icons.users },
          { id: "invites" as SubTab, label: "Invites", icon: Icons.mail },
          { id: "add" as SubTab, label: "Add User", icon: Icons.plus },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => { setSubtab(t.id); setAddError(""); setAddSuccess(""); }}
            className={`flex items-center gap-1.5 px-4 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              subtab === t.id
                ? "text-accent border-b-2 border-accent -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Team Directory ──────────────────────────────────────────────── */}
      {subtab === "team" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="flex-1 bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent/60"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as UserRole | "all")}
            >
              <option value="all">All Roles</option>
              {(Object.keys(ROLE_TEMPLATES) as UserRole[]).map((r) => (
                <option key={r} value={r}>{ROLE_TEMPLATES[r].label}</option>
              ))}
            </select>
          </div>

          {/* Hierarchy legend */}
          <div className="flex flex-wrap gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="px-2 py-0.5 border border-green-500/30 rounded text-green-400">Org Admin</span>
            <span className="px-2 py-0.5 border border-blue-500/30 rounded text-blue-400">Manager</span>
            <span className="px-2 py-0.5 border border-orange-500/30 rounded text-orange-400">Operational</span>
            <span className="px-2 py-0.5 border border-border/40 rounded">Resident</span>
            <span className="px-2 py-0.5 border border-yellow-500/30 rounded text-yellow-400">Vendor</span>
          </div>

          {filteredUsers.length === 0 ? (
            <p className="font-mono text-xs text-muted-foreground py-8 text-center">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Role</th>
                    <th className="text-left py-2 px-2">Level</th>
                    <th className="text-left py-2 px-2">Company</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const tmpl = ROLE_TEMPLATES[u.role];
                    const rc = roleColor[u.role] || "border-border/40 text-muted-foreground";
                    return (
                      <tr key={u.id} className="border-b border-border/10 hover:bg-card/20 transition-colors">
                        <td className="py-2 px-2">{u.name}</td>
                        <td className="py-2 px-2 text-muted-foreground">{u.email}</td>
                        <td className="py-2 px-2">
                          {allowedRoles.length > 0 && u.id !== user.id ? (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              className={`bg-transparent border px-2 py-0.5 rounded text-[10px] ${rc}`}
                            >
                              <option value={u.role}>{tmpl.label}</option>
                              {allowedRoles.filter((r) => r !== u.role).map((r) => (
                                <option key={r} value={r}>{ROLE_TEMPLATES[r].label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 border rounded text-[10px] ${rc}`}>{tmpl.label}</span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          <span className="text-[10px] text-muted-foreground uppercase">{tmpl.level.replace(/_/g, " ")}</span>
                        </td>
                        <td className="py-2 px-2 text-muted-foreground">{u.company || "-"}</td>
                        <td className="py-2 px-2 text-right">
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleRemove(u.id)}
                              className="p-1 text-red-500/60 hover:text-red-500 transition-colors"
                              title="Remove user"
                            >
                              {Icons.trash}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Invites ─────────────────────────────────────────────────────── */}
      {subtab === "invites" && (
        <div className="space-y-4">
          <p className="font-mono text-xs text-muted-foreground">
            Send invite codes (magic links) for self-onboarding. Invitees fill out their own profile.
          </p>
          {invites.length === 0 ? (
            <p className="font-mono text-xs text-muted-foreground py-8 text-center">No invites yet</p>
          ) : (
            <div className="space-y-2">
              {invites.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 border border-border/20 rounded-md p-3 bg-card/20">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs truncate">{inv.email}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Role: <span className="text-foreground">{ROLE_TEMPLATES[inv.role].label}</span>
                      {" · "}Created {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 border rounded text-[10px] font-mono ${
                      inv.status === "pending" ? "border-yellow-500/40 text-yellow-400" :
                      inv.status === "accepted" ? "border-green-500/40 text-green-400" :
                      "border-border/40 text-muted-foreground"
                    }`}>
                      {inv.status}
                    </span>
                    {inv.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleCopy(inv.code, inv.id)}
                          className="p-1 text-muted-foreground hover:text-accent transition-colors"
                          title="Copy invite code"
                        >
                          {copyId === inv.id ? Icons.check : Icons.copy}
                        </button>
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          className="p-1 text-red-500/60 hover:text-red-500 transition-colors"
                          title="Revoke invite"
                        >
                          {Icons.x}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add User ────────────────────────────────────────────────────── */}
      {subtab === "add" && (
        <div className="max-w-lg space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            {([
              { id: "direct" as const, label: "Add Directly" },
              { id: "invite" as const, label: "Send Invite Code" },
            ]).map((m) => (
              <button
                key={m.id}
                onClick={() => { setAddMode(m.id); setAddError(""); setAddSuccess(""); }}
                className={`px-4 py-2 border rounded-md font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  addMode === m.id ? "border-accent text-accent bg-accent/10" : "border-border/40 text-muted-foreground hover:border-accent/40"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            {addMode === "direct" && (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent/60"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent/60"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Role</label>
              <select
                required
                className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent/60"
                value={addRole}
                onChange={(e) => setAddRole(e.target.value as UserRole)}
              >
                <option value="">Select role...</option>
                {allowedRoles.map((r) => (
                  <option key={r} value={r}>{ROLE_TEMPLATES[r].label} — {ROLE_TEMPLATES[r].description}</option>
                ))}
              </select>
            </div>
            {addMode === "direct" && (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Company (optional)</label>
                <input
                  type="text"
                  className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent/60"
                  value={addCompany}
                  onChange={(e) => setAddCompany(e.target.value)}
                />
              </div>
            )}

            {/* Permission preview */}
            {addRole && (
              <div className="border border-border/20 rounded-md p-3 bg-card/10">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Permission Preview</p>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                  {(["canViewFinancials", "canViewResidentData", "canManageWorkOrders", "canManageUsers", "canAccessSettings", "canViewAuditLog"] as const).map((p) => (
                    <div key={p} className="flex items-center gap-1.5">
                      <span className={ROLE_TEMPLATES[addRole as UserRole]?.[p] ? "text-green-400" : "text-red-500/50"}>
                        {ROLE_TEMPLATES[addRole as UserRole]?.[p] ? "✓" : "✗"}
                      </span>
                      <span className="text-muted-foreground">{p.replace(/^can/, "").replace(/([A-Z])/g, " $1").trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {addError && <p className="font-mono text-xs text-red-500">{addError}</p>}
            {addSuccess && <p className="font-mono text-xs text-green-400">{addSuccess}</p>}

            <button
              type="submit"
              className="w-full px-4 py-2.5 border border-accent bg-accent/10 rounded-md font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors"
            >
              {addMode === "direct" ? "Add User" : "Send Invite"}
            </button>
          </form>

          {/* Onboarding hierarchy reference */}
          <div className="border border-border/20 rounded-md p-4 bg-card/10">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">{Icons.shield} Onboarding Hierarchy</p>
            <div className="space-y-2 text-[10px] font-mono">
              <div className="flex gap-2">
                <span className="text-green-400 w-28 shrink-0">Org Admin</span>
                <span className="text-muted-foreground">→ Building Managers, Facility Managers</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-400 w-28 shrink-0">Building Mgr</span>
                <span className="text-muted-foreground">→ Security, Concierge, Staff, Residents</span>
              </div>
              <div className="flex gap-2">
                <span className="text-orange-400 w-28 shrink-0">Facility Mgr</span>
                <span className="text-muted-foreground">→ Vendors, Maintenance Staff</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
