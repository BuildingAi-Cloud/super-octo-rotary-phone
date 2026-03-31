
import React from "react";
"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const solutions = [
  {
    id: "resident-portal",
    title: "Resident Portal",
    medium: "Experience",
    description: "Mobile app for amenity booking, announcements, parking permits, and community bulletin board for resident engagement.",
    span: "col-span-2 row-span-2",
    details: {
      tagline: "Empower residents with self-service tools",
      features: [
        "Amenity booking with real-time availability",
        "Push notifications for announcements",
        "Digital parking permits and visitor passes",
        "Community bulletin board and events",
        "Maintenance request submission and tracking",
        "Package pickup notifications",
      ],
      stats: [
        { value: "85%", label: "Resident adoption rate" },
        { value: "60%", label: "Reduction in front desk calls" },
        { value: "4.8", label: "App store rating" },
      ],
    },
  },
  {
    id: "maintenance-hub",
    title: "Maintenance Hub",
    medium: "Operations",
    description: "Centralized work orders, preventative maintenance scheduling, asset directories, and inventory tracking.",
    span: "col-span-1 row-span-1",
    details: {
      tagline: "Streamline your building operations",
      features: [
        "Automated work order routing",
        "Preventative maintenance scheduling",
        "Asset lifecycle management",
        "Vendor management portal",
        "Inventory tracking and reordering",
        "Mobile technician app",
      ],
      stats: [
        { value: "40%", label: "Faster resolution time" },
        { value: "30%", label: "Cost reduction" },
        { value: "99%", label: "On-time maintenance" },
      ],
    },
  },
  {
    id: "concierge-desk",
    title: "Concierge Desk",
    medium: "Front Desk",
    description: "AI-powered package tracking (ImageR), incident reporting, digital shift logs, and visitor management.",
    span: "col-span-1 row-span-2",
    details: {
      tagline: "Modernize your front desk operations",
      features: [
        "ImageR AI package scanning",
        "Digital visitor sign-in",
        "Incident reporting with photos",
        "Shift handoff notes",
        "Contractor check-in/out",
        "Delivery management",
      ],
      stats: [
        { value: "90%", label: "Package logging accuracy" },
        { value: "5min", label: "Average visitor check-in" },
        { value: "100%", label: "Digital shift coverage" },
      ],
    },
  },
  {
    id: "keylink",
    title: "KeyLink",
    medium: "Security",
    description: "Physical key management with biometric fingerprint scanners, smart tags, and complete audit trails.",
    span: "col-span-1 row-span-1",
    details: {
      tagline: "Secure, accountable key management",
      features: [
        "Biometric fingerprint authentication",
        "RFID smart key tags",
        "Real-time checkout tracking",
        "Automated return reminders",
        "Complete audit trail logging",
        "Role-based access control",
      ],
      stats: [
        { value: "0", label: "Lost keys reported" },
        { value: "100%", label: "Checkout accountability" },
        { value: "24/7", label: "Access logging" },
      ],
    },
  },
  {
    id: "aware-iot",
    title: "Aware IoT",
    medium: "Sensors",
    description: "Real-time monitoring for water leaks, mechanical malfunctions, and automated alerts to staff.",
    span: "col-span-2 row-span-1",
    details: {
      tagline: "Prevent problems before they happen",
      features: [
        "Water leak detection sensors",
        "HVAC performance monitoring",
        "Electrical system alerts",
        "Temperature and humidity tracking",
        "Automated staff notifications",
        "Historical trend analysis",
      ],
      stats: [
        { value: "95%", label: "Early detection rate" },
        { value: "$50K", label: "Avg. damage prevented" },
        { value: "15min", label: "Alert response time" },
      ],
    },
  },
  {
    id: "governance",
    title: "Governance",
    medium: "Board Tools",
    description: "Virtual meetings, e-voting solutions for board decisions, and AGM facilitation tools.",
    span: "col-span-1 row-span-1",
    details: {
      tagline: "Digitize your board operations",
      features: [
        "Secure e-voting platform",
        "Virtual AGM hosting",
        "Document sharing and signing",
        "Meeting scheduling and minutes",
        "Proxy vote management",
        "Compliance reporting",
      ],
      stats: [
        { value: "3x", label: "Voter participation" },
        { value: "80%", label: "Cost reduction vs. mail" },
        { value: "100%", label: "Vote verification" },
      ],
    },
  },
]

export function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [selectedSolution, setSelectedSolution] = useState<typeof solutions[0] | null>(null)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !gridRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      )

      const cards = gridRef.current?.querySelectorAll("article")
      if (cards && cards.length > 0) {
        gsap.set(cards, { y: 60, opacity: 0 })
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="solutions" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Section header */}
      <div ref={headerRef} className="mb-16 flex items-end justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">02 / Solutions</span>
          <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">CORE PLATFORMS</h2>
        </div>
        <p className="hidden md:block max-w-xs font-mono text-xs text-muted-foreground text-right leading-relaxed">
          Click any platform to explore features and capabilities.
        </p>
      </div>

      {/* Asymmetric grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[180px] md:auto-rows-[200px]"
      >
        {solutions.map((solution, index) => (
          <WorkCard 
            key={solution.id} 
            solution={solution} 
            index={index} 
            isSelected={selectedSolution?.id === solution.id}
            onClick={() => setSelectedSolution(selectedSolution?.id === solution.id ? null : solution)}
          />
        ))}
      </div>

      {/* Solution Detail Panel */}
      <SolutionDetailPanel 
        solution={selectedSolution} 
        onClose={() => setSelectedSolution(null)} 
      />
    </section>
  )
}

function WorkCard({
  solution,
  index,
  isSelected,
  onClick,
}: {
  solution: typeof solutions[0]
  index: number
  isSelected: boolean
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const [isScrollActive, setIsScrollActive] = useState(false)

  useEffect(() => {
    if (index !== 0 || !cardRef.current) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: "top 80%",
        onEnter: () => setIsScrollActive(true),
      })
    }, cardRef)

    return () => ctx.revert()
  }, [index])

  const isActive = isHovered || isScrollActive || isSelected

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative border border-border/40 p-5 flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden",
        solution.span,
        isActive && "border-accent/60",
        isSelected && "ring-2 ring-accent ring-offset-2 ring-offset-background",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background layer */}
      <div
        className={cn(
          "absolute inset-0 bg-accent/5 transition-opacity duration-500",
          isActive ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {solution.medium}
        </span>
        <h3
          className={cn(
            "mt-3 font-[var(--font-bebas)] text-2xl md:text-4xl tracking-tight transition-colors duration-300",
            isActive ? "text-accent" : "text-foreground",
          )}
        >
          {solution.title}
        </h3>
      </div>

      {/* Description - reveals on hover */}
      <div className="relative z-10">
        <p
          className={cn(
            "font-mono text-xs text-muted-foreground leading-relaxed transition-all duration-500 max-w-[280px]",
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          )}
        >
          {solution.description}
        </p>
      </div>

      {/* Click indicator */}
      <span
        className={cn(
          "absolute bottom-4 right-4 font-mono text-[10px] transition-colors duration-300",
          isSelected ? "text-accent" : isActive ? "text-accent/60" : "text-muted-foreground/40",
        )}
      >
        {isSelected ? "SELECTED" : `0${index + 1}`}
      </span>

      {/* Corner line */}
      <div
        className={cn(
          "absolute top-0 right-0 w-12 h-12 transition-all duration-500",
          isActive ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="absolute top-0 right-0 w-full h-[1px] bg-accent" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-accent" />
      </div>
    </article>
  )
}

function SolutionDetailPanel({ 
  solution, 
  onClose 
}: { 
  solution: typeof solutions[0] | null
  onClose: () => void 
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!panelRef.current) return

    if (solution) {
      gsap.fromTo(
        panelRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.5, ease: "power3.out" }
      )
    } else {
      gsap.to(panelRef.current, { height: 0, opacity: 0, duration: 0.3, ease: "power3.in" })
    }
  }, [solution])

  if (!solution) {
    return <div ref={panelRef} className="overflow-hidden" />
  }

  return (
    <div ref={panelRef} className="overflow-hidden">
      <div className="mt-12 border border-accent/30 bg-card/50 p-8 md:p-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
              {solution.medium}
            </span>
            <h3 className="mt-2 font-[var(--font-bebas)] text-4xl md:text-6xl tracking-tight text-accent">
              {solution.title}
            </h3>
            <p className="mt-4 font-mono text-sm text-muted-foreground max-w-xl">
              {solution.details.tagline}
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            Close
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Features */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Key Features
            </h4>
            <ul className="space-y-3">
              {solution.details.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-accent mt-1">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                    </svg>
                  </span>
                  <span className="font-mono text-sm text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Impact Metrics
            </h4>
            <div className="grid grid-cols-3 gap-6">
              {solution.details.stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="font-[var(--font-bebas)] text-4xl md:text-5xl text-accent">
                    {stat.value}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground">
            Ready to implement {solution.title} in your building?
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 border border-accent bg-accent/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          >
            Get Started
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
