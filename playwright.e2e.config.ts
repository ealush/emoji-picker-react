import { defineConfig } from '@playwright/test';

// Packed-consumer e2e: the published tarball installed into a fresh app
// (scripts/e2e-consumer). Every test is recorded; the videos are the
// evidence attached to pull requests (CI uploads test-results/e2e).
// E2E_SLOWMO=250 paces recordings for humans without changing assertions.
const baseURL = 'http://127.0.0.1:6030/';
const size = { width: 1100, height: 620 };

export default defineConfig({
  testDir: 'playwright',
  testMatch: 'packed-consumer.spec.ts',
  outputDir: 'test-results/e2e',
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/e2e-report', open: 'never' }],
  ],
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: size,
    video: { mode: 'on', size },
    trace: 'retain-on-failure',
    launchOptions: { slowMo: Number(process.env.E2E_SLOWMO ?? 0) },
  },
  webServer: {
    command: 'npx --no-install tsx scripts/e2e-consumer/serve.ts',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
