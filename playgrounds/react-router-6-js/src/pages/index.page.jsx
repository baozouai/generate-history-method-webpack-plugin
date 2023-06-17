import React from 'react'
import { useLocation } from 'react-router'
export default () => {
  const { search } = useLocation()
  console.log(search)

  return (
    <div>这是首页</div>
  )
}
