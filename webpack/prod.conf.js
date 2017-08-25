/**
 * @module conan
 * @description webpack生产环境配置
 * @author ervinewell create on 17/07/31
 */
const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./base.conf');

module.exports = merge(base, {
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ]
});
