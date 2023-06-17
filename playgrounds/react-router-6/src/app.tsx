import {
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import { useNavigate } from 'react-router'
import history, { Router } from '~history'

const context = require.context('@/pages', true, /index\.page\./)

const routePaths = context.keys().map((path: string) => {
  const Component = context<{ default: () => JSX.Element }>(path)
  path = path.replace(/\.(.*?)\/index\.page\.tsx$/, '$1')
  return {
    path,
    Component,
  }
})

const commonLiStyle = { marginRight: 10, color: 'blue', cursor: 'pointer' }
function Layout() {
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate('/')}>回到首页</button>
      <ul>
        <li
          style={commonLiStyle}
          onClick={() => {
            history.OPEN_ORDER({
            /** 这里因为order下面又index.params.ts定义了传参类型，所以有参数类型提示，点击对应参数会跳到对应文件 */
              order_id: '123',
              enter_order_type: 'OPEN',
              customer_names: ['name1', 'name2'],
            })
          }}
        >
          OPEN_ORDER
        </li>
        <li
          style={commonLiStyle}
          onClick={() => {
            history.TO_ORDER({
            /** 这里因为order下面又index.params.ts定义了传参类型，所以有参数类型提示，点击对应参数会跳到对应文件 */
              order_id: '123',
              enter_order_type: 'OPEN',
              customer_names: ['name1', 'name2'],
            })
          }}
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

      <Outlet />
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
          <Route element={<Layout/>}>
            {routePaths.map(({ path, Component }) => {
              return <Route path={path} element={<Component.default />} key={path} />
            })}
          </Route>
      </Routes>
    </Router>
  )
}

export default App
