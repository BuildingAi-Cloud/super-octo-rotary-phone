"use client";

import React, { useState, useMemo } from "react";
import { Badge, FilterBar, FilterChip, SearchInput, Icons, SimpleBarChart } from "./fm-shared";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Invoice {
  id: number;
  vendor: string;
  description: string;
  category: "maintenance" | "utilities" | "janitorial" | "security" | "landscaping" | "capital" | "insurance" | "other";
  amount: number;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "disputed";
  poNumber?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_INVOICES: Invoice[] = [
  { id: 1001, vendor: "CoolTech HVAC", description: "Quarterly HVAC maintenance – Q1 2026", category: "maintenance", amount: 4500, date: "2026-03-31", dueDate: "2026-04-30", status: "pending", poNumber: "PO-2026-0112" },
  { id: 1002, vendor: "City Water Authority", description: "Water service – March 2026", category: "utilities", amount: 2800, date: "2026-04-01", dueDate: "2026-04-20", status: "pending" },
  { id: 1003, vendor: "CleanPro Janitorial", description: "Monthly cleaning service – March", category: "janitorial", amount: 3200, date: "2026-03-01", dueDate: "2026-03-15", status: "paid", poNumber: "PO-2026-0098" },
  { id: 1004, vendor: "ABC Plumbing", description: "Emergency pipe repair – Unit 302", category: "maintenance", amount: 1850, date: "2026-03-15", dueDate: "2026-04-15", status: "paid", poNumber: "PO-2026-0105" },
  { id: 1005, vendor: "SafeGuard Security", description: "Security patrol – March 2026", category: "security", amount: 5600, date: "2026-03-01", dueDate: "2026-03-15", status: "paid", poNumber: "PO-2026-0099" },
  { id: 1006, vendor: "GreenScape Landscaping", description: "Q4 2025 Landscaping (overdue)", category: "landscaping", amount: 3800, date: "2025-12-15", dueDate: "2026-01-15", status: "overdue", poNumber: "PO-2025-0421" },
  { id: 1007, vendor: "SparkWorks Electrical", description: "Panel upgrade – Floors 3-4", category: "capital", amount: 18500, date: "2026-02-20", dueDate: "2026-03-20", status: "disputed", poNumber: "PO-2026-0088" },
  { id: 1008, vendor: "Building Insurance Corp", description: "Property insurance – 2026 annual", category: "insurance", amount: 24000, date: "2026-01-01", dueDate: "2026-01-31", status: "paid", poNumber: "PO-2026-0001" },
];

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-500/10 text-green-500 border-green-500/30",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  overdue: "bg-red-500/10 text-red-500 border-red-500/30",
  disputed: "bg-purple-500/10 text-purple-500 border-purple-500/30",
};

const BUDGET = {
  annual: 280000,
  spent: 0, // calculated
  categories: [
    { label: "Maintenance", budget: 60000 },
    { label: "Utilities", budget: 45000 },
    { label: "Janitorial", budget: 40000 },
    { label: "Security", budget: 70000 },
    { label: "Landscaping", budget: 18000 },
    { label: "Capital", budget: 30000 },
    { label: "Insurance", budget: 25000 },
  ],
};

const CATEGORIES = ["all", "maintenance", "utilities", "janitorial", "security", "landscaping", "capital", "insurance", "other"];

export function AccountingTab() {
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ vendor: "", description: "", category: "maintenance" as string, amount: "", dueDate: "", poNumber: "" });

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (categoryFilter !== "all" && inv.category !== categoryFilter) return false;
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (search && !inv.vendor.toLowerCase().includes(search.toLowerCase()) && !inv.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [invoices, categoryFilter, statusFilter, search]);

  const totalSpent = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const budgetRemaining = BUDGET.annual - totalSpent - totalPending;

  // Spending by category
  const spendingByCategory = CATEGORIES.filter((c) => c !== "all" && c !== "other").map((cat) => {
    const catTotal = invoices.filter((i) => i.category === cat && i.status === "paid").reduce((s, i) => s + i.amount, 0);
    return { label: cat, value: catTotal };
  }).filter((d) => d.value > 0);

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendor.trim() || !form.amount) return;
    const newInvoice: Invoice = {
      id: invoices.length ? Math.max(...invoices.map((i) => i.id)) + 1 : 1001,
      vendor: form.vendor.trim(),
      description: form.description.trim(),
      category: form.category as Invoice["category"],
      amount: parseFloat(form.amount),
      date: new Date().toISOString().slice(0, 10),
      dueDate: form.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: "pending",
      poNumber: form.poNumber.trim() || undefined,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    setForm({ vendor: "", description: "", category: "maintenance", amount: "", dueDate: "", poNumber: "" });
    setDialogOpen(false);
  };

  const handleStatusChange = (id: number, newStatus: Invoice["status"]) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
  };

  const handleExportCSV = () => {
    const csv = [
      ["ID", "Vendor", "Description", "Category", "Amount", "Date", "Due Date", "Status", "PO Number"],
      ...filtered.map((i) => [i.id, i.vendor, i.description, i.category, i.amount, i.date, i.dueDate, i.status, i.poNumber ?? ""]),
    ].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "invoices.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Budget Summary */}
      <div className="flex flex-wrap gap-3 mb-2">
        <div className="border border-border/30 rounded-lg px-4 py-2 bg-card/30">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Annual Budget</span>
          <span className="ml-2 font-mono text-sm font-bold">${(BUDGET.annual / 1000).toFixed(0)}k</span>
        </div>
        <div className="border border-green-500/30 rounded-lg px-4 py-2 bg-green-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Paid (YTD)</span>
          <span className="ml-2 font-mono text-sm font-bold text-green-500">${(totalSpent / 1000).toFixed(1)}k</span>
        </div>
        <div className="border border-yellow-500/30 rounded-lg px-4 py-2 bg-yellow-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Pending</span>
          <span className="ml-2 font-mono text-sm font-bold text-yellow-600">${(totalPending / 1000).toFixed(1)}k</span>
        </div>
        <div className="border border-red-500/30 rounded-lg px-4 py-2 bg-red-500/5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Overdue</span>
          <span className="ml-2 font-mono text-sm font-bold text-red-500">${(totalOverdue / 1000).toFixed(1)}k</span>
        </div>
        <div className={`border rounded-lg px-4 py-2 ${budgetRemaining > 0 ? "border-blue-500/30 bg-blue-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Budget Remaining</span>
          <span className={`ml-2 font-mono text-sm font-bold ${budgetRemaining > 0 ? "text-blue-500" : "text-red-500"}`}>${(budgetRemaining / 1000).toFixed(1)}k</span>
        </div>
      </div>

      {spendingByCategory.length > 0 && (
        <div className="border border-border/20 rounded-lg p-4 bg-card/20">
          <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Paid Spend by Category</h4>
          <SimpleBarChart data={spendingByCategory} maxValue={Math.max(...spendingByCategory.map((d) => d.value))} formatValue={(v) => `$${(v / 1000).toFixed(1)}k`} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoices..." />
        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-1 text-xs">{Icons.plus} Add Invoice</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogTitle>Add Invoice</DialogTitle>
              <form onSubmit={handleAddInvoice} className="space-y-3 mt-2">
                <div>
                  <label htmlFor="inv-vendor" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Vendor</label>
                  <input id="inv-vendor" value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                </div>
                <div>
                  <label htmlFor="inv-desc" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Description</label>
                  <input id="inv-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="inv-cat" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Category</label>
                    <select id="inv-cat" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none">
                      {CATEGORIES.filter((c) => c !== "all").map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="inv-amt" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Amount ($)</label>
                    <input id="inv-amt" type="number" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="inv-due" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">Due Date</label>
                    <input id="inv-due" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="inv-po" className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-muted-foreground">PO Number</label>
                    <input id="inv-po" value={form.poNumber} onChange={(e) => setForm((f) => ({ ...f, poNumber: e.target.value }))} className="w-full border border-border/40 p-2 rounded-md text-sm bg-background focus:ring-2 focus:ring-accent/50 focus:outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Invoice</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-1 text-xs" onClick={handleExportCSV}>{Icons.download} CSV</Button>
        </div>
      </div>

      <FilterBar>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} label={c === "all" ? "All Categories" : c.replace(/_/g, " ")} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
        ))}
      </FilterBar>
      <div className="flex flex-wrap items-center gap-2">
        {["all", "paid", "pending", "overdue", "disputed"].map((s) => (
          <FilterChip key={s} label={s === "all" ? "All Status" : s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty><p className="font-mono text-sm text-muted-foreground">No invoices match your filters.</p></Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Invoice</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">Vendor</th>
                <th className="text-right py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Amount</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Due</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Status</th>
                <th className="text-left py-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-border/10 hover:bg-card/50 transition-colors">
                  <td className="py-2.5 px-2">
                    <span className="text-foreground font-medium">{inv.description}</span>
                    <span className="block text-[10px] text-muted-foreground capitalize">{inv.category.replace(/_/g, " ")}{inv.poNumber ? ` • ${inv.poNumber}` : ""}</span>
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{inv.vendor}</td>
                  <td className="py-2.5 px-2 text-right font-medium">${inv.amount.toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-muted-foreground hidden md:table-cell">{inv.dueDate}</td>
                  <td className="py-2.5 px-2"><Badge className={STATUS_COLORS[inv.status]}>{inv.status}</Badge></td>
                  <td className="py-2.5 px-2">
                    <select
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value as Invoice["status"])}
                      className="text-[10px] font-mono bg-background border border-border/40 rounded px-1.5 py-1 focus:ring-2 focus:ring-accent/50 focus:outline-none w-full"
                      aria-label={`Status for invoice ${inv.id}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="disputed">Disputed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-muted-foreground font-mono text-[10px] text-right">{filtered.length} of {invoices.length} invoices • Total: ${filtered.reduce((s, i) => s + i.amount, 0).toLocaleString()}</div>
    </div>
  );
}
