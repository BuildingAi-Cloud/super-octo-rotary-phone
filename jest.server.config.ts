import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.server.setup.ts'],
  moduleNameMapper: {
    '^server-only$': '<rootDir>/tests/mocks/server-only.ts',
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
