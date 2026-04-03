// SendGrid / nodemailer mock
// Use jest.mock('@/lib/sendgrid', () => require('tests/mocks/sendgrid'))

export const mockSendEmail = jest.fn().mockResolvedValue({ messageId: 'mock-msg-id' })

export function resetSendgridMocks() {
  mockSendEmail.mockClear()
}
