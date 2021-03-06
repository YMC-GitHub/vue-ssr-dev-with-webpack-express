const webpack = require('webpack')
const merge = require('webpack-merge')
const utils = require('./utils')
const base = require('./webpack.ssr-base.config')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const nodeExternals = require('webpack-node-externals')

module.exports = merge(base, {
  target: 'node',
  entry: './src/ssr-server.entry.js',
  output: {
    //filename: 'server.bundle.js',
    libraryTarget: 'commonjs2'
  },
  externals: nodeExternals({
    // do not externalize CSS files in case we need to import it from a dep
    whitelist: /\.css$/
  }),
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.VUE_ENV': '"server"'
    }),
    new VueSSRServerPlugin()
  ]
})
