"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icons, SectionCard, KpiCard, SimpleBarChart, FilterChip, Badge, StatusIndicator } from "./bo-shared";

// ── Market Data ───────────────────────────────────────────────────────────────

type MarketKey =
  | "New York, NY"
  | "Los Angeles, CA"
  | "Chicago, IL"
  | "Toronto, ON"
  | "Miami, FL"
  | "Seattle, WA"
  | "Austin, TX"
  | "Boston, MA"
  | "San Francisco, CA"
  | "Dallas, TX";

export const ALL_MARKETS: MarketKey[] = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Toronto, ON",
  "Miami, FL", "Seattle, WA", "Austin, TX", "Boston, MA",
  "San Francisco, CA", "Dallas, TX",
];

const MARKET_COORDS: Record<MarketKey, [number, number]> = {
  "New York, NY":      [40.71, -74.00],
  "Los Angeles, CA":   [34.05, -118.24],
  "Chicago, IL":       [41.85, -87.65],
  "Toronto, ON":       [43.65, -79.38],
  "Miami, FL":         [25.77, -80.19],
  "Seattle, WA":       [47.61, -122.33],
  "Austin, TX":        [30.27, -97.74],
  "Boston, MA":        [42.36, -71.06],
  "San Francisco, CA": [37.77, -122.42],
  "Dallas, TX":        [32.78, -96.80],
};

// Per-market averages — [rentPerSqft, occupancy%, opexPerSqft, capRate%, utilityPerUnit, turnoverRate%, avgDaysToLease, maintPerUnit]
const MARKET_AVGS: Record<MarketKey, number[]> = {
  "New York, NY":      [4.85, 97.2, 2.14, 5.4, 168, 9.2,  12, 102],
  "Los Angeles, CA":   [3.95, 95.8, 1.98, 5.8, 155, 12.4, 22,  98],
  "Chicago, IL":       [2.85, 91.2, 1.58, 6.9, 118, 16.8, 28,  88],
  "Toronto, ON":       [3.65, 98.4, 1.82, 4.8, 148,  8.6, 15,  94],
  "Miami, FL":         [3.25, 94.2, 1.78, 6.2, 162, 14.2, 26,  92],
  "Seattle, WA":       [3.55, 96.1, 1.92, 5.9, 145, 11.6, 19,  96],
  "Austin, TX":        [2.95, 88.4, 1.52, 7.2, 112, 18.2, 32,  82],
  "Boston, MA":        [4.12, 95.6, 2.02, 5.6, 158, 10.4, 16, 100],
  "San Francisco, CA": [5.10, 93.8, 2.35, 4.9, 175, 13.6, 20, 108],
  "Dallas, TX":        [2.65, 89.8, 1.45, 7.4, 108, 17.4, 30,  78],
};

// Per-market avg rents by unit type [Studio, 1BR, 2BR, 3BR, PH]
const MARKET_RENTS: Record<MarketKey, number[]> = {
  "New York, NY":      [2800, 3900, 5600, 7200, 12000],
  "Los Angeles, CA":   [2200, 2850, 4100, 5600,  9200],
  "Chicago, IL":       [1500, 2000, 2800, 3800,  7200],
  "Toronto, ON":       [2100, 2700, 3800, 5200,  9800],
  "Miami, FL":         [1900, 2500, 3600, 4800,  8400],
  "Seattle, WA":       [1950, 2600, 3700, 5000,  8800],
  "Austin, TX":        [1600, 2100, 2950, 4000,  7400],
  "Boston, MA":        [2400, 3200, 4500, 6000, 10200],
  "San Francisco, CA": [3100, 4200, 6000, 7800, 14000],
  "Dallas, TX":        [1400, 1900, 2700, 3700,  7000],
};

const OWN_METRICS = [
  { metric: "Avg Rent / sqft",          yours: "$3.42", yoursNum: 3.42,  fmt: (v: number) => `$${v.toFixed(2)}`, higherIsBetter: true  },
  { metric: "Occupancy Rate",           yours: "96.4%", yoursNum: 96.4,  fmt: (v: number) => `${v}%`,           higherIsBetter: true  },
  { metric: "Operating Expense / sqft", yours: "$1.86", yoursNum: 1.86,  fmt: (v: number) => `$${v.toFixed(2)}`, higherIsBetter: false },
  { metric: "Cap Rate",                 yours: "6.8%",  yoursNum: 6.8,   fmt: (v: number) => `${v}%`,           higherIsBetter: true  },
  { metric: "Utility Cost / unit",      yours: "$142",  yoursNum: 142,   fmt: (v: number) => `$${v}`,           higherIsBetter: false },
  { metric: "Tenant Turnover Rate",     yours: "11.8%", yoursNum: 11.8,  fmt: (v: number) => `${v}%`,           higherIsBetter: false },
  { metric: "Avg Days to Lease",        yours: "18",    yoursNum: 18,    fmt: (v: number) => `${v}`,            higherIsBetter: false },
  { metric: "Maintenance Cost / unit",  yours: "$86",   yoursNum: 86,    fmt: (v: number) => `$${v}`,           higherIsBetter: false },
];

const OWN_RENTS = [1850, 2200, 3100, 4200, 6800];
const UNIT_LABELS = ["Studio", "1BR", "2BR", "3BR", "PH"];

function buildBenchmarks(market: MarketKey) {
  return OWN_METRICS.map((m, i) => {
    const mVal = MARKET_AVGS[market][i];
    const delta = ((m.yoursNum - mVal) / mVal) * 100;
    const favorable = m.higherIsBetter ? m.yoursNum >= mVal : m.yoursNum <= mVal;
    return { metric: m.metric, yours: m.yours, market: m.fmt(mVal), delta: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`, favorable };
  });
}

function nearestMarket(lat: number, lng: number): MarketKey {
  let nearest: MarketKey = "New York, NY";
  let minDist = Infinity;
  for (const [key, [clat, clng]] of Object.entries(MARKET_COORDS) as [MarketKey, [number, number]][]) {
    const d = Math.sqrt((lat - clat) ** 2 + (lng - clng) ** 2);
    if (d < minDist) { minDist = d; nearest = key; }
  }
  return nearest;
}

type LocationMode = "auto" | "manual" | "disabled";
type GeoStatus    = "idle" | "detecting" | "resolved" | "denied";

const LS_MODE   = "buildsync_market_loc_mode";
const LS_MARKET = "buildsync_market_loc_market";

// ── Extracted sub-components (must live outside SmartInsightsTab so React
//    doesn't remount them on every render cycle) ────────────────────────────

function MarketDropdown({
  value,
  onChange,
}: {
  value: MarketKey;
  onChange: (m: MarketKey) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as MarketKey)}
      className="bg-background border border-border/40 rounded px-2 py-0.5 font-mono text-[10px] focus:outline-none focus:border-accent/60 text-foreground"
    >
      {ALL_MARKETS.map((m) => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>
  );
}

function LocationControl({
  locationMode,
  geoStatus,
  selectedMarket,
  onChangeMode,
  onChangeMarket,
  onRetryGps,
}: {
  locationMode: LocationMode;
  geoStatus: GeoStatus;
  selectedMarket: MarketKey;
  onChangeMode: (m: LocationMode) => void;
  onChangeMarket: (m: MarketKey) => void;
  onRetryGps: () => void;
}) {
  const LockBtn = () => (
    <button
      onClick={() => onChangeMode("disabled")}
      className="font-mono text-[10px] text-muted-foreground hover:text-red-400 transition-colors"
      title="Disable for privacy"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    </button>
  );

  // Initial auto — waiting for useEffect to fire geolocation
  if (locationMode === "auto" && geoStatus === "idle") {
    return (
      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
        <span className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
        Preparing…
      </div>
    );
  }

  if (locationMode === "auto" && geoStatus === "detecting") {
    return (
      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
        <span className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
        Detecting location…
      </div>
    );
  }

  if (locationMode === "auto" && geoStatus === "resolved") {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <span className="font-mono text-[10px] text-green-400">{selectedMarket}</span>
        <span className="font-mono text-[10px] text-muted-foreground">GPS</span>
        <button
          onClick={() => onChangeMode("manual")}
          className="font-mono text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Change
        </button>
        <LockBtn />
      </div>
    );
  }

  if (locationMode === "auto" && geoStatus === "denied") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 font-mono text-[10px] text-amber-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Location denied
        </span>
        <MarketDropdown value={selectedMarket} onChange={onChangeMarket} />
        <LockBtn />
      </div>
    );
  }

  if (locationMode === "manual") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[10px] text-muted-foreground">Market:</span>
        <MarketDropdown value={selectedMarket} onChange={onChangeMarket} />
        <button
          onClick={onRetryGps}
          className="font-mono text-[10px] text-accent hover:text-accent/80 transition-colors"
          title="Try GPS"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
        </button>
        <LockBtn />
      </div>
    );
  }

  // disabled
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground border border-border/30 rounded px-2 py-0.5">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Location disabled
      </span>
      <button
        onClick={onRetryGps}
        className="font-mono text-[10px] text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
      >
        Enable
      </button>
    </div>
  );
}

// ── Static tab data ───────────────────────────────────────────────────────────

const predictiveAlerts = [
  { asset: "HVAC AHU-1 (Floor 3-6)", prediction: "Compressor failure within 60 days", confidence: 87, severity: "critical" as const, action: "Schedule replacement", savingsIfPrevented: "$18,400" },
  { asset: "Elevator Bank East — Motor", prediction: "Bearing wear — service needed in 90 days", confidence: 74, severity: "high" as const, action: "Schedule inspection", savingsIfPrevented: "$42,000" },
  { asset: "Boiler System A", prediction: "Heat exchanger efficiency declining", confidence: 68, severity: "medium" as const, action: "Descale & inspect", savingsIfPrevented: "$8,200" },
  { asset: "Parking Level B1 — Lighting", prediction: "Ballast failure cluster (12 fixtures)", confidence: 82, severity: "low" as const, action: "Bulk replacement", savingsIfPrevented: "$2,100" },
  { asset: "Roof Membrane — Section C", prediction: "Leak risk increasing with UV degradation", confidence: 61, severity: "medium" as const, action: "Inspection + patch", savingsIfPrevented: "$14,600" },
];

const managementKpis = [
  { metric: "Ticket Resolution Time", value: "18.4h", target: "24h", score: 92, trend: "improving" as const },
  { metric: "Tenant Satisfaction", value: "4.2/5", target: "4.0/5", score: 88, trend: "stable" as const },
  { metric: "Move-In Velocity", value: "3.2 days", target: "5 days", score: 94, trend: "improving" as const },
  { metric: "Preventative Maintenance %", value: "72%", target: "80%", score: 72, trend: "improving" as const },
  { metric: "Budget Adherence", value: "97.2%", target: "95%", score: 90, trend: "stable" as const },
  { metric: "Vendor SLA Compliance", value: "89%", target: "95%", score: 68, trend: "declining" as const },
  { metric: "Communication Response Time", value: "2.1h", target: "4h", score: 95, trend: "improving" as const },
  { metric: "Amenity Utilization", value: "78%", target: "70%", score: 86, trend: "stable" as const },
];

export default function SmartInsightsTab() {
  const [benchmarkSort, setBenchmarkSort] = useState<"all" | "favorable" | "unfavorable">("all");

  // ── Location state (persisted) ───────────────────────────────────────────
  const [locationMode, setLocationMode] = useState<LocationMode>(() => {
    if (typeof window === "undefined") return "auto";
    return (localStorage.getItem(LS_MODE) as LocationMode) || "auto";
  });
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [selectedMarket, setSelectedMarket] = useState<MarketKey>(() => {
    if (typeof window === "undefined") return "New York, NY";
    return (localStorage.getItem(LS_MARKET) as MarketKey) || "New York, NY";
  });

  const handleChangeMode = useCallback((mode: LocationMode) => {
    setLocationMode(mode);
    localStorage.setItem(LS_MODE, mode);
  }, []);

  const handleChangeMarket = useCallback((market: MarketKey) => {
    setSelectedMarket(market);
    localStorage.setItem(LS_MARKET, market);
    setLocationMode("manual");
    localStorage.setItem(LS_MODE, "manual");
  }, []);

  const handleRetryGps = useCallback(() => {
    handleChangeMode("auto");
    setGeoStatus("idle");
  }, [handleChangeMode]);

  const detectLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("denied");
      handleChangeMode("manual");
      return;
    }
    setGeoStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const market = nearestMarket(pos.coords.latitude, pos.coords.longitude);
        setSelectedMarket(market);
        localStorage.setItem(LS_MARKET, market);
        setGeoStatus("resolved");
      },
      () => {
        setGeoStatus("denied");
        handleChangeMode("manual");
      },
      { timeout: 8000 },
    );
  }, [handleChangeMode]);

  useEffect(() => {
    if (locationMode === "auto" && geoStatus === "idle") detectLocation();
  }, [locationMode, geoStatus, detectLocation]);

  // ── Derived benchmark data ───────────────────────────────────────────────
  const activeMarket = locationMode === "disabled" ? null : selectedMarket;
  const benchmarks   = activeMarket ? buildBenchmarks(activeMarket) : [];

  const filteredBenchmarks = benchmarkSort === "all" ? benchmarks : benchmarks.filter((b) =>
    benchmarkSort === "favorable" ? b.favorable : !b.favorable,
  );

  const overallMgmtScore = Math.round(managementKpis.reduce((sum, k) => sum + k.score, 0) / managementKpis.length);

  const ownRentChart    = OWN_RENTS.map((v, i) => ({ label: UNIT_LABELS[i], value: v, color: "bg-accent/60" }));
  const marketRentChart = activeMarket
    ? MARKET_RENTS[activeMarket].map((v, i) => ({ label: UNIT_LABELS[i], value: v, color: "bg-muted-foreground/30" }))
    : [];

  return (
    <div className="space-y-6">
      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Market Position" value="Top 15%" change={activeMarket ? `vs ${activeMarket}` : "location disabled"} positive={!!activeMarket} color="text-green-500" />
        <KpiCard label="Predictive Alerts" value={String(predictiveAlerts.length)} change="1 Critical" positive={false} color="text-yellow-500" />
        <KpiCard label="Mgmt Performance" value={`${overallMgmtScore}/100`} change="+3 pts QoQ" positive color="text-accent" />
        <KpiCard label="Potential Savings" value="$85,300" change="If preventative" positive color="text-blue-500" />
      </div>

      {/* Market Benchmarking */}
      <SectionCard
        title="Market Benchmarking"
        actions={
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <LocationControl
              locationMode={locationMode}
              geoStatus={geoStatus}
              selectedMarket={selectedMarket}
              onChangeMode={handleChangeMode}
              onChangeMarket={handleChangeMarket}
              onRetryGps={handleRetryGps}
            />
            {activeMarket && (
              <div className="flex items-center gap-1">
                {(["all", "favorable", "unfavorable"] as const).map((f) => (
                  <FilterChip key={f} label={f} active={benchmarkSort === f} onClick={() => setBenchmarkSort(f)} />
                ))}
              </div>
            )}
          </div>
        }
      >
        {/* Location info bar */}
        {activeMarket && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></svg>
            <span className="font-mono text-[10px] text-muted-foreground">
              Comparing against{" "}
              <span className="text-foreground font-medium">{activeMarket}</span>
              {" "}local market averages
            </span>
          </div>
        )}

        {/* Disabled state */}
        {!activeMarket && (
          <div className="py-12 flex flex-col items-center gap-3 text-center">
            <svg className="w-8 h-8 text-muted-foreground/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            <p className="font-mono text-xs text-muted-foreground">Location data disabled</p>
            <p className="font-mono text-[10px] text-muted-foreground/60">Enable location or select a market to view benchmarks</p>
          </div>
        )}

        {/* Benchmark table */}
        {activeMarket && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Metric</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Your Building</th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal truncate max-w-[120px]">
                  {activeMarket} Avg
                </th>
                <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Delta</th>
                <th className="text-center py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Position</th>
              </tr>
            </thead>
            <tbody>
              {filteredBenchmarks.map((b, i) => (
                <tr key={i} className="border-b border-border/10 hover:bg-accent/5 transition-colors">
                  <td className="py-2.5">{b.metric}</td>
                  <td className="py-2.5 text-right font-semibold">{b.yours}</td>
                  <td className="py-2.5 text-right text-muted-foreground">{b.market}</td>
                  <td className={`py-2.5 text-right ${b.favorable ? "text-green-500" : "text-red-500"}`}>{b.delta}</td>
                  <td className="py-2.5 text-center">
                    <StatusIndicator status={b.favorable ? "green" : "red"} label={b.favorable ? "Favorable" : "Unfavorable"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </SectionCard>

      {/* Rent Comparison Chart — only when market is active */}
      {activeMarket && (
      <div className="grid md:grid-cols-2 gap-6">
        <SectionCard title="Your Rents ($/mo)">
          <div className="h-28">
            <SimpleBarChart data={ownRentChart} maxHeight={100} />
          </div>
        </SectionCard>
        <SectionCard title={`${activeMarket} Avg Rents ($/mo)`}>
          <div className="h-28">
            <SimpleBarChart data={marketRentChart} maxHeight={100} />
          </div>
        </SectionCard>
      </div>
      )}

      {/* Predictive Maintenance Alerts */}
      <SectionCard title="Predictive Maintenance Alerts">
        <div className="space-y-2">
          {predictiveAlerts.map((alert, i) => {
            const sevBg =
              alert.severity === "critical" ? "border-red-500/30 bg-red-500/5" :
              alert.severity === "high" ? "border-orange-500/20" :
              "border-border/20";
            return (
              <div key={i} className={`p-4 border rounded-md ${sevBg}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      alert.severity === "critical" ? "bg-red-500 animate-pulse" :
                      alert.severity === "high" ? "bg-orange-500" :
                      alert.severity === "medium" ? "bg-yellow-500" : "bg-gray-400"
                    }`} />
                    <div>
                      <p className="font-mono text-xs font-medium">{alert.asset}</p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">{alert.prediction}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="border-accent/40 text-accent">{alert.action}</Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">Confidence: {alert.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <Badge className={
                      alert.severity === "critical" ? "border-red-500/40 text-red-500" :
                      alert.severity === "high" ? "border-orange-500/40 text-orange-500" :
                      alert.severity === "medium" ? "border-yellow-500/40 text-yellow-500" :
                      "border-border/40 text-muted-foreground"
                    }>
                      {alert.severity}
                    </Badge>
                    <p className="font-mono text-[10px] text-green-500 mt-1">Saves {alert.savingsIfPrevented}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Management Performance Score */}
      <SectionCard title="Management Performance Score">
        <div className="mb-4 text-center p-4 border border-border/20 rounded-lg">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Overall Score</p>
          <p className={`text-5xl font-[var(--font-bebas)] mt-1 ${overallMgmtScore >= 80 ? "text-green-500" : overallMgmtScore >= 60 ? "text-yellow-500" : "text-red-500"}`}>
            {overallMgmtScore}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">/ 100</p>
        </div>
        <div className="space-y-3">
          {managementKpis.map((kpi, i) => (
            <div key={i} className="flex items-center gap-4 p-2 border-b border-border/10 last:border-0">
              <span className="font-mono text-[10px] flex-1 min-w-0 truncate">{kpi.metric}</span>
              <span className="font-mono text-xs font-medium w-16 text-right">{kpi.value}</span>
              <span className="font-mono text-[10px] text-muted-foreground w-14 text-right">T: {kpi.target}</span>
              <div className="w-16">
                <div className="h-2 w-full bg-border/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${kpi.score >= 80 ? "bg-green-500/60" : kpi.score >= 60 ? "bg-yellow-500/60" : "bg-red-500/60"}`}
                    style={{ width: `${kpi.score}%` }}
                  />
                </div>
              </div>
              <StatusIndicator
                status={kpi.trend === "improving" ? "green" : kpi.trend === "stable" ? "yellow" : "red"}
                label={kpi.trend}
              />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
