import is from 'is-explicit'
import { ValidationError, SELF } from './util'

import { copy, push } from '@benzed/immutable'

/******************************************************************************/
// Helper
/******************************************************************************/

function createContext (data, args, path) {
  return {
    data,
    args,
    path: copy(path)
  }
}

function validateObject (fobj, data, context, skipSelf) {

  let promises

  const { path } = context

  if (!skipSelf && SELF in fobj) {
    const result = validate(fobj[SELF], data, context)
    if (result instanceof Promise)
      return result.then(value => validateObject(fobj, value, context, true))
    else
      data = result
  }

  if (is.plainObject(data)) for (const key in fobj) {

    context.path = push(path, key)

    const result = validate(fobj[key], data[key], context)

    if (result instanceof Promise) {
      promises = promises || { keys: [], results: [] }
      promises.keys.push(key)
      promises.results.push(result)

    } else if (result !== undefined)
      data[key] = result

  }

  if (!promises)
    return data

  return Promise
    .all(promises.results)
    .then(resolved => {
      for (let i = 0; i < promises.keys.length; i++) {
        const key = promises.keys[i]
        data[key] = resolved[i]
      }

      return data
    })

}

function handleError (path, str) {
  throw new ValidationError(path, str)
}

function validateArray (funcs, value, context, index = 0) {

  const { path } = context

  for (let i = index; i < funcs.length; i++) {

    const func = funcs[i]
    let result

    try {
      result = func(value, context)
    } catch (err) {
      result = err
    }

    if (result instanceof Error)
      return handleError(path, result.message)

    if (result instanceof Promise)
      return result
        .then(value => validateArray(funcs, value, { ...context, path }, i + 1))
        .catch(err => handleError(path, err.message))

    value = result
  }

  return value

}

/******************************************************************************/
// Main
/******************************************************************************/

function validate (funcs, input, context) {

  return funcs instanceof Array
    ? validateArray(funcs, input, context)
    : validateObject(funcs, input, context)

}

/******************************************************************************/
// Exports
/******************************************************************************/

export default validate

export { validate, createContext }
