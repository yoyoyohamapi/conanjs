/**
 * @module conan
 * @description webpack基础配置
 * @author ervinewell on 17/07/31
 */

const path = require('path');

module.exports = {
  entry: [
    path.resolve(__dirname, '../src/')
  ],
  output: {
    path: path.resolve(__dirname, '../dist/js'),
    filename: 'conan.bundle.js',
    publicPath: '/webpack/'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      $utils: path.resolve(__dirname, '../src/utils')
    }
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }, {
      test: /\.s[ac]ss$/,
      loader: "style-loader!css-loader!sass-loader"
    }, {
      test: /\.woff|\.woff2|\.png|.eot|\.ttf/,
      loader: 'url-loader?prefix=font/&limit=10000'
    }]
  }
};
