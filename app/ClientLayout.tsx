"use client"
import type React from "react"
import { SmoothScroll } from "@/components/smooth-scroll"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import { AccessibilityToggle } from "@/components/accessibility-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import "./globals.css"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />
      {/* TopBar: Accessibility, Theme, Language (Property Manager only) */}
      <div className="fixed top-0 left-0 w-full z-50 flex flex-row-reverse items-center gap-3 p-3 md:p-4 bg-background/80 backdrop-blur border-b border-border">
        <LanguageSelector />
        <ThemeToggle />
        <AccessibilityToggle />
      </div>
      <div className="pt-[80px] md:pt-[96px]">
        <ThemeProvider>
          <AuthProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </AuthProvider>
        </ThemeProvider>
      </div>
    </>
  )
}
