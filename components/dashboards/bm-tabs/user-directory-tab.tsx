"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/auth-context";
import { Badge, SectionCard, EmptyState } from "./bm-shared";
import { addableRoles, ROLE_TEMPLATES } from "@/lib/rbac";
import {
  listUsers,
  addUser,
  removeUser,
  updateUserDetails,
  createInvite,
  listInvites,
  revokeInvite,
  bulkUpsertUsersCsv,
  type StoredUser,
  type Invite,
  type CsvImportResult,
} from "@/lib/user-management-store";
import { bulkUpsertLeasingUnitsCsv, listLeasingUnits, updateLeasingUnit } from "@/lib/lease-management-store";

// ── Sub-views ────────────────────────────────────────────────────────────────

type SubView = "directory" | "add" | "invite" | "import";

export default function UserDirectoryTab() {
  const { user } = useAuth();
  const [view, setView] = useState<SubView>("directory");
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [leasingUnits, setLeasingUnits] = useState(() => listLeasingUnits());
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [assignmentUnit, setAssignmentUnit] = useState("");
  const [assignmentMsg, setAssignmentMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Add form
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<UserRole | "">("");
  const [addUnit, setAddUnit] = useState("");
  const [addMsg, setAddMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Invite form
  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState<UserRole | "">("");
  const [invMsg, setInvMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // CSV import
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvResult, setCsvResult] = useState<CsvImportResult | null>(null);
  const [csvTarget, setCsvTarget] = useState<"users" | "spaces">("users");
  const [csvRole, setCsvRole] = useState<UserRole>("resident");

  const allowedRoles = user ? addableRoles(user.role) : [];

  function refresh() {
    setUsers(listUsers());
    setInvites(listInvites());
    setLeasingUnits(listLeasingUnits());
  }

  useEffect(() => { refresh(); }, []);

  if (!user) return null;
  const actor = user;

  // ── Filters ────────────────────────────────────────────────────────────────

  const staffRoles: UserRole[] = ["concierge", "security", "staff"];
  const residentRoles: UserRole[] = ["resident", "tenant"];
  const managedRoles = [...staffRoles, ...residentRoles];

  const managedUsers = users.filter((u) => managedRoles.includes(u.role));
  const filtered = managedUsers.filter((u) => {
    const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || (u.unit || "").toLowerCase().includes(search.toLowerCase());
    const mr = roleFilter === "all" || u.role === roleFilter;
    return ms && mr;
  });

  const staffCount = managedUsers.filter((u) => staffRoles.includes(u.role)).length;
  const residentCount = managedUsers.filter((u) => residentRoles.includes(u.role)).length;
  const pendingInvites = invites.filter((i) => i.status === "pending");

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addRole) { setAddMsg({ type: "err", text: "Select a role" }); return; }
    const res = addUser({ email: addEmail, name: addName, role: addRole, unit: addUnit || undefined }, actor);
    if (!res.success) { setAddMsg({ type: "err", text: res.error || "Failed" }); return; }
    setAddMsg({ type: "ok", text: `Added ${addName} as ${ROLE_TEMPLATES[addRole].label}` });
    setAddName(""); setAddEmail(""); setAddRole(""); setAddUnit("");
    refresh();
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!invRole) { setInvMsg({ type: "err", text: "Select a role" }); return; }
    const res = createInvite({ email: invEmail, role: invRole }, actor);
    if (!res.success) { setInvMsg({ type: "err", text: res.error || "Failed" }); return; }
    setInvMsg({ type: "ok", text: `Invite sent! Code: ${res.invite?.code}` });
    setInvEmail(""); setInvRole("");
    refresh();
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const result = csvTarget === "users"
        ? bulkUpsertUsersCsv(text, csvRole, actor)
        : bulkUpsertLeasingUnitsCsv(text, actor);
      setCsvResult(result);
      refresh();
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleDownloadTemplate() {
    const template = csvTarget === "users"
      ? "name,email,unit,role,buildingId\nAmy Torres,amy@building.com,15A,resident,parkview-tower\nJake Miller,jake@building.com,7C,tenant,parkview-tower\nLisa Wang,lisa@building.com,22D,resident,parkview-tower\n"
      : "unit,building,buildingId,buildingType,floor,sqft,status,currentTenant,tenantEmail,askingRent,currentRent,paymentCollectionMode,invoiceTerms,paymentSchedule\nSuite 2205,Parkview Tower,parkview-tower,commercial,22,1800,leased,David Kim,david.kim@example.com,4500,4500,flexible,Net 15,on_invoice\nSuite 1902,Parkview Tower,parkview-tower,commercial,19,1200,vacant,,,3800,,flexible,Net 30,monthly\n";

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = csvTarget === "users" ? "users-import-template.csv" : "spaces-import-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleRemove(id: string) {
    if (!window.confirm("Remove this user?")) return;
    removeUser(id, actor);
    refresh();
  }

  function handleRevoke(id: string) {
    revokeInvite(id, actor);
    refresh();
  }

  function startAssignmentEdit(target: StoredUser) {
    setEditingUserId(target.id);
    setAssignmentUnit(target.unit || "");
    setAssignmentMsg(null);
  }

  function cancelAssignmentEdit() {
    setEditingUserId(null);
    setAssignmentUnit("");
    setAssignmentMsg(null);
  }

  function handleAssignmentSave(target: StoredUser) {
    const selectedLease = leasingUnits.find((unit) => unit.id === assignmentUnit);
    if (!selectedLease) {
      setAssignmentMsg({ type: "err", text: "Select a lease unit to map this user." });
      return;
    }

    const userUpdate = updateUserDetails(target.id, { unit: selectedLease.unit, buildingId: selectedLease.buildingId }, actor);
    if (!userUpdate.success) {
      setAssignmentMsg({ type: "err", text: userUpdate.error || "Could not update user assignment." });
      return;
    }

    updateLeasingUnit(selectedLease.id, {
      tenantEmail: target.email,
      currentTenant: target.name,
      buildingId: selectedLease.buildingId,
      unit: selectedLease.unit,
    });

    setAssignmentMsg({ type: "ok", text: `Mapped ${target.name} to ${selectedLease.unit}.` });
    refresh();
    setEditingUserId(null);
    setAssignmentUnit("");
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "On-Site Staff", value: staffCount, color: "text-blue-400" },
          { label: "Residents / Tenants", value: residentCount, color: "text-green-400" },
          { label: "Pending Invites", value: pendingInvites.length, color: "text-yellow-400" },
          { label: "Total Managed", value: managedUsers.length, color: "text-accent" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Sub-view switcher */}
      <div className="flex gap-1 border-b border-border/40 overflow-x-auto">
        {([
          { id: "directory" as SubView, label: "Directory" },
          { id: "add" as SubView, label: "Add User" },
          { id: "invite" as SubView, label: "Magic Link" },
          { id: "import" as SubView, label: "Bulk Import" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => { setView(t.id); setAddMsg(null); setInvMsg(null); setCsvResult(null); }}
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

      {/* ── Directory ───────────────────────────────────────────────────── */}
      {view === "directory" && (
        <SectionCard title="User Directory">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search name, email, unit..."
              className="flex-1 bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent/60"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
            >
              <option value="all">All Roles</option>
              {managedRoles.map((r) => (
                <option key={r} value={r}>{ROLE_TEMPLATES[r].label}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState message="No users match your search" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Role</th>
                    <th className="text-left py-2 px-2">Unit</th>
                    <th className="text-left py-2 px-2">Lease Mapping</th>
                    <th className="text-right py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const isStaff = staffRoles.includes(u.role);
                    const mappedLease = leasingUnits.find((lease) => lease.tenantEmail?.toLowerCase() === u.email.toLowerCase());
                    return (
                      <tr key={u.id} className="border-b border-border/10 hover:bg-card/20 transition-colors">
                        <td className="py-2 px-2">{u.name}</td>
                        <td className="py-2 px-2 text-muted-foreground">{u.email}</td>
                        <td className="py-2 px-2">
                          <Badge className={isStaff ? "border-blue-500/40 text-blue-400" : "border-green-500/40 text-green-400"}>
                            {ROLE_TEMPLATES[u.role].label}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-muted-foreground">{u.unit || "-"}</td>
                        <td className="py-2 px-2 text-muted-foreground">
                          {editingUserId === u.id ? (
                            <div className="space-y-2 max-w-[220px]">
                              <select
                                className="w-full bg-background border border-border/40 rounded-md px-2 py-2 font-mono text-[10px]"
                                value={assignmentUnit}
                                onChange={(e) => setAssignmentUnit(e.target.value)}
                              >
                                <option value="">Select unit...</option>
                                {leasingUnits.map((lease) => (
                                  <option key={lease.id} value={lease.id}>{lease.building} - {lease.unit}</option>
                                ))}
                              </select>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAssignmentSave(u)}
                                  className="text-[10px] uppercase text-accent hover:underline"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelAssignmentEdit}
                                  className="text-[10px] uppercase text-muted-foreground hover:text-foreground"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : mappedLease ? (
                            <div>
                              <p>{mappedLease.building} / {mappedLease.unit}</p>
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{mappedLease.paymentCollectionMode === "owner_direct" ? "Owner direct" : "Portal billing"}</p>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {(u.role === "resident" || u.role === "tenant") && (
                              <button
                                onClick={() => startAssignmentEdit(u)}
                                className="text-accent hover:text-accent/80 transition-colors text-[10px] font-mono uppercase"
                              >
                                {mappedLease ? "Remap" : "Map Lease"}
                              </button>
                            )}
                            <button
                              onClick={() => handleRemove(u.id)}
                              className="text-red-500/60 hover:text-red-500 transition-colors text-[10px] font-mono uppercase"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {assignmentMsg && (
            <p className={`mt-4 font-mono text-xs ${assignmentMsg.type === "ok" ? "text-green-400" : "text-red-500"}`}>{assignmentMsg.text}</p>
          )}
        </SectionCard>
      )}

      {/* ── Add User ─────────────────────────────────────────────────────── */}
      {view === "add" && (
        <SectionCard title="Add User Directly">
          <form onSubmit={handleAdd} className="max-w-lg space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Name</label>
              <input required type="text" className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={addName} onChange={(e) => setAddName(e.target.value)} />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Email</label>
              <input required type="email" className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Role</label>
              <select required className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={addRole} onChange={(e) => setAddRole(e.target.value as UserRole)}>
                <option value="">Select role...</option>
                {allowedRoles.map((r) => (
                  <option key={r} value={r}>{ROLE_TEMPLATES[r].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Unit (optional)</label>
              <input type="text" className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={addUnit} onChange={(e) => setAddUnit(e.target.value)} placeholder="e.g. 15A" />
            </div>
            {addMsg && <p className={`font-mono text-xs ${addMsg.type === "ok" ? "text-green-400" : "text-red-500"}`}>{addMsg.text}</p>}
            <button type="submit" className="w-full px-4 py-2.5 border border-accent bg-accent/10 rounded-md font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors">
              Add User
            </button>
          </form>
        </SectionCard>
      )}

      {/* ── Magic Link / Invite ──────────────────────────────────────────── */}
      {view === "invite" && (
        <SectionCard title="Self-Onboarding — Magic Link">
          <p className="font-mono text-xs text-muted-foreground mb-4">
            Send an invite code to a resident or staff member. They will fill out their own profile using the code.
          </p>
          <form onSubmit={handleInvite} className="max-w-lg space-y-4 mb-6">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Email</label>
              <input required type="email" className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Role</label>
              <select required className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={invRole} onChange={(e) => setInvRole(e.target.value as UserRole)}>
                <option value="">Select role...</option>
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
          {pendingInvites.length > 0 && (
            <div className="space-y-2 border-t border-border/20 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Pending Invites ({pendingInvites.length})</p>
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 border border-border/20 rounded-md p-3 bg-card/20">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs truncate">{inv.email}</p>
                    <p className="text-[10px] text-muted-foreground">Code: <span className="text-foreground font-bold">{inv.code}</span></p>
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
        </SectionCard>
      )}

      {/* ── Bulk Import CSV ──────────────────────────────────────────────── */}
      {view === "import" && (
        <SectionCard title="Bulk Import from CSV">
          <p className="font-mono text-xs text-muted-foreground mb-4">
            Upload CSV files to bulk <span className="text-foreground">create/update residents, tenants, and commercial spaces</span>.
          </p>

          <div className="max-w-lg space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Import Target</label>
              <select className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs" value={csvTarget} onChange={(e) => setCsvTarget(e.target.value as "users" | "spaces")}>
                <option value="users">Residents / Tenants / Staff (Upsert by email)</option>
                <option value="spaces">Commercial / Leasing Spaces (Upsert by building+unit)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Default Role</label>
              <select disabled={csvTarget !== "users"} className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs disabled:opacity-50" value={csvRole} onChange={(e) => setCsvRole(e.target.value as UserRole)}>
                {allowedRoles.map((r) => (
                  <option key={r} value={r}>{ROLE_TEMPLATES[r].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">CSV File</label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleCsvUpload}
                className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs file:mr-4 file:py-1 file:px-3 file:border file:border-accent/40 file:rounded file:bg-accent/10 file:text-accent file:font-mono file:text-[10px] file:uppercase file:tracking-widest file:cursor-pointer"
              />
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="mt-2 px-3 py-1.5 border border-border/40 text-foreground font-mono text-[10px] uppercase tracking-widest hover:border-accent/60 hover:text-accent transition-colors"
              >
                Download Template
              </button>
            </div>

            {/* Sample template */}
            <div className="border border-border/20 rounded-md p-3 bg-card/10">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Sample CSV Format</p>
              {csvTarget === "users" ? (
                <pre className="font-mono text-[10px] text-muted-foreground whitespace-pre">{`name,email,unit,role,buildingId
Amy Torres,amy@building.com,15A,resident
Jake Miller,jake@building.com,7C,tenant
Lisa Wang,lisa@building.com,22D,resident`}</pre>
              ) : (
                <pre className="font-mono text-[10px] text-muted-foreground whitespace-pre">{`unit,building,buildingId,buildingType,floor,sqft,status,currentTenant,tenantEmail,askingRent,currentRent,paymentCollectionMode,invoiceTerms,paymentSchedule
Suite 2205,Parkview Tower,parkview-tower,commercial,22,1800,leased,David Kim,david.kim@example.com,4500,4500,flexible,Net 15,on_invoice
Suite 1902,Parkview Tower,parkview-tower,commercial,19,1200,vacant,, ,3800,,flexible,Net 30,monthly`}</pre>
              )}
            </div>

            {/* Import results */}
            {csvResult && (
              <div className="border border-border/20 rounded-md p-4 bg-card/10 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Import Results</p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-lg font-[var(--font-bebas)] text-green-400">{csvResult.added}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">Added</p>
                  </div>
                  <div>
                    <p className="text-lg font-[var(--font-bebas)] text-blue-400">{csvResult.updated}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">Updated</p>
                  </div>
                  <div>
                    <p className="text-lg font-[var(--font-bebas)] text-yellow-400">{csvResult.skipped}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">Skipped</p>
                  </div>
                  <div>
                    <p className="text-lg font-[var(--font-bebas)] text-accent">{csvResult.total}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">Total Rows</p>
                  </div>
                </div>
                {csvResult.errors.length > 0 && (
                  <div className="border-t border-border/20 pt-2 mt-2">
                    <p className="text-[10px] font-mono text-red-500 mb-1">Errors:</p>
                    {csvResult.errors.map((err, i) => (
                      <p key={i} className="text-[10px] font-mono text-muted-foreground">
                        Row {err.row}: {err.email || "?"} — {err.reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
