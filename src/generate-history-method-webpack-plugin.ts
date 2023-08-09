import { existsSync, writeFileSync } from 'fs'
import { dirname, extname, resolve } from 'path'
import { validate } from 'schema-utils'
import choidar from 'chokidar'
import glob from 'glob'
import { debounce } from 'throttle-debounce'
import schema from './schema.json'
import { CONFIG_FILE_PATH } from './const'

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
   * @description the history name you want to custom
   * @default history
   * @example
   * { exportHistoryName: 'myHistory' }
   * import { myHistory } from '~history'
   *  */
  exportHistoryName?: string
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
  exportHistoryName: string
  isExistTS = false
  getDefaultConfig() {
    if (existsSync(CONFIG_FILE_PATH)) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
      const config = require(CONFIG_FILE_PATH)
      return config as GenerateHistoryMethodWebpackPluginOptions
    }
    return {}
  }

  combindConfig(config: GenerateHistoryMethodWebpackPluginOptions) {
    const defaultConfig = this.getDefaultConfig()
    return {
      ...defaultConfig,
      ...config,
    }
  }

  constructor(options = {} as GenerateHistoryMethodWebpackPluginOptions) {
    const combineOptions = this.combindConfig(options)
    const {
      paramsName = 'index.params',
      pageName = 'index.page',
      historyModuleName = '~history',
      originHistoryModuleName = 'history',
      mode = 'browser',
      exportHistoryName = 'history',
      pagesRootPath,
      reactRouterVersion,
    } = combineOptions
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    validate(schema as any, combineOptions)
    this.paramsName = paramsName
    this.pageName = pageName
    this.historyModuleName = historyModuleName
    this.originHistoryModuleName = originHistoryModuleName
    this.pagesRootPath = pagesRootPath
    this.mode = mode
    this.reactRouterVersion = reactRouterVersion
    this.exportHistoryName = exportHistoryName
  }

  get isHash() {
    return this.mode === 'hash'
  }

  get watchFileReg() {
    /**
     * pageName: allow .jsx?, .tsx
     * paramsName: allow .ts
     */
    return new RegExp(`(${this.pageName}\.(jsx?|tsx)|${this.paramsName}\.ts)$`)
  }

  apply(compiler: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    compiler.hooks.initialize.tap(
      GenerateHistoryMethodWebpackPlugin.name,
      () => {
        this.run()

        const debounceFn = debounce(20, () => this.run()) as () => void

        const judgeFilter = (filePath: string) => {
          if (!this.watchFileReg.test(filePath))
            return
          console.log('-------------------> filePath: ', filePath)
          debounceFn()
        }
        const watcher = choidar.watch(this.pagesRootPath, {
          ignoreInitial: true,
        })
        watcher.on('all', (eventName, filePath) => {
          switch (eventName) {
            case 'add':
            case 'unlink':
              console.log('-------------------> eventName: ', eventName)

              judgeFilter(filePath)
          }
        })
      },
    )
  }

  run() {
    const filePattern = `${this.pagesRootPath}/**/${this.pageName}.{tsx,js,jsx}` // 匹配的文件模式

    glob(filePattern, (err, files) => {
      if (err) {
        console.warn(err)
        return
      }
      this.isExistTS = files.some(file => /\.tsx?/.test(extname(file)))
      this.contents = []

      this.addTopImport()
      this.generateUseHistoryHook()
      this.generateUseSearchParamsHook()
      this.generateRouter()

      const { urlObj, paramsMap } = this.getParamsMapAndUrlObj(files)
      const formatUrls = Object.keys(urlObj)
      console.log(formatUrls)
      this.generateURL_MAP(urlObj)
      this.generateFormatUrlFn()
      this.generateHistory(paramsMap, formatUrls)

      this.contents.unshift('/* eslint-disable */')

      this.generateFile()
    })
  }

  addTopImport() {
    this.contents.push(
      'import React, { useLayoutEffect, useRef, useState, ReactNode } from \'react\'',
      'import { useLocation, Router as BaseRouter } from \'react-router-dom\'',
      `import originHistory from '${this.originHistoryModuleName}'`,
      'import qs from \'qs\'\n',
    )
  }

  generateUseHistoryHook() {
    this.contents.push(`
export const useRouterHistory = () => {
  const historyRef = useRef(originHistory)
  const history = historyRef.current
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  })

  useLayoutEffect(() => {
    // @ts-ignore
    history.listen(setState)
  }, [history])
  return [history, state] ${this.isExistTS ? 'as [typeof history, typeof state]' : ''}
}
          `)
  }

  generateUseSearchParamsHook() {
    const isExistTS = this.isExistTS
    this.contents.push(`
export function useSearchParams${isExistTS ? '<T = any>' : ''}() {
  const { search } = useLocation()
  return qs.parse(search, { ignoreQueryPrefix: true }) ${isExistTS ? 'as T' : ''}
}
          `)
  }

  generateRouter() {
    const isExistTS = this.isExistTS
    switch (this.reactRouterVersion) {
      case 5:
        this.contents.push(`
export function Router({ children }${isExistTS ? ':{ children: ReactNode }' : ''}) {
  return (
    <BaseRouter
      // @ts-ignore
      children={children}
      // @ts-ignore
      history={originHistory}
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
    // { formatPath => paramsPath }
    const paramsMap: Record<string, string> = {}
    // new RegExp(`\/${'index.page'.replace(/(?=\.)/g, '\\')}\.(tsx|jsx?)$`) => /\/index\.page.(tsx|jsx?)$/
    const regExp = new RegExp(`\/${this.pageName.replace(/(?=\.)/g, '\\')}\.(tsx|jsx?)$`)
    // { formatPath => urlPath }
    const urlObj = files.reduce<Record<string, string>>((pre, path) => {
      // eg: path: Users/xxx/project/src/pages/order/ ~ q/index.page.tsx
      const urlPath = path
      // eg: /order/ ~ q/index.page.tsx
        .replace(this.pagesRootPath, '')
        // eg: /order/ ~ q/index.page.tsx => /order/ ~ q
        .replace(regExp, '') || '/'
      const formatPath = urlPath
      // eg: /order/ ~ q => order/ ~ q
        .slice(1)
        // eg: order/~ q => ORDER/ ~ Q
        .toUpperCase()
        // eg: ORDER/ ~ Q => ORDER/~Q
        .replace(/^\s*|\s*$/g, '')
        // eg: ORDER/~Q => ORDER__Q
        .replace(/[^\w]/g, '_')
        // eg: ORDER__Q => ORDER_Q
        .replace(/_{2,}/g, '_') || '$INDEX' // 首页

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

  generateFormatUrlFn() {
    const isExistTS = this.isExistTS
    this.contents.push(
      `const formatUrlFn = (path${isExistTS ? ': string' : ''}, query${isExistTS ? ': any' : ''}) => path + (query ? \'?\' + qs.stringify(query || {}): \'\')`,
    )
  }

  generateHistory(paramsMap: Record<string, string>, formatUrls: string[]) {
    const isExistTS = this.isExistTS
    const methods: string[] = []
    const PathParamsTypeArrs: string[] = []

    for (const formatUrl of formatUrls) {
      const possibleParamsPath = paramsMap[formatUrl]
      if (possibleParamsPath) {
        PathParamsTypeArrs.push(
                  `import ${formatUrl}_Params from '${possibleParamsPath}'`,
        )
      }
      let queryType = ''
      if (isExistTS)
        queryType = `?: ${possibleParamsPath ? `${formatUrl}_Params` : 'any'}`

      const realUrl = `URL_MAP['${formatUrl}']`

      methods.push(
                `  TO_${formatUrl}: (query${queryType}) => {
      originHistory.push(formatUrlFn(${realUrl}, query))
    },`,
                `  OPEN_${formatUrl}: (query${queryType}) => {
      window.open(formatUrlFn('${this.isHash ? '#' : ''}' + ${realUrl}, query))
    },`,
                `  REPLACE_${formatUrl}: (query${queryType}) => {
      originHistory.replace(formatUrlFn(${realUrl}, query))
    },`,
      )
      if (isExistTS && possibleParamsPath) {
        methods.push(
          `  use${formatUrl}_PARAMS: () => useSearchParams${`<${formatUrl}_Params>`}(),`,
        )
      }
    }

    this.contents.unshift(...PathParamsTypeArrs)
    this.contents.push(`export const ${this.exportHistoryName} = {`)
    this.contents.push(...methods)
    this.contents.push('}\n')
  }

  generateFile() {
    const contentStr = this.contents.join('\n')
    const possibleOutputPath = ['tsx', 'js'].map(ext => resolve(
      cwdPath,
              `node_modules/${this.historyModuleName}.${ext}`,
    ))

    const outputPath = resolve(
      cwdPath,
              `node_modules/${this.historyModuleName}.${this.isExistTS ? 'tsx' : 'js'}`,
    )
    // if (existsSync(outputPath)) {
    //   // 已存在则对比是否变化，没变化则没必要写入
    //   const originFile = readFileSync(outputPath, 'utf-8')
    //   if (originFile === contentStr)
    //     return
    // }
    console.log('%c --------------> writeFileSync', 'color:red')

    writeFileSync(outputPath, contentStr)
  }
}

export default GenerateHistoryMethodWebpackPlugin
