"use client";
import { useState, useEffect } from "react";
import { User, UserRole } from "@/lib/auth-context";
import { getAuditLog, AuditEntry } from "@/lib/audit";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import Link from "next/link";

const roleLabels: Record<UserRole, string> = {
  facility_manager: "Facility Manager",
  building_owner: "Building Owner",
  property_manager: "Property Manager",
  resident: "Resident",
  tenant: "Tenant",
  concierge: "Concierge",
  staff: "Staff",
  security: "Security",
  vendor: "Vendor",
  admin: "Admin",
  guest: "Guest",
};

export default function AdminDashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<"users" | "settings" | "audit">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  useEffect(() => {
    // Load users from localStorage
    const stored = JSON.parse(localStorage.getItem("buildsync_users") || "[]");
    setUsers(stored);
    setAudit(getAuditLog().reverse());
  }, []);

  const handleRoleChange = (id: string, newRole: UserRole) => {
    const updated = users.map(u => u.id === id ? { ...u, role: newRole } : u);
    setUsers(updated);
    localStorage.setItem("buildsync_users", JSON.stringify(updated));
  };

  const handleRemove = (id: string) => {
    if (!window.confirm("Remove this user?")) return;
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    localStorage.setItem("buildsync_users", JSON.stringify(updated));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="flex gap-4 mb-6">
        <Button variant={tab === "users" ? "default" : "outline"} onClick={() => setTab("users")}>Users</Button>
        <Button variant={tab === "settings" ? "default" : "outline"} onClick={() => setTab("settings")}>Settings</Button>
        <Button variant={tab === "audit" ? "default" : "outline"} onClick={() => setTab("audit")}>Audit Log</Button>
      </div>

      {tab === "users" && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search users by name or email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="border rounded px-2 py-1"
                    >
                      {Object.entries(roleLabels).map(([role, label]) => (
                        <option key={role} value={role}>{label}</option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>{u.company || "-"}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleRemove(u.id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {tab === "settings" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">System Settings</h3>
          <p className="mb-4">Configure system-wide settings such as SMTP, LLM endpoints, and more.</p>
          <Link href="/settings">
            <Button variant="secondary">Go to Settings Page</Button>
          </Link>
        </div>
      )}

      {tab === "audit" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Audit Log</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">No audit entries found.</TableCell>
                </TableRow>
              )}
              {audit.map((entry, idx) => (
                <TableRow key={idx}>
                  <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{entry.user || "-"}</TableCell>
                  <TableCell>{entry.action}</TableCell>
                  <TableCell>
                    <pre className="whitespace-pre-wrap text-xs max-w-xs overflow-x-auto">{JSON.stringify(entry.details, null, 2)}</pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
