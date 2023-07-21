import { history } from '~history'
export default () => {
  const params = history.useORDER_XXX_PARAMS()
  console.log(params.xxx_id)
  return (
    <div>这是order 的xxx1</div>
  )
}
