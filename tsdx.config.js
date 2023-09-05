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
    return config;
  }
};
