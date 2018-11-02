const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    devtool: 'source-map',
    externals: {
        'react': 'react'
    },
    target: 'node',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'index.js',
        library: 'EmojiPicker',
        libraryTarget: 'umd'
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: 'babel-loader'
        }]
    },
    optimization: {
        minimizer: [new TerserPlugin()]
    }
};