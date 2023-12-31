import React from 'react'

import {
  Route,
  Switch,
} from 'react-router-dom'
import { Router, history } from '~history'
const context = require.context('@/pages', true, /index\.page\./)

const routePaths = context.keys().map((path) => {
  const Component = context(path)
  // 对于pages/index.page.js，认为是首页
  path = path.replace(/\.(.*?)\/index\.page\.jsx?$/, '$1') || '/'
  return {
    path,
    Component,
  }
})

const commonLiStyle = { marginRight: 10, color: 'blue', cursor: 'pointer' }
function Layout() {
  return (
    <>
      <button onClick={() => { location.href = '/' }}>回到首页</button>
      <ul>
        <li
          style={commonLiStyle}
          onClick={() => history.OPEN_ORDER({
            /** 这里因为order下面又index.params.ts定义了传参类型，所以有参数类型提示，点击对应参数会跳到对应文件 */
            order_id: '123',
            enter_order_type: 'OPEN',
            customer_names: ['name1', 'name2'],
          })}
        >
          OPEN_ORDER
        </li>
        <li
          style={commonLiStyle}
          onClick={() => history.TO_ORDER({
            /** 这里因为order下面又index.params.ts定义了传参类型，所以有参数类型提示，点击对应参数会跳到对应文件 */
            order_id: '123',
            enter_order_type: 'OPEN',
            customer_names: ['name1', 'name2'],
          })}
        >
          TO_ORDER
        </li>
        <li
          style={commonLiStyle}
          onClick={() => history.REPLACE_ORDER({
            order_id: '123',
            enter_order_type: 'REPLACE',
            customer_names: ['name1', 'name2'],
          })}
        >
          REPLACE_ORDER
        </li>
      </ul>

      <ul>
        <li
          style={commonLiStyle}
          onClick={() => history.OPEN_ORDER_DETAIL()}
        >
          OPEN_ORDER_DETAIL
        </li>
        <li
          style={commonLiStyle}
          onClick={() => history.TO_ORDER_DETAIL()}
        >
          TO_ORDER_DETAIL
        </li>
        <li
          style={commonLiStyle}
          onClick={() => history.REPLACE_ORDER_DETAIL()}
        >
          REPLACE_ORDER_DETAIL
        </li>
      </ul>

      <ul>
        <li
          style={commonLiStyle}
          onClick={() => history.OPEN_MY()}
        >
          OPEN_MY
        </li>
        <li
          style={commonLiStyle}
          onClick={() => history.TO_MY()}
        >
          TO_MY
        </li>
        <li
          style={commonLiStyle}
          onClick={() => history.OPEN_MY()}
        >
          REPLACE_MY
        </li>
      </ul>
    <hr />

    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      routePaths.filter(({ path }) => !['/order', '/order/detail', '/my'].includes(path)).map(({ path }) => {
        const name = path.slice(1).toUpperCase().replace(/\//g, '_') || '$INDEX'
        return (
          <ul key={name}>
        <li
          style={commonLiStyle}
          onClick={() => { history[`OPEN_${name}`]() }}
        >
          OPEN_{name}
        </li>
        <li
          style={{ marginRight: 10, color: 'blue', cursor: 'pointer' }}
          onClick={() => { history[`TO_${name}`]() }}
        >
          TO_{name}
        </li>
        <li
          style={{ marginRight: 10, color: 'blue', cursor: 'pointer' }}
          onClick={() => { history[`OPEN_${name}`]() }}
        >
          REPLACE_{name}
        </li>
      </ul>
        )
      })
    }
    <hr />

    </>
  )
}

function App() {
  return (
    <Router>
      <Layout/>
      <Switch>
          {routePaths.map(({ path, Component }) => {
            return <Route path={path} exact component={Component.default} key={path} />
          })}
      </Switch>
    </Router>
  )
}

export default App
