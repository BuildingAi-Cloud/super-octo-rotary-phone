"use client";

import React, { useMemo, useState } from "react";
import {
  getMaskedCredentialRef,
  getSafeStreamEndpoint,
  getCameraSecurityIssues,
  isCameraFeedSecure,
  listCameraFeeds,
  listCameraProviderTemplates,
  listCameraProviders,
  type CameraFeedRecord,
  type CameraProvider,
  type CameraStatus,
} from "@/lib/camera-feed-store";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, StatusDot, EmptyState } from "./bm-shared";

type AccessFilter = "all" | "active" | "scheduled" | "expired" | "revoked";

interface AccessEntry {
  id: string;
  name: string;
  type: "resident" | "temp-guest" | "contractor" | "delivery" | "emergency";
  unit: string;
  accessPoints: string[];
  validFrom: string;
  validUntil: string;
  status: "active" | "scheduled" | "expired" | "revoked";
  method: "smart-lock" | "fob" | "pin" | "buzzer";
  lastUsed: string | null;
}

const ACCESS_ENTRIES: AccessEntry[] = [
  { id: "AC-001", name: "Sarah Chen", type: "resident", unit: "14B", accessPoints: ["Main Entrance", "Garage", "Gym", "Pool"], validFrom: "2024-06-15", validUntil: "2025-06-15", status: "active", method: "smart-lock", lastUsed: "2025-01-14 07:30" },
  { id: "AC-002", name: "PlumbRight crew", type: "contractor", unit: "8A", accessPoints: ["Service Entrance", "Unit 8A"], validFrom: "2025-01-14 09:00", validUntil: "2025-01-14 17:00", status: "active", method: "pin", lastUsed: "2025-01-14 09:10" },
  { id: "AC-003", name: "Maria Garcia (guest)", type: "temp-guest", unit: "22C", accessPoints: ["Main Entrance", "Guest Parking"], validFrom: "2025-01-15 16:00", validUntil: "2025-01-17 11:00", status: "scheduled", method: "pin", lastUsed: null },
  { id: "AC-004", name: "FedEx Delivery", type: "delivery", unit: "Mailroom", accessPoints: ["Service Entrance", "Mailroom"], validFrom: "2025-01-14 08:00", validUntil: "2025-01-14 18:00", status: "active", method: "buzzer", lastUsed: "2025-01-14 10:30" },
  { id: "AC-005", name: "Jake Miller", type: "resident", unit: "7C", accessPoints: ["Main Entrance", "Garage"], validFrom: "2024-09-01", validUntil: "2025-01-20", status: "active", method: "fob", lastUsed: "2025-01-14 08:15" },
  { id: "AC-006", name: "Former Tenant - Oscar Reyes", type: "resident", unit: "3B", accessPoints: [], validFrom: "2023-06-01", validUntil: "2025-01-10", status: "revoked", method: "smart-lock", lastUsed: "2025-01-10 09:00" },
  { id: "AC-007", name: "HVAC Solutions", type: "contractor", unit: "Mechanical", accessPoints: ["Service Entrance", "Mechanical Room"], validFrom: "2025-01-15 08:00", validUntil: "2025-01-15 16:00", status: "scheduled", method: "pin", lastUsed: null },
  { id: "AC-008", name: "Fire Department", type: "emergency", unit: "All", accessPoints: ["All Access Points"], validFrom: "Permanent", validUntil: "Permanent", status: "active", method: "smart-lock", lastUsed: "2025-01-10 12:15" },
];

export default function AccessControlTab() {
  const [filter, setFilter] = useState<AccessFilter>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"access" | "cameras">("access");
  const [cameraStatusFilter, setCameraStatusFilter] = useState<CameraStatus | "all">("all");
  const [cameraProviderFilter, setCameraProviderFilter] = useState<CameraProvider | "all">("all");
  const [secureOnly, setSecureOnly] = useState(false);

  const filteredAccess = ACCESS_ENTRIES.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    return a.name.toLowerCase().includes(search.toLowerCase()) || a.unit.toLowerCase().includes(search.toLowerCase());
  });

  const cameras = useMemo(
    () => listCameraFeeds({ provider: cameraProviderFilter, status: cameraStatusFilter, search, secureOnly }),
    [cameraProviderFilter, cameraStatusFilter, search, secureOnly],
  );

  const allCameras = useMemo(() => listCameraFeeds(), []);
  const providerOptions = useMemo(() => listCameraProviders(), []);
  const templatesCount = useMemo(() => listCameraProviderTemplates().length, []);
  const onlineCams = allCameras.filter((c) => c.status !== "offline").length;
  const offlineCams = allCameras.filter((c) => c.status === "offline").length;
  const secureCams = allCameras.filter((c) => isCameraFeedSecure(c)).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Active Passes", value: ACCESS_ENTRIES.filter((a) => a.status === "active").length, color: "text-green-500" },
          { label: "Scheduled", value: ACCESS_ENTRIES.filter((a) => a.status === "scheduled").length, color: "text-blue-500" },
          { label: "Revoked", value: ACCESS_ENTRIES.filter((a) => a.status === "revoked").length, color: "text-red-500" },
          { label: "Cameras Online", value: `${onlineCams}/${allCameras.length}`, color: "text-accent" },
          { label: "Cameras Offline", value: offlineCams, color: offlineCams > 0 ? "text-red-500" : "text-green-500" },
          { label: "Encrypted Feeds", value: `${secureCams}/${allCameras.length}`, color: secureCams === allCameras.length ? "text-green-500" : "text-yellow-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="border border-border/40 rounded-lg p-3 bg-card/30">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-[var(--font-bebas)] tracking-wide ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setView("access")} className={`px-4 py-1.5 text-xs font-mono rounded-md border transition-colors ${view === "access" ? "border-accent bg-accent/10 text-accent" : "border-border/40 text-muted-foreground hover:text-accent"}`}>
          {Icons.lock} Access Passes
        </button>
        <button type="button" onClick={() => setView("cameras")} className={`px-4 py-1.5 text-xs font-mono rounded-md border transition-colors ${view === "cameras" ? "border-accent bg-accent/10 text-accent" : "border-border/40 text-muted-foreground hover:text-accent"}`}>
          {Icons.camera} CCTV Feeds
        </button>
      </div>

      {view === "access" ? (
        <>
          <FilterBar>
            {(["all", "active", "scheduled", "expired", "revoked"] as AccessFilter[]).map((f) => (
              <FilterChip key={f} label={f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onClick={() => setFilter(f)} />
            ))}
            <SearchInput value={search} onChange={setSearch} placeholder="Search access..." />
          </FilterBar>

          <SectionCard
            title="Access Control"
            actions={
              <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-accent/40 text-accent hover:bg-accent/10 rounded-md transition-colors">
                {Icons.plus} Grant Access
              </button>
            }
          >
            {filteredAccess.length === 0 ? (
              <EmptyState message="No access entries found" />
            ) : (
              <div className="space-y-2">
                {filteredAccess.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 p-3 border border-border/20 rounded-md hover:bg-card/50 transition-colors">
                    <StatusDot status={
                      a.status === "active" ? "green" :
                      a.status === "scheduled" ? "yellow" :
                      a.status === "revoked" ? "red" : "gray"
                    } />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-[10px] font-mono ${
                      a.type === "resident" ? "bg-blue-500/10 border-blue-500/30 text-blue-500" :
                      a.type === "contractor" ? "bg-orange-500/10 border-orange-500/30 text-orange-500" :
                      a.type === "delivery" ? "bg-green-500/10 border-green-500/30 text-green-500" :
                      a.type === "emergency" ? "bg-red-500/10 border-red-500/30 text-red-500" :
                      "bg-purple-500/10 border-purple-500/30 text-purple-500"
                    }`}>
                      {a.type.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium truncate">{a.name}</span>
                        <Badge className="border-border/40 text-muted-foreground">{a.method}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {a.accessPoints.join(" · ")}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">{a.validUntil}</span>
                    {a.lastUsed && <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">Last: {a.lastUsed.split(" ")[1]}</span>}
                    <Badge className={
                      a.status === "active" ? "border-green-500/40 text-green-500" :
                      a.status === "scheduled" ? "border-blue-500/40 text-blue-500" :
                      a.status === "revoked" ? "border-red-500/40 text-red-500" :
                      "border-gray-400/40 text-gray-400"
                    }>
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      ) : (
        <SectionCard title="CCTV & Security Feeds">
          <FilterBar>
            {(["all", "online", "recording", "offline"] as const).map((status) => (
              <FilterChip
                key={status}
                label={status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                active={cameraStatusFilter === status}
                onClick={() => setCameraStatusFilter(status)}
              />
            ))}
            <select
              value={cameraProviderFilter}
              onChange={(event) => setCameraProviderFilter(event.target.value as CameraProvider | "all")}
              className="bg-background border border-border/40 rounded-md px-3 py-1.5 font-mono text-xs"
            >
              <option value="all">All Providers</option>
              {providerOptions.map((provider) => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSecureOnly((current) => !current)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors ${
                secureOnly
                  ? "border-green-500/40 bg-green-500/10 text-green-400"
                  : "border-border/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              Secure Only
            </button>
            <SearchInput value={search} onChange={setSearch} placeholder="Search camera, unit, zone..." />
          </FilterBar>

          <p className="text-[10px] font-mono text-muted-foreground mb-3">Provider templates available: {templatesCount} (supports market camera ecosystems through secure protocol/auth combinations).</p>

          {cameras.length === 0 ? (
            <EmptyState message="No linked camera feeds match these filters" />
          ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {cameras.map((cam: CameraFeedRecord) => (
              <div key={cam.id} className="border border-border/20 rounded-md overflow-hidden">
                {/* Placeholder feed uses linked metadata from the shared camera registry. */}
                <div className={`h-32 flex items-center justify-center ${cam.status === "offline" ? "bg-red-500/5" : "bg-card/50"}`}>
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <span>{Icons.camera}</span>
                    <span className="text-[10px] font-mono uppercase">{cam.status === "offline" ? "Signal Lost" : "Live Feed"}</span>
                    <span className="text-[10px] font-mono text-muted-foreground/80">{cam.providerCameraId}</span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium">{cam.name}</span>
                    <StatusDot status={cam.status === "offline" ? "red" : cam.status === "recording" ? "green" : "yellow"} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>{cam.location}</span>
                    <Badge className={
                      cam.status === "recording" ? "border-green-500/40 text-green-500" :
                      cam.status === "online" ? "border-blue-500/40 text-blue-500" :
                      "border-red-500/40 text-red-500"
                    }>
                      {cam.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border-border/40 text-muted-foreground">{cam.provider}</Badge>
                    <Badge className="border-border/40 text-muted-foreground">{cam.buildingName}</Badge>
                    <Badge className="border-border/40 text-muted-foreground">{cam.coverageType}</Badge>
                    <Badge className="border-border/40 text-muted-foreground">{cam.protocol.toUpperCase()}</Badge>
                    <Badge className={cam.transportEncryption === "none" ? "border-red-500/40 text-red-500" : "border-green-500/40 text-green-500"}>
                      {cam.transportEncryption === "none" ? "Unencrypted" : `${cam.transportEncryption.toUpperCase()} Encrypted`}
                    </Badge>
                    <Badge className={cam.requiresAuth ? "border-green-500/40 text-green-500" : "border-yellow-500/40 text-yellow-500"}>
                      {cam.requiresAuth ? `Auth: ${cam.authMode}` : "No Auth"}
                    </Badge>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">Zone: {cam.zone}</p>
                  {cam.unit && <p className="text-[10px] font-mono text-muted-foreground">Linked Unit: {cam.unit}</p>}
                  {cam.accessPoint && <p className="text-[10px] font-mono text-muted-foreground">Access Point: {cam.accessPoint}</p>}
                  <p className="text-[10px] font-mono text-muted-foreground truncate">Integration: {cam.linkedIntegrationName}</p>
                  <p className="text-[10px] font-mono text-muted-foreground truncate">Stream: {getSafeStreamEndpoint(cam.streamUrl)}</p>
                  {cam.credentialsRef && <p className="text-[10px] font-mono text-muted-foreground truncate">Credential Vault Ref: {getMaskedCredentialRef(cam.credentialsRef)}</p>}
                  {cam.complianceTags.length > 0 && (
                    <p className="text-[10px] font-mono text-muted-foreground">Compliance: {cam.complianceTags.join(" · ")}</p>
                  )}
                  {cam.lastMotion && (
                    <p className="text-[10px] font-mono text-muted-foreground">Motion: {cam.lastMotion.split(" ")[1]}</p>
                  )}
                  {!isCameraFeedSecure(cam) && (
                    <div className="border border-red-500/30 bg-red-500/5 p-2">
                      <p className="text-[10px] font-mono text-red-400 uppercase tracking-wider mb-1">Security Warning</p>
                      {getCameraSecurityIssues(cam).map((issue, index) => (
                        <p key={index} className="text-[10px] font-mono text-red-300">• {issue}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
