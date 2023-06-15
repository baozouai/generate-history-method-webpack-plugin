import { existsSync, readFileSync, writeFileSync } from 'fs'
import { extname, resolve } from 'path'

import glob from 'glob'
import type { Compiler } from 'webpack'
const cwdPath = process.cwd()

type HistoryMode = 'hash' | 'browser'

interface GenerateHistoryMethodWebpackPluginOptions {
  /**
   * @description The name of the file defining the route parameter type, must be .ts
   * @default index.params
   *  */
  paramsName?: string
  /**
   * @description Identify is the filename of the routed page
   * @default index.page
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

class GenerateHistoryMethodWebpackPlugin {
  private _paramsName: string
  private _pageName: string
  private _historyModuleName: string
  private _originHistoryModuleName: string
  private _pagesRootPath: string
  private _mode: HistoryMode

  constructor(options: GenerateHistoryMethodWebpackPluginOptions) {
    const {
      paramsName = 'index.params',
      pageName = 'index.page',
      historyModuleName = '~history',
      originHistoryModuleName = 'history',
      mode = 'browser',
      pagesRootPath,
    } = options || {}
    this._paramsName = paramsName
    this._pageName = pageName
    this._historyModuleName = historyModuleName
    this._originHistoryModuleName = originHistoryModuleName
    this._pagesRootPath = pagesRootPath
    this._mode = mode
  }

  apply(compiler: Compiler) {
    const isHash = this._mode === 'hash'

    compiler.hooks.beforeCompile.tap(
      GenerateHistoryMethodWebpackPlugin.name,
      () => {
        const filePattern = `${this._pagesRootPath}/**/${this._pageName}.{tsx,js,jsx}` // 匹配的文件模式

        glob(filePattern, (err, files) => {
          if (err) {
            console.warn(err)
            return
          }
          const isExistTS = files.some(file => /\.tsx?/.test(extname(file)))

          const content = [
              `import originHistory from '${this._originHistoryModuleName}'`,
              'import qs from \'qs\'\n',
          ]
          const paramsMap: Record<string, string> = {}
          const regExp = new RegExp(`\/${this._pageName.replace(/(?=\.)/g, '\\')}\.(tsx|jsx?)$`)
          const urlObj = files.reduce<Record<string, string>>((pre, path) => {
            const urlPath = path
              .replace(this._pagesRootPath, '')
              .replace(regExp, '')
            const formatPath = urlPath
              .slice(1)
              .toUpperCase()
              .replace(/\//g, '_')

            pre[formatPath] = urlPath

            const possibleParamsPath = path.replace(
              regExp,
                `${this._paramsName}.ts`,
            )
            if (existsSync(possibleParamsPath))
              paramsMap[formatPath] = possibleParamsPath.replace('.ts', '')
            return pre
          }, {})
          const urlKeys = Object.keys(urlObj)

          content.push(
              `export const URL_MAP = ${JSON.stringify(urlObj, null, 2)}\n`,
              `const formatUrlFn = (path${isExistTS ? ': string' : ''}, query${isExistTS ? ': any' : ''}) => path + (query ? \'?\' + qs.stringify(query || {}): \'\')`,
          )
          const methods = []
          const PathParamsTypeArrs = []
          for (const urlKey of urlKeys) {
            if (paramsMap[urlKey]) {
              PathParamsTypeArrs.push(
                  `import ${urlKey}_Params from '${paramsMap[urlKey]}'`,
              )
            }
            let queryType = ''
            if (isExistTS)
              queryType = `?: ${paramsMap[urlKey] ? `${urlKey}_Params` : 'any'}`

            const realUrl = `URL_MAP['${urlKey}']`

            methods.push(
                `  TO_${urlKey}: (query${queryType}) => {
      originHistory.push(formatUrlFn(${realUrl}, query))
    },`,
                `  OPEN_${urlKey}: (query${queryType}) => {
      window.open(formatUrlFn('${isHash ? '#' : ''}' + ${realUrl}, query))
    },`,
                `  REPLACE_${urlKey}: (query${queryType}) => {
      originHistory.replace(formatUrlFn(${realUrl}, query))
    },`,
            )
          }
          content.unshift(...PathParamsTypeArrs)
          content.push('const history = {')
          content.push(...methods)
          content.push('}\n')
          content.push('export default history')

          const contentStr = content.join('\n')
          const outputPath = resolve(
            cwdPath,
              `node_modules/${this._historyModuleName}.${isExistTS ? 'ts' : 'js'}`,
          ) // 输出文件路径
          if (existsSync(outputPath)) {
            // 已存在则对比是否变化，没变化则没必要写入
            const originFile = readFileSync(outputPath, 'utf-8')
            if (originFile === contentStr)
              return
          }
          writeFileSync(outputPath, contentStr)
        })
      },
    )
  }
}

export default GenerateHistoryMethodWebpackPlugin
