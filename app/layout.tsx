import type { Metadata } from "next"
import { IBM_Plex_Sans, IBM_Plex_Mono, Bebas_Neue } from "next/font/google"
import ClientLayout from "./ClientLayout"
import "./globals.css"

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

import { usePathname } from "next/navigation"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // This is a workaround for static export: don't wrap static pages in ClientLayout
  // List all static routes here
  const staticRoutes = [
    "/concierge/reservation",
    "/api-reference"
  ];
  // Use a dynamic check for the current path
  let pathname = "";
  try {
    // Only works in client components, so fallback to empty string on server
    pathname = usePathname ? usePathname() : "";
  } catch {}

  const isStatic = staticRoutes.includes(pathname);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${ibmPlexSans.variable} ${bebasNeue.variable} ${ibmPlexMono.variable} font-sans antialiased overflow-x-hidden`}>
        {isStatic ? children : <ClientLayout>{children}</ClientLayout>}
      </body>
    </html>
  )
}
