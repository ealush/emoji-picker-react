const svg = require('rollup-plugin-svg');

module.exports = {
  rollup(config, options) {
    const external = config.external;
    config.external = id => (id.match(/.svg$/) ? false : external(id));

    config.plugins.push(
      svg({
        base64: true
      })
    );
    return config;
  }
};
