import Schema from '@benzed/schema' // eslint-disable-line no-unused-vars
import { copy, set } from '@benzed/immutable'
import { isService } from '../util'

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

  const paginate = validateOptions(copy(options))

  return context => {

    if (isService(context))
      context.options.paginate = paginate
    else
      context.paginate = paginate

    return context
  }

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default paginate

export {
  validateOptions
}
