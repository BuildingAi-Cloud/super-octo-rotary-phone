
"use client";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { AnimatedNoise } from "@/components/animated-noise";
import { ScrambleText, ScrambleTextOnHover } from "@/components/scramble-text";
import { BitmapChevron } from "@/components/bitmap-chevron";
import { PHASE_ONE_ESSENTIAL_ONLY, resolveStarterPlan, type StarterPlan } from "@/lib/rollout";
import {
  DEFAULT_ESSENTIAL_COST_ASSUMPTIONS,
  ESSENTIAL_COST_ASSUMPTIONS_STORAGE_KEY,
  formatCurrency,
  getEssentialQuote,
  sanitizeEssentialCostAssumptions,
  type EssentialCostAssumptions,
  type EssentialCustomerType,
  type EssentialPlanProfile,
} from "@/lib/essential-pricing";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleOptions: { value: EssentialCustomerType; label: string; description: string; pricing: string }[] = [
  {
    value: "building_owner",
    label: "Building Owner",
    description: "Commercial building operators managing tenancy and cloud workspace identity",
    pricing: "Essential pricing is based on number of buildings",
  },
  {
    value: "building_manager",
    label: "Building Manager",
    description: "Residential and commercial day-to-day operations with configurable feature bundles",
    pricing: "Essential pricing is based on enabled features",
  },
  {
    value: "facility_manager",
    label: "Facility Manager",
    description: "Specific use case teams handling operations subscriptions across managed sites",
    pricing: "Essential pricing is based on active sites",
  },
];

const managerFeatureOptions = [
  { id: "ops", label: "Work order automation" },
  { id: "tenant", label: "Resident and tenant communications" },
  { id: "compliance", label: "Compliance workflows" },
  { id: "finance", label: "Vendor and billing controls" },
]

const PLAN_COPY: Record<StarterPlan, { label: string; price: string; tagline: string }> = {
  essential: {
    label: "Essential",
    price: "$2.50 /unit/month",
    tagline: "Final quote is configured by your buildings, features, and operations setup.",
  },
  professional: {
    label: "Professional",
    price: "$4.50 /unit/month",
    tagline: "Best for property managers and larger portfolios.",
  },
}

function parseStarterPlan(value: string | null): StarterPlan {
  return resolveStarterPlan(value)
}

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, user, isLoading: authLoading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<StarterPlan>("essential")
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<EssentialCustomerType | "">("");
  const [tenancyName, setTenancyName] = useState("")
  const [buildingCount, setBuildingCount] = useState(1)
  const [siteCount, setSiteCount] = useState(1)
  const [estimatedUnits, setEstimatedUnits] = useState(50)
  const [selectedManagerFeatures, setSelectedManagerFeatures] = useState<string[]>(["ops", "tenant"])
  const [costAssumptions, setCostAssumptions] = useState<EssentialCostAssumptions>(DEFAULT_ESSENTIAL_COST_ASSUMPTIONS)
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [humanA, setHumanA] = useState(0)
  const [humanB, setHumanB] = useState(0)
  const [humanAnswer, setHumanAnswer] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function generateHumanChallenge() {
    const a = Math.floor(Math.random() * 8) + 2
    const b = Math.floor(Math.random() * 8) + 2
    setHumanA(a)
    setHumanB(b)
    setHumanAnswer("")
  }

  // Redirect authenticated users to dashboard (pre-login page protection).
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const planFromQuery = parseStarterPlan(searchParams.get("plan"))
    setSelectedPlan(planFromQuery)
  }, [searchParams])

  useEffect(() => {
    localStorage.setItem(
      "buildsync_signup_plan",
      JSON.stringify({ plan: selectedPlan, capturedAt: new Date().toISOString() })
    )
  }, [selectedPlan])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ESSENTIAL_COST_ASSUMPTIONS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<EssentialCostAssumptions>
      setCostAssumptions(sanitizeEssentialCostAssumptions(parsed))
    } catch {
      setCostAssumptions(DEFAULT_ESSENTIAL_COST_ASSUMPTIONS)
    }
  }, [])

  const pricingProfile = useMemo<EssentialPlanProfile | null>(() => {
    if (!role) return null

    return {
      customerType: role,
      tenancyName: role === "building_owner" ? tenancyName.trim() : undefined,
      buildingCount: role === "building_owner" ? buildingCount : undefined,
      selectedFeatures: role === "building_manager" ? selectedManagerFeatures : undefined,
      siteCount: role === "facility_manager" ? siteCount : undefined,
      estimatedUnits,
    }
  }, [role, tenancyName, buildingCount, selectedManagerFeatures, siteCount, estimatedUnits])

  const liveQuote = useMemo(() => {
    if (!pricingProfile) return null
    return getEssentialQuote(pricingProfile, costAssumptions)
  }, [pricingProfile, costAssumptions])

  useEffect(() => {
    if (!pricingProfile || !liveQuote) return

    localStorage.setItem(
      "buildsync_signup_profile",
      JSON.stringify({
        ...pricingProfile,
        quote: liveQuote,
        capturedAt: new Date().toISOString(),
      })
    )
  }, [pricingProfile, liveQuote])

  useEffect(() => {
    generateHumanChallenge()
  }, [])

  const handleRoleSelect = (selectedRole: EssentialCustomerType) => {
    setRole(selectedRole);
    if (selectedRole === "building_owner") {
      setBuildingCount(1)
    }
    if (selectedRole === "building_manager") {
      setSelectedManagerFeatures(["ops", "tenant"])
    }
    if (selectedRole === "facility_manager") {
      setSiteCount(1)
    }
    setStep(2);
  };

  const toggleManagerFeature = (featureId: string) => {
    setSelectedManagerFeatures((prev) => {
      if (prev.includes(featureId)) {
        if (prev.length === 1) return prev
        return prev.filter((id) => id !== featureId)
      }

      return [...prev, featureId]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setError("");

    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = "Name is required."
    if (!email.trim()) {
      nextErrors.email = "Email is required."
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Enter a valid email address."
    }
    if (!password.trim()) {
      nextErrors.password = "Password is required."
    } else if (password.trim().length < 8) {
      nextErrors.password = "Password must be at least 8 characters."
    }
    if (role === "building_owner" && !tenancyName.trim()) {
      nextErrors.tenancyName = "Tenancy cloud name is required for Building Owner accounts."
    }
    if (!humanAnswer.trim()) {
      nextErrors.humanCheck = "Please answer the human check question."
    }

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted fields and try again.")
      return
    }

    if (!pricingProfile || !liveQuote) {
      setError("Please complete customer setup details before continuing.")
      return
    }

    const parsed = Number.parseInt(humanAnswer, 10)
    if (!Number.isFinite(parsed) || parsed !== humanA + humanB) {
      setFieldErrors((prev) => ({ ...prev, humanCheck: "Human check answer is incorrect." }))
      setError("Human verification failed. Please solve the check and try again.")
      generateHumanChallenge()
      return
    }

    setIsLoading(true);
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      // Timeout fallback: reset loading after 10 seconds
      timeoutId = setTimeout(() => {
        setIsLoading(false);
        setError("Request timed out. Please try again.");
      }, 10000);
      const result = await signUp({
        email,
        password,
        name,
        role: role as UserRole,
        company: company || undefined,
        essentialProfile: pricingProfile,
      });
      if (timeoutId) clearTimeout(timeoutId);
      if (result.success) {
        setStep(3);
      } else {
        setError(result.error || "An error occurred");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

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
                  <ScrambleText text={step === 1 ? "SELECT CUSTOMER TYPE" : step === 2 ? "CREATE ACCOUNT" : "COMPLETE CHECKOUT"} duration={0.8} />
                </h1>
                <p className="mt-4 font-mono text-sm text-muted-foreground">
                  {step === 1 
                    ? "Choose the account type for Essential Plan 1" 
                    : step === 2
                      ? "Complete account and pricing setup in real time"
                      : "Review your quote and continue to checkout."}
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
                <div className="h-px w-8 bg-border" />
                <div className={`flex items-center gap-2 ${step === 3 ? "text-accent" : "text-muted-foreground"}`}>
                  <span className={`h-2 w-2 ${step === 3 ? "bg-accent" : "bg-muted"}`} />
                  <span className="font-mono text-[10px] uppercase tracking-widest">Payment</span>
                </div>
              </div>

              <div className="mb-8 border border-accent/30 bg-accent/5 p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Selected Plan</p>
                    <h2 className="mt-1 font-[var(--font-bebas)] text-2xl tracking-wide">
                      {PLAN_COPY[selectedPlan].label}
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      {PLAN_COPY[selectedPlan].price} • {PLAN_COPY[selectedPlan].tagline}
                    </p>
                  </div>
                  {PHASE_ONE_ESSENTIAL_ONLY ? (
                    <div className="px-3 py-2 border border-border/50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Phase 1 rollout: Essential only
                    </div>
                  ) : (
                    <div className="inline-flex items-center border border-border/50">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan("essential")}
                        className={`px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                          selectedPlan === "essential" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Essential
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPlan("professional")}
                        className={`px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                          selectedPlan === "professional" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Professional
                      </button>
                    </div>
                  )}
                </div>
                {liveQuote && (
                  <div className="mt-4 border border-border/50 bg-background/40 p-3 md:p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Live Signup Quote</p>
                    <div className="mt-2 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{liveQuote.pricingModel}</p>
                        <p className="font-mono text-xs text-foreground/80">{liveQuote.metricLabel}: {liveQuote.quantity} ({liveQuote.detail})</p>
                        <p className="font-mono text-xs text-foreground/80">
                          Approx per-unit estimate: {formatCurrency(liveQuote.monthly / Math.max(1, estimatedUnits))} /unit/month
                        </p>
                      </div>
                      <p className="font-[var(--font-bebas)] text-2xl tracking-wide text-accent">{formatCurrency(liveQuote.monthly)} monthly total</p>
                    </div>
                  </div>
                )}
              </div>

              {step === 1 && (
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
                        <p className="font-mono text-xs text-muted-foreground mb-1">{option.description}</p>
                        <span className="font-mono text-[10px] text-muted-foreground">{option.pricing}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {step === 2 && (
                <form noValidate onSubmit={handleSubmit} className="space-y-6">
                  {error && <div role="alert" className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-600 font-mono text-xs">{error}</div>}
                  <div className="space-y-2">
                    <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setFieldErrors((prev) => ({ ...prev, name: "" }))
                      }}
                      required
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? "signup-name-error" : undefined}
                      className={`w-full border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${fieldErrors.name ? "border-red-500 focus:border-red-500" : "border-border focus:border-accent"}`}
                      placeholder="John Smith"
                    />
                    {fieldErrors.name && <p id="signup-name-error" className="font-mono text-[10px] text-red-600">{fieldErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setFieldErrors((prev) => ({ ...prev, email: "" }))
                      }}
                      required
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
                      className={`w-full border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${fieldErrors.email ? "border-red-500 focus:border-red-500" : "border-border focus:border-accent"}`}
                      placeholder="you@email.com"
                    />
                    {fieldErrors.email && <p id="signup-email-error" className="font-mono text-[10px] text-red-600">{fieldErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="company" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Company (optional)
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

                  {role === "building_owner" && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="tenancy-name" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                          Tenancy Name (Cloud)
                        </label>
                        <input
                          id="tenancy-name"
                          type="text"
                          value={tenancyName}
                          onChange={(e) => {
                            setTenancyName(e.target.value)
                            setFieldErrors((prev) => ({ ...prev, tenancyName: "" }))
                          }}
                          required
                          aria-invalid={Boolean(fieldErrors.tenancyName)}
                          aria-describedby={fieldErrors.tenancyName ? "signup-tenancy-error" : undefined}
                          className={`w-full border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${fieldErrors.tenancyName ? "border-red-500 focus:border-red-500" : "border-border focus:border-accent"}`}
                          placeholder="e.g. skyline-towers"
                        />
                        {fieldErrors.tenancyName && <p id="signup-tenancy-error" className="font-mono text-[10px] text-red-600">{fieldErrors.tenancyName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="building-count" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                          Number of Commercial Buildings
                        </label>
                        <input
                          id="building-count"
                          type="number"
                          min={1}
                          value={buildingCount}
                          onChange={(e) => setBuildingCount(Math.max(1, Number.parseInt(e.target.value || "1", 10)))}
                          required
                          className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                    </>
                  )}

                  {role === "building_manager" && (
                    <div className="space-y-3 border border-border/50 bg-card/30 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Feature-Based Pricing</p>
                      <div className="space-y-2">
                        {managerFeatureOptions.map((feature) => (
                          <label key={feature.id} className="flex items-center gap-3 font-mono text-xs text-foreground/90">
                            <input
                              type="checkbox"
                              checked={selectedManagerFeatures.includes(feature.id)}
                              onChange={() => toggleManagerFeature(feature.id)}
                              className="h-4 w-4 border-border bg-background"
                            />
                            {feature.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {role === "facility_manager" && (
                    <div className="space-y-2">
                      <label htmlFor="site-count" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        Managed Sites (Specific Use Case)
                      </label>
                      <input
                        id="site-count"
                        type="number"
                        min={1}
                        value={siteCount}
                        onChange={(e) => setSiteCount(Math.max(1, Number.parseInt(e.target.value || "1", 10)))}
                        required
                        className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="estimated-units" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Estimated Units
                    </label>
                    <input
                      id="estimated-units"
                      type="number"
                      min={1}
                      value={estimatedUnits}
                      onChange={(e) => setEstimatedUnits(Math.max(1, Number.parseInt(e.target.value || "1", 10)))}
                      className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
                    />
                    <p className="font-mono text-[10px] text-muted-foreground">Used to show your per-unit estimate during signup.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setFieldErrors((prev) => ({ ...prev, password: "" }))
                      }}
                      required
                      minLength={8}
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
                      className={`w-full border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${fieldErrors.password ? "border-red-500 focus:border-red-500" : "border-border focus:border-accent"}`}
                      placeholder="Min 8 characters"
                    />
                    {fieldErrors.password && <p id="signup-password-error" className="font-mono text-[10px] text-red-600">{fieldErrors.password}</p>}
                  </div>

                  <div className="space-y-3 border border-border/50 bg-card/30 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Human Check</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label htmlFor="human-check" className="font-mono text-xs text-foreground/90">
                        What is {humanA} + {humanB}?
                      </label>
                      <input
                        id="human-check"
                        type="number"
                        value={humanAnswer}
                        onChange={(e) => {
                          setHumanAnswer(e.target.value)
                          setFieldErrors((prev) => ({ ...prev, humanCheck: "" }))
                        }}
                        required
                        aria-invalid={Boolean(fieldErrors.humanCheck)}
                        aria-describedby={fieldErrors.humanCheck ? "signup-human-error" : undefined}
                        className={`w-full sm:w-28 border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none transition-colors ${fieldErrors.humanCheck ? "border-red-500 focus:border-red-500" : "border-border focus:border-accent"}`}
                        placeholder="Answer"
                        inputMode="numeric"
                      />
                      <button
                        type="button"
                        onClick={generateHumanChallenge}
                        className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
                      >
                        Refresh
                      </button>
                    </div>
                    {fieldErrors.humanCheck && <p id="signup-human-error" className="font-mono text-[10px] text-red-600">{fieldErrors.humanCheck}</p>}
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
              {step === 3 && (
                <div className="flex flex-col items-center gap-8 p-8 border border-accent/30 bg-accent/5 rounded-lg">
                  <div className="text-center">
                    <h2 className="font-[var(--font-bebas)] text-2xl mb-2">Essential Plan Ready</h2>
                    <p className="font-mono text-xs text-muted-foreground mb-1">Account created and customer profile wired.</p>
                    {liveQuote && (
                      <p className="font-mono text-xs text-foreground/90 mb-4">
                        {liveQuote.pricingModel}: {formatCurrency(liveQuote.monthly)}/month or {formatCurrency(liveQuote.yearly)}/year
                      </p>
                    )}
                    <button
                      className="mt-2 px-6 py-3 bg-accent text-accent-foreground rounded font-mono text-xs uppercase tracking-widest hover:bg-accent/90 transition-all"
                      onClick={() => {
                        const params = new URLSearchParams({
                          plan: "essential",
                          customerType: role,
                        })

                        if (role === "building_owner") {
                          params.set("buildingCount", String(buildingCount))
                          if (tenancyName.trim()) params.set("tenancyName", tenancyName.trim())
                        }

                        if (role === "building_manager") {
                          params.set("featureCount", String(Math.max(1, selectedManagerFeatures.length)))
                        }

                        if (role === "facility_manager") {
                          params.set("siteCount", String(siteCount))
                        }

                        router.push(`/checkout?${params.toString()}`)
                      }}
                    >
                      Continue to Checkout
                    </button>
                    <button
                      className="mt-3 px-6 py-3 border border-border/50 text-foreground rounded font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-all"
                      onClick={() => router.push("/dashboard")}
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
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

export default function SignUpPage() {
  return (
    <Suspense fallback={<main className="relative min-h-screen flex items-center justify-center p-6" />}>
      <SignUpPageContent />
    </Suspense>
  )
}
  
