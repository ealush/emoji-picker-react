import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  // Tailwind v4 for the integration stories (stories/integrations).
  async viteFinal(viteConfig) {
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        'emoji-picker-react/primitives': fileURLToPath(
          new URL('../src/primitives/index.ts', import.meta.url),
        ),
      },
    };
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },
};

export default config;
