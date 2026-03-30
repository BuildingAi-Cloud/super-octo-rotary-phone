"use client";

export default function GuestDashboard() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome, Guest!</h2>
      <p className="mb-2">This is your dashboard. Here you can view building information and request access.</p>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>View building amenities and announcements</li>
        <li>Request temporary access</li>
        <li>Contact building staff</li>
        <li>See visitor guidelines</li>
      </ul>
    </div>
  );
}
