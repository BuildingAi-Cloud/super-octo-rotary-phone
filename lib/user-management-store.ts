/**
 * User Management Store
 *
 * Handles invite codes, magic links, bulk CSV import, and the
 * user directory. All MVP/demo — localStorage-backed.
 */

import type { UserRole, User } from "@/lib/auth-context";
import { canAddUser } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

const USERS_KEY = "buildsync_users";
const INVITES_KEY = "buildsync_invites";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Invite {
  id: string;
  code: string;
  email: string;
  role: UserRole;
  createdBy: string;       // user id of the inviter
  createdByRole: UserRole;
  buildingId?: string;
  status: "pending" | "accepted" | "expired";
  createdAt: string;
  expiresAt: string;
}

export interface StoredUser extends User {
  password?: string;
  addedBy?: string;
  inviteCode?: string;
  buildingId?: string;
  unit?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const values = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    code += chars[values[i] % chars.length];
  }
  return code;
}

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getInvites(): Invite[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(INVITES_KEY) || "[]");
}

function saveInvites(invites: Invite[]) {
  localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
}

// ── User Directory ───────────────────────────────────────────────────────────

/** Get all users, optionally filtered by role(s) */
export function listUsers(filterRoles?: UserRole[]): StoredUser[] {
  const all = getUsers();
  if (!filterRoles || filterRoles.length === 0) return all;
  return all.filter((u) => filterRoles.includes(u.role));
}

/** Get a single user by id */
export function getUserById(id: string): StoredUser | undefined {
  return getUsers().find((u) => u.id === id);
}

/** Add a user directly (used by BM/FM when manually adding staff) */
export function addUser(
  data: { email: string; name: string; role: UserRole; company?: string; unit?: string; buildingId?: string },
  actor: User,
): { success: boolean; error?: string; user?: StoredUser } {
  if (!canAddUser(actor.role, data.role)) {
    return { success: false, error: `${actor.role} cannot add ${data.role} users` };
  }

  const users = getUsers();
  if (users.some((u) => u.email === data.email)) {
    return { success: false, error: "A user with this email already exists" };
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    email: data.email,
    name: data.name,
    role: data.role,
    company: data.company,
    password: "12345678", // default password for demo
    addedBy: actor.id,
    buildingId: data.buildingId,
    unit: data.unit,
  };

  users.push(newUser);
  saveUsers(users);
  logAudit("user_added", { targetEmail: data.email, targetRole: data.role, addedBy: actor.email }, actor.email);

  return { success: true, user: { ...newUser, password: undefined } as StoredUser };
}

/** Update a user's role (respects hierarchy) */
export function updateUserRole(userId: string, newRole: UserRole, actor: User): { success: boolean; error?: string } {
  if (!canAddUser(actor.role, newRole)) {
    return { success: false, error: `${actor.role} cannot assign the ${newRole} role` };
  }
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, error: "User not found" };

  users[idx].role = newRole;
  saveUsers(users);
  logAudit("user_role_changed", { userId, newRole, changedBy: actor.email }, actor.email);
  return { success: true };
}

/** Update editable directory fields such as unit/building assignment */
export function updateUserDetails(
  userId: string,
  updates: Pick<StoredUser, "unit" | "buildingId">,
  actor: User,
): { success: boolean; error?: string; user?: StoredUser } {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, error: "User not found" };

  users[idx] = {
    ...users[idx],
    unit: updates.unit,
    buildingId: updates.buildingId,
  };

  saveUsers(users);
  logAudit("user_assignment_changed", { userId, unit: updates.unit, buildingId: updates.buildingId, changedBy: actor.email }, actor.email);
  return { success: true, user: users[idx] };
}

/** Remove a user */
export function removeUser(userId: string, actor: User): { success: boolean; error?: string } {
  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return { success: false, error: "User not found" };

  // Only people who could have added this role (or admins) can remove
  if (actor.role !== "admin" && !canAddUser(actor.role, target.role)) {
    return { success: false, error: `${actor.role} cannot remove ${target.role} users` };
  }

  saveUsers(users.filter((u) => u.id !== userId));
  logAudit("user_removed", { targetEmail: target.email, removedBy: actor.email }, actor.email);
  return { success: true };
}

// ── Invite / Magic Link System ───────────────────────────────────────────────

/** Create an invite (magic link) */
export function createInvite(
  data: { email: string; role: UserRole; buildingId?: string },
  actor: User,
): { success: boolean; error?: string; invite?: Invite } {
  if (!canAddUser(actor.role, data.role)) {
    return { success: false, error: `${actor.role} cannot invite ${data.role} users` };
  }

  const invites = getInvites();
  // Don't allow duplicate pending invites for same email
  if (invites.some((i) => i.email === data.email && i.status === "pending")) {
    return { success: false, error: "A pending invite already exists for this email" };
  }

  const invite: Invite = {
    id: crypto.randomUUID(),
    code: generateCode(),
    email: data.email,
    role: data.role,
    createdBy: actor.id,
    createdByRole: actor.role,
    buildingId: data.buildingId,
    status: "pending",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };

  invites.push(invite);
  saveInvites(invites);
  logAudit("invite_created", { email: data.email, role: data.role, code: invite.code }, actor.email);

  return { success: true, invite };
}

/** Accept an invite by code (self-onboarding) */
export function acceptInvite(
  code: string,
  userData: { name: string; email: string; password: string },
): { success: boolean; error?: string; user?: StoredUser } {
  const invites = getInvites();
  const invite = invites.find((i) => i.code === code && i.status === "pending");
  if (!invite) return { success: false, error: "Invalid or expired invite code" };

  if (new Date(invite.expiresAt) < new Date()) {
    invite.status = "expired";
    saveInvites(invites);
    return { success: false, error: "This invite has expired" };
  }

  // Email on invite should match
  if (invite.email && invite.email !== userData.email) {
    return { success: false, error: "Email does not match the invite" };
  }

  const users = getUsers();
  if (users.some((u) => u.email === userData.email)) {
    return { success: false, error: "An account with this email already exists" };
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    email: userData.email,
    name: userData.name,
    role: invite.role,
    password: userData.password,
    addedBy: invite.createdBy,
    inviteCode: invite.code,
    buildingId: invite.buildingId,
  };

  users.push(newUser);
  saveUsers(users);

  invite.status = "accepted";
  saveInvites(invites);

  logAudit("invite_accepted", { email: userData.email, role: invite.role, code }, userData.email);

  return { success: true, user: { ...newUser, password: undefined } as StoredUser };
}

/** List all invites (for the admin view) */
export function listInvites(status?: Invite["status"]): Invite[] {
  const all = getInvites();
  if (!status) return all;
  return all.filter((i) => i.status === status);
}

/** Revoke a pending invite */
export function revokeInvite(inviteId: string, actor: User): { success: boolean } {
  const invites = getInvites();
  const invite = invites.find((i) => i.id === inviteId);
  if (!invite || invite.status !== "pending") return { success: false };
  invite.status = "expired";
  saveInvites(invites);
  logAudit("invite_revoked", { inviteId, email: invite.email }, actor.email);
  return { success: true };
}

// ── CSV Bulk Import ──────────────────────────────────────────────────────────

export interface CsvImportResult {
  total: number;
  added: number;
  updated: number;
  skipped: number;
  errors: { row: number; email: string; reason: string }[];
}

/**
 * Parse CSV text and bulk-add users.
 * Expected headers: name, email, unit, role (optional, defaults to targetRole)
 */
export function bulkImportCsv(
  csvText: string,
  defaultRole: UserRole,
  actor: User,
  buildingId?: string,
): CsvImportResult {
  const result: CsvImportResult = { total: 0, added: 0, updated: 0, skipped: 0, errors: [] };

  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    result.errors.push({ row: 0, email: "", reason: "CSV must have a header row and at least one data row" });
    return result;
  }

  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(",").map((h) => h.trim());

  const nameIdx = headers.indexOf("name");
  const emailIdx = headers.indexOf("email");
  const unitIdx = headers.indexOf("unit");
  const roleIdx = headers.indexOf("role");

  if (nameIdx === -1 || emailIdx === -1) {
    result.errors.push({ row: 0, email: "", reason: "CSV must have 'name' and 'email' columns" });
    return result;
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const name = cols[nameIdx] || "";
    const email = cols[emailIdx] || "";
    const unit = unitIdx >= 0 ? cols[unitIdx] : undefined;
    const rowRole = roleIdx >= 0 && cols[roleIdx] ? (cols[roleIdx] as UserRole) : defaultRole;

    result.total++;

    if (!name || !email) {
      result.errors.push({ row: i + 1, email, reason: "Missing name or email" });
      result.skipped++;
      continue;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      result.errors.push({ row: i + 1, email, reason: "Invalid email format" });
      result.skipped++;
      continue;
    }

    const res = addUser({ email, name, role: rowRole, unit, buildingId }, actor);
    if (res.success) {
      result.added++;
    } else {
      result.errors.push({ row: i + 1, email, reason: res.error || "Unknown error" });
      result.skipped++;
    }
  }

  logAudit("bulk_import", { total: result.total, added: result.added, skipped: result.skipped }, actor.email);
  return result;
}

/**
 * Parse CSV text and upsert users by email.
 * If email exists -> update selected fields; otherwise create a new user.
 * Expected headers: name, email, unit, role, company, buildingId (role/company/unit/buildingId optional)
 */
export function bulkUpsertUsersCsv(
  csvText: string,
  defaultRole: UserRole,
  actor: User,
  defaultBuildingId?: string,
): CsvImportResult {
  const result: CsvImportResult = { total: 0, added: 0, updated: 0, skipped: 0, errors: [] };

  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    result.errors.push({ row: 0, email: "", reason: "CSV must have a header row and at least one data row" });
    return result;
  }

  const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const nameIdx = headers.indexOf("name");
  const emailIdx = headers.indexOf("email");
  const unitIdx = headers.indexOf("unit");
  const roleIdx = headers.indexOf("role");
  const companyIdx = headers.indexOf("company");
  const buildingIdx = headers.indexOf("buildingid");

  if (nameIdx === -1 || emailIdx === -1) {
    result.errors.push({ row: 0, email: "", reason: "CSV must have 'name' and 'email' columns" });
    return result;
  }

  const users = getUsers();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const name = cols[nameIdx] || "";
    const email = cols[emailIdx] || "";
    const unit = unitIdx >= 0 ? cols[unitIdx] || undefined : undefined;
    const company = companyIdx >= 0 ? cols[companyIdx] || undefined : undefined;
    const csvBuildingId = buildingIdx >= 0 ? cols[buildingIdx] || undefined : undefined;
    const rowRole = roleIdx >= 0 && cols[roleIdx] ? (cols[roleIdx] as UserRole) : defaultRole;

    result.total++;

    if (!name || !email) {
      result.errors.push({ row: i + 1, email, reason: "Missing name or email" });
      result.skipped++;
      continue;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      result.errors.push({ row: i + 1, email, reason: "Invalid email format" });
      result.skipped++;
      continue;
    }

    if (!canAddUser(actor.role, rowRole)) {
      result.errors.push({ row: i + 1, email, reason: `${actor.role} cannot assign ${rowRole}` });
      result.skipped++;
      continue;
    }

    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingIndex === -1) {
      users.push({
        id: crypto.randomUUID(),
        email,
        name,
        role: rowRole,
        company,
        password: "12345678",
        addedBy: actor.id,
        buildingId: csvBuildingId || defaultBuildingId,
        unit,
      });
      result.added++;
      continue;
    }

    users[existingIndex] = {
      ...users[existingIndex],
      name,
      role: rowRole,
      company: company || users[existingIndex].company,
      unit: unit || users[existingIndex].unit,
      buildingId: csvBuildingId || defaultBuildingId || users[existingIndex].buildingId,
    };
    result.updated++;
  }

  saveUsers(users);
  logAudit("bulk_upsert_users", { total: result.total, added: result.added, updated: result.updated, skipped: result.skipped }, actor.email);
  return result;
}
