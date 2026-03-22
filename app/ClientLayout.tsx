"use client"
import type React from "react"
import { SmoothScroll } from "@/components/smooth-scroll"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import { AccessibilityToggle } from "@/components/accessibility-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import "./globals.css"

import { Header } from "@/components/header"
import { SideNav } from "@/components/side-nav"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />
      <Header />
      <SideNav />
      <div className="pt-[80px] md:pt-[96px]">
        <ThemeProvider>
          <AuthProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </AuthProvider>
        </ThemeProvider>
      </div>
      <footer className="w-full text-center py-6 text-xs text-muted-foreground bg-background/80 border-t border-border mt-12">
        &copy; {new Date().getFullYear()} BuildSync. All rights reserved.
      </footer>
    </>
  )
}
