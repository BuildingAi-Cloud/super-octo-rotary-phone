"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { acceptInvite } from "@/lib/user-management-store";
import { ROLE_TEMPLATES } from "@/lib/rbac";
import { AnimatedNoise } from "@/components/animated-noise";
import { ScrambleText } from "@/components/scramble-text";

function InvitePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const [code, setCode] = useState(searchParams.get("code") || "");
  const [step, setStep] = useState<"code" | "profile" | "done">(searchParams.get("code") ? "profile" : "code");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resultRole, setResultRole] = useState("");

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) { setError("Enter your invite code"); return; }
    setError("");
    setStep("profile");
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = acceptInvite(code.trim().toUpperCase(), { name, email, password });
    if (!result.success) {
      setError(result.error || "Failed to accept invite");
      return;
    }

    setResultRole(result.user?.role || "");
    setStep("done");

    // Auto-sign in
    await signIn(email, password);
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
            <ScrambleText
              text={step === "code" ? "ENTER INVITE CODE" : step === "profile" ? "CREATE YOUR PROFILE" : "WELCOME ABOARD"}
              duration={0.8}
            />
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            {step === "code" && "You should have received an invite code from your building manager or administrator."}
            {step === "profile" && "Complete your profile to get started."}
            {step === "done" && "Your account is ready. Redirecting to your dashboard..."}
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[
            { label: "Code", active: step === "code", done: step !== "code" },
            { label: "Profile", active: step === "profile", done: step === "done" },
            { label: "Done", active: step === "done", done: false },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div className="h-px w-8 bg-border" />}
              <div className={`flex items-center gap-2 ${s.active ? "text-accent" : s.done ? "text-green-400" : "text-muted-foreground"}`}>
                <span className={`h-2 w-2 ${s.active ? "bg-accent" : s.done ? "bg-green-400" : "bg-muted"}`} />
                <span className="font-mono text-[10px] uppercase tracking-widest">{s.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ── Code Step ─────────────────────────────────────────── */}
        {step === "code" && (
          <form
            onSubmit={handleCodeSubmit}
            className="space-y-6 bg-card/30 border border-border/40 p-8 rounded-lg max-w-md mx-auto"
          >
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Invite Code
              </label>
              <input
                type="text"
                className="w-full bg-background border border-border/40 rounded-md px-4 py-3 font-mono text-lg tracking-[0.5em] text-center uppercase focus:outline-none focus:border-accent/60"
                maxLength={12}
                placeholder="XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p className="font-mono text-xs text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-3 border border-accent bg-accent/10 rounded-md font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors"
            >
              Continue
            </button>
            <p className="text-center font-mono text-[10px] text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="text-accent hover:underline">Sign in</Link>
            </p>
          </form>
        )}

        {/* ── Profile Step ──────────────────────────────────────── */}
        {step === "profile" && (
          <form
            onSubmit={handleProfileSubmit}
            className="space-y-6 bg-card/30 border border-border/40 p-8 rounded-lg max-w-md mx-auto"
          >
            <div className="border border-border/20 rounded-md p-3 bg-card/10 text-center">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Invite Code</p>
              <p className="font-mono text-sm tracking-[0.3em] text-accent">{code.toUpperCase()}</p>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent/60"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Email</label>
              <input
                type="email"
                required
                className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent/60"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Password</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full bg-background border border-border/40 rounded-md px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent/60"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="font-mono text-xs text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-3 border border-accent bg-accent/10 rounded-md font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors"
            >
              Create Account
            </button>
          </form>
        )}

        {/* ── Done Step ─────────────────────────────────────────── */}
        {step === "done" && (
          <div className="space-y-6 bg-card/30 border border-border/40 p-8 rounded-lg max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-green-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <p className="font-[var(--font-bebas)] text-2xl tracking-wide">Account Created</p>
              {resultRole && (
                <p className="font-mono text-xs text-muted-foreground mt-2">
                  Role: <span className="text-accent">{ROLE_TEMPLATES[resultRole as keyof typeof ROLE_TEMPLATES]?.label || resultRole}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full px-4 py-3 border border-accent bg-accent/10 rounded-md font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent/20 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-xs text-muted-foreground animate-pulse">Loading...</p>
      </main>
    }>
      <InvitePageInner />
    </Suspense>
  );
}
