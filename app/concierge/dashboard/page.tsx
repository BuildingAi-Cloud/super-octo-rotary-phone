import { ConciergeDashboardNav } from "@/components/concierge-dashboard-nav";

export default function ConciergeDashboardPage() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-12">Concierge Dashboard</h1>
      <ConciergeDashboardNav />
    </main>
  );
}
