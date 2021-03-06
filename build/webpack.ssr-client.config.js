const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const base = require('./webpack.ssr-base.config')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const SWPrecachePlugin = require('sw-precache-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'

const webpackClientConfig = merge(base, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: isProd ? config.build.productionSourceMap : config.dev.cssSourceMap,
      extract: isProd
    })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: isProd
    ? (config.build.productionSourceMap ? '#source-map' : false)
    : '#cheap-module-eval-source-map',
  output: {
    path: config.build.assetsRoot,
    filename: isProd
      ? utils.assetsPath('js/[name].[chunkhash].js')
      : '[name].js',
    chunkFilename: isProd
      ? utils.assetsPath('js/[id].[chunkhash].js')
      : '[id].js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': isProd
        ? '"production"'
        : JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.VUE_ENV': '"client"'
    }),
    new VueSSRClientPlugin()
  ]
})

if (isProd) {
  webpackClientConfig.plugins.push(
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          // it's inside node_modules
          /node_modules/.test(module.context) &&
          // and not a CSS file (due to extract-text-webpack-plugin limitation)
          !/\.css$/.test(module.request)
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
      //chunks: ['vendor']
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),
    //copy html index file
    new CopyWebpackPlugin([
      {
        from: config.dev.index,
        to: config.build.index
      }
    ]),
    //copy custom static assets
    new CopyWebpackPlugin([
      {
        from: config.build.assetsSubDirectory.from,
        to: config.build.assetsSubDirectory.to,
        ignore: ['.*']
      }
    ]),
    // auto generate service worker
    new SWPrecachePlugin({
      cacheId: 'maybeul',
      filename: utils.assetsPath('js/service-worker.js'),
      minify: true,
      dontCacheBustUrlsMatching: /./,
      staticFileGlobsIgnorePatterns: [/index\.html$/, /\.map$/, /\.json$/],
      /*runtimeCaching: [
        {
          urlPattern: '/',
          handler: 'networkFirst'
        },
        {
          urlPattern: /\/(top|new|show|ask|jobs)/,
          handler: 'networkFirst'
        },
        {
          urlPattern: '/item/:id',
          handler: 'networkFirst'
        },
        {
          urlPattern: '/user/:id',
          handler: 'networkFirst'
        }
      ]*/
    })
  )
  if (config.build.bundleAnalyzerReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackClientConfig.plugins.push(new BundleAnalyzerPlugin())
  }
} else {
  webpackClientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin()
  )
}

module.exports = webpackClientConfig
