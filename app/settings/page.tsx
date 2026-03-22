"use client"

import { useAuth } from "@/lib/auth-context"
import { LlmSelector } from "@/components/llm-selector"

export default function SettingsPage() {
  const { user } = useAuth()

  // Only allow property_manager, admin, or IT roles to see LLM selector
  if (!user || !["property_manager", "admin", "staff"].includes(user.role)) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="text-muted-foreground">You do not have permission to view these settings.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Local LLM Endpoint</h2>
        <LlmSelector />
      </section>
    </main>
  )
}
