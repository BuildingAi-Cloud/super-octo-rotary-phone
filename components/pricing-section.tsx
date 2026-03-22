"use client"


import { useRef, useEffect } from "react"
import Link from "next/link"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { BitmapChevron } from "@/components/bitmap-chevron"

const plans = [
  {
    name: "Essential",
    price: "$2.50",
    period: "/unit/month",
    description: "For small buildings and HOAs",
    features: [
      "Resident portal & mobile app",
      "Amenity booking system",
      "Maintenance request tracking",
      "Community announcements",
      "Package notifications",
      "Email & chat support",
    ],
    highlight: false,
    cta: "Subscribe Now",
  },
  {
    name: "Professional",
    price: "$4.50",
    period: "/unit/month",
    description: "For property management companies",
    features: [
      "Everything in Essential",
      "AI package tracking (ImageR)",
      "Visitor & contractor management",
      "Digital shift logs",
      "SMS & voice broadcasting",
      "Accounting integrations",
      "Aware IoT sensor support",
      "Priority support",
    ],
    highlight: true,
    cta: "Subscribe Now",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale portfolios",
    features: [
      "Everything in Professional",
      "KeyLink biometric key management",
      "E-voting & governance tools",
      "Custom API integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "On-premise deployment option",
      "Tailored onboarding & training",
    ],
    highlight: false,
    cta: "Contact Sales",
  },
]

// Collect all unique features for table rows
const allFeatures = Array.from(
  new Set(
    plans.flatMap((plan) => plan.features.map((f) => f.replace(/^Everything in .*/, "All previous features")))
  )
)

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return;
    // Animation logic here (commented out for now)
    // const ctx = gsap.context(() => {
    //   gsap.from(headerRef.current, { ... });
    // }, sectionRef);
  }, []);

  return (
    <section ref={sectionRef}>
      <div ref={headerRef}>Pricing Section Placeholder</div>
      {/* TODO: Restore original pricing cards and UI */}
    </section>
  );
}

