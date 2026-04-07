"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  type IntegrationLayer,
  type IntegrationConnection,
  type ConnectionStatus,
  type VendorPortalSession,
  INTEGRATION_CATALOG,
  LAYER_META,
  listConnections,
  addConnection,
  removeConnection,
  triggerSync,
  createVendorPortalSession,
  listVendorPortalSessions,
} from "@/lib/integration-store";

// ── Icons ────────────────────────────────────────────────────────────────────

const IcoPlus = <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>;
const IcoRefresh = <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>;
const IcoTrash = <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>;
const IcoCopy = <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
const IcoCheck = <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>;
const IcoLink = <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>;
const IcoSend = <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;

// ── Status config ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ConnectionStatus, string> = {
  connected: "bg-green-500/10 text-green-500 border-green-500/30",
  disconnected: "bg-muted/40 text-muted-foreground border-border/30",
  error: "bg-red-500/10 text-red-500 border-red-500/30",
  syncing: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
};

const LAYER_TABS: { key: IntegrationLayer | "overview"; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "erp", label: "ERP / Accounting" },
  { key: "access", label: "Access Control" },
  { key: "bms", label: "BMS & IoT" },
  { key: "vendor", label: "Vendor Portals" },
];

// ── Main Component ───────────────────────────────────────────────────────────

export default function IntegrationsHub() {
  const [activeLayer, setActiveLayer] = useState<IntegrationLayer | "overview">("overview");
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [portalSessions, setPortalSessions] = useState<VendorPortalSession[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Vendor portal form
  const [vpVendor, setVpVendor] = useState("");
  const [vpWorkOrder, setVpWorkOrder] = useState("");
  const [vpTask, setVpTask] = useState("");
  const [vpMsg, setVpMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Connection config form
  const [cfgEndpoint, setCfgEndpoint] = useState("");
  const [cfgApiKey, setCfgApiKey] = useState("");
  const [cfgFrequency, setCfgFrequency] = useState("hourly");

  const reload = () => {
    setConnections(listConnections());
    setPortalSessions(listVendorPortalSessions());
  };

  useEffect(() => { reload(); }, []);

  const layerConnections = useMemo(() => {
    if (activeLayer === "overview") return connections;
    return connections.filter((c) => c.layer === activeLayer);
  }, [connections, activeLayer]);

  const catalogForLayer = useMemo(() => {
    if (activeLayer === "overview") return INTEGRATION_CATALOG;
    return INTEGRATION_CATALOG.filter((c) => c.layer === activeLayer);
  }, [activeLayer]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleConnect(provider: string) {
    const catalogEntry = INTEGRATION_CATALOG.find((c) => c.provider === provider);
    if (!catalogEntry) return;

    addConnection({
      layer: catalogEntry.layer,
      name: catalogEntry.provider,
      provider: catalogEntry.provider,
      description: catalogEntry.description,
      status: "connected",
      protocol: catalogEntry.protocol,
      syncDirection: catalogEntry.layer === "vendor" ? "push" : "bidirectional",
      syncFrequency: cfgFrequency,
      config: {
        endpoint: cfgEndpoint || `https://api.${provider.toLowerCase().replace(/[^a-z0-9]/g, "")}.com/v1`,
        apiKey: cfgApiKey ? "••••••••" + cfgApiKey.slice(-4) : "demo_key_****",
      },
      dataPoints: catalogEntry.dataPoints,
    });

    setShowAddPanel(false);
    setSelectedProvider(null);
    setCfgEndpoint("");
    setCfgApiKey("");
    setCfgFrequency("hourly");
    reload();
  }

  function handleDisconnect(id: string) {
    removeConnection(id);
    reload();
  }

  function handleSync(id: string) {
    triggerSync(id);
    reload();
    // Refresh after simulated sync
    setTimeout(reload, 2200);
  }

  function handleCreatePortalLink() {
    if (!vpVendor.trim() || !vpWorkOrder.trim() || !vpTask.trim()) {
      setVpMsg({ type: "err", text: "All fields required" });
      return;
    }
    const session = createVendorPortalSession({
      vendorName: vpVendor.trim(),
      workOrderId: vpWorkOrder.trim(),
      task: vpTask.trim(),
    });
    setVpMsg({ type: "ok", text: `Magic link created! Token: ${session.token}` });
    setVpVendor("");
    setVpWorkOrder("");
    setVpTask("");
    reload();
  }

  function copyToken(token: string) {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/vendor-portal?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  // ── Layer KPIs ───────────────────────────────────────────────────────────

  const kpis = [
    { label: "Total Connections", value: connections.length, color: "text-accent" },
    { label: "Connected", value: connections.filter((c) => c.status === "connected").length, color: "text-green-500" },
    { label: "Errors", value: connections.filter((c) => c.status === "error").length, color: connections.filter((c) => c.status === "error").length > 0 ? "text-red-500" : "text-green-500" },
    { label: "Vendor Sessions", value: portalSessions.length, color: "text-blue-500" },
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Layer Tabs */}
      <div className="flex gap-1 border-b border-border/40 overflow-x-auto">
        {LAYER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveLayer(tab.key); setShowAddPanel(false); }}
            className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors ${
              activeLayer === tab.key
                ? "text-accent border-b-2 border-accent -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview ──────────────────────────────────────────────────── */}
      {activeLayer === "overview" && (
        <div className="space-y-6">
          {/* Architecture Diagram */}
          <div className="border border-border/40 rounded-lg p-6 bg-card/30">
            <h3 className="font-[var(--font-bebas)] text-xl tracking-wide mb-4">Integration Architecture — Open Ecosystem</h3>
            <p className="font-mono text-xs text-muted-foreground mb-6">
              API-First design: every button in BuildSync calls an internal API, making it easy for external systems to push or pull data.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(LAYER_META) as [IntegrationLayer, typeof LAYER_META["erp"]][]).map(([key, meta]) => {
                const count = connections.filter((c) => c.layer === key).length;
                const available = INTEGRATION_CATALOG.filter((c) => c.layer === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveLayer(key)}
                    className="text-left border border-border/40 rounded-lg p-4 bg-card/20 hover:bg-accent/5 hover:border-accent/40 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-2xl mr-2">{meta.icon}</span>
                        <span className="font-[var(--font-bebas)] text-lg tracking-wide group-hover:text-accent transition-colors">{meta.label}</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {count}/{available} active
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-2 leading-relaxed">{meta.description}</p>
                    <p className="font-mono text-[10px] text-accent/60 mt-1">{meta.technology}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connection Summary */}
          <div className="border border-border/40 rounded-lg p-6 bg-card/30">
            <h3 className="font-[var(--font-bebas)] text-lg tracking-wide mb-1">Connection Summary</h3>
            <p className="font-mono text-[10px] text-muted-foreground mb-4">All active integrations across every layer</p>
            {connections.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground py-8 text-center">No integrations configured yet. Select a layer above to get started.</p>
            ) : (
              <div className="space-y-2">
                {connections.map((conn) => (
                  <div key={conn.id} className="flex items-center justify-between border border-border/20 rounded-md px-4 py-2.5 bg-background/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">{INTEGRATION_CATALOG.find((c) => c.provider === conn.provider)?.icon || "🔌"}</span>
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-medium truncate">{conn.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{LAYER_META[conn.layer].label} · {conn.protocol}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-sm ${STATUS_COLORS[conn.status]}`}>
                      {conn.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strategy Table */}
          <div className="border border-border/40 rounded-lg p-6 bg-card/30">
            <h3 className="font-[var(--font-bebas)] text-lg tracking-wide mb-4">Connection Strategy Reference</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground">
                    <th className="text-left py-2 px-3">Connection Type</th>
                    <th className="text-left py-2 px-3">Technology</th>
                    <th className="text-left py-2 px-3">Target Systems</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/10"><td className="py-2 px-3">Software → Software</td><td className="py-2 px-3 text-muted-foreground">REST APIs / Webhooks</td><td className="py-2 px-3 text-muted-foreground">Yardi, QuickBooks, Gmail, Slack</td></tr>
                  <tr className="border-b border-border/10"><td className="py-2 px-3">Software → Hardware</td><td className="py-2 px-3 text-muted-foreground">Cloud APIs / SDKs</td><td className="py-2 px-3 text-muted-foreground">Smart Locks (Salto), Cameras (Verkada)</td></tr>
                  <tr className="border-b border-border/10"><td className="py-2 px-3">Software → Building</td><td className="py-2 px-3 text-muted-foreground">BACnet / MQTT / Gateways</td><td className="py-2 px-3 text-muted-foreground">HVAC, Elevators, Leak Sensors</td></tr>
                  <tr><td className="py-2 px-3">Software → Human</td><td className="py-2 px-3 text-muted-foreground">Magic Links / QR Codes</td><td className="py-2 px-3 text-muted-foreground">Vendors, One-time Contractors</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Layer Detail View ─────────────────────────────────────────── */}
      {activeLayer !== "overview" && (
        <div className="space-y-6">
          {/* Layer Header */}
          <div className="border border-border/40 rounded-lg p-5 bg-card/30">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xl mr-2">{LAYER_META[activeLayer].icon}</span>
                <span className="font-[var(--font-bebas)] text-xl tracking-wide">{LAYER_META[activeLayer].label}</span>
                <p className="font-mono text-[10px] text-muted-foreground mt-1 max-w-xl">{LAYER_META[activeLayer].description}</p>
                <p className="font-mono text-[10px] mt-1"><span className="text-muted-foreground">Protocol:</span> <span className="text-accent">{LAYER_META[activeLayer].technology}</span></p>
              </div>
              <button
                onClick={() => { setShowAddPanel(!showAddPanel); setSelectedProvider(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-accent bg-accent/10 rounded-md font-mono text-[10px] uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors"
              >
                {IcoPlus} Add Integration
              </button>
            </div>
          </div>

          {/* Add Integration Panel */}
          {showAddPanel && (
            <div className="border border-accent/30 rounded-lg p-5 bg-accent/5">
              <h4 className="font-[var(--font-bebas)] text-lg tracking-wide mb-3">Available Integrations</h4>

              {!selectedProvider ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catalogForLayer.map((entry) => {
                    const isConnected = connections.some((c) => c.provider === entry.provider);
                    return (
                      <button
                        key={entry.provider}
                        disabled={isConnected}
                        onClick={() => setSelectedProvider(entry.provider)}
                        className={`text-left border rounded-lg p-4 transition-all ${
                          isConnected
                            ? "border-green-500/30 bg-green-500/5 opacity-60 cursor-not-allowed"
                            : "border-border/40 bg-card/20 hover:border-accent/40 hover:bg-accent/5"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg mr-1">{entry.icon}</span>
                          {isConnected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase border border-green-500/30 text-green-500 rounded-sm">
                              {IcoCheck} Connected
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs font-medium">{entry.provider}</p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-1 leading-relaxed">{entry.description}</p>
                        <p className="font-mono text-[10px] text-accent/60 mt-1">{entry.protocol}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.dataPoints.map((dp) => (
                            <span key={dp} className="px-1.5 py-0.5 text-[9px] font-mono border border-border/30 rounded-sm text-muted-foreground">
                              {dp}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Configuration form */
                <div className="max-w-lg space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{INTEGRATION_CATALOG.find((c) => c.provider === selectedProvider)?.icon}</span>
                    <span className="font-mono text-sm font-medium">{selectedProvider}</span>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">API Endpoint / Gateway URL</label>
                    <input
                      type="url"
                      className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60"
                      placeholder={`https://api.${selectedProvider.toLowerCase().replace(/[^a-z0-9]/g, "")}.com/v1`}
                      value={cfgEndpoint}
                      onChange={(e) => setCfgEndpoint(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">API Key / Token</label>
                    <input
                      type="password"
                      className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60"
                      placeholder="sk_live_••••••••"
                      value={cfgApiKey}
                      onChange={(e) => setCfgApiKey(e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Sync Frequency</label>
                    <select
                      className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent/60"
                      value={cfgFrequency}
                      onChange={(e) => setCfgFrequency(e.target.value)}
                    >
                      <option value="realtime">Real-time (Webhooks)</option>
                      <option value="5min">Every 5 minutes</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="manual">Manual only</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConnect(selectedProvider)}
                      className="flex items-center gap-1.5 px-4 py-2.5 border border-accent bg-accent/10 rounded-md font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors"
                    >
                      {IcoLink} Connect
                    </button>
                    <button
                      onClick={() => { setSelectedProvider(null); setCfgEndpoint(""); setCfgApiKey(""); }}
                      className="px-4 py-2.5 border border-border/40 rounded-md font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Connections */}
          <div className="border border-border/40 rounded-lg p-5 bg-card/30">
            <h4 className="font-[var(--font-bebas)] text-lg tracking-wide mb-1">Active Connections</h4>
            <p className="font-mono text-[10px] text-muted-foreground mb-4">
              {layerConnections.length} integration{layerConnections.length !== 1 ? "s" : ""} configured for {LAYER_META[activeLayer].label}
            </p>

            {layerConnections.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground py-8 text-center">
                No integrations configured yet. Click &quot;Add Integration&quot; above to connect a system.
              </p>
            ) : (
              <div className="space-y-3">
                {layerConnections.map((conn) => (
                  <div key={conn.id} className="border border-border/20 rounded-lg p-4 bg-background/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-xl mt-0.5">{INTEGRATION_CATALOG.find((c) => c.provider === conn.provider)?.icon || "🔌"}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm font-medium">{conn.name}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-sm ${STATUS_COLORS[conn.status]}`}>
                              {conn.status === "syncing" && <span className="animate-spin mr-1">⟳</span>}
                              {conn.status}
                            </span>
                          </div>
                          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{conn.protocol} · {conn.syncDirection} · {conn.syncFrequency}</p>
                          {conn.lastSyncAt && (
                            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                              Last sync: {new Date(conn.lastSyncAt).toLocaleString()}
                            </p>
                          )}
                          {conn.errorMessage && (
                            <p className="font-mono text-[10px] text-red-500 mt-1">{conn.errorMessage}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {conn.dataPoints.map((dp) => (
                              <span key={dp} className="px-1.5 py-0.5 text-[9px] font-mono border border-border/30 rounded-sm text-muted-foreground">
                                {dp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleSync(conn.id)}
                          className="p-1.5 border border-border/40 rounded-md text-muted-foreground hover:text-accent hover:border-accent/40 transition-colors"
                          title="Sync now"
                        >
                          {IcoRefresh}
                        </button>
                        <button
                          onClick={() => handleDisconnect(conn.id)}
                          className="p-1.5 border border-border/40 rounded-md text-muted-foreground hover:text-red-500 hover:border-red-500/40 transition-colors"
                          title="Disconnect"
                        >
                          {IcoTrash}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vendor Portal Sessions — only on vendor layer */}
          {activeLayer === "vendor" && (
            <div className="space-y-6">
              {/* Create Magic Link */}
              <div className="border border-border/40 rounded-lg p-5 bg-card/30">
                <h4 className="font-[var(--font-bebas)] text-lg tracking-wide mb-1">Create Vendor Magic Link</h4>
                <p className="font-mono text-[10px] text-muted-foreground mb-4">
                  Generate a zero-install portal link. The vendor clicks, sees the job, uploads a &quot;Done&quot; photo, and submits — no account required.
                </p>

                <div className="max-w-lg space-y-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Vendor Name</label>
                    <input
                      type="text"
                      className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60"
                      placeholder="e.g. PlumbCo Services"
                      value={vpVendor}
                      onChange={(e) => setVpVendor(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Work Order ID</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60"
                        placeholder="WO-2026-0451"
                        value={vpWorkOrder}
                        onChange={(e) => setVpWorkOrder(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Task Description</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/60"
                        placeholder="Fix unit 8A sink leak"
                        value={vpTask}
                        onChange={(e) => setVpTask(e.target.value)}
                      />
                    </div>
                  </div>
                  {vpMsg && <p className={`font-mono text-xs ${vpMsg.type === "ok" ? "text-green-400" : "text-red-500"}`}>{vpMsg.text}</p>}
                  <button
                    onClick={handleCreatePortalLink}
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-accent bg-accent/10 rounded-md font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors"
                  >
                    {IcoSend} Generate Magic Link
                  </button>
                </div>
              </div>

              {/* Portal Sessions */}
              <div className="border border-border/40 rounded-lg p-5 bg-card/30">
                <h4 className="font-[var(--font-bebas)] text-lg tracking-wide mb-1">Vendor Portal Sessions</h4>
                <p className="font-mono text-[10px] text-muted-foreground mb-4">
                  Track all magic-link sessions. Copy the link to send to a vendor via text or email.
                </p>

                {portalSessions.length === 0 ? (
                  <p className="font-mono text-xs text-muted-foreground py-8 text-center">No vendor portal sessions yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-border/30 text-muted-foreground">
                          <th className="text-left py-2 px-2">Vendor</th>
                          <th className="text-left py-2 px-2">Work Order</th>
                          <th className="text-left py-2 px-2">Task</th>
                          <th className="text-left py-2 px-2">Status</th>
                          <th className="text-left py-2 px-2">Expires</th>
                          <th className="text-right py-2 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portalSessions.map((session) => (
                          <tr key={session.id} className="border-b border-border/10 hover:bg-card/20 transition-colors">
                            <td className="py-2 px-2">{session.vendorName}</td>
                            <td className="py-2 px-2 text-muted-foreground">{session.workOrderId}</td>
                            <td className="py-2 px-2 text-muted-foreground max-w-[200px] truncate">{session.task}</td>
                            <td className="py-2 px-2">
                              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider border rounded-sm ${
                                session.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/30" :
                                session.status === "viewed" ? "bg-blue-500/10 text-blue-500 border-blue-500/30" :
                                session.status === "expired" ? "bg-red-500/10 text-red-500 border-red-500/30" :
                                "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                              }`}>
                                {session.status}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-muted-foreground">
                              {new Date(session.expiresAt).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-2 text-right">
                              <button
                                onClick={() => copyToken(session.token)}
                                className="inline-flex items-center gap-1 text-[10px] text-accent hover:text-accent/80 transition-colors"
                                title="Copy portal link"
                              >
                                {copiedToken === session.token ? IcoCheck : IcoCopy}
                                {copiedToken === session.token ? "Copied!" : "Copy Link"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* CSV Importer Info */}
              <div className="border border-border/40 rounded-lg p-5 bg-card/30">
                <h4 className="font-[var(--font-bebas)] text-lg tracking-wide mb-1">CSV / Excel Service Log Importer</h4>
                <p className="font-mono text-[10px] text-muted-foreground mb-3">
                  For vendors with their own legacy systems, provide a standardised template for bulk-uploading monthly service logs.
                </p>
                <div className="bg-background/50 border border-border/30 rounded-md p-3 font-mono text-[10px] text-muted-foreground">
                  <p className="mb-2">CSV Format:</p>
                  <code className="block bg-card/50 p-2 rounded text-[10px]">
                    date,vendor_name,service_type,description,cost,work_order_id<br />
                    2026-04-01,PlumbCo,Plumbing,Fixed unit 8A sink,$350,WO-2026-0451<br />
                    2026-04-01,HVAC Pros,HVAC,Quarterly maintenance,$1200,WO-2026-0452
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
