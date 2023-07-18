const path = require('path')

const isHash = process.env.HISTORY_MODE === 'hash'
module.exports = {
  pagesRootPath: path.resolve(__dirname, 'src/pages'),
  originHistoryModuleName: isHash ? '@/hash_history' : '@/browser_history',
  mode: process.env.HISTORY_MODE,
  reactRouterVersion: 5, 
}