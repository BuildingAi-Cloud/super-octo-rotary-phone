export default {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/tests/setup/jest.server.setup.ts'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/super-octo-rotary-phone/'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/super-octo-rotary-phone/'],
  watchPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/super-octo-rotary-phone/'],
  moduleNameMapper: {
    '^server-only$': '<rootDir>/tests/mocks/server-only.ts',
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/'
  ],
}
