import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';

// Extra dev-server hostnames (comma-separated) stay local to the environment.
const extraAllowedHosts = (process.env.STORYBOOK_ALLOWED_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
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
    const primitiveAlias = {
      find: 'emoji-picker-react/primitives',
      replacement: fileURLToPath(new URL('../src/primitives/index.ts', import.meta.url)),
    };
    const aliases = viteConfig.resolve?.alias;
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: Array.isArray(aliases)
        ? [...aliases, primitiveAlias]
        : { ...aliases, [primitiveAlias.find]: primitiveAlias.replacement },
    };
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    const existingAllowedHosts = viteConfig.server?.allowedHosts;
    if (extraAllowedHosts.length > 0 && existingAllowedHosts !== true) {
      viteConfig.server = {
        ...viteConfig.server,
        allowedHosts: [
          ...new Set([...(existingAllowedHosts ?? []), ...extraAllowedHosts]),
        ],
      };
    }
    return viteConfig;
  },
};

export default config;
