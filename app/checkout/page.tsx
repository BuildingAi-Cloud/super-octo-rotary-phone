"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import Link from "next/link"
import { Checkout } from "@/components/checkout"
import { getProductById, formatBillingSuffix, getUnitPriceInCents, type BillingInterval } from "@/lib/products"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { resolveStarterPlan } from "@/lib/rollout"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const productId = resolveStarterPlan(searchParams.get("plan"))
  const [billingInterval, setBillingInterval] = useState<BillingInterval>((searchParams.get("interval") as BillingInterval) || "monthly")
  const [units, setUnits] = useState<number>(parseInt(searchParams.get("units") || "50", 10))
  
  const product = getProductById(productId)

  if (!product || product.priceInCents === 0) {
    return (
      <div className="text-center">
        <h1 className="font-[var(--font-bebas)] text-4xl tracking-tight mb-4">CONTACT SALES</h1>
        <p className="font-mono text-sm text-muted-foreground mb-8">
          Enterprise plans require custom pricing. Please contact our sales team.
        </p>
        <Link
          href="mailto:sales@buildsync.com"
          className="inline-flex items-center gap-2 border border-accent bg-accent/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-accent-foreground transition-all"
        >
          Contact Sales
          <BitmapChevron />
        </Link>
      </div>
    )
  }

  const safeUnits = Number.isFinite(units) ? Math.max(10, Math.min(1000, units)) : 50
  const unitPriceInCents = getUnitPriceInCents(product, billingInterval)
  const totalPrice = (unitPriceInCents * safeUnits) / 100
  const approxMonthly = billingInterval === "yearly" ? totalPrice / 12 : totalPrice
  const billingLabel = billingInterval === "yearly" ? "Yearly Total" : "Monthly Total"
  const unitSuffix = formatBillingSuffix(billingInterval)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="border border-border/40 bg-card/30 p-6">
          <h2 className="font-[var(--font-bebas)] text-2xl tracking-wide mb-6">ORDER SUMMARY</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-sm text-foreground">{product.name} Plan</p>
                <p className="font-mono text-[10px] text-muted-foreground">{product.description}</p>
              </div>
              <p className="font-mono text-sm text-foreground">
                ${(unitPriceInCents / 100).toFixed(2)}{unitSuffix}
              </p>
            </div>

            <div className="border-t border-border/30 pt-4">
              <p className="font-mono text-xs text-muted-foreground mb-2">Billing Cycle</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBillingInterval("monthly")}
                  className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border rounded transition-colors ${billingInterval === "monthly" ? "border-accent text-accent bg-accent/10" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval("yearly")}
                  className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border rounded transition-colors ${billingInterval === "yearly" ? "border-accent text-accent bg-accent/10" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
                >
                  Yearly
                </button>
                {billingInterval === "yearly" && (
                  <span className="font-mono text-[10px] text-green-500">15% savings</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t border-border/30 pt-4">
              <p className="font-mono text-xs text-muted-foreground">Units</p>
              <input
                type="number"
                min={10}
                max={1000}
                value={safeUnits}
                onChange={(e) => setUnits(parseInt(e.target.value || "50", 10))}
                className="w-24 border border-border/40 bg-background rounded px-2 py-1 font-mono text-sm text-right"
              />
            </div>
            
            <div className="flex justify-between items-center border-t border-border/30 pt-4">
              <p className="font-mono text-xs text-foreground uppercase tracking-widest">{billingLabel}</p>
              <p className="font-[var(--font-bebas)] text-2xl text-accent">${totalPrice.toFixed(2)}</p>
            </div>
            {billingInterval === "yearly" && (
              <div className="flex justify-between items-center border-t border-border/30 pt-3">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Effective Monthly</p>
                <p className="font-mono text-sm text-green-500">${approxMonthly.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="border-t border-border/30 pt-6">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Included Features
            </h3>
            <ul className="space-y-2">
              {product.features.slice(0, 5).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 bg-accent flex-shrink-0" />
                  <span className="font-mono text-[11px] text-foreground/70">{feature}</span>
                </li>
              ))}
              {product.features.length > 5 && (
                <li className="font-mono text-[11px] text-muted-foreground">
                  + {product.features.length - 5} more features
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Stripe Checkout */}
        <div className="border border-border/40 bg-card/30 p-6">
          <h2 className="font-[var(--font-bebas)] text-2xl tracking-wide mb-6">PAYMENT</h2>
          <Checkout productId={productId} interval={billingInterval} units={safeUnits} />
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6">
      <AnimatedNoise opacity={0.03} />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <span className="font-[var(--font-bebas)] text-2xl tracking-wider text-foreground hover:text-accent transition-colors">
              BUILDSYNC
            </span>
          </Link>
          <h1 className="font-[var(--font-bebas)] text-4xl md:text-5xl tracking-tight">CHECKOUT</h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            Complete your subscription to get started
          </p>
        </div>

        <Suspense fallback={
          <div className="text-center">
            <p className="font-mono text-sm text-muted-foreground">Loading checkout...</p>
          </div>
        }>
          <CheckoutContent />
        </Suspense>

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <BitmapChevron className="rotate-180" />
            <span>Back to Pricing</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
