"use client"
import type React from "react"
import { SmoothScroll } from "@/components/smooth-scroll"
import "./globals.css"

import { Header } from "@/components/header"
import { SideNav } from "@/components/side-nav"
import Footer from "@/components/footer"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />
      <Header />
      <SideNav />
      <div className="app-shell-content pt-[calc(80px+var(--safe-area-top))] md:pl-20 md:pt-[calc(96px+var(--safe-area-top))]">
        <SmoothScroll>{children}</SmoothScroll>
      </div>
      <Footer />
    </>
  )
}
