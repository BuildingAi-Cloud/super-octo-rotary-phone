"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const mockWorkOrders = [
  { id: 1, issue: "Leaking pipe", unit: "Unit 101", status: "Open", vendor: "Vendor A" },
  { id: 2, issue: "Broken AC", unit: "Unit 202", status: "Scheduled", vendor: "Vendor B" },
];

export default function WorkOrdersPage() {
  const [orders] = useState(mockWorkOrders);

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Work Orders</h1>
        <Button onClick={handleDownloadCSV} variant="outline">Download CSV</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Issue</th>
              <th className="p-2 text-left">Unit</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Vendor</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t">
                <td className="p-2">{order.id}</td>
                <td className="p-2">{order.issue}</td>
                <td className="p-2">{order.unit}</td>
                <td className="p-2">{order.status}</td>
                <td className="p-2">{order.vendor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
