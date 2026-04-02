
"use client";
import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function ColophonSection() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          x: -60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }

      // Grid columns fade up with stagger
      if (gridRef.current) {
        const columns = gridRef.current.querySelectorAll(":scope > div")
        gsap.from(columns, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }

      // Footer fade in
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 95%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="colophon"
      className="relative py-16 md:py-28 max-w-screen-xl mx-auto px-3 md:px-6 border-t border-border/30"
    >
      {/* Section header */}
      <div ref={headerRef} className="max-w-7xl mx-auto mb-12 md:mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">04 / {t("connect", "Connect")}</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-7xl tracking-tight">{t("getStarted", "GET STARTED")}</h2>
      </div>

      {/* Multi-column layout */}
      <div ref={gridRef} className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
        {/* Resources */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">{t("resources", "Resources")}</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">
              <a href="/documentation" className="hover:underline">{t("documentation", "Documentation")}</a>
            </li>
            <li className="font-mono text-xs text-foreground/80">
              <a href="/api-reference" className="hover:underline">{t("apiReference", "API Reference")}</a>
            </li>
          </ul>
        </div>

        {/* Compliance */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">{t("compliance", "Compliance")}</h4>
          <ul className="space-y-2">
            <li className="font-mono text-xs text-foreground/80">ISO 27001</li>
            <li className="font-mono text-xs text-foreground/80">SOC 2 Type II</li>
            <li className="font-mono text-xs text-foreground/80">GDPR {t("ready", "Ready")}</li>
          </ul>
        </div>

        {/* Industries */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">{t("industries", "Industries")}</h4>
          <ul className="space-y-2">
            <li>
              <a href="/commercial" className="font-mono text-xs text-foreground/80 hover:underline">{t("commercial", "Commercial")}</a>
            </li>
            <li>
              <a href="/institutional" className="font-mono text-xs text-foreground/80 hover:underline">{t("institutional", "Institutional")}</a>
            </li>
            <li>
              <a href="/public-sector" className="font-mono text-xs text-foreground/80 hover:underline">{t("publicSector", "Public Sector")}</a>
            </li>
          </ul>
        </div>

        {/* Events */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">{t("events", "Events")}</h4>
          <ul className="space-y-2">
            <li>
              <a href="/webinars" className="font-mono text-xs text-foreground/80 hover:underline">Webinars</a>
            </li>
            <li>
              <a href="/training" className="font-mono text-xs text-foreground/80 hover:underline">Training</a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Contact</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="mailto:info@buildsync.com"
                className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors duration-200"
              >
                Email
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/company/buildings-com/"
                className="font-mono text-xs text-foreground/80 hover:text-accent transition-colors duration-200"
                target="_blank" rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>

        {/* Trust */}
        <div className="col-span-1">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Trust</h4>
          <ul className="space-y-2">
            <li>
              <a href="/privacy-policy" className="font-mono text-xs text-foreground/80 hover:underline">Privacy Policy</a>
            </li>
            <li>
              <a href="/security" className="font-mono text-xs text-foreground/80 hover:underline">Security</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright */}
      <div
        ref={footerRef}
        className="mt-24 pt-8 border-t border-border/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          © 2026 BuildSync. All rights reserved.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">Privacy-first facility management. Built for the built environment.</p>
      </div>
    </section>
  )
}
