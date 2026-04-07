/**
 * Role-Based Access Control (RBAC) — Onboarding Hierarchy
 *
 * 4-Tier Property Management Hierarchy:
 *
 *   Tier 1 — Property Owner ("Investor")
 *     Strategic oversight, ROI dashboards, Pulse alerts, view-only
 *     Can onboard managers (BM, FM)
 *
 *   Tier 2 — Facility Manager ("Technical Lead")
 *     HVAC, electrical, plumbing, IoT, preventative maintenance
 *     Manages technical vendors and maintenance staff
 *
 *   Tier 3 — Building Manager ("Operator" / Super User)
 *     Daily ops, tenant relations, full platform access
 *     Manages on-site staff, residents, amenities, governance
 *
 *   Tier 4 — Support Staff & Vendors ("Execution")
 *     Task-focused, mobile-first work orders
 *
 *   Data flow: tasks → reports → KPIs (upward aggregation)
 */

import type { UserRole } from "@/lib/auth-context";

// ── Permission Levels ────────────────────────────────────────────────────────

export type PermissionLevel =
  | "full_admin"       // Org Admin — billing, global settings, delete accounts
  | "manager"          // BM / FM — full property-level control
  | "operational"      // On-site staff — front-desk, security, concierge views
  | "resident_portal"  // Residents / tenants — unit, amenities, community
  | "work_order_only"  // Vendors — assigned tickets only, no resident data
  | "guest";           // Read-only public info

// ── Who can add whom ─────────────────────────────────────────────────────────

export const ONBOARDING_HIERARCHY: Record<UserRole, UserRole[]> = {
  // Tier 1 — Owner onboards managers
  building_owner:   ["building_manager", "facility_manager"],
  admin:            ["building_owner", "building_manager", "facility_manager", "resident", "tenant", "concierge", "staff", "security", "vendor", "guest"],
  // Tier 3 — BM (Super User) adds on-site staff + residents
  building_manager: ["concierge", "security", "staff", "resident", "tenant"],
  // Tier 2 — FM adds vendors + maintenance staff
  facility_manager: ["vendor", "staff"],
  // Deprecated — PM merged into BM; kept for backward compatibility
  property_manager: ["concierge", "staff", "resident", "tenant"],
  // Tier 4 & below — cannot add users
  resident:         [],
  tenant:           [],
  concierge:        [],
  staff:            [],
  security:         [],
  vendor:           [],
  guest:            [],
};

/** Can `actorRole` add a user with `targetRole`? */
export function canAddUser(actorRole: UserRole, targetRole: UserRole): boolean {
  return (ONBOARDING_HIERARCHY[actorRole] ?? []).includes(targetRole);
}

/** Roles the current user is allowed to create */
export function addableRoles(actorRole: UserRole): UserRole[] {
  return ONBOARDING_HIERARCHY[actorRole] ?? [];
}

// ── Role Templates ───────────────────────────────────────────────────────────

export interface RoleTemplate {
  level: PermissionLevel;
  label: string;
  description: string;
  canViewFinancials: boolean;
  canViewResidentData: boolean;
  canManageWorkOrders: boolean;
  canManageUsers: boolean;
  canAccessSettings: boolean;
  canViewAuditLog: boolean;
  dashboardSections: string[];
}

export const ROLE_TEMPLATES: Record<UserRole, RoleTemplate> = {
  admin: {
    level: "full_admin",
    label: "Global Admin",
    description: "Full control over billing, settings, and all accounts",
    canViewFinancials: true,
    canViewResidentData: true,
    canManageWorkOrders: true,
    canManageUsers: true,
    canAccessSettings: true,
    canViewAuditLog: true,
    dashboardSections: ["*"],
  },
  building_owner: {
    level: "full_admin",
    label: "Property Owner",
    description: "Tier 1 — Investor: strategic oversight, ROI dashboards, Pulse alerts",
    canViewFinancials: true,
    canViewResidentData: false,
    canManageWorkOrders: false,
    canManageUsers: true,
    canAccessSettings: false,
    canViewAuditLog: true,
    dashboardSections: ["financials", "asset-health", "occupancy", "risk-compliance", "smart-insights", "admin-panel"],
  },
  building_manager: {
    level: "manager",
    label: "Building Manager",
    description: "Tier 3 — Operator / Super User: daily ops, tenant relations, full platform access",
    canViewFinancials: true,
    canViewResidentData: true,
    canManageWorkOrders: true,
    canManageUsers: true,
    canAccessSettings: true,
    canViewAuditLog: true,
    dashboardSections: ["overview", "communications", "onboarding", "amenities", "packages", "visitors", "keys", "work-orders", "incidents", "vendors", "documents", "violations", "analytics", "governance", "user-directory", "access-control", "integrations"],
  },
  facility_manager: {
    level: "manager",
    label: "Facility Manager",
    description: "Tier 2 — Technical Lead: HVAC, electrical, plumbing, IoT, preventative maintenance",
    canViewFinancials: true,
    canViewResidentData: false,
    canManageWorkOrders: true,
    canManageUsers: true,
    canAccessSettings: false,
    canViewAuditLog: true,
    dashboardSections: ["dashboard", "work_orders", "preventative_maintenance", "equipment_directory", "alerts", "vendors", "compliance", "assets", "space", "reports", "documents", "workflows", "vendor_database", "integrations", "audit_log"],
  },
  property_manager: {
    level: "manager",
    label: "Property Manager (Deprecated → Building Manager)",
    description: "Merged into Building Manager — routes to BM dashboard",
    canViewFinancials: true,
    canViewResidentData: true,
    canManageWorkOrders: true,
    canManageUsers: true,
    canAccessSettings: true,
    canViewAuditLog: true,
    dashboardSections: ["overview", "communications", "onboarding", "amenities", "packages", "visitors", "keys", "work-orders", "incidents", "vendors", "documents", "violations", "analytics", "governance", "user-directory", "access-control", "integrations"],
  },
  concierge: {
    level: "operational",
    label: "Concierge",
    description: "Front desk — visitors, packages, amenity bookings",
    canViewFinancials: false,
    canViewResidentData: true,
    canManageWorkOrders: false,
    canManageUsers: false,
    canAccessSettings: false,
    canViewAuditLog: false,
    dashboardSections: ["visitors", "packages", "amenities", "service-requests"],
  },
  security: {
    level: "operational",
    label: "Security",
    description: "CCTV, access control, incident response",
    canViewFinancials: false,
    canViewResidentData: false,
    canManageWorkOrders: false,
    canManageUsers: false,
    canAccessSettings: false,
    canViewAuditLog: false,
    dashboardSections: ["incidents", "access-logs", "patrols", "cctv"],
  },
  staff: {
    level: "operational",
    label: "Staff / Technician",
    description: "Task execution — assigned work orders, check-in, photos",
    canViewFinancials: false,
    canViewResidentData: false,
    canManageWorkOrders: true,
    canManageUsers: false,
    canAccessSettings: false,
    canViewAuditLog: false,
    dashboardSections: ["tasks", "schedule"],
  },
  resident: {
    level: "resident_portal",
    label: "Resident",
    description: "Unit management, amenities, community board",
    canViewFinancials: false,
    canViewResidentData: false,
    canManageWorkOrders: false,
    canManageUsers: false,
    canAccessSettings: false,
    canViewAuditLog: false,
    dashboardSections: ["home", "amenities", "maintenance", "community"],
  },
  tenant: {
    level: "resident_portal",
    label: "Tenant",
    description: "Unit management, amenities, community board",
    canViewFinancials: false,
    canViewResidentData: false,
    canManageWorkOrders: false,
    canManageUsers: false,
    canAccessSettings: false,
    canViewAuditLog: false,
    dashboardSections: ["home", "amenities", "maintenance", "community"],
  },
  vendor: {
    level: "work_order_only",
    label: "Service Provider",
    description: "Work-order access only — assigned tickets, no resident data",
    canViewFinancials: false,
    canViewResidentData: false,
    canManageWorkOrders: true,
    canManageUsers: false,
    canAccessSettings: false,
    canViewAuditLog: false,
    dashboardSections: ["work-orders", "check-in"],
  },
  guest: {
    level: "guest",
    label: "Guest",
    description: "Read-only access to public information",
    canViewFinancials: false,
    canViewResidentData: false,
    canManageWorkOrders: false,
    canManageUsers: false,
    canAccessSettings: false,
    canViewAuditLog: false,
    dashboardSections: [],
  },
};

/** Check whether a role has a specific permission */
export function hasPermission(role: UserRole, perm: keyof Omit<RoleTemplate, "level" | "label" | "description" | "dashboardSections">): boolean {
  return ROLE_TEMPLATES[role]?.[perm] ?? false;
}

/** Org-admin roles that can onboard entire properties */
export const ORG_ADMIN_ROLES: UserRole[] = ["building_owner", "admin"];

/** Manager roles that can manage users within a property */
export const MANAGER_ROLES: UserRole[] = ["building_manager", "facility_manager"];

/** All roles that have user-management capabilities */
export const USER_MANAGEMENT_ROLES: UserRole[] = [...ORG_ADMIN_ROLES, ...MANAGER_ROLES];
