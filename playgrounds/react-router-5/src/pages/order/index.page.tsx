import { useSearchParams } from '~history'
import type Params from './index.params'
export default () => {
  const params = useSearchParams<Params>()
  console.log(params, params.customer_names)
  return (
    <div>这是order1111111111111</div>
  )
}
