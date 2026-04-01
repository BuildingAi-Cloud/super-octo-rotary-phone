"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, Icons } from "./fm-shared";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Document {
  id: number;
  name: string;
  category: "blueprint" | "contract" | "maintenance_log" | "inspection" | "policy" | "insurance" | "permit" | "warranty";
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  version: number;
  tags: string[];
  expiryDate?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_DOCUMENTS: Document[] = [
  { id: 1, name: "Building A – As-Built Floor Plans", category: "blueprint", uploadedBy: "Admin", uploadedAt: "2025-01-15", size: "24.5 MB", version: 3, tags: ["building-a", "floor-plan", "as-built"] },
  { id: 2, name: "HVAC Maintenance Agreement – CoolTech", category: "contract", uploadedBy: "FM Manager", uploadedAt: "2025-03-20", size: "1.2 MB", version: 1, tags: ["hvac", "vendor", "contract"], expiryDate: "2027-03-20" },
  { id: 3, name: "Fire System Inspection Report – Q1 2026", category: "inspection", uploadedBy: "SafetyFirst Inspections", uploadedAt: "2026-01-18", size: "3.8 MB", version: 1, tags: ["fire", "inspection", "q1-2026"] },
  { id: 4, name: "Building Insurance Policy", category: "insurance", uploadedBy: "Admin", uploadedAt: "2025-06-01", size: "5.1 MB", version: 2, tags: ["insurance", "property"], expiryDate: "2026-06-01" },
  { id: 5, name: "Emergency Evacuation Procedure", category: "policy", uploadedBy: "Safety Officer", uploadedAt: "2025-09-10", size: "890 KB", version: 4, tags: ["emergency", "evacuation", "safety"] },
  { id: 6, name: "Elevator Permit – Elev A & B", category: "permit", uploadedBy: "Admin", uploadedAt: "2025-12-10", size: "420 KB", version: 1, tags: ["elevator", "permit"], expiryDate: "2026-06-10" },
  { id: 7, name: "Generator Warranty Certificate", category: "warranty", uploadedBy: "FM Manager", uploadedAt: "2023-09-01", size: "310 KB", version: 1, tags: ["generator", "warranty"], expiryDate: "2028-09-01" },
  { id: 8, name: "Monthly Maintenance Log – Mar 2026", category: "maintenance_log", uploadedBy: "Maintenance Lead", uploadedAt: "2026-04-01", size: "1.7 MB", version: 1, tags: ["maintenance", "monthly", "march-2026"] },
];

const CATEGORY_ICONS: Record<string, string> = {
  blueprint: "📐",
  contract: "📄",
  maintenance_log: "🔧",
  inspection: "🔍",
  policy: "📋",
  insurance: "🛡️",
  permit: "📜",
  warranty: "✅",
};

const CATEGORIES = ["all", "blueprint", "contract", "maintenance_log", "inspection", "policy", "insurance", "permit", "warranty"];

export function DocumentsTab() {
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "policy" as string, tags: "", expiryDate: "" });

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!d.name.toLowerCase().includes(q) && !d.tags.some((t) => t.includes(q)) && !d.category.includes(q)) return false;
      }
      return true;
    });
  }, [documents, categoryFilter, search]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const newDoc: Document = {
      id: documents.length ? Math.max(...documents.map((d) => d.id)) + 1 : 1,
      name: form.name.trim(),
      category: form.category as Document["category"],
      uploadedBy: "Facility Manager",
      uploadedAt: new Date().toISOString().slice(0, 10),
      size: "—",
      version: 1,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      expiryDate: form.expiryDate || undefined,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setForm({ name: "", category: "policy", tags: "", expiryDate: "" });
    setDialogOpen(false);
  };

  const expiringDocs = documents.filter((d) => {
    if (!d.expiryDate) return false;
    const diff = new Date(d.expiryDate).getTime() - Date.now();
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="border border-border/30 rounded-lg px-4 py-2 bg-card/30">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Total Documents</span>
          <span className="ml-2 font-mono text-sm font-bold">{documents.length}</span>
        </div>
        {expiringDocs.length > 0 && (
          <div className="border border-yellow-500/30 rounded-lg px-4 py-2 bg-yellow-500/5">
            <span className="font-mono text-[10px] text-muted-foreground uppercase">Expiring (90d)</span>
            <span className="ml-2 font-mono text-sm font-bold text-yellow-600">{expiringDocs.length}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search documents or tags..." />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-1 text-xs">{Icons.plus} Upload Document</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogTitle>Upload Document</DialogTitle>
            <form onSubmit={handleUpload} className="space-y-3 mt-2">
              <div>
                <label htmlFor="doc-name" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Document Name</label>
                <input id="doc-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
              </div>
              <div>
                <label htmlFor="doc-cat" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Category</label>
                <select id="doc-cat" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none">
                  {CATEGORIES.filter((c) => c !== "all").map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="doc-tags" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Tags (comma-separated)</label>
                <input id="doc-tags" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" placeholder="e.g. hvac, vendor, annual" />
              </div>
              <div>
                <label htmlFor="doc-exp" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Expiry Date (optional)</label>
                <input id="doc-exp" type="date" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Upload</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} label={c === "all" ? "All Categories" : `${CATEGORY_ICONS[c] ?? ""} ${c.replace(/_/g, " ")}`} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
        ))}
      </FilterBar>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No documents match your search.</p></Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Document</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">Category</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Uploaded</th>
                <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Size</th>
                <th className="text-center py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Ver</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const isExpiring = doc.expiryDate && new Date(doc.expiryDate).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000 && new Date(doc.expiryDate) > new Date();
                const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                return (
                  <tr key={doc.id} className="border-b border-border/10 hover:bg-card/50 transition-colors">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <span>{CATEGORY_ICONS[doc.category] ?? "📄"}</span>
                        <div>
                          <span className="text-foreground font-medium">{doc.name}</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {doc.tags.map((t) => (
                              <span key={t} className="text-[9px] bg-muted/20 text-muted-foreground px-1.5 py-0.5 rounded border border-border/10">{t}</span>
                            ))}
                          </div>
                          {isExpiring && <span className="text-[9px] text-yellow-600">⚠ Expires {doc.expiryDate}</span>}
                          {isExpired && <span className="text-[9px] text-red-500">✗ Expired {doc.expiryDate}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-muted-foreground capitalize hidden sm:table-cell">{doc.category.replace(/_/g, " ")}</td>
                    <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">
                      <span>{doc.uploadedAt}</span>
                      <span className="block text-[9px]">{doc.uploadedBy}</span>
                    </td>
                    <td className="py-2.5 px-2 text-muted-foreground text-right">{doc.size}</td>
                    <td className="py-2.5 px-2 text-center"><Badge className="bg-muted/20 text-muted-foreground border-border/20">v{doc.version}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {documents.length} documents</div>
    </div>
  );
}
