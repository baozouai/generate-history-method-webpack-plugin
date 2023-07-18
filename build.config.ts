import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/generate-history-method-webpack-plugin', './src/bin/generate-history-method'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
