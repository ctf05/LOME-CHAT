import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  ...(process.env['CI'] ? { workers: 1 } : {}),
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm --filter @lome-chat/web dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env['CI'],
    },
    {
      command: 'pnpm --filter @lome-chat/api dev',
      url: 'http://localhost:8787/health',
      reuseExistingServer: !process.env['CI'],
    },
  ],
  projects: [
    // Setup project authenticates as each persona and saves storage state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Browser projects use Alice's auth state by default
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/alice.json' },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: 'e2e/.auth/alice.json' },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: 'e2e/.auth/alice.json' },
      dependencies: ['setup'],
    },
  ],
});
