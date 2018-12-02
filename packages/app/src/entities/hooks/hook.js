import is from 'is-explicit'
import { first } from '@benzed/array'

/******************************************************************************/
// Main
/******************************************************************************/

const hook = props => {

  const { children, func, ...options } = props

  const factory = func || first(children)

  if (!is.func(factory))
    throw new Error('<hook/> must have func prop or function child set.')

  const wrapped = (...args) => {

    if (args.length > 0)
      throw new Error('invalid placement, ensure that <hook/> is placed within a <hooks/> entity.')

    return factory(options)
  }

  wrapped._call = true

  return wrapped
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default hook
