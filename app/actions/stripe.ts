'use server'

import { stripe } from '../../lib/stripe'
import { PRODUCTS } from '../../lib/products'

export async function startCheckoutSession(productId: string) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  if (product.priceInCents === 0) {
    throw new Error('Enterprise plans require custom pricing. Please contact sales.')
  }

  // Create Checkout Sessions for subscription
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `BuildSync ${product.name} Plan`,
            description: product.description,
          },
          unit_amount: product.priceInCents,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 50, // Default to 50 units
        adjustable_quantity: {
          enabled: true,
          minimum: 10,
          maximum: 1000,
        },
      },
    ],
    mode: 'subscription',
  })

  return session.client_secret
}
