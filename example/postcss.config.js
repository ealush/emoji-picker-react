module.exports = {
  // Add your installed PostCSS plugins here:
  plugins: [
    require('postcss-inline-svg'),
    require('postcss-svgo'),
    require('autoprefixer'),
    require('cssnano')
  ]
};
