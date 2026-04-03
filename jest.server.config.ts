import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup/jest.server.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
  ],
}

export default config
