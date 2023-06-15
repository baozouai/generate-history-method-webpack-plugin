
<p align="center">
<h1 align="center">genetate-history-method-webpack-plugin</h1>
</p>

<div align="center">
  一个根据约定式路由，自动生成路由方法的Webpack插件

[![NPM version][npm-image]][npm-url] ![NPM downloads][download-image]

![Test][test-badge]


[npm-image]: https://img.shields.io/npm/v/genetate-history-method-webpack-plugin.svg?style=flat-square
[npm-url]: http://npmjs.org/package/genetate-history-method-webpack-plugin


[download-image]: https://img.shields.io/npm/dm/genetate-history-method-webpack-plugin.svg?style=flat-square



[test-badge]: https://github.com/baozouai/genetate-history-method-webpack-plugin/actions/workflows/ci.yml/badge.svg



</div>

中文 | [英文](./README.md)

## 📦  安装

```sh
pnpm add genetate-history-method-webpack-plugin -D
# or
yarn add genetate-history-method-webpack-plugin -D
# or
npm i genetate-history-method-webpack-plugin -D
```
## ⚙️ 参数

```ts
interface GenerateHistoryMethodWebpackPluginOptions {
  /**
   * @description 用来定义路由参数类型的文件名
   * @default index.params
   *  */
  paramsName?: string
  /**
   * @description 用来识别是路由页面的文件名
   * @default index.page
   */
  pageName?: string
  /**
   * 生成的history从哪个模块导入
   * @default ~history
   * @example
   * import history from '~history'
   */
  historyModuleName?: string
  /**
   * 你原先的history模块名
   * @default 'history'
   */
  originHistoryModuleName?: string
  /**
   * 哪个根目录下是存放页面的
   * @example
   * path.resolve(cwdPath, 'src/pages') */
  pagesRootPath: string
  /**
   * 路由模式，hash or brower
   * @default 'browser'
   */
  mode?: HistoryMode
}
```

 ## 🔨 使用

```js
// webpack.config.js
// webpack.config.js
const GenerateHistoryMethodWebpackPlugin = require('genetate-history-method-webpack-plugin').default
const path = require('path')

module.exports = {
  ...,
  plugins: [
    new GenerateHistoryMethodWebpackPlugin({
      pagesRootPath: path.resolve(process.cwd(), 'src/pages') // pagesRootPath必填
    })
  ],
}
```
![](./assets/option_example.png)

## 👇 例子



 

## 📄 协议

genetate-history-method-webpack-plugin 遵循 [MIT 协议](./LICENSE).