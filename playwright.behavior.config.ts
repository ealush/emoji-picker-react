import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6006';

export default defineConfig({
  testDir: 'playwright',
  outputDir: 'test-results/behavior',
  testMatch: ['adoption-behavior.spec.ts', 'touch-behavior.spec.ts'],
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'chromium',
      grepInvert: /@real-touch/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: 'touch-behavior.spec.ts',
    },
    {
      name: 'webkit',
      grepInvert: /@real-touch/,
      use: { ...devices['Desktop Safari'] },
    },
    { name: 'touch', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.STORYBOOK_URL
    ? undefined
    : {
        command: 'npm run storybook',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
