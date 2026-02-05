import { defineConfig } from '@playwright/test';

const baseURL = process.env.STORYBOOK_URL ?? 'http://localhost:6006';

export default defineConfig({
  testDir: 'playwright',
  timeout: 60000,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02
    }
  },
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 }
  }
});
