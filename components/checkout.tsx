'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

export function Checkout({
  productId,
  interval,
  units,
}: {
  productId: string
  interval: 'monthly' | 'yearly'
  units: number
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const stripeEnabled = useMemo(
    () => process.env.NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT === 'true' && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    [],
  )

  // Fetch clientSecret from API route
  const startCheckoutSessionForProduct = useCallback(async () => {
    const res = await fetch('/api/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, interval, units }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Unable to initialize checkout')
      throw new Error(data.error || 'Unable to initialize checkout')
    }
    return data.clientSecret;
  }, [productId, interval, units]);

  if (!stripeEnabled) {
    return (
      <div className="space-y-4">
        <p className="font-mono text-xs text-muted-foreground">
          Stripe checkout is currently disabled in this deployment. You can continue using the in-app subscription flow.
        </p>
        <button
          type="button"
          onClick={() => {
            const demoSession = `demo_${Date.now()}`
            router.push(`/checkout/return?session_id=${encodeURIComponent(demoSession)}&plan=${encodeURIComponent(productId)}&interval=${encodeURIComponent(interval)}&units=${units}`)
          }}
          className="w-full px-4 py-3 border border-accent bg-accent/10 text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Complete Subscription (Demo)
        </button>
      </div>
    )
  }

  if (error) {
    return <p className="font-mono text-xs text-red-500">{error}</p>
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret: startCheckoutSessionForProduct }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
