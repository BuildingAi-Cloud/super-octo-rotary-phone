"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { ScrambleText } from "@/components/scramble-text"

function ReturnContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    if (sessionId) {
      // Payment confirmation is simulated; no real payment processing
      setTimeout(() => {
        setStatus("success")
      }, 1500)
    } else {
      requestAnimationFrame(() => setStatus("error"))
    }
  }, [sessionId])

  if (status === "loading") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-accent border-t-transparent animate-spin mx-auto mb-6" />
        <p className="font-mono text-sm text-muted-foreground">Confirming your payment...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 border border-destructive flex items-center justify-center mx-auto mb-6">
          <span className="text-destructive text-2xl">!</span>
        </div>
        <h1 className="font-[var(--font-bebas)] text-4xl tracking-tight mb-4">PAYMENT FAILED</h1>
        <p className="font-mono text-sm text-muted-foreground mb-8">
          There was an issue processing your payment. Please try again.
        </p>
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-2 border border-accent bg-accent/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-accent-foreground transition-all"
        >
          <BitmapChevron className="rotate-180" />
          Back to Pricing
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 border border-green-500 bg-green-500/10 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-[var(--font-bebas)] text-4xl tracking-tight mb-4">
        <ScrambleText text="PAYMENT SUCCESSFUL" duration={0.8} />
      </h1>
      <p className="font-mono text-sm text-muted-foreground mb-8 max-w-md mx-auto">
        Thank you for subscribing to BuildSync. Your account is now active and you can access all features.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-all"
        >
          Go to Dashboard
          <BitmapChevron />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-border px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutReturnPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6">
      <AnimatedNoise opacity={0.03} />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <span className="font-[var(--font-bebas)] text-2xl tracking-wider text-foreground hover:text-accent transition-colors">
              BUILDSYNC
            </span>
          </Link>
        </div>

        <Suspense fallback={
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-accent border-t-transparent animate-spin mx-auto mb-6" />
            <p className="font-mono text-sm text-muted-foreground">Loading...</p>
          </div>
        }>
          <ReturnContent />
        </Suspense>
      </div>
    </main>
  )
}
