"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleText, ScrambleTextOnHover } from "@/components/scramble-text"
import { BitmapChevron } from "@/components/bitmap-chevron"

const demoUsers = [
  { 
    role: "facility_manager" as UserRole, 
    label: "Facility Manager", 
    email: "demo.facility@buildsync.com",
    description: "Maintenance, IoT sensors, work orders"
  },
  { 
    role: "building_owner" as UserRole, 
    label: "Building Owner", 
    email: "demo.owner@buildsync.com",
    description: "Governance, e-voting, portfolio overview"
  },
  { 
    role: "property_manager" as UserRole, 
    label: "Property Manager", 
    email: "demo.property@buildsync.com",
    description: "Concierge, packages, visitor management"
  },
  { 
    role: "resident" as UserRole, 
    label: "Resident", 
    email: "demo.resident@buildsync.com",
    description: "Amenities, maintenance requests, community"
  },
  { 
    role: "tenant" as UserRole, 
    label: "Tenant", 
    email: "demo.tenant@buildsync.com",
    description: "Lease, payments, service requests"
  },
]

export default function SignInPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await signIn(email, password)
    
    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "An error occurred")
    }
    
    setIsLoading(false)
  }

  const handleDemoLogin = async (role: UserRole, email: string, label: string) => {
    setDemoLoading(role)
    setError("")

    // First try to sign in, if that fails, create the demo account
    const signInResult = await signIn(email, "demo123")
    
    if (signInResult.success) {
      router.push("/dashboard")
    } else {
      // Create demo user if doesn't exist
      const signUpResult = await signUp({
        email,
        password: "demo123",
        name: `Demo ${label}`,
        role,
        company: "BuildSync Demo",
      })

      if (signUpResult.success) {
        router.push("/dashboard")
      } else {
        setError(signUpResult.error || "Failed to create demo account")
      }
    }
    
    setDemoLoading(null)
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6">
      <AnimatedNoise opacity={0.03} />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="inline-block mb-8">
            <span className="font-[var(--font-bebas)] text-2xl tracking-wider text-foreground hover:text-accent transition-colors">
              BUILDSYNC
            </span>
          </Link>
          <h1 className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-tight">
            <ScrambleText text="WELCOME BACK" duration={0.8} />
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            Sign in to access your facility management dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="border border-destructive/50 bg-destructive/10 px-4 py-3">
              <p className="font-mono text-xs text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group w-full inline-flex items-center justify-center gap-3 bg-accent px-6 py-4 font-mono text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ScrambleTextOnHover text={isLoading ? "Signing In..." : "Sign In"} as="span" duration={0.5} />
            {!isLoading && <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1" />}
          </button>
        </form>

        {/* Demo Login Section */}
        <div className="mt-10 pt-8 border-t border-border/40">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
            Or try a demo account
          </p>
          <div className="space-y-3">
            {demoUsers.map((demo) => (
              <button
                key={demo.role}
                onClick={() => handleDemoLogin(demo.role, demo.email, demo.label)}
                disabled={demoLoading !== null}
                className="w-full flex items-center justify-between border border-border/60 bg-card/30 px-4 py-3 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="text-left">
                  <p className="font-mono text-xs text-foreground group-hover:text-accent transition-colors">
                    {demoLoading === demo.role ? "Loading..." : demo.label}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">{demo.description}</p>
                </div>
                <BitmapChevron className="text-muted-foreground group-hover:text-accent transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="text-accent hover:underline">
              Create one
            </Link>
          </p>
        </div>

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <BitmapChevron className="rotate-180" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
