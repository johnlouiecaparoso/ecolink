import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for faster testing
  workers: 1, // Single worker for stability
  timeout: 10000, // 10 second timeout per test
  reporter: [['list']], // Simple list reporter
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'off', // No tracing for speed
    screenshot: 'only-on-failure',
    video: 'off', // No video recording
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000, // 30 second timeout for server startup
  },
})
