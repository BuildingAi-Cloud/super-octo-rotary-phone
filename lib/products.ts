export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  period: string
  features: string[]
  highlight: boolean
}

// This is the source of truth for all products.
// All UI to display products should pull from this array.
// IDs passed to the checkout session should be the same as IDs from this array.
export const PRODUCTS: Product[] = [
  {
    id: "essential",
    name: "Essential",
    description: "For small buildings and HOAs",
    priceInCents: 250, // $2.50 per unit/month
    period: "/unit/month",
    features: [
      "Resident portal & mobile app",
      "Amenity booking system",
      "Maintenance request tracking",
      "Community announcements",
      "Package notifications",
      "Email & chat support",
    ],
    highlight: false,
  },
  {
    id: "professional",
    name: "Professional",
    description: "For property management companies",
    priceInCents: 450, // $4.50 per unit/month
    period: "/unit/month",
    features: [
      "Everything in Essential",
      "AI package tracking (ImageR)",
      "Visitor & contractor management",
      "Digital shift logs",
      "SMS & voice broadcasting",
      "Accounting integrations",
      "Aware IoT sensor support",
      "Priority support",
    ],
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large-scale portfolios",
    priceInCents: 0, // Custom pricing
    period: "",
    features: [
      "Everything in Professional",
      "KeyLink biometric key management",
      "E-voting & governance tools",
      "Custom API integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "On-premise deployment option",
      "Tailored onboarding & training",
    ],
    highlight: false,
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id)
}

export function formatPrice(priceInCents: number): string {
  if (priceInCents === 0) return "Custom"
  return `$${(priceInCents / 100).toFixed(2)}`
}
