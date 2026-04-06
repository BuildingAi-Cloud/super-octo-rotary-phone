"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const principles = [
  {
    number: "01",
    title: "Operational Excellence",
    summary: "Reduce reactive work with clear maintenance and automation workflows.",
    points: ["Preventive maintenance programs", "Energy and automation optimization"],
  },
  {
    number: "02",
    title: "Security and Privacy",
    summary: "Protect people, assets, and data with layered controls.",
    points: ["Access control and auditability", "Encryption and incident response"],
  },
  {
    number: "03",
    title: "Sustainable Buildings",
    summary: "Track efficiency and support sustainability targets across facilities.",
    points: ["Carbon and utility visibility", "LEED and green standards support"],
  },
  {
    number: "04",
    title: "Smart Modernization",
    summary: "Modernize legacy buildings with connected systems and phased rollout.",
    points: ["IoT and PropTech integration", "Portfolio-wide modernization playbooks"],
  },
]
export function PrinciplesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const principlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !principlesRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in
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

      // Cards slide in with stagger for quick-scan reveal.
      const articles = principlesRef.current?.querySelectorAll("article")
      articles?.forEach((article, index) => {
        gsap.from(article, {
          y: 24,
          opacity: 0,
          duration: 0.6,
          delay: index * 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: article,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="principles" className="relative py-14 md:py-20 max-w-screen-xl mx-auto px-3 md:px-6">
      {/* Section header */}
      <div ref={headerRef} className="max-w-7xl mx-auto mb-8 md:mb-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">03 / Pillars</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-7xl tracking-tight">CORE PILLARS</h2>
        <p className="mt-3 max-w-2xl font-mono text-xs md:text-sm text-muted-foreground leading-relaxed">
          Quick-scan foundations that guide operations, security, sustainability, and modernization.
        </p>
      </div>

      {/* Compact principle cards to reduce scroll depth. */}
      <div ref={principlesRef} className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {principles.map((principle, index) => (
          <article
            key={index}
            className="border border-border/50 bg-background/40 backdrop-blur-sm p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-[var(--font-bebas)] text-2xl md:text-4xl tracking-tight leading-none">{principle.title}</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">{principle.number}</span>
            </div>

            <p className="mt-3 font-mono text-xs md:text-sm text-muted-foreground leading-relaxed">{principle.summary}</p>

            <ul className="mt-4 space-y-2">
              {principle.points.map((point) => (
                <li key={point} className="font-mono text-xs text-foreground/85">
                  • {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
