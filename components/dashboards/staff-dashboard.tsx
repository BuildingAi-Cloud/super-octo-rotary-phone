"use client";
import { User } from "@/lib/auth-context";

export default function StaffDashboard({ user }: { user: User }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome, Staff!</h2>
      <p className="mb-2">This is your dashboard. Here you can view your tasks, schedules, and building notices.</p>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>View assigned maintenance or cleaning tasks</li>
        <li>Check your work schedule</li>
        <li>Access building-wide announcements</li>
        <li>Submit incident reports</li>
      </ul>
    </div>
  );
}
