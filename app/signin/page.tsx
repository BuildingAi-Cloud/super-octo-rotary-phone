"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { AnimatedNoise } from "@/components/animated-noise"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { AccessibilityToggle } from "@/components/accessibility-toggle"



export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendgridApiKey, setSendgridApiKey] = useState("");

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sendgridApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Failed to send OTP");
    }
    setIsLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Invalid OTP");
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
        return (
          <main className="relative min-h-screen flex items-center justify-center bg-background px-4">
            <AnimatedNoise opacity={0.03} />
            <div className="absolute top-4 right-4 z-20">
              <AccessibilityToggle />
            </div>
            <div className="absolute top-4 left-4 z-20">
              <button
                type="button"
                onClick={createTestUser}
                className="bg-muted text-foreground px-2 py-1 rounded font-mono text-xs"
              >
                Create Test User
              </button>
            </div>
            <form
              onSubmit={step === 1 ? handleRequestOtp : handleVerifyOtp}
              className="bg-card/80 p-8 rounded-lg shadow-lg w-full max-w-md z-10"
            >
              <h1 className="font-[var(--font-bebas)] text-4xl mb-6 tracking-tight">Sign In</h1>
              {error && <div className="text-red-600 font-mono text-xs mb-2">{error}</div>}
              {step === 1 ? (
                <>
                  <div className="mb-4">
                    <label className="font-mono text-xs">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border border-border px-2 py-1 rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="font-mono text-xs">SendGrid API Key</label>
                    <input
                      type="password"
                      value={sendgridApiKey}
                      onChange={e => setSendgridApiKey(e.target.value)}
                      className="w-full border border-border px-2 py-1 rounded"
                      required
                      autoComplete="new-password"
                      placeholder="SG.xxxxx..."
                    />
                    <span className="text-xs text-muted-foreground">(For demo: enter your SendGrid API key)</span>
                  </div>
                  <button
                    type="submit"
                    className="bg-accent text-accent-foreground px-4 py-2 rounded font-mono text-xs uppercase tracking-widest hover:bg-accent/90 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="font-mono text-xs">Enter OTP</label>
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      containerClassName="justify-center"
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots.map((_, idx) => (
                            <InputOTPSlot key={idx} index={idx} />
                          ))}
                        </InputOTPGroup>
                      )}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-accent text-accent-foreground px-4 py-2 rounded font-mono text-xs uppercase tracking-widest hover:bg-accent/90 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </>
              )}
            </form>
          </main>
        );
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
  );
}
