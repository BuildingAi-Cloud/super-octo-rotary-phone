"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { AccessibilityToggle } from "@/components/accessibility-toggle"



export default function SignInPage() {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background">
        <form onSubmit={handleSignIn} className="bg-card p-8 rounded shadow-md w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-2 text-center">Sign In</h1>
          <AccessibilityToggle />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input input-bordered w-full"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input input-bordered w-full"
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
          <button type="button" className="btn btn-secondary w-full" onClick={createTestUser}>
            Create Test User
          </button>
        </form>
      </main>
    );
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendgridApiKey, setSendgridApiKey] = useState("");


  // Bypass OTP: Directly sign in and redirect
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      // Optionally: validate email format here
      // Optionally: call signIn from useAuth if needed
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to sign in");
    }
    setIsLoading(false);
  };

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
}

