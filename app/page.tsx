import { SideNav } from "@/components/side-nav"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { SignalsSection } from "@/components/signals-section"
import { WorkSection } from "@/components/work-section"
import { PrinciplesSection } from "@/components/principles-section"
import { ComplianceByRegionSection } from "@/components/compliance-by-region-section"
import { PricingSection } from "@/components/pricing-section"
import { ColophonSection } from "@/components/colophon-section"
import { HomePageWrapper } from "@/components/home-page-wrapper"

export default function Page() {
  return (
    <HomePageWrapper>
      <main className="relative min-h-screen pt-16 md:pt-20">
        <Header />
        <SideNav />
        <div className="relative z-10 w-full">
          <HeroSection />
          <SignalsSection />
          <WorkSection />
          <PrinciplesSection />
          <ComplianceByRegionSection />
          <PricingSection />
          <ColophonSection />
        </div>
      </main>
    </HomePageWrapper>
  )
}
