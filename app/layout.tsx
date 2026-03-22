import type React from "react"
import type { Metadata } from "next"
import { IBM_Plex_Sans, IBM_Plex_Mono, Bebas_Neue } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SmoothScroll } from "@/components/smooth-scroll"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import "@/lib/i18n"
import "./globals.css"
import { AccessibilityToggle } from "@/components/accessibility-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { useAuth } from "@/lib/auth-context"

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
})
const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
})
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" })

export const metadata: Metadata = {
  title: "BUILDSYNC — Intelligent Facility Management Platform",
  description:
    "The trusted platform for facility managers, building owners, and property managers. Operational excellence, security, sustainability, and smart building technology.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get current user (client-side only)
  let userRole: string | null = null
  if (typeof window !== "undefined") {
    try {
      const storedUser = localStorage.getItem("buildsync_user")
      if (storedUser) {
        userRole = JSON.parse(storedUser).role
      }
    } catch {}
  }
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${ibmPlexSans.variable} ${bebasNeue.variable} ${ibmPlexMono.variable} font-sans antialiased overflow-x-hidden`}
      >
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
      </body>
    </html>
  )
}
