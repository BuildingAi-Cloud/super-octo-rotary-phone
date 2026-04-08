"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useAuth, type UserRole } from "@/lib/auth-context"

const QUICK_ACTIONS = [
  { label: "Open Full Dashboard", href: "/dashboard" },
  { label: "Notifications", href: "/notifications" },
  { label: "Settings", href: "/settings" },
]

export default function MobileAppPage() {
  const { user, isLoading, signIn, signOut, switchRole, availableRoles } = useAuth()
  const [email, setEmail] = useState("test_all_access@example.com")
  const [password, setPassword] = useState("12345678")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const greeting = useMemo(() => {
    if (!user) return "Welcome to BuildSync Mobile"
    return `Welcome, ${user.name || user.email}`
  }, [user])

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const result = await signIn(email, password)
      if (!result.success) {
        setError(result.error || "Invalid email or password")
      }
    } catch {
      setError("Unable to sign in right now")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="h-10 w-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">Android App</p>
          <h1 className="mt-2 font-[var(--font-bebas)] text-4xl tracking-wide">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">Website-based mobile shell for Android. Use your existing account to continue.</p>

          <form onSubmit={handleSignIn} className="mt-8 rounded-xl border border-border/50 bg-card/60 p-5 space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="you@email.com"
                required
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Password"
                minLength={8}
                required
              />
            </div>

            {error && <p className="font-mono text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-accent px-4 py-3 font-mono text-xs uppercase tracking-widest text-accent-foreground disabled:opacity-60"
            >
              {submitting ? "Signing In..." : "Sign In"}
            </button>

            <p className="font-mono text-[10px] text-muted-foreground">
              Demo login: test_all_access@example.com / 12345678
            </p>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-6">
      <div className="mx-auto w-full max-w-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">BuildSync Mobile</p>
        <h1 className="mt-1 font-[var(--font-bebas)] text-3xl tracking-wide">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">{greeting}</p>

        <section className="mt-5 rounded-xl border border-border/50 bg-card/60 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Active Role</p>
          <p className="mt-1 font-[var(--font-bebas)] text-2xl tracking-wide">{user.role.replaceAll("_", " ")}</p>

          {availableRoles.length > 1 && (
            <div className="mt-3">
              <label className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Switch Role</label>
              <select
                value={user.role}
                onChange={(e) => switchRole(e.target.value as UserRole)}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {availableRoles.map((role) => (
                  <option value={role} key={role}>
                    {role.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        <section className="mt-4 grid grid-cols-1 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-xl border border-border/50 bg-card/40 px-4 py-4 font-mono text-xs uppercase tracking-widest hover:border-accent/60"
            >
              {action.label}
            </Link>
          ))}
        </section>

        <button
          onClick={signOut}
          className="mt-5 w-full rounded-md border border-border px-4 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Sign Out
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Link href="/mobile" className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Home</Link>
          <Link href="/dashboard" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Dashboards</Link>
          <Link href="/settings" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Profile</Link>
        </div>
      </nav>
    </main>
  )
}
