
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { AnimatedNoise } from "@/components/animated-noise";
import { ScrambleText, ScrambleTextOnHover } from "@/components/scramble-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BitmapChevron } from "@/components/bitmap-chevron";


export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Actually call signIn from useAuth and check credentials
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch (err) {
      setError("Failed to sign in");
    }
    setIsLoading(false);
  };

  // Helper to create test user with correct password
  const createTestUser = () => {
    const users = JSON.parse(localStorage.getItem("buildsync_users") || "[]");
    if (!users.some((u: { email: string }) => u.email === "test@test.com")) {
      users.push({
        id: "test-id",
        email: "test@test.com",
        password: "12345678",
        name: "Test User",
        role: "facility_manager"
      });
      localStorage.setItem("buildsync_users", JSON.stringify(users));
      alert("Test user created!\nEmail: test@test.com\nPassword: 12345678");
    } else {
      alert("Test user already exists.\nEmail: test@test.com\nPassword: 12345678");
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
            <ScrambleText text="SIGN IN" duration={0.8} />
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            Welcome back! Please sign in to your account.
          </p>
        </div>
        {/* Step indicator for visual consistency */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-accent">
            <span className="h-2 w-2 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Sign In</span>
          </div>
          <div className="h-px w-8 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 bg-muted" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Account</span>
          </div>
        </div>
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
          <Button
            type="button"
            className="w-full"
            variant="outline"
            size="lg"
            onClick={createTestUser}
          >
            Create Test User
          </Button>
        </form>
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent hover:underline">
              Sign up
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
  );
}

