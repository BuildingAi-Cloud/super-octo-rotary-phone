"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { AccessibilityToggle } from "@/components/accessibility-toggle"



export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)


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



  // Helper to create test user
  const createTestUser = () => {
    const users = JSON.parse(localStorage.getItem("buildsync_users") || "[]");
    if (!users.some((u: any) => u.email === "test@test.com")) {
      users.push({
        id: "test-id",
        email: "test@test.com",
        password: "123456",
        name: "Test User",
        role: "facility_manager"
      });
      localStorage.setItem("buildsync_users", JSON.stringify(users));
      alert("Test user created!\nEmail: test@test.com\nPassword: 123456");
    } else {
      alert("Test user already exists.\nEmail: test@test.com\nPassword: 123456");
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6">
      <AnimatedNoise opacity={0.03} />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />
      <div className="absolute top-4 right-4 z-20">
        <AccessibilityToggle />
      </div>
      <div className="absolute top-4 left-4 z-20">
        <button
          type="button"
          onClick={createTestUser}
          className="px-3 py-1 bg-accent text-accent-foreground rounded text-xs font-mono shadow hover:bg-accent/80"
        >
          Create Test User
        </button>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6 bg-card/80 p-8 rounded-lg shadow-lg">
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
          </button>
        </form>
      </div>
    </main>
  )
}
