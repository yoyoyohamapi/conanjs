/**
 * @module conan
 * @description webpack开发环境配置
 * @author ervinewell on 17/07/31
 */
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./base.conf');

module.exports = merge(base, {
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: 'app.bundle.js',
    publicPath: '/webpack/'
  },
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});
