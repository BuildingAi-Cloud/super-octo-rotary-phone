"use client";
import { User } from "@/lib/auth-context";

export default function SecurityDashboard({ user }: { user: User }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome, Security!</h2>
      <p className="mb-2">This is your dashboard. Here you can monitor building security and incident logs.</p>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>View security alerts and incident reports</li>
        <li>Monitor access logs</li>
        <li>Check shift schedules</li>
        <li>Contact emergency services</li>
      </ul>
    </div>
  );
}
