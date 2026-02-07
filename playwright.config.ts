/* eslint-env node */
import { defineConfig } from '@playwright/test';

const baseURL = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6006';

export default defineConfig({
  testDir: 'playwright',
  timeout: 60000,
  retries: process.env.CI ? 2 : 0,
  // Use platform-agnostic snapshot names (without -darwin/-linux suffix)
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      // Allow 5% pixel difference for cross-platform font rendering variations
      maxDiffPixelRatio: 0.05
    }
  },
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    headless: true,
    actionTimeout: 15000,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run storybook',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  }
});
