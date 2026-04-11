/**
 * Integration Store — Open Ecosystem
 *
 * Manages connections across four integration layers:
 *   1. Financial & Accounting (ERP) — Yardi, MRI, AppFolio, QuickBooks
 *   2. Physical Access (Hardware)  — Brivo, HID, Salto smart locks
 *   3. Technical/Mechanical (BMS & IoT) — BACnet, Modbus, MQTT gateways
 *   4. Software-to-Human (Vendor Portals) — Magic Links, QR, CSV
 *
 * All MVP/demo — localStorage-backed.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type IntegrationLayer = "erp" | "access" | "bms" | "vendor";

export type ConnectionStatus = "connected" | "disconnected" | "error" | "syncing" | "pending";

export type SyncDirection = "pull" | "push" | "bidirectional";

export interface IntegrationConnection {
  id: string;
  layer: IntegrationLayer;
  name: string;
  provider: string;
  description: string;
  status: ConnectionStatus;
  protocol: string;           // REST API, Webhook, BACnet, Modbus, MQTT, Cloud API, Magic Link, etc.
  syncDirection: SyncDirection;
  lastSyncAt: string | null;
  syncFrequency: string;      // "realtime", "5min", "hourly", "daily", "manual"
  errorMessage: string | null;
  config: Record<string, string>;
  dataPoints: string[];       // what data this connection syncs
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  connectionId: string;
  event: string;
  timestamp: string;
  status: "success" | "failed" | "pending";
  payload: string;
}

export interface VendorPortalSession {
  id: string;
  vendorName: string;
  token: string;
  workOrderId: string;
  task: string;
  status: "pending" | "viewed" | "completed" | "expired";
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
  photoUrl: string | null;
  notes: string | null;
}

// ─── Catalog (available integrations) ────────────────────────────────────────

export interface IntegrationCatalogEntry {
  provider: string;
  layer: IntegrationLayer;
  protocol: string;
  description: string;
  dataPoints: string[];
  icon: string; // emoji for demo
}

export const INTEGRATION_CATALOG: IntegrationCatalogEntry[] = [
  // ERP
  { provider: "Yardi Voyager", layer: "erp", protocol: "REST API / Webhooks", description: "Tenant lists, lease dates, rent payments, GL accounts", dataPoints: ["tenants", "leases", "payments", "chart_of_accounts"], icon: "📊" },
  { provider: "MRI Software", layer: "erp", protocol: "REST API / Webhooks", description: "Property accounting, tenant management, lease abstraction", dataPoints: ["tenants", "leases", "payments", "work_orders"], icon: "📋" },
  { provider: "AppFolio", layer: "erp", protocol: "REST API", description: "Online rent collection, lease tracking, maintenance requests", dataPoints: ["tenants", "payments", "maintenance_requests"], icon: "🏠" },
  { provider: "QuickBooks Online", layer: "erp", protocol: "REST API / OAuth 2.0", description: "General ledger, accounts payable, invoicing", dataPoints: ["invoices", "expenses", "vendors", "chart_of_accounts"], icon: "💰" },
  { provider: "Sage Intacct", layer: "erp", protocol: "REST API", description: "Multi-entity accounting, budgets, financial reporting", dataPoints: ["gl_entries", "budgets", "vendors", "payments"], icon: "📈" },
  { provider: "RentManager", layer: "erp", protocol: "REST API", description: "Lease management, tenant screening, payment processing", dataPoints: ["tenants", "leases", "payments", "screening"], icon: "🔑" },
  // Access
  { provider: "Brivo Access", layer: "access", protocol: "Cloud API / SDK", description: "Cloud-based access control, credential management, event logs", dataPoints: ["doors", "credentials", "access_events", "lockdowns"], icon: "🚪" },
  { provider: "HID Global", layer: "access", protocol: "Cloud API / SDK", description: "Mobile credentials, readers, identity management", dataPoints: ["credentials", "readers", "access_events"], icon: "📱" },
  { provider: "Salto KS", layer: "access", protocol: "Cloud API", description: "Smart lock management, virtual keys, audit trails", dataPoints: ["locks", "virtual_keys", "access_events", "battery_status"], icon: "🔐" },
  { provider: "Verkada", layer: "access", protocol: "Cloud API", description: "Video surveillance, access control, environmental sensors", dataPoints: ["cameras", "doors", "access_events", "footage"], icon: "📹" },
  { provider: "LiftMaster myQ", layer: "access", protocol: "Cloud API", description: "Garage door and gate access control", dataPoints: ["gates", "access_events", "device_status"], icon: "🏗️" },
  // BMS & IoT
  { provider: "BACnet Gateway", layer: "bms", protocol: "BACnet/IP", description: "HVAC controllers, VAV boxes, boilers, chillers via BACnet protocol", dataPoints: ["temperature", "humidity", "pressure", "setpoints", "alarms"], icon: "🌡️" },
  { provider: "Modbus Gateway", layer: "bms", protocol: "Modbus TCP/RTU", description: "Electrical meters, pumps, generators via Modbus protocol", dataPoints: ["power_consumption", "voltage", "current", "motor_status"], icon: "⚡" },
  { provider: "MQTT Broker", layer: "bms", protocol: "MQTT", description: "IoT sensor mesh — leak detectors, occupancy sensors, air quality", dataPoints: ["leak_alerts", "occupancy", "air_quality", "noise_levels"], icon: "📡" },
  { provider: "Schneider EcoStruxure", layer: "bms", protocol: "REST API / BACnet", description: "Building management system — HVAC, lighting, energy", dataPoints: ["hvac_status", "lighting", "energy_consumption", "schedules"], icon: "🏢" },
  { provider: "Johnson Controls Metasys", layer: "bms", protocol: "REST API / BACnet", description: "Enterprise BMS — HVAC, fire, security integration", dataPoints: ["hvac_status", "fire_alarms", "energy", "schedules"], icon: "🔧" },
  { provider: "Honeywell Forge", layer: "bms", protocol: "REST API / MQTT", description: "Connected buildings platform — energy, comfort, sustainability", dataPoints: ["energy", "comfort_index", "sustainability_score", "alerts"], icon: "🌿" },
  // Vendor
  { provider: "Magic Link Portal", layer: "vendor", protocol: "Magic Link / SMS", description: "Zero-install vendor task portal — view job, upload photo, submit", dataPoints: ["work_orders", "completion_photos", "notes"], icon: "🔗" },
  { provider: "QR Code Check-in", layer: "vendor", protocol: "QR Code / NFC", description: "Vendor site check-in/out with location and time stamping", dataPoints: ["check_in", "check_out", "location", "duration"], icon: "📎" },
  { provider: "CSV/Excel Importer", layer: "vendor", protocol: "File Upload", description: "Bulk upload vendor service logs, invoices, and reports", dataPoints: ["service_logs", "invoices", "reports"], icon: "📄" },
  { provider: "Slack", layer: "vendor", protocol: "REST API / Webhooks", description: "Team notifications, work order alerts, escalation channels", dataPoints: ["notifications", "channels", "messages"], icon: "💬" },
  { provider: "Discord", layer: "vendor", protocol: "Webhooks / Bot API", description: "Community channels, incident broadcasts, and concierge communication", dataPoints: ["notifications", "channels", "messages"], icon: "🎮" },
  { provider: "Gmail / SMTP", layer: "vendor", protocol: "SMTP / REST API", description: "Email notifications, tenant communications, vendor dispatch", dataPoints: ["emails", "templates", "delivery_status"], icon: "✉️" },
];

// ─── Storage Helpers ─────────────────────────────────────────────────────────

const CONNECTIONS_KEY = "buildsync_integrations";
const WEBHOOK_KEY = "buildsync_webhook_events";
const PORTAL_KEY = "buildsync_vendor_portal_sessions";

function getConnections(): IntegrationConnection[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(CONNECTIONS_KEY) || "[]");
}

function saveConnections(connections: IntegrationConnection[]) {
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
}

// ─── Connection Management ───────────────────────────────────────────────────

export function listConnections(layer?: IntegrationLayer): IntegrationConnection[] {
  const all = getConnections();
  return layer ? all.filter((c) => c.layer === layer) : all;
}

export function addConnection(
  data: Omit<IntegrationConnection, "id" | "createdAt" | "lastSyncAt" | "errorMessage">,
): IntegrationConnection {
  const connections = getConnections();
  const connection: IntegrationConnection = {
    ...data,
    id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    lastSyncAt: null,
    errorMessage: null,
  };
  connections.push(connection);
  saveConnections(connections);
  return connection;
}

export function updateConnectionStatus(
  id: string,
  status: ConnectionStatus,
  errorMessage?: string,
): IntegrationConnection | null {
  const connections = getConnections();
  const idx = connections.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  connections[idx].status = status;
  connections[idx].errorMessage = errorMessage || null;
  if (status === "connected") {
    connections[idx].lastSyncAt = new Date().toISOString();
  }
  saveConnections(connections);
  return connections[idx];
}

export function removeConnection(id: string): boolean {
  const connections = getConnections();
  const filtered = connections.filter((c) => c.id !== id);
  if (filtered.length === connections.length) return false;
  saveConnections(filtered);
  return true;
}

export function triggerSync(id: string): IntegrationConnection | null {
  const connections = getConnections();
  const idx = connections.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  connections[idx].status = "syncing";
  connections[idx].lastSyncAt = new Date().toISOString();
  saveConnections(connections);
  // Simulate async sync completion
  setTimeout(() => {
    const conns = getConnections();
    const i = conns.findIndex((c) => c.id === id);
    if (i !== -1 && conns[i].status === "syncing") {
      conns[i].status = "connected";
      saveConnections(conns);
    }
  }, 2000);
  return connections[idx];
}

// ─── Webhook Event Log ───────────────────────────────────────────────────────

export function listWebhookEvents(connectionId?: string): WebhookEvent[] {
  if (typeof window === "undefined") return [];
  const all: WebhookEvent[] = JSON.parse(localStorage.getItem(WEBHOOK_KEY) || "[]");
  return connectionId ? all.filter((e) => e.connectionId === connectionId) : all;
}

export function logWebhookEvent(event: Omit<WebhookEvent, "id" | "timestamp">): WebhookEvent {
  const events: WebhookEvent[] = JSON.parse(localStorage.getItem(WEBHOOK_KEY) || "[]");
  const entry: WebhookEvent = {
    ...event,
    id: `wh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  events.unshift(entry);
  // Keep last 100
  if (events.length > 100) events.length = 100;
  localStorage.setItem(WEBHOOK_KEY, JSON.stringify(events));
  return entry;
}

// ─── Vendor Portal Sessions (Magic Links) ────────────────────────────────────

function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createVendorPortalSession(data: {
  vendorName: string;
  workOrderId: string;
  task: string;
}): VendorPortalSession {
  const sessions: VendorPortalSession[] = JSON.parse(localStorage.getItem(PORTAL_KEY) || "[]");
  const session: VendorPortalSession = {
    id: `vps_${Date.now()}`,
    vendorName: data.vendorName,
    token: generateToken(),
    workOrderId: data.workOrderId,
    task: data.task,
    status: "pending",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    photoUrl: null,
    notes: null,
  };
  sessions.push(session);
  localStorage.setItem(PORTAL_KEY, JSON.stringify(sessions));
  return session;
}

export function getVendorPortalSession(token: string): VendorPortalSession | null {
  const sessions: VendorPortalSession[] = JSON.parse(localStorage.getItem(PORTAL_KEY) || "[]");
  return sessions.find((s) => s.token === token) || null;
}

export function completeVendorPortalSession(
  token: string,
  data: { notes?: string; photoUrl?: string },
): VendorPortalSession | null {
  const sessions: VendorPortalSession[] = JSON.parse(localStorage.getItem(PORTAL_KEY) || "[]");
  const idx = sessions.findIndex((s) => s.token === token);
  if (idx === -1) return null;
  sessions[idx].status = "completed";
  sessions[idx].completedAt = new Date().toISOString();
  sessions[idx].notes = data.notes || null;
  sessions[idx].photoUrl = data.photoUrl || null;
  localStorage.setItem(PORTAL_KEY, JSON.stringify(sessions));
  return sessions[idx];
}

export function listVendorPortalSessions(): VendorPortalSession[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(PORTAL_KEY) || "[]");
}

// ─── Layer Metadata ──────────────────────────────────────────────────────────

export const LAYER_META: Record<IntegrationLayer, { label: string; description: string; technology: string; icon: string }> = {
  erp: {
    label: "Financial & Accounting",
    description: "Software-to-Software — Pull tenant lists, lease dates, payment statuses from existing ERP/accounting systems.",
    technology: "REST APIs / Webhooks / OAuth 2.0",
    icon: "💰",
  },
  access: {
    label: "Physical Access Control",
    description: "Software-to-Hardware — Manage smart locks, fobs, and credentials through cloud APIs. Deactivate access in real-time.",
    technology: "Cloud APIs / SDKs",
    icon: "🚪",
  },
  bms: {
    label: "BMS & IoT Sensors",
    description: "Software-to-Building — Connect to HVAC, elevators, and leak sensors through gateway devices and industrial protocols.",
    technology: "BACnet / Modbus / MQTT / Gateways",
    icon: "🌡️",
  },
  vendor: {
    label: "Vendor & Communication",
    description: "Software-to-Human — Zero-install portals for vendors, CSV importers, and notification channels.",
    technology: "Magic Links / QR Codes / SMTP / Webhooks",
    icon: "🔗",
  },
};
