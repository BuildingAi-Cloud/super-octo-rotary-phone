// Product test fixtures
import type { Product } from '@/lib/products'

export const sampleProduct: Product = {
  id: 'essential',
  name: 'Essential',
  description: 'For small buildings and HOAs',
  priceInCents: 250,
  period: '/unit/month',
  features: ['Resident portal & mobile app', 'Amenity booking system'],
  highlight: false,
}

export const sampleFreeProduct: Product = {
  id: 'enterprise',
  name: 'Enterprise',
  description: 'For large-scale portfolios',
  priceInCents: 0,
  period: '',
  features: ['Everything in Professional', 'Custom API integrations'],
  highlight: false,
}
