"use client"
import React from "react";
import ClientLayout from "../ClientLayout"
import { PrinciplesSection } from "@/components/principles-section"
import { WorkSection } from "@/components/work-section"

export default function AboutPage() {
  return (
    <ClientLayout>
      <main className="min-h-screen flex flex-col gap-0">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex flex-col items-center justify-center px-6 md:px-28 pt-32 pb-16 bg-background">
          <div className="w-full max-w-4xl mx-auto text-center">
            <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-4">About BuildSync</h1>
            <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">Intelligent Facility Management Platform</h2>
            <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              BuildSync is a modern, multilingual facility management platform for residential and commercial properties. We help property teams deliver better service, improve communication, and automate routine tasks—all in a secure, scalable, and user-friendly environment.
            </p>
          </div>
        </section>
        {/* Pillars Section */}
        <PrinciplesSection />
        {/* Solutions Section */}
        <section className="bg-background/80">
          <div className="max-w-6xl mx-auto">
            <WorkSection />
          </div>
        </section>
        {/* Features Overview */}
        <section className="py-24 px-6 md:px-28 bg-card/40 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-[var(--font-bebas)] text-4xl md:text-6xl tracking-tight mb-8">What BuildSync Offers</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-sm text-foreground/90">
              <li>Role-based dashboards for owners, managers, staff, tenants, and residents</li>
              <li>Amenity booking and management</li>
              <li>Maintenance request tracking</li>
              <li>Audit logs for transparency</li>
              <li>Community bulletin board</li>
              <li>Accessible, responsive UI with dark mode and language selector</li>
            </ul>
          </div>
        </section>
      </main>
    </ClientLayout>
  )
}
