import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';

import { mergeAllowedHosts, parseAllowedHosts } from './allowedHosts';

// Extra dev-server hostnames (comma-separated) stay local to the environment.
const extraAllowedHosts = parseAllowedHosts(
  process.env.STORYBOOK_ALLOWED_HOSTS,
);

const config: StorybookConfig = {
  core: { allowedHosts: extraAllowedHosts },
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
      replacement: fileURLToPath(
        new URL('../src/primitives/index.ts', import.meta.url),
      ),
    };
    const aliases = viteConfig.resolve?.alias;
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: Array.isArray(aliases)
        ? [...aliases, primitiveAlias]
        : { ...aliases, [primitiveAlias.find]: primitiveAlias.replacement },
    };
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    const allowedHosts = mergeAllowedHosts(
      viteConfig.server?.allowedHosts,
      extraAllowedHosts,
    );
    if (allowedHosts !== undefined) {
      viteConfig.server = { ...viteConfig.server, allowedHosts };
    }
    return viteConfig;
  },
};

export default config;
