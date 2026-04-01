"use client"

import { useAuth } from "@/lib/auth-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) {
    return <section>{children}</section>
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1400px] w-full mx-auto">
        <section className="mt-6">{children}</section>
      </div>
    </main>
  )
}
