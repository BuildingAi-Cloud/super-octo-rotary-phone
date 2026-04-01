"use client"

import { useAuth } from "@/lib/auth-context"
import { AccessibilityToggle } from "@/components/accessibility-toggle"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) {
    return <section>{children}</section>
  }

  return (
    <main className="relative min-h-screen bg-background p-4 md:p-8">
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />
      {/* Top right: Accessibility & AI Chat */}
      <div className="fixed top-4 right-6 z-50 flex gap-3">
        <AccessibilityToggle />
        <Link
          href="/ai-chat"
          className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200 bg-background/80 backdrop-blur-sm rounded"
          aria-label="Open AI Chat"
          title="Try AI Chat — runs locally in your browser"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
          </svg>
          <span className="hidden sm:inline">AI Chat</span>
        </Link>
      </div>
      <div className="relative z-10 max-w-[1400px] w-full mx-auto">
        <section className="mt-6">{children}</section>
      </div>
    </main>
  )
}
