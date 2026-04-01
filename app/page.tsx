import { SideNav } from "@/components/side-nav"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { SignalsSection } from "@/components/signals-section"
import { WorkSection } from "@/components/work-section"
import { PrinciplesSection } from "@/components/principles-section"
import { PricingSection } from "@/components/pricing-section"
import { ColophonSection } from "@/components/colophon-section"

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <Header />
      <SideNav />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
        <HeroSection />
        <SignalsSection />
        <WorkSection />
        <PrinciplesSection />
        <PricingSection />
        <ColophonSection />
      </div>
    </main>
  )
}
