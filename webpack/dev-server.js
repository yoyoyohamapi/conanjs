/**
 * @module conan
 * @desc dev-server
 * @author ervinewell on 2017/7/31.
 */

const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./dev.conf');

const devServerConfig = {
  hot: false,
  noInfo: false,
  host: '0.0.0.0',
  publicPath: '/webpack/',
  stats: { colors: true },
  historyApiFallback: true,
  contentBase: path.resolve(__dirname, '../') // 基本目录，读取index.html
};

const port = 9002;
const compiler = webpack(webpackConfig);
const server = new WebpackDevServer(compiler, devServerConfig);

server.listen(port, (err) => {
  if (err) {
    console.error(err.stack);
  } else {
    console.log(`server is running at port# http://localhost:${port}`);
  }
});
