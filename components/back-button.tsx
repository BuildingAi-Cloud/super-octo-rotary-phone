"use client"

import { useRouter, usePathname } from "next/navigation"

type BackButtonProps = {
  fallbackHref?: string
  className?: string
}

export function BackButton({ fallbackHref, className }: BackButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Hide on the homepage to avoid unnecessary navigation noise.
  if (pathname === "/") {
    return null
  }

  const fallback =
    fallbackHref ?? (pathname.startsWith("/dashboard") ? "/dashboard" : "/")

  const handleBack = () => {
    // Prefer history navigation and gracefully fallback when no browser history exists.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }
    router.push(fallback)
  }

  return (
    <button
      type="button"
      aria-label="Go back"
      title="Go back"
      onClick={handleBack}
      className={
        className ??
        "inline-flex items-center justify-center w-9 h-9 border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
      }
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
    </button>
  )
}