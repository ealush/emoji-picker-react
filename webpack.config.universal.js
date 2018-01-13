const path = require('path'),
    webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractScss = new ExtractTextPlugin('style.scss');

module.exports = {
    entry: './src/index.js',
    devtool: 'source-map',
    externals: {
        'react': 'react',
        'throttle-debounce': 'throttle-debounce'
    },
    target: 'node',
    output: {
        path: path.join(__dirname, 'dist/universal'),
        filename: 'index.js',
        library: 'EmojiPicker',
        libraryTarget: 'umd'
    },
    module: {
        loaders: [{
            test: /\.svg/,
            loaders: ['svg-url-loader']

        },
        {
            test: /\.scss$/,
            use: extractScss.extract({fallback:'style-loader', use:['css-loader']}),
            exclude: /dist/
        },
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: true
        }),
        extractScss
    ]
};