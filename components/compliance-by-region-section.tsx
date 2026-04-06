"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type RegionCompliance = {
  region: string
  frameworks: string[]
  controls: string[]
  residency: string
  transfer: string
}

type RegionKey = "North America" | "Europe" | "United Kingdom" | "APAC"

const regionMatrix: RegionCompliance[] = [
  {
    region: "North America",
    frameworks: ["CCPA/CPRA readiness", "PIPEDA readiness", "SOC 2 Type II program"],
    controls: ["Audit trails", "Role-based access", "Encryption at rest and in transit"],
    residency: "Regional deployment options (US and Canada)",
    transfer: "Contractual safeguards for cross-border transfers",
  },
  {
    region: "Europe",
    frameworks: ["GDPR readiness", "ISO 27001 program", "DPA support"],
    controls: ["Data minimization workflows", "Access logging", "Retention controls"],
    residency: "EU-region data hosting options",
    transfer: "SCC-aligned contractual terms for third-country transfers",
  },
  {
    region: "United Kingdom",
    frameworks: ["UK GDPR readiness", "DPA 2018 alignment", "ISO 27001 program"],
    controls: ["Purpose limitation controls", "Fine-grained permissions", "Export and deletion tooling"],
    residency: "UK/EU hosting model support",
    transfer: "UK addendum / contractual transfer terms",
  },
  {
    region: "APAC",
    frameworks: ["PDPA readiness", "Australian Privacy Act readiness", "ISO 27001 program"],
    controls: ["Tenant-aware access boundaries", "Incident response workflows", "Continuous monitoring"],
    residency: "Regional hosting strategy by deployment model",
    transfer: "Customer-approved transfer controls by tenant",
  },
]

const regionOptions: RegionKey[] = ["North America", "Europe", "United Kingdom", "APAC"]
const REGION_STORAGE_KEY = "buildsync.compliance.region"
const COUNTRY_STORAGE_KEY = "buildsync.compliance.country"

const countryOptionsByRegion: Record<RegionKey, string[]> = {
  "North America": ["United States", "Canada"],
  Europe: ["Germany", "France", "Spain", "Italy", "Netherlands", "Portugal", "Other EU Country"],
  "United Kingdom": ["United Kingdom"],
  APAC: ["Singapore", "Australia", "New Zealand", "Japan", "South Korea", "Other APAC Country"],
}

function isRegionKey(value: string): value is RegionKey {
  return regionOptions.includes(value as RegionKey)
}

function detectRegionFromBrowser(): RegionKey {
  const locale = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : ""
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.toLowerCase() ?? ""

  if (locale.includes("en-gb") || timeZone.includes("london")) {
    return "United Kingdom"
  }

  const isEurope =
    locale.includes("de") ||
    locale.includes("fr") ||
    locale.includes("es") ||
    locale.includes("it") ||
    locale.includes("nl") ||
    locale.includes("pt") ||
    timeZone.includes("europe/")
  if (isEurope) {
    return "Europe"
  }

  const isApac =
    locale.includes("en-au") ||
    locale.includes("en-nz") ||
    locale.includes("en-sg") ||
    locale.includes("zh") ||
    locale.includes("ja") ||
    locale.includes("ko") ||
    timeZone.includes("asia/") ||
    timeZone.includes("australia/")
  if (isApac) {
    return "APAC"
  }

  return "North America"
}

export function ComplianceByRegionSection() {
  const [activeRegion, setActiveRegion] = useState<RegionKey>("North America")
  const [selectedCountry, setSelectedCountry] = useState("")

  useEffect(() => {
    let initialRegion: RegionKey | null = null

    try {
      const storedRegion = window.localStorage.getItem(REGION_STORAGE_KEY)
      if (storedRegion && isRegionKey(storedRegion)) {
        initialRegion = storedRegion
      }
    } catch {
      // Ignore storage read errors and fallback to browser detection.
    }

    if (!initialRegion) {
      initialRegion = detectRegionFromBrowser()
    }

    setActiveRegion(initialRegion)

    try {
      const storedCountry = window.localStorage.getItem(COUNTRY_STORAGE_KEY)
      if (storedCountry && countryOptionsByRegion[initialRegion].includes(storedCountry)) {
        setSelectedCountry(storedCountry)
      }
    } catch {
      // Ignore storage read errors and keep country unselected.
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(REGION_STORAGE_KEY, activeRegion)
    } catch {
      // Ignore storage write errors (privacy mode / blocked storage).
    }
  }, [activeRegion])

  useEffect(() => {
    try {
      if (selectedCountry) {
        window.localStorage.setItem(COUNTRY_STORAGE_KEY, selectedCountry)
      } else {
        window.localStorage.removeItem(COUNTRY_STORAGE_KEY)
      }
    } catch {
      // Ignore storage write errors (privacy mode / blocked storage).
    }
  }, [selectedCountry])

  const selectedRegionData = useMemo(() => {
    return regionMatrix.find((item) => item.region === activeRegion)
  }, [activeRegion])

  const countryOptions = countryOptionsByRegion[activeRegion]
  const canShowComplianceDetails = Boolean(selectedCountry && countryOptions.includes(selectedCountry))

  const handleRegionChange = (value: RegionKey) => {
    setActiveRegion(value)
    setSelectedCountry("")
  }

  return (
    <section id="compliance-by-country" className="relative py-16 md:py-28 max-w-screen-xl mx-auto px-3 md:px-6">
      <div className="max-w-7xl mx-auto mb-12 md:mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">04 / Compliance By Country</span>
          <h2 className="mt-4 font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-7xl tracking-tight">REGIONAL TRUST MAP</h2>
          <p className="mt-4 max-w-2xl font-mono text-xs md:text-sm text-muted-foreground leading-relaxed">
            Compliance obligations vary by country. BuildSync maps privacy and security controls by jurisdiction so operators can
            activate the right safeguards for each portfolio.
          </p>
        </div>

        <Link
          href="/compliance"
          className="inline-flex items-center justify-center border border-accent/60 bg-accent/10 px-5 py-3 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200"
        >
          Open Compliance Center
        </Link>
      </div>

      <div className="max-w-7xl mx-auto mb-8 border border-border/50 bg-background/40 px-4 py-4 md:px-5 md:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground">
            Compliance details appear only after you choose both region and country.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Region</span>
              <select
                value={activeRegion}
                onChange={(e) => handleRegionChange(e.target.value as RegionKey)}
                className="border border-border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-accent"
                aria-label="Select region"
              >
                {regionOptions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Country</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="border border-border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-accent"
                aria-label="Select country"
              >
                <option value="">Select country</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {canShowComplianceDetails && selectedRegionData ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-5 md:gap-6">
          <article
            key={selectedRegionData.region}
            className="border border-accent/70 ring-1 ring-accent/40 bg-background/40 backdrop-blur-sm p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-[var(--font-bebas)] text-2xl md:text-4xl tracking-tight">{selectedRegionData.region}</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">PRIMARY</span>
            </div>

            <p className="mt-2 font-mono text-xs text-muted-foreground">Selected country: {selectedCountry}</p>

            <div className="mt-5">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent mb-2">Framework Focus</h4>
              <ul className="space-y-1.5">
                {selectedRegionData.frameworks.map((framework) => (
                  <li key={framework} className="font-mono text-xs text-foreground/90">
                    {framework}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent mb-2">Control Highlights</h4>
              <ul className="space-y-1.5">
                {selectedRegionData.controls.map((control) => (
                  <li key={control} className="font-mono text-xs text-foreground/80">
                    {control}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 border-t border-border/40 pt-4 grid grid-cols-1 gap-3">
              <p className="font-mono text-[11px] text-muted-foreground">
                <span className="text-foreground/90">Data Residency:</span> {selectedRegionData.residency}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                <span className="text-foreground/90">Transfer Model:</span> {selectedRegionData.transfer}
              </p>
            </div>
          </article>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto border border-dashed border-border/50 bg-background/20 p-6 md:p-8">
          <p className="font-mono text-xs md:text-sm text-muted-foreground">
            Compliance content is hidden until both selectors are set. Choose region and country to reveal applicable controls.
          </p>
        </div>
      )}

      {canShowComplianceDetails ? (
        <p className="max-w-7xl mx-auto mt-8 font-mono text-[11px] text-muted-foreground/90 leading-relaxed">
          Availability depends on selected deployment mode (SaaS or on-prem) and customer contract scope. Regulatory obligations
          remain shared between the customer and platform according to configured controls.
        </p>
      ) : null}
    </section>
  )
}
