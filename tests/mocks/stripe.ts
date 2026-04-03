// Stripe mock — use jest.mock('@/lib/stripe', () => require('tests/mocks/stripe'))
// or import these helpers directly in test files.

import { jest } from '@jest/globals'

export const mockStripeInstance = {
  checkout: {
    sessions: {
      create: jest.fn<() => Promise<{ id: string; client_secret: string }>>(async () => ({
        id: 'cs_test_123',
        client_secret: 'secret_test',
      })),
    },
  },
}

export function resetStripeMocks() {
  mockStripeInstance.checkout.sessions.create.mockClear()
}
