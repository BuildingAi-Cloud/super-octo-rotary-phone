
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { AnimatedNoise } from "@/components/animated-noise";
import { ScrambleText, ScrambleTextOnHover } from "@/components/scramble-text";
import { BitmapChevron } from "@/components/bitmap-chevron";

const roleOptions: { value: UserRole; label: string; description: string; pricing: string }[] = [
  {
    value: "facility_manager",
    label: "Facility Manager",
    description: "Daily operations, maintenance, and building systems",
    pricing: "Custom pricing based on building size and features",
  },
  {
    value: "building_owner",
    label: "Building Owner",
    description: "Asset oversight, investment tracking, and portfolio management",
    pricing: "Portfolio pricing available. Contact sales for details.",
  },
  {
    value: "property_manager",
    label: "Property Manager",
    description: "Tenant relations, leasing, and property administration",
    pricing: "Flexible pricing per managed unit or property",
  },
];

export default function SignUpPage() {
    const handleRoleSelect = (selectedRole: UserRole) => {
      setRole(selectedRole);
      setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!role) return;
      setError("");
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
          role,
          company: company || undefined,
        });
        if (timeoutId) clearTimeout(timeoutId);
        if (result.success) {
          setStep(3);
        } else {
          setError(result.error || "An error occurred");
        }
      } catch (err: any) {
        setError(err?.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
  const router = useRouter();
  const { signUp } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
                  <ScrambleText text={step === 1 ? "SELECT YOUR ROLE" : step === 2 ? "CREATE ACCOUNT" : "PAYMENT (OPTIONAL)"} duration={0.8} />
                </h1>
                <p className="mt-4 font-mono text-sm text-muted-foreground">
                  {step === 1 
                    ? "Choose the role that best describes your responsibilities" 
                    : step === 2
                      ? "Complete your account setup to get started"
                      : "You can skip payment for now. Payment will be required after launch."}
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Name
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
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
                      placeholder="you@email.com"
                    />
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
                  {error && <div className="text-red-600 font-mono text-xs mt-2">{error}</div>}
                </form>
              )}
              {step === 3 && (
                <div className="flex flex-col items-center gap-8 p-8 border border-accent/30 bg-accent/5 rounded-lg">
                  <div className="text-center">
                    <h2 className="font-[var(--font-bebas)] text-2xl mb-2">Payment</h2>
                    <p className="font-mono text-xs text-muted-foreground mb-4">Payments are currently disabled. You can skip payment and continue using the app.</p>
                    <button
                      className="mt-2 px-6 py-3 bg-accent text-accent-foreground rounded font-mono text-xs uppercase tracking-widest hover:bg-accent/90 transition-all"
                      onClick={() => router.push("/dashboard")}
                    >
                      Continue
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
  
