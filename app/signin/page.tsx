"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ROLE_TEMPLATES } from "@/lib/rbac";
import type { UserRole } from "@/lib/auth-context";
import Link from "next/link";
import { AnimatedNoise } from "@/components/animated-noise";
import { ScrambleText, ScrambleTextOnHover } from "@/components/scramble-text";
import { Input } from "@/components/ui/input";
import { BitmapChevron } from "@/components/bitmap-chevron";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInPage() {
  const router = useRouter();
  const { signIn, switchRole, availableRoles, user, isLoading: authLoading } = useAuth();
  const [authStep, setAuthStep] = useState<"signin" | "account">("signin");
  const [selectedAccountRole, setSelectedAccountRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateSignIn = () => {
    const nextErrors: Record<string, string> = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Keep sign-in as a 2-step flow: credentials first, then account selection.
  useEffect(() => {
    if (!authLoading && user) {
      setAuthStep("account")
      setEmail(user.email)
    }
  }, [user, authLoading])

  const accountRoles: UserRole[] = user
    ? [...new Set((availableRoles && availableRoles.length > 0 ? availableRoles : [user.role]))]
    : []

  const enterDashboardForRole = (role: UserRole) => {
    setSelectedAccountRole(role)
    if (user && user.role !== role) {
      switchRole(role)
    }
    router.push("/dashboard")
  }

  // Actually call signIn from useAuth and check credentials
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateSignIn()) {
      setError("Please fix the highlighted fields and try again.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.success) {
        setAuthStep("account")
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch {
      setError("Failed to sign in");
    }
    setIsLoading(false);
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
            <ScrambleText text={authStep === "signin" ? "SIGN IN" : "SELECT ACCOUNT"} duration={0.8} />
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            {authStep === "signin"
              ? "Welcome back! Please sign in to your account."
              : "Choose the account access level you want to use for this session."}
          </p>
        </div>
        {/* Step indicator for visual consistency */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${authStep === "signin" ? "text-accent" : "text-muted-foreground"}`}>
            <span className={`h-2 w-2 ${authStep === "signin" ? "bg-accent" : "bg-muted"}`} />
            <span className="font-mono text-[10px] uppercase tracking-widest">Sign In</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className={`flex items-center gap-2 ${authStep === "account" ? "text-accent" : "text-muted-foreground"}`}>
            <span className={`h-2 w-2 ${authStep === "account" ? "bg-accent" : "bg-muted"}`} />
            <span className="font-mono text-[10px] uppercase tracking-widest">Account</span>
          </div>
        </div>
        {authStep === "signin" && (
          <form noValidate onSubmit={handleSignIn} className="space-y-6 bg-card/30 border border-border/40 p-8 rounded-lg w-full max-w-md flex flex-col gap-6 shadow-md mx-auto">
          {error && <div role="alert" className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-600 font-mono text-xs">{error}</div>}
          <div className="space-y-2">
            <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                setFieldErrors((prev) => ({ ...prev, email: "" }))
              }}
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "signin-email-error" : undefined}
              className={fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : undefined}
            />
            {fieldErrors.email && <p id="signin-email-error" className="font-mono text-[10px] text-red-600">{fieldErrors.email}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                setFieldErrors((prev) => ({ ...prev, password: "" }))
              }}
              required
              minLength={8}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "signin-password-error" : undefined}
              className={fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : undefined}
            />
            {fieldErrors.password && <p id="signin-password-error" className="font-mono text-[10px] text-red-600">{fieldErrors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="group w-full inline-flex items-center justify-center gap-3 bg-accent px-6 py-4 font-mono text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ScrambleTextOnHover text={isLoading ? "Signing in..." : "Sign In"} as="span" duration={0.5} />
            {!isLoading && <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1" />}
          </button>

          <button
            type="button"
            className="self-start font-mono text-[10px] uppercase tracking-[0.24em] text-accent hover:underline"
            onClick={() => router.push(`/forgot-password${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ""}`)}
          >
            Forgot Password
          </button>
          </form>
        )}

        {authStep === "account" && (
          <section className="space-y-4 bg-card/30 border border-border/40 p-8 rounded-lg w-full max-w-md shadow-md mx-auto">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Account Access</p>
            {accountRoles.length === 0 ? (
              <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-600 font-mono text-xs">
                No account roles found for this user. Please sign out and try again.
              </div>
            ) : (
              <div className="space-y-3">
                {accountRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => enterDashboardForRole(role)}
                    disabled={selectedAccountRole === role}
                    className="w-full text-left rounded border border-border/40 bg-background/70 px-4 py-3 transition-colors hover:border-accent/60 hover:bg-accent/5 disabled:opacity-70"
                  >
                    <p className="font-mono text-xs uppercase tracking-widest text-foreground">
                      {ROLE_TEMPLATES[role]?.label || role.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ROLE_TEMPLATES[role]?.description || "Access this dashboard view."}
                    </p>
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setAuthStep("signin")
                setError("")
                setPassword("")
              }}
              className="self-start font-mono text-[10px] uppercase tracking-[0.24em] text-accent hover:underline"
            >
              Use different credentials
            </button>
          </section>
        )}

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
  );
}
