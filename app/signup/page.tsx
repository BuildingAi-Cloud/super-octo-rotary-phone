"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleText, ScrambleTextOnHover } from "@/components/scramble-text"
import { BitmapChevron } from "@/components/bitmap-chevron"

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  {
    value: "facility_manager",
    label: "Facility Manager",
    description: "Daily operations, maintenance, and building systems",
  },
  {
    value: "building_owner",
    label: "Building Owner",
    description: "Asset oversight, investment tracking, and portfolio management",
  },
  {
    value: "property_manager",
    label: "Property Manager",
    description: "Tenant relations, leasing, and property administration",
  },
  {
    value: "resident",
    label: "Resident",
    description: "Building resident with access to amenities and services",
  },
  {
    value: "tenant",
    label: "Tenant",
    description: "Commercial or residential tenant user",
  },
  {
    value: "concierge",
    label: "Concierge",
    description: "Front desk and guest services",
  },
  {
    value: "staff",
    label: "Staff",
    description: "General building staff and support",
  },
  {
    value: "security",
    label: "Security",
    description: "Security personnel and access control",
  },
  {
    value: "vendor",
    label: "Vendor",
    description: "External service provider or contractor",
  },
  {
    value: "admin",
    label: "Admin",
    description: "System administrator with full access",
  },
  {
    value: "guest",
    label: "Guest",
    description: "Temporary or visitor access user",
  },
]

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState<UserRole | "">("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    
    setError("")
    setIsLoading(true)

    const result = await signUp({
      email,
      password,
      name,
      role,
      company: company || undefined,
    })
    
    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "An error occurred")
    }
    
    setIsLoading(false)
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6">
      <AnimatedNoise opacity={0.03} />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="inline-block mb-8">
            <span className="font-[var(--font-bebas)] text-2xl tracking-wider text-foreground hover:text-accent transition-colors">
              BUILDSYNC
            </span>
          </Link>
          <h1 className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-tight">
            <ScrambleText text={step === 1 ? "SELECT YOUR ROLE" : "CREATE ACCOUNT"} duration={0.8} />
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            {step === 1 
              ? "Choose the role that best describes your responsibilities" 
              : "Complete your account setup to get started"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-accent" : "text-muted-foreground"}`}>
            <span className={`h-2 w-2 ${step >= 1 ? "bg-accent" : "bg-muted"}`} />
            <span className="font-mono text-[10px] uppercase tracking-widest">Role</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-accent" : "text-muted-foreground"}`}>
            <span className={`h-2 w-2 ${step >= 2 ? "bg-accent" : "bg-muted"}`} />
            <span className="font-mono text-[10px] uppercase tracking-widest">Details</span>
          </div>
        </div>

        {step === 1 ? (
          /* Role selection */
          <div className="space-y-4">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRoleSelect(option.value)}
                className="group w-full flex items-start gap-4 border border-border/40 bg-card/30 p-6 text-left transition-all duration-200 hover:border-accent hover:bg-accent/5"
              >
                <span className="mt-1 h-3 w-3 border border-foreground/40 group-hover:border-accent group-hover:bg-accent transition-colors" />
                <div className="flex-1">
                  <h3 className="font-[var(--font-bebas)] text-xl tracking-wide group-hover:text-accent transition-colors">
                    {option.label}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <BitmapChevron className="mt-1 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        ) : (
          /* Account details form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border border-destructive/50 bg-destructive/10 px-4 py-3">
                <p className="font-mono text-xs text-destructive">{error}</p>
              </div>
            )}

            {/* Selected role display */}
            <div className="flex items-center justify-between border border-accent/30 bg-accent/5 px-4 py-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Selected Role</span>
                <p className="font-mono text-sm text-accent">
                  {roleOptions.find(r => r.value === role)?.label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Change
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
                placeholder="John Smith"
              />
            </div>

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
              <label htmlFor="company" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Company Name <span className="text-muted-foreground/50">(Optional)</span>
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
                placeholder="Acme Properties"
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
                minLength={8}
                className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
                placeholder="Min 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full inline-flex items-center justify-center gap-3 bg-accent px-6 py-4 font-mono text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ScrambleTextOnHover text={isLoading ? "Creating Account..." : "Create Account"} as="span" duration={0.5} />
              {!isLoading && <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1" />}
            </button>

            <p className="font-mono text-[10px] text-muted-foreground text-center leading-relaxed">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-accent hover:underline">
              Sign in
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
