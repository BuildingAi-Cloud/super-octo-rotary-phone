"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { SplitFlapText, SplitFlapMuteToggle, SplitFlapAudioProvider } from "@/components/split-flap-text"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        y: -100,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="hero" className="relative min-h-[calc(100svh-5rem)] max-w-screen-xl mx-auto flex items-center justify-start px-3 md:px-6 pt-8 md:pt-10 pb-16 md:pb-20">
      <AnimatedNoise opacity={0.03} />

      {/* Left vertical labels */}
      <div className="hidden lg:block absolute left-3 xl:left-5 top-1/2 -translate-y-1/2">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
          SECURE
        </span>
      </div>

      {/* Main content aligned to the same horizontal gutter as header. */}
      <div ref={contentRef} className="w-full max-w-[920px] text-left lg:pl-16 xl:pl-24">
        <SplitFlapAudioProvider>
          <div className="relative mb-10 md:mb-12">
            <SplitFlapText text="BUILDSYNC" speed={80} />
            <div className="mt-6 flex justify-start">
              <SplitFlapMuteToggle />
            </div>
          </div>
        </SplitFlapAudioProvider>

        <h2 className="font-[var(--font-bebas)] text-muted-foreground/90 text-[clamp(2rem,4vw,3.25rem)] tracking-wide leading-[1.06]">
          Intelligent Facility Management
        </h2>

        <p className="mt-7 md:mt-8 font-mono text-sm md:text-base text-muted-foreground leading-8 max-w-[640px]">
          The trusted platform for facility managers, building owners, and property managers. Privacy-first security, operational excellence, and smart building automation.
        </p>

        {/* CTA Section - Improved layout */}
        <div className="mt-8 md:mt-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-3 md:gap-4">
            <motion.a
              href="#solutions"
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 border border-foreground/30 px-7 md:px-9 py-3 md:py-3.5 font-mono text-xs md:text-sm uppercase tracking-wider text-foreground/90 hover:text-foreground hover:bg-foreground/5 hover:border-foreground/60 transition-all duration-300 rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ScrambleTextOnHover text="Explore Solutions" as="span" duration={0.6} />
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45 w-4 h-4" />
            </motion.a>
            <motion.a
              href="#insights"
              className="w-full sm:w-auto font-mono text-xs md:text-sm uppercase tracking-wider text-muted-foreground/70 hover:text-foreground transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
            >
              Latest Insights →
            </motion.a>
          </div>
        </div>
      </div>

      {/* Floating info tag - repositioned */}
      <div className="hidden lg:block absolute bottom-8 right-8">
        <div className="border border-border/50 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground bg-background/40 backdrop-blur-sm rounded-sm">
          ISO 27001 / SOC 2 Program
        </div>
      </div>
    </section>
  )
}
