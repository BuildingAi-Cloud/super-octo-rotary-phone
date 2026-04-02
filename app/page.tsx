import { SideNav } from "@/components/side-nav"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { SignalsSection } from "@/components/signals-section"
import { WorkSection } from "@/components/work-section"
import { PrinciplesSection } from "@/components/principles-section"
import { PricingSection } from "@/components/pricing-section"
import { ColophonSection } from "@/components/colophon-section"
import { DynamicGridBg } from "@/components/dynamic-grid-bg"
import { HomePageWrapper } from "@/components/home-page-wrapper"

export default function Page() {
  return (
    <HomePageWrapper>
      <main className="relative min-h-screen pt-16 md:pt-20">
        <Header />
        <SideNav />
        {/* Dynamic grid background that shifts position on scroll, creating an engaging parallax effect. */}
        <DynamicGridBg opacity={0.2} speed={0.5} />
        <div className="relative z-10 w-full">
          <HeroSection />
          <SignalsSection />
          <WorkSection />
          <PrinciplesSection />
          <PricingSection />
          <ColophonSection />
        </div>
      </main>
    </HomePageWrapper>
  )
}
