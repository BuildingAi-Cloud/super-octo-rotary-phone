"use client"
import type React from "react"
import { SmoothScroll } from "@/components/smooth-scroll"
import "./globals.css"

import { Header } from "@/components/header"
<<<<<<< HEAD
import { SideNav } from "@/components/side-nav"
import Footer from "@/components/footer"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />
      <Header />
      <SideNav />
      <div className="pt-[80px] md:pl-20 md:pt-[96px]">
        <SmoothScroll>{children}</SmoothScroll>
      </div>
      <Footer />
    </>
  )
}
      <Footer />
>>>>>>> feature/ui-updates
    </>
  )
}
