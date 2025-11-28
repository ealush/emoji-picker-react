const path = require('path');
module.exports = {
  stories: ['../stories/**/*.stories.@(ts|tsx|js|jsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],

  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    // type-check stories during Storybook build
    check: true,

    reactDocgen: 'react-docgen-typescript'
  },

  core: {
    builder: '@storybook/builder-vite'
  },

  docs: {},

  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
};
