const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    devtool: 'source-map',
    externals: {
        'react': 'react',
        'throttle-debounce': 'throttle-debounce'
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
    }
};