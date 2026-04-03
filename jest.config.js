export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/super-octo-rotary-phone/'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/super-octo-rotary-phone/'],
  watchPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/super-octo-rotary-phone/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/'
  ],
}
