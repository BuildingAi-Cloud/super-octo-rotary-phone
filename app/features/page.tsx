"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function FeaturesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // Redirect authenticated users to dashboard (pre-login page protection).
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent animate-spin" />
      </main>
    )
  }

  if (user) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Feature Comparison</h1>
      <p className="text-muted-foreground mb-8">A detailed comparison of all features will be available soon.</p>
      <ul className="list-disc pl-6 text-left">
        <li>Property management tools</li>
        <li>Resident & tenant portals</li>
        <li>Maintenance tracking</li>
        <li>Compliance & security</li>
        <li>Integrations and more...</li>
      </ul>
    </main>
  );
}
