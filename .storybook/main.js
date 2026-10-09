const path = require('path');

// Extra dev-server hosts (e.g. Tailscale MagicDNS) via STORYBOOK_ALLOWED_HOSTS
// (comma-separated). Passed at runtime so machine-specific names never land in git.
const extraAllowedHosts = (process.env.STORYBOOK_ALLOWED_HOSTS || '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

module.exports = {
  stories: ['../stories/**/*.stories.@(ts|tsx|js|jsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-webpack5-compiler-swc',
  ],

  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    // type-check stories during Storybook build
    check: true,

    reactDocgen: 'react-docgen-typescript',
  },

  webpackFinal: async (config) => {
    // Run Tailwind before Storybook's CSS loader. This sheet owns the
    // utility generation for every recipe and the registry demo.
    config.module.rules.push({
      test: /\.css$/,
      include: path.resolve(__dirname, '../stories/integrations/tailwind.css'),
      enforce: 'pre',
      use: [{
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: { plugins: [require('@tailwindcss/postcss')()] },
        },
      }],
    });
    config.module.rules.push({
      test: /\.(ts|js|tsx)?$/,
      exclude: /node_modules\/(?!(shipstyles)\/).*/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              require('@babel/preset-typescript').default,
              [
                require('@babel/preset-react').default,
                { runtime: 'automatic' },
              ],
              require('@babel/preset-env').default,
            ],
          },
        },
      ],
    });

    return config;
  },

  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },

  core: {
    allowedHosts: extraAllowedHosts,
  },

  docs: {},
};
