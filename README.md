
<p align="center">
<h1 align="center">genetate-history-method-webpack-plugin</h1>
</p>

<div align="center">
  A webpack Plugin for automatically generating routing methods based on conventional routing

 [![NPM version][npm-image]][npm-url] ![NPM downloads][download-image]

![Test][test-badge]


[npm-image]: https://img.shields.io/npm/v/genetate-history-method-webpack-plugin.svg?style=flat-square
[npm-url]: http://npmjs.org/package/genetate-history-method-webpack-plugin


[download-image]: https://img.shields.io/npm/dm/genetate-history-method-webpack-plugin.svg?style=flat-square



[test-badge]: https://github.com/baozouai/genetate-history-method-webpack-plugin/actions/workflows/ci.yml/badge.svg



</div>

English | [中文](./README-zh_CN.md)

## 📦  Install

```sh
pnpm add genetate-history-method-webpack-plugin -D
# or
yarn add genetate-history-method-webpack-plugin -D
# or
npm i genetate-history-method-webpack-plugin -D
```


## ⚙️ Options

```ts
interface GenerateHistoryMethodWebpackPluginOptions {
  /**
   * @description The name of the file defining the route parameter type, must be .ts
   * @default index.params.ts
   *  */
  paramsName?: string
  /**
   * @description Identify is the filename of the routed page
   * @default index.page.tsx
   */
  pageName?: string
  /**
   * whitch module you want to import
   * @default ~history
   * @example
   * import history from '~history'
   */
  historyModuleName?: string
  /**
   * your origin history import from whitch module.
   *
   * for example, if you import history from 'history',
   *
   * so the originHistoryModuleName is 'history'
   * @default 'history'
   */
  originHistoryModuleName?: string
  /**
   * your pages path root
   * @example
   * path.resolve(cwdPath, 'src/pages') */
  pagesRootPath: string
  /**
   * hash or brower
   * @default 'browser'
   */
  mode?: HistoryMode
}
```
##  🔨 Usage

```js
// webpack.config.js
const GenerateHistoryMethodWebpackPlugin = require('genetate-history-method-webpack-plugin').default
const path = require('path')

module.exports = {
  ...,
  plugins: [
    new GenerateHistoryMethodWebpackPlugin({
      pagesRootPath: path.resolve(process.cwd(), 'src/pages') // must required
    })
  ],
}
```
![](./assets/option_example.png)

## 👇 Example


## 📄 License

genetate-history-method-webpack-plugin is [MIT licensed](./LICENSE).