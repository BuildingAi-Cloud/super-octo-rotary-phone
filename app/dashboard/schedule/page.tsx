import Link from "next/link";
import FacilityManagerSchedule from "@/components/dashboards/facility-manager-schedule";

export default function FacilityManagerSchedulePage() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-semibold">Schedule</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Building Maintenance & Schedule</h1>
      <FacilityManagerSchedule />
      {/* Future features/components can be added here */}
    </main>
  );
}
