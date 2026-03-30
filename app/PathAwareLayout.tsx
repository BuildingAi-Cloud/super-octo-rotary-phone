"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import "@/lib/i18n"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import ClientLayout from "./ClientLayout"

export default function PathAwareLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
<<<<<<< HEAD
  const staticRoutes = ["/concierge/reservation", "/api-reference"]
=======
  const staticRoutes = ["/api-reference"]
>>>>>>> feature/ui-updates
  const chromeExcludedRoutes = ["/dashboard"]
  const isStatic = staticRoutes.includes(pathname)
  const hideMarketingChrome = chromeExcludedRoutes.some((route) => pathname.startsWith(route))

  return (
    <ThemeProvider>
      <AuthProvider>
        {isStatic || hideMarketingChrome ? <>{children}</> : <ClientLayout>{children}</ClientLayout>}
      </AuthProvider>
    </ThemeProvider>
  )
}