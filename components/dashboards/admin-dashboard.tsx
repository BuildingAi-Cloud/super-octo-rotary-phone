"use client";
import { User } from "@/lib/auth-context";

export default function AdminDashboard({ user }: { user: User }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome, Admin!</h2>
      <p className="mb-2">This is your dashboard. Here you can manage users, settings, and view audit logs.</p>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>Manage user accounts and roles</li>
        <li>Configure building-wide settings</li>
        <li>View audit logs and reports</li>
        <li>Access all dashboards</li>
      </ul>
    </div>
  );
}
