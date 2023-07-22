import { useLocation } from 'react-router'
import qs from 'qs'
import { history } from '~history'
export default () => {
  const { search } = useLocation()
  console.log(qs.parse(search), history.useORDER_E_PARAMS)
  return (
    <div>这是订单详情页</div>
  )
}
