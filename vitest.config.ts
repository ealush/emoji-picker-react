import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      // Website `@/` imports (website/tsconfig.json paths) for the website
      // regression tests that render website components.
      {
        find: '@',
        replacement: fileURLToPath(new URL('./website/src', import.meta.url)),
      },
      // Website `file:..` deps resolve to the built dist bundle, which
      // vitest externalizes past the aliases below and binds to the wrong
      // React copy. Point website tests at current source instead, which
      // also keeps them honest about unbuilt changes.
      {
        find: /^emoji-picker-react$/,
        replacement: fileURLToPath(new URL('./src/index.tsx', import.meta.url)),
      },
      {
        find: /^emoji-picker-react\/primitives$/,
        replacement: fileURLToPath(
          new URL('./src/primitives/index.ts', import.meta.url),
        ),
      },
      // Website components resolve their own React 18 copy by default while
      // Testing Library uses the root React; hooks break across the two.
      // Pin every React import in tests to the single root copy.
      { find: /^react$/, replacement: `${root}node_modules/react` },
      { find: /^react\/(.+)$/, replacement: `${root}node_modules/react/$1` },
      { find: /^react-dom$/, replacement: `${root}node_modules/react-dom` },
      {
        find: /^react-dom\/(.+)$/,
        replacement: `${root}node_modules/react-dom/$1`,
      },
    ],
  },
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
