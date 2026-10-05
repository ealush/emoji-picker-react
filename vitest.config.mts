import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['test/setupTests.ts'],
    include: [
      'test/**/*.test.ts',
      'test/**/*.test.tsx',
      'integration/**/*.test.ts',
      'integration/**/*.test.tsx',
    ],
    css: true,
  },
});
