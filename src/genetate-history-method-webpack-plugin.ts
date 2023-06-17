import { existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname, extname, resolve } from 'path'

import glob from 'glob'
const cwdPath = process.cwd()

type HistoryMode = 'hash' | 'browser'
type AllowReactRouterVersion = 5 | 6
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
  /** the react router version */
  reactRouterVersion: AllowReactRouterVersion
}

class GenerateHistoryMethodWebpackPlugin {
  paramsName: string
  pageName: string
  historyModuleName: string
  originHistoryModuleName: string
  pagesRootPath: string
  mode: HistoryMode
  contents: string[] = []
  reactRouterVersion: AllowReactRouterVersion
  constructor(options: GenerateHistoryMethodWebpackPluginOptions) {
    const {
      paramsName = 'index.params',
      pageName = 'index.page',
      historyModuleName = '~history',
      originHistoryModuleName = 'history',
      mode = 'browser',
      pagesRootPath,
      reactRouterVersion,
    } = options || {}
    this.paramsName = paramsName
    this.pageName = pageName
    this.historyModuleName = historyModuleName
    this.originHistoryModuleName = originHistoryModuleName
    this.pagesRootPath = pagesRootPath
    this.mode = mode
    this.reactRouterVersion = reactRouterVersion
  }

  get isHash() {
    return this.mode === 'hash'
  }

  get iVersion6() {
    return this.reactRouterVersion === 6
  }

  apply(compiler: any) {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    compiler.hooks.beforeCompile.tap(
      GenerateHistoryMethodWebpackPlugin.name,
      () => {
        const filePattern = `${this.pagesRootPath}/**/${this.pageName}.{tsx,js,jsx}` // 匹配的文件模式

        glob(filePattern, (err, files) => {
          if (err) {
            console.warn(err)
            return
          }
          const isExistTS = files.some(file => /\.tsx?/.test(extname(file)))
          this.contents = []

          this.addTopImport()
          this.generateUseHistoryHook(isExistTS)
          this.generateRouter(isExistTS)

          const { urlObj, paramsMap } = this.getParamsMapAndUrlObj(files)
          const urlKeys = Object.keys(urlObj)

          this.generateURL_MAP(urlObj)
          this.generateFormatUrlFn(isExistTS)
          this.generateHistory(paramsMap, urlKeys, isExistTS)
          this.generateUseSearchParamsHook(isExistTS)

          const contentStr = this.contents.join('\n')
          const outputPath = resolve(
            cwdPath,
              `node_modules/${this.historyModuleName}.${isExistTS ? 'tsx' : 'js'}`,
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

  addTopImport() {
    this.contents.push(
      'import React, { useLayoutEffect, useRef, useState, ReactNode } from \'react\'',
      'import { useLocation, Router as BaseRouter } from \'react-router-dom\'',
      `import originHistory from '${this.originHistoryModuleName}'`,
      'import qs from \'qs\'\n',
    )
  }

  generateUseHistoryHook(isExistTS: boolean) {
    this.contents.push(`
export const useRouterHistory = () => {
  const historyRef = useRef(originHistory)
  const history = historyRef.current
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  })

  useLayoutEffect(() => {
    history.listen(setState)
  }, [history])
  return [history, state] ${isExistTS ? 'as [typeof history, typeof state]' : ''}
}
          `)
  }

  generateUseSearchParamsHook(isExistTS: boolean) {
    this.contents.push(`
export const useSearchParams = ${isExistTS ? '<T = any>' : ''}() => {
  const { search } = useLocation()
  return qs.parse(search, { ignoreQueryPrefix: true }) ${isExistTS ? 'as T' : ''}
}
          `)
  }

  generateRouter(isExistTS: boolean) {
    switch (this.reactRouterVersion) {
      case 5:
        this.contents.push(`
export function Router({ children }${isExistTS ? ':{children: ReactNode}' : ''}) {
  return (
    <BaseRouter
      children={children}
      history={originHistory${isExistTS ? 'as any' : ''}}
    />
  )
}`,
        )
        break
      case 6:
        this.contents.push(`
${isExistTS
? `export interface RouterProps {
  basename?: string;
  children?: ReactNode;
}`
 : ''}
export function Router({ children, basename }${isExistTS ? ': RouterProps' : ''}) {
  const [history, { action, location }] = useRouterHistory()
  // 一般变化的就是action和location
  return (
    <BaseRouter
      basename={basename}
      children={children}
      location={location}
      // @ts-ignore
      navigationType={action}
      // @ts-ignore
      action={action}
      // @ts-ignore
      navigator={history}
      // @ts-ignore
      history={history}
    />
  )
}`,
        )
        break
    }
  }

  getParamsMapAndUrlObj(files: string[]) {
    const paramsMap: Record<string, string> = {}
    const regExp = new RegExp(`\/${this.pageName.replace(/(?=\.)/g, '\\')}\.(tsx|jsx?)$`)
    const urlObj = files.reduce<Record<string, string>>((pre, path) => {
      const urlPath = path
        .replace(this.pagesRootPath, '')
        .replace(regExp, '') || '/'
      const formatPath = urlPath
        .slice(1)
        .toUpperCase()
        .replace(/\//g, '_') || '$INDEX' // 首页

      pre[formatPath] = urlPath
      const dir = dirname(path)
      const possibleParamsPath = resolve(
        dir,
                `${this.paramsName}.ts`,
      )
      if (existsSync(possibleParamsPath))
        paramsMap[formatPath] = possibleParamsPath.replace('.ts', '')
      return pre
    }, {})
    return { paramsMap, urlObj }
  }

  generateURL_MAP(urlObj: Record<string, string>) {
    this.contents.push(
      `export const URL_MAP = ${JSON.stringify(urlObj, null, 2)}\n`,
    )
  }

  generateFormatUrlFn(isExistTS: boolean) {
    this.contents.push(
      `const formatUrlFn = (path${isExistTS ? ': string' : ''}, query${isExistTS ? ': any' : ''}) => path + (query ? \'?\' + qs.stringify(query || {}): \'\')`,
    )
  }

  generateHistory(paramsMap: Record<string, string>, urlKeys: string[], isExistTS: boolean) {
    const methods: string[] = []
    const PathParamsTypeArrs: string[] = []
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
      window.open(formatUrlFn('${this.isHash ? '#' : ''}' + ${realUrl}, query))
    },`,
                `  REPLACE_${urlKey}: (query${queryType}) => {
      originHistory.replace(formatUrlFn(${realUrl}, query))
    },`,
      )
    }
    this.contents.unshift(...PathParamsTypeArrs)
    this.contents.push('const history = {')
    this.contents.push(...methods)
    this.contents.push('}\n')
    this.contents.push('export default history')
  }
}

export default GenerateHistoryMethodWebpackPlugin
