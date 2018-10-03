import { TYPE } from '../symbols'
import is from 'is-explicit'
import { copy } from '@benzed/immutable'

/******************************************************************************/
// Main
/******************************************************************************/

const createTyper = (func, data) => {

  if (!is.func(func))
    throw new Error('createTyper requires a function as first argument')

  if (is.defined(data) && !is.plainObject(data))
    throw new Error('third argument, data, must be a plain object')

  data = copy(data) || {}

  const typer = data::func

  if (is.string(data.name))
    Object.defineProperty(typer, 'name', { value: data.name })

  Object.defineProperty(typer, TYPE, { value: data })

  return typer
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default createTyper
