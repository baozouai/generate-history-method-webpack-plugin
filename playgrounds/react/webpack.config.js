const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const GenerateHistoryMethodWebpackPlugin = require('../../dist/genetate-history-method-webpack-plugin').default
module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/', // 重要，否则会报错
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
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
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    new GenerateHistoryMethodWebpackPlugin({
      pagesRootPath: path.resolve(__dirname, 'src/pages'),
      originHistoryModuleName: '@/history',
    }),
    // ...其他插件
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
  },
}
