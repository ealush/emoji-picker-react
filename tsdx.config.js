const svg = require('rollup-plugin-svg');
const path = require('path');

module.exports = {
  rollup(config, options) {
    // TSDX uses output.file, while the lazy English dataset import creates
    // Rollup chunks. Preserve its entry filenames and write those chunks
    // beside them in dist.
    const outputFile = config.output.file;
    config.output.dir = path.dirname(outputFile);
    config.output.entryFileNames = path.basename(outputFile);
    config.output.chunkFileNames = '[name]-[hash].js';
    delete config.output.file;
    const external = config.external;
    config.external = (id) => (id.match(/.svg$/) ? false : external(id));

    config.plugins.push(
      svg({
        base64: true,
      }),
    );
    return config;
  },
};
