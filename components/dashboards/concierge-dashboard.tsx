"use client";
import { User } from "@/lib/auth-context";

export default function ConciergeDashboard({ user }: { user: User }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome, Concierge!</h2>
      <p className="mb-2">This is your dashboard. Here you can manage guest check-ins, deliveries, and resident requests.</p>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>View and process package deliveries</li>
        <li>Assist residents and guests</li>
        <li>Log visitor entries</li>
        <li>Access building announcements</li>
      </ul>
    </div>
  );
}
