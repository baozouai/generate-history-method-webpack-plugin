import { useLocation } from 'react-router'
import qs from 'qs'
export default () => {
  const { search } = useLocation()
  console.log(qs.parse(search))
  return (
    <div>这是订单详情页</div>
  )
}
