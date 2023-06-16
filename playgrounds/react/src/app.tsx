import type { BrowserRouterProps } from 'react-router-dom'
import {
  Outlet,
  Route,
  Router,
  Routes,
} from 'react-router-dom'
import history, { useBrowserHistory } from '~history'
import originHistory from './history'

const context = require.context('@/pages', true, /index\.page\./)

const routePaths = (context.keys()).map((path: string) => {
  const Component = context<{ default: () => JSX.Element }>(path)
  path = path.replace(/\.(.*?)\/index\.page\.tsx$/, '$1')
  return {
    path,
    Component,
  }
})

/** 自己改造下BrowserRouter */
function BrowserRouter({ children }: BrowserRouterProps) {
  const [history, { action, location }] = useBrowserHistory()
  // 一般变化的就是action和location
  return (
    <Router
      children={children}
      navigationType={action}
      location={location}
      navigator={history}
    />
  )
}

function Layout() {
  return (
    <>
     <button onClick={() => originHistory.push('/')}>回到首页</button>
      <ul>
        <li
          style={{ marginRight: 10, color: 'blue', cursor: 'pointer' }}
          onClick={() => history.OPEN_ORDER({
            /** 这里因为order下面又index.params.ts定义了传参类型，所以有参数类型提示，点击对应参数会跳到对应文件 */
            order_id: '123',
            enter_order_type: 'OPEN',
          })}
        >
          OPEN ORDER
        </li>
        <li
          style={{ marginRight: 10, color: 'blue', cursor: 'pointer' }}
          onClick={() => history.TO_ORDER({
            order_id: '123',
            enter_order_type: 'TO',
          })}
        >
          TO ORDER
        </li>
        <li
          style={{ marginRight: 10, color: 'blue', cursor: 'pointer' }}
          onClick={() => history.REPLACE_ORDER({
            order_id: '123',
            enter_order_type: 'REPLACE',
          })}
        >
          REPLACE ORDER
        </li>
      </ul>

      <ul>
        <li
          style={{ marginRight: 10, color: 'blue', cursor: 'pointer' }}
          onClick={() => history.OPEN_ORDER_DETAIL()}
        >
          OPEN ORDER_DETAIL
        </li>
        <li
          style={{ marginRight: 10, color: 'blue', cursor: 'pointer' }}
          onClick={() => history.TO_ORDER_DETAIL()}
        >
          TO ORDER_DETAIL
        </li>
        <li
          style={{ marginRight: 10, color: 'blue', cursor: 'pointer' }}
          onClick={() => history.REPLACE_ORDER_DETAIL()}
        >
          REPLACE ORDER_DETAIL
        </li>
      </ul>

      <ul>
        <li
          style={{ marginRight: 10, color: 'blue', cursor: 'pointer' }}
          onClick={() => history.OPEN_MY()}
        >
          OPEN MY
        </li>
        <li
          style={{ marginRight: 10, color: 'blue', cursor: 'pointer' }}
          onClick={() => history.TO_MY()}
        >
          TO MY
        </li>
        <li
          style={{ marginRight: 10, color: 'blue', cursor: 'pointer' }}
          onClick={() => history.OPEN_MY()}
        >
          REPLACE MY
        </li>
      </ul>
    <hr />
      <Outlet />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Layout/>}>
            {routePaths.map(({ path, Component }) => {
              return <Route path={path} element={<Component.default />} key={path} />
            })}
          </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
