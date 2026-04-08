"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AnimatedNoise } from "@/components/animated-noise";
import { ScrambleText, ScrambleTextOnHover } from "@/components/scramble-text";
import { Input } from "@/components/ui/input";
import { BitmapChevron } from "@/components/bitmap-chevron";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordPageInner() {
  const searchParams = useSearchParams();
  const { requestPasswordResetChallenge, resetPasswordWithSecondFactor } = useAuth();

  const [resetMethod, setResetMethod] = useState<"mfa_code" | "rsa_token">("mfa_code");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [rsaToken, setRsaToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetFieldErrors, setResetFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setResetEmail(emailFromQuery);
    }
  }, [searchParams]);

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
        <div className="mb-12 text-center">
          <Link href="/" className="inline-block mb-8">
            <span className="font-[var(--font-bebas)] text-2xl tracking-wider text-foreground hover:text-accent transition-colors">
              BUILDSYNC
            </span>
          </Link>
          <h1 className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-tight">
            <ScrambleText text="FORGOT PASSWORD" duration={0.8} />
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            Verify your identity and set a new password.
          </p>
        </div>

        <form
          noValidate
          onSubmit={handlePasswordReset}
          className="space-y-4 bg-card/30 border border-border/40 p-6 rounded-lg w-full max-w-md shadow-md mx-auto"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Reset Flow</p>

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
                setResetEmail(e.target.value);
                setResetFieldErrors((prev) => ({ ...prev, resetEmail: "" }));
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
            <ScrambleTextOnHover
              text={isRequestingCode ? "Sending..." : resetMethod === "mfa_code" ? "Send Verification Code" : "Initialize RSA Reset"}
              as="span"
              duration={0.4}
            />
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
                  setResetCode(e.target.value);
                  setResetFieldErrors((prev) => ({ ...prev, resetCode: "" }));
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
                  setRsaToken(e.target.value);
                  setResetFieldErrors((prev) => ({ ...prev, rsaToken: "" }));
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
                setNewPassword(e.target.value);
                setResetFieldErrors((prev) => ({ ...prev, newPassword: "" }));
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

        <div className="mt-12 text-center">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <BitmapChevron className="rotate-180" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="font-mono text-xs text-muted-foreground animate-pulse">Loading...</p>
        </main>
      }
    >
      <ForgotPasswordPageInner />
    </Suspense>
  );
}
