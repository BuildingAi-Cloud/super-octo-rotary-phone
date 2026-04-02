"use client"

import { useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

type HomePageWrapperProps = {
  children: ReactNode
}

/**
 * Wrapper for home page that redirects authenticated users to dashboard.
 * Protects pre-login content from being displayed to already-logged-in users.
 */
export function HomePageWrapper({ children }: HomePageWrapperProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Redirect authenticated users to dashboard (pre-login page protection).
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication.
  if (isLoading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <div className="grid-bg fixed inset-0 opacity-30 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10">
          <div className="h-8 w-8 border-2 border-accent border-t-transparent animate-spin" />
        </div>
      </main>
    )
  }

  // Only render the home page if user is not authenticated.
  if (user) {
    return null
  }

  return <>{children}</>
}
