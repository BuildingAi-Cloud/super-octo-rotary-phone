"use client";

import React, { useState } from "react";
import { Icons, Badge, FilterBar, FilterChip, SearchInput, SectionCard, EmptyState } from "./bm-shared";

type DocFilter = "all" | "lease" | "bylaw" | "floor-plan" | "minutes" | "insurance" | "other";

interface Document {
  id: string;
  name: string;
  category: DocFilter;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  sharedWith: string[];
  expiresAt: string | null;
  version: number;
}

const DOCUMENTS: Document[] = [
  { id: "DOC-001", name: "Master Lease Agreement — Unit 14B", category: "lease", uploadedBy: "Building Manager", uploadedAt: "2024-06-15", fileSize: "2.4 MB", sharedWith: ["Sarah Chen"], expiresAt: "2025-06-15", version: 1 },
  { id: "DOC-002", name: "Building Bylaws v4.2", category: "bylaw", uploadedBy: "Admin", uploadedAt: "2024-01-10", fileSize: "850 KB", sharedWith: ["All Residents"], expiresAt: null, version: 4 },
  { id: "DOC-003", name: "Floor Plan — Level 14", category: "floor-plan", uploadedBy: "Building Manager", uploadedAt: "2023-09-01", fileSize: "5.1 MB", sharedWith: ["Maintenance", "Management"], expiresAt: null, version: 2 },
  { id: "DOC-004", name: "Board Minutes — December 2024", category: "minutes", uploadedBy: "Admin", uploadedAt: "2024-12-20", fileSize: "320 KB", sharedWith: ["Board Members", "Management"], expiresAt: null, version: 1 },
  { id: "DOC-005", name: "Building Insurance Policy 2025", category: "insurance", uploadedBy: "Building Owner", uploadedAt: "2025-01-02", fileSize: "1.8 MB", sharedWith: ["Management"], expiresAt: "2026-01-02", version: 1 },
  { id: "DOC-006", name: "Emergency Evacuation Plan", category: "other", uploadedBy: "Security", uploadedAt: "2024-06-01", fileSize: "4.2 MB", sharedWith: ["All Staff", "All Residents"], expiresAt: null, version: 3 },
  { id: "DOC-007", name: "Lease Agreement — Unit 8A", category: "lease", uploadedBy: "Building Manager", uploadedAt: "2024-03-10", fileSize: "2.1 MB", sharedWith: ["Marcus Johnson"], expiresAt: "2025-03-10", version: 1 },
  { id: "DOC-008", name: "Parking Rules & Regulations", category: "bylaw", uploadedBy: "Admin", uploadedAt: "2024-04-15", fileSize: "150 KB", sharedWith: ["All Residents"], expiresAt: null, version: 2 },
  { id: "DOC-009", name: "Board Minutes — November 2024", category: "minutes", uploadedBy: "Admin", uploadedAt: "2024-11-22", fileSize: "280 KB", sharedWith: ["Board Members", "Management"], expiresAt: null, version: 1 },
  { id: "DOC-010", name: "Floor Plan — Lobby & Amenities", category: "floor-plan", uploadedBy: "Building Manager", uploadedAt: "2023-09-01", fileSize: "6.3 MB", sharedWith: ["All Staff"], expiresAt: null, version: 1 },
];

export default function DocumentsTab() {
  const [filter, setFilter] = useState<DocFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = DOCUMENTS.filter((d) => {
    if (filter !== "all" && d.category !== filter) return false;
    return d.name.toLowerCase().includes(search.toLowerCase()) || d.uploadedBy.toLowerCase().includes(search.toLowerCase());
  });

  const categoryCount = (cat: DocFilter) => DOCUMENTS.filter((d) => d.category === cat).length;

  return (
    <div className="space-y-6">
      {/* Category overview */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {(["lease", "bylaw", "floor-plan", "minutes", "insurance", "other"] as DocFilter[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(filter === cat ? "all" : cat)}
            className={`border rounded-lg p-3 text-center transition-colors ${filter === cat ? "border-accent bg-accent/10" : "border-border/40 bg-card/30 hover:border-accent/40"}`}
          >
            <p className="text-lg font-[var(--font-bebas)] tracking-wide">{categoryCount(cat)}</p>
            <p className="text-[9px] font-mono uppercase text-muted-foreground">{cat === "floor-plan" ? "Plans" : cat}</p>
          </button>
        ))}
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search documents..." />
      </FilterBar>

      <SectionCard
        title="Document Vault"
        actions={
          <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-accent/40 text-accent hover:bg-accent/10 rounded-md transition-colors">
            {Icons.upload} Upload
          </button>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState message="No documents found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border/20 text-muted-foreground uppercase tracking-wider">
                  <th className="text-left py-2 px-2">Document</th>
                  <th className="text-left py-2 px-2">Category</th>
                  <th className="text-left py-2 px-2">Uploaded By</th>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Size</th>
                  <th className="text-left py-2 px-2">Shared With</th>
                  <th className="text-left py-2 px-2">Expires</th>
                  <th className="text-left py-2 px-2">Ver</th>
                  <th className="text-left py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-border/10 hover:bg-card/50 transition-colors">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{Icons.fileText}</span>
                        <span className="truncate max-w-[200px]">{d.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <Badge className="border-border/40 text-muted-foreground">{d.category}</Badge>
                    </td>
                    <td className="py-2.5 px-2 text-muted-foreground">{d.uploadedBy}</td>
                    <td className="py-2.5 px-2 text-muted-foreground">{d.uploadedAt}</td>
                    <td className="py-2.5 px-2 text-muted-foreground">{d.fileSize}</td>
                    <td className="py-2.5 px-2">
                      <span className="text-[10px] text-muted-foreground">{d.sharedWith.join(", ")}</span>
                    </td>
                    <td className="py-2.5 px-2">
                      {d.expiresAt ? (
                        <span className={new Date(d.expiresAt) < new Date("2025-03-01") ? "text-yellow-500" : "text-muted-foreground"}>
                          {d.expiresAt}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">v{d.version}</td>
                    <td className="py-2.5 px-2">
                      <button type="button" className="text-accent hover:text-accent/70 transition-colors">{Icons.download}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
