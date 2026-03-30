"use client";

export default function VendorDashboard() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome, Vendor!</h2>
      <p className="mb-2">This is your dashboard. Here you can manage service requests and appointments.</p>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>View and accept service requests</li>
        <li>Manage appointments with building staff</li>
        <li>Submit invoices</li>
        <li>Access building entry instructions</li>
      </ul>
    </div>
  );
}
