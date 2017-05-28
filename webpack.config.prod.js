const path = require('path'),
    webpack = require('webpack');

module.exports = {
    entry: {
        index: [
            './src/index.js'
        ]
    },
    externals: {
        'react': 'react',
        'throttle-debounce': 'throttle-debounce'
    },
    target: 'node',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
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
            loaders: ['style-loader', 'css-loader', 'sass-loader'],
            include: path.resolve(__dirname, '../')
        },
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};