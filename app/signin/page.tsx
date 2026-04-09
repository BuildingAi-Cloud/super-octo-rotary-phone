"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRoleDisplayName, type UserRole, useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { AnimatedNoise } from "@/components/animated-noise";
import { ScrambleText, ScrambleTextOnHover } from "@/components/scramble-text";
import { Input } from "@/components/ui/input";
import { BitmapChevron } from "@/components/bitmap-chevron";

export default function SignInPage() {
  const router = useRouter();
  const {
    signIn,
    requestPasswordResetChallenge,
    resetPasswordWithSecondFactor,
    switchRole,
    availableRoles,
    user,
    isLoading: authLoading,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requiresAccountSelection, setRequiresAccountSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
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

  // Redirect authenticated users to dashboard (pre-login page protection).
  useEffect(() => {
    if (!authLoading && user && !isLoading && !requiresAccountSelection) {
      router.push("/dashboard")
    }
  }, [user, authLoading, isLoading, requiresAccountSelection, router])

  // Actually call signIn from useAuth and check credentials
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.success) {
        const rawSessionUser = localStorage.getItem("buildsync_user");
        if (rawSessionUser) {
          try {
            const parsed = JSON.parse(rawSessionUser) as { role?: UserRole; accessRoles?: UserRole[] };
            const roles = Array.isArray(parsed.accessRoles) && parsed.accessRoles.length > 0
              ? parsed.accessRoles
              : parsed.role
                ? [parsed.role]
                : [];

            if (roles.length > 1) {
              setRequiresAccountSelection(true);
              setSelectedRole(parsed.role || roles[0] || "");
              setShowReset(false);
              return;
            }
          } catch {
            // Fall through to dashboard when session payload can't be parsed.
          }
        }

        router.push("/dashboard");
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch {
      setError("Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountContinue = () => {
    if (!selectedRole) {
      setError("Select an account before continuing.");
      return;
    }

    switchRole(selectedRole);
    setRequiresAccountSelection(false);
    router.push("/dashboard");
  };

  const handleRequestResetCode = async () => {
    setResetError("");
    setResetMessage("");
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
            <ScrambleText text="SIGN IN" duration={0.8} />
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            Welcome back! Please sign in to your account.
          </p>
        </div>
        {/* Step indicator for visual consistency */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${requiresAccountSelection ? "text-muted-foreground" : "text-accent"}`}>
            <span className={`h-2 w-2 ${requiresAccountSelection ? "bg-muted" : "bg-accent"}`} />
            <span className="font-mono text-[10px] uppercase tracking-widest">Sign In</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className={`flex items-center gap-2 ${requiresAccountSelection ? "text-accent" : "text-muted-foreground"}`}>
            <span className={`h-2 w-2 ${requiresAccountSelection ? "bg-accent" : "bg-muted"}`} />
            <span className="font-mono text-[10px] uppercase tracking-widest">Account</span>
          </div>
        </div>
        {!requiresAccountSelection ? (
          <form onSubmit={handleSignIn} className="space-y-6 bg-card/30 border border-border/40 p-8 rounded-lg w-full max-w-md flex flex-col gap-6 shadow-md mx-auto">
            <div className="space-y-2">
              <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {error && <div className="text-red-600 font-mono text-xs mt-2">{error}</div>}
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
        ) : (
          <div className="space-y-4 bg-card/30 border border-border/40 p-8 rounded-lg w-full max-w-md flex flex-col shadow-md mx-auto">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Select Account</p>
            <p className="text-sm text-muted-foreground">Choose the account role you want to continue with.</p>

            <div className="space-y-2">
              <label htmlFor="account-role" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Account Role</label>
              <select
                id="account-role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full rounded-md border border-border/35 bg-background px-3 py-2 text-sm"
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </option>
                ))}
              </select>
            </div>

            {error && <div className="text-red-600 font-mono text-xs">{error}</div>}

            <button
              type="button"
              onClick={handleAccountContinue}
              className="group w-full inline-flex items-center justify-center gap-3 bg-accent px-6 py-4 font-mono text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-all duration-200"
            >
              <ScrambleTextOnHover text="Continue to Dashboard" as="span" duration={0.5} />
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {showReset && (
          <form
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
                onChange={e => setResetEmail(e.target.value)}
                required
              />
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
                  onChange={e => setResetCode(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="rsa-token" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">RSA Token</label>
                <Input
                  id="rsa-token"
                  type="password"
                  placeholder="Enter RSA token"
                  value={rsaToken}
                  onChange={e => setRsaToken(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="new-password" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">New Password</label>
              <Input
                id="new-password"
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
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
