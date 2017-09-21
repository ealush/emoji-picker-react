const path = require('path');

module.exports = {
    module: {
        rules: [{
            test: /\.scss$/,
            loader: 'style-loader!css-loader!sass-loader'
        }, {
            test: /\.svg/,
            exclude: /node_modules/,
            loaders: ['svg-url-loader']
        }]
    }
};