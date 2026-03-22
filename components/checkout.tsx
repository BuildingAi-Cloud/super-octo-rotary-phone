'use client'

import { useCallback } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'



const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export function Checkout({ productId }: { productId: string }) {
  // Fetch clientSecret from API route
  const startCheckoutSessionForProduct = useCallback(async () => {
    const res = await fetch('/api/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    return data.clientSecret;
  }, [productId]);

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret: startCheckoutSessionForProduct }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
    export function Checkout() {
      return (
        <div id="checkout" className="text-center">
          <div className="font-mono text-sm text-muted-foreground mb-4">
            Payments are currently disabled. You can skip payment and continue using the app.
          </div>
        </div>
      );
    }
