"use client"

import React from "react";
import Link from "next/link";
import ClientLayout from "../ClientLayout";
import { PrinciplesSection } from "@/components/principles-section";
import { WorkSection } from "@/components/work-section";

export default function AboutPage() {
  return (
    <ClientLayout>
      <main className="min-h-screen flex flex-col gap-0">
        {/* Back Button and Hero Section */}
        <section className="relative min-h-[60vh] flex flex-col items-center justify-center px-6 md:px-28 pt-32 pb-16 bg-background">
          <div className="w-full max-w-4xl mx-auto text-center">
            <div className="mb-6 flex items-center gap-4">
              <Link href="/" className="font-mono text-xs text-accent hover:underline">← Back</Link>
              <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">About BuildSync</h1>
            </div>
            <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">Intelligent Facility Management Platform</h2>
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">GDPR</span>
              <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">ISO 27001</span>
              <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">SOC 2</span>
            </div>
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
        {/* Team Section */}
        <section className="py-16 px-6 md:px-28 bg-background">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-mono text-xl mb-4">Meet the Team</h3>
            <ul className="font-mono text-sm text-muted-foreground space-y-2">
              <li><b>Jane Doe</b> – CEO & Co-founder</li>
              <li><b>John Smith</b> – CTO & Co-founder</li>
              <li><b>Priya Patel</b> – Head of Product</li>
              <li><b>Alex Kim</b> – Lead Engineer</li>
            </ul>
          </div>
        </section>
        {/* Last Updated and Contact */}
        <section className="py-4 px-6 md:px-28 bg-background">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="font-mono text-xs text-muted-foreground">Last updated: March 2026</div>
            <div className="font-mono text-sm text-muted-foreground">Contact us at <a href="mailto:info@buildsync.com" className="text-accent underline hover:text-accent-foreground">info@buildsync.com</a> or <Link href="/contact" className="text-accent underline hover:text-accent-foreground">use our contact form</Link>.</div>
          </div>
        </section>
      </main>
    </ClientLayout>
  );
}
