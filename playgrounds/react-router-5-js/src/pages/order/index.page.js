import React from 'react'

import { useSearchParams } from '~history'

export default () => {
  const params = useSearchParams()
  console.log(params, params.customer_names)
  return (
    <div>这是order11</div>
  )
}
