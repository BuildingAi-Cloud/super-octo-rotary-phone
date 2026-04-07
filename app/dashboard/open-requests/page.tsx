"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const mockRequests = [
  { id: 1, issue: "Leaking pipe", unit: "Unit 101", priority: "urgent", status: "Open" },
  { id: 2, issue: "Broken AC", unit: "Unit 202", priority: "high", status: "Scheduled" },
  { id: 3, issue: "Light bulb out", unit: "Unit 303", priority: "normal", status: "Completed" },
];

export default function OpenRequestsPage() {
  const [requests] = useState(mockRequests);

  return (
    <section className="mt-6 bg-background rounded-lg shadow-sm p-6">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-semibold">Open Requests</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">All Open Requests</h1>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Issue</th>
              <th className="p-2 text-left">Unit</th>
              <th className="p-2 text-left">Priority</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="border-t">
                <td className="p-2">{req.id}</td>
                <td className="p-2">{req.issue}</td>
                <td className="p-2">{req.unit}</td>
                <td className="p-2 capitalize">{req.priority}</td>
                <td className="p-2">{req.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
