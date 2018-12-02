import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { copy, set } from '@benzed/immutable'

/* @jsx Schema.createValidator */
/* eslint-disable react/react-in-jsx-scope */

/******************************************************************************/
// Validate
/******************************************************************************/

const validateOptions = <object plain>
  <number key='default' range={['>', 0]} cast required />
  <number key='max' range={['>', 0]} default={ctx => ctx.value.default}/>
</object>

/******************************************************************************/
// Main
/******************************************************************************/

const paginate = props => {

  const { children, ...options } = props

  const paginate = validateOptions(options)

  // order irrelevent. this works with a service or a service config
  return context => set.mut(context, 'paginate', copy(paginate))

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default paginate

export {
  validateOptions
}
