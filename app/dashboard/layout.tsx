import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-context";
import Sidebar from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboards/dashboard-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Replace with your actual auth check logic
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-background p-4 md:p-8">
        <DashboardHeader user={user} />
        <section className="mt-6">{children}</section>
      </main>
    </div>
  );
}
