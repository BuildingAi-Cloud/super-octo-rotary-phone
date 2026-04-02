"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const signals = [
  {
    date: "New",
    title: "ImageR AI Package Tracking",
    note: "Automatically scan and log packages with AI-powered image recognition. Reduce manual entry by 90%.",
    detail: "ImageR captures label data, matches parcels to units, and pushes instant resident notifications without front-desk double entry.",
    points: ["AI-assisted label capture", "Resident notification automation", "Audit-ready package history"],
  },
  {
    date: "Popular",
    title: "Mobile Resident App",
    note: "Book amenities, submit maintenance requests, and stay connected with your community from anywhere.",
    detail: "The resident app centralizes requests, approvals, and community updates in a single mobile workflow that reduces office friction.",
    points: ["Amenity booking flows", "Maintenance request tracking", "Community broadcast feed"],
  },
  {
    date: "Security",
    title: "KeyLink Biometric Access",
    note: "Secure key management with fingerprint authentication, smart tags, and complete audit trails.",
    detail: "Biometric validation ties each key handoff to a verified staff member, reducing lost inventory and disputed access events.",
    points: ["Fingerprint-verified pickup", "Smart key tagging", "Full access audit trail"],
  },
  {
    date: "IoT",
    title: "Aware Sensor Network",
    note: "Real-time monitoring for water leaks, HVAC issues, and equipment failures with instant alerts.",
    detail: "Sensor events escalate into building workflows so teams can respond faster to leaks, downtime, and abnormal performance trends.",
    points: ["Leak and equipment alerts", "HVAC anomaly detection", "Live escalation workflows"],
  },
  {
    date: "Governance",
    title: "E-Voting & Virtual AGMs",
    note: "Run board elections and annual general meetings digitally with secure, verifiable voting.",
    detail: "Board members can issue agendas, collect secure ballots, and publish results with an audit trail that survives meeting turnover.",
    points: ["Secure digital ballots", "Virtual meeting participation", "Verifiable result logs"],
  },
]

export function SignalsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  // Drag-to-scroll state
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragScrollLeft = useRef(0)
  const dragDistance = useRef(0)

  const updateScrollState = useCallback(() => {
    const el = cardsRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const current = el.scrollLeft
    setScrollProgress(max > 0 ? current / max : 0)
    setCanScrollLeft(current > 4)
    setCanScrollRight(current < max - 4)
  }, [])

  const scrollBy = (dir: 1 | -1) => {
    const el = cardsRef.current
    if (!el) return
    el.scrollBy({ left: dir * 360, behavior: "smooth" })
  }

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    const el = cardsRef.current
    if (!el) return
    isDragging.current = true
    dragDistance.current = 0
    dragStartX.current = e.pageX - el.offsetLeft
    dragScrollLeft.current = el.scrollLeft
    el.style.cursor = "grabbing"
    el.style.userSelect = "none"
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !cardsRef.current) return
    const el = cardsRef.current
    const x = e.pageX - el.offsetLeft
    const delta = x - dragStartX.current
    dragDistance.current = Math.max(dragDistance.current, Math.abs(delta))
    el.scrollLeft = dragScrollLeft.current - delta * 1.2
  }
  const onMouseUp = () => {
    isDragging.current = false
    if (cardsRef.current) {
      cardsRef.current.style.cursor = "grab"
      cardsRef.current.style.userSelect = ""
    }
  }

  useEffect(() => {
    const el = cardsRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener("scroll", updateScrollState, { passive: true })
    window.addEventListener("resize", updateScrollState)
    return () => {
      el.removeEventListener("scroll", updateScrollState)
      window.removeEventListener("resize", updateScrollState)
    }
  }, [updateScrollState])

  useEffect(() => {
    if (!sectionRef.current || !cursorRef.current) return

    const section = sectionRef.current
    const cursor = cursorRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      gsap.to(cursor, {
        x: x,
        y: y,
        duration: 0.5,
        ease: "power3.out",
      })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    section.addEventListener("mousemove", handleMouseMove)
    section.addEventListener("mouseenter", handleMouseEnter)
    section.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      section.removeEventListener("mousemove", handleMouseMove)
      section.removeEventListener("mouseenter", handleMouseEnter)
      section.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !cardsRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in from left
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
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )

      const cards = cardsRef.current?.querySelectorAll("article")
      if (cards) {
        gsap.fromTo(
          cards,
          { x: -100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="insights" ref={sectionRef} className="relative py-16 md:py-28 max-w-screen-xl mx-auto px-3 md:px-6 overflow-hidden">
      <div
        ref={cursorRef}
        className={cn(
          "pointer-events-none absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-50",
          "w-12 h-12 rounded-full border-2 border-accent bg-accent",
          "transition-opacity duration-300",
          isHovering ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Section header + nav controls */}
      <div ref={headerRef} className="max-w-7xl mx-auto mb-12 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / Features</span>
          <h2 className="mt-4 font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-7xl tracking-tight">PRODUCT HIGHLIGHTS</h2>
        </div>

        {/* Arrow nav buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={cn(
              "w-10 h-10 border border-border/60 flex items-center justify-center font-mono text-sm transition-all duration-200 rounded",
              canScrollLeft
                ? "text-foreground hover:border-accent hover:text-accent cursor-pointer"
                : "text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={cn(
              "w-10 h-10 border border-border/60 flex items-center justify-center font-mono text-sm transition-all duration-200 rounded",
              canScrollRight
                ? "text-foreground hover:border-accent hover:text-accent cursor-pointer"
                : "text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            →
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 pr-6 md:pr-12 h-px bg-border/30 relative">
        <div
          className="absolute top-0 left-0 h-px bg-accent transition-all duration-150"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Drag hint */}
      <p className="mb-4 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest select-none">
        <span className="md:hidden">Swipe to explore</span>
        <span className="hidden md:inline">Drag or use arrows to explore</span>
      </p>

      {/* Horizontal scroll container */}
      <div
        ref={(el) => {
          scrollRef.current = el
          cardsRef.current = el
        }}
        className="flex gap-8 overflow-x-auto pb-8 pr-12 select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", cursor: "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {signals.map((signal, index) => (
          <SignalCard
            key={index}
            signal={signal}
            index={index}
            isExpanded={expandedIndex === index}
            onToggle={() => {
              if (dragDistance.current > 8) return
              setExpandedIndex((current) => (current === index ? null : index))
            }}
          />
        ))}
      </div>

      {/* Mobile dot indicators */}
      <div className="mt-4 flex md:hidden items-center gap-2 pr-6">
        {signals.map((_, i) => {
          const segmentSize = 1 / signals.length
          const active = scrollProgress >= i * segmentSize - 0.05 && scrollProgress < (i + 1) * segmentSize + 0.05
          return (
            <button
              key={i}
              type="button"
              aria-label={`Go to card ${i + 1}`}
              onClick={() => {
                const el = cardsRef.current
                if (!el) return
                const card = el.querySelectorAll("article")[i] as HTMLElement
                card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
              }}
              className={cn(
                "h-px transition-all duration-300",
                active ? "w-6 bg-accent" : "w-3 bg-border/50"
              )}
            />
          )
        })}
      </div>
    </section>
  )
}

function SignalCard({
  signal,
  index,
  isExpanded,
  onToggle,
}: {
  signal: { date: string; title: string; note: string; detail: string; points: string[] }
  index: number
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <article
      className={cn(
        "group relative flex-shrink-0 w-[21rem] md:w-80",
        "transition-all duration-500 ease-out",
        isExpanded ? "-translate-y-1" : "hover:-translate-y-2",
      )}
    >
      {/* Card with paper texture effect */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={cn(
          "relative w-full text-left bg-card border border-border/50 md:border-t md:border-l md:border-r-0 md:border-b-0 p-8",
          "transition-colors duration-300",
          isExpanded ? "border-accent/50 bg-accent/5" : "hover:border-accent/30"
        )}
      >
        {/* Top torn edge effect */}
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

        {/* Issue number - editorial style */}
        <div className="flex items-baseline justify-between mb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            No. {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-3">
            <time className="font-mono text-[10px] text-muted-foreground/60">{signal.date}</time>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
              {isExpanded ? "Close" : "Open"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-[var(--font-bebas)] text-4xl tracking-tight mb-4 group-hover:text-accent transition-colors duration-300">
          {signal.title}
        </h3>

        {/* Divider line */}
        <div className={cn("h-px bg-accent/60 mb-6 transition-all duration-500", isExpanded ? "w-full" : "w-12 group-hover:w-full")} />

        {/* Description */}
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">{signal.note}</p>

        <div
          className={cn(
            "grid transition-all duration-500 ease-out",
            isExpanded ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0 mt-0"
          )}
        >
          <div className="overflow-hidden">
            <p className="font-mono text-xs leading-relaxed text-foreground/85">{signal.detail}</p>
            <ul className="mt-5 space-y-2">
              {signal.points.map((point) => (
                <li key={point} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="h-px w-4 bg-accent/70" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom right corner fold effect */}
        <div className="absolute bottom-0 right-0 w-6 h-6 overflow-hidden">
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-background rotate-45 translate-x-4 translate-y-4 border-t border-l border-border/30" />
        </div>
      </button>

      {/* Shadow/depth layer */}
      <div className={cn(
        "absolute inset-0 -z-10 translate-x-1 translate-y-1 bg-accent/5 transition-opacity duration-300",
        isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )} />
    </article>
  )
}
