"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkOrderList } from "@/components/work-order-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const mockWorkOrders = [
  { id: 1, issue: "Leaking pipe", unit: "Unit 101", status: "Open", vendor: "Vendor A" },
  { id: 2, issue: "Broken AC", unit: "Unit 202", status: "Scheduled", vendor: "Vendor B" },
];


export default function WorkOrdersPage() {
  const [orders, setOrders] = useState(mockWorkOrders);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ issue: "", unit: "", status: "Open", vendor: "" });
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.issue || !form.unit || !form.vendor) {
      setError("All fields are required.");
      return;
    }
    setOrders([
      ...orders,
      {
        id: orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1,
        ...form,
      },
    ]);
    setForm({ issue: "", unit: "", status: "Open", vendor: "" });
    setError("");
    setOpen(false);
  };

  const handleDownloadCSV = () => {
    const csv = [
      ["ID", "Issue", "Unit", "Status", "Vendor"],
      ...orders.map(o => [o.id, o.issue, o.unit, o.status, o.vendor]),
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "work-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-6 bg-background rounded-lg shadow-sm p-6">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-semibold">Work Orders</span>
      </nav>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Work Orders</h1>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default">New Work Order</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>New Work Order</DialogTitle>
              <form onSubmit={handleAddWorkOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" htmlFor="issue">Issue</label>
                  <input id="issue" name="issue" value={form.issue} onChange={handleInputChange} className="w-full border p-2 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" htmlFor="unit">Unit</label>
                  <input id="unit" name="unit" value={form.unit} onChange={handleInputChange} className="w-full border p-2 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" htmlFor="status">Status</label>
                  <select id="status" name="status" value={form.status} onChange={handleInputChange} className="w-full border p-2 rounded">
                    <option value="Open">Open</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" htmlFor="vendor">Vendor</label>
                  <input id="vendor" name="vendor" value={form.vendor} onChange={handleInputChange} className="w-full border p-2 rounded" required />
                </div>
                {error && <div className="text-red-500 text-xs">{error}</div>}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="default">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={handleDownloadCSV} variant="outline">Download CSV</Button>
        </div>
      </div>
      <WorkOrderList orders={orders} onNew={() => setOpen(true)} />
    </section>
  );
}
