import is from 'is-explicit'
import { ValidationError, SELF } from './util'

import { copy, push } from '@benzed/immutable'
import { wrap, unwrap } from '@benzed/array'

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

  const { path } = context

  if (!skipSelf && SELF in fobj) {
    const result = validate(fobj[SELF], data, context)
    if (result instanceof Promise)
      return result.then(value => validateObject(fobj, value, context, true))
    else
      data = result
  }

  const isArray = is(data, Array)
  const datas = wrap(data)

  let asyncs

  for (let i = 0; i < datas.length; i++) for (const key in fobj) {

    const data = datas[i]
    if (!is(data, Object))
      continue

    context.path = push(path, key)

    const result = validate(fobj[key], data[key], context)
    if (result instanceof Promise) {
      asyncs = asyncs || []
      asyncs[i] = asyncs[i] || { keys: [], promises: [] }
      asyncs[i].keys.push(key)
      asyncs[i].promises.push(result)

    } else if (result !== undefined)
      data[key] = result

  }

  if (!asyncs)
    return isArray ? datas : unwrap(datas)

  return Promise
    .all(asyncs.map(async => Promise.all(async.promises)))
    .then(resolved => {
      for (let i = 0; i < asyncs.length; i++) {
        const async = asyncs[i]
        if (!async)
          continue

        const keys = async.keys
        if (keys) for (let j = 0; j < keys.length; j++) {
          const key = keys[j]
          datas[i][key] = resolved[i][j]
        }
      }

      return isArray ? datas : unwrap(datas)
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
