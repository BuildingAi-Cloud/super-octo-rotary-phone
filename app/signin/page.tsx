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
  const {
    signIn,
    switchRole,
    availableRoles,
    requestPasswordResetChallenge,
    resetPasswordWithSecondFactor,
    user,
    isLoading: authLoading,
  } = useAuth();
  const [authStep, setAuthStep] = useState<"signin" | "account">("signin");
  const [selectedAccountRole, setSelectedAccountRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetMethod, setResetMethod] = useState<"mfa_code" | "rsa_token">("mfa_code");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [rsaToken, setRsaToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetFieldErrors, setResetFieldErrors] = useState<Record<string, string>>({});

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

  const validateResetRequest = () => {
    const nextErrors: Record<string, string> = {};

    if (!resetEmail.trim()) {
      nextErrors.resetEmail = "Email is required.";
    } else if (!EMAIL_REGEX.test(resetEmail.trim())) {
      nextErrors.resetEmail = "Enter a valid email address.";
    }

    setResetFieldErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateResetSubmit = () => {
    const nextErrors: Record<string, string> = {};

    if (!resetEmail.trim()) {
      nextErrors.resetEmail = "Email is required.";
    } else if (!EMAIL_REGEX.test(resetEmail.trim())) {
      nextErrors.resetEmail = "Enter a valid email address.";
    }

    if (resetMethod === "mfa_code") {
      const code = resetCode.trim();
      if (!code) {
        nextErrors.resetCode = "Verification code is required.";
      } else if (!/^\d{6}$/.test(code)) {
        nextErrors.resetCode = "Enter the 6-digit verification code.";
      }
    }

    if (resetMethod === "rsa_token" && !rsaToken.trim()) {
      nextErrors.rsaToken = "RSA token is required.";
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = "New password is required.";
    } else if (newPassword.trim().length < 8) {
      nextErrors.newPassword = "New password must be at least 8 characters.";
    }

    setResetFieldErrors(nextErrors);
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
        setShowReset(false)
        setAuthStep("account")
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch {
      setError("Failed to sign in");
    }
    setIsLoading(false);
  };

  const handleRequestResetCode = async () => {
    setResetError("");
    setResetMessage("");
    if (!validateResetRequest()) {
      setResetError("Please provide a valid email before requesting a code.");
      return;
    }
    setIsRequestingCode(true);

    try {
      const result = await requestPasswordResetChallenge(resetEmail, resetMethod);
      if (!result.success) {
        setResetError(result.error || "Unable to request verification code.");
      } else {
        if (resetMethod === "mfa_code") {
          const devSuffix = result.devCode ? ` Demo code: ${result.devCode}` : "";
          setResetMessage(`Verification code sent. It expires in 5 minutes.${devSuffix}`);
        } else {
          const devSuffix = result.devRsaToken ? ` Demo RSA token: ${result.devRsaToken}` : "";
          setResetMessage(`Use your RSA token to complete reset.${devSuffix}`);
        }
      }
    } catch {
      setResetError("Failed to request verification code.");
    }

    setIsRequestingCode(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    if (!validateResetSubmit()) {
      setResetError("Please fix the highlighted fields and try again.");
      return;
    }
    setIsResettingPassword(true);

    try {
      const result = await resetPasswordWithSecondFactor(resetEmail, newPassword, {
        method: resetMethod,
        mfaCode: resetMethod === "mfa_code" ? resetCode : undefined,
        rsaToken: resetMethod === "rsa_token" ? rsaToken : undefined,
      });
      if (!result.success) {
        setResetError(result.error || "Unable to reset password.");
      } else {
        setResetMessage("Password reset successful. You can now sign in with the new password.");
        setResetCode("");
        setRsaToken("");
        setNewPassword("");
      }
    } catch {
      setResetError("Failed to reset password.");
    }

    setIsResettingPassword(false);
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
            onClick={() => {
              setShowReset((prev) => !prev);
              setResetError("");
              setResetMessage("");
              if (!showReset) {
                setResetEmail(email);
              }
            }}
            className="self-start font-mono text-[10px] uppercase tracking-[0.24em] text-accent hover:underline"
          >
            {showReset ? "Hide Forgot Password" : "Forgot Password"}
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

        {authStep === "signin" && showReset && (
          <form
            noValidate
            onSubmit={handlePasswordReset}
            className="mt-6 space-y-4 bg-card/30 border border-border/40 p-6 rounded-lg w-full max-w-md shadow-md mx-auto"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Forgot Password</p>

            <div className="space-y-2">
              <label htmlFor="reset-method" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Reset Method</label>
              <select
                id="reset-method"
                value={resetMethod}
                onChange={e => {
                  const next = e.target.value as "mfa_code" | "rsa_token";
                  setResetMethod(next);
                  setResetError("");
                  setResetMessage("");
                }}
                className="w-full rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
              >
                <option value="mfa_code">Multi-Factor Verification Code</option>
                <option value="rsa_token">RSA Token</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="reset-email" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Email</label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@email.com"
                value={resetEmail}
                onChange={e => {
                  setResetEmail(e.target.value)
                  setResetFieldErrors((prev) => ({ ...prev, resetEmail: "" }))
                }}
                required
                aria-invalid={Boolean(resetFieldErrors.resetEmail)}
                aria-describedby={resetFieldErrors.resetEmail ? "reset-email-error" : undefined}
                className={resetFieldErrors.resetEmail ? "border-red-500 focus-visible:ring-red-500" : undefined}
              />
              {resetFieldErrors.resetEmail && <p id="reset-email-error" className="font-mono text-[10px] text-red-600">{resetFieldErrors.resetEmail}</p>}
            </div>

            <button
              type="button"
              onClick={() => {
                void handleRequestResetCode();
              }}
              disabled={isRequestingCode}
              className="group inline-flex items-center justify-center gap-2 border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-accent disabled:opacity-50"
            >
              <ScrambleTextOnHover text={isRequestingCode ? "Sending..." : resetMethod === "mfa_code" ? "Send Verification Code" : "Initialize RSA Reset"} as="span" duration={0.4} />
            </button>

            {resetMethod === "mfa_code" ? (
              <div className="space-y-2">
                <label htmlFor="reset-code" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">MFA Code</label>
                <Input
                  id="reset-code"
                  type="text"
                  placeholder="6-digit code"
                  value={resetCode}
                  onChange={e => {
                    setResetCode(e.target.value)
                    setResetFieldErrors((prev) => ({ ...prev, resetCode: "" }))
                  }}
                  required
                  aria-invalid={Boolean(resetFieldErrors.resetCode)}
                  aria-describedby={resetFieldErrors.resetCode ? "reset-code-error" : undefined}
                  className={resetFieldErrors.resetCode ? "border-red-500 focus-visible:ring-red-500" : undefined}
                />
                {resetFieldErrors.resetCode && <p id="reset-code-error" className="font-mono text-[10px] text-red-600">{resetFieldErrors.resetCode}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="rsa-token" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">RSA Token</label>
                <Input
                  id="rsa-token"
                  type="password"
                  placeholder="Enter RSA token"
                  value={rsaToken}
                  onChange={e => {
                    setRsaToken(e.target.value)
                    setResetFieldErrors((prev) => ({ ...prev, rsaToken: "" }))
                  }}
                  required
                  aria-invalid={Boolean(resetFieldErrors.rsaToken)}
                  aria-describedby={resetFieldErrors.rsaToken ? "rsa-token-error" : undefined}
                  className={resetFieldErrors.rsaToken ? "border-red-500 focus-visible:ring-red-500" : undefined}
                />
                {resetFieldErrors.rsaToken && <p id="rsa-token-error" className="font-mono text-[10px] text-red-600">{resetFieldErrors.rsaToken}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="new-password" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">New Password</label>
              <Input
                id="new-password"
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value)
                  setResetFieldErrors((prev) => ({ ...prev, newPassword: "" }))
                }}
                required
                minLength={8}
                aria-invalid={Boolean(resetFieldErrors.newPassword)}
                aria-describedby={resetFieldErrors.newPassword ? "new-password-error" : undefined}
                className={resetFieldErrors.newPassword ? "border-red-500 focus-visible:ring-red-500" : undefined}
              />
              {resetFieldErrors.newPassword && <p id="new-password-error" className="font-mono text-[10px] text-red-600">{resetFieldErrors.newPassword}</p>}
            </div>

            {resetError && <div className="text-red-600 font-mono text-xs">{resetError}</div>}
            {resetMessage && <div className="text-emerald-500 font-mono text-xs">{resetMessage}</div>}

            <button
              type="submit"
              disabled={isResettingPassword}
              className="group w-full inline-flex items-center justify-center gap-3 bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ScrambleTextOnHover text={isResettingPassword ? "Resetting..." : "Reset Password"} as="span" duration={0.5} />
              {!isResettingPassword && <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1" />}
            </button>
          </form>
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
