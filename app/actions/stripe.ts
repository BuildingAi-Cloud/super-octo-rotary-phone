'use server'

import { stripe } from '../../lib/stripe'
import { PRODUCTS, type BillingInterval, getUnitPriceInCents } from '../../lib/products'

export async function startCheckoutSession(productId: string, interval: BillingInterval = 'monthly', units = 50) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  if (product.priceInCents === 0) {
    throw new Error('Enterprise plans require custom pricing. Please contact sales.')
  }

  const safeUnits = Number.isFinite(units) ? Math.max(10, Math.min(1000, Math.floor(units))) : 50
  const recurringInterval = interval === 'yearly' ? 'year' : 'month'
  const unitAmount = getUnitPriceInCents(product, interval)

  // Create Checkout Sessions for subscription
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `BuildSync ${product.name} Plan`,
            description: `${product.description} (${interval})`,
          },
          unit_amount: unitAmount,
          recurring: {
            interval: recurringInterval,
          },
        },
        quantity: safeUnits,
        adjustable_quantity: {
          enabled: true,
          minimum: 10,
          maximum: 1000,
        },
      },
    ],
    mode: 'subscription',
  } as any)

  return session.client_secret
}
