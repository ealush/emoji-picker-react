import { defineConfig } from '@playwright/test';

const baseURL =
  process.env.WEBSITE_URL ?? 'http://127.0.0.1:6020/emoji-picker-react/';
export default defineConfig({
  testDir: 'playwright',
  testMatch: 'website.spec.ts',
  outputDir: 'test-results/website',
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 15000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.WEBSITE_URL
    ? undefined
    : {
        command: 'npx --no-install tsx scripts/serveWebsite.ts',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
      },
});
