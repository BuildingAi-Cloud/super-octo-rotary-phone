"use client"
import type React from "react"
import { SmoothScroll } from "@/components/smooth-scroll"
import "./globals.css"

import { Header } from "@/components/header"
import { SideNav } from "@/components/side-nav"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />
      <Header />
      <SideNav />
      <div className="pt-[80px] md:pl-20 md:pt-[96px]">
        <SmoothScroll>{children}</SmoothScroll>
      </div>
      <footer className="w-full text-center py-6 text-xs text-muted-foreground bg-background/80 border-t border-border mt-12 md:pl-20">
        &copy; {new Date().getFullYear()} BuildSync. All rights reserved.
      </footer>
    </>
  )
}
