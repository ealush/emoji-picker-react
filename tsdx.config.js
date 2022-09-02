const postcss = require('rollup-plugin-postcss');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        plugins: [
          require('postcss-inline-svg'),
          require('postcss-svgo'),
          require('autoprefixer'),
          require('cssnano')
        ],
        inject: true,
        extract: !!options.writeMeta
      })
    );
    return config;
  }
};
