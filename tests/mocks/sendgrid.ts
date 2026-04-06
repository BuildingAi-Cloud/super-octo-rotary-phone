// SendGrid / nodemailer mock
// Use jest.mock('@/lib/sendgrid', () => require('tests/mocks/sendgrid'))

import { jest } from '@jest/globals'

export const mockSendEmail = jest.fn<() => Promise<{ messageId: string }>>(async () => ({
  messageId: 'mock-msg-id',
}))

export function resetSendgridMocks() {
  mockSendEmail.mockClear()
}
