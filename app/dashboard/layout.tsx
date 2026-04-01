"use client"


import { useAuth } from "@/lib/auth-context"

import { Header } from "../../components/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return <section>{children}</section>;
  }

  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-background p-4 md:p-8 pt-[80px] md:pt-[96px]">
        <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-[100vw] sm:max-w-[95vw] md:max-w-[900px] lg:max-w-[1200px] xl:max-w-[1400px] mx-auto px-2 sm:px-4 md:px-8">
          <section className="mt-6">{children}</section>
        </div>
      </main>
    </>
  );
}
