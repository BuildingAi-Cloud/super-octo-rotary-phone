"use client"

import { useState, useEffect } from "react"

export function AccessibilityToggle() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("accessibility_enabled")
    if (stored === "true") setEnabled(true)
  }, [])

  useEffect(() => {
    localStorage.setItem("accessibility_enabled", enabled ? "true" : "false")
    document.body.classList.toggle("accessibility-enabled", enabled)
  }, [enabled])

  return (
    <button
      aria-pressed={enabled}
      aria-label={enabled ? "Disable accessibility features" : "Enable accessibility features"}
      onClick={() => setEnabled((v) => !v)}
      className={`group relative flex items-center justify-center w-9 h-9 border border-border hover:border-accent focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200 ${enabled ? "bg-accent/20" : ""}`}
      type="button"
    >
      <span className="sr-only">Toggle accessibility features</span>
      <svg
        className="w-5 h-5 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </svg>
      <span aria-live="polite" className="sr-only">
        {enabled ? "Accessibility mode enabled" : "Accessibility mode disabled"}
      </span>
    </button>
  )
}
