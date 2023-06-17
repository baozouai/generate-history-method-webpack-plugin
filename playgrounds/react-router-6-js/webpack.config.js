const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { DefinePlugin } = require('webpack')
const GenerateHistoryMethodWebpackPlugin = require('../../dist/genetate-history-method-webpack-plugin.cjs')
const isHash = process.env.HISTORY_MODE === 'hash'
module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/', // 重要，否则会报错
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          }],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      HISTORY_MODE: JSON.stringify(process.env.HISTORY_MODE),
    }),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    new GenerateHistoryMethodWebpackPlugin({
      pagesRootPath: path.resolve(__dirname, 'src/pages'),
      originHistoryModuleName: isHash ? '@/hash_history' : '@/browser_history',
      mode: process.env.HISTORY_MODE,
      reactRouterVersion: 6,
    }),
    // ...其他插件
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
  },
  ignoreWarnings: [
    /was not found in '~history/,
  ],
}
