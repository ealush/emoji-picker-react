const url = require('@rollup/plugin-url');
const svgr = require('@svgr/rollup');
const postcss = require('rollup-plugin-postcss');

const postCssConfig = require('./postcss.config');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        ...postCssConfig,
        extract: !!options.writeMeta
      })
    );

    config.plugins.push(url());

    config.plugins.push(svgr({}));
    return config;
  }
};
