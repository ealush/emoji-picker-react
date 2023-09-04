module.exports = {
  plugins: [
    require('postcss-inline-svg'),
    require('postcss-svgo'),
    require('autoprefixer'),
    require('cssnano')
  ],
  inject: true
};
