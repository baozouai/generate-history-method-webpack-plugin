import { useParams } from 'react-router'
import ParamsType from './index.params'
export default () => {
  const params = useParams()
  console.log(params);

  return (
    <div>这是order</div>
  )
}