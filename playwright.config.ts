import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  retries: process.env.CI ? 1 : 0,
  globalSetup: './tests/setup/playwright.setup.ts',
  reporter: [
    ['html', { open: 'never' }],
  ],
})
