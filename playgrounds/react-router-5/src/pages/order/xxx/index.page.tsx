import { useParams } from 'react-router'
export default () => {
  const params = useParams()
  console.log(params)

  return (
    <div>这是order 的xxx</div>
  )
}
