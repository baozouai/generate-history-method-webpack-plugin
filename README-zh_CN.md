
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

确保你的依赖有`qs`，否则请安装

```sh
pnpm add qs -D
# or
yarn add qs -D
# or
npm i qs -D
```

确保在你项目 src 下面export default对应的history：

比如你使用的是browser模式，可以参考[react-router-6/src/browser_history.ts](./playgrounds/react-router-6/src/browser_history.ts)，那么导出该history

```ts
import type { BrowserHistory } from 'history'
import { createBrowserHistory } from 'history'

export type { BrowserHistory }
export default createBrowserHistory()

```

比如你使用的是hash模式，可以参考[react-router-6/src/hash_history.ts](./playgrounds/react-router-6/src/hash_history.ts)，那么导出该history

```ts
import type { HashHistory } from 'history'
import { createHashHistory } from 'history'

export type { HashHistory }
export default createHashHistory()

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
  /** 
   *  react-router 版本, 目前支持 v5 和 v6 */
  reactRouterVersion: 5 | 6
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
      pagesRootPath: path.resolve(process.cwd(),
       'src/pages') // pagesRootPath必填,
       reactRouterVersion: 5 | 6,
    })
  ],
}
```
![](./assets/option_example.png)

## 👇 例子


- 如果你页面在目录 ` src/pages/system/setting/purchase_setting`, 那么会自动提示对应的路由方法

![](./assets/method_tip.gif)

- 如果你在页面同目录下添加了如 `index.params.ts` 作为页面的参数类型, 那么当天调用方法并传参时，会有对应的类型提示

```ts
// order_detail/index.params.ts
export default interface Params {
  /** 这是订单id */
  id: string
}
```
  

![](./assets/params_tip.gif)

更多的使用方法可以参考playgrounds下面的 src/app:
- [react-router-6](./playgrounds/react-router-6/src/app.tsx)
- [react-router-6-js](./playgrounds/react-router-6-js/src/app.jsx)
- [react-router-5](./playgrounds/react-router-5/src/app.tsx)
- [react-router-5-js](./playgrounds/react-router-5-js/src/app.jsx)


以及webpack.config.js:

- [react-router-6](./playgrounds/react-router-6/webpack.config.js)
- [react-router-6-js](./playgrounds/react-router-6-js/webpack.config.js)
- [react-router-5](./playgrounds/react-router-5/webpack.config.js)
- [react-router-5-js](./playgrounds/react-router-5-js/webpack.config.js)
## 📄 协议

genetate-history-method-webpack-plugin 遵循 [MIT 协议](./LICENSE).