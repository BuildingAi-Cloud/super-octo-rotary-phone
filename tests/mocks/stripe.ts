// Stripe mock — use jest.mock('@/lib/stripe', () => require('tests/mocks/stripe'))
// or import these helpers directly in test files.

export const mockStripeInstance = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({ id: 'cs_test_123', client_secret: 'secret_test' }),
    },
  },
}

export function resetStripeMocks() {
  mockStripeInstance.checkout.sessions.create.mockClear()
}
