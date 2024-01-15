const postcss = require('rollup-plugin-postcss');
const svg = require('rollup-plugin-svg');

const postCssConfig = require('./postcss.config');

module.exports = {
  rollup(config, options) {
    const external = config.external;
    config.external = id => (id.match(/.svg$/) ? false : external(id));

    config.plugins.push(
      postcss({
        ...postCssConfig,
        extract: !!options.writeMeta
      })
    );

    config.plugins.push(
      svg({
        base64: true
      })
    );
    return config;
  }
};
